const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LaundryHops API', time: new Date().toISOString() });
});

router.use('/auth', require('./authRoutes'));
router.use('/services', require('./serviceRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
