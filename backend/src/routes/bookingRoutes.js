const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

router.use(verifyToken);

// NOTE: /slots must be registered before /:id
router.get('/slots', bookingController.getSlots);
router.post('/', bookingController.create);
router.get('/', bookingController.listMine);
router.get('/:id', bookingController.detail);
router.patch('/:id/cancel', bookingController.cancel);
router.patch('/:id/status', requireAdmin, bookingController.updateStatus);

module.exports = router;
