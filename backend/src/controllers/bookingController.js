const { Op } = require('sequelize');
const { sequelize, Booking, Service, Payment, User } = require('../models');
const {
  TIME_SLOTS,
  SLOT_CAPACITY,
  STATUS_TRANSITIONS,
} = require('../constants');
const {
  createError,
  todayStr,
  isDateStr,
  isValidDate,
} = require('../utils/helpers');

const bookingIncludes = [
  { model: Service, as: 'service' },
  { model: Payment, as: 'payment' },
  { model: User, as: 'customer', attributes: ['id', 'full_name', 'email', 'phone', 'address'] },
];

/** GET /api/bookings/slots?date=YYYY-MM-DD — protected */
exports.getSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!isDateStr(date) || !isValidDate(date)) {
      return next(createError(400, 'Query param "date" (YYYY-MM-DD) is required.'));
    }
    if (date < todayStr()) {
      return next(createError(400, 'Date cannot be in the past.'));
    }

    const counts = await Booking.findAll({
      where: { delivery_date: date, status: { [Op.ne]: 'cancelled' } },
      attributes: ['time_slot', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['time_slot'],
    });
    const booked = Object.fromEntries(counts.map((c) => [c.time_slot, Number(c.count)]));

    const slots = TIME_SLOTS.map((slot) => {
      const count = booked[slot] || 0;
      return { slot, booked: count, capacity: SLOT_CAPACITY, available: count < SLOT_CAPACITY };
    });

    return res.json({ date, capacity: SLOT_CAPACITY, slots });
  } catch (err) {
    return next(err);
  }
};

/** POST /api/bookings — protected */
exports.create = async (req, res, next) => {
  try {
    const { service_id, quantity, delivery_date, time_slot, notes } = req.body || {};

    if (!service_id || !quantity || !delivery_date || !time_slot) {
      return next(
        createError(400, 'service_id, quantity, delivery_date and time_slot are required.')
      );
    }
    if (!isDateStr(delivery_date) || !isValidDate(delivery_date)) {
      return next(createError(400, 'delivery_date must be a valid date (YYYY-MM-DD).'));
    }
    if (delivery_date < todayStr()) {
      return next(createError(400, 'delivery_date cannot be in the past.'));
    }
    if (!TIME_SLOTS.includes(time_slot)) {
      return next(createError(400, `time_slot must be one of: ${TIME_SLOTS.join(', ')}.`));
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0.5) {
      return next(createError(400, 'quantity must be at least 0.5.'));
    }

    const service = await Service.findByPk(service_id);
    if (!service) return next(createError(404, 'Service not found.'));
    if (!service.is_available) {
      return next(createError(400, 'This service is currently unavailable.'));
    }

    // Server-side slot availability validation (cancelled bookings don't count)
    const bookedCount = await Booking.count({
      where: { delivery_date, time_slot, status: { [Op.ne]: 'cancelled' } },
    });
    if (bookedCount >= SLOT_CAPACITY) {
      return next(
        createError(409, `The ${time_slot} slot is full on ${delivery_date}. Please pick another slot.`)
      );
    }

    const total = Math.round(Number(service.price) * qty * 100) / 100;

    const booking = await sequelize.transaction(async (t) => {
      const created = await Booking.create(
        {
          user_id: req.user.id,
          service_id: service.id,
          quantity: qty,
          delivery_date,
          time_slot,
          status: 'pending',
          total_amount: total,
          notes,
        },
        { transaction: t }
      );
      await Payment.create(
        { booking_id: created.id, amount: total, method: 'cash', status: 'unpaid' },
        { transaction: t }
      );
      return created;
    });

    const full = await Booking.findByPk(booking.id, { include: bookingIncludes });

    return res.status(201).json({
      message: 'Booking created. Please deliver your laundry on the scheduled date and slot.',
      booking: full,
    });
  } catch (err) {
    return next(err);
  }
};

/** GET /api/bookings — protected (own bookings) */
exports.listMine = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: bookingIncludes,
      order: [
        ['delivery_date', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
};

/** GET /api/bookings/:id — owner or admin */
exports.detail = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: bookingIncludes });
    if (!booking) return next(createError(404, 'Booking not found.'));

    const isOwner = booking.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(createError(403, 'You can only view your own bookings.'));
    }

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
};

/** PATCH /api/bookings/:id/cancel — owner (pending only) or admin */
exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return next(createError(404, 'Booking not found.'));

    const isOwner = booking.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(createError(403, 'You can only cancel your own bookings.'));
    }
    if (booking.status !== 'pending') {
      return next(
        createError(409, `Only pending bookings can be cancelled (current status: ${booking.status}).`)
      );
    }

    booking.status = 'cancelled';
    await booking.save();

    // No payment expected for cancelled bookings — remove the unpaid record.
    await Payment.destroy({ where: { booking_id: booking.id } });

    const full = await Booking.findByPk(booking.id, { include: bookingIncludes });
    return res.json({ message: 'Booking cancelled.', booking: full });
  } catch (err) {
    return next(err);
  }
};

/** PATCH /api/bookings/:id/status — admin */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!status) return next(createError(400, 'status is required.'));

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return next(createError(404, 'Booking not found.'));

    const allowed = STATUS_TRANSITIONS[booking.status] || [];
    if (allowed.length === 0) {
      return next(
        createError(409, `Booking is already in a final state (${booking.status}).`)
      );
    }
    if (!allowed.includes(status)) {
      return next(
        createError(
          400,
          `Cannot move from "${booking.status}" to "${status}". Allowed: ${allowed.join(', ')}.`
        )
      );
    }

    booking.status = status;
    await booking.save();

    const full = await Booking.findByPk(booking.id, { include: bookingIncludes });
    return res.json({ message: `Booking marked as ${status}.`, booking: full });
  } catch (err) {
    return next(err);
  }
};
