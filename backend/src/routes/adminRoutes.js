const router = require('express').Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

router.use(verifyToken, requireAdmin);

router.get('/bookings', adminController.listBookings);
router.get('/stats', adminController.stats);

module.exports = router;
