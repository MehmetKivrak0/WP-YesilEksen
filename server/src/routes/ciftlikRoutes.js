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
    addSertifika,
    addWasteProduct,
    getMyProductApplications
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

// Ürün başvuru durumları
router.get('/urun-basvurulari', getMyProductApplications);

// Atık/Ürün ekleme (belgelerle)
// Önce çiftlik ID'sini alan middleware
const { pool } = require('../config/database');
const getCiftlikId = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const ciftlikResult = await pool.query(
            'SELECT id FROM ciftlikler WHERE kullanici_id = $1',
            [user_id]
        );
        if (ciftlikResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik bulunamadı'
            });
        }
        req.ciftlik_id = ciftlikResult.rows[0].id;
        next();
    } catch (error) {
        console.error('getCiftlikId middleware hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Çiftlik bilgisi alınamadı'
        });
    }
};

const multer = require('multer');
const uploadWasteProduct = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadsDir = require('path').join(__dirname, '../../uploads');
            // User ID'sine göre klasör oluştur (sertifika mantığı gibi)
            const userId = req.user?.id || 'temp';
            const farmerDir = require('path').join(uploadsDir, 'farmer', userId);
            require('fs').mkdirSync(farmerDir, { recursive: true });
            cb(null, farmerDir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const ext = require('path').extname(file.originalname);
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            cb(null, `${timestamp}-${file.fieldname}-${sanitizedName}`);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(require('path').extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Sadece JPG, PNG ve PDF dosyaları yüklenebilir!'));
        }
    }
}).fields([
    { name: 'productPhoto', maxCount: 1 },
    { name: 'originDocument', maxCount: 1 },
    { name: 'analysisReport', maxCount: 1 },
    { name: 'guaranteeDocument', maxCount: 1 },
    { name: 'additionalPhoto', maxCount: 1 },
    { name: 'qualityCertificate', maxCount: 1 }
]);

router.post('/atik-ekle', getCiftlikId, uploadWasteProduct, addWasteProduct);

module.exports = router;

