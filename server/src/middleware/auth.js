// Authentication middleware
const jwt = require('jsonwebtoken');
// JWT şuna yarar:
// Token oluşturmak ve doğrulamak için
const { pool } = require('../config/database.js');
// Database şuna yarar:
// PostgreSQL'e bağlanmak için

//Jwt Token Doğrulama middleware şuna yarar:
// Token'ın doğruluğunu kontrol etmek için
const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization')?.replace
            ('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Giriş yapmanız gerekiyor'
            });
        }

        //Token Doğrulama
        const decoded = jwt.verify
            (token, process.env.JWT_SECRET);

        //Kullanıcıyı veritabanından al
        const result = await pool.query
            ('SELECT id,ad,soyad,eposta,rol,durum FROM kullanicilar WHERE id = $1',
                [decoded.id]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        const user = result.rows[0]

        // Kullanıcı aktif mi kontrol et
        // Çiftçi ise ve durumu "beklemede" ise, çiftlik başvurusunun durumunu kontrol et
        if (user.durum !== 'aktif') {
            // Çiftçi ise ve durumu "beklemede" ise, çiftlik başvurusunun durumunu kontrol et
            if (user.rol === 'ciftci' && user.durum === 'beklemede') {
                const basvuruResult = await pool.query(
                    `SELECT durum 
                     FROM ciftlik_basvurulari 
                     WHERE kullanici_id = $1::uuid 
                     ORDER BY guncelleme DESC 
                     LIMIT 1`,
                    [user.id]
                );
                
                // Eğer başvuru durumu "belge_eksik" veya "gcbelge" ise, middleware'den geçmesine izin ver
                if (basvuruResult.rows.length > 0 && 
                    (basvuruResult.rows[0].durum === 'belge_eksik' || basvuruResult.rows[0].durum === 'gcbelge')) {
                    // Girişe izin ver, frontend'de eksik belgeler sayfasına yönlendirilecek veya mesaj gösterilecek
                } else {
                    // Diğer durumlarda (beklemede, ilk_inceleme vb.) hesap aktif değil mesajı göster
                    return res.status(403).json({
                        success: false,
                        message: 'Hesabınız aktif değil'
                    });
                }
            } else {
                // Çiftçi değilse veya durum farklıysa normal kontrol
                return res.status(403).json({
                    success: false,
                    message: 'Hesabınız aktif değil'
                });
            }
        }

        //Kullanıcı bilgilerini request 'e ekle
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware hatası:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Yetkilendirme hatası'
        });
    }
}

//Rol Kontrolü middleware şuna yarar:
// Kullanıcının rolünü kontrol etmek için
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Giriş yapmanız gerekiyor'
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        next();
    };
};

module.exports = { auth, checkRole};

// JWT Token Oluşturma

const generateToken = (payloud) => {
    return  jwt.sign(payloud,process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE || '1h'
    });
};
// JWT Token Doğrulama

const verifyToken = (token) => {
    try {
        return jwt.verify(token,process.env.JWT_SECRET);
        //JWT_SECRET ne işe yarar?
        //JWT_SECRET, token'ı doğrularken kullanılır.
    } catch (error) {
        throw new Error('Token doğrulama hatası');
    }
}


// tokendan kullanıcı bilgilerini çıkar 

const decodeToken = (token) => {
    return jwt.decode(token);
}

module.exports = { auth, checkRole, generateToken, verifyToken, decodeToken };