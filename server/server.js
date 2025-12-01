// Server başlatma dosyası
// ÖNEMLİ: dotenv en başta yüklenmeli
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();

app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // İzin verilen origin'ler
        const allowedOrigins = [
            'http://localhost:5174',
            'http://localhost:5173',
            process.env.CLIENT_URL
        ].filter(Boolean); // undefined değerleri temizle
        
        // Origin yoksa (ör. Postman, mobile app) veya izin verilen listede ise izin ver
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy ile izin verilmedi'));
        }
    },
    credentials: true
    // Bu yarar aynı domainden gelen istekleri kabul etmek için
}));

app.use(morgan('dev')); // Geliştirme için loglama
app.use(express.json()); // şu işe yarar: body parse etmek için
app.use(express.urlencoded({ extended: true }));
// şu işe yarar: form verilerini parse etmek için

//Routes bu işe yarar:
//  API'ların çalışması için bağlantı noktalarını oluşturmak için
app.use('/api/auth', require('./src/routes/authRoutes.js'));
app.use('/api/ciftlik', require('./src/routes/ciftlikRoutes.js'));
app.use('/api/firma', require('./src/routes/firmaRoutes.js'));
app.use('/api/ziraat', require('./src/routes/ziraatRoutes.js'));
app.use('/api/sanayi', require('./src/routes/sanayiRoutes.js'));
app.use('/api/documents', require('./src/routes/documentRoutes.js'));

//HEALTH CHECK şuna yarar: 
// API'ların çalışmasını kontrol etmek için
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timeStamp: new Date().toISOString(),
        database: 'connected'
    });
});

//404 handler şuna yarar:
// Endpoint bulunamadığında 404 hatası döndürmek için
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı',
        path: req.path
    });
});

//Error Handling - EN SONDA OLMALI (tüm route'lardan sonra)
app.use((err, req, res, next) => {
    // Multer hatalarını özel olarak handle et
    if (err instanceof multer.MulterError) {
        console.error('📎 Multer hatası:', {
            code: err.code,
            message: err.message,
            field: err.field,
            path: req.path,
            method: req.method,
            body: req.body,
            hasFiles: !!req.files
        });
        
        // Bazı Multer hataları kritik değil (örn: dosya yok)
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Beklenmeyen dosya alanı',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
                code: err.code
            });
        }
        
        return res.status(400).json({
            success: false,
            message: 'Dosya yükleme hatası',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            code: err.code
        });
    }

    // Diğer hatalar
    console.error('❌ Server hatası:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack,
            path: req.path
        } : undefined
    });
});

//Server başlatma şuna yarar:
// Server'ı başlatmak için

// YesilEksen projesi için sabit port
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});

const pool = new Pool({
   host: process.env.DB_HOST,
   port: process.env.DB_PORT,
   database: process.env.DB_NAME,
   user : process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   max: 20,
   idleTimeoutMillis: 30000, // Bu işe yarar:
   connectionTimeoutMillis: 2000,
  
});

pool.on('connect',()=>{
    console.log('🔗 PostgreSQL bağlantısı başarılı');
});

pool.on('error',(err)=>{
    console.error('🚨 PostgreSQL hatası:', err);
    process.exit(-1); 
    // Bu işe yarar: -1 ile sistemden çıkış yapılır
});
//Query şuna yarar:
// PostgreSQL'e sorgu göndermek için
// Query'nin başarılı olması için:
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('🔍 Query:', { text, duration: `${duration}ms`, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Query hatası:', error);
        throw error;
    }
};

module.exports = {pool,query};