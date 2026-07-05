const pool = require('../config/db');
const notificationModel = require('../models/notificationModel'); 


// ================= GET ALL LOGS (ADMIN) =================
const getAllLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM AuditLogs ORDER BY timestamp DESC'
    );

    res.json(rows);
  } catch (error) {
    console.error('Get all logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ================= GET LOGS BY BATCH =================
const getLogsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM AuditLogs WHERE details LIKE ? ORDER BY timestamp DESC',
      [`%Batch ID: ${batchId}%`]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get logs by batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ================= CREATE LOG =================
const createLog = async (req, res) => {
  try {
    const { batch_id, action } = req.body;

    const user_id = req.user?.user_id;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

   
    if (!batch_id || !action || !user_id) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    await pool.query(
      'INSERT INTO AuditLogs (user_id, action, details) VALUES (?, ?, ?)',
      [user_id, action, `Batch ID: ${batch_id}`]
    );

   
    console.log(" LOG CREATED - ADDING NOTIFICATION");
    await notificationModel.createNotification(
      user_id,
      `Log added: ${action}`
    );

    res.status(201).json({
      message: 'Log created successfully',
    });

  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getAllLogs,
  getLogsByBatch,
  createLog,
};
