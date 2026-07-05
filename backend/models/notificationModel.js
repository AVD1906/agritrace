const pool = require('../config/db');

// ================= CREATE =================
const createNotification = async (user_id, message) => {
  console.log(" INSERTING NOTIFICATION:", user_id, message); 

  await pool.query(
    `INSERT INTO Notifications (user_id, message) VALUES (?, ?)`,
    [user_id, message]
  );
};

// ================= GET =================
const getNotifications = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

// ================= MARK AS READ =================
const markAsRead = async (id) => {
  await pool.query(
    `UPDATE Notifications SET status = 'Read' WHERE notification_id = ?`,
    [id]
  );
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};
