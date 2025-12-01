const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadProfilePhoto: multerProfilePhoto, uploadCertificate: multerCertificate, upload } = require('../config/multer');
const { 
    getPanelStats, 
    getBasvuruStatus,
    getFirmaProfile,
    updateFirmaProfile,
    uploadProfilePhoto,
    getSertifikaTurleri,
    addSertifika,
    deleteSertifika,
    updateBasvuruBelge,
    updateBasvuruBelgeler,
    getPublicFirmalar,
    getSektorler,
    getFirmaDetay
} = require('../controllers/firmaController');

// ===== PUBLIC ROUTES (Auth gerektirmez) =====
// Test route'u
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Firma route çalışıyor' });
});

// Public firma listesi - tüm aktif firmalar
router.get('/public/list', getPublicFirmalar);

// Public sektör listesi
router.get('/public/sektorler', getSektorler);

// Public firma detay
router.get('/public/detay/:id', getFirmaDetay);

// ===== PROTECTED ROUTES (Auth gerektirir) =====
router.use(auth);

// Firma panel istatistikleri
router.get('/panel/stats', getPanelStats);

// Başvuru durumu
router.get('/basvuru-durum', getBasvuruStatus);

// Firma profil
router.get('/profile', (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('📍 GET /api/firma/profile route çağrıldı');
        console.log('📍 User:', req.user?.id);
    }
    next();
}, getFirmaProfile);
router.put('/profile', updateFirmaProfile);

// Profil fotoğrafı
router.post('/profile/photo', (req, res, next) => {
    multerProfilePhoto(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Dosya yükleme hatası'
            });
        }
        next();
    });
}, uploadProfilePhoto);

// Sertifikalar
router.get('/certificates/types', getSertifikaTurleri);
router.post('/certificates', (req, res, next) => {
    multerCertificate(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Dosya yükleme hatası'
            });
        }
        next();
    });
}, addSertifika);
router.delete('/certificates/:id', deleteSertifika);

// Başvuru belge güncelleme
router.post('/basvuru-belge/:belgeId', upload.single('file'), updateBasvuruBelge);
router.post('/basvuru-belgeler', upload.any(), updateBasvuruBelgeler);

module.exports = router;

