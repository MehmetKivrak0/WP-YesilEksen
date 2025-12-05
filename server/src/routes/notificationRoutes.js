const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Tüm route'lar authentication gerektirir
router.use(auth);

// Tüm bildirimleri getir
router.get('/', getNotifications);

// Okunmamış bildirim sayısını getir
router.get('/unread-count', getUnreadCount);

// Bildirimi okundu olarak işaretle
router.put('/:id/read', markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put('/read-all', markAllAsRead);

// Bildirimi sil
router.delete('/:id', deleteNotification);

// Tüm bildirimleri sil
router.delete('/', deleteAllNotifications);

module.exports = router;
