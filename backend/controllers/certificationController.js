const certModel = require('../models/certificationModel');

// ================= ADD =================
exports.addCertification = async (req, res) => {
  try {
    const { batch_id, name } = req.body;

    console.log("CERT BODY:", req.body);

    if (!batch_id || !name) {
      return res.status(400).json({
        message: "batch_id and name required",
      });
    }

    await certModel.addCertification({ batch_id, name });

    res.status(201).json({
      message: "Certification added",
    });

  } catch (error) {
    console.error("addCertification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET =================
exports.getCertifications = async (req, res) => {
  try {
    const data = await certModel.getCertificationsByBatch(req.params.batchId);
    res.json(data);
  } catch (error) {
    console.error("getCertifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};