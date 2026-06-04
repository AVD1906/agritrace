const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

router.get('/trace/:batchId', authMiddleware, checkRole('Admin'), reportController.getProductTrace);
router.get('/activity', authMiddleware, checkRole('Admin'), reportController.getUserActivity);
router.get('/summary', authMiddleware, checkRole('Admin'), reportController.getSupplyChainSummary);

module.exports = router;