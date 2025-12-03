const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

/**
 * Belge dosyasını serve et (indirme veya görüntüleme için)
 * GET /api/documents/:basvuruId/:belgeId
 * veya
 * GET /api/documents/file/:filePath
 */
const getDocument = async (req, res) => {
    try {
        const { basvuruId, belgeId } = req.params;
        
        // Regex route için: req.params[0] veya req.params[1] kullan
        // Normal route için: req.params.path
        const filePath = req.params[0] || req.params.path || null;
        
        let documentPath = null;
        
        // Eğer wildcard route kullanıldıysa (filePath varsa), direkt dosya yolunu kullan
        if (filePath) {
            // Güvenlik: path traversal saldırılarını önle
            let decodedPath = decodeURIComponent(filePath);
            
            // Mutlak URL'den relative path çıkar
            if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
                try {
                    const urlObj = new URL(decodedPath);
                    decodedPath = urlObj.pathname;
                    // /uploads/ prefix'ini kaldır
                    if (decodedPath.startsWith('/uploads/')) {
                        decodedPath = decodedPath.substring('/uploads/'.length);
                    } else if (decodedPath.startsWith('/')) {
                        decodedPath = decodedPath.substring(1);
                    }
                } catch (e) {
                    // URL parse edilemezse, /uploads/ içinde arıyoruz
                    if (decodedPath.includes('/uploads/')) {
                        decodedPath = decodedPath.split('/uploads/')[1];
                    }
                }
            } else if (decodedPath.includes('/uploads/')) {
                // Relative path içinde /uploads/ varsa, sonrasını al
                decodedPath = decodedPath.split('/uploads/')[1];
            }
            
            // Path'i normalize et ve güvenlik kontrolü yap
            const safePath = path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');
            documentPath = path.join(__dirname, '../../uploads', safePath);
        } 
        // Eğer basvuruId ve belgeId varsa, veritabanından dosya yolunu al
        else if (basvuruId && belgeId) {
            const result = await pool.query(
                `SELECT dosya_yolu FROM belgeler 
                 WHERE basvuru_id = $1 AND id = $2`,
                [basvuruId, belgeId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Belge bulunamadı'
                });
            }
            
            let relativePath = result.rows[0].dosya_yolu;
            
            // Mutlak URL'den relative path çıkar
            if (relativePath && (relativePath.startsWith('http://') || relativePath.startsWith('https://'))) {
                const urlObj = new URL(relativePath);
                relativePath = urlObj.pathname;
                // /uploads/ prefix'ini kaldır
                if (relativePath.startsWith('/uploads/')) {
                    relativePath = relativePath.substring('/uploads/'.length);
                }
            }
            // Eğer path içinde /uploads/ varsa, sadece sonrasını al
            if (relativePath && relativePath.includes('/uploads/')) {
                relativePath = relativePath.split('/uploads/')[1];
            }
            
            documentPath = path.join(__dirname, '../../uploads', relativePath);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz parametreler'
            });
        }
        
        // Dosya yolunu normalize et ve güvenlik kontrolü yap
        documentPath = path.normalize(documentPath);
        const uploadsDir = path.normalize(path.join(__dirname, '../../uploads'));
        
        // Path traversal kontrolü: dosya uploads klasörü içinde olmalı
        if (!documentPath.startsWith(uploadsDir)) {
            return res.status(403).json({
                success: false,
                message: 'Yetkisiz dosya erişimi'
            });
        }
        
        // Dosyanın var olup olmadığını kontrol et
        if (!fs.existsSync(documentPath)) {
            return res.status(404).json({
                success: false,
                message: 'Dosya bulunamadı'
            });
        }
        
        // Dosya istatistiklerini al
        const stats = fs.statSync(documentPath);
        if (!stats.isFile()) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz dosya'
            });
        }
        
        // Dosya uzantısına göre Content-Type belirle
        const ext = path.extname(documentPath).toLowerCase();
        const contentTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        // Content-Type header'ını set et
        res.setHeader('Content-Type', contentType);
        
        // CORS headers - resimler ve belgeler için cross-origin isteklere izin ver
        const origin = req.headers.origin;
        const allowedOrigins = [
            'http://localhost:5174',
            'http://localhost:5173',
            process.env.CLIENT_URL
        ].filter(Boolean);
        
        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        
        // PDF ve iframe için CSP header'ı ayarla (frame-ancestors)
        if (ext === '.pdf') {
            // PDF dosyaları için frame-ancestors'u ayarla
            res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:5173 http://localhost:5174 " + (process.env.CLIENT_URL || ''));
        }
        
        // İndirme mi yoksa görüntüleme mi?
        const download = req.query.download === 'true';
        
        // Response headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        
        if (download) {
            const filename = path.basename(documentPath);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        } else {
            // PDF ve resimler için inline (tarayıcıda görüntüle)
            if (ext === '.pdf' || ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
                res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(path.basename(documentPath))}"`);
            } else {
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(path.basename(documentPath))}"`);
            }
        }
        
        // Cache headers (opsiyonel)
        res.setHeader('Cache-Control', 'private, max-age=3600');
        
        // Dosyayı stream et
        const fileStream = fs.createReadStream(documentPath);
        fileStream.pipe(res);
        
        fileStream.on('error', (error) => {
            console.error('Dosya okuma hatası:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Dosya okunamadı'
                });
            }
        });
        
    } catch (error) {
        console.error('Belge getirme hatası:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Belge alınamadı',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

/**
 * Belge bilgilerini getir (dosya yolu, boyut, tip vb.)
 * GET /api/documents/info/:basvuruId/:belgeId
 */
const getDocumentInfo = async (req, res) => {
    try {
        const { basvuruId, belgeId } = req.params;
        
        const result = await pool.query(
            `SELECT b.id, b.dosya_yolu, b.durum, b.kullanici_notu, b.admin_notu,
                    bt.ad as belge_adi, bt.kod as belge_kodu
             FROM belgeler b
             JOIN belge_turleri bt ON b.belge_turu_id = bt.id
             WHERE b.basvuru_id = $1 AND b.id = $2`,
            [basvuruId, belgeId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Belge bulunamadı'
            });
        }
        
        const belge = result.rows[0];
        const documentPath = path.join(__dirname, '../../uploads', belge.dosya_yolu);
        
        let fileInfo = null;
        if (fs.existsSync(documentPath)) {
            const stats = fs.statSync(documentPath);
            const ext = path.extname(documentPath).toLowerCase();
            fileInfo = {
                size: stats.size,
                extension: ext,
                modified: stats.mtime
            };
        }
        
        res.json({
            success: true,
            document: {
                id: belge.id,
                name: belge.belge_adi,
                code: belge.belge_kodu,
                status: belge.durum,
                farmerNote: belge.kullanici_notu,
                adminNote: belge.admin_notu,
                fileInfo
            }
        });
    } catch (error) {
        console.error('Belge bilgisi getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Belge bilgisi alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getDocument,
    getDocumentInfo
};

