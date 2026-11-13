const { Booking, Payment, Service, User } = require('../models');
const { PAYABLE_STATUSES } = require('../constants');
const { createError } = require('../utils/helpers');

const paymentIncludes = [
  {
    model: Booking,
    as: 'booking',
    include: [
      { model: Service, as: 'service' },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'full_name', 'email', 'phone', 'address'],
      },
    ],
  },
];

/** GET /api/payments?status= — admin */
exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const payments = await Payment.findAll({
      where,
      include: paymentIncludes,
      order: [['id', 'DESC']],
    });
    return res.json({ payments });
  } catch (err) {
    return next(err);
  }
};

/** GET /api/payments/:id — admin (receipt data) */
exports.detail = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: paymentIncludes });
    if (!payment) return next(createError(404, 'Payment not found.'));
    return res.json({ payment });
  } catch (err) {
    return next(err);
  }
};

/** PATCH /api/payments/:id — admin, marks as paid (cash on claim) */
exports.markPaid = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return next(createError(404, 'Payment not found.'));

    if (payment.status === 'paid') {
      return next(createError(409, 'Payment is already marked as paid.'));
    }

    const booking = await Booking.findByPk(payment.booking_id);
    if (!booking) return next(createError(404, 'Booking for this payment not found.'));
    if (!PAYABLE_STATUSES.includes(booking.status)) {
      return next(
        createError(
          409,
          `Payment can only be recorded once the booking is ready, delivered or claimed (current status: ${booking.status}).`
        )
      );
    }

    payment.status = 'paid';
    payment.paid_at = new Date();
    await payment.save();

    const full = await Payment.findByPk(payment.id, { include: paymentIncludes });
    return res.json({ message: 'Payment recorded.', payment: full });
  } catch (err) {
    return next(err);
  }
};
