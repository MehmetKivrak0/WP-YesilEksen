const express = require('express');
const router = express.Router();
const {
    getPanelStats,
    getMyProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getPendingOffers,
    getRecentSales,
    getCiftlikProfil,
    updateCiftlikProfil,
    uploadCiftlikLogo,
    getMissingDocumentsForFarmer,
    uploadMissingDocument,
    getGuncelBelgelerForFarmer,
    getSertifikaTurleri,
    addSertifika
} = require('../controllers/ciftlikController');
const { auth } = require('../middleware/auth');
const { uploadSingleDocument } = require('../config/multer');
const { uploadLogo } = require('../config/multer_logo');

// Tüm route'lar authentication gerektirir
router.use(auth);

// Dashboard istatistikleri
router.get('/panel/stats', getPanelStats);

// Bekleyen onaylar (teklifler)
router.get('/panel/pending-offers', getPendingOffers);

// Son satışlar
router.get('/panel/recent-sales', getRecentSales);

// Ürünler
router.get('/urunler', getMyProducts);
router.post('/urunler', addProduct);
router.put('/urunler/:id', updateProduct);
router.delete('/urunler/:id', deleteProduct);

// Çiftlik Profili
router.get('/profil', getCiftlikProfil);
router.put('/profil', updateCiftlikProfil);
router.post('/upload-logo', uploadLogo.single('logo'), uploadCiftlikLogo);

// Eksik Belgeler
router.get('/missing-documents', getMissingDocumentsForFarmer);
router.post('/upload-missing-document', uploadSingleDocument.single('file'), uploadMissingDocument);

// Güncel Belgeler (gcbelge)
router.get('/guncel-belgeler', getGuncelBelgelerForFarmer);

// Sertifika işlemleri
router.get('/sertifika-turleri', getSertifikaTurleri);
router.post('/sertifika-ekle', uploadSingleDocument.single('dosya'), addSertifika);

module.exports = router;

