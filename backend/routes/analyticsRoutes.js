const express = require('express');
const router = express.Router();

const {
  getProductTrace,
  getUserActivity,
} = require('../controllers/analyticsController');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

router.use(authMiddleware);

router.get('/trace/:batch_id', checkRole('Admin'), getProductTrace);
router.get('/user-activity', checkRole('Admin'), getUserActivity);

module.exports = router;