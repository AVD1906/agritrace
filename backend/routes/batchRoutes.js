const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const authMiddleware = require('../middleware/authMiddleware');

// 🔥 IMPORTANT → add middleware
router.post('/', authMiddleware, batchController.createBatch);

router.get('/', batchController.getAllBatches);
router.put('/verify/:id', authMiddleware, batchController.verifyBatch);

router.get('/product/:productId', batchController.getBatchesByProduct);
router.get('/:id', batchController.getBatchById);

module.exports = router;