const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');
const { createNotification } = require('../utils/notificationHelper');

//Çiftlik Panel İstatistikleri kısmı

const getPanelStats = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { timeRange = 'ay' } = req.query; // hafta, ay, yil

        //Çiftlik İd'sini bul
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

        const ciftlik_id = ciftlikResult.rows[0].id;

        // Zaman aralığı filtresi için tarih hesaplama
        let dateFilter = '';
        
        if (timeRange === 'hafta') {
            dateFilter = `AND s.olusturma >= NOW() - INTERVAL '7 days'`;
        } else if (timeRange === 'ay') {
            dateFilter = `AND s.olusturma >= NOW() - INTERVAL '1 month'`;
        } else if (timeRange === 'yil') {
            dateFilter = `AND s.olusturma >= NOW() - INTERVAL '1 year'`;
        }

        //Toplam Satış Sayısı (zaman aralığına göre)
        const satisSayisiResult = await pool.query(
            `SELECT COUNT(*) as toplam
             FROM siparisler s
             JOIN urunler u ON s.urun_id = u.id
             WHERE u.ciftlik_id = $1 AND s.durum = 'tamamlandi' ${dateFilter}`,
            [ciftlik_id]
        );

        //Bekleyen Onay Sayısı
        const bekleyenOnayResult = await pool.query(
            `SELECT COUNT(DISTINCT t.id) as bekleyen 
             FROM teklifler t 
             JOIN urunler u ON t.urun_id = u.id 
             WHERE u.ciftlik_id = $1 AND t.durum = 'beklemede'`,
            [ciftlik_id]
        );

        //Aktif Ürün Sayısı
        // Not: urunler tablosunda durum değerleri: 'aktif', 'stokta' (satışta olan ürünler)
        const aktifUrunResult = await pool.query(
            `SELECT COUNT(*) as aktif FROM urunler WHERE ciftlik_id = $1 AND durum IN ('aktif', 'stokta')`,
            [ciftlik_id]
        );

        //Toplam Gelir (zaman aralığına göre)
        // Not: siparisler tablosunda toplam_tutar yerine genel_toplam kullanılıyor
        const toplamGelirResult = await pool.query(
            `SELECT COALESCE(SUM(s.fiyat), 0) as toplam_gelir
             FROM siparisler s
             JOIN urunler u ON s.urun_id = u.id
             WHERE u.ciftlik_id = $1 AND s.durum = 'tamamlandi' ${dateFilter}`,
            [ciftlik_id]
        );

        res.json({
            success: true,
            stats: {
                toplamSatis: parseInt(satisSayisiResult.rows[0].toplam) || 0,
                bekleyenOnay: parseInt(bekleyenOnayResult.rows[0].bekleyen) || 0,
                aktifUrun: parseInt(aktifUrunResult.rows[0].aktif) || 0,
                toplamGelir: parseFloat(toplamGelirResult.rows[0].toplam_gelir) || 0
            }
        });

    } catch (error) {
        console.error('❌ Panel stats hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: 'İstatistikler alınamadı',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};


//Ürünlerim Listesi 
//GET /api/ciftlik/urunler

const getMyProducts = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { page = 1, limit = 6, kategori,
            durum, search } = req.query;

        const offset = (page - 1) * limit;

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
        const ciftlik_id = ciftlikResult.rows[0].id;

        // Query oluştur
        let queryText = `
            SELECT 
                u.id,
                u.baslik,
                u.aciklama,
                u.miktar,
                b.kod as birim,
                u.fiyat,
                uk.ad as kategori,
                u.durum,
                u.olusturma,
                COUNT(t.id) as teklif_sayisi,
                (SELECT ur.resim_url 
                 FROM urun_resimleri ur 
                 WHERE ur.urun_id = u.id AND ur.ana_resim = TRUE 
                 LIMIT 1) as resim_url
            FROM urunler u
            LEFT JOIN teklifler t ON u.id = t.urun_id
            LEFT JOIN birimler b ON u.birim_id = b.id
            LEFT JOIN urun_kategorileri uk ON u.kategori_id = uk.id
            WHERE u.ciftlik_id = $1 AND u.durum != 'silindi'
        `;
        const queryParams = [ciftlik_id];
        let paramIndex = 2;
        if (kategori) {
            queryText += ` AND EXISTS (SELECT 1 FROM urun_kategorileri uk WHERE uk.id = u.kategori_id AND uk.ad = $${paramIndex})`;
            queryParams.push(kategori);
            paramIndex++;
        }

        if (durum) {
            // 'aktif' durumu için hem 'aktif' hem 'stokta' durumundaki ürünleri getir
            if (durum === 'aktif') {
                queryText += ` AND u.durum IN ('aktif', 'stokta')`;
            } else {
                queryText += ` AND u.durum = $${paramIndex}`;
                queryParams.push(durum);
                paramIndex++;
            }
        }

        if (search) {
            queryText += ` AND (u.baslik ILIKE $${paramIndex} OR u.aciklama ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        queryText += ` GROUP BY u.id, u.baslik, u.aciklama, u.miktar, b.kod, u.fiyat, uk.ad, u.durum, u.olusturma, u.kategori_id, u.birim_id ORDER BY u.olusturma DESC`;
        queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(queryText, queryParams);


        //Toplam Sayı
        // Not: urunler tablosunda kategori kolonu yok, kategori_id var ve JOIN ile alınmalı
        let countQuery = `SELECT COUNT(*) FROM urunler u WHERE u.ciftlik_id = $1 AND u.durum != 'silindi'`;
        const countParams = [ciftlik_id];
        let countIndex = 2;
        if (kategori) {
            countQuery += ` AND EXISTS (SELECT 1 FROM urun_kategorileri uk WHERE uk.id = u.kategori_id AND uk.ad = $${countIndex})`;
            countParams.push(kategori);
            countIndex++;
        }

        if (durum) {
            // 'aktif' durumu için hem 'aktif' hem 'stokta' durumundaki ürünleri say
            if (durum === 'aktif') {
                countQuery += ` AND u.durum IN ('aktif', 'stokta')`;
            } else {
                countQuery += ` AND u.durum = $${countIndex}`;
                countParams.push(durum);
                countIndex++;
            }
        }

        if (search) {
            countQuery += ` AND (u.baslik ILIKE $${countIndex} OR u.aciklama ILIKE $${countIndex})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);
        res.json({
            success: true,
            products: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('❌ Ürünler hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: 'Ürünler alınamadı',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};


//Yeni Ürün Ekleme

const addProduct = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { title, miktar, price, category, desc, birim = 'kg' } = req.body;

        // Validasyon
        if (!title || !miktar || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Gerekli alanları doldurunuz'
            });
        }

        //Çiftlik id'sini bul
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
        const ciftlik_id = ciftlikResult.rows[0].id;

        // Kategori ID'sini bul veya oluştur
        const kategoriResult = await pool.query(
            `SELECT id FROM urun_kategorileri WHERE ad = $1 OR kod = $2 LIMIT 1`,
            [category, category.toUpperCase().replace(/\s+/g, '_')]
        );
        let kategori_id;
        if (kategoriResult.rows.length > 0) {
            kategori_id = kategoriResult.rows[0].id;
        } else {
            // Kategori yoksa oluştur
            const newKategoriResult = await pool.query(
                `INSERT INTO urun_kategorileri (kod, ad, aktif) 
                VALUES ($1, $2, TRUE) 
                RETURNING id`,
                [category.toUpperCase().replace(/\s+/g, '_'), category]
            );
            kategori_id = newKategoriResult.rows[0].id;
        }

        // Birim ID'sini bul veya oluştur
        const birimResult = await pool.query(
            `SELECT id FROM birimler WHERE kod = $1 LIMIT 1`,
            [birim]
        );
        let birim_id;
        if (birimResult.rows.length > 0) {
            birim_id = birimResult.rows[0].id;
        } else {
            // Birim yoksa oluştur
            const birimAd = birim === 'ton' ? 'Ton' : birim === 'kg' ? 'Kilogram' : birim === 'm3' ? 'Metreküp' : birim === 'litre' ? 'Litre' : birim;
            const birimSembol = birim === 'ton' ? 'ton' : birim === 'kg' ? 'kg' : birim === 'm3' ? 'm³' : birim === 'litre' ? 'lt' : birim;
            const birimTur = (birim === 'ton' || birim === 'kg') ? 'agirlik' : 'hacim';
            const newBirimResult = await pool.query(
                `INSERT INTO birimler (kod, ad, sembol, tur) 
                VALUES ($1, $2, $3, $4) 
                RETURNING id`,
                [birim, birimAd, birimSembol, birimTur]
            );
            birim_id = newBirimResult.rows[0].id;
        }

        // Ürün oluştur (gerçek kolonlar - kategori_id, birim_id, ad zorunlu)
        const result = await pool.query(
            `INSERT INTO urunler 
            (ciftlik_id, kategori_id, ad, baslik, aciklama, birim_id, mevcut_miktar, miktar, birim_fiyat, fiyat, birim, kategori, durum)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'aktif')
            RETURNING *`,
            [
                ciftlik_id,
                kategori_id,        // kategori_id (UUID referans) - ZORUNLU
                title,              // ad kolonu - ZORUNLU
                title,              // baslik kolonu (bağımsız)
                desc,               // aciklama
                birim_id,           // birim_id (UUID referans) - ZORUNLU
                parseFloat(miktar), // mevcut_miktar
                parseFloat(miktar), // miktar (bağımsız)
                parseFloat(price),  // birim_fiyat
                parseFloat(price),  // fiyat (bağımsız)
                birim,              // birim (string: ton, kg, m3, litre)
                category            // kategori (string)
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Ürün başarıyla eklendi',
            product: result.rows[0]
        });

    } catch (error) {
        console.error('Add product hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün eklenemedi'
        });
    }
};

// Atık türleri (frontend ile uyumlu)
const wasteTypes = [
    { value: 'hayvansal-gubre', label: 'Hayvansal Gübre' },
    { value: 'misir-sapi', label: 'Mısır Sapı' },
    { value: 'bugday-samani', label: 'Buğday Samanı' },
    { value: 'aycicegi-sapi', label: 'Ayçiçeği Sapı' },
    { value: 'pamuk-atik', label: 'Pamuk Atığı' },
    { value: 'zeytin-karasuyu', label: 'Zeytin Karasuyu' },
    { value: 'sebze-atiklari', label: 'Sebze Atıkları' },
    { value: 'arpa-samani', label: 'Arpa Samanı' },
    { value: 'yonca-atik', label: 'Yonca Atığı' },
    { value: 'pirinc-kabugu', label: 'Pirinç Kabuğu' },
    { value: 'meyve-atiklari', label: 'Meyve Atıkları' },
    { value: 'tavuk-gubresi', label: 'Tavuk Gübresi' },
    { value: 'sigir-gubresi', label: 'Sığır Gübresi' },
    { value: 'koyun-gubresi', label: 'Koyun Gübresi' },
    { value: 'odun-talasi', label: 'Odun Talaşı' },
    { value: 'findik-kabugu', label: 'Fındık Kabuğu' },
    { value: 'ceviz-kabugu', label: 'Ceviz Kabuğu' },
    { value: 'diger', label: 'Diğer (Manuel Giriş)' }
];

// Atık/Ürün Ekleme (Belgelerle birlikte)
const addWasteProduct = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.user.id;
        const { atikTuru, miktar, birim, isAnalyzed, hasGuarantee } = req.body;

        // Validasyon
        if (!atikTuru || !miktar || !birim) {
            return res.status(400).json({
                success: false,
                message: 'Gerekli alanları doldurunuz (atık türü, miktar, birim)'
            });
        }

        // Dosya kontrolü
        if (!req.files || !req.files.productPhoto || !req.files.originDocument) {
            return res.status(400).json({
                success: false,
                message: 'Ürün fotoğrafı ve menşei belgesi zorunludur'
            });
        }

        // Analizli ürün için analiz raporu kontrolü
        if (isAnalyzed === 'true' && !req.files.analysisReport) {
            return res.status(400).json({
                success: false,
                message: 'Analizli ürün için laboratuvar analiz raporu gereklidir'
            });
        }

        // Garanti içerikli ürün için garanti belgesi kontrolü
        if (hasGuarantee === 'true' && !req.files.guaranteeDocument) {
            return res.status(400).json({
                success: false,
                message: 'Garanti içerikli ürün için garanti belgesi gereklidir'
            });
        }

        // Çiftlik ID'sini al (middleware'den geliyor)
        const ciftlik_id = req.ciftlik_id;
        if (!ciftlik_id) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik bulunamadı'
            });
        }

        await client.query('BEGIN');

        // Base URL oluştur (mutlak URL için)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Dosya yollarını kaydet - User ID'sine göre tam yol (sertifika mantığı gibi)
        const uploadsDir = path.join(__dirname, '../../uploads');
        
        // Dosya yollarını oluştur - Relative path (farmer/{user_id}/ formatında) ve mutlak URL
        const getFullPath = (file) => {
            if (!file) return { relativePath: null, absoluteUrl: null };
            
            // Multer disk storage kullanıyorsa file.path var
            if (file.path) {
                // Dosya zaten farmer/{user_id}/ klasörüne kaydedilmiş
                // Tam relative path'i al (uploads klasöründen itibaren)
                const relativePath = path.relative(uploadsDir, file.path).replace(/\\/g, '/');
                // Path formatı: farmer/{user_id}/{filename}
                // Mutlak URL oluştur
                const absoluteUrl = `${baseUrl}/uploads/${relativePath}`;
                return { relativePath, absoluteUrl };
            } else if (file.buffer) {
                // Eğer buffer varsa (memory storage), farmer/{user_id}/ klasörüne kaydet
                const farmerDir = path.join(uploadsDir, 'farmer', user_id.toString());
                if (!fs.existsSync(farmerDir)) {
                    fs.mkdirSync(farmerDir, { recursive: true });
                }
                const timestamp = Date.now();
                const ext = path.extname(file.originalname);
                const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
                const filename = `${timestamp}-${sanitizedName}`;
                const filePath = path.join(farmerDir, filename);
                fs.writeFileSync(filePath, file.buffer);
                const relativePath = `farmer/${user_id}/${filename}`;
                const absoluteUrl = `${baseUrl}/uploads/${relativePath}`;
                return { relativePath, absoluteUrl };
            }
            return { relativePath: null, absoluteUrl: null };
        };

        const productPhoto = getFullPath(Array.isArray(req.files.productPhoto) ? req.files.productPhoto[0] : req.files.productPhoto);
        const originDocument = getFullPath(Array.isArray(req.files.originDocument) ? req.files.originDocument[0] : req.files.originDocument);
        const analysisReport = req.files.analysisReport ? getFullPath(Array.isArray(req.files.analysisReport) ? req.files.analysisReport[0] : req.files.analysisReport) : { relativePath: null, absoluteUrl: null };
        const guaranteeDocument = req.files.guaranteeDocument ? getFullPath(Array.isArray(req.files.guaranteeDocument) ? req.files.guaranteeDocument[0] : req.files.guaranteeDocument) : { relativePath: null, absoluteUrl: null };

        // Ek fotoğraf (tek dosya)
        const additionalPhoto = req.files.additionalPhoto ? getFullPath(Array.isArray(req.files.additionalPhoto) ? req.files.additionalPhoto[0] : req.files.additionalPhoto) : { relativePath: null, absoluteUrl: null };

        // Kalite sertifikası (tek dosya)
        const qualityCertificate = req.files.qualityCertificate ? getFullPath(Array.isArray(req.files.qualityCertificate) ? req.files.qualityCertificate[0] : req.files.qualityCertificate) : { relativePath: null, absoluteUrl: null };

        // Atık türü bilgisini al
        // Eğer atikTuru wasteTypes'da yoksa, bu "Diğer" atık türü için manuel girilen addır
        const selectedWaste = wasteTypes.find(w => w.value === atikTuru);
        // Diğer atık türü için atikTuru direkt kullanılır (customWasteName frontend'den gelir)
        const baslik = selectedWaste ? selectedWaste.label : atikTuru;
        
        // Kategori ID'sini bul (Çiftlik Atıkları için)
        const kategoriResult = await client.query(
            `SELECT id FROM urun_kategorileri WHERE kod = 'ATIK' OR ad = 'Çiftlik Atıkları' LIMIT 1`
        );
        let kategori_id;
        if (kategoriResult.rows.length > 0) {
            kategori_id = kategoriResult.rows[0].id;
        } else {
            // Kategori yoksa oluştur
            const newKategoriResult = await client.query(
                `INSERT INTO urun_kategorileri (kod, ad, aktif) 
                VALUES ('ATIK', 'Çiftlik Atıkları', TRUE) 
                RETURNING id`
            );
            kategori_id = newKategoriResult.rows[0].id;
        }

        // Birim ID'sini bul
        const birimResult = await client.query(
            `SELECT id FROM birimler WHERE kod = $1 LIMIT 1`,
            [birim]
        );
        let birim_id;
        if (birimResult.rows.length > 0) {
            birim_id = birimResult.rows[0].id;
        } else {
            // Birim yoksa oluştur
            const birimAd = birim === 'ton' ? 'Ton' : birim === 'kg' ? 'Kilogram' : birim === 'm3' ? 'Metreküp' : birim === 'litre' ? 'Litre' : birim;
            const birimSembol = birim === 'ton' ? 'ton' : birim === 'kg' ? 'kg' : birim === 'm3' ? 'm³' : birim === 'litre' ? 'lt' : birim;
            const birimTur = (birim === 'ton' || birim === 'kg') ? 'agirlik' : 'hacim';
            const newBirimResult = await client.query(
                `INSERT INTO birimler (kod, ad, sembol, tur) 
                VALUES ($1, $2, $3, $4) 
                RETURNING id`,
                [birim, birimAd, birimSembol, birimTur]
            );
            birim_id = newBirimResult.rows[0].id;
        }

        // Kategori string değerini al
        const kategoriString = 'Çiftlik Atıkları';
        
        // Birim string değerini al (kod'dan)
        const birimString = birim;

        // Kullanıcı bilgilerini al (basvuran_adi için)
        const userResult = await client.query(
            `SELECT ad, soyad FROM kullanicilar WHERE id = $1`,
            [user_id]
        );
        const basvuranAdi = userResult.rows.length > 0 
            ? `${userResult.rows[0].ad} ${userResult.rows[0].soyad}`.trim()
            : 'Bilinmeyen Kullanıcı';

        // Ürün oluştur (gerçek kolonlar - alias mantığı yok)
        const productResult = await client.query(
            `INSERT INTO urunler 
            (ciftlik_id, kategori_id, ad, baslik, aciklama, birim_id, mevcut_miktar, miktar, birim_fiyat, fiyat, birim, kategori, durum)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'onay_bekliyor')
            RETURNING *`,
            [
                ciftlik_id,
                kategori_id,        // kategori_id (UUID referans)
                baslik,              // ad kolonu
                baslik,              // baslik kolonu (bağımsız)
                `Atık Türü: ${baslik}, Miktar: ${miktar} ${birim}`,
                birim_id,            // birim_id (UUID referans)
                parseFloat(miktar),   // mevcut_miktar
                parseFloat(miktar),   // miktar (bağımsız)
                0,                    // birim_fiyat (Fiyat teklif sonrası belirlenir)
                0,                    // fiyat (bağımsız)
                birimString,          // birim (string: ton, kg, m3, litre)
                kategoriString        // kategori (string: Çiftlik Atıkları)
            ]
        );

        const productId = productResult.rows[0].id;

        // Ürün başvurusu oluştur (urun_basvurulari tablosuna)
        const basvuruResult = await client.query(
            `INSERT INTO urun_basvurulari
            (urun_id, ciftlik_id, basvuran_adi, urun_adi, kategori_id, durum)
            VALUES ($1, $2, $3, $4, $5, 'incelemede')
            RETURNING id`,
            [
                productId,
                ciftlik_id,
                basvuranAdi,
                baslik,
                kategori_id
            ]
        );

        const basvuruId = basvuruResult.rows[0].id;

        // Ürün fotoğrafını urun_resimleri tablosuna kaydet (mutlak URL)
        if (productPhoto.absoluteUrl) {
            await client.query(
                `INSERT INTO urun_resimleri (urun_id, resim_url, sira_no, ana_resim)
                VALUES ($1, $2, 1, TRUE)`,
                [productId, productPhoto.absoluteUrl]
            );
        }

        // Ek fotoğrafı kaydet (mutlak URL)
        if (additionalPhoto.absoluteUrl) {
            await client.query(
                `INSERT INTO urun_resimleri (urun_id, resim_url, sira_no, ana_resim)
                VALUES ($1, $2, 2, FALSE)`,
                [productId, additionalPhoto.absoluteUrl]
            );
        }

        // Kalite sertifikasını urun_sertifikalari tablosuna kaydet (mutlak URL)
        if (qualityCertificate.absoluteUrl) {
            // Sertifika türü ID'sini bul (varsayılan olarak ORGANIK)
            const sertifikaTuruResult = await client.query(
                `SELECT id FROM sertifika_turleri WHERE kod = 'ORGANIK' LIMIT 1`
            );
            let sertifikaTuruId = null;
            if (sertifikaTuruResult.rows.length > 0) {
                sertifikaTuruId = sertifikaTuruResult.rows[0].id;
            }

            await client.query(
                `INSERT INTO urun_sertifikalari (urun_id, sertifika_turu_id, dosya_url)
                VALUES ($1, $2, $3)`,
                [productId, sertifikaTuruId, qualityCertificate.absoluteUrl]
            );
        }

        // Belge türü kodları ve dosya adları
        const belgeTypes = {
            'originDocument': { kod: 'ciftci_kutugu', ad: 'Menşei Belgesi (ÇKS / İşletme Tescil)', file: req.files.originDocument[0], pathInfo: originDocument },
            'analysisReport': { kod: 'analiz_raporu', ad: 'Laboratuvar Analiz Raporu', file: req.files.analysisReport ? req.files.analysisReport[0] : null, pathInfo: analysisReport },
            'guaranteeDocument': { kod: 'garanti_belgesi', ad: 'Garanti Belgesi / Analiz Raporu', file: req.files.guaranteeDocument ? req.files.guaranteeDocument[0] : null, pathInfo: guaranteeDocument }
        };

        // Belge kaydetme helper fonksiyonu (mutlak URL kaydeder)
        const saveBelge = async (belgeKod, belgeAd, pathInfo, dosya, basvuruIdParam) => {
            // Belge türü ID'sini bul (kod'a göre)
            const belgeTuruResult = await client.query(
                `SELECT id FROM belge_turleri WHERE kod = $1`,
                [belgeKod]
            );
            
            let belgeTuruId;
            if (belgeTuruResult.rows.length > 0) {
                belgeTuruId = belgeTuruResult.rows[0].id;
            } else {
                // Belge türü yoksa oluştur
                const newBelgeTuruResult = await client.query(
                    `INSERT INTO belge_turleri (kod, ad, zorunlu, aktif)
                    VALUES ($1, $2, $3, TRUE)
                    RETURNING id`,
                    [belgeKod, belgeAd, false] // Opsiyonel belgeler için zorunlu=false
                );
                belgeTuruId = newBelgeTuruResult.rows[0].id;
            }

            // Belgeyi kaydet (mutlak URL kullan)
            if (!pathInfo || !pathInfo.absoluteUrl) {
                return; // Dosya yoksa kaydetme
            }
            
            await client.query(
                `INSERT INTO belgeler 
                (kullanici_id, ciftlik_id, basvuru_id, basvuru_tipi, belge_turu_id, ad, dosya_yolu, dosya_boyutu, dosya_tipi, durum, yuklenme)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'beklemede', NOW())`,
                [
                    user_id,
                    ciftlik_id,
                    basvuruIdParam, // basvuru_id (urun_basvurulari.id)
                    'urun_basvurusu', // basvuru_tipi
                    belgeTuruId,
                    belgeAd,
                    pathInfo.absoluteUrl, // Mutlak URL kaydet
                    dosya ? dosya.size : null,
                    dosya ? path.extname(dosya.originalname).substring(1).toLowerCase() : null
                ]
            );
        };

        // Menşei belgesi (zorunlu)
        await saveBelge(
            belgeTypes.originDocument.kod,
            belgeTypes.originDocument.ad,
            belgeTypes.originDocument.pathInfo,
            belgeTypes.originDocument.file,
            basvuruId
        );

        // Analiz raporu (varsa)
        if (analysisReport.absoluteUrl && belgeTypes.analysisReport.file) {
            await saveBelge(
                belgeTypes.analysisReport.kod,
                belgeTypes.analysisReport.ad,
                belgeTypes.analysisReport.pathInfo,
                belgeTypes.analysisReport.file,
                basvuruId
            );
        }

        // Garanti belgesi (varsa)
        if (guaranteeDocument.absoluteUrl && belgeTypes.guaranteeDocument.file) {
            await saveBelge(
                belgeTypes.guaranteeDocument.kod,
                belgeTypes.guaranteeDocument.ad,
                belgeTypes.guaranteeDocument.pathInfo,
                belgeTypes.guaranteeDocument.file,
                basvuruId
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Ürün başarıyla eklendi ve onay sürecine gönderildi',
            productId: productId,
            basvuruId: basvuruId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Add waste product hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün eklenirken bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Tarih formatlama helper
const formatRelativeTime = (date) => {
    try {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return 'Az önce';
        } else if (minutes < 60) {
            return `${minutes} dakika önce`;
        } else if (hours < 24) {
            return `${hours} saat önce`;
        } else if (days === 1) {
            return 'Dün';
        } else if (days < 7) {
            return `${days} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    } catch (error) {
        return date.toLocaleDateString('tr-TR');
    }
};

// Ürün Başvuru Durumlarını Getir - GET /api/ciftlik/urun-basvurulari
const getMyProductApplications = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Çiftlik ID'sini bul
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

        const ciftlik_id = ciftlikResult.rows[0].id;

        // Ürün başvurularını getir
        const basvurularResult = await pool.query(
            `SELECT 
                ub.id,
                ub.urun_id,
                ub.urun_adi as product,
                ub.basvuran_adi,
                ub.durum,
                ub.basvuru_tarihi as "submittedAt",
                ub.guncelleme as "lastUpdate",
                ub.notlar as "adminNotes",
                ub.red_nedeni,
                uk.ad as category
            FROM urun_basvurulari ub
            LEFT JOIN urun_kategorileri uk ON ub.kategori_id = uk.id
            WHERE ub.ciftlik_id = $1
            ORDER BY ub.basvuru_tarihi DESC`,
            [ciftlik_id]
        );

        // Her başvuru için tüm belgeleri getir
        const applications = await Promise.all(basvurularResult.rows.map(async (row) => {
            const documents = [];

            // Belgeler tablosundan belgeler
            const belgelerResult = await pool.query(
                `SELECT 
                    COALESCE(bt.ad, b.ad, 'Belge') as name,
                    CASE 
                        WHEN b.durum = 'onaylandi' THEN 'Onaylandı'
                        WHEN b.durum = 'reddedildi' THEN 'Reddedildi'
                        WHEN b.durum = 'eksik' THEN 'Eksik'
                        WHEN b.durum = 'gcbelge' THEN 'Güncel Belge'
                        WHEN b.durum = 'yuklendi' OR b.durum = 'beklemede' THEN 'Beklemede'
                        ELSE 'Beklemede'
                    END as status,
                    b.dosya_yolu as url,
                    b.id::text as "belgeId",
                    COALESCE(b.yonetici_notu, '') as "adminNote"
                FROM belgeler b
                LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                WHERE b.basvuru_id = $1 AND b.basvuru_tipi = 'urun_basvurusu'
                ORDER BY COALESCE(bt.ad, b.ad, '')`,
                [row.id]
            );
            documents.push(...belgelerResult.rows);

            // Ürün resimleri (Ürün Fotoğrafı ve Ek Fotoğraf)
            if (row.urun_id) {
                const resimlerResult = await pool.query(
                    `SELECT 
                        CASE 
                            WHEN ur.ana_resim = TRUE THEN 'Ürün Fotoğrafı'
                            ELSE 'Ek Fotoğraf'
                        END as name,
                        'Beklemede' as status,
                        ur.resim_url as url,
                        ur.id::text as "belgeId",
                        '' as "adminNote"
                    FROM urun_resimleri ur
                    WHERE ur.urun_id = $1
                    ORDER BY ur.sira_no`,
                    [row.urun_id]
                );
                documents.push(...resimlerResult.rows);

                // Ürün sertifikaları (Kalite Sertifikası)
                const sertifikalarResult = await pool.query(
                    `SELECT 
                        COALESCE(st.ad, 'Kalite Sertifikası') as name,
                        'Beklemede' as status,
                        us.dosya_url as url,
                        us.id::text as "belgeId",
                        '' as "adminNote"
                    FROM urun_sertifikalari us
                    LEFT JOIN sertifika_turleri st ON us.sertifika_turu_id = st.id
                    WHERE us.urun_id = $1`,
                    [row.urun_id]
                );
                documents.push(...sertifikalarResult.rows);
            }

            return {
                ...row,
                documents: documents
            };
        }));

        // Durumları frontend formatına çevir
        const formattedApplications = applications.map(row => {
            let status = 'İncelemede';
            if (row.durum === 'onaylandi') status = 'Onaylandı';
            else if (row.durum === 'revizyon') status = 'Revizyon';
            else if (row.durum === 'reddedildi') status = 'Reddedildi';
            else if (row.durum === 'incelemede') status = 'İncelemede';

            // Tarih formatla
            const submittedAt = row.submittedAt ? new Date(row.submittedAt).toISOString().split('T')[0] : '';
            const lastUpdate = row.lastUpdate ? formatRelativeTime(new Date(row.lastUpdate)) : '';

            return {
                id: row.id,
                product: row.product,
                category: row.category || 'Çiftlik Atıkları',
                status: status,
                submittedAt: submittedAt,
                lastUpdate: lastUpdate,
                adminNotes: row.adminNotes || row.red_nedeni || '',
                documents: row.documents || []
            };
        });

        res.json({
            success: true,
            applications: formattedApplications
        });

    } catch (error) {
        console.error('❌ Get product applications hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Başvurular alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//Ürün Güncelleme
const updateProduct = async (req, res) => {
    try {
        const user_id = req.user.id;
        const productId = req.params.id;
        const { title, miktar, price, category, desc, birim, durum } = req.body;

        //çiftlik id'sini bul
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
        const ciftlik_id = ciftlikResult.rows[0].id;

        //Ürün bu çiftliğe mi ait kontrol et 
        const productCheck = await pool.query('SELECT id FROM urunler WHERE id = $1 AND ciftlik_id = $2', [productId, ciftlik_id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı veya çiftliğinize ait değil'
            });
        }

        //Ürünü güncelle
        const result = await pool.query(
            `UPDATE urunler 
            SET ad = COALESCE($1, ad),
                baslik = COALESCE($1, baslik),
                aciklama = COALESCE($2, aciklama),
                mevcut_miktar = COALESCE($3, mevcut_miktar),
                miktar = COALESCE($3, miktar),
                birim = COALESCE($4, birim),
                birim_fiyat = COALESCE($5, birim_fiyat),
                fiyat = COALESCE($5, fiyat),
                kategori = COALESCE($6, kategori),
                durum = COALESCE($7, durum),
                guncelleme = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *`,
            [title, desc, miktar, birim, price, category, durum, productId]
        );

        res.json({
            success: true,
            message: 'Ürün başarıyla güncellendi',
            product: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Update product hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: 'Ürün güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};

//Ürün Silme
const deleteProduct = async (req, res) => {
    try {
        const user_id = req.user.id;
        const productId = req.params.id;

        //çiftlik id'sini bul
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
        const ciftlik_id = ciftlikResult.rows[0].id;

        //Ürünü soft delete yap (durum = 'silindi')
        await pool.query(
            `UPDATE urunler 
            SET durum = 'silindi', 
                guncelleme_tarihi = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [productId]
        );

        res.json({
            success: true,
            message: 'Ürün başarıyla silindi'
        });

    } catch (error) {
        console.error('❌ Delete product hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: 'Ürün silinemedi',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};
// Bekleyen Onaylar (Teklifler)
const getPendingOffers = async (req, res) => {
    try {
        const user_id = req.user.id;

        //Çiftlik İd'sini bul
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

        const ciftlik_id = ciftlikResult.rows[0].id;

        // Bekleyen teklifleri getir
        const tekliflerResult = await pool.query(
            `SELECT 
                t.id,
                u.baslik as urun,
                t.miktar,
                t.birim_fiyat,
                t.toplam_fiyat as teklif_fiyat,
                f.ad as alici,
                t.olusturma as tarih,
                t.son_gecerlilik_tarihi
            FROM teklifler t
            JOIN urunler u ON t.urun_id = u.id
            JOIN firmalar f ON t.firma_id = f.id
            WHERE u.ciftlik_id = $1 AND t.durum = 'beklemede'
            ORDER BY t.olusturma DESC
            LIMIT 10`,
            [ciftlik_id]
        );

        // Tarih formatlama ve kalan süre hesaplama
        const formattedOffers = tekliflerResult.rows.map(offer => {
            const tarih = new Date(offer.tarih);
            const simdi = new Date();
            const fark = Math.floor((simdi - tarih) / (1000 * 60 * 60)); // saat cinsinden

            let tarihText = '';
            if (fark < 1) {
                tarihText = 'Az önce';
            } else if (fark < 24) {
                tarihText = `${fark} saat önce`;
            } else {
                const gun = Math.floor(fark / 24);
                tarihText = `${gun} gün önce`;
            }

            // Kalan süre hesaplama
            let kalanSure = '';
            if (offer.son_gecerlilik_tarihi) {
                const sonTarih = new Date(offer.son_gecerlilik_tarihi);
                const kalanGun = Math.ceil((sonTarih - simdi) / (1000 * 60 * 60 * 24));
                if (kalanGun > 0) {
                    kalanSure = `${kalanGun} gün kaldı`;
                } else {
                    kalanSure = 'Süresi doldu';
                }
            }

            return {
                id: offer.id,
                urun: offer.urun,
                miktar: `${parseFloat(offer.miktar).toLocaleString('tr-TR')} Ton`,
                teklifFiyat: `${parseFloat(offer.teklif_fiyat).toLocaleString('tr-TR')} ₺`,
                birimFiyat: `${parseFloat(offer.birim_fiyat).toLocaleString('tr-TR')} ₺ / ton`,
                alici: offer.alici,
                tarih: tarihText,
                sure: kalanSure || 'Belirtilmemiş'
            };
        });

        res.json({
            success: true,
            offers: formattedOffers
        });

    } catch (error) {
        console.error('❌ Bekleyen onaylar hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: 'Bekleyen onaylar alınamadı',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};

// Son Satışlar
const getRecentSales = async (req, res) => {
    try {
        const user_id = req.user.id;

        //Çiftlik İd'sini bul
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

        const ciftlik_id = ciftlikResult.rows[0].id;

        // Son satışları getir
        const satislarResult = await pool.query(
            `SELECT 
                s.id,
                s.siparis_no,
                u.baslik as urun,
                s.miktar,
                s.birim_fiyat,
                s.fiyat,
                s.durum,
                f.ad as alici,
                s.olusturma as tarih
            FROM siparisler s
            JOIN urunler u ON s.urun_id = u.id
            JOIN firmalar f ON s.firma_id = f.id
            WHERE u.ciftlik_id = $1 AND s.durum IN ('tamamlandi', 'kargoda', 'hazirlaniyor')
            ORDER BY s.olusturma DESC
            LIMIT 10`,
            [ciftlik_id]
        );

        // Durum mapping ve tarih formatlama
        const durumMap = {
            'tamamlandi': { text: 'Tamamlandı', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            'kargoda': { text: 'Kargoda', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
            'hazirlaniyor': { text: 'Hazırlanıyor', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
        };

        const formattedSales = satislarResult.rows.map(sale => {
            const tarih = new Date(sale.tarih);
            const simdi = new Date();
            const fark = Math.floor((simdi - tarih) / (1000 * 60 * 60)); // saat cinsinden

            let tarihText = '';
            if (fark < 1) {
                tarihText = 'Az önce';
            } else if (fark < 24) {
                tarihText = `${fark} saat önce`;
            } else {
                const gun = Math.floor(fark / 24);
                if (gun === 1) {
                    tarihText = '1 gün önce';
                } else {
                    tarihText = `${gun} gün önce`;
                }
            }

            const durumInfo = durumMap[sale.durum] || { text: sale.durum, class: '' };

            return {
                id: sale.id,
                siparisNo: sale.siparis_no,
                urun: sale.urun,
                miktar: `${parseFloat(sale.miktar).toLocaleString('tr-TR')} Ton`,
                fiyat: `${parseFloat(sale.fiyat).toLocaleString('tr-TR')} ₺`,
                durum: durumInfo.text,
                durumClass: durumInfo.class,
                alici: sale.alici,
                tarih: tarihText
            };
        });

        res.json({
            success: true,
            sales: formattedSales
        });

    } catch (error) {
        console.error('❌ Son satışlar hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: 'Son satışlar alınamadı',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};

// Çiftlik Profil Bilgilerini Getir
// GET /api/ciftlik/profil
const getCiftlikProfil = async (req, res) => {
    try {
        const user_id = req.user.id;
        console.log('📋 Çiftlik profil isteği alındı, user_id:', user_id);

        // Çiftlik bilgilerini getir
        // logo_url kolonu kullanılıyor (website kolonu rename edildi)
        // Migration çalıştırıldıysa logo_url, çalıştırılmadıysa website kullanılır
        let ciftlikResult;
        try {
            // Önce logo_url kolonunu kullanmayı dene (migration çalıştırılmışsa)
            ciftlikResult = await pool.query(
                `SELECT 
                    c.id,
                    c.ad,
                    k.telefon,
                    c.adres,
                    c.alan,
                    c.kayit_tarihi,
                    c.urun_tur,
                    c.hakkimizda,
                    COALESCE(c.logo_url, '') as logo_url,
                    c.durum,
                    c.sehir_adi,
                    c.enlem,
                    c.boylam,
                    c.yillik_gelir,
                    c.uretim_kapasitesi,
                    k.ad as sahibi_ad,
                    k.soyad as sahibi_soyad,
                    k.eposta as email
                FROM ciftlikler c
                JOIN kullanicilar k ON c.kullanici_id = k.id
                WHERE c.kullanici_id = $1 AND c.silinme IS NULL`,
                [user_id]
            );
        } catch (queryError) {
            // Eğer logo_url kolonu yoksa (migration çalıştırılmamışsa), website kolonunu kullan
            if (queryError.message && (queryError.message.includes('logo_url') || queryError.code === '42703')) {
                console.warn('⚠️ logo_url kolonu bulunamadı, website kolonu kullanılıyor (migration çalıştırılmamış)...');
                ciftlikResult = await pool.query(
                    `SELECT 
                        c.id,
                        c.ad,
                        k.telefon,
                        c.adres,
                        c.alan,
                        c.kayit_tarihi,
                        c.urun_tur,
                        c.hakkimizda,
                        COALESCE(c.website, '') as logo_url,
                        c.durum,
                        c.sehir_adi,
                        c.enlem,
                        c.boylam,
                        c.yillik_gelir,
                        c.uretim_kapasitesi,
                        k.ad as sahibi_ad,
                        k.soyad as sahibi_soyad,
                        k.eposta as email
                    FROM ciftlikler c
                    JOIN kullanicilar k ON c.kullanici_id = k.id
                    WHERE c.kullanici_id = $1 AND c.silinme IS NULL`,
                    [user_id]
                );
            } else {
                // Diğer hatalar için fırlat
                throw queryError;
            }
        }

        if (ciftlikResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik bulunamadı'
            });
        }

        const ciftlik = ciftlikResult.rows[0];
        const ciftlik_id = ciftlik.id;

        // Sertifikaları getir (detaylı)
        const sertifikalarResult = await pool.query(
            `SELECT 
                cs.id,
                st.ad as sertifika_adi,
                cs.sertifika_no,
                cs.veren_kurum,
                cs.baslangic_tarihi,
                cs.bitis_tarihi,
                cs.suresiz,
                cs.dosya_url,
                cs.olusturma
            FROM ciftlik_sertifikalari cs
            JOIN sertifika_turleri st ON cs.sertifika_turu_id = st.id
            WHERE cs.ciftlik_id = $1
            ORDER BY cs.baslangic_tarihi DESC, st.ad`,
            [ciftlik_id]
        );

        // Ürün türlerini getir (kategorilerden)
        const urunTurleriResult = await pool.query(
            `SELECT DISTINCT uk.ad as kategori
            FROM urunler u
            JOIN urun_kategorileri uk ON u.kategori_id = uk.id
            WHERE u.ciftlik_id = $1 AND u.durum != 'silindi'
            ORDER BY uk.ad`,
            [ciftlik_id]
        );

        // Atık türlerini getir (ciftlik_atik_kapasiteleri tablosundan)
        const atikTurleriResult = await pool.query(
            `SELECT DISTINCT at.ad as atik_turu
            FROM ciftlik_atik_kapasiteleri cat
            JOIN atik_turleri at ON cat.atik_turu_id = at.id
            WHERE cat.ciftlik_id = $1
            ORDER BY at.ad`,
            [ciftlik_id]
        );

        // Kuruluş yılı (kayıt_tarihi'nden)
        let kurulusYili = '';
        try {
            if (ciftlik.kayit_tarihi) {
                const tarih = new Date(ciftlik.kayit_tarihi);
                if (!isNaN(tarih.getTime())) {
                    kurulusYili = tarih.getFullYear().toString();
                }
            }
        } catch (e) {
            console.warn('⚠️ Kuruluş yılı hesaplanamadı:', e.message);
        }

        // Alan birimi (hektar olarak saklanıyor, dönüme çevir)
        let alanDonum = '';
        try {
            if (ciftlik.alan != null) {
                const alanHektar = parseFloat(ciftlik.alan);
                if (!isNaN(alanHektar) && alanHektar > 0) {
                    alanDonum = (alanHektar * 10).toString(); // 1 hektar = 10 dönüm
                }
            }
        } catch (e) {
            console.warn('⚠️ Alan hesaplanamadı:', e.message);
        }

        // Güvenli parseFloat helper
        const safeParseFloat = (value) => {
            if (value == null || value === '') return '';
            try {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? '' : parsed.toString();
            } catch (e) {
                return '';
            }
        };

        // Base URL oluştur (belgeler için)
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        res.json({
            success: true,
            profil: {
                ad: ciftlik.ad || '',
                sahibi: `${ciftlik.sahibi_ad || ''} ${ciftlik.sahibi_soyad || ''}`.trim() || '',
                telefon: ciftlik.telefon || '',
                email: ciftlik.email || '',
                adres: ciftlik.adres || '',
                alan: alanDonum,
                alanBirim: 'Dönüm',
                kurulusYili: kurulusYili,
                sehir_adi: ciftlik.sehir_adi || '',
                enlem: safeParseFloat(ciftlik.enlem),
                boylam: safeParseFloat(ciftlik.boylam),
                yillik_gelir: safeParseFloat(ciftlik.yillik_gelir),
                uretim_kapasitesi: safeParseFloat(ciftlik.uretim_kapasitesi),
                urunTurleri: [
                    ...urunTurleriResult.rows.map(row => row.kategori || '').filter(k => k),
                    ...atikTurleriResult.rows.map(row => row.atik_turu || '').filter(a => a)
                ],
                sertifikalar: sertifikalarResult.rows.map(row => row.sertifika_adi || '').filter(s => s),
                sertifikalarDetay: sertifikalarResult.rows.map(row => {
                    // Dosya URL'ini oluştur (relative path ise /api/documents/file/ ile birleştir)
                    let documentUrl = null;
                    if (row.dosya_url && row.dosya_url.trim() !== '') {
                        if (row.dosya_url.startsWith('http://') || row.dosya_url.startsWith('https://')) {
                            // Zaten tam URL ise olduğu gibi kullan
                            documentUrl = row.dosya_url;
                        } else {
                            // Relative path ise /api/documents/file/ ile birleştir
                            // row.dosya_url formatı: "farmer/userId/filename.pdf" (zaten / ile başlamıyor)
                            let normalizedPath = row.dosya_url.startsWith('/') 
                                ? row.dosya_url.substring(1) 
                                : row.dosya_url;
                            
                            // Eğer path'te "farmer/" yoksa, eski kayıt olabilir - userId ile path oluştur
                            if (!normalizedPath.includes('farmer/') && !normalizedPath.includes('/')) {
                                // Sadece dosya adı var, path ekle
                                normalizedPath = `farmer/${user_id}/${normalizedPath}`;
                            }
                            
                            // Path'i encode et - sadece dosya adındaki özel karakterleri encode et, / karakterlerini koru
                            // Her path segment'ini ayrı ayrı encode et
                            const pathSegments = normalizedPath.split('/');
                            const encodedSegments = pathSegments.map(segment => encodeURIComponent(segment));
                            const encodedPath = encodedSegments.join('/');
                            documentUrl = `${baseUrl}/api/documents/file/${encodedPath}`;
                        }
                    }
                    
                    return {
                        id: row.id,
                        sertifika_adi: row.sertifika_adi || '',
                        sertifika_no: row.sertifika_no || '',
                        veren_kurum: row.veren_kurum || '',
                        baslangic_tarihi: row.baslangic_tarihi ? row.baslangic_tarihi.toISOString().split('T')[0] : '',
                        bitis_tarihi: row.bitis_tarihi ? row.bitis_tarihi.toISOString().split('T')[0] : null,
                        suresiz: row.suresiz || false,
                        dosya_url: documentUrl || '',
                        olusturma: row.olusturma ? row.olusturma.toISOString() : ''
                    };
                }),
                dogrulanmis: ciftlik.durum === 'aktif',
                urun_tur: ciftlik.urun_tur || '',
                hakkimizda: ciftlik.hakkimizda || '',
                logo_url: (ciftlik.logo_url && ciftlik.logo_url.trim()) || '',
                website: (ciftlik.logo_url && ciftlik.logo_url.trim()) || '' // Geriye dönük uyumluluk için
            }
        });

    } catch (error) {
        console.error('❌ Çiftlik profil hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            user_id: req.user?.id,
            name: error.name
        });
        
        // Daha detaylı hata mesajı döndür
        const errorMessage = error.detail || error.message || 'Çiftlik profili alınamadı';
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code,
                stack: error.stack
            } : undefined
        });
    }
};

// Çiftlik Profil Bilgilerini Güncelle
// PUT /api/ciftlik/profil
const updateCiftlikProfil = async (req, res) => {
    try {
        const user_id = req.user.id;
        const {
            ad,
            telefon,
            adres,
            alan,
            alanBirim,
            kurulusYili,
            sehir_adi,
            enlem,
            boylam,
            yillik_gelir,
            uretim_kapasitesi,
            urun_tur,
            hakkimizda,
            logo_url,
            website // Geriye dönük uyumluluk için
        } = req.body;

        // Çiftlik ID'sini bul
        const ciftlikResult = await pool.query(
            'SELECT id FROM ciftlikler WHERE kullanici_id = $1 AND silinme IS NULL',
            [user_id]
        );

        if (ciftlikResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik bulunamadı'
            });
        }

        const ciftlik_id = ciftlikResult.rows[0].id;

        // Alan birimini hektara çevir (dönüm -> hektar: 10'a böl)
        let alanHektar = null;
        if (alan) {
            const alanValue = parseFloat(alan);
            if (alanBirim === 'Dönüm') {
                alanHektar = alanValue / 10; // Dönüm -> Hektar
            } else if (alanBirim === 'Hektar') {
                alanHektar = alanValue;
            } else if (alanBirim === 'Dekar') {
                alanHektar = alanValue / 10; // Dekar = Dönüm
            }
        }

        // Kuruluş yılını DATE'e çevir
        let kayitTarihi = null;
        if (kurulusYili) {
            kayitTarihi = `${kurulusYili}-01-01`;
        }

        // sehir_adi kolonunun varlığını kontrol et (sadece bir kez kontrol et, cache için)
        try {
            const columnCheck = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'ciftlikler' 
                AND column_name = 'sehir_adi'
            `);
            
            // Eğer kolon yoksa, ekle
            if (columnCheck.rows.length === 0) {
                console.log('⚠️ sehir_adi kolonu bulunamadı, ekleniyor...');
                await pool.query(`
                    ALTER TABLE ciftlikler 
                    ADD COLUMN IF NOT EXISTS sehir_adi VARCHAR(50)
                `);
                
                // Mevcut sehir_id değerlerini sehir_adi'ye kopyala
                const updateResult = await pool.query(`
                    UPDATE ciftlikler c
                    SET sehir_adi = s.ad
                    FROM sehirler s
                    WHERE c.sehir_id = s.id AND c.sehir_adi IS NULL
                `);
                console.log(`✅ sehir_adi kolonu eklendi ve ${updateResult.rowCount} kayıt güncellendi`);
            }
        } catch (columnError) {
            // Kolon kontrolünde hata olursa, devam et (kolon zaten var olabilir)
            console.warn('⚠️ Kolon kontrolü sırasında hata:', columnError.message);
        }

        // Çiftlik bilgilerini güncelle
        const updateCiftlikResult = await pool.query(
            `UPDATE ciftlikler 
            SET 
                ad = COALESCE($1, ad),
                adres = COALESCE($2, adres),
                alan = COALESCE($3, alan),
                kayit_tarihi = COALESCE($4::DATE, kayit_tarihi),
                sehir_adi = COALESCE($5, sehir_adi),
                enlem = COALESCE($6::DECIMAL, enlem),
                boylam = COALESCE($7::DECIMAL, boylam),
                yillik_gelir = COALESCE($8::DECIMAL, yillik_gelir),
                uretim_kapasitesi = COALESCE($9::DECIMAL, uretim_kapasitesi),
                urun_tur = COALESCE($10, urun_tur),
                hakkimizda = COALESCE($11, hakkimizda),
                logo_url = COALESCE($12, logo_url),
                guncelleme = NOW()
            WHERE id = $13
            RETURNING *`,
            [
                ad || null, 
                adres || null, 
                alanHektar, 
                kayitTarihi, 
                (sehir_adi && typeof sehir_adi === 'string' && sehir_adi.trim()) ? sehir_adi.trim() : null,
                (enlem && typeof enlem === 'string' && enlem.trim()) ? parseFloat(enlem) : (typeof enlem === 'number' ? enlem : null),
                (boylam && typeof boylam === 'string' && boylam.trim()) ? parseFloat(boylam) : (typeof boylam === 'number' ? boylam : null),
                (yillik_gelir && typeof yillik_gelir === 'string' && yillik_gelir.trim()) ? parseFloat(yillik_gelir) : (typeof yillik_gelir === 'number' ? yillik_gelir : null),
                (uretim_kapasitesi && typeof uretim_kapasitesi === 'string' && uretim_kapasitesi.trim()) ? parseFloat(uretim_kapasitesi) : (typeof uretim_kapasitesi === 'number' ? uretim_kapasitesi : null),
                (urun_tur && typeof urun_tur === 'string' && urun_tur.trim()) ? urun_tur.trim() : null,
                (hakkimizda && typeof hakkimizda === 'string' && hakkimizda.trim()) ? hakkimizda.trim() : null,
                (logo_url && logo_url.trim()) || (website && website.trim()) || null, 
                ciftlik_id
            ]
        );

        // Telefon bilgisini kullanicilar tablosunda güncelle
        if (telefon !== undefined && telefon !== null) {
            await pool.query(
                `UPDATE kullanicilar 
                SET telefon = $1, guncelleme = NOW()
                WHERE id = $2`,
                [telefon, user_id]
            );
        }

        res.json({
            success: true,
            message: 'Çiftlik profili başarıyla güncellendi',
            profil: updateCiftlikResult.rows[0]
        });
    } catch (error) {
        console.error('❌ Çiftlik profil güncelleme hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Çiftlik profili güncellenirken bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};

// Çiftlik Logo Yükleme - POST /api/ciftlik/upload-logo
const uploadCiftlikLogo = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        // Çiftlik ID'sini bul
        const ciftlikResult = await pool.query(
            'SELECT id FROM ciftlikler WHERE kullanici_id = $1 AND silinme IS NULL',
            [user_id]
        );

        if (ciftlikResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik bulunamadı'
            });
        }

        const ciftlik_id = ciftlikResult.rows[0].id;

        // Mutlak URL oluştur - Static dosya olarak serve edilecek
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const relativePath = `farmer/${user_id}/logo/${req.file.filename}`;
        // Static dosya yolu: /uploads/farmer/{userId}/logo/{filename}
        const absoluteUrl = `${baseUrl}/uploads/${relativePath}`;
        
        // Dosya yolunu kontrol et
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../../uploads', relativePath);
        if (!fs.existsSync(filePath)) {
            console.error('❌ Dosya bulunamadı:', filePath);
            return res.status(500).json({
                success: false,
                message: 'Dosya kaydedilemedi'
            });
        }
        console.log('✅ Dosya kontrol edildi:', filePath);

        // Logo URL'ini güncelle (mutlak yol)
        await pool.query(
            `UPDATE ciftlikler 
            SET logo_url = $1, guncelleme = NOW()
            WHERE id = $2`,
            [absoluteUrl, ciftlik_id]
        );

        console.log('✅ Logo yüklendi:', {
            user_id,
            ciftlik_id,
            filename: req.file.filename,
            absoluteUrl,
            relativePath
        });

        res.json({
            success: true,
            message: 'Logo başarıyla yüklendi',
            logo_url: absoluteUrl
        });
    } catch (error) {
        console.error('❌ Logo yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Logo yüklenirken bir hata oluştu'
        });
    }
};

// Get Missing Documents for Farmer - GET /api/ciftlik/missing-documents
// Çiftçi için eksik belgeleri getir (belge_eksik durumundaki başvuru için)
const getMissingDocumentsForFarmer = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Yetkisiz işlem'
            });
        }

        // Çiftçinin başvurusunu bul (tüm durumları kontrol et)
        // "gcbelge" durumundaki belgeleri kontrol etmek için tüm başvuruları kontrol ediyoruz
        const basvuruResult = await pool.query(
            `SELECT id, durum, ciftlik_adi, sahip_adi, kullanici_id 
             FROM ciftlik_basvurulari 
             WHERE kullanici_id = $1::uuid 
             ORDER BY guncelleme DESC
             LIMIT 1`,
            [userId]
        );

        let hasGuncelBelgeler = false;
        let missingDocuments = [];
        let basvuru = null;

        if (basvuruResult.rows.length > 0) {
            basvuru = basvuruResult.rows[0];

            // Durumu "Eksik" olan belgeleri bul (eksik belge mesajı gönderilen belgeler)
            const missingDocsResult = await pool.query(
                `SELECT 
                    b.id,
                    b.ad,
                    b.durum,
                    b.dosya_yolu,
                    b.yuklenme,
                    b.guncelleme,
                    b.inceleme_tarihi,
                    b.kullanici_notu,
                    b.yonetici_notu,
                    b.red_nedeni,
                    bt.ad as belge_turu_adi,
                    bt.kod as belge_turu_kod
                 FROM belgeler b
                 JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                 WHERE b.basvuru_id = $1::uuid 
                   AND b.basvuru_tipi = 'ciftlik_basvurusu'
                   AND b.durum = 'Eksik'
                   AND b.inceleme_tarihi IS NOT NULL
                 ORDER BY b.inceleme_tarihi DESC`,
                [basvuru.id]
            );

            missingDocuments = missingDocsResult.rows;

            // "gcbelge" (güncel belge) durumundaki belgeleri kontrol et
            // Bu belgeler eksik belge yüklendikten sonra "gcbelge" olarak işaretlenir
            const guncelBelgelerResult = await pool.query(
                `SELECT COUNT(*) as sayisi
                 FROM belgeler
                 WHERE basvuru_id = $1::uuid
                   AND basvuru_tipi = 'ciftlik_basvurusu'
                   AND durum = 'gcbelge'
                   AND inceleme_tarihi IS NOT NULL`,
                [basvuru.id]
            );
            const guncelBelgeSayisi = parseInt(guncelBelgelerResult.rows[0].sayisi);
            hasGuncelBelgeler = guncelBelgeSayisi > 0;
        } else {
            // Başvuru bulunamadı, ama yine de "gcbelge" kontrolü yap (kullanıcı ID'si ile)
            const guncelBelgelerResult = await pool.query(
                `SELECT COUNT(*) as sayisi
                 FROM belgeler b
                 JOIN ciftlik_basvurulari cb ON b.basvuru_id = cb.id
                 WHERE cb.kullanici_id = $1::uuid
                   AND b.basvuru_tipi = 'ciftlik_basvurusu'
                   AND b.durum = 'gcbelge'
                   AND b.inceleme_tarihi IS NOT NULL`,
                [userId]
            );
            const guncelBelgeSayisi = parseInt(guncelBelgelerResult.rows[0].sayisi);
            hasGuncelBelgeler = guncelBelgeSayisi > 0;
            
            return res.json({
                success: true,
                hasMissingDocuments: false,
                hasGuncelBelgeler: hasGuncelBelgeler,
                application: null,
                missingDocuments: []
            });
        }

        // Başvurunun daha önce "belge_eksik" durumunda olup olmadığını kontrol et (geriye dönük uyumluluk için)
        // Eğer "beklemede" durumunda belgeler varsa ve bunların "inceleme_tarihi" varsa,
        // bu belgeler daha önce "Eksik" olarak işaretlenmiş demektir (yani yeni yüklenmiş)
        let hasNewlyUploadedDocuments = false;
        if (basvuru.durum === 'beklemede' && missingDocuments.length === 0 && !hasGuncelBelgeler) {
            // "beklemede" durumunda ve eksik belge yok, kontrol et
            const newlyUploadedDocsResult = await pool.query(
                `SELECT COUNT(*) as sayisi
                 FROM belgeler
                 WHERE basvuru_id = $1::uuid
                   AND basvuru_tipi = 'ciftlik_basvurusu'
                   AND durum = 'beklemede'
                   AND inceleme_tarihi IS NOT NULL
                   AND yuklenme > inceleme_tarihi`,
                [basvuru.id]
            );
            const newlyUploadedCount = parseInt(newlyUploadedDocsResult.rows[0].sayisi);
            hasNewlyUploadedDocuments = newlyUploadedCount > 0;
        }

        // Belgelerin URL'lerini oluştur
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const documentsWithUrls = missingDocuments.map(belge => {
            let documentUrl = null;
            if (belge.dosya_yolu) {
                if (belge.dosya_yolu.startsWith('http://') || belge.dosya_yolu.startsWith('https://')) {
                    documentUrl = belge.dosya_yolu;
                } else {
                    const normalizedPath = belge.dosya_yolu.startsWith('/') 
                        ? belge.dosya_yolu.substring(1) 
                        : belge.dosya_yolu;
                    documentUrl = `${baseUrl}/api/documents/file/${encodeURIComponent(normalizedPath)}`;
                }
            }

            return {
                id: belge.id,
                name: belge.ad,
                belgeTuruAdi: belge.belge_turu_adi,
                belgeTuruKod: belge.belge_turu_kod,
                durum: belge.durum,
                url: documentUrl,
                yuklenmeTarihi: belge.yuklenme ? belge.yuklenme.toISOString() : null,
                guncellemeTarihi: belge.guncelleme ? belge.guncelleme.toISOString() : null,
                incelemeTarihi: belge.inceleme_tarihi ? belge.inceleme_tarihi.toISOString() : null,
                kullaniciNotu: belge.kullanici_notu,
                yoneticiNotu: belge.yonetici_notu,
                redNedeni: belge.red_nedeni
            };
        });

        res.json({
            success: true,
            hasMissingDocuments: missingDocuments.length > 0,
            hasNewlyUploadedDocuments: hasNewlyUploadedDocuments,
            hasGuncelBelgeler: hasGuncelBelgeler,
            application: {
                id: basvuru.id,
                name: basvuru.ciftlik_adi,
                owner: basvuru.sahip_adi,
                status: basvuru.durum
            },
            missingDocuments: documentsWithUrls
        });
    } catch (error) {
        console.error('❌ [MISSING DOCS FARMER] Hata:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Eksik belgeler alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Güncel Belgeler (gcbelge) for Farmer - GET /api/ciftlik/guncel-belgeler
const getGuncelBelgelerForFarmer = async (req, res) => {
    try {
        const userId = req.user.id;

        // Çiftçinin başvurusunu bul
        const basvuruResult = await pool.query(
            `SELECT id, durum, ciftlik_adi, sahip_adi, kullanici_id 
             FROM ciftlik_basvurulari 
             WHERE kullanici_id = $1::uuid 
             ORDER BY guncelleme DESC
             LIMIT 1`,
            [userId]
        );

        if (basvuruResult.rows.length === 0) {
            return res.json({
                success: true,
                documents: [],
                application: null
            });
        }

        const basvuru = basvuruResult.rows[0];

        // "gcbelge" (güncel belge) durumundaki belgeleri bul
        const guncelBelgelerResult = await pool.query(
            `SELECT 
                b.id,
                b.ad,
                b.durum,
                b.dosya_yolu,
                b.yuklenme,
                b.guncelleme,
                b.inceleme_tarihi,
                b.kullanici_notu,
                b.yonetici_notu,
                b.red_nedeni,
                bt.ad as belge_turu_adi,
                bt.kod as belge_turu_kod
             FROM belgeler b
             JOIN belge_turleri bt ON b.belge_turu_id = bt.id
             WHERE b.basvuru_id = $1::uuid 
               AND b.basvuru_tipi = 'ciftlik_basvurusu'
               AND b.durum = 'gcbelge'
               AND b.inceleme_tarihi IS NOT NULL
             ORDER BY b.yuklenme DESC`,
            [basvuru.id]
        );

        const guncelBelgeler = guncelBelgelerResult.rows;

        // Belgelerin URL'lerini oluştur
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const documentsWithUrls = guncelBelgeler.map(belge => {
            let documentUrl = null;
            if (belge.dosya_yolu) {
                if (belge.dosya_yolu.startsWith('http://') || belge.dosya_yolu.startsWith('https://')) {
                    documentUrl = belge.dosya_yolu;
                } else {
                    const normalizedPath = belge.dosya_yolu.startsWith('/') 
                        ? belge.dosya_yolu.substring(1) 
                        : belge.dosya_yolu;
                    documentUrl = `${baseUrl}/api/documents/file/${encodeURIComponent(normalizedPath)}`;
                }
            }

            return {
                id: belge.id,
                name: belge.ad,
                belgeTuruAdi: belge.belge_turu_adi,
                belgeTuruKod: belge.belge_turu_kod,
                durum: belge.durum,
                url: documentUrl,
                yuklenmeTarihi: belge.yuklenme ? belge.yuklenme.toISOString() : null,
                guncellemeTarihi: belge.guncelleme ? belge.guncelleme.toISOString() : null,
                incelemeTarihi: belge.inceleme_tarihi ? belge.inceleme_tarihi.toISOString() : null,
                kullaniciNotu: belge.kullanici_notu,
                yoneticiNotu: belge.yonetici_notu,
                redNedeni: belge.red_nedeni
            };
        });

        res.json({
            success: true,
            documents: documentsWithUrls,
            application: {
                id: basvuru.id,
                name: basvuru.ciftlik_adi,
                owner: basvuru.sahip_adi,
                status: basvuru.durum
            }
        });
    } catch (error) {
        console.error('❌ [GUNCEL BELGELER FARMER] Hata:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Eksik belgeler alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Upload Missing Document - POST /api/ciftlik/upload-missing-document
// Çiftçi eksik belgeyi yükler
const uploadMissingDocument = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const userId = req.user?.id;
        const { belgeId, message } = req.body; // message eklendi
        const file = req.file;

        if (!userId) {
            await client.query('ROLLBACK');
            return res.status(401).json({
                success: false,
                message: 'Yetkisiz işlem'
            });
        }

        if (!belgeId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Belge ID gereklidir'
            });
        }

        if (!file) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Dosya yüklenmedi'
            });
        }

        // Belgeyi kontrol et - hem çiftlik hem ürün başvuruları için
        // Durum kontrolünü kaldırdık - belge yüklendikten sonra durum güncellemesi yapılabilmesi için
        const belgeResult = await client.query(
            `SELECT b.id, b.basvuru_id, b.basvuru_tipi, b.durum, b.inceleme_tarihi, b.dosya_yolu,
                    COALESCE(cb.kullanici_id, ub_c.kullanici_id) as kullanici_id
             FROM belgeler b
             LEFT JOIN ciftlik_basvurulari cb ON b.basvuru_id = cb.id AND b.basvuru_tipi = 'ciftlik_basvurusu'
             LEFT JOIN urun_basvurulari ub ON b.basvuru_id = ub.id AND b.basvuru_tipi = 'urun_basvurusu'
             LEFT JOIN ciftlikler ub_c ON ub.ciftlik_id = ub_c.id
             WHERE b.id = $1::uuid 
               AND (b.basvuru_tipi = 'ciftlik_basvurusu' OR b.basvuru_tipi = 'urun_basvurusu')
               AND COALESCE(cb.kullanici_id, ub_c.kullanici_id) = $2::uuid`,
            [belgeId, userId]
        );

        if (belgeResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Belge bulunamadı veya yetkiniz yok'
            });
        }

        const belge = belgeResult.rows[0];

        // Eski dosyayı sil (varsa)
        if (belge.dosya_yolu) {
            const oldFilePath = path.join(__dirname, '../../uploads', belge.dosya_yolu);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (err) {
                    console.warn('⚠️ Eski dosya silinemedi:', err.message);
                }
            }
        }

        // Multer disk storage kullanıyor, dosya zaten kaydedilmiş
        // file.path multer'ın kaydettiği tam dosya yolu
        // Relative path'i oluştur (uploads klasöründen sonrası)
        const uploadsDir = path.join(__dirname, '../../uploads');
        let relativePath;
        
        if (file.path) {
            // Multer disk storage kullanıyorsa file.path var
            // file.path: /path/to/uploads/farmer/userId/timestamp_filename.ext
            // relativePath: farmer/userId/timestamp_filename.ext
            relativePath = path.relative(uploadsDir, file.path).replace(/\\/g, '/');
        } else if (file.buffer) {
            // Memory storage kullanılıyorsa manuel kaydet
            const filePath = `farmer/${userId}/${Date.now()}_${file.originalname}`;
            const fullPath = path.join(uploadsDir, filePath);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(fullPath, file.buffer);
            relativePath = filePath;
        } else {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Dosya yolu veya buffer bulunamadı'
            });
        }

        // Belgeyi güncelle: yeni dosya yolu, yuklenme tarihi güncellenir
        // Eksik belge yüklendiğinde durum "gcbelge" (güncel belge) olarak işaretlenir
        await client.query(
            `UPDATE belgeler 
             SET dosya_yolu = $1,
                 dosya_boyutu = $2,
                 dosya_tipi = $3,
                 yuklenme = CURRENT_TIMESTAMP,
                 guncelleme = CURRENT_TIMESTAMP,
                 durum = 'gcbelge',
                 kullanici_notu = $5
             WHERE id = $4::uuid`,
            [relativePath, file.size, path.extname(file.originalname).substring(1).toLowerCase(), belgeId, message || null]
        );

        // Başvurudaki tüm eksik belgeleri kontrol et
        const eksikBelgeKontrol = await client.query(
            `SELECT COUNT(*) as eksik_sayisi
             FROM belgeler
             WHERE basvuru_id = $1::uuid
               AND basvuru_tipi = $2
               AND durum = 'Eksik'
               AND inceleme_tarihi IS NOT NULL`,
            [belge.basvuru_id, belge.basvuru_tipi]
        );

        const eksikBelgeSayisi = parseInt(eksikBelgeKontrol.rows[0].eksik_sayisi);

        // Eğer hiç eksik belge kalmadıysa, başvuru durumunu güncelle
        if (eksikBelgeSayisi === 0) {
            if (belge.basvuru_tipi === 'ciftlik_basvurusu') {
                // Çiftlik başvurusu için
                const mevcutDurumResult = await client.query(
                    `SELECT durum FROM ciftlik_basvurulari WHERE id = $1::uuid`,
                    [belge.basvuru_id]
                );
                
                if (mevcutDurumResult.rows.length > 0) {
                    const mevcutDurum = mevcutDurumResult.rows[0].durum;
                    console.log(`🔍 [UPLOAD MISSING DOC] Mevcut başvuru durumu: ${mevcutDurum} - Basvuru ID: ${belge.basvuru_id}`);
                    
                    if (mevcutDurum === 'belge_eksik' || mevcutDurum === 'beklemede') {
                        await client.query(
                            `UPDATE ciftlik_basvurulari
                             SET durum = 'gcbelge',
                                 guncelleme = CURRENT_TIMESTAMP
                             WHERE id = $1::uuid`,
                            [belge.basvuru_id]
                        );
                        console.log(`✅ [UPLOAD MISSING DOC] Başvuru durumu 'gcbelge' olarak güncellendi (${mevcutDurum} → gcbelge) - Basvuru ID: ${belge.basvuru_id}`);
                    }
                }
            }
        }

        // Ürün başvurusu için - çiftçi belge gönderdiğinde durumu "incelemede" yap (eksik belge kontrolünden bağımsız)
        let urunBasvuruBilgi = null;
        if (belge.basvuru_tipi === 'urun_basvurusu') {
            console.log(`🔍 [UPLOAD MISSING DOC] Ürün başvurusu kontrolü başlatılıyor - Basvuru ID: ${belge.basvuru_id}`);
            
            const mevcutDurumResult = await client.query(
                `SELECT durum, urun_adi, inceleyen_id FROM urun_basvurulari WHERE id = $1::uuid`,
                [belge.basvuru_id]
            );
            
            if (mevcutDurumResult.rows.length > 0) {
                urunBasvuruBilgi = mevcutDurumResult.rows[0];
                const mevcutDurum = urunBasvuruBilgi.durum;
                console.log(`🔍 [UPLOAD MISSING DOC] Mevcut ürün başvurusu durumu: '${mevcutDurum}' - Basvuru ID: ${belge.basvuru_id}`);
                
                // Eğer durum "revizyon" ise "incelemede" yap (çiftçi belge gönderdiğinde)
                // Case-insensitive kontrol yap
                if (mevcutDurum && mevcutDurum.toLowerCase() === 'revizyon') {
                    console.log(`🔄 [UPLOAD MISSING DOC] Durum güncelleniyor: '${mevcutDurum}' → 'incelemede'`);
                    
                    const updateResult = await client.query(
                        `UPDATE urun_basvurulari
                         SET durum = 'incelemede',
                             guncelleme = CURRENT_TIMESTAMP
                         WHERE id = $1::uuid
                         RETURNING id, durum`,
                        [belge.basvuru_id]
                    );
                    
                    if (updateResult.rows.length > 0) {
                        console.log(`✅ [UPLOAD MISSING DOC] Ürün başvurusu durumu başarıyla güncellendi!`);
                        console.log(`   - Eski durum: '${mevcutDurum}'`);
                        console.log(`   - Yeni durum: '${updateResult.rows[0].durum}'`);
                        console.log(`   - Basvuru ID: ${belge.basvuru_id}`);
                    } else {
                        console.error(`❌ [UPLOAD MISSING DOC] Durum güncellemesi başarısız! UPDATE hiçbir satırı etkilemedi.`);
                    }
                } else {
                    console.log(`ℹ️ [UPLOAD MISSING DOC] Durum güncellenmedi - Mevcut durum '${mevcutDurum}' 'revizyon' değil.`);
                }
            } else {
                console.error(`❌ [UPLOAD MISSING DOC] Ürün başvurusu bulunamadı! Basvuru ID: ${belge.basvuru_id}`);
            }
        }

        await client.query('COMMIT');
        
        // Bildirim gönder - Ürün başvurusu için admin'e bildirim gönder
        if (belge.basvuru_tipi === 'urun_basvurusu' && urunBasvuruBilgi) {
            try {
                // Ürün başvurusunu inceleyen admin'i bul
                let adminId = urunBasvuruBilgi.inceleyen_id;
                
                // Eğer inceleyen admin yoksa, tüm ziraat yöneticilerine bildirim gönder
                if (!adminId) {
                    console.log(`ℹ️ [UPLOAD MISSING DOC] İnceleyen admin bulunamadı, tüm ziraat yöneticilerine bildirim gönderilecek`);
                    const adminlerResult = await pool.query(
                        `SELECT id FROM kullanicilar WHERE rol = 'ziraat_yoneticisi' AND silinme IS NULL`
                    );
                    
                    if (adminlerResult.rows.length > 0) {
                        // Tüm adminlere bildirim gönder
                        for (const admin of adminlerResult.rows) {
                            await createNotification({
                                kullanici_id: admin.id,
                                bildirim_tipi_kod: 'BELGE',
                                baslik: 'Yeni Belge Yüklendi',
                                mesaj: `"${urunBasvuruBilgi.urun_adi}" adlı ürün başvurusu için eksik belge yüklendi. Lütfen inceleyin.`,
                                link: `/admin/ziraat/products`
                            });
                        }
                        console.log(`✅ [UPLOAD MISSING DOC] Tüm ziraat yöneticilerine bildirim gönderildi (${adminlerResult.rows.length} admin)`);
                    }
                } else {
                    // Sadece inceleyen admin'e bildirim gönder
                    await createNotification({
                        kullanici_id: adminId,
                        bildirim_tipi_kod: 'BELGE',
                        baslik: 'Yeni Belge Yüklendi',
                        mesaj: `"${urunBasvuruBilgi.urun_adi}" adlı ürün başvurusu için eksik belge yüklendi. Lütfen inceleyin.`,
                        link: `/admin/ziraat/products`
                    });
                    console.log(`✅ [UPLOAD MISSING DOC] İnceleyen admin'e bildirim gönderildi (Admin ID: ${adminId})`);
                }
            } catch (notificationError) {
                console.error('⚠️ [UPLOAD MISSING DOC] Bildirim oluşturma hatası (işlem başarılı):', notificationError);
            }
        }

        res.json({
            success: true,
            message: 'Belge başarıyla yüklendi',
            belgeId: belgeId
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [UPLOAD MISSING DOC] Hata:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Belge yüklenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Sertifika türlerini getir
const getSertifikaTurleri = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, ad 
            FROM sertifika_turleri 
            WHERE aktif = TRUE 
            ORDER BY ad`,
            []
        );

        res.json({
            success: true,
            turler: result.rows
        });
    } catch (error) {
        console.error('Sertifika türleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sertifika türleri yüklenirken bir hata oluştu',
            error: error.message
        });
    }
};

// Sertifika ekle
const addSertifika = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const user_id = req.user.id;
        
        // Çiftlik ID'sini bul
        const ciftlikResult = await client.query(
            `SELECT id FROM ciftlikler WHERE kullanici_id = $1 AND silinme IS NULL LIMIT 1`,
            [user_id]
        );

        if (ciftlikResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Çiftlik bulunamadı'
            });
        }

        const ciftlik_id = ciftlikResult.rows[0].id;
        const {
            sertifika_turu_id,
            sertifika_no,
            veren_kurum,
            baslangic_tarihi,
            bitis_tarihi,
            suresiz
        } = req.body;

        // Dosya yolu (relative path) - eğer dosya yüklendiyse
        let dosya_url = null;
        if (req.file) {
            // Multer disk storage kullanıyor, dosya zaten kaydedilmiş
            // file.path multer'ın kaydettiği tam dosya yolu
            // Relative path'i oluştur (uploads klasöründen sonrası)
            const uploadsDir = path.join(__dirname, '../../uploads');
            let relativePath;
            
            if (req.file.path) {
                // Multer disk storage kullanıyorsa file.path var
                // file.path: /path/to/uploads/farmer/userId/timestamp_filename.ext
                // relativePath: farmer/userId/timestamp_filename.ext
                relativePath = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
            } else if (req.file.buffer) {
                // Memory storage kullanılıyorsa manuel kaydet
                const filePath = `farmer/${user_id}/${Date.now()}_${req.file.originalname}`;
                const fullPath = path.join(uploadsDir, filePath);
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullPath, req.file.buffer);
                relativePath = filePath;
            } else {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Dosya yolu veya buffer bulunamadı'
                });
            }
            
            // Relative path'i dosya_url olarak sakla (farmer/userId/filename formatında)
            dosya_url = relativePath;
        }

        // Sertifika ekle
        const insertResult = await client.query(
            `INSERT INTO ciftlik_sertifikalari 
            (ciftlik_id, sertifika_turu_id, sertifika_no, veren_kurum, baslangic_tarihi, bitis_tarihi, suresiz, dosya_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                ciftlik_id,
                sertifika_turu_id,
                sertifika_no || null,
                veren_kurum || null,
                baslangic_tarihi,
                (suresiz === 'true' || suresiz === true) ? null : (bitis_tarihi || null),
                (suresiz === 'true' || suresiz === true),
                dosya_url
            ]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Sertifika başarıyla eklendi',
            sertifika: insertResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Sertifika ekleme hatası:', error);
        
        // Unique constraint hatası kontrolü
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Bu sertifika zaten eklenmiş'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Sertifika eklenirken bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = {
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
};

