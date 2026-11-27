const router = require('express').Router();
const serviceController = require('../controllers/serviceController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

// Public catalog
router.get('/', serviceController.list);
router.get('/:id', serviceController.detail);

// Admin management
router.post('/', verifyToken, requireAdmin, serviceController.create);
router.put('/:id', verifyToken, requireAdmin, serviceController.update);
router.delete('/:id', verifyToken, requireAdmin, serviceController.remove);

module.exports = router;
