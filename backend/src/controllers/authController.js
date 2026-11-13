const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { createError } = require('../utils/helpers');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

const safeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
});

/** POST /api/auth/register — public */
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, address } = req.body || {};

    if (!full_name || !email || !password) {
      return next(createError(400, 'full_name, email and password are required.'));
    }

    const existing = await User.findOne({ where: { email: String(email).toLowerCase() } });
    if (existing) {
      return next(createError(409, 'Email is already registered.'));
    }

    const user = await User.create({
      full_name,
      email: String(email).toLowerCase(),
      password,
      phone,
      address,
      role: 'customer',
    });

    return res.status(201).json({
      message: 'Registration successful.',
      token: signToken(user),
      user: safeUser(user),
    });
  } catch (err) {
    return next(err);
  }
};

/** POST /api/auth/login — public */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return next(createError(400, 'Email and password are required.'));
    }

    const user = await User.findOne({ where: { email: String(email).toLowerCase() } });
    if (!user || !(await user.comparePassword(password))) {
      return next(createError(401, 'Invalid email or password.'));
    }

    return res.json({
      message: 'Login successful.',
      token: signToken(user),
      user: safeUser(user),
    });
  } catch (err) {
    return next(err);
  }
};

/** GET /api/auth/me — protected */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(createError(404, 'User not found.'));
    return res.json({ user: safeUser(user) });
  } catch (err) {
    return next(err);
  }
};
