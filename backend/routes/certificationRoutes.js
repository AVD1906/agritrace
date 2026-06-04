const express = require('express');
const router = express.Router();
const certController = require('../controllers/certificationController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

router.post('/', authMiddleware, checkRole('Processor', 'Admin'), certController.addCertification);
router.get('/:batchId', certController.getCertifications);

module.exports = router;