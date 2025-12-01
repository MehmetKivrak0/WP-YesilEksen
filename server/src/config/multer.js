const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörünü oluştur (yoksa)
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage konfigürasyonu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dosya tipine göre alt klasör oluştur
        const userType = req.body.userType || 'default';
        const userDir = path.join(uploadDir, userType);
        
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        // Dosya adını oluştur: timestamp-kullaniciid-dosyaadi
        const userId = req.body.email || 'temp';
        const timestamp = Date.now();
        const sanitizedEmail = userId.replace(/[^a-zA-Z0-9]/g, '_');
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const ext = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, ext);
        
        const filename = `${timestamp}-${sanitizedEmail}-${nameWithoutExt}${ext}`;
        cb(null, filename);
    }
});

// Dosya tipi kontrolü
const fileFilter = (req, file, cb) => {
    // Dosya yoksa geç (opsiyonel field'lar için)
    if (!file) {
        return cb(null, true);
    }
    
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Sadece PDF, JPG, JPEG ve PNG dosyaları yüklenebilir!'));
    }
};

// Multer instance oluştur
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB maksimum dosya boyutu
    },
    fileFilter: fileFilter
});

// Birden fazla dosya için fields middleware
const uploadFields = upload.fields([
    // Çiftçi belgeleri
    { name: 'tapuOrKiraDocument', maxCount: 1 },
    { name: 'nufusCuzdani', maxCount: 1 },
    { name: 'ciftciKutuguKaydi', maxCount: 1 },
    { name: 'muvafakatname', maxCount: 1 },
    { name: 'taahhutname', maxCount: 1 },
    { name: 'donerSermayeMakbuz', maxCount: 1 },
    // Şirket belgeleri
    { name: 'ticaretSicilGazetesi', maxCount: 1 },
    { name: 'vergiLevhasi', maxCount: 1 },
    { name: 'imzaSirkuleri', maxCount: 1 },
    { name: 'faaliyetBelgesi', maxCount: 1 },
    { name: 'odaKayitSicilSureti', maxCount: 1 },
    { name: 'gidaIsletmeKayit', maxCount: 1 },
    { name: 'sanayiSicilBelgesi', maxCount: 1 },
    { name: 'kapasiteRaporu', maxCount: 1 }
]);

// Belge yükleme için özel multer instance (çiftçi belge yükleme)
const uploadSingleDocument = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const userId = req.user?.id || 'temp';
            const userDir = path.join(uploadDir, 'farmer', userId);
            
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }
            
            cb(null, userDir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            const filename = `${timestamp}_${originalName}`;
            cb(null, filename);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB maksimum dosya boyutu
    },
    fileFilter: fileFilter
});

module.exports = {
    upload,
    uploadFields,
    uploadSingleDocument
};

