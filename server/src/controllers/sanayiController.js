const { pool } = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');

// Sanayi Admin Controller Fonksiyonları

// Yardımcı fonksiyon: Firma aktivite logu kaydet
const logFirmaActivity = async (client, options) => {
    const {
        kullanici_id,      // İşlemi yapan kullanıcı (admin)
        firma_id,          // İlgili firma ID (firmalar tablosu)
        basvuru_id,        // İlgili başvuru ID (firma_basvurulari tablosu)
        islem_tipi,        // 'onay', 'red', 'guncelleme', 'durum_degisikligi'
        eski_durum,        // Önceki durum
        yeni_durum,        // Yeni durum
        aciklama,          // Açıklama/not
        ip_adresi,         // IP adresi (opsiyonel)
        user_agent         // User agent (opsiyonel)
    } = options;

    try {
        // 1. aktiviteler tablosuna kayıt ekle
        const aktiviteBaslik = islem_tipi === 'onay' 
            ? 'Firma başvurusu onaylandı'
            : islem_tipi === 'red'
            ? 'Firma başvurusu reddedildi'
            : islem_tipi === 'durum_degisikligi'
            ? `Firma durumu değiştirildi: ${eski_durum} → ${yeni_durum}`
            : 'Firma işlemi';

        try {
            await client.query(
                `INSERT INTO aktiviteler 
                (kullanici_id, tip, varlik_tipi, varlik_id, baslik, aciklama, ip_adresi, user_agent)
                VALUES ($1, $2, 'firma', $3, $4, $5, $6, $7)`,
                [
                    kullanici_id,
                    islem_tipi,
                    firma_id || basvuru_id, // Önce firma_id, yoksa basvuru_id
                    aktiviteBaslik,
                    aciklama || '',
                    ip_adresi || null,
                    user_agent || null
                ]
            );
        } catch (aktiviteError) {
            // Aktivite kaydı hatası kritik değil, sadece logla
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ Aktivite kayıt hatası (atlanıyor):', aktiviteError.message);
            }
            // Hata olsa bile devam et - transaction'ı abort etme
        }

        // 2. detayli_aktiviteler tablosuna kayıt ekle (Sanayi dashboard'ları için)
        if (islem_tipi === 'onay' || islem_tipi === 'red') {
            try {
                const kullaniciResult = await client.query(
                    `SELECT rol FROM kullanicilar WHERE id = $1`,
                    [kullanici_id]
                );
                const rol = kullaniciResult.rows.length > 0 ? kullaniciResult.rows[0].rol : null;

                // Başvuruyu yapan kullanıcıyı bul (etkilenen kullanıcı)
                let etkilenen_kullanici_id = null;
                if (basvuru_id) {
                    const basvuruResult = await client.query(
                        `SELECT kullanici_id FROM firma_basvurulari WHERE id = $1`,
                        [basvuru_id]
                    );
                    etkilenen_kullanici_id = basvuruResult.rows.length > 0 
                        ? basvuruResult.rows[0].kullanici_id 
                        : null;
                }

                await client.query(
                    `INSERT INTO detayli_aktiviteler 
                    (kategori, kullanici_id, rol, islem_tipi, hedef_tipi, hedef_id, onceki_durum, sonraki_durum, baslik, aciklama, etkilenen_kullanici_id, ip_adresi, user_agent)
                    VALUES ('firma', $1, $2, $3, 'firma_basvurusu', $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        kullanici_id,
                        rol,
                        islem_tipi,
                        basvuru_id,
                        eski_durum,
                        yeni_durum,
                        aktiviteBaslik,
                        aciklama || '',
                        etkilenen_kullanici_id,
                        ip_adresi || null,
                        user_agent || null
                    ]
                );
            } catch (detayliError) {
                // detayli_aktiviteler tablosu yoksa veya hata varsa sessizce devam et
                if (process.env.NODE_ENV === 'development') {
                    console.warn('⚠️ detayli_aktiviteler kayıt hatası (atlanıyor):', detayliError.message);
                }
            }
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Firma aktivite logu kaydedildi:', {
                islem_tipi,
                firma_id,
                basvuru_id,
                durum: `${eski_durum} → ${yeni_durum}`
            });
        }
    } catch (error) {
        // Log hatası kritik değil, sadece console'a yaz
        console.error('⚠️ Aktivite log kayıt hatası (işlem devam ediyor):', error.message);
    }
};

// Dashboard Stats - GET /api/sanayi/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        // Ürün başvuru istatistikleri (firmalar için)
        const productStats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE durum = 'beklemede') as pending,
                COUNT(*) FILTER (WHERE durum = 'onaylandi') as approved,
                COUNT(*) FILTER (WHERE durum = 'revizyon') as revision
            FROM urun_basvurulari
        `);

        // Firma başvuru istatistikleri - firma_basvurulari tablosundan
        const companyStats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE durum = 'beklemede') as "newApplications",
                COUNT(*) FILTER (WHERE durum = 'incelemede') as inspections,
                COUNT(*) FILTER (WHERE durum = 'onaylandi') as approved,
                COUNT(*) FILTER (WHERE durum = 'reddedildi') as rejected
            FROM firma_basvurulari
        `);

        // Toplam kayıtlı firma - hem onaylanmış hem beklemedeki
        // Kullanıcı bazında sayım yap (bir kullanıcının birden fazla başvurusu olabilir ama tek üyesi olmalı)
        // 1. Aktif firmalar (firmalar tablosundan)
        // 2. Beklemede/incelemede/eksik durumundaki başvurular (henüz firmalar tablosuna geçmemiş)
        // 3. Onaylanmış ama henüz firmalar tablosuna geçmemiş başvurular (firma_id IS NULL)
        const companiesCount = await pool.query(`
            SELECT COUNT(DISTINCT kullanici_id) as total 
            FROM (
                SELECT kullanici_id 
                FROM firmalar 
                WHERE durum = 'aktif' AND silinme IS NULL
                UNION
                SELECT kullanici_id 
                FROM firma_basvurulari 
                WHERE durum IN ('beklemede', 'incelemede', 'eksik')
                   OR (durum = 'onaylandi' AND firma_id IS NULL)
            ) combined
        `);

        // Toplam ürün
        const productsCount = await pool.query(`
            SELECT COUNT(*) as total FROM urunler WHERE durum = 'aktif'
        `);

        res.json({
            success: true,
            stats: {
                productSummary: {
                    pending: parseInt(productStats.rows[0].pending || 0),
                    approved: parseInt(productStats.rows[0].approved || 0),
                    revision: parseInt(productStats.rows[0].revision || 0)
                },
                companySummary: {
                    newApplications: parseInt(companyStats.rows[0]?.newApplications || 0),
                    inspections: parseInt(companyStats.rows[0]?.inspections || 0),
                    approved: parseInt(companyStats.rows[0]?.approved || 0),
                    rejected: parseInt(companyStats.rows[0]?.rejected || 0)
                },
                totalCompanies: parseInt(companiesCount.rows[0].total || 0),
                totalProducts: parseInt(productsCount.rows[0].total || 0)
            }
        });
    } catch (error) {
        console.error('Dashboard stats hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Dashboard istatistikleri alınamadı'
        });
    }
};

// Company Applications - GET /api/sanayi/companies/applications
// firma_basvurulari tablosundan veri çek
const getCompanyApplications = async (req, res) => {
    try {
        // Query parametrelerini validate et ve parse et
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, search } = req.query;
        
        // Validation
        if (isNaN(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz sayfa numarası'
            });
        }
        
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz limit değeri (1-100 arası olmalı)'
            });
        }
        
        const offset = (page - 1) * limit;

        // firma_basvurulari tablosundan veri çek
        let whereClause = "WHERE 1=1";
        const params = [];
        let paramIndex = 1;

        // Durum filtresi - firma_basvurulari tablosundaki durum değerleri
        if (status) {
            whereClause += ` AND fb.durum = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        } else {
            // Durum filtresi yoksa onay bekleyen, incelemede ve eksik evrak durumundaki başvuruları göster
            // Reddedilen başvurular listede gösterilmez
            whereClause += ` AND fb.durum IN ('beklemede', 'incelemede', 'eksik', 'pasif')`;
        }

        if (search) {
            whereClause += ` AND (fb.firma_adi ILIKE $${paramIndex} OR fb.basvuran_adi ILIKE $${paramIndex} OR COALESCE(k.ad, '') ILIKE $${paramIndex} OR COALESCE(k.soyad, '') ILIKE $${paramIndex} OR fb.id::text ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Toplam sayı - firma_basvurulari tablosundan
        const countQuery = `
            SELECT COUNT(*) as total
            FROM firma_basvurulari fb
            JOIN kullanicilar k ON fb.kullanici_id = k.id AND k.silinme IS NULL
            ${whereClause}
        `;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Company applications count query:', countQuery);
            console.log('🔍 Params:', params);
        }
        
        const countResult = await pool.query(countQuery, params);

        // Sayfalama ile veriler - firma_basvurulari tablosundan, belgeler de dahil
        const limitParamIndex = paramIndex;
        const offsetParamIndex = paramIndex + 1;
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                fb.id,
                fb.firma_adi as name,
                fb.basvuran_adi as owner,
                fb.durum as status,
                fb.guncelleme as "lastUpdate",
                fb.id::text as "applicationNumber",
                COALESCE(s.ad, '') as sector,
                EXTRACT(YEAR FROM fb.basvuru_tarihi)::INTEGER as "establishmentYear",
                '1-5' as "employeeCount",
                k.eposta as email,
                COALESCE(k.telefon, fb.telefon, '') as phone,
                fb.basvuru_tarihi as "applicationDate",
                COALESCE(fb.vergi_no, '') as "taxNumber",
                COALESCE(fb.aciklama, '') as description,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'name', COALESCE(bt.ad, b.ad, 'Belge'),
                            'status', CASE 
                                WHEN b.durum = 'onaylandi' THEN 'Onaylandı'
                                WHEN b.durum = 'reddedildi' THEN 'Reddedildi'
                                WHEN b.durum = 'eksik' THEN 'Eksik'
                                ELSE 'Beklemede'
                            END,
                            'url', b.dosya_yolu,
                            'belgeId', b.id,
                            'farmerNote', COALESCE(b.red_nedeni, b.kullanici_notu, ''),
                            'adminNote', COALESCE(b.yonetici_notu, '')
                        ) ORDER BY COALESCE(bt.ad, b.ad, '')
                    ) FILTER (WHERE b.id IS NOT NULL),
                    '[]'::json
                ) as documents
            FROM firma_basvurulari fb
            JOIN kullanicilar k ON fb.kullanici_id = k.id AND k.silinme IS NULL
            LEFT JOIN sektorler s ON fb.sektor_id = s.id
            LEFT JOIN belgeler b ON b.basvuru_id = fb.id AND b.basvuru_tipi = 'firma_basvurusu' AND b.basvuru_id IS NOT NULL
            LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id AND bt.id IS NOT NULL
            ${whereClause}
            GROUP BY fb.id, fb.firma_adi, fb.basvuran_adi, fb.durum, fb.guncelleme, fb.basvuru_tarihi, 
                     k.eposta, k.telefon, fb.telefon, fb.vergi_no, fb.aciklama, s.ad
            ORDER BY fb.basvuru_tarihi DESC
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Company applications data query:', dataQuery);
            console.log('🔍 Data query params:', params);
        }
        
        const dataResult = await pool.query(dataQuery, params);

        const total = parseInt(countResult.rows[0].total || 0);
        const totalPages = Math.ceil(total / limit);

        // Belge URL'lerini tam URL'ye çevir
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const processedRows = dataResult.rows.map(row => {
            // documents JSON string veya array olabilir
            if (row.documents) {
                let documents = row.documents;
                if (typeof documents === 'string') {
                    try {
                        documents = JSON.parse(documents);
                    } catch (e) {
                        console.warn('Belgeler parse edilemedi:', e);
                        documents = [];
                    }
                }
                if (Array.isArray(documents)) {
                    row.documents = documents.map(doc => {
                        if (doc && doc.url) {
                            doc.url = `${baseUrl}/api/documents/file/${encodeURIComponent(doc.url)}`;
                        }
                        return doc;
                    });
                }
            }
            return row;
        });

        // Debug: Kaç kayıt bulundu
        console.log(`Company applications sorgusu: ${total} kayıt bulundu (firma_basvurulari tablosundan)`);
        if (total > 0 && process.env.NODE_ENV === 'development') {
            // İlk 5 kaydı göster (debug için)
            console.log('İlk 5 firma:', processedRows.slice(0, 5).map(r => ({
                id: r.id,
                name: r.name,
                status: r.status,
                applicationDate: r.applicationDate
            })));
        }

        res.json({
            success: true,
            applications: processedRows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('❌ Company applications hatası:', error);
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
            message: 'Firma başvuruları alınamadı',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};

// Approve Company - POST /api/sanayi/companies/approve/:id
// firma_basvurulari tablosundan başvuruyu onayla ve firmalar tablosuna kayıt oluştur
const approveCompany = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params; // basvuru_id
        const { note } = req.body;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Approve company isteği:', {
                basvuru_id: id,
                note: note ? 'var' : 'yok',
                user_id: req.user?.id
            });
        }

        // Başvuruyu kontrol et
        const basvuruResult = await client.query(
            `SELECT fb.*, k.eposta, k.ad as kullanici_ad, k.soyad as kullanici_soyad 
             FROM firma_basvurulari fb
             JOIN kullanicilar k ON fb.kullanici_id = k.id
             WHERE fb.id = $1`,
            [id]
        );

        if (basvuruResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Firma başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Mevcut başvuru durumu:', {
                basvuru_id: id,
                mevcut_durum: basvuru.durum,
                firma_id: basvuru.firma_id
            });
        }

        // Eğer başvuru zaten onaylanmışsa ve firma_id varsa, mevcut firmayı aktif yap
        if (basvuru.firma_id && basvuru.durum === 'onaylandi') {
            const eskiDurumResult = await client.query(
                'SELECT durum FROM firmalar WHERE id = $1',
                [basvuru.firma_id]
            );
            const eskiDurum = eskiDurumResult.rows.length > 0 ? eskiDurumResult.rows[0].durum : null;
            
            await client.query(
                'UPDATE firmalar SET durum = $1, guncelleme = NOW() WHERE id = $2',
                ['aktif', basvuru.firma_id]
            );
            
            // Kullanıcı durumunu da aktif yap (giriş yapabilmesi için)
            await client.query(
                'UPDATE kullanicilar SET durum = $1 WHERE id = $2',
                ['aktif', basvuru.kullanici_id]
            );
            
            // Belgelerin durumunu da onaylandı yap
            await client.query(
                `UPDATE belgeler 
                 SET durum = 'onaylandi', inceleme_tarihi = NOW(), inceleyen_id = $1, guncelleme = NOW()
                 WHERE (firma_id = $2 OR basvuru_id = $3) AND durum != 'onaylandi'`,
                [req.user?.id, basvuru.firma_id, id]
            );
            
            await client.query('COMMIT');
            
            // Log kaydı ekle (transaction commit edildikten sonra)
            try {
                const logClient = await pool.connect();
                try {
                    await logFirmaActivity(logClient, {
                        kullanici_id: req.user?.id,
                        firma_id: basvuru.firma_id,
                        basvuru_id: id,
                        islem_tipi: 'durum_degisikligi',
                        eski_durum: eskiDurum,
                        yeni_durum: 'aktif',
                        aciklama: 'Firma tekrar aktif edildi',
                        ip_adresi: req.ip,
                        user_agent: req.get('user-agent')
                    });
                } finally {
                    logClient.release();
                }
            } catch (logError) {
                console.error('⚠️ Log kayıt hatası (işlem başarılı):', logError.message);
            }
            return res.json({
                success: true,
                message: 'Firma zaten onaylanmış ve aktif edildi'
            });
        }

        // Eğer firma_id varsa ama durum "beklemede", "incelemede", "eksik" veya "pasif" ise, mevcut firmayı aktif yap ve başvuruyu güncelle
        if (basvuru.firma_id && (basvuru.durum === 'beklemede' || basvuru.durum === 'incelemede' || basvuru.durum === 'eksik' || basvuru.durum === 'pasif')) {
            // Mevcut firmayı kontrol et
            const firmaCheckResult = await client.query(
                'SELECT id, durum FROM firmalar WHERE id = $1 AND silinme IS NULL',
                [basvuru.firma_id]
            );

            if (firmaCheckResult.rows.length > 0) {
                const eskiDurum = firmaCheckResult.rows[0].durum;
                
                // Firmayı aktif yap
                await client.query(
                    'UPDATE firmalar SET durum = $1, guncelleme = NOW() WHERE id = $2',
                    ['aktif', basvuru.firma_id]
                );
                
                // Kullanıcı durumunu da aktif yap (giriş yapabilmesi için)
                await client.query(
                    'UPDATE kullanicilar SET durum = $1 WHERE id = $2',
                    ['aktif', basvuru.kullanici_id]
                );

                // Başvuruyu güncelle
                const aciklama = note 
                    ? `Onay Notu: ${note}${basvuru.aciklama ? '\n' + basvuru.aciklama : ''}`
                    : (basvuru.aciklama || '');

                await client.query(
                    `UPDATE firma_basvurulari 
                    SET durum = 'onaylandi', onay_tarihi = NOW(), 
                        inceleme_tarihi = NOW(), inceleyen_id = $1, guncelleme = NOW()
                    WHERE id = $2`,
                    [req.user?.id, id]
                );

                // Belgeleri firma_id ile bağla ve durumlarını onaylandı yap
                await client.query(
                    `UPDATE belgeler 
                    SET firma_id = $1, durum = 'onaylandi', inceleme_tarihi = NOW(), inceleyen_id = $2, guncelleme = NOW()
                    WHERE basvuru_id = $3 AND basvuru_tipi = 'firma_basvurusu'`,
                    [basvuru.firma_id, req.user?.id, id]
                );

                await client.query('COMMIT');
                
                // Log kaydı ekle (transaction commit edildikten sonra)
                try {
                    const logClient = await pool.connect();
                    try {
                        await logFirmaActivity(logClient, {
                            kullanici_id: req.user?.id,
                            firma_id: basvuru.firma_id,
                            basvuru_id: id,
                            islem_tipi: 'onay',
                            eski_durum: eskiDurum,
                            yeni_durum: 'aktif',
                            aciklama: note || 'Firma başvurusu onaylandı',
                            ip_adresi: req.ip,
                            user_agent: req.get('user-agent')
                        });
                    } finally {
                        logClient.release();
                    }
                } catch (logError) {
                    console.error('⚠️ Log kayıt hatası (işlem başarılı):', logError.message);
                }

                return res.json({
                    success: true,
                    message: 'Firma başvurusu onaylandı ve firma aktif edildi'
                });
            }
        }

        // firmalar tablosuna yeni kayıt oluştur
        const aciklama = note 
            ? `Onay Notu: ${note}${basvuru.aciklama ? '\n' + basvuru.aciklama : ''}`
            : (basvuru.aciklama || '');
        
        const firmaResult = await client.query(
            `INSERT INTO firmalar 
            (kullanici_id, ad, vergi_no, telefon, adres, sektor_id, durum, aciklama)
            VALUES ($1, $2, $3, $4, $5, $6, 'aktif', $7)
            RETURNING id`,
            [
                basvuru.kullanici_id,
                basvuru.firma_adi,
                basvuru.vergi_no,
                basvuru.telefon,
                basvuru.adres,
                basvuru.sektor_id,
                aciklama
            ]
        );

        const firmaId = firmaResult.rows[0].id;

        // Kullanıcı durumunu aktif yap (giriş yapabilmesi için)
        await client.query(
            'UPDATE kullanicilar SET durum = $1 WHERE id = $2',
            ['aktif', basvuru.kullanici_id]
        );
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Kullanıcı durumu aktif yapıldı:', {
                kullanici_id: basvuru.kullanici_id,
                yeni_durum: 'aktif'
            });
        }

        // firma_basvurulari tablosunu güncelle: firma_id, durum, onay_tarihi
        const updateResult = await client.query(
            `UPDATE firma_basvurulari 
            SET firma_id = $1, durum = 'onaylandi', onay_tarihi = NOW(), 
                inceleme_tarihi = NOW(), inceleyen_id = $2, guncelleme = NOW()
            WHERE id = $3
            RETURNING id, durum, firma_id`,
            [firmaId, req.user?.id, id]
        );
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Firma başvurusu güncellendi:', {
                basvuru_id: id,
                firma_id: firmaId,
                yeni_durum: updateResult.rows[0]?.durum,
                guncellenen_satir: updateResult.rowCount
            });
        }
        
        if (updateResult.rowCount === 0) {
            throw new Error('Firma başvurusu güncellenemedi');
        }

        // Belgeleri firma_id ile bağla ve durumlarını onaylandı yap
        await client.query(
            `UPDATE belgeler 
            SET firma_id = $1, durum = 'onaylandi', inceleme_tarihi = NOW(), inceleyen_id = $2, guncelleme = NOW()
            WHERE basvuru_id = $3 AND basvuru_tipi = 'firma_basvurusu'`,
            [firmaId, req.user?.id, id]
        );

        await client.query('COMMIT');
        
        // Log kaydı ekle - Onaylama (transaction commit edildikten sonra)
        // Bu şekilde log hatası olsa bile ana işlem etkilenmez
        // Commit sonrası yeni bir connection kullan
        try {
            const logClient = await pool.connect();
            try {
                await logFirmaActivity(logClient, {
                    kullanici_id: req.user?.id,
                    firma_id: firmaId,
                    basvuru_id: id,
                    islem_tipi: 'onay',
                    eski_durum: basvuru.durum,
                    yeni_durum: 'onaylandi',
                    aciklama: note || 'Firma başvurusu onaylandı',
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
            } finally {
                logClient.release();
            }
        } catch (logError) {
            // Log hatası kritik değil, sadece console'a yaz
            console.error('⚠️ Log kayıt hatası (işlem başarılı):', logError.message);
        }
        
        // Commit sonrası durumu doğrula
        const verifyResult = await pool.query(
            'SELECT id, durum, firma_id FROM firma_basvurulari WHERE id = $1',
            [id]
        );
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Commit sonrası doğrulama:', {
                basvuru_id: id,
                guncel_durum: verifyResult.rows[0]?.durum,
                firma_id: verifyResult.rows[0]?.firma_id
            });
        }

        // Bildirim oluştur - Firmaya başvuru onaylandı bildirimi gönder
        try {
            await createNotification({
                kullanici_id: basvuru.kullanici_id,
                bildirim_tipi_kod: 'BASVURU',
                baslik: 'Firma Başvurunuz Onaylandı',
                mesaj: `"${basvuru.firma_adi}" adlı firma başvurunuz onaylandı! Artık platformu kullanmaya başlayabilirsiniz.${note ? `\n\nNot: ${note}` : ''}`,
                link: `/firma/panel`
            });
        } catch (notificationError) {
            console.error('⚠️ Bildirim oluşturma hatası (işlem başarılı):', notificationError);
        }

        res.json({
            success: true,
            message: 'Firma başvurusu onaylandı ve firmalar tablosuna kayıt oluşturuldu',
            data: {
                basvuru_id: id,
                firma_id: firmaId,
                durum: verifyResult.rows[0]?.durum
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Approve company hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Firma onaylama işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Reject Company - POST /api/sanayi/companies/reject/:id
// firma_basvurulari tablosundaki başvuruyu reddet
const rejectCompany = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params; // basvuru_id
        const { reason } = req.body;

        if (!reason) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Red nedeni zorunludur'
            });
        }

        // Başvuruyu kontrol et ve firma bilgilerini al
        const checkResult = await client.query(
            `SELECT id, durum, firma_adi, kullanici_id 
             FROM firma_basvurulari 
             WHERE id = $1`,
            [id]
        );

        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Firma başvurusu bulunamadı'
            });
        }

        const basvuru = checkResult.rows[0];
        // Önceki durumu al
        const oncekiDurum = basvuru.durum;

        // Başvuru durumunu 'reddedildi' yap ve red nedeni ekle
        await client.query(
            `UPDATE firma_basvurulari 
            SET durum = 'reddedildi', red_nedeni = $1, inceleme_tarihi = NOW(), 
                inceleyen_id = $2, guncelleme = NOW()
            WHERE id = $3`,
            [reason, req.user?.id, id]
        );

        // Başvurunun firma_id'sini kontrol et (varsa)
        const basvuruDetayResult = await client.query(
            'SELECT firma_id FROM firma_basvurulari WHERE id = $1',
            [id]
        );
        const firmaId = basvuruDetayResult.rows.length > 0 
            ? basvuruDetayResult.rows[0].firma_id 
            : null;

        await client.query('COMMIT');
        
        // Log kaydı ekle - Red (transaction commit edildikten sonra)
        try {
            const logClient = await pool.connect();
            try {
                await logFirmaActivity(logClient, {
                    kullanici_id: req.user?.id,
                    firma_id: firmaId,
                    basvuru_id: id,
                    islem_tipi: 'red',
                    eski_durum: oncekiDurum,
                    yeni_durum: 'reddedildi',
                    aciklama: reason || 'Firma başvurusu reddedildi',
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
            } finally {
                logClient.release();
            }
        } catch (logError) {
            console.error('⚠️ Log kayıt hatası (işlem başarılı):', logError.message);
        }

        // Bildirim oluştur - Firmaya başvuru reddedildi bildirimi gönder
        try {
            await createNotification({
                kullanici_id: basvuru.kullanici_id,
                bildirim_tipi_kod: 'BASVURU',
                baslik: 'Firma Başvurunuz Reddedildi',
                mesaj: `"${basvuru.firma_adi}" adlı firma başvurunuz reddedildi.\n\nRed Nedeni: ${reason}\n\nLütfen eksiklikleri tamamlayıp tekrar başvurunuzu yapabilirsiniz.`,
                link: `/firma/panel`
            });
        } catch (notificationError) {
            console.error('⚠️ Bildirim oluşturma hatası (işlem başarılı):', notificationError);
        }

        res.json({
            success: true,
            message: 'Firma başvurusu reddedildi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Reject company hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Firma reddetme işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Get Registered Companies - GET /api/sanayi/companies/registered
// Sadece onaylanmış firmaları göster (firmalar tablosundan aktif olanlar + firma_basvurulari tablosundan onaylandi olanlar)
const getRegisteredCompanies = async (req, res) => {
    try {
        // Query parametrelerini validate et ve parse et
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search } = req.query;
        
        // Validation
        if (isNaN(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz sayfa numarası'
            });
        }
        
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz limit değeri (1-100 arası olmalı)'
            });
        }
        
        const offset = (page - 1) * limit;
        const params = [];
        let paramIndex = 1;
        let searchClause = '';

        if (search) {
            searchClause = ` AND (k.ad ILIKE $${paramIndex} OR k.soyad ILIKE $${paramIndex} OR k.eposta ILIKE $${paramIndex} OR combined.firma_adi ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        // Toplam sayı - aktif firmalar ve beklemede/incelemede/eksik/onaylandi durumundaki başvurular
        const countQuery = `
            SELECT COUNT(*) as total
            FROM (
                SELECT f.id
                FROM firmalar f
                LEFT JOIN kullanicilar k ON f.kullanici_id = k.id
                WHERE f.durum = 'aktif' AND f.silinme IS NULL
                  AND (k.silinme IS NULL OR k.id IS NULL)
                ${search ? ` AND (COALESCE(k.ad, '') ILIKE $1 OR COALESCE(k.soyad, '') ILIKE $1 OR COALESCE(k.eposta, '') ILIKE $1 OR f.ad ILIKE $1)` : ''}
                UNION
                SELECT fb.id
                FROM firma_basvurulari fb
                LEFT JOIN kullanicilar k ON fb.kullanici_id = k.id
                WHERE fb.durum IN ('beklemede', 'incelemede', 'eksik')
                  AND (k.silinme IS NULL OR k.id IS NULL)
                ${search ? ` AND (COALESCE(k.ad, '') ILIKE $1 OR COALESCE(k.soyad, '') ILIKE $1 OR COALESCE(k.eposta, '') ILIKE $1 OR fb.firma_adi ILIKE $1)` : ''}
                UNION
                SELECT fb.id
                FROM firma_basvurulari fb
                LEFT JOIN kullanicilar k ON fb.kullanici_id = k.id
                WHERE fb.durum = 'onaylandi' AND fb.firma_id IS NULL
                  AND (k.silinme IS NULL OR k.id IS NULL)
                ${search ? ` AND (COALESCE(k.ad, '') ILIKE $1 OR COALESCE(k.soyad, '') ILIKE $1 OR COALESCE(k.eposta, '') ILIKE $1 OR fb.firma_adi ILIKE $1)` : ''}
            ) combined
        `;
        const countParams = search ? [`%${search}%`] : [];
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0]?.total || 0);

        // Sayfalama ile veriler - aktif firmalar ve beklemede/incelemede/eksik/onaylandi durumundaki başvurular
        const limitParamIndex = paramIndex;
        const offsetParamIndex = paramIndex + 1;
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                COALESCE(k.id::text, combined.id::text) as id,
                COALESCE(CONCAT(k.ad, ' ', k.soyad), combined.basvuran_adi, 'Bilinmeyen') as name,
                COALESCE(k.eposta, '') as email,
                combined.firma_adi as "companyName",
                COALESCE(k.telefon, combined.telefon, '') as phone,
                combined.durum as status,
                combined.olusturma as "registrationDate",
                COALESCE(s.ad, 'Sektör Yok') as sector
            FROM (
                -- Sadece aktif firmalar (beklemede olanlar firma_basvurulari'nde olacak)
                SELECT f.id, f.kullanici_id, f.ad as firma_adi, NULL::text as basvuran_adi, f.telefon, f.olusturma, f.sektor_id, 'aktif' as durum
                FROM firmalar f
                WHERE f.durum = 'aktif' AND f.silinme IS NULL
                UNION ALL
                -- Beklemede, incelemede, eksik durumundaki başvurular (firma_id olsa bile)
                SELECT fb.id, fb.kullanici_id, fb.firma_adi, fb.basvuran_adi, fb.telefon, fb.basvuru_tarihi as olusturma, fb.sektor_id, fb.durum
                FROM firma_basvurulari fb
                WHERE fb.durum IN ('beklemede', 'incelemede', 'eksik')
                  AND fb.kullanici_id IS NOT NULL
                UNION ALL
                -- Onaylanmış ama henüz firmalar tablosuna geçmemiş başvurular
                SELECT fb.id, fb.kullanici_id, fb.firma_adi, fb.basvuran_adi, fb.telefon, fb.basvuru_tarihi as olusturma, fb.sektor_id, fb.durum
                FROM firma_basvurulari fb
                WHERE fb.durum = 'onaylandi' AND fb.firma_id IS NULL
            ) combined
            LEFT JOIN kullanicilar k ON combined.kullanici_id = k.id
            LEFT JOIN sektorler s ON combined.sektor_id = s.id
            WHERE (k.silinme IS NULL OR k.id IS NULL)
            ${searchClause}
            ORDER BY combined.olusturma DESC
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Registered companies query:', dataQuery);
            console.log('🔍 Params:', params);
        }
        const dataResult = await pool.query(dataQuery, params);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Registered companies: ${dataResult.rows.length} kayıt bulundu (toplam: ${total})`);
        }

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            companies: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Registered companies hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: 'Kayıtlı firmalar alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Dashboard Products - GET /api/sanayi/dashboard/products
const getDashboardProducts = async (req, res) => {
    try {
        const { search } = req.query;

        let whereClause = "WHERE u.durum IN ('stokta', 'aktif') AND u.silinme IS NULL";
        const params = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (u.ad ILIKE $${paramIndex} OR u.aciklama ILIKE $${paramIndex} OR k.ad ILIKE $${paramIndex} OR k.soyad ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        const query = `
            SELECT 
                u.id,
                u.ad as name,
                COALESCE(uk.ad, 'Kategori Yok') as category,
                CONCAT(k.ad, ' ', k.soyad) as farmer,
                u.durum as status,
                COALESCE(u.birim_fiyat, 0) as price,
                COALESCE(u.mevcut_miktar, 0) as stock
            FROM urunler u
            JOIN ciftlikler c ON u.ciftlik_id = c.id
            JOIN kullanicilar k ON c.kullanici_id = k.id
            LEFT JOIN urun_kategorileri uk ON u.kategori_id = uk.id
            ${whereClause}
            ORDER BY u.olusturma DESC
            LIMIT 50
        `;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            products: result.rows
        });
    } catch (error) {
        console.error('Dashboard products hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A'
        });
        res.status(500).json({
            success: false,
            message: 'Ürünler alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Activity Log - GET /api/sanayi/activity-log
const getActivityLog = async (req, res) => {
    try {
        // Query parametrelerini validate et ve parse et
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { type } = req.query;
        
        // Validation
        if (isNaN(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz sayfa numarası'
            });
        }
        
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz limit değeri (1-100 arası olmalı)'
            });
        }
        
        const offset = (page - 1) * limit;

        let whereClause = "WHERE a.varlik_tipi = 'firma'";
        const params = [];
        let paramIndex = 1;

        if (type) {
            whereClause += ` AND a.tip = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        // Toplam sayı
        const countQuery = `
            SELECT COUNT(*) as total
            FROM aktiviteler a
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);

        // Sayfalama ile veriler - firma başvuruları için firma adını da getir
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                a.id,
                a.tip as type,
                a.baslik as description,
                CONCAT(k.ad, ' ', k.soyad) as user,
                a.olusturma as timestamp,
                COALESCE(fb.firma_adi, f.ad, 'Bilinmeyen Firma') as "companyName",
                jsonb_build_object(
                    'varlik_tipi', a.varlik_tipi,
                    'varlik_id', a.varlik_id,
                    'aciklama', COALESCE(a.aciklama, ''),
                    'firma_adi', COALESCE(fb.firma_adi, f.ad, '')
                ) as details
            FROM aktiviteler a
            LEFT JOIN kullanicilar k ON a.kullanici_id = k.id
            LEFT JOIN firma_basvurulari fb ON a.varlik_id = fb.id AND (a.varlik_tipi = 'firma' OR a.varlik_tipi = 'firma_basvurusu')
            LEFT JOIN firmalar f ON a.varlik_id = f.id AND a.varlik_tipi = 'firma'
            ${whereClause}
            ORDER BY a.olusturma DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        const dataResult = await pool.query(dataQuery, params);

        const total = parseInt(countResult.rows[0]?.total || 0);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            activities: dataResult.rows || [],
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Activity log hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A'
        });
        // Aktivite log tablosu yoksa veya hata varsa boş array döndür
        res.json({
            success: true,
            activities: [],
            pagination: {
                page: parseInt(req.query.page || 1),
                limit: parseInt(req.query.limit || 10),
                total: 0,
                totalPages: 0
            }
        });
    }
};

// Get Company Logs - GET /api/sanayi/companies/:id/logs
// Firma başvurusu veya firma için log kayıtlarını getir
const getCompanyLogs = async (req, res) => {
    try {
        const { id } = req.params; // basvuru_id veya firma_id
        
        // Önce basvuru_id olarak kontrol et, yoksa firma_id olarak kabul et
        const basvuruCheck = await pool.query(
            'SELECT id, firma_id FROM firma_basvurulari WHERE id = $1',
            [id]
        );
        
        let basvuruId = null;
        let firmaId = null;
        
        if (basvuruCheck.rows.length > 0) {
            basvuruId = basvuruCheck.rows[0].id;
            firmaId = basvuruCheck.rows[0].firma_id;
        } else {
            // Eğer basvuru değilse, firma_id olarak kontrol et
            const firmaCheck = await pool.query(
                'SELECT id FROM firmalar WHERE id = $1',
                [id]
            );
            if (firmaCheck.rows.length > 0) {
                firmaId = firmaCheck.rows[0].id;
                // Bu firma için başvuruyu bul
                const basvuruFind = await pool.query(
                    'SELECT id FROM firma_basvurulari WHERE firma_id = $1 ORDER BY onay_tarihi DESC LIMIT 1',
                    [firmaId]
                );
                if (basvuruFind.rows.length > 0) {
                    basvuruId = basvuruFind.rows[0].id;
                }
            }
        }
        
        if (!basvuruId && !firmaId) {
            return res.status(404).json({
                success: false,
                message: 'Firma veya başvuru bulunamadı'
            });
        }
        
        // Aktivite loglarını getir (basvuru_id veya firma_id ile)
        const aktivitelerQuery = `
            SELECT 
                a.id,
                a.tip as type,
                a.baslik as title,
                a.aciklama as description,
                a.olusturma as timestamp,
                CONCAT(k.ad, ' ', k.soyad) as user_name,
                k.eposta as user_email,
                a.ip_adresi as ip_address,
                a.varlik_tipi,
                a.varlik_id
            FROM aktiviteler a
            LEFT JOIN kullanicilar k ON a.kullanici_id = k.id
            WHERE a.varlik_tipi = 'firma' 
            AND (a.varlik_id = $1 ${basvuruId && firmaId ? 'OR a.varlik_id = $2' : ''})
            ORDER BY a.olusturma DESC
            LIMIT 100
        `;
        
        const aktiviteParams = firmaId ? (basvuruId ? [firmaId, basvuruId] : [firmaId]) : [basvuruId];
        const aktivitelerResult = await pool.query(aktivitelerQuery, aktiviteParams);
        
        // Detaylı aktivite loglarını getir (basvuru_id ile)
        let detayliAktiviteler = [];
        if (basvuruId) {
            const detayliQuery = `
                SELECT 
                    da.id,
                    da.islem_tipi as type,
                    da.baslik as title,
                    da.aciklama as description,
                    da.onceki_durum as old_status,
                    da.sonraki_durum as new_status,
                    da.olusturma as timestamp,
                    CONCAT(k.ad, ' ', k.soyad) as user_name,
                    k.eposta as user_email,
                    da.ip_adresi as ip_address
                FROM detayli_aktiviteler da
                LEFT JOIN kullanicilar k ON da.kullanici_id = k.id
                WHERE da.hedef_tipi = 'firma_basvurusu' 
                AND da.hedef_id = $1
                ORDER BY da.olusturma DESC
                LIMIT 100
            `;
            const detayliResult = await pool.query(detayliQuery, [basvuruId]);
            detayliAktiviteler = detayliResult.rows;
        }
        
        // Değişiklik loglarını getir (firma_id ile) - tablo varsa
        let degisiklikLoglari = [];
        if (firmaId) {
            try {
                const degisiklikQuery = `
                    SELECT 
                        dl.id,
                        dl.alan_adi as field_name,
                        dl.eski_deger as old_value,
                        dl.yeni_deger as new_value,
                        dl.sebep as reason,
                        dl.olusturma as timestamp,
                        CONCAT(k.ad, ' ', k.soyad) as user_name,
                        k.eposta as user_email
                    FROM degisiklik_loglari dl
                    LEFT JOIN kullanicilar k ON dl.degistiren_id = k.id
                    WHERE dl.varlik_tipi = 'firma' 
                    AND dl.varlik_id = $1
                    ORDER BY dl.olusturma DESC
                    LIMIT 100
                `;
                const degisiklikResult = await pool.query(degisiklikQuery, [firmaId]);
                degisiklikLoglari = degisiklikResult.rows;
            } catch (error) {
                // Tablo yoksa boş array döndür
                if (process.env.NODE_ENV === 'development') {
                    console.warn('degisiklik_loglari tablosu bulunamadı, boş array döndürülüyor');
                }
            }
        }
        
        res.json({
            success: true,
            logs: {
                activities: aktivitelerResult.rows,
                detailedActivities: detayliAktiviteler,
                changeLogs: degisiklikLoglari
            }
        });
    } catch (error) {
        console.error('Company logs hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Log kayıtları alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get All Company Logs - GET /api/sanayi/companies/logs/all
// Tüm firma işlem loglarını getir (seçili duruma göre filtreleme için)
const getAllCompanyLogs = async (req, res) => {
    try {
        const { status, limit: limitParam } = req.query;
        const limit = parseInt(limitParam) || 100;
        
        // Tüm aktivite loglarını getir (firma ile ilgili)
        const aktivitelerQuery = `
            SELECT 
                a.id,
                a.tip as type,
                a.baslik as title,
                a.aciklama as description,
                a.olusturma as timestamp,
                CONCAT(k.ad, ' ', k.soyad) as user_name,
                k.eposta as user_email,
                a.varlik_id,
                a.varlik_tipi
            FROM aktiviteler a
            LEFT JOIN kullanicilar k ON a.kullanici_id = k.id
            WHERE a.varlik_tipi = 'firma'
            ORDER BY a.olusturma DESC
            LIMIT $1
        `;
        
        const aktivitelerResult = await pool.query(aktivitelerQuery, [limit]);
        
        // Tüm detaylı aktivite loglarını getir (firma başvuruları ile ilgili)
        const detayliQuery = `
            SELECT 
                da.id,
                da.islem_tipi as type,
                da.baslik as title,
                da.aciklama as description,
                da.onceki_durum as old_status,
                da.sonraki_durum as new_status,
                da.olusturma as timestamp,
                CONCAT(k.ad, ' ', k.soyad) as user_name,
                k.eposta as user_email,
                da.hedef_id as varlik_id
            FROM detayli_aktiviteler da
            LEFT JOIN kullanicilar k ON da.kullanici_id = k.id
            WHERE da.kategori = 'firma' AND da.hedef_tipi = 'firma_basvurusu'
            ORDER BY da.olusturma DESC
            LIMIT $1
        `;
        const detayliResult = await pool.query(detayliQuery, [limit]);
        
        // Tüm değişiklik loglarını getir (firma ile ilgili) - tablo varsa
        let degisiklikResult = { rows: [] };
        try {
            const degisiklikQuery = `
                SELECT 
                    dl.id,
                    dl.alan_adi as field_name,
                    dl.eski_deger as old_value,
                    dl.yeni_deger as new_value,
                    dl.sebep as reason,
                    dl.olusturma as timestamp,
                    CONCAT(k.ad, ' ', k.soyad) as user_name,
                    k.eposta as user_email,
                    dl.varlik_id
                FROM degisiklik_loglari dl
                LEFT JOIN kullanicilar k ON dl.degistiren_id = k.id
                WHERE dl.varlik_tipi = 'firma'
                ORDER BY dl.olusturma DESC
                LIMIT $1
            `;
            degisiklikResult = await pool.query(degisiklikQuery, [limit]);
        } catch (error) {
            // Tablo yoksa boş array döndür
            if (process.env.NODE_ENV === 'development') {
                console.warn('degisiklik_loglari tablosu bulunamadı, boş array döndürülüyor');
            }
        }
        
        res.json({
            success: true,
            logs: {
                activities: aktivitelerResult.rows,
                detailedActivities: detayliResult.rows,
                changeLogs: degisiklikResult.rows
            }
        });
    } catch (error) {
        console.error('All company logs hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Log kayıtları alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Belge durumunu güncelle - PUT /api/sanayi/documents/:belgeId
const updateDocumentStatus = async (req, res) => {
    try {
        const { belgeId } = req.params;
        const { status, reason, adminNote } = req.body;

        // Belgeyi kontrol et
        const checkResult = await pool.query(
            'SELECT id, basvuru_id, basvuru_tipi FROM belgeler WHERE id = $1',
            [belgeId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Belge bulunamadı'
            });
        }

        const belge = checkResult.rows[0];

        // Durum mapping: Frontend -> Backend
        const statusMap = {
            'Onaylandı': 'onaylandi',
            'Reddedildi': 'reddedildi',
            'Eksik': 'eksik',
            'Beklemede': 'beklemede'
        };
        const backendStatus = statusMap[status] || 'beklemede';

        // Belgeyi güncelle
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        updateFields.push(`durum = $${paramIndex++}`);
        updateValues.push(backendStatus);

        if (reason !== undefined) {
            updateFields.push(`red_nedeni = $${paramIndex++}`);
            updateValues.push(reason);
        }

        if (adminNote !== undefined) {
            updateFields.push(`yonetici_notu = $${paramIndex++}`);
            updateValues.push(adminNote);
        }

        updateFields.push(`inceleme_tarihi = NOW()`);
        updateFields.push(`inceleyen_id = $${paramIndex++}`);
        updateValues.push(req.user?.id);

        updateFields.push(`guncelleme = NOW()`);
        updateValues.push(belgeId);

        const updateQuery = `
            UPDATE belgeler 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
        `;

        await pool.query(updateQuery, updateValues);

        res.json({
            success: true,
            message: 'Belge durumu güncellendi'
        });
    } catch (error) {
        console.error('Belge güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Belge güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update Company - PUT /api/sanayi/companies/:id
// Şirket durumunu ve sektörünü güncelle
const updateCompany = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params; // kullanici_id veya firma_id
        const { status, sector, reason } = req.body; // reason: Pasif durumuna çekme sebebi

        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Update company isteği:', {
                id: id,
                status: status,
                sector: sector,
                reason: reason,
                user_id: req.user?.id
            });
        }

        // Önce firmayı bul - önce firmalar tablosunda ara, yoksa firma_basvurulari'nde ara
        let firma = null;
        let eskiDurum = null;
        let eskiSektorId = null;
        let firmaId = null;
        let firmaKayitTipi = null; // 'firmalar' veya 'firma_basvurulari'

        // Önce firmalar tablosunda ara
        const firmaResult = await client.query(
            `SELECT id, durum, sektor_id, kullanici_id, ad as firma_adi
             FROM firmalar
             WHERE kullanici_id = $1 AND silinme IS NULL`,
            [id]
        );

        if (firmaResult.rows.length > 0) {
            firma = firmaResult.rows[0];
            firmaId = firma.id;
            eskiDurum = firma.durum;
            eskiSektorId = firma.sektor_id;
            firmaKayitTipi = 'firmalar';
        } else {
            // firmalar tablosunda yoksa firma_basvurulari'nde ara
            const basvuruResult = await client.query(
                `SELECT id, durum, sektor_id, kullanici_id, firma_adi
                 FROM firma_basvurulari
                 WHERE kullanici_id = $1 AND durum = 'onaylandi'`,
                [id]
            );

            if (basvuruResult.rows.length > 0) {
                firma = basvuruResult.rows[0];
                firmaId = firma.id;
                eskiDurum = firma.durum;
                eskiSektorId = firma.sektor_id;
                firmaKayitTipi = 'firma_basvurulari';
            }
        }

        if (!firma) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        // Durum mapping: Frontend -> Backend
        const statusMap = {
            'Aktif': 'aktif',
            'Beklemede': 'beklemede',
            'İncelemede': 'incelemede',
            'Eksik Evrak': 'eksik',
            'Pasif': 'pasif'
        };
        const backendStatus = status ? (statusMap[status] || status.toLowerCase()) : null;

        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Durum mapping:', {
                frontendStatus: status,
                backendStatus: backendStatus,
                eskiDurum: eskiDurum
            });
        }

        // Sektör ID'sini bul
        let yeniSektorId = eskiSektorId;
        if (sector && sector !== 'Sektör Yok') {
            const sektorResult = await client.query(
                'SELECT id FROM sektorler WHERE ad = $1',
                [sector]
            );
            if (sektorResult.rows.length > 0) {
                yeniSektorId = sektorResult.rows[0].id;
            } else {
                // Sektör yoksa oluştur
                // kod alanı NOT NULL, sektör adından kod oluştur
                // Örnek: "Bilgi Teknolojileri" -> "BILGI_TEKNOLOJILERI"
                let sektorKod = sector
                    .toUpperCase()
                    .replace(/Ğ/g, 'G')
                    .replace(/Ü/g, 'U')
                    .replace(/Ş/g, 'S')
                    .replace(/İ/g, 'I')
                    .replace(/Ö/g, 'O')
                    .replace(/Ç/g, 'C')
                    .replace(/[^A-Z0-9]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_|_$/g, '')
                    .substring(0, 20); // Maksimum 20 karakter
                
                // Eğer kod boşsa, sektör adının ilk harflerini kullan
                if (!sektorKod || sektorKod.length === 0) {
                    sektorKod = sector.substring(0, 20).toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'SEKTOR_' + Date.now().toString().slice(-6);
                }
                
                try {
                    // Önce kod ile kontrol et (UNIQUE constraint için)
                    const kodCheckResult = await client.query(
                        'SELECT id FROM sektorler WHERE kod = $1',
                        [sektorKod]
                    );
                    
                    if (kodCheckResult.rows.length > 0) {
                        // Aynı kodlu sektör varsa, onu kullan
                        yeniSektorId = kodCheckResult.rows[0].id;
                        if (process.env.NODE_ENV === 'development') {
                            console.log('⚠️ Aynı kodlu sektör bulundu, mevcut sektör kullanılıyor:', {
                                kod: sektorKod,
                                id: yeniSektorId
                            });
                        }
                    } else {
                        // Yeni sektör oluştur
                        const newSektorResult = await client.query(
                            'INSERT INTO sektorler (kod, ad, aktif) VALUES ($1, $2, TRUE) RETURNING id',
                            [sektorKod, sector]
                        );
                        yeniSektorId = newSektorResult.rows[0].id;
                        
                        if (process.env.NODE_ENV === 'development') {
                            console.log('✅ Yeni sektör oluşturuldu:', {
                                kod: sektorKod,
                                ad: sector,
                                id: yeniSektorId
                            });
                        }
                    }
                } catch (insertError) {
                    // UNIQUE constraint hatası veya başka bir hata
                    console.error('⚠️ Sektör oluşturma hatası:', insertError);
                    // Hata olsa bile devam et, eski sektör ID'sini kullan
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('⚠️ Sektör oluşturulamadı, eski sektör ID kullanılıyor');
                    }
                }
            }
        } else if (sector === 'Sektör Yok') {
            yeniSektorId = null;
        }

        // Güncelleme alanlarını hazırla
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (backendStatus && backendStatus !== eskiDurum) {
            updateFields.push(`durum = $${paramIndex++}`);
            updateValues.push(backendStatus);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Durum güncellemesi eklendi:', {
                    eskiDurum: eskiDurum,
                    yeniDurum: backendStatus
                });
            }
        } else if (backendStatus && backendStatus === eskiDurum) {
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ Durum değişmedi, güncelleme yapılmayacak:', {
                    durum: backendStatus
                });
            }
        } else if (!backendStatus) {
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ backendStatus null, durum güncellemesi yapılmayacak');
            }
        }

        if (yeniSektorId !== eskiSektorId) {
            if (yeniSektorId) {
                updateFields.push(`sektor_id = $${paramIndex++}`);
                updateValues.push(yeniSektorId);
            } else {
                updateFields.push(`sektor_id = NULL`);
            }
        }

        if (updateFields.length > 0) {
            updateFields.push(`guncelleme = NOW()`);
            updateValues.push(firmaId);

            // Hangi tabloda güncelleme yapılacak?
            const updateQuery = firmaKayitTipi === 'firmalar'
                ? `UPDATE firmalar SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`
                : `UPDATE firma_basvurulari SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 Firma güncelleme sorgusu:', {
                    query: updateQuery,
                    values: updateValues,
                    firmaKayitTipi: firmaKayitTipi,
                    firmaId: firmaId
                });
            }
            
            const updateResult = await client.query(updateQuery, updateValues);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Firma güncellendi:', {
                    rowCount: updateResult.rowCount,
                    firmaId: firmaId
                });
            }
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ Güncelleme alanı yok, değişiklik yok');
            }
        }

        // Transaction'ı commit et - firma güncellemesi tamamlandı
        await client.query('COMMIT');
        client.release();

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Ana transaction commit edildi');
        }

        // Eğer durum "beklemede", "incelemede", "eksik" veya "pasif" yapılıyorsa ve firma firmalar tablosundaysa,
        // firma_basvurulari tablosunda da bir kayıt oluştur/güncelle (ayrı transaction'da)
        if ((backendStatus === 'beklemede' || backendStatus === 'incelemede' || backendStatus === 'eksik' || backendStatus === 'pasif') && firmaKayitTipi === 'firmalar') {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 firma_basvurulari işlemi başlatılıyor:', {
                    backendStatus: backendStatus,
                    firmaKayitTipi: firmaKayitTipi,
                    firmaId: firmaId
                });
            }
            const basvuruClient = await pool.connect();
            try {
                // Önce firma_basvurulari tablosunda bu firma için kayıt var mı kontrol et
                // Önce firma_id ile kontrol et, yoksa kullanici_id ile kontrol et
                let basvuruCheckResult = await basvuruClient.query(
                `SELECT id, durum, kullanici_id, firma_id FROM firma_basvurulari WHERE firma_id = $1`,
                [firmaId]
            );

                // Eğer firma_id ile kayıt yoksa, kullanici_id ile kontrol et
                if (basvuruCheckResult.rows.length === 0) {
                    basvuruCheckResult = await basvuruClient.query(
                    `SELECT id, durum, kullanici_id, firma_id FROM firma_basvurulari 
                     WHERE kullanici_id = $1 AND (durum IN ('beklemede', 'incelemede', 'eksik', 'pasif', 'onaylandi') OR firma_id IS NULL)
                     ORDER BY basvuru_tarihi DESC LIMIT 1`,
                    [firma.kullanici_id]
                );
            }

            if (basvuruCheckResult.rows.length > 0) {
                // Mevcut kaydı güncelle
                const basvuruUpdateFields = [];
                const basvuruUpdateValues = [];
                let basvuruParamIndex = 1;

                basvuruUpdateFields.push(`durum = $${basvuruParamIndex++}`);
                basvuruUpdateValues.push(backendStatus);

                // firma_id yoksa ekle
                if (!basvuruCheckResult.rows[0].firma_id) {
                    basvuruUpdateFields.push(`firma_id = $${basvuruParamIndex++}`);
                    basvuruUpdateValues.push(firmaId);
                }

                if (yeniSektorId !== eskiSektorId) {
                    if (yeniSektorId) {
                        basvuruUpdateFields.push(`sektor_id = $${basvuruParamIndex++}`);
                        basvuruUpdateValues.push(yeniSektorId);
                    } else {
                        basvuruUpdateFields.push(`sektor_id = NULL`);
                    }
                }

                basvuruUpdateFields.push(`guncelleme = NOW()`);
                basvuruUpdateValues.push(basvuruCheckResult.rows[0].id);

                    const basvuruUpdateQuery = `
                        UPDATE firma_basvurulari 
                        SET ${basvuruUpdateFields.join(', ')} 
                        WHERE id = $${basvuruParamIndex}
                    `;
                    await basvuruClient.query(basvuruUpdateQuery, basvuruUpdateValues);
                    
                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ firma_basvurulari güncellendi:', {
                            basvuruId: basvuruCheckResult.rows[0].id,
                            yeniDurum: backendStatus
                        });
                    }
                } else {
                    // Yeni kayıt oluştur - firma bilgilerini firma_basvurulari'ne kopyala
                    const firmaDetayResult = await basvuruClient.query(
                    `SELECT ad, vergi_no, telefon, adres, sektor_id, kullanici_id, aciklama
                     FROM firmalar 
                     WHERE id = $1`,
                    [firmaId]
                );

                if (firmaDetayResult.rows.length > 0) {
                    const firmaDetay = firmaDetayResult.rows[0];
                    
                    // Kullanıcı bilgilerini al
                    const kullaniciResult = await basvuruClient.query(
                        `SELECT ad, soyad, eposta FROM kullanicilar WHERE id = $1`,
                        [firmaDetay.kullanici_id]
                    );
                    
                    if (kullaniciResult.rows.length === 0) {
                        console.error('⚠️ Kullanıcı bulunamadı:', firmaDetay.kullanici_id);
                        // Hata fırlatmak yerine sadece log'a yaz (ana işlem başarılı)
                        if (process.env.NODE_ENV === 'development') {
                            console.warn('⚠️ UYARI: Kullanıcı bulunamadı, firma_basvurulari kaydı oluşturulamadı');
                        }
                        // Kullanıcı yoksa INSERT yapma, sadece log'a yaz
                        return; // Bu catch bloğuna düşecek
                    }
                    
                    const kullaniciAd = kullaniciResult.rows[0]?.ad || '';
                    const kullaniciSoyad = kullaniciResult.rows[0]?.soyad || '';
                    const kullaniciEposta = kullaniciResult.rows[0]?.eposta || '';

                    // basvuran_adi boş olamaz (NOT NULL constraint), en azından firma adını kullan
                    const basvuranAdi = `${kullaniciAd} ${kullaniciSoyad}`.trim() || firmaDetay.ad || 'Firma Yetkilisi';
                    
                    // firma_adi boş olamaz (NOT NULL constraint)
                    const firmaAdi = firmaDetay.ad || 'Firma';
                    
                    // kullanici_id null olamaz (NOT NULL constraint)
                    if (!firmaDetay.kullanici_id) {
                        console.error('⚠️ kullanici_id null:', firmaDetay);
                        // Hata fırlatmak yerine sadece log'a yaz (ana işlem başarılı)
                        if (process.env.NODE_ENV === 'development') {
                            console.warn('⚠️ UYARI: kullanici_id null, firma_basvurulari kaydı oluşturulamadı');
                        }
                        // kullanici_id yoksa INSERT yapma, sadece log'a yaz
                        return; // Bu catch bloğuna düşecek
                    }

                    await basvuruClient.query(
                        `INSERT INTO firma_basvurulari 
                         (firma_id, kullanici_id, firma_adi, basvuran_adi, sektor_id, durum, 
                          vergi_no, telefon, eposta, adres, aciklama, basvuru_tarihi, guncelleme)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                        [
                            firmaId,
                            firmaDetay.kullanici_id,
                            firmaAdi,
                            basvuranAdi,
                            yeniSektorId || firmaDetay.sektor_id,
                            backendStatus, // 'beklemede', 'incelemede', 'eksik' veya 'pasif'
                            firmaDetay.vergi_no || null,
                            firmaDetay.telefon || null,
                            kullaniciEposta || null,
                            firmaDetay.adres || null,
                            firmaDetay.aciklama || null
                        ]
                    );
                    
                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ firma_basvurulari kaydı oluşturuldu:', {
                            firmaId: firmaId,
                            durum: backendStatus,
                            firmaAdi: firmaAdi,
                            basvuranAdi: basvuranAdi
                        });
                    }
                } else {
                    console.error('⚠️ Firma detayları bulunamadı:', firmaId);
                    throw new Error(`Firma detayları bulunamadı: ${firmaId}`);
                }
            }
            } catch (basvuruError) {
                console.error('⚠️ firma_basvurulari güncelleme hatası (ana işlem başarılı):', basvuruError);
                console.error('⚠️ Hata detayları:', {
                    message: basvuruError.message,
                    code: basvuruError.code,
                    detail: basvuruError.detail,
                    hint: basvuruError.hint
                });
                // Bu hata ana işlemi etkilemez, sadece log'a yaz
            } finally {
                basvuruClient.release();
            }
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Update company işlemi tamamlandı:', {
                firmaId: firmaId,
                durum: backendStatus || eskiDurum,
                sektorId: yeniSektorId
            });
        }

        // Log kaydı ekle (transaction commit edildikten sonra)
        try {
            const logClient = await pool.connect();
            try {
                const sektorAd = sector || (yeniSektorId ? 
                    (await pool.query('SELECT ad FROM sektorler WHERE id = $1', [yeniSektorId])).rows[0]?.ad : 
                    'Sektör Yok');
                const eskiSektorAd = eskiSektorId ? 
                    (await pool.query('SELECT ad FROM sektorler WHERE id = $1', [eskiSektorId])).rows[0]?.ad : 
                    'Sektör Yok';

                const aciklama = [
                    backendStatus && backendStatus !== eskiDurum ? `Durum: ${eskiDurum} → ${backendStatus}` : null,
                    yeniSektorId !== eskiSektorId ? `Sektör: ${eskiSektorAd} → ${sektorAd}` : null,
                    reason && backendStatus === 'pasif' ? `Sebep: ${reason}` : null
                ].filter(Boolean).join(', ');

                await logFirmaActivity(logClient, {
                    kullanici_id: req.user?.id,
                    firma_id: firmaId,
                    basvuru_id: firmaKayitTipi === 'firma_basvurulari' ? firmaId : null,
                    islem_tipi: 'durum_degisikligi',
                    eski_durum: eskiDurum,
                    yeni_durum: backendStatus || eskiDurum,
                    aciklama: aciklama || 'Firma bilgileri güncellendi',
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
            } finally {
                logClient.release();
            }
        } catch (logError) {
            console.error('⚠️ Log kayıt hatası (işlem başarılı):', logError.message);
        }

        res.json({
            success: true,
            message: 'Firma bilgileri güncellendi',
            data: {
                firma_id: firmaId,
                durum: backendStatus || eskiDurum,
                sektor_id: yeniSektorId
            }
        });
    } catch (error) {
        // Client hala açıksa rollback yap
        try {
            // Client zaten release edilmiş olabilir, kontrol et
            if (client && !client._ending && !client._released) {
                await client.query('ROLLBACK');
            }
        } catch (rollbackError) {
            console.error('⚠️ Rollback hatası:', rollbackError);
        }
        
        console.error('❌ Update company hatası:', error);
        console.error('❌ Hata detayları:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            query: error.query || 'N/A',
            params: error.params || 'N/A'
        });
        
        // Client'ı release et (eğer hala açıksa)
        try {
            if (client && !client._ending && !client._released) {
                client.release();
            }
        } catch (releaseError) {
            console.error('⚠️ Client release hatası:', releaseError);
        }
        
        res.status(500).json({
            success: false,
            message: 'Firma güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? {
                code: error.code,
                detail: error.detail,
                hint: error.hint
            } : undefined
        });
    } finally {
        // Client hala açıksa release et
        try {
            if (client && !client._ending) {
                client.release();
            }
        } catch (releaseError) {
            console.error('⚠️ Client release hatası:', releaseError);
        }
    }
};

module.exports = {
    getDashboardStats,
    getCompanyApplications,
    approveCompany,
    rejectCompany,
    getRegisteredCompanies,
    getDashboardProducts,
    getActivityLog,
    getCompanyLogs,
    getAllCompanyLogs,
    updateDocumentStatus,
    updateCompany
};

