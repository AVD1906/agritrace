const QRCode = require('qrcode');
const pool = require('../config/db');
const batchModel = require('../models/batchModel');
const notificationModel = require('../models/notificationModel');

// ================= CREATE BATCH =================
exports.createBatch = async (req, res) => {
  try {
    const { product_id, quantity, location_id, date } = req.body;
    const harvest_date = date;

    console.log("BODY:", req.body);

    if (!product_id || !quantity || !harvest_date) {
      return res.status(400).json({
        message: 'product_id, quantity, and date are required',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: 'Quantity must be > 0',
      });
    }

    const result = await batchModel.createBatch({
      product_id,
      quantity,
      location_id,
      harvest_date,
      status: "Pending",
      qr_code: null,
    });

    const batchId = result.insertId;

    const traceUrl = `${process.env.FRONTEND_URL}/trace/${batchId}`;
    const qrCodeBase64 = await QRCode.toDataURL(traceUrl);

    await pool.query(
      `UPDATE Batches SET qr_code = ? WHERE batch_id = ?`,
      [qrCodeBase64, batchId]
    );

    await pool.query(
      `INSERT INTO SupplyChainLogs (batch_id, location_id, user_id, stage, timestamp)
       VALUES (?, ?, ?, 'Batch Created', NOW())`,
      [batchId, location_id || null, req.user.user_id]
    );

    await notificationModel.createNotification(
      req.user.user_id,
      'New batch created'
    );

    res.status(201).json({
      message: 'Batch created successfully',
      batch_id: batchId,
      qr_code: qrCodeBase64,
    });

  } catch (error) {
    console.error('createBatch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET ALL =================
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await batchModel.getAllBatches();
    res.json(batches);
  } catch (error) {
    console.error('getAllBatches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= VERIFY =================
exports.verifyBatch = async (req, res) => {
  try {
    await batchModel.verifyBatch(req.params.id);

    const io = req.app.get('io');
    io.emit('batch:updated', {
      batch_id: Number(req.params.id),
      status: 'Verified',
    });

    res.json({ message: 'Batch verified' });
  } catch (error) {
    console.error('verifyBatch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= OTHERS =================
exports.getBatchesByProduct = async (req, res) => {
  try {
    const batches = await batchModel.getBatchesByProduct(req.params.productId);
    res.json(batches);
  } catch (error) {
    console.error('getBatchesByProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const batch = await batchModel.getBatchById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);
  } catch (error) {
    console.error('getBatchById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};