const { Op } = require('sequelize');
const { Booking, Payment, Service, User, sequelize } = require('../models');
const { BOOKING_STATUSES } = require('../constants');
const { createError, todayStr } = require('../utils/helpers');

const bookingIncludes = [
  { model: Service, as: 'service' },
  { model: Payment, as: 'payment' },
  { model: User, as: 'customer', attributes: ['id', 'full_name', 'email', 'phone'] },
];

/** GET /api/admin/bookings?status=&date=&user_id= — admin */
exports.listBookings = async (req, res, next) => {
  try {
    const where = {};
    const { status, date, user_id } = req.query;

    if (status) where.status = status;
    if (date) where.delivery_date = date;
    if (user_id) where.user_id = user_id;

    const bookings = await Booking.findAll({
      where,
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

/** GET /api/admin/stats — admin (dashboard numbers) */
exports.stats = async (req, res, next) => {
  try {
    const [totalUsers, totalServices, revenue, pendingPayments, todayBookings, statusCountsRaw] =
      await Promise.all([
        User.count({ where: { role: 'customer' } }),
        Service.count(),
        Payment.sum('amount', { where: { status: 'paid' } }),
        Payment.sum('amount', { where: { status: 'unpaid' } }),
        Booking.count({
          where: { delivery_date: todayStr(), status: { [Op.ne]: 'cancelled' } },
        }),
        Booking.findAll({
          attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
          group: ['status'],
        }),
      ]);

    const byStatus = {};
    BOOKING_STATUSES.forEach((s) => {
      byStatus[s] = 0;
    });
    statusCountsRaw.forEach((row) => {
      byStatus[row.status] = Number(row.count);
    });

    const totalBookings = BOOKING_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);

    return res.json({
      totals: {
        customers: totalUsers,
        services: totalServices,
        bookings: totalBookings,
        revenue: Number(revenue) || 0,
        pendingPayments: Number(pendingPayments) || 0,
        todayBookings,
      },
      byStatus,
    });
  } catch (err) {
    return next(err);
  }
};

/** GET /api/users — admin (customer list with booking counts) */
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'full_name', 'email', 'phone', 'address', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    const counts = await Booking.findAll({
      attributes: ['user_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['user_id'],
    });
    const countMap = Object.fromEntries(counts.map((c) => [c.user_id, Number(c.count)]));

    return res.json({
      users: users.map((u) => ({ ...u.toJSON(), booking_count: countMap[u.id] || 0 })),
    });
  } catch (err) {
    return next(err);
  }
};
