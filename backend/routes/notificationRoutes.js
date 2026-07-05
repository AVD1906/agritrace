const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, notificationController.getNotifications);


router.post('/', authMiddleware, notificationController.createNotification);


router.put('/read/:id', authMiddleware, notificationController.markAsRead);

module.exports = router;
