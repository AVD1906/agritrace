const pool = require('../config/db');

const addCertification = async ({ batch_id, name }) => {
  const issued_by = name; // 🔥 map frontend → DB
  const issue_date = new Date();
  const status = "Valid";

  const [result] = await pool.query(
    `INSERT INTO Certifications (batch_id, issued_by, issue_date, status)
     VALUES (?, ?, ?, ?)`,
    [batch_id, issued_by, issue_date, status]
  );

  return result;
};

const getCertificationsByBatch = async (batchId) => {
  const [rows] = await pool.query(
    `SELECT * FROM Certifications WHERE batch_id = ?`,
    [batchId]
  );
  return rows;
};

module.exports = {
  addCertification,
  getCertificationsByBatch,
};