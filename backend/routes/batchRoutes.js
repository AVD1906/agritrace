const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const authMiddleware = require('../middleware/authMiddleware');
const { generateCertificate } = require('../services/certificateService');

router.post('/', authMiddleware, batchController.createBatch);

router.get('/', batchController.getAllBatches);
router.put('/verify/:id', authMiddleware, batchController.verifyBatch);

router.get('/product/:productId', batchController.getBatchesByProduct);

// Certificate endpoint
router.get('/:id/certificate', authMiddleware, async (req, res) => {
  try {
    await generateCertificate(req.params.id, res);
  } catch (error) {
    console.error('Certificate error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

router.get('/:id', batchController.getBatchById);

module.exports = router;