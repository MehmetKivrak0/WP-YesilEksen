const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');
const { createNotification } = require('../utils/notificationHelper');

// Ziraat Admin Controller Fonksiyonları

// Yardımcı fonksiyon: Çiftlik aktivite logu kaydet
const logCiftlikActivity = async (client, options) => {
    const {
        kullanici_id,      // İşlemi yapan kullanıcı (admin)
        ciftlik_id,        // İlgili çiftlik ID (ciftlikler tablosu)
        basvuru_id,        // İlgili başvuru ID (ciftlik_basvurulari tablosu)
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
            ? 'Çiftlik başvurusu onaylandı'
            : islem_tipi === 'red'
                ? 'Çiftlik başvurusu reddedildi'
                : islem_tipi === 'durum_degisikligi'
                    ? `Çiftlik durumu değiştirildi: ${eski_durum} → ${yeni_durum}`
                    : 'Çiftlik işlemi';

        await client.query(
            `INSERT INTO aktiviteler 
            (kullanici_id, tip, varlik_tipi, varlik_id, baslik, aciklama, ip_adresi, user_agent)
            VALUES ($1, $2, 'ciftlik', $3, $4, $5, $6, $7)`,
            [
                kullanici_id,
                islem_tipi,
                ciftlik_id || basvuru_id, // Önce ciftlik_id, yoksa basvuru_id
                aktiviteBaslik,
                aciklama || '',
                ip_adresi || null,
                user_agent || null
            ]
        );

        // 2. Eğer durum değişikliği varsa degisiklik_loglari tablosuna kayıt ekle
        // Not: Bu fonksiyon artık transaction dışında çağrılıyor, bu yüzden hata olsa bile ana işlem etkilenmez
        if (eski_durum && yeni_durum && eski_durum !== yeni_durum) {
            try {
                await client.query(
                    `INSERT INTO degisiklik_loglari 
                    (varlik_tipi, varlik_id, alan_adi, eski_deger, yeni_deger, sebep, degistiren_id)
                    VALUES ('ciftlik', $1, 'durum', $2, $3, $4, $5)`,
                    [
                        ciftlik_id || basvuru_id,
                        eski_durum,
                        yeni_durum,
                        aciklama || null,
                        kullanici_id
                    ]
                );
            } catch (degisiklikError) {
                // degisiklik_loglari tablosu yoksa devam et (ana işlem zaten başarılı)
                console.warn('⚠️ degisiklik_loglari tablosuna yazılamadı:', degisiklikError.message);
            }
        }

        // 3. detayli_aktiviteler tablosuna kayıt ekle (Sanayi/Ziraat dashboard'ları için)
        if (islem_tipi === 'onay' || islem_tipi === 'red') {
            const kullaniciResult = await client.query(
                `SELECT rol FROM kullanicilar WHERE id = $1`,
                [kullanici_id]
            );
            const rol = kullaniciResult.rows.length > 0 ? kullaniciResult.rows[0].rol : null;

            // Başvuruyu yapan kullanıcıyı bul (etkilenen kullanıcı)
            let etkilenen_kullanici_id = null;
            if (basvuru_id) {
                const basvuruResult = await client.query(
                    `SELECT kullanici_id FROM ciftlik_basvurulari WHERE id = $1`,
                    [basvuru_id]
                );
                etkilenen_kullanici_id = basvuruResult.rows.length > 0
                    ? basvuruResult.rows[0].kullanici_id
                    : null;
            }

            await client.query(
                `INSERT INTO detayli_aktiviteler 
                (kategori, kullanici_id, rol, islem_tipi, hedef_tipi, hedef_id, onceki_durum, sonraki_durum, baslik, aciklama, etkilenen_kullanici_id, ip_adresi, user_agent)
                VALUES ('ciftlik', $1, $2, $3, 'ciftlik_basvurusu', $4, $5, $6, $7, $8, $9, $10, $11)`,
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
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Çiftlik aktivite logu kaydedildi:', {
                islem_tipi,
                ciftlik_id,
                basvuru_id,
                durum: `${eski_durum} → ${yeni_durum}`
            });
        }
    } catch (error) {
        // Log hatası kritik değil, sadece console'a yaz
        console.error('⚠️ Aktivite log kayıt hatası (işlem devam ediyor):', error.message);
    }
};

// Yardımcı fonksiyon: UUID doğrulama
const isValidUUID = (value) => {
    if (!value || typeof value !== 'string') {
        return false;
    }
    const trimmed = value.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
};

// Yardımcı fonksiyon: Çiftlik durumu değiştiğinde kullanıcı durumunu senkronize et
// Çiftlik durumu 'aktif' olduğunda kullanıcı durumunu da 'aktif' yapar
const syncKullaniciDurumuFromCiftlik = async (client, ciftlikId, yeniDurum) => {
    try {
        // Çiftliğin kullanıcı ID'sini al
        const ciftlikResult = await client.query(
            'SELECT kullanici_id FROM ciftlikler WHERE id = $1',
            [ciftlikId]
        );

        if (ciftlikResult.rows.length === 0) {
            console.warn(`⚠️ [SYNC KULLANICI DURUMU] Çiftlik bulunamadı: ${ciftlikId}`);
            return;
        }

        const kullaniciId = ciftlikResult.rows[0].kullanici_id;

        // Çiftlik durumu 'aktif' ise kullanıcı durumunu da 'aktif' yap
        if (yeniDurum === 'aktif') {
            const updateResult = await client.query(
                'UPDATE kullanicilar SET durum = $1, guncelleme = NOW() WHERE id = $2 AND durum != $1',
                ['aktif', kullaniciId]
            );

            if (updateResult.rowCount > 0) {
                console.log(`✅ [SYNC KULLANICI DURUMU] Kullanıcı durumu aktif yapıldı:`, {
                    kullanici_id: kullaniciId,
                    ciftlik_id: ciftlikId
                });
            }
        }
        // Not: Çiftlik durumu 'aktif' değilse kullanıcı durumunu değiştirmiyoruz
        // Çünkü kullanıcının başka aktif çiftlikleri olabilir
    } catch (error) {
        // Hata kritik değil, sadece log'la
        console.error('⚠️ [SYNC KULLANICI DURUMU] Hata:', error.message);
    }
};

// Yardımcı fonksiyon: Tüm aktif çiftliklerin kullanıcı durumlarını senkronize et
// Mevcut veritabanındaki tüm aktif çiftlikler için kullanıcı durumlarını 'aktif' yapar
const syncAllAktifCiftlikKullanicilari = async (client) => {
    try {
        // Tüm aktif çiftliklerin kullanıcı ID'lerini al
        const result = await client.query(
            `SELECT DISTINCT kullanici_id 
             FROM ciftlikler 
             WHERE durum = 'aktif' AND silinme IS NULL`
        );

        const kullaniciIds = result.rows.map(row => row.kullanici_id);
        
        if (kullaniciIds.length === 0) {
            console.log('ℹ️ [SYNC ALL] Aktif çiftlik bulunamadı');
            return { updated: 0, total: 0 };
        }

        // Bu kullanıcıların durumlarını 'aktif' yap
        const updateResult = await client.query(
            `UPDATE kullanicilar 
             SET durum = 'aktif', guncelleme = NOW() 
             WHERE id = ANY($1::uuid[]) AND durum != 'aktif'`,
            [kullaniciIds]
        );

        console.log(`✅ [SYNC ALL] ${updateResult.rowCount} kullanıcının durumu aktif yapıldı`);
        
        return {
            updated: updateResult.rowCount,
            total: kullaniciIds.length
        };
    } catch (error) {
        console.error('❌ [SYNC ALL] Hata:', error.message);
        throw error;
    }
};

// Dashboard Stats - GET /api/ziraat/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        // Ürün onay istatistikleri
        const productStats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE durum = 'beklemede') as pending,
                COUNT(*) FILTER (WHERE durum = 'onaylandi') as approved,
                COUNT(*) FILTER (WHERE durum = 'revizyon') as revision
            FROM urun_basvurulari
        `);

        // Çiftlik başvuru istatistikleri - ciftlik_basvurulari tablosundan
        // Silinmiş kullanıcıların başvuruları sayılmamalı
        const farmStats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE cb.durum = 'ilk_inceleme') AS "newApplications",
                COUNT(*) FILTER (WHERE cb.durum = 'denetimde') AS "inspections",
                COUNT(*) FILTER (WHERE cb.durum = 'belge_eksik') AS "missingDocuments",
                COUNT(*) FILTER (WHERE cb.durum = 'reddedildi') AS "rejected",
                COUNT(*) FILTER (WHERE cb.durum = 'gcbelge') AS "guncelBelgeler",
                COUNT(*) AS "totalApplications"
            FROM ciftlik_basvurulari cb
            JOIN kullanicilar k ON cb.kullanici_id = k.id AND k.silinme IS NULL
        `);

        // Onaylanan çiftlik sayısı - ciftlikler tablosundan aktif çiftlikler (kayıtlı çiftçiler)
        const approvedFarmsCount = await pool.query(`
            SELECT COUNT(*) as approved
            FROM ciftlikler
            WHERE durum = 'aktif' AND silinme IS NULL
        `);

        // Toplam kayıtlı çiftçi
        const farmersCount = await pool.query(`
            SELECT COUNT(*) as total FROM ciftlikler WHERE durum = 'aktif' AND silinme IS NULL
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
                farmSummary: {
                    newApplications: parseInt(farmStats.rows[0].newApplications || farmStats.rows[0].newapplications || 0),
                    inspections: parseInt(farmStats.rows[0].inspections || 0),
                    missingDocuments: parseInt(farmStats.rows[0].missingDocuments || farmStats.rows[0].missingdocuments || 0),
                    rejected: parseInt(farmStats.rows[0].rejected || 0),
                    guncelBelgeler: parseInt(farmStats.rows[0].guncelBelgeler || farmStats.rows[0].guncelbelgeler || 0),
                    totalApplications: parseInt(farmStats.rows[0].totalApplications || farmStats.rows[0].totalapplications || 0),
                    approved: parseInt(approvedFarmsCount.rows[0].approved || 0)
                },
                totalFarmers: parseInt(farmersCount.rows[0].total || 0),
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

// Product Applications - GET /api/ziraat/products/applications
const getProductApplications = async (req, res) => {
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

        let whereClause = "WHERE u.durum IN ('beklemede', 'onaylandi', 'revizyon', 'incelemede', 'reddedildi')";
        const params = [];
        let paramIndex = 1;

        if (status) {
            whereClause += ` AND u.durum = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (u.urun_adi ILIKE $${paramIndex} OR u.basvuran_adi ILIKE $${paramIndex} OR c.ad ILIKE $${paramIndex} OR uk.ad ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Toplam sayı
        const countQuery = `
            SELECT COUNT(*) as total
            FROM urun_basvurulari u
            JOIN ciftlikler c ON u.ciftlik_id = c.id
            JOIN kullanicilar k ON c.kullanici_id = k.id
            LEFT JOIN urun_kategorileri uk ON u.kategori_id = uk.id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);

        // Sayfalama ile veriler
        // LIMIT ve OFFSET için parametre indekslerini doğru şekilde ayarla
        const limitParamIndex = paramIndex;
        const offsetParamIndex = paramIndex + 1;
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                u.id,
                u.urun_adi as name,
                u.basvuran_adi as applicant,
                u.durum as status,
                u.guncelleme as "lastUpdate",
                u.id::text as "applicationNumber",
                COALESCE(uk.ad, 'Çiftlik Atıkları') as sector,
                COALESCE(EXTRACT(YEAR FROM c.olusturma)::INTEGER, EXTRACT(YEAR FROM CURRENT_TIMESTAMP)::INTEGER) as "establishmentYear",
                '1-5' as "employeeCount",
                k.eposta as email,
                COALESCE(c.telefon, k.telefon, '') as phone,
                c.ad as "farmName",
                k.ad || ' ' || k.soyad as "contactName",
                u.basvuru_tarihi as "applicationDate",
                '' as "taxNumber",
                COALESCE(u.notlar, '') as description,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'name', doc_data.name,
                            'status', doc_data.status,
                            'url', doc_data.url,
                            'belgeId', doc_data.belgeId,
                            'farmerNote', doc_data.farmerNote,
                            'adminNote', doc_data.adminNote
                        ) ORDER BY doc_data.sort_order, doc_data.name
                    ) FILTER (WHERE doc_data.belgeId IS NOT NULL),
                    '[]'::json
                ) as documents
            FROM urun_basvurulari u
            JOIN ciftlikler c ON u.ciftlik_id = c.id
            JOIN kullanicilar k ON c.kullanici_id = k.id
            LEFT JOIN urun_kategorileri uk ON u.kategori_id = uk.id
            LEFT JOIN LATERAL (
                -- Belgeler tablosundaki belgeler
                SELECT 
                    COALESCE(bt.ad, b.ad, 'Belge') as name,
                    CASE 
                        WHEN b.durum = 'onaylandi' THEN 'Onaylandı'
                        WHEN b.durum = 'reddedildi' THEN 'Reddedildi'
                        WHEN b.durum = 'eksik' THEN 'Eksik'
                        ELSE 'Beklemede'
                    END as status,
                    b.dosya_yolu as url,
                    b.id::text as belgeId,
                    COALESCE(b.kullanici_notu, '') as farmerNote,
                    COALESCE(b.yonetici_notu, '') as adminNote,
                    1 as sort_order
                FROM belgeler b
                LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                WHERE b.basvuru_id::text = u.id::text AND b.basvuru_tipi = 'urun_basvurusu' AND b.basvuru_id IS NOT NULL
                
                UNION ALL
                
                -- Ürün fotoğrafları (urun_resimleri tablosundan)
                SELECT 
                    CASE 
                        WHEN ur.ana_resim = TRUE THEN 'Ürün Fotoğrafı'
                        ELSE 'Ek Fotoğraf'
                    END as name,
                    'Beklemede' as status,
                    ur.resim_url as url,
                    ur.id::text as belgeId,
                    '' as farmerNote,
                    '' as adminNote,
                    2 as sort_order
                FROM urun_resimleri ur
                WHERE ur.urun_id = u.urun_id
            ) doc_data ON TRUE
            ${whereClause}
            GROUP BY u.id, u.urun_id, u.urun_adi, u.basvuran_adi, u.durum, u.guncelleme, u.basvuru_tarihi, 
                     u.notlar, uk.ad, c.olusturma, k.eposta, c.telefon, k.telefon, c.ad, k.ad, k.soyad
            ORDER BY u.basvuru_tarihi DESC
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;
        const dataResult = await pool.query(dataQuery, params);

        const total = parseInt(countResult.rows[0].total || 0);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            applications: dataResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('❌ Product applications hatası:', error);
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
            message: 'Ürün başvuruları alınamadı',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code
            } : undefined
        });
    }
};

// Farm Applications - GET /api/ziraat/farms/applications
// Artık ciftlik_basvurulari tablosundan veri çekiyor (normalizasyon)
const getFarmApplications = async (req, res) => {
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

        // ciftlik_basvurulari tablosundan veri çek
        // Not: Onaylanmış başvurular (durum = 'onaylandi') genelde listede gösterilmez
        // çünkü bunlar artık ciftlikler tablosunda aktif çiftlik olarak kayıtlı
        let whereClause = "WHERE 1=1";
        const params = [];
        let paramIndex = 1;

        // Durum filtresi - ciftlik_basvurulari tablosundaki durum değerleri
        // Frontend mapping: 'ilk_inceleme' -> 'İlk İnceleme', 'onaylandi' -> 'Onaylandı', 'reddedildi' -> 'Reddedildi'
        // 'all' -> Tüm durumlar (Hepsi filtresi)
        if (status && status !== 'all') {
            // Belirli bir durum seçildiğinde
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔍 [FARM APPLICATIONS] Durum filtresi: ${status}`);
            }
            whereClause += ` AND cb.durum = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        } else if (!status) {
            // Durum filtresi yoksa (varsayılan) sadece onay bekleyen ve belge eksik başvuruları göster
            // Reddedilen başvurular sadece "Reddedildi" filtresi seçildiğinde gösterilir
            // Onaylanmış başvurular (durum = 'onaylandi') varsayılan olarak gösterilmez
            // çünkü bunlar ciftlikler tablosunda zaten aktif çiftlik olarak var
            // "gcbelge" durumu da varsayılan olarak gösterilmez, sadece "Güncel Belge" filtresi seçildiğinde gösterilir
            whereClause += ` AND cb.durum IN ('ilk_inceleme', 'belge_eksik')`;
        }
        // status === 'all' ise durum filtresi ekleme (tüm durumlar gösterilecek)

        if (search) {
            whereClause += ` AND (cb.ciftlik_adi ILIKE $${paramIndex} OR cb.sahip_adi ILIKE $${paramIndex} OR COALESCE(k.ad, '') ILIKE $${paramIndex} OR COALESCE(k.soyad, '') ILIKE $${paramIndex} OR cb.id::text ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Toplam sayı - ciftlik_basvurulari tablosundan
        // Silinmiş kullanıcıların başvuruları gözükmemeli
        const countQuery = `
            SELECT COUNT(*) as total
            FROM ciftlik_basvurulari cb
            JOIN kullanicilar k ON cb.kullanici_id = k.id AND k.silinme IS NULL
            ${whereClause}
        `;

        // Debug logları - her zaman göster (development modunda)
        console.log('🔍 [BACKEND] Farm applications count query:', countQuery);
        console.log('🔍 [BACKEND] Params:', params);
        console.log('🔍 [BACKEND] Status filter:', status);
        console.log('🔍 [BACKEND] Where clause:', whereClause);

        const countResult = await pool.query(countQuery, params);
        
        console.log('🔍 [BACKEND] Total count:', countResult.rows[0].total);
        
        // Eğer status 'gcbelge' ise ve count 0 ise, detaylı kontrol yap
        if (status === 'gcbelge') {
            const directCheck = await pool.query(
                `SELECT COUNT(*) as count 
                 FROM ciftlik_basvurulari 
                 WHERE durum = 'gcbelge'`
            );
            console.log('🔍 [BACKEND] Direct gcbelge count (no JOIN):', directCheck.rows[0].count);
            
            if (parseInt(directCheck.rows[0].count || 0) > 0) {
                // Eğer direkt sorguda kayıt varsa ama JOIN ile yoksa, kullanıcı silinmiş demektir
                const withUserCheck = await pool.query(
                    `SELECT COUNT(*) as count 
                     FROM ciftlik_basvurulari cb
                     JOIN kullanicilar k ON cb.kullanici_id = k.id AND k.silinme IS NULL
                     WHERE cb.durum = 'gcbelge'`
                );
                console.log('🔍 [BACKEND] gcbelge count with active users (JOIN):', withUserCheck.rows[0].count);
                
                // Örnek kayıtları göster
                const sampleRecords = await pool.query(
                    `SELECT cb.id, cb.ciftlik_adi, cb.durum, cb.kullanici_id, k.silinme, k.ad, k.soyad
                     FROM ciftlik_basvurulari cb
                     LEFT JOIN kullanicilar k ON cb.kullanici_id = k.id
                     WHERE cb.durum = 'gcbelge'
                     LIMIT 3`
                );
                console.log('🔍 [BACKEND] Sample gcbelge records:', sampleRecords.rows);
            }
        }

        // Sayfalama ile veriler - ciftlik_basvurulari tablosundan, belgeler de dahil
        // LIMIT ve OFFSET için parametre indekslerini doğru şekilde ayarla
        const limitParamIndex = paramIndex;
        const offsetParamIndex = paramIndex + 1;
        params.push(limit, offset);
        
        // Temiz ve güvenli SQL sorgusu
        // GROUP BY kuralı: Aggregate fonksiyonlar (json_agg) dışındaki tüm SELECT kolonları GROUP BY'da olmalı
        const dataQuery = `
            SELECT 
                cb.id,
                cb.ciftlik_adi as name,
                cb.sahip_adi as owner,
                cb.durum as status,
                cb.guncelleme as "lastUpdate",
                cb.basvuru_tarihi as "createdAt",
                cb.id::text as "applicationNumber",
                cb.konum as sector,
                EXTRACT(YEAR FROM cb.basvuru_tarihi)::INTEGER as "establishmentYear",
                '1-5' as "employeeCount",
                k.eposta as email,
                COALESCE(k.telefon, '') as phone,
                cb.basvuru_tarihi as "applicationDate",
                '' as "taxNumber",
                COALESCE(cb.notlar, '') as description,
                -- Belgeleri JSON array olarak topla
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
                            'belgeId', b.id::text,
                            'farmerNote', COALESCE(b.kullanici_notu, ''),
                            'adminNote', COALESCE(b.yonetici_notu, ''),
                            'redNedeni', COALESCE(b.red_nedeni, ''),
                            'yoneticiNotu', COALESCE(b.yonetici_notu, ''),
                            'zorunlu', COALESCE(b.zorunlu, bt.zorunlu, TRUE)
                        ) ORDER BY COALESCE(bt.ad, b.ad, '')
                    ) FILTER (WHERE b.id IS NOT NULL),
                    '[]'::json
                ) as documents
            FROM ciftlik_basvurulari cb
            JOIN kullanicilar k ON cb.kullanici_id = k.id AND k.silinme IS NULL
            LEFT JOIN belgeler b ON b.basvuru_id::text = cb.id::text AND b.basvuru_tipi = 'ciftlik_basvurusu'
            LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id AND bt.id IS NOT NULL
            ${whereClause}
            -- GROUP BY: Aggregate olmayan tüm kolonlar burada olmalı
            -- EXTRACT() fonksiyonu da GROUP BY'da olmalı çünkü SELECT'te kullanılıyor
            GROUP BY 
                cb.id, 
                cb.ciftlik_adi, 
                cb.sahip_adi, 
                cb.durum, 
                cb.guncelleme, 
                cb.konum, 
                cb.basvuru_tarihi, 
                k.eposta, 
                k.telefon, 
                cb.notlar,
                EXTRACT(YEAR FROM cb.basvuru_tarihi)
            ORDER BY cb.basvuru_tarihi DESC
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;

        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 [BACKEND] Farm applications data query:', dataQuery);
            console.log('🔍 [BACKEND] Data query params:', params);
        }

        const dataResult = await pool.query(dataQuery, params);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 [BACKEND] Data result rows:', dataResult.rows.length);
            if (dataResult.rows.length > 0) {
                console.log('🔍 [BACKEND] Data result sample (first row):', {
                    id: dataResult.rows[0].id,
                    name: dataResult.rows[0].name,
                    status: dataResult.rows[0].status,
                    owner: dataResult.rows[0].owner
                });
            } else if (status === 'gcbelge') {
                console.log('⚠️ [BACKEND] No rows returned for gcbelge! Checking database...');
                // Test query: Check if gcbelge records exist
                const testQuery = await pool.query(
                    `SELECT COUNT(*) as count FROM ciftlik_basvurulari WHERE durum = 'gcbelge'`
                );
                console.log('🔍 [BACKEND] Total gcbelge records in DB:', testQuery.rows[0].count);
                
                // Check if user exists and is not deleted
                const testQuery2 = await pool.query(
                    `SELECT cb.id, cb.durum, cb.ciftlik_adi, cb.kullanici_id, k.silinme, k.ad, k.soyad
                     FROM ciftlik_basvurulari cb 
                     LEFT JOIN kullanicilar k ON cb.kullanici_id = k.id 
                     WHERE cb.durum = 'gcbelge' 
                     LIMIT 5`
                );
                console.log('🔍 [BACKEND] Sample gcbelge records with user info:', testQuery2.rows);
                
                // Check with JOIN (as in actual query)
                const testQuery3 = await pool.query(
                    `SELECT cb.id, cb.durum, cb.ciftlik_adi, cb.kullanici_id, k.silinme
                     FROM ciftlik_basvurulari cb 
                     JOIN kullanicilar k ON cb.kullanici_id = k.id AND k.silinme IS NULL
                     WHERE cb.durum = 'gcbelge' 
                     LIMIT 5`
                );
                console.log('🔍 [BACKEND] gcbelge records with active users (JOIN):', testQuery3.rows.length);
                if (testQuery3.rows.length > 0) {
                    console.log('🔍 [BACKEND] Sample active gcbelge records:', testQuery3.rows);
                }
            }
        }

        const total = parseInt(countResult.rows[0].total || 0);
        const totalPages = Math.ceil(total / limit);

        // Belge URL'lerini tam URL'ye çevir ve atık türlerini parse et
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

            // Notlar'dan atık türlerini parse et
            let atikTurleri = [];
            if (row.description && row.description.includes('Atık Türleri:')) {
                const atikTurleriMatch = row.description.match(/Atık Türleri:\s*([^\n]+)/);
                if (atikTurleriMatch && atikTurleriMatch[1]) {
                    // Virgülle ayrılmış atık türlerini parse et
                    atikTurleri = atikTurleriMatch[1].split(',').map(t => t.trim()).filter(t => t);
                }
            }

            // Atık türlerini response'a ekle
            row.wasteTypes = atikTurleri;

            return row;
        });

        // Debug: Kaç kayıt bulundu
        console.log(`📊 [FARM APPLICATIONS] ${total} kayıt bulundu (ciftlik_basvurulari tablosundan)`);
        if (total > 0) {
            // İlk 5 kaydı göster (debug için)
            console.log('📋 [FARM APPLICATIONS] İlk 5 çiftlik durum bilgileri:', processedRows.slice(0, 5).map(r => ({
                id: r.id,
                name: r.name,
                status: r.status,
                lastUpdate: r.lastUpdate,
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
        console.error('❌ Farm applications hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A',
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position,
            internalQuery: error.internalQuery
        });
        
        // SQL hatası için daha detaylı mesaj
        let errorMessage = 'Çiftlik başvuruları alınamadı';
        if (error.code === '42703') {
            errorMessage = 'SQL hatası: Kolon bulunamadı. Lütfen veritabanı şemasını kontrol edin.';
        } else if (error.code === '42P01') {
            errorMessage = 'SQL hatası: Tablo bulunamadı. Lütfen veritabanı şemasını kontrol edin.';
        } else if (error.detail) {
            errorMessage = `SQL hatası: ${error.detail}`;
        } else if (error.message) {
            errorMessage = `Hata: ${error.message}`;
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code,
                position: error.position,
                query: error.query
            } : undefined
        });
    }
};

// Approve Product - POST /api/ziraat/products/approve/:id
const approveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        // Ürün başvurusunu kontrol et ve çiftçi bilgilerini al
        const checkResult = await pool.query(
            `SELECT ub.id, ub.durum, ub.urun_adi, ub.ciftlik_id, c.kullanici_id
             FROM urun_basvurulari ub
             JOIN ciftlikler c ON ub.ciftlik_id = c.id
             WHERE ub.id = $1`,
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün başvurusu bulunamadı'
            });
        }

        const basvuru = checkResult.rows[0];
        const ciftciKullaniciId = basvuru.kullanici_id;

        // Durumu güncelle
        await pool.query(
            'UPDATE urun_basvurulari SET durum = $1, guncelleme = NOW(), onay_tarihi = NOW(), inceleyen_id = $2 WHERE id = $3',
            ['onaylandi', req.user.id, id]
        );

        // Not varsa ekle
        if (note) {
            await pool.query(
                'UPDATE urun_basvurulari SET notlar = $1 WHERE id = $2',
                [note, id]
            );
        }

        // Bildirim oluştur - Çiftçiye ürün onaylandı bildirimi gönder
        try {
            await createNotification({
                kullanici_id: ciftciKullaniciId,
                bildirim_tipi_kod: 'BASVURU',
                baslik: 'Ürün Başvurusu Onaylandı',
                mesaj: `"${basvuru.urun_adi}" adlı ürün başvurunuz onaylandı. Ürününüz artık platformda görünebilir.${note ? `\n\nNot: ${note}` : ''}`,
                link: `/ciftlik/urunler`
            });
        } catch (notificationError) {
            console.error('⚠️ Bildirim oluşturma hatası (işlem başarılı):', notificationError);
        }

        res.json({
            success: true,
            message: 'Ürün başvurusu başarıyla onaylandı'
        });
    } catch (error) {
        console.error('Approve product hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün onaylama işlemi başarısız'
        });
    }
};

// Reject Product - POST /api/ziraat/products/reject/:id
const rejectProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Red nedeni zorunludur'
            });
        }

        // Ürün başvurusunu kontrol et ve çiftçi bilgilerini al
        const checkResult = await pool.query(
            `SELECT ub.id, ub.durum, ub.urun_adi, ub.ciftlik_id, c.kullanici_id
             FROM urun_basvurulari ub
             JOIN ciftlikler c ON ub.ciftlik_id = c.id
             WHERE ub.id = $1`,
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün başvurusu bulunamadı'
            });
        }

        const basvuru = checkResult.rows[0];
        const ciftciKullaniciId = basvuru.kullanici_id;

        // Durumu güncelle ve red nedeni ekle
        await pool.query(
            'UPDATE urun_basvurulari SET durum = $1, guncelleme = NOW(), red_nedeni = $2, inceleyen_id = $3 WHERE id = $4',
            ['reddedildi', reason, req.user.id, id]
        );

        // Bildirim oluştur - Çiftçiye ürün reddedildi bildirimi gönder
        try {
            await createNotification({
                kullanici_id: ciftciKullaniciId,
                bildirim_tipi_kod: 'BASVURU',
                baslik: 'Ürün Başvurusu Reddedildi',
                mesaj: `"${basvuru.urun_adi}" adlı ürün başvurunuz reddedildi.\n\nRed Nedeni: ${reason}\n\nLütfen eksiklikleri tamamlayıp tekrar başvurunuzu yapabilirsiniz.`,
                link: `/ciftlik/urunler`
            });
        } catch (notificationError) {
            console.error('⚠️ Bildirim oluşturma hatası (işlem başarılı):', notificationError);
        }

        res.json({
            success: true,
            message: 'Ürün başvurusu reddedildi'
        });
    } catch (error) {
        console.error('Reject product hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün reddetme işlemi başarısız'
        });
    }
};

// Approve Farm - POST /api/ziraat/farms/approve/:id
// ciftlik_basvurulari tablosundan başvuruyu onayla ve ciftlikler tablosuna kayıt oluştur
const approveFarm = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED');

        const { id } = req.params; // basvuru_id
        const { note } = req.body || {};

        // UUID formatını kontrol et ve temizle
        if (!id || typeof id !== 'string' || id.trim() === '') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Geçersiz başvuru ID\'si'
            });
        }

        const trimmedId = id.trim();

        console.log(`🔍 [CIFTLIK ONAY] Başvuru onaylama başlatıldı:`, {
            basvuru_id: trimmedId,
            user_id: req.user?.id
        });

        // Başvuruyu kontrol et
        const basvuruResult = await client.query(
            `SELECT cb.*, k.eposta, k.ad as kullanici_ad, k.soyad as kullanici_soyad 
             FROM ciftlik_basvurulari cb
             JOIN kullanicilar k ON cb.kullanici_id = k.id
             WHERE cb.id = $1::uuid`,
            [trimmedId]
        );

        if (basvuruResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Çiftlik başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];

        // NOT: Eksik belge kontrolü kaldırıldı
        // Admin zaten belgeleri kontrol edip onaylıyor, bu yüzden eksik belge kontrolü gereksiz
        // Eğer admin onaylıyorsa, belgeler yeterli demektir

        // Eğer başvuru zaten onaylanmışsa ve ciftlik_id varsa, mevcut çiftliği aktif yap
        if (basvuru.ciftlik_id && basvuru.durum === 'onaylandi') {
            const eskiDurumResult = await client.query(
                'SELECT durum FROM ciftlikler WHERE id = $1',
                [basvuru.ciftlik_id]
            );
            const eskiDurum = eskiDurumResult.rows.length > 0 ? eskiDurumResult.rows[0].durum : null;

            await client.query(
                'UPDATE ciftlikler SET durum = $1, guncelleme = NOW() WHERE id = $2',
                ['aktif', basvuru.ciftlik_id]
            );

            // Kullanıcının durumunu aktif yap (yardımcı fonksiyon ile)
            await syncKullaniciDurumuFromCiftlik(client, basvuru.ciftlik_id, 'aktif');

            await client.query('COMMIT');
            return res.json({
                success: true,
                message: 'Çiftlik zaten onaylanmış ve aktif edildi'
            });
        }

        // ciftlikler tablosuna yeni kayıt oluştur
        // NOT: aciklama kolonu veritabanında yok, bu yüzden kaldırıldı
        const ciftlikResult = await client.query(
            `INSERT INTO ciftlikler 
            (kullanici_id, ad, adres, durum, kayit_tarihi)
            VALUES ($1, $2, $3, 'aktif', CURRENT_DATE)
            RETURNING id`,
            [basvuru.kullanici_id, basvuru.ciftlik_adi, basvuru.konum]
        );

        const ciftlikId = ciftlikResult.rows[0].id;

        // Başvurunun mevcut durumunu kontrol et
        console.log(`🔍 [CIFTLIK ONAY] Başvuru mevcut durumu:`, {
            id: basvuru.id,
            durum: basvuru.durum,
            ciftlik_id: basvuru.ciftlik_id,
            kullanici_id: basvuru.kullanici_id
        });

        // ciftlik_basvurulari tablosunu güncelle: ciftlik_id, durum, onay_tarihi
        console.log(`🔄 [CIFTLIK ONAY] Başvuru durumu güncelleniyor...`);
        console.log(`🔄 [CIFTLIK ONAY] Parametreler:`, {
            ciftlik_id: ciftlikId,
            inceleyen_id: req.user?.id,
            basvuru_id: trimmedId,
            basvuru_id_uuid: typeof trimmedId === 'string' ? trimmedId : 'NOT_STRING'
        });

        console.log(`🔄 [CIFTLIK ONAY] UPDATE sorgusu çalıştırılıyor...`);
        console.log(`🔄 [CIFTLIK ONAY] UPDATE parametreleri:`, {
            ciftlik_id: ciftlikId,
            inceleyen_id: req.user?.id,
            basvuru_id: trimmedId,
            basvuru_id_type: typeof trimmedId,
            basvuru_id_length: trimmedId?.length
        });

        const updateResult = await client.query(
            `UPDATE ciftlik_basvurulari 
            SET ciftlik_id = $1, 
                durum = 'onaylandi', 
                onay_tarihi = NOW(), 
                inceleme_tarihi = NOW(), 
                inceleyen_id = $2, 
                guncelleme = NOW()
            WHERE id = $3::uuid
            RETURNING id, durum, ciftlik_id, onay_tarihi`,
            [ciftlikId, req.user?.id, trimmedId]
        );

        console.log(`📊 [CIFTLIK ONAY] UPDATE sonucu:`, {
            rowCount: updateResult.rowCount,
            returning: updateResult.rows.length > 0 ? updateResult.rows[0] : null,
            command: updateResult.command
        });

        if (updateResult.rowCount === 0) {
            console.error(`❌ [CIFTLIK ONAY] HATA: UPDATE hiçbir satırı etkilemedi!`);
            await client.query('ROLLBACK');
            return res.status(500).json({
                success: false,
                message: 'Başvuru durumu güncellenemedi'
            });
        }

        console.log(`✅ [CIFTLIK ONAY] Başvuru durumu başarıyla güncellendi:`, {
            id: updateResult.rows[0].id,
            durum: updateResult.rows[0].durum,
            ciftlik_id: updateResult.rows[0].ciftlik_id,
            onay_tarihi: updateResult.rows[0].onay_tarihi
        });

        // Çiftlik onaylandıktan sonra kullanıcının durumunu aktif yap (yardımcı fonksiyon ile)
        await syncKullaniciDurumuFromCiftlik(client, ciftlikId, 'aktif');

        console.log(`✅ [CIFTLIK ONAY] Kullanıcı durumu aktif yapıldı:`, {
            kullanici_id: basvuru.kullanici_id,
            eposta: basvuru.eposta,
            ciftlik_id: ciftlikId
        });

        // Belgeleri ciftlik_id ile de bağla (onaylandıktan sonra)
        await client.query(
            `UPDATE belgeler 
            SET ciftlik_id = $1::uuid, guncelleme = NOW()
            WHERE basvuru_id = $2::uuid AND basvuru_tipi = 'ciftlik_basvurusu'`,
            [ciftlikId, trimmedId]
        );

        console.log(`💾 [CIFTLIK ONAY] Transaction COMMIT yapılıyor...`);
        try {
            await client.query('COMMIT');
            console.log(`✅ [CIFTLIK ONAY] COMMIT başarılı!`);
        } catch (commitError) {
            console.error(`❌ [CIFTLIK ONAY] COMMIT HATASI:`, commitError);
            throw commitError;
        }

        // Onay işlemi için log kaydı (COMMIT'ten SONRA - transaction dışında)
        // Log hatası olsa bile ana işlem başarılı olduğu için sorun değil
        try {
            const logClient = await pool.connect();
            try {
                await logCiftlikActivity(logClient, {
                    kullanici_id: req.user?.id,
                    ciftlik_id: ciftlikId,
                    basvuru_id: trimmedId,
                    islem_tipi: 'onay',
                    eski_durum: basvuru.durum,
                    yeni_durum: 'onaylandi',
                    aciklama: note || 'Çiftlik başvurusu onaylandı',
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
            } finally {
                logClient.release();
            }
        } catch (logError) {
            // Log hatası kritik değil, sadece console'a yaz
            console.error('⚠️ [CIFTLIK ONAY] Log kaydı hatası (ana işlem başarılı):', logError.message);
        }

        // COMMIT sonrası doğrulama - yeni bağlantı ile kontrol
        const verifyResult = await pool.query(
            `SELECT id, durum, ciftlik_id, onay_tarihi FROM ciftlik_basvurulari WHERE id = $1::uuid`,
            [trimmedId]
        );

        if (verifyResult.rows.length > 0) {
            console.log(`🔍 [CIFTLIK ONAY] COMMIT sonrası doğrulama:`, {
                id: verifyResult.rows[0].id,
                durum: verifyResult.rows[0].durum,
                ciftlik_id: verifyResult.rows[0].ciftlik_id,
                onay_tarihi: verifyResult.rows[0].onay_tarihi
            });
            
            if (verifyResult.rows[0].durum !== 'onaylandi') {
                console.error(`❌ [CIFTLIK ONAY] UYARI: Başvuru durumu 'onaylandi' değil! Mevcut durum: ${verifyResult.rows[0].durum}`);
            }
        } else {
            console.error(`❌ [CIFTLIK ONAY] HATA: Başvuru bulunamadı!`);
        }

        // Bildirim oluştur - Çiftçiye çiftlik onaylandı bildirimi gönder
        try {
            await createNotification({
                kullanici_id: basvuru.kullanici_id,
                bildirim_tipi_kod: 'BASVURU',
                baslik: 'Çiftlik Başvurunuz Onaylandı',
                mesaj: `"${basvuru.ciftlik_adi}" adlı çiftlik başvurunuz onaylandı! Artık platformu kullanmaya başlayabilirsiniz.${note ? `\n\nNot: ${note}` : ''}`,
                link: `/ciftlik/panel`
            });
        } catch (notificationError) {
            console.error('⚠️ Bildirim oluşturma hatası (işlem başarılı):', notificationError);
        }

        res.json({
            success: true,
            message: 'Çiftlik başvurusu onaylandı ve çiftlikler tablosuna kayıt oluşturuldu',
            ciftlikId: ciftlikId
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(rollbackErr => {
            console.error('❌ [CIFTLIK ONAY] ROLLBACK hatası:', rollbackErr);
        });
        
        const basvuruId = req.params?.id || 'UNKNOWN';
        
        console.error('❌ [CIFTLIK ONAY] HATA:', {
            message: error.message,
            stack: error.stack,
            detail: error.detail,
            hint: error.hint,
            code: error.code,
            query: error.query,
            basvuru_id: basvuruId,
            user_id: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Çiftlik onaylama işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code,
                query: error.query
            } : undefined
        });
    } finally {
        client.release();
    }
};

// Reject Farm - POST /api/ziraat/farms/reject/:id
// Çiftlik başvurusunu reddet, tüm bilgileri sil ve log kaydı oluştur
const rejectFarm = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params; // basvuru_id
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Red nedeni zorunludur'
            });
        }

        // Başvuru bilgilerini al (log için)
        const basvuruResult = await client.query(
            `SELECT id, durum, ciftlik_adi, sahip_adi, ciftlik_id, kullanici_id 
             FROM ciftlik_basvurulari 
             WHERE id = $1`,
            [id]
        );

        if (basvuruResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Çiftlik başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];
        const oncekiDurum = basvuru.durum;
        const ciftlikId = basvuru.ciftlik_id;
        const kullaniciId = basvuru.kullanici_id;

        console.log(`🗑️ [CIFTLIK RED] Başvuru reddediliyor ve siliniyor:`, {
            basvuru_id: id,
            ciftlik_adi: basvuru.ciftlik_adi,
            sahip_adi: basvuru.sahip_adi,
            onceki_durum: oncekiDurum,
            ciftlik_id: ciftlikId,
            kullanici_id: kullaniciId
        });

        // 1. İlişkili belgeleri sil (yeniden kayıt için yeni belgeler yüklenecek)
        const belgelerResult = await client.query(
            `SELECT id, dosya_yolu FROM belgeler 
             WHERE basvuru_id = $1 AND basvuru_tipi = 'ciftlik_basvurusu'`,
            [id]
        );

        console.log(`📄 [CIFTLIK RED] ${belgelerResult.rows.length} belge silinecek`);

        // Belgeleri sil
        await client.query(
            `DELETE FROM belgeler 
             WHERE basvuru_id = $1 AND basvuru_tipi = 'ciftlik_basvurusu'`,
            [id]
        );

        // 2. Başvuruyu silmek yerine durumunu "reddedildi" yap (yeniden kayıt için)
        await client.query(
            `UPDATE ciftlik_basvurulari 
             SET durum = 'reddedildi', 
                 guncelleme = CURRENT_TIMESTAMP, 
                 inceleme_tarihi = CURRENT_TIMESTAMP,
                 inceleyen_id = $3::uuid,
                 red_nedeni = $1
             WHERE id = $2`,
            [reason, id, req.user?.id]
        );

        console.log(`✅ [CIFTLIK RED] Başvuru durumu "reddedildi" olarak güncellendi, belgeler silindi`);

        // Transaction'ı commit et
        await client.query('COMMIT');
        console.log(`✅ [CIFTLIK RED] COMMIT başarılı!`);

        // 3. Log kaydı oluştur (COMMIT'ten SONRA - transaction dışında)
        try {
            const logClient = await pool.connect();
            try {
                await logCiftlikActivity(logClient, {
                    kullanici_id: req.user?.id,
                    ciftlik_id: ciftlikId,
                    basvuru_id: id,
                    islem_tipi: 'red',
                    eski_durum: oncekiDurum,
                    yeni_durum: 'reddedildi',
                    aciklama: `Çiftlik başvurusu reddedildi. Neden: ${reason}`,
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
                console.log(`✅ [CIFTLIK RED] Log kaydı oluşturuldu`);
            } finally {
                logClient.release();
            }
        } catch (logError) {
            // Log hatası kritik değil, sadece console'a yaz
            console.error('⚠️ [CIFTLIK RED] Log kaydı hatası (ana işlem başarılı):', logError.message);
        }

        res.json({
            success: true,
            message: 'Çiftlik başvurusu reddedildi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [CIFTLIK RED] Reddetme hatası:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Çiftlik reddetme işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Reject Farm And Delete - POST /api/ziraat/farms/reject-and-delete/:id
// Güncellenen belgeler modalından reddetme: Başvuruyu tamamen sil
const rejectFarmAndDelete = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params; // basvuru_id
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Red nedeni zorunludur'
            });
        }

        // Başvuru bilgilerini al (log için)
        const basvuruResult = await client.query(
            `SELECT id, durum, ciftlik_adi, sahip_adi, ciftlik_id, kullanici_id 
             FROM ciftlik_basvurulari 
             WHERE id = $1`,
            [id]
        );

        if (basvuruResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Çiftlik başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];
        const oncekiDurum = basvuru.durum;
        const ciftlikId = basvuru.ciftlik_id;
        const kullaniciId = basvuru.kullanici_id;

        console.log(`🗑️ [CIFTLIK RED VE SIL] Başvuru reddediliyor ve tamamen siliniyor:`, {
            basvuru_id: id,
            ciftlik_adi: basvuru.ciftlik_adi,
            sahip_adi: basvuru.sahip_adi,
            onceki_durum: oncekiDurum,
            ciftlik_id: ciftlikId,
            kullanici_id: kullaniciId
        });

        // 1. İlişkili belgeleri sil
        const belgelerResult = await client.query(
            `SELECT id, dosya_yolu FROM belgeler 
             WHERE basvuru_id = $1 AND basvuru_tipi = 'ciftlik_basvurusu'`,
            [id]
        );

        console.log(`📄 [CIFTLIK RED VE SIL] ${belgelerResult.rows.length} belge silinecek`);

        // Belgeleri sil
        await client.query(
            `DELETE FROM belgeler 
             WHERE basvuru_id = $1 AND basvuru_tipi = 'ciftlik_basvurusu'`,
            [id]
        );

        // 2. Eğer çiftlik zaten onaylanmışsa ve ciftlikler tablosunda kayıt varsa, onu da sil
        if (ciftlikId) {
            const ciftlikCheckResult = await client.query(
                `SELECT id, durum FROM ciftlikler WHERE id = $1`,
                [ciftlikId]
            );

            if (ciftlikCheckResult.rows.length > 0) {
                console.log(`🗑️ [CIFTLIK RED VE SIL] Çiftlik kaydı da silinecek:`, {
                    ciftlik_id: ciftlikId,
                    durum: ciftlikCheckResult.rows[0].durum
                });

                // Çiftlik kaydını sil
                await client.query(
                    `DELETE FROM ciftlikler WHERE id = $1`,
                    [ciftlikId]
                );

                console.log(`✅ [CIFTLIK RED VE SIL] Çiftlik kaydı silindi`);
            }
        }

        // 3. Başvuruyu tamamen sil
        await client.query(
            `DELETE FROM ciftlik_basvurulari WHERE id = $1`,
            [id]
        );

        console.log(`✅ [CIFTLIK RED VE SIL] Başvuru tamamen silindi`);

        // Transaction'ı commit et
        await client.query('COMMIT');
        console.log(`✅ [CIFTLIK RED VE SIL] COMMIT başarılı!`);

        // 4. Log kaydı oluştur (COMMIT'ten SONRA - transaction dışında)
        try {
            const logClient = await pool.connect();
            try {
                await logCiftlikActivity(logClient, {
                    kullanici_id: req.user?.id,
                    ciftlik_id: ciftlikId,
                    basvuru_id: id,
                    islem_tipi: 'red',
                    eski_durum: oncekiDurum,
                    yeni_durum: 'silindi',
                    aciklama: `Çiftlik başvurusu reddedildi ve tamamen silindi. Neden: ${reason}`,
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
                console.log(`✅ [CIFTLIK RED VE SIL] Log kaydı oluşturuldu`);
            } finally {
                logClient.release();
            }
        } catch (logError) {
            console.error('⚠️ [CIFTLIK RED VE SIL] Log kaydı hatası (ana işlem başarılı):', logError.message);
        }

        res.json({
            success: true,
            message: 'Çiftlik başvurusu reddedildi ve tamamen silindi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [CIFTLIK RED VE SIL] Reddetme ve silme hatası:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Çiftlik reddetme ve silme işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Send Belge Eksik Message - POST /api/ziraat/farms/belge-eksik/:id
// Seçilen belgeleri eksik olarak işaretle, mesaj gönder ve çiftlik durumunu "belge_eksik" yap
const sendBelgeEksikMessage = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params; // basvuru_id
        const { belgeMessages } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            await client.query('ROLLBACK');
            return res.status(401).json({
                success: false,
                message: 'Yetkisiz işlem'
            });
        }

        if (!belgeMessages || !Array.isArray(belgeMessages) || belgeMessages.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'En az bir belge seçilmelidir'
            });
        }

        // Her belge mesajını kontrol et
        for (const belgeMsg of belgeMessages) {
            if (!belgeMsg.belgeId || !belgeMsg.farmerMessage || !belgeMsg.farmerMessage.trim()) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Her belge için çiftçiye mesaj zorunludur'
                });
            }
        }

        // Başvuru bilgilerini al
        const basvuruResult = await client.query(
            `SELECT id, durum, ciftlik_adi, sahip_adi, kullanici_id 
             FROM ciftlik_basvurulari 
             WHERE id = $1`,
            [id]
        );

        if (basvuruResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Çiftlik başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];
        const kullaniciId = basvuru.kullanici_id;

        console.log(`📄 [BELGE EKSIK] Belge eksik mesajı gönderiliyor:`, {
            basvuru_id: id,
            ciftlik_adi: basvuru.ciftlik_adi,
            belge_sayisi: belgeMessages.length
        });

        // Seçilen belgeleri güncelle (durum = 'Eksik', kullanici_notu = çiftçi mesajı, yonetici_notu = admin notu)
        for (const belgeMsg of belgeMessages) {
            const farmerMsg = belgeMsg.farmerMessage?.trim() || '';
            const adminNote = belgeMsg.adminNote?.trim() || null;
            
            console.log(`📝 [BELGE EKSIK] Belge güncelleniyor:`, {
                belgeId: belgeMsg.belgeId,
                basvuru_id: id,
                farmerMessage: farmerMsg.substring(0, 50),
                adminNote: adminNote ? adminNote.substring(0, 50) : 'null'
            });
            
            const updateResult = await client.query(
                `UPDATE belgeler 
                 SET durum = 'Eksik', 
                     kullanici_notu = $1, 
                     yonetici_notu = $2,
                     inceleme_tarihi = CURRENT_TIMESTAMP,
                     inceleyen_id = $3::uuid,
                     guncelleme = CURRENT_TIMESTAMP
                 WHERE id = $4::uuid AND basvuru_id = $5::uuid AND basvuru_tipi = 'ciftlik_basvurusu'
                 RETURNING id, kullanici_notu, yonetici_notu`,
                [
                    farmerMsg, 
                    adminNote,
                    adminId,
                    belgeMsg.belgeId, 
                    id
                ]
            );
            
            if (updateResult.rowCount === 0) {
                console.error(`❌ [BELGE EKSIK] Belge güncellenemedi - eşleşen kayıt bulunamadı:`, {
                    belgeId: belgeMsg.belgeId,
                    basvuru_id: id
                });
            } else {
                console.log(`✅ [BELGE EKSIK] Belge güncellendi:`, {
                    belgeId: updateResult.rows[0].id,
                    kullanici_notu: updateResult.rows[0].kullanici_notu?.substring(0, 50),
                    yonetici_notu: updateResult.rows[0].yonetici_notu?.substring(0, 50) || 'null'
                });
            }
        }

        // Çiftlik başvurusu durumunu "belge_eksik" yap
        await client.query(
            `UPDATE ciftlik_basvurulari 
             SET durum = 'belge_eksik', 
                 inceleme_tarihi = CURRENT_TIMESTAMP,
                 inceleyen_id = $2::uuid,
                 guncelleme = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [id, adminId]
        );

        // Transaction'ı commit et
        await client.query('COMMIT');
        console.log(`✅ [BELGE EKSIK] İşlem başarılı!`);

        // Log kaydı oluştur (COMMIT'ten SONRA - transaction dışında)
        try {
            const logClient = await pool.connect();
            try {
                const belgeIsimleri = belgeMessages.map(bm => {
                    // Belge ismini bul (eğer mümkünse)
                    return bm.belgeId;
                }).join(', ');
                
                await logCiftlikActivity(logClient, {
                    kullanici_id: req.user?.id,
                    ciftlik_id: null,
                    basvuru_id: id,
                    islem_tipi: 'durum_degisikligi',
                    eski_durum: basvuru.durum,
                    yeni_durum: 'belge_eksik',
                    aciklama: `Çiftlik başvurusu "Belge Eksik" durumuna alındı. ${belgeMessages.length} belge için mesaj gönderildi.`,
                    ip_adresi: req.ip,
                    user_agent: req.get('user-agent')
                });
                console.log(`✅ [BELGE EKSIK] Log kaydı oluşturuldu`);
            } finally {
                logClient.release();
            }
        } catch (logError) {
            console.error('⚠️ [BELGE EKSIK] Log kaydı hatası (ana işlem başarılı):', logError.message);
        }

        // Bildirim oluştur - Çiftçiye belge eksik bildirimi gönder
        try {
            // Belge isimlerini al
            const belgeIsimleri = [];
            for (const belgeMsg of belgeMessages) {
                const belgeResult = await pool.query(
                    `SELECT COALESCE(bt.ad, b.ad, 'Belge') as belge_adi
                     FROM belgeler b
                     LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                     WHERE b.id = $1::uuid`,
                    [belgeMsg.belgeId]
                );
                if (belgeResult.rows.length > 0) {
                    belgeIsimleri.push(belgeResult.rows[0].belge_adi);
                }
            }

            const belgeListesi = belgeIsimleri.length > 0 
                ? belgeIsimleri.join(', ')
                : `${belgeMessages.length} belge`;

            await createNotification({
                kullanici_id: kullaniciId,
                bildirim_tipi_kod: 'BELGE',
                baslik: 'Eksik Belgeler Bildirimi',
                mesaj: `"${basvuru.ciftlik_adi}" adlı çiftlik başvurunuzda eksik belgeler bulunmaktadır.\n\nEksik Belgeler: ${belgeListesi}\n\nLütfen eksik belgeleri yükleyiniz.`,
                link: `/ciftlik/eksik-belgeler`
            });
        } catch (notificationError) {
            console.error('⚠️ Bildirim oluşturma hatası (işlem başarılı):', notificationError);
        }

        res.json({
            success: true,
            message: 'Belge eksik mesajı gönderildi ve çiftlik durumu güncellendi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [BELGE EKSIK] İşlem hatası:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Belge eksik mesajı gönderilemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Send Product Belge Eksik Message - POST /api/ziraat/products/belge-eksik/:id
// Seçilen belgeleri eksik olarak işaretle, mesaj gönder ve ürün başvurusu durumunu "revizyon" yap
const sendProductBelgeEksikMessage = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params; // basvuru_id (urun_basvurulari.id)
        const { belgeMessages } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            await client.query('ROLLBACK');
            return res.status(401).json({
                success: false,
                message: 'Yetkisiz işlem'
            });
        }

        if (!belgeMessages || !Array.isArray(belgeMessages) || belgeMessages.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'En az bir belge seçilmelidir'
            });
        }

        // Her belge mesajını kontrol et
        for (const belgeMsg of belgeMessages) {
            if (!belgeMsg.belgeId || !belgeMsg.farmerMessage || !belgeMsg.farmerMessage.trim()) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Her belge için çiftçiye mesaj zorunludur'
                });
            }
        }

        // Ürün başvurusu bilgilerini al ve çiftçi bilgilerini al
        const basvuruResult = await client.query(
            `SELECT ub.id, ub.durum, ub.urun_adi, ub.ciftlik_id, ub.urun_id, c.kullanici_id
             FROM urun_basvurulari ub
             JOIN ciftlikler c ON ub.ciftlik_id = c.id
             WHERE ub.id = $1`,
            [id]
        );

        if (basvuruResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Ürün başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];
        const ciftciKullaniciId = basvuru.kullanici_id;

        console.log(`📄 [URUN BELGE EKSIK] Belge eksik mesajı gönderiliyor:`, {
            basvuru_id: id,
            urun_adi: basvuru.urun_adi,
            belge_sayisi: belgeMessages.length
        });

        // Seçilen belgeleri güncelle (durum = 'Eksik', kullanici_notu = çiftçi mesajı, yonetici_notu = admin notu)
        // Belge isimleri bildirim için saklanacak
        const belgeIsimleri = [];
        
        for (const belgeMsg of belgeMessages) {
            const farmerMsg = belgeMsg.farmerMessage?.trim() || '';
            const adminNote = belgeMsg.adminNote?.trim() || null;
            
            // Önce belgeler tablosunda ara
            let updateResult = await client.query(
                `UPDATE belgeler 
                 SET durum = 'eksik', 
                     kullanici_notu = $1, 
                     yonetici_notu = $2,
                     inceleme_tarihi = CURRENT_TIMESTAMP,
                     inceleyen_id = $3::uuid,
                     guncelleme = CURRENT_TIMESTAMP
                 WHERE id = $4::uuid AND basvuru_id = $5::uuid AND basvuru_tipi = 'urun_basvurusu'
                 RETURNING id, ad`,
                [
                    farmerMsg, 
                    adminNote,
                    adminId,
                    belgeMsg.belgeId, 
                    id
                ]
            );
            
            // Eğer belgeler tablosunda bulunamadıysa, urun_resimleri tablosunda ara
            if (updateResult.rowCount === 0) {
                // Ürün fotoğrafı kontrolü
                const resimResult = await client.query(
                    `SELECT ur.id, ur.resim_url, ur.ana_resim, c.id as ciftlik_id, c.kullanici_id
                     FROM urun_resimleri ur
                     JOIN urun_basvurulari ub ON ur.urun_id = ub.urun_id
                     JOIN ciftlikler c ON ub.ciftlik_id = c.id
                     WHERE ur.id = $1::uuid AND ub.id = $2::uuid`,
                    [belgeMsg.belgeId, id]
                );
                
                if (resimResult.rows.length > 0) {
                    const resim = resimResult.rows[0];
                    const resimAdi = resim.ana_resim ? 'Ürün Fotoğrafı' : 'Ek Fotoğraf';
                    
                    // Belge türü ID'sini bul (urun_fotografi kodu ile)
                    let belgeTuruId = null;
                    const belgeTuruResult = await client.query(
                        `SELECT id FROM belge_turleri WHERE kod = 'urun_fotografi' LIMIT 1`
                    );
                    
                    if (belgeTuruResult.rows.length === 0) {
                        // Belge türü yoksa oluştur
                        const newBelgeTuruResult = await client.query(
                            `INSERT INTO belge_turleri (kod, ad, zorunlu, aktif)
                             VALUES ('urun_fotografi', 'Ürün Fotoğrafı', FALSE, TRUE)
                             RETURNING id`
                        );
                        belgeTuruId = newBelgeTuruResult.rows[0].id;
                    } else {
                        belgeTuruId = belgeTuruResult.rows[0].id;
                    }
                    
                    // Ürün fotoğrafı için belgeler tablosuna kayıt oluştur
                    const yeniBelgeResult = await client.query(
                        `INSERT INTO belgeler 
                         (kullanici_id, ciftlik_id, basvuru_id, basvuru_tipi, belge_turu_id, ad, dosya_yolu, durum, kullanici_notu, yonetici_notu, inceleme_tarihi, inceleyen_id, guncelleme)
                         VALUES ($1, $2, $3, 'urun_basvurusu', $4, $5, $6, 'eksik', $7, $8, CURRENT_TIMESTAMP, $9, CURRENT_TIMESTAMP)
                         RETURNING id, ad`,
                        [
                            resim.kullanici_id,
                            resim.ciftlik_id,
                            id,
                            belgeTuruId,
                            resimAdi,
                            resim.resim_url,
                            farmerMsg,
                            adminNote,
                            adminId
                        ]
                    );
                    
                    if (yeniBelgeResult.rows.length > 0) {
                        belgeIsimleri.push(resimAdi);
                        console.log(`✅ [URUN BELGE EKSIK] Ürün fotoğrafı için belge kaydı oluşturuldu:`, {
                            belgeId: yeniBelgeResult.rows[0].id,
                            resimId: belgeMsg.belgeId,
                            ad: resimAdi
                        });
                    }
                } else {
                    console.error(`❌ [URUN BELGE EKSIK] Belge/resim bulunamadı:`, {
                        belgeId: belgeMsg.belgeId,
                        basvuru_id: id
                    });
                }
            } else {
                // Belgeler tablosunda bulundu, isim al
                if (updateResult.rows[0].ad) {
                    belgeIsimleri.push(updateResult.rows[0].ad);
                }
            }
        }

        // Ürün başvurusu durumunu "revizyon" yap (belgeler eksik olduğu için)
        await client.query(
            `UPDATE urun_basvurulari 
             SET durum = 'revizyon', 
                 guncelleme = CURRENT_TIMESTAMP,
                 inceleyen_id = $2::uuid
             WHERE id = $1`,
            [id, adminId]
        );

        // Transaction'ı commit et
        await client.query('COMMIT');
        console.log(`✅ [URUN BELGE EKSIK] İşlem başarılı!`);

        // Bildirim oluştur - Çiftçiye ürün belge eksik bildirimi gönder
        try {
            const belgeListesi = belgeIsimleri.length > 0 
                ? belgeIsimleri.join(', ')
                : `${belgeMessages.length} belge`;

            console.log(`📬 [URUN BELGE EKSIK] Bildirim oluşturuluyor:`, {
                kullanici_id: ciftciKullaniciId,
                urun_adi: basvuru.urun_adi,
                belge_sayisi: belgeMessages.length
            });

            const notificationResult = await createNotification({
                kullanici_id: ciftciKullaniciId,
                bildirim_tipi_kod: 'BELGE',
                baslik: 'Ürün Başvurusu - Eksik Belgeler',
                mesaj: `"${basvuru.urun_adi}" adlı ürün başvurunuzda eksik belgeler bulunmaktadır.\n\nEksik Belgeler: ${belgeListesi}\n\nLütfen eksik belgeleri yükleyip başvurunuzu güncelleyiniz.`,
                link: `/ciftlik/urun-durum?openModal=true&applicationId=${id}`
            });

            if (notificationResult && notificationResult.success) {
                console.log(`✅ [URUN BELGE EKSIK] Bildirim başarıyla oluşturuldu:`, notificationResult.notification?.id);
            } else {
                console.error(`⚠️ [URUN BELGE EKSIK] Bildirim oluşturulamadı:`, notificationResult);
            }
        } catch (notificationError) {
            console.error('⚠️ [URUN BELGE EKSIK] Bildirim oluşturma hatası (işlem başarılı):', notificationError);
            console.error('⚠️ Bildirim hatası detayları:', {
                message: notificationError.message,
                stack: notificationError.stack,
                kullanici_id: ciftciKullaniciId
            });
        }

        res.json({
            success: true,
            message: 'Belge eksik mesajı gönderildi ve ürün başvurusu durumu güncellendi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [URUN BELGE EKSIK] İşlem hatası:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Belge eksik mesajı gönderilemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Get Updated Documents - GET /api/ziraat/farms/:id/updated-documents
// Belge eksik mesajı gönderildikten sonra çiftçi tarafından yüklenen güncellenmiş belgeleri getir
const getUpdatedDocuments = async (req, res) => {
    try {
        const { id } = req.params; // basvuru_id

        // Başvuruyu kontrol et
        const basvuruResult = await pool.query(
            `SELECT id, durum, ciftlik_adi, sahip_adi, kullanici_id 
             FROM ciftlik_basvurulari 
             WHERE id = $1::uuid`,
            [id]
        );

        if (basvuruResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik başvurusu bulunamadı'
            });
        }

        const basvuru = basvuruResult.rows[0];

        // Durumu "Eksik" veya "gcbelge" olan belgeleri bul
        // "Eksik" durumundaki belgeler: eksik belge mesajı gönderildikten sonra yüklenen belgeler
        // "gcbelge" durumundaki belgeler: MissingDocumentsPage.tsx'te yüklenilen belgeler (güncel belgeler)
        // Bu belgelerin inceleme_tarihi (eksik belge mesajı gönderildiği tarih) sonrasında
        // çiftçi tarafından yeni yüklenen veya güncellenen belgeleri getir
        // NOT: Çiftçi belgeyi güncellediğinde yuklenme tarihi de güncellenir, bu yüzden
        // yuklenme > inceleme_tarihi kontrolü yeterli (yeni dosya yüklendiğinde yuklenme güncellenir)
        // "gcbelge" durumundaki belgeler için inceleme_tarihi kontrolü yapılır (eksik belge mesajı gönderilmiş olmalı)
        const updatedDocsResult = await pool.query(
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
                bt.kod as belge_turu_kod,
                -- Çiftçinin eksik belge mesajından sonra yeni yüklediğini göster
                CASE 
                    WHEN b.durum = 'gcbelge' THEN true
                    WHEN b.yuklenme > b.inceleme_tarihi THEN true
                    ELSE false
                END as yeni_yuklendi
             FROM belgeler b
             JOIN belge_turleri bt ON b.belge_turu_id = bt.id
             WHERE b.basvuru_id = $1::uuid 
               AND b.basvuru_tipi = 'ciftlik_basvurusu'
               AND (
                   -- "Eksik" durumundaki belgeler: eksik belge mesajı gönderildikten sonra yüklenen
                   (b.durum = 'Eksik' AND b.inceleme_tarihi IS NOT NULL AND b.yuklenme > b.inceleme_tarihi)
                   OR
                   -- "gcbelge" durumundaki belgeler: MissingDocumentsPage.tsx'te yüklenilen belgeler
                   (b.durum = 'gcbelge' AND b.inceleme_tarihi IS NOT NULL)
               )
             ORDER BY b.yuklenme DESC`,
            [id]
        );

        const updatedDocuments = updatedDocsResult.rows;

        // Belgelerin URL'lerini oluştur
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const documentsWithUrls = updatedDocuments.map(belge => {
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
                redNedeni: belge.red_nedeni,
                yeniYuklendi: belge.yeni_yuklendi || false
            };
        });

        res.json({
            success: true,
            application: {
                id: basvuru.id,
                name: basvuru.ciftlik_adi,
                owner: basvuru.sahip_adi,
                status: basvuru.durum
            },
            updatedDocuments: documentsWithUrls
        });
    } catch (error) {
        console.error('❌ [UPDATED DOCS] Hata:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            message: 'Güncellenen belgeler alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Registered Farmers - GET /api/ziraat/farmers/registered
const getRegisteredFarmers = async (req, res) => {
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

        let whereClause = "WHERE c.durum = 'aktif' AND c.silinme IS NULL";
        const params = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (k.ad ILIKE $${paramIndex} OR k.soyad ILIKE $${paramIndex} OR k.eposta ILIKE $${paramIndex} OR c.ad ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Toplam sayı
        const countQuery = `
            SELECT COUNT(*) as total
            FROM ciftlikler c
            JOIN kullanicilar k ON c.kullanici_id = k.id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);

        // Sayfalama ile veriler
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                k.id,
                CONCAT(k.ad, ' ', k.soyad) as name,
                k.eposta as email,
                c.ad as "farmName",
                COALESCE(k.telefon, '') as phone,
                c.durum as status,
                c.olusturma as "registrationDate"
            FROM ciftlikler c
            JOIN kullanicilar k ON c.kullanici_id = k.id
            ${whereClause}
            ORDER BY c.olusturma DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        const dataResult = await pool.query(dataQuery, params);

        const total = parseInt(countResult.rows[0].total || 0);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            farmers: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Registered farmers hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A'
        });
        res.status(500).json({
            success: false,
            message: 'Kayıtlı çiftçiler alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Farmer Details - GET /api/ziraat/farmers/:id
const getFarmerDetails = async (req, res) => {
    try {
        const { id } = req.params; // kullanici_id veya ciftlik_id
        
        console.log(`🔍 [FARMER DETAILS] İstek alındı - ID: ${id}, Type: ${typeof id}`);

        // Önce kullanıcı ID'si ile çiftliği bul
        const farmerQuery = `
            SELECT 
                k.id as "kullanici_id",
                CONCAT(k.ad, ' ', k.soyad) as name,
                k.eposta as email,
                k.telefon as phone,
                c.id as "ciftlik_id",
                c.ad as "farmName",
                c.adres as address,
                c.durum as status,
                c.olusturma as "registrationDate",
                c.aciklama as description
            FROM kullanicilar k
            JOIN ciftlikler c ON c.kullanici_id = k.id
            WHERE (k.id = $1::uuid OR c.id = $1::uuid) AND c.durum = 'aktif' AND c.silinme IS NULL
            LIMIT 1
        `;

        const farmerResult = await pool.query(farmerQuery, [id]);

        if (farmerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Çiftçi bulunamadı'
            });
        }

        const farmer = farmerResult.rows[0];
        const ciftlikId = farmer.ciftlik_id;

        // Belgeleri al - hem ciftlik_id hem de basvuru_id ile bağlı belgeleri getir
        const documentsQuery = `
            SELECT 
                b.id as "belgeId",
                b.ad as name,
                b.dosya_yolu,
                b.durum as status,
                b.kullanici_notu as "farmerNote",
                b.yonetici_notu as "adminNote",
                b.basvuru_id,
                bt.ad as "belgeTuru",
                bt.kod as "belgeKodu"
            FROM belgeler b
            LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
            WHERE (b.ciftlik_id = $1::uuid OR b.basvuru_id IN (
                SELECT id FROM ciftlik_basvurulari WHERE kullanici_id = $2::uuid
            )) AND b.basvuru_tipi = 'ciftlik_basvurusu'
            ORDER BY b.olusturma DESC
        `;

        const documentsResult = await pool.query(documentsQuery, [ciftlikId, farmer.kullanici_id]);

        // Belgeler için URL oluştur - sadece path döndür (frontend'de base URL ile birleştirilecek)
        const documentsWithUrl = documentsResult.rows.map(doc => {
            let url = null;
            if (doc.dosya_yolu) {
                // Dosya yolundaki her segmenti ayrı ayrı encode et (slash'lar korunur)
                const normalizedPath = doc.dosya_yolu.split('/').map(part => encodeURIComponent(part)).join('/');
                // Sadece path döndür, /api ekleme (frontend'de ekleyecek)
                url = `/documents/file/${normalizedPath}`;
            }
            return {
                ...doc,
                url
            };
        });

        res.json({
            success: true,
            farmer: {
                ...farmer,
                status: 'Onaylandı', // Kayıtlı çiftçiler için her zaman onaylandı
                documents: documentsWithUrl
            }
        });
    } catch (error) {
        console.error('Farmer details hatası:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            query: error.query || 'N/A'
        });
        res.status(500).json({
            success: false,
            message: 'Çiftçi detayları alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Dashboard Products - GET /api/ziraat/dashboard/products
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

// Get Activity Log - GET /api/ziraat/activity-log
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

        let whereClause = "WHERE 1=1";
        const params = [];
        let paramIndex = 1;

        if (type) {
            whereClause += ` AND tip = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        // Toplam sayı
        const countQuery = `
            SELECT COUNT(*) as total
            FROM aktiviteler
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);

        // Sayfalama ile veriler
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                a.id,
                a.tip as type,
                a.baslik as description,
                CONCAT(k.ad, ' ', k.soyad) as user,
                a.olusturma as timestamp,
                jsonb_build_object(
                    'varlik_tipi', a.varlik_tipi,
                    'varlik_id', a.varlik_id,
                    'aciklama', COALESCE(a.aciklama, '')
                ) as details
            FROM aktiviteler a
            LEFT JOIN kullanicilar k ON a.kullanici_id = k.id
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

// Get Farm Logs - GET /api/ziraat/farms/:id/logs
// Çiftlik başvurusu veya çiftlik için log kayıtlarını getir
const getFarmLogs = async (req, res) => {
    try {
        const { id } = req.params; // basvuru_id veya ciftlik_id

        // Önce basvuru_id olarak kontrol et, yoksa ciftlik_id olarak kabul et
        const basvuruCheck = await pool.query(
            'SELECT id, ciftlik_id, ciftlik_adi FROM ciftlik_basvurulari WHERE id = $1',
            [id]
        );

        let basvuruId = null;
        let ciftlikId = null;
        let ciftlikAdi = null;

        if (basvuruCheck.rows.length > 0) {
            basvuruId = basvuruCheck.rows[0].id;
            ciftlikId = basvuruCheck.rows[0].ciftlik_id;
            ciftlikAdi = basvuruCheck.rows[0].ciftlik_adi;
        } else {
            // Eğer basvuru değilse, ciftlik_id olarak kontrol et
            const ciftlikCheck = await pool.query(
                'SELECT id, ad FROM ciftlikler WHERE id = $1',
                [id]
            );
            if (ciftlikCheck.rows.length > 0) {
                ciftlikId = ciftlikCheck.rows[0].id;
                ciftlikAdi = ciftlikCheck.rows[0].ad;
                // Bu ciftlik için başvuruyu bul
                const basvuruFind = await pool.query(
                    'SELECT id, ciftlik_adi FROM ciftlik_basvurulari WHERE ciftlik_id = $1 ORDER BY onay_tarihi DESC LIMIT 1',
                    [ciftlikId]
                );
                if (basvuruFind.rows.length > 0) {
                    basvuruId = basvuruFind.rows[0].id;
                    if (!ciftlikAdi) {
                        ciftlikAdi = basvuruFind.rows[0].ciftlik_adi;
                    }
                }
            }
        }

        if (!basvuruId && !ciftlikId) {
            return res.status(404).json({
                success: false,
                message: 'Çiftlik veya başvuru bulunamadı'
            });
        }

        // Aktivite loglarını getir (basvuru_id veya ciftlik_id ile)
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
            WHERE a.varlik_tipi = 'ciftlik' 
            AND (a.varlik_id = $1 ${basvuruId && ciftlikId ? 'OR a.varlik_id = $2' : ''})
            ORDER BY a.olusturma DESC
            LIMIT 100
        `;

        const aktiviteParams = ciftlikId ? (basvuruId ? [ciftlikId, basvuruId] : [ciftlikId]) : [basvuruId];
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
                WHERE da.hedef_tipi = 'ciftlik_basvurusu' 
                AND da.hedef_id = $1
                ORDER BY da.olusturma DESC
                LIMIT 100
            `;
            const detayliResult = await pool.query(detayliQuery, [basvuruId]);
            detayliAktiviteler = detayliResult.rows;
        }

        // Değişiklik loglarını getir (ciftlik_id ile)
        let degisiklikLoglari = [];
        if (ciftlikId) {
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
                WHERE dl.varlik_tipi = 'ciftlik' 
                AND dl.varlik_id = $1
                ORDER BY dl.olusturma DESC
                LIMIT 100
            `;
            const degisiklikResult = await pool.query(degisiklikQuery, [ciftlikId]);
            degisiklikLoglari = degisiklikResult.rows;
        }

        res.json({
            success: true,
            farmName: ciftlikAdi,
            logs: {
                activities: aktivitelerResult.rows,
                detailedActivities: detayliAktiviteler,
                changeLogs: degisiklikLoglari
            }
        });
    } catch (error) {
        console.error('Farm logs hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Log kayıtları alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get All Farm Logs - GET /api/ziraat/farms/logs/all
// Tüm çiftlik işlem loglarını getir (seçili duruma göre filtreleme için)
const getAllFarmLogs = async (req, res) => {
    try {
        const { status, limit: limitParam } = req.query;
        const limit = parseInt(limitParam) || 100;

        // Tüm aktivite loglarını getir (çiftlik ile ilgili) - çiftlik adını da ekle
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
                a.varlik_tipi,
                COALESCE(c.ad, cb.ciftlik_adi) as farm_name
            FROM aktiviteler a
            LEFT JOIN kullanicilar k ON a.kullanici_id = k.id
            LEFT JOIN ciftlikler c ON a.varlik_id = c.id AND a.varlik_tipi = 'ciftlik'
            LEFT JOIN ciftlik_basvurulari cb ON a.varlik_id = cb.id AND a.varlik_tipi = 'ciftlik'
            WHERE a.varlik_tipi = 'ciftlik'
            ORDER BY a.olusturma DESC
            LIMIT $1
        `;

        const aktivitelerResult = await pool.query(aktivitelerQuery, [limit]);

        // Tüm detaylı aktivite loglarını getir (çiftlik başvuruları ile ilgili) - çiftlik adını da ekle
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
                da.hedef_id as varlik_id,
                cb.ciftlik_adi as farm_name
            FROM detayli_aktiviteler da
            LEFT JOIN kullanicilar k ON da.kullanici_id = k.id
            LEFT JOIN ciftlik_basvurulari cb ON da.hedef_id = cb.id AND da.hedef_tipi = 'ciftlik_basvurusu'
            WHERE da.kategori = 'ciftlik' AND da.hedef_tipi = 'ciftlik_basvurusu'
            ORDER BY da.olusturma DESC
            LIMIT $1
        `;
        const detayliResult = await pool.query(detayliQuery, [limit]);

        // Tüm değişiklik loglarını getir (çiftlik ile ilgili) - çiftlik adını da ekle
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
                dl.varlik_id,
                COALESCE(c.ad, cb.ciftlik_adi) as farm_name
            FROM degisiklik_loglari dl
            LEFT JOIN kullanicilar k ON dl.degistiren_id = k.id
            LEFT JOIN ciftlikler c ON dl.varlik_id = c.id AND dl.varlik_tipi = 'ciftlik'
            LEFT JOIN ciftlik_basvurulari cb ON dl.varlik_id = cb.id AND dl.varlik_tipi = 'ciftlik'
            WHERE dl.varlik_tipi = 'ciftlik'
            ORDER BY dl.olusturma DESC
            LIMIT $1
        `;
        const degisiklikResult = await pool.query(degisiklikQuery, [limit]);

        res.json({
            success: true,
            logs: {
                activities: aktivitelerResult.rows,
                detailedActivities: detayliResult.rows,
                changeLogs: degisiklikResult.rows
            }
        });
    } catch (error) {
        console.error('All farm logs hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Log kayıtları alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Belge durumunu güncelle - PUT /api/ziraat/documents/:belgeId
const updateDocumentStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { belgeId } = req.params;
        const { status, reason, adminNote } = req.body;
        const adminId = req.user?.id || null;
        const adminIp = req.ip || null;
        const userAgent = typeof req.get === 'function' ? req.get('user-agent') : null;

        // belgeId validasyonu
        if (!belgeId || typeof belgeId !== 'string' || belgeId.trim() === '') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Geçersiz belge ID'
            });
        }

        // UUID formatını kontrol et
        const trimmedBelgeId = belgeId.trim();
        if (!isValidUUID(trimmedBelgeId)) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Geçersiz belge ID formatı (UUID bekleniyor)'
            });
        }

        console.log(`📄 [BELGE GUNCELLEME] Başlatıldı - Belge ID: ${trimmedBelgeId}`);
        console.log(`📄 [BELGE GUNCELLEME] İstek verisi:`, {
            status,
            reason: reason ? 'Var' : 'Yok',
            adminNote: adminNote ? 'Var' : 'Yok',
            admin_id: adminId
        });

        // Belgeyi kontrol et - zorunlu bilgisini de al
        let checkResult;
        try {
            checkResult = await client.query(
                `SELECT b.id, b.basvuru_id, b.basvuru_tipi, b.ad, b.durum as eski_durum, b.dosya_yolu,
                        b.zorunlu, bt.ad as belge_turu_adi, bt.kod as belge_turu_kodu
                 FROM belgeler b
                 LEFT JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                 WHERE b.id = $1::uuid`,
                [trimmedBelgeId]
            );
        } catch (queryError) {
            console.error(`❌ [BELGE GUNCELLEME] Belge sorgusu hatası:`, queryError);
            await client.query('ROLLBACK').catch(() => {}); // ROLLBACK hatası görmezden gel
            return res.status(500).json({
                success: false,
                message: 'Belge sorgusu başarısız oldu'
            });
        }

        if (checkResult.rows.length === 0) {
            console.error(`❌ [BELGE GUNCELLEME] Belge bulunamadı - ID: ${trimmedBelgeId}`);
            await client.query('ROLLBACK').catch(() => {}); // ROLLBACK hatası görmezden gel
            return res.status(404).json({
                success: false,
                message: 'Belge bulunamadı'
            });
        }

        const belge = checkResult.rows[0];
        const hasValidApplicationId = isValidUUID(belge.basvuru_id);
        console.log(`✅ [BELGE GUNCELLEME] Belge bulundu:`, {
            id: belge.id,
            id_type: typeof belge.id,
            id_uuid_valid: isValidUUID(belge.id),
            ad: belge.ad,
            belge_turu: belge.belge_turu_adi || belge.belge_turu_kodu,
            basvuru_id: belge.basvuru_id,
            basvuru_tipi: belge.basvuru_tipi,
            eski_durum: belge.eski_durum,
            zorunlu: belge.zorunlu,
            dosya_yolu: belge.dosya_yolu ? 'Var' : 'YOK',
            trimmed_belge_id: trimmedBelgeId,
            trimmed_belge_id_type: typeof trimmedBelgeId,
            trimmed_belge_id_uuid_valid: isValidUUID(trimmedBelgeId),
            id_match: belge.id === trimmedBelgeId || belge.id?.toString() === trimmedBelgeId
        });

        if (!belge.basvuru_id || !belge.basvuru_tipi) {
            console.error(`❌ [BELGE GUNCELLEME] KRITIK HATA: Belge başvuru ile ilişkilendirilmemiş!`);
            console.error(`❌ [BELGE GUNCELLEME] Belge ID ${trimmedBelgeId} için basvuru_id veya basvuru_tipi eksik`);
        }

        // Durum mapping: Frontend -> Backend
        const statusMap = {
            'Onaylandı': 'onaylandi',
            'Reddedildi': 'reddedildi',
            'Eksik': 'eksik',
            'Beklemede': 'beklemede'
        };
        const backendStatus = statusMap[status] || 'beklemede';
        console.log(`🔄 [BELGE GUNCELLEME] Durum değişimi: ${belge.eski_durum} → ${backendStatus}`);

        // Belgeyi güncelle
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        updateFields.push(`durum = $${paramIndex++}`);
        updateValues.push(backendStatus);

        if (reason !== undefined) {
            updateFields.push(`red_nedeni = $${paramIndex++}`);
            updateValues.push(reason);
            console.log(`📝 [BELGE GUNCELLEME] Red nedeni eklendi`);
        }

        if (adminNote !== undefined) {
            updateFields.push(`yonetici_notu = $${paramIndex++}`);
            updateValues.push(adminNote);
            console.log(`📝 [BELGE GUNCELLEME] Yönetici notu eklendi`);
        }

        updateFields.push(`inceleme_tarihi = NOW()`);
        updateFields.push(`inceleyen_id = $${paramIndex++}`);
        updateValues.push(adminId);

        updateFields.push(`guncelleme = NOW()`);

        // UUID formatını kontrol et ve gerekirse düzelt
        let finalBelgeId = trimmedBelgeId;
        if (!isValidUUID(finalBelgeId)) {
            console.error(`❌ [BELGE GUNCELLEME] Geçersiz UUID formatı: ${finalBelgeId}`);
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Geçersiz belge ID formatı: ${finalBelgeId}`
            });
        }

        const updateQuery = `
            UPDATE belgeler 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}::uuid
            RETURNING id, durum, basvuru_id, basvuru_tipi
        `;

        updateValues.push(finalBelgeId);

        console.log(`💾 [BELGE GUNCELLEME] SQL sorgusu çalıştırılıyor...`);
        console.log(`💾 [BELGE GUNCELLEME] Query: ${updateQuery}`);
        console.log(`💾 [BELGE GUNCELLEME] Values:`, updateValues);

        // UPDATE'den önce belgeyi tekrar kontrol et (concurrency için)
        let preUpdateCheck;
        try {
            preUpdateCheck = await client.query(
                `SELECT id, durum FROM belgeler WHERE id = $1::uuid`,
                [trimmedBelgeId]
            );
        } catch (queryError) {
            console.error(`❌ [BELGE GUNCELLEME] Pre-update kontrol sorgusu hatası:`, queryError);
            await client.query('ROLLBACK').catch(() => {}); // ROLLBACK hatası görmezden gel
            return res.status(500).json({
                success: false,
                message: 'Belge kontrol sorgusu başarısız oldu'
            });
        }

        if (preUpdateCheck.rows.length === 0) {
            console.error(`❌ [BELGE GUNCELLEME] HATA: Belge UPDATE öncesi kontrol edildi ve bulunamadı - ID: ${trimmedBelgeId}`);
            await client.query('ROLLBACK').catch(() => {}); // ROLLBACK hatası görmezden gel
            return res.status(404).json({
                success: false,
                message: `Belge bulunamadı (ID: ${trimmedBelgeId})`
            });
        }

        let updateResult;
        try {
            updateResult = await client.query(updateQuery, updateValues);
        } catch (updateError) {
            console.error(`❌ [BELGE GUNCELLEME] UPDATE sorgusu hatası:`, updateError);
            await client.query('ROLLBACK').catch(() => {}); // ROLLBACK hatası görmezden gel
            return res.status(500).json({
                success: false,
                message: `Belge güncelleme sorgusu başarısız oldu: ${updateError.message}`
            });
        }

        if (updateResult.rows.length === 0) {
            // UPDATE başarısız oldu, nedenini araştır
            let postUpdateCheck;
            try {
                postUpdateCheck = await client.query(
                    `SELECT id, durum FROM belgeler WHERE id = $1::uuid`,
                    [trimmedBelgeId]
                );
            } catch (checkError) {
                // Post-update check başarısız olsa bile devam et
                console.warn(`⚠️ [BELGE GUNCELLEME] Post-update kontrol sorgusu hatası:`, checkError);
            }

            console.error(`❌ [BELGE GUNCELLEME] HATA: Güncelleme başarısız - hiçbir satır etkilenmedi`);
            console.error(`❌ [BELGE GUNCELLEME] Belge UPDATE sonrası kontrol:`, {
                belge_bulundu: postUpdateCheck?.rows?.length > 0,
                belge_id: postUpdateCheck?.rows?.[0]?.id,
                mevcut_durum: postUpdateCheck?.rows?.[0]?.durum,
                istenen_belge_id: trimmedBelgeId,
                query: updateQuery,
                values: updateValues
            });

            await client.query('ROLLBACK').catch(() => {}); // ROLLBACK hatası görmezden gel
            return res.status(500).json({
                success: false,
                message: `Belge güncellenemedi (ID: ${trimmedBelgeId}). Belge bulunamadı veya güncelleme başarısız oldu.`
            });
        }

        console.log(`✅ [BELGE GUNCELLEME] Belge başarıyla güncellendi:`, {
            belge_id: updateResult.rows[0].id,
            yeni_durum: updateResult.rows[0].durum,
            basvuru_id: updateResult.rows[0].basvuru_id,
            basvuru_tipi: updateResult.rows[0].basvuru_tipi
        });

        try {
            await client.query('COMMIT');
        } catch (commitError) {
            console.error(`❌ [BELGE GUNCELLEME] COMMIT hatası:`, commitError);
            // COMMIT başarısız olsa bile response gönder (transaction zaten abort olmuş olabilir)
            return res.status(500).json({
                success: false,
                message: 'Transaction commit başarısız oldu'
            });
        }

        res.json({
            success: true,
            message: 'Belge durumu güncellendi',
            applicationStatusChanged: false
        });
    } catch (error) {
        // Transaction abort hatası kontrolü
        const isTransactionAborted = error.message && (
            error.message.includes('current transaction is aborted') ||
            error.message.includes('transaction is aborted')
        );

        if (isTransactionAborted) {
            console.error('❌ [BELGE GUNCELLEME] Transaction abort hatası - ROLLBACK yapılıyor');
        }

        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            // ROLLBACK hatası görmezden gel (transaction zaten abort olmuş olabilir)
            console.warn('⚠️ [BELGE GUNCELLEME] ROLLBACK hatası (görmezden gelindi):', rollbackError.message);
        }

        console.error('❌ [BELGE GUNCELLEME] HATA:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            belge_id: req.params.belgeId,
            query: error.query || 'N/A',
            request_body: req.body,
            isTransactionAborted
        });

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development'
                ? `Belge güncellenemedi: ${error.message}`
                : 'Belge güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                detail: error.detail,
                hint: error.hint,
                code: error.code,
                isTransactionAborted
            } : undefined
        });
    } finally {
        client.release();
    }
};

// Başvuru durumunu güncelle - PUT /api/ziraat/farms/status/:id
// ciftlik_basvurulari tablosundaki başvurunun durumunu güncelle
const updateFarmApplicationStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params; // basvuru_id
        const { status, reason } = req.body;

        console.log(`🔄 [BASVURU DURUM GUNCELLEME] İstek alındı:`, {
            basvuru_id: id,
            istenen_durum: status,
            reason: reason ? 'Var' : 'Yok'
        });

        if (!status) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Durum zorunludur'
            });
        }

        // Geçerli durum kontrolü
        const validStatuses = ['ilk_inceleme', 'onaylandi', 'reddedildi'];
        if (!validStatuses.includes(status)) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Geçersiz durum değeri'
            });
        }

        const finalStatus = status;
        const finalReason = reason;

        // Başvuruyu kontrol et
        console.log(`🔍 [BASVURU DURUM GUNCELLEME] Başvuru kontrol ediliyor, ID: ${id}`);
        const checkResult = await client.query(
            'SELECT id, durum FROM ciftlik_basvurulari WHERE id = $1::uuid',
            [id]
        );

        console.log(`🔍 [BASVURU DURUM GUNCELLEME] Başvuru kontrol sonucu:`, {
            basvuru_id: id,
            bulunan_kayit_sayisi: checkResult.rows.length,
            mevcut_durum: checkResult.rows[0]?.durum
        });

        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Çiftlik başvurusu bulunamadı'
            });
        }

        // Önceki durumu al
        const oncekiDurum = checkResult.rows[0].durum;

        // Başvuru durumunu güncelle
        const updateFields = ['durum = $1', 'inceleme_tarihi = NOW()', 'inceleyen_id = $2', 'guncelleme = NOW()'];
        const updateValues = [finalStatus, req.user?.id];
        let paramIndex = 3;

        if (finalReason) {
            updateFields.push(`red_nedeni = $${paramIndex++}`);
            updateValues.push(finalReason);
        }

        updateValues.push(id);

        console.log(`🔄 [BASVURU DURUM GUNCELLEME] UPDATE sorgusu hazırlanıyor:`, {
            basvuru_id: id,
            eski_durum: oncekiDurum,
            yeni_durum: finalStatus,
            updateFields,
            updateValues
        });

        // WHERE koşulunu UUID olarak cast et
        const updateQuery = `UPDATE ciftlik_basvurulari 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}::uuid
            RETURNING id, durum, guncelleme`;

        console.log(`💾 [BASVURU DURUM GUNCELLEME] UPDATE sorgusu:`, updateQuery);
        console.log(`💾 [BASVURU DURUM GUNCELLEME] UPDATE parametreleri:`, updateValues);

        const updateResult = await client.query(updateQuery, updateValues);

        if (updateResult.rowCount === 0) {
            console.error(`❌ [BASVURU DURUM GUNCELLEME] HATA: Hiçbir satır güncellenmedi!`);
            console.error(`❌ [BASVURU DURUM GUNCELLEME] Basvuru ID: ${id}`);
            await client.query('ROLLBACK');
            return res.status(500).json({
                success: false,
                message: 'Başvuru durumu güncellenemedi - hiçbir satır etkilenmedi'
            });
        }

        console.log(`✅ [BASVURU DURUM GUNCELLEME] Başvuru durumu güncellendi:`, {
            basvuru_id: updateResult.rows[0].id,
            eski_durum: oncekiDurum,
            yeni_durum: updateResult.rows[0].durum,
            guncellenen_satir_sayisi: updateResult.rowCount,
            guncelleme_tarihi: updateResult.rows[0].guncelleme
        });

        // Güncelleme sonrası doğrulama
        const verifyResult = await client.query(
            'SELECT id, durum FROM ciftlik_basvurulari WHERE id = $1::uuid',
            [id]
        );

        console.log(`🔍 [BASVURU DURUM GUNCELLEME] Doğrulama sonucu:`, {
            basvuru_id: verifyResult.rows[0]?.id,
            guncellenmis_durum: verifyResult.rows[0]?.durum
        });

        // Log kaydı ekle
        await logCiftlikActivity(client, {
            kullanici_id: req.user?.id,
            basvuru_id: id,
            islem_tipi: 'durum_degisikligi',
            eski_durum: oncekiDurum,
            yeni_durum: finalStatus,
            aciklama: finalReason || `Başvuru durumu ${finalStatus} olarak güncellendi`,
            ip_adresi: req.ip,
            user_agent: req.get('user-agent')
        });

        await client.query('COMMIT');

        res.json({
            success: true,
            status: finalStatus,
            message: 'Başvuru durumu güncellendi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Başvuru durumu güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Başvuru durumu güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Sync All Active Farm Users - POST /api/ziraat/farms/sync-users
// Tüm aktif çiftliklerin kullanıcı durumlarını senkronize et
// Mevcut veritabanındaki tüm aktif çiftlikler için kullanıcı durumlarını 'aktif' yapar
const syncAllActiveFarmUsers = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await syncAllAktifCiftlikKullanicilari(client);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Senkronizasyon tamamlandı. ${result.updated} kullanıcının durumu aktif yapıldı.`,
            stats: {
                updated: result.updated,
                total: result.total
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [SYNC ALL] Senkronizasyon hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Senkronizasyon başarısız oldu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getDashboardStats,
    getProductApplications,
    getFarmApplications,
    approveProduct,
    rejectProduct,
    approveFarm,
    rejectFarm,
    rejectFarmAndDelete,
    sendBelgeEksikMessage,
    sendProductBelgeEksikMessage,
    getUpdatedDocuments,
    getRegisteredFarmers,
    getFarmerDetails,
    getDashboardProducts,
    getActivityLog,
    getFarmLogs,
    getAllFarmLogs,
    updateDocumentStatus,
    updateFarmApplicationStatus,
    syncAllActiveFarmUsers
};
