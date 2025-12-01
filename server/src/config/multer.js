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

// Profil fotoğrafı için özel storage - profile-photos klasöründe
const profilePhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const profilePhotosDir = path.join(uploadDir, 'profile-photos');
        if (!fs.existsSync(profilePhotosDir)) {
            fs.mkdirSync(profilePhotosDir, { recursive: true });
        }
        cb(null, profilePhotosDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'temp';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `profile-${userId}-${timestamp}${ext}`;
        cb(null, filename);
    }
});

const uploadProfilePhoto = multer({
    storage: profilePhotoStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB maksimum
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece JPG, JPEG ve PNG dosyaları yüklenebilir!'));
        }
    }
}).single('photo');

// Sertifika dosyası için özel storage
const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const certDir = path.join(uploadDir, 'certificates');
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }
        cb(null, certDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'temp';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `cert-${userId}-${timestamp}${ext}`;
        cb(null, filename);
    }
});

const uploadCertificate = multer({
    storage: certificateStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB maksimum
    },
    fileFilter: fileFilter
}).single('file');

// Tek dosya yükleme için (genel kullanım)
const uploadSingle = upload.single('file');

module.exports = {
    upload,
    uploadFields,
    uploadSingle,
    uploadSingleDocument: upload, // Multer instance - can use .single(), .array(), etc.
    uploadProfilePhoto,
    uploadCertificate
};

