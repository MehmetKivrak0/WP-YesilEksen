// Logo yükleme için özel multer instance
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');

const uploadLogo = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const userId = req.user?.id || 'temp';
            const userDir = path.join(uploadDir, 'farmer', userId, 'logo');
            
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }
            
            cb(null, userDir);
        },
        filename: (req, file, cb) => {
            // Orijinal dosya adını al ve güvenli hale getir
            const originalName = file.originalname;
            const ext = path.extname(originalName);
            const nameWithoutExt = path.basename(originalName, ext);
            
            // Dosya adını sanitize et (özel karakterleri temizle)
            const sanitizedName = nameWithoutExt
                .replace(/[^a-zA-Z0-9_-]/g, '_') // Özel karakterleri _ ile değiştir
                .replace(/\s+/g, '_') // Boşlukları _ ile değiştir
                .toLowerCase(); // Küçük harfe çevir
            
            // Eğer dosya adı çok uzunsa kısalt
            const maxLength = 50;
            const finalName = sanitizedName.length > maxLength 
                ? sanitizedName.substring(0, maxLength) 
                : sanitizedName;
            
            // Benzersizlik için timestamp ekle (aynı isimli dosyalar için)
            const timestamp = Date.now();
            const filename = `${finalName}_${timestamp}${ext}`;
            
            cb(null, filename);
        }
    }),
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB maksimum dosya boyutu
    },
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(null, true);
        }
        
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece JPG, JPEG, PNG ve WEBP dosyaları yüklenebilir!'));
        }
    }
});

module.exports = { uploadLogo };

