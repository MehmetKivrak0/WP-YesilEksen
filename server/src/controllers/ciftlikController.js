const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

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

        //ürün oluştur
        const result = await pool.query(
            `INSERT INTO urunler 
            (ciftlik_id, baslik, aciklama, miktar, birim, fiyat, kategori, durum)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'aktif')
            RETURNING *`,
            [ciftlik_id, title, desc, miktar, birim, price, category]
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
            SET baslik = COALESCE($1, baslik),
                aciklama = COALESCE($2, aciklama),
                miktar = COALESCE($3, miktar),
                birim = COALESCE($4, birim),
                fiyat = COALESCE($5, fiyat),
                kategori = COALESCE($6, kategori),
                durum = COALESCE($7, durum),
                guncelleme_tarihi = CURRENT_TIMESTAMP
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
                            const normalizedPath = row.dosya_url.startsWith('/') 
                                ? row.dosya_url.substring(1) 
                                : row.dosya_url;
                            // Path'i encode et (özel karakterler için)
                            const encodedPath = encodeURIComponent(normalizedPath).replace(/%2F/g, '/');
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
        const { belgeId } = req.body;
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

        // Belgeyi kontrol et
        const belgeResult = await client.query(
            `SELECT b.id, b.basvuru_id, b.durum, b.inceleme_tarihi, b.dosya_yolu, cb.kullanici_id
             FROM belgeler b
             JOIN ciftlik_basvurulari cb ON b.basvuru_id = cb.id
             WHERE b.id = $1::uuid 
               AND b.basvuru_tipi = 'ciftlik_basvurusu'
               AND b.durum = 'Eksik'
               AND cb.kullanici_id = $2::uuid`,
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
                 durum = 'gcbelge'
             WHERE id = $4::uuid`,
            [relativePath, file.size, path.extname(file.originalname).substring(1).toLowerCase(), belgeId]
        );

        // Başvurudaki tüm eksik belgeleri kontrol et
        // Eğer hiç eksik belge kalmadıysa, başvuru durumunu 'beklemede' yap
        const eksikBelgeKontrol = await client.query(
            `SELECT COUNT(*) as eksik_sayisi
             FROM belgeler
             WHERE basvuru_id = $1::uuid
               AND basvuru_tipi = 'ciftlik_basvurusu'
               AND durum = 'Eksik'
               AND inceleme_tarihi IS NOT NULL`,
            [belge.basvuru_id]
        );

        const eksikBelgeSayisi = parseInt(eksikBelgeKontrol.rows[0].eksik_sayisi);

        // Eğer hiç eksik belge kalmadıysa, başvuru durumunu 'gcbelge' yap
        // "gcbelge" = güncel belge (eksik belgeler yüklendi, admin onayı bekleniyor)
        if (eksikBelgeSayisi === 0) {
            // Önce mevcut durumu kontrol et
            const mevcutDurumResult = await client.query(
                `SELECT durum FROM ciftlik_basvurulari WHERE id = $1::uuid`,
                [belge.basvuru_id]
            );
            
            if (mevcutDurumResult.rows.length > 0) {
                const mevcutDurum = mevcutDurumResult.rows[0].durum;
                console.log(`🔍 [UPLOAD MISSING DOC] Mevcut başvuru durumu: ${mevcutDurum} - Basvuru ID: ${belge.basvuru_id}`);
                
                // Durum 'belge_eksik' veya 'beklemede' ise 'gcbelge' yap
                // (Bazı durumlarda başvuru 'beklemede' olabilir ama eksik belgeler yüklenmiş olabilir)
                if (mevcutDurum === 'belge_eksik' || mevcutDurum === 'beklemede') {
                    await client.query(
                        `UPDATE ciftlik_basvurulari
                         SET durum = 'gcbelge',
                             guncelleme = CURRENT_TIMESTAMP
                         WHERE id = $1::uuid`,
                        [belge.basvuru_id]
                    );
                    console.log(`✅ [UPLOAD MISSING DOC] Başvuru durumu 'gcbelge' olarak güncellendi (${mevcutDurum} → gcbelge) - Basvuru ID: ${belge.basvuru_id}`);
                } else {
                    console.log(`⚠️ [UPLOAD MISSING DOC] Başvuru durumu '${mevcutDurum}' olduğu için güncellenmedi - Basvuru ID: ${belge.basvuru_id}`);
                }
            }
        }

        await client.query('COMMIT');

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
    addSertifika
};

