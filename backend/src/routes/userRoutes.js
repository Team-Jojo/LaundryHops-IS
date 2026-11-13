const router = require('express').Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', verifyToken, requireAdmin, adminController.listUsers);

module.exports = router;
