const express = require('express');
const router = express.Router();

const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleCheck');

//  CREATE LOG (any authenticated user)
router.post('/', authMiddleware, logController.createLog);

//  GET LOGS BY BATCH (any authenticated user)
router.get('/:batchId', authMiddleware, logController.getLogsByBatch);

//  GET ALL LOGS (admin only)
router.get('/', authMiddleware, adminOnly, logController.getAllLogs);

module.exports = router;