const reportModel = require('../models/reportModel');

exports.getProductTrace = async (req, res) => {
  try {
    const report = await reportModel.getProductTraceReport(req.params.batchId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const report = await reportModel.getUserActivityReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSupplyChainSummary = async (req, res) => {
  try {
    const report = await reportModel.getSupplyChainSummary();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};