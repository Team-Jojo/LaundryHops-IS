const { Service, Booking } = require('../models');
const { createError } = require('../utils/helpers');

const UNITS = ['per_kg', 'per_item', 'fixed'];

const parsePrice = (price) => {
  const n = Number(price);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
};

/** GET /api/services — public */
exports.list = async (req, res, next) => {
  try {
    const services = await Service.findAll({ order: [['name', 'ASC']] });
    return res.json({ services });
  } catch (err) {
    return next(err);
  }
};

/** GET /api/services/:id — public */
exports.detail = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return next(createError(404, 'Service not found.'));
    return res.json({ service });
  } catch (err) {
    return next(err);
  }
};

/** POST /api/services — admin */
exports.create = async (req, res, next) => {
  try {
    const { name, description, price, unit, is_available } = req.body || {};

    if (!name || price === undefined || price === null) {
      return next(createError(400, 'name and price are required.'));
    }
    const parsed = parsePrice(price);
    if (parsed === null) {
      return next(createError(400, 'price must be a positive number.'));
    }
    if (unit !== undefined && unit !== null && !UNITS.includes(unit)) {
      return next(createError(400, `unit must be one of: ${UNITS.join(', ')}.`));
    }

    const service = await Service.create({
      name: String(name).trim(),
      description,
      price: parsed,
      unit: unit || 'per_kg',
      is_available: is_available !== undefined ? Boolean(is_available) : true,
    });

    return res.status(201).json({ message: 'Service created.', service });
  } catch (err) {
    return next(err);
  }
};

/** PUT /api/services/:id — admin */
exports.update = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return next(createError(404, 'Service not found.'));

    const { name, description, price, unit, is_available } = req.body || {};

    if (price !== undefined && parsePrice(price) === null) {
      return next(createError(400, 'price must be a positive number.'));
    }
    if (unit !== undefined && unit !== null && !UNITS.includes(unit)) {
      return next(createError(400, `unit must be one of: ${UNITS.join(', ')}.`));
    }

    if (name !== undefined) service.name = String(name).trim();
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = parsePrice(price);
    if (unit !== undefined && unit !== null) service.unit = unit;
    if (is_available !== undefined) service.is_available = Boolean(is_available);

    await service.save();
    return res.json({ message: 'Service updated.', service });
  } catch (err) {
    return next(err);
  }
};

/** DELETE /api/services/:id — admin */
exports.remove = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return next(createError(404, 'Service not found.'));

    const bookingCount = await Booking.count({ where: { service_id: service.id } });
    if (bookingCount > 0) {
      return next(
        createError(
          409,
          `Service has ${bookingCount} booking(s). Set it unavailable instead of deleting it.`
        )
      );
    }

    await service.destroy();
    return res.json({ message: 'Service deleted.' });
  } catch (err) {
    return next(err);
  }
};
