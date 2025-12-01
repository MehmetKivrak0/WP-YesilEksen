const express = require('express');
const router = express.Router();
const { getDocument, getDocumentInfo } = require('../controllers/documentController');
const { auth } = require('../middleware/auth');

// Belge dosyasını getir (indirme veya görüntüleme)
// İki format destekleniyor:
// 1. /api/documents/file/* - Direkt dosya yolu ile (wildcard route) - PUBLIC (resimler için)
// 2. /api/documents/:basvuruId/:belgeId - Veritabanı ID'leri ile - AUTH GEREKLİ

// Wildcard route için regex pattern kullan (Express'te /file/* çalışmaz)
// Resimler için public endpoint (authentication gerektirmez)
router.get(/^\/file\/(.+)$/, getDocument);

// Diğer route'lar authentication gerektirir
router.use(auth);
router.get('/:basvuruId/:belgeId', getDocument);

// Belge bilgilerini getir
router.get('/info/:basvuruId/:belgeId', getDocumentInfo);

module.exports = router;

