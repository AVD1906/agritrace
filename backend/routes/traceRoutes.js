const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// PUBLIC — no auth needed
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    // get batch + product info
    const [batches] = await pool.query(
      `SELECT b.*, p.product_name
       FROM Batches b 
       JOIN Products p ON b.product_id = p.product_id 
       WHERE b.batch_id = ?`,
      [batchId]
    );

    if (batches.length === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // get supply chain logs
    const [logs] = await pool.query(
      `SELECT * FROM SupplyChainLogs 
       WHERE batch_id = ? 
       ORDER BY timestamp ASC`,
      [batchId]
    );

    // get certifications
    const [certifications] = await pool.query(
      `SELECT * FROM Certifications 
       WHERE batch_id = ?`,
      [batchId]
    );

    res.json({
      batch: batches[0],
      timeline: logs,
      certifications,
    });

  } catch (error) {
    console.error('trace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;