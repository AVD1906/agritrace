const pool = require('../config/db');

const getProductTraceReport = async (batchId) => {
  const [rows] = await pool.query(
    `SELECT p.product_name, b.batch_id, l.stage, l.timestamp, loc.name AS location
     FROM Products p
     JOIN Batches b ON p.product_id = b.product_id
     JOIN SupplyChainLogs l ON b.batch_id = l.batch_id
     JOIN Locations loc ON l.location_id = loc.location_id
     WHERE b.batch_id = ?
     ORDER BY l.timestamp ASC`,
    [batchId]
  );
  return rows;
};

const getUserActivityReport = async () => {
  const [rows] = await pool.query(
    `SELECT u.name, COUNT(l.log_id) AS activity_count
     FROM Users u
     LEFT JOIN SupplyChainLogs l ON u.user_id = l.user_id
     GROUP BY u.user_id`
  );
  return rows;
};

const getSupplyChainSummary = async () => {
  const [rows] = await pool.query(
    `SELECT 
        p.product_name,
        COUNT(DISTINCT b.batch_id)        AS total_batches,
        SUM(b.quantity)                   AS total_quantity,
        COUNT(DISTINCT CASE WHEN b.status = 'Verified' THEN b.batch_id END) AS verified_batches,
        COUNT(DISTINCT l.log_id)          AS total_log_events,
        COUNT(DISTINCT c.cert_id)         AS total_certifications,
        MAX(b.harvest_date)               AS latest_harvest,
        ROUND(
          COUNT(DISTINCT CASE WHEN b.status = 'Verified' THEN b.batch_id END) * 100.0
          / NULLIF(COUNT(DISTINCT b.batch_id), 0), 1
        )                                 AS verified_pct
     FROM products p
     LEFT JOIN batches b         ON p.product_id  = b.product_id
     LEFT JOIN supplychainlogs l ON b.batch_id     = l.batch_id
     LEFT JOIN certifications c  ON b.batch_id     = c.batch_id
     GROUP BY p.product_id, p.product_name
     ORDER BY total_batches DESC`
  );
  return rows;
};

module.exports = {
  getProductTraceReport,
  getUserActivityReport,
  getSupplyChainSummary,
};