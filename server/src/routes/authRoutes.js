// Auth Routes
const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, checkEmail, resetPassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { uploadFields } = require('../config/multer');

// Multer middleware wrapper - hataları yakala ve opsiyonel hale getir
const multerMiddleware = (req, res, next) => {
    uploadFields(req, res, (err) => {
        // Multer hatalarını yakala ama dosya yoksa devam et (opsiyonel field'lar için)
        if (err) {
            // Dosya yoksa veya beklenmeyen field hatası varsa devam et
            if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unexpected field')) {
                console.warn('⚠️ Multer uyarısı (göz ardı edildi):', err.message);
                return next(); // Hata olmadan devam et
            }
            // Diğer hatalar için hata döndür
            return next(err);
        }
        next();
    });
};

// Register endpoint'i için multer middleware ekle (dosya yükleme desteği - opsiyonel)
router.post('/register', multerMiddleware, register);
router.post('/login',login);
router.get('/me',auth,getMe);
router.post('/logout',auth,logout);
router.post('/check-email', checkEmail);
router.post('/reset-password', resetPassword);

module.exports = router;