const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

router.use(verifyToken, requireAdmin);

router.get('/', paymentController.list);
router.get('/:id', paymentController.detail);
router.patch('/:id', paymentController.markPaid);

module.exports = router;
