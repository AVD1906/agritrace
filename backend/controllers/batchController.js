const batchModel = require('../models/batchModel');
const notificationModel = require('../models/notificationModel');

// ================= CREATE BATCH =================
exports.createBatch = async (req, res) => {
  try {
    const { product_id, quantity, location_id, date } = req.body;

    const harvest_date = date; // 🔥 map frontend → backend

    console.log("BODY:", req.body);

    // 🔴 VALIDATIONS
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
    });

    // 🔥 NOTIFICATION
    await notificationModel.createNotification(
      req.user.user_id,
      'New batch created'
    );

    res.status(201).json({
      message: 'Batch created successfully',
      batch_id: result.insertId,
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