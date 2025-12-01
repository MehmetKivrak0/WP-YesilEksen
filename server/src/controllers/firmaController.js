//Firma Panel İstatistikleri
const { pool } = require('../config/database.js');

const getPanelStats = async (req, res) => {
     try {
          const userId = req.user.id;

          //Firma Id'sini bul
          const firmaResullt = await pool.query
               ('SELECT * FROM firmalar WHERE id = $1', [userId]);

          if (firmaResullt.rowCount === 0) {
               return res.status(404).json({ message: 'Firma bulunamadı' });
          }

          const firmaId = firmaResullt.rows[0].id;

          //Toplam Teklif Sayısı
          const teklifResult = await pool.query
               ('SELECT COUNT(*) FROM teklifler WHERE firma_id = $1', [firmaId]);

          // Onaylanan Teklif Sayısı
          const onaylananTeklifResult = await pool.query
               ('SELECT COUNT(*) FROM teklifler WHERE firma_id = $1 AND durum = $2', [firmaId, 'Onaylandı']);
          //Bekleyen Teklif Sayısı
          const bekleyenTeklifResult = await pool.query
               ('SELECT COUNT(*) FROM teklifler WHERE firma_id = $1 AND durum = $2', [firmaId, 'Beklemede']);

          //Toplam sipariş sayısı

          const siparisResult = await pool.query
               ('SELECT COUNT(*) FROM siparisler WHERE firma_id = $1', [firmaId]);
          // Toplam harcama
          const harcamaResult = await pool.query(
               `SELECT COALESCE(SUM(toplam_tutar), 0) as toplam_harcama
          FROM siparisler 
          WHERE firma_id = $1 AND durum IN ('onaylandi', 'hazirlaniyor', 'kargoda', 'tamamlandi')`,
               [firmaId]
          );

          const sonSiparislerResult = await pool.query(
               `SELECT 
                   s.id,
                   s.siparis_no,
                   u.baslik as urun_adi,
                   c.ad as ciftlik_adi,
                   s.miktar,
                   s.birim_fiyat,
                   s.toplam_tutar,
                   s.durum,
                   s.olusturma_tarihi
               FROM siparisler s
               JOIN urunler u ON s.urun_id = u.id
               JOIN ciftlikler c ON u.ciftlik_id = c.id
               WHERE s.firma_id = $1
               ORDER BY s.olusturma_tarihi DESC
               LIMIT 5`,
               [firmaId]
          );

          res.json({
               success: true,
               stats: {
                    toplamTeklif: parseInt(teklifResult.rows[0].toplam),
                    onayliTeklif: parseInt(onayliResult.rows[0].onayli),
                    bekleyenTeklif: parseInt(bekleyenResult.rows[0].bekleyen),
                    toplamSiparis: parseInt(siparisResult.rows[0].toplam),
                    toplamHarcama: parseFloat(harcamaResult.rows[0].toplam_harcama),
                    sonSiparisler: sonSiparislerResult.rows
               }
          });
     } catch (error) {
          console.error('Firma panel stats hatası:', error);
          res.status(500).json({
               success: false,
               message: 'İstatistikler alınamadı'
          });
     }


}

// Başvuru Durumu Kontrol - GET /api/firma/basvuru-durum
const getBasvuruStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Önce firma_basvurulari tablosundan başvuruyu kontrol et
        const basvuruResult = await pool.query(
            `SELECT 
                fb.id,
                fb.firma_id,
                fb.firma_adi,
                fb.basvuran_adi,
                fb.sektor_id,
                fb.durum,
                fb.vergi_no,
                fb.telefon,
                fb.eposta,
                fb.adres,
                fb.aciklama,
                fb.notlar as admin_notu,
                fb.red_nedeni,
                fb.basvuru_tarihi,
                fb.inceleme_tarihi,
                fb.onay_tarihi,
                fb.guncelleme,
                s.ad as sektor_adi,
                k.ad as kullanici_ad,
                k.soyad as kullanici_soyad,
                k.eposta as kullanici_eposta,
                k.telefon as kullanici_telefon
            FROM firma_basvurulari fb
            LEFT JOIN sektorler s ON fb.sektor_id = s.id
            JOIN kullanicilar k ON fb.kullanici_id = k.id
            WHERE fb.kullanici_id = $1
            ORDER BY fb.basvuru_tarihi DESC
            LIMIT 1`,
            [userId]
        );

        // Eğer başvuru yoksa, firmalar tablosunu kontrol et
        if (basvuruResult.rows.length === 0) {
            const firmaResult = await pool.query(
                `SELECT 
                    f.id,
                    f.ad as firma_adi,
                    f.durum,
                    f.vergi_no,
                    f.telefon,
                    f.adres,
                    f.aciklama,
                    f.olusturma as basvuru_tarihi,
                    f.guncelleme,
                    s.ad as sektor_adi,
                    k.ad as kullanici_ad,
                    k.soyad as kullanici_soyad,
                    k.eposta as kullanici_eposta,
                    k.telefon as kullanici_telefon
                FROM firmalar f
                LEFT JOIN sektorler s ON f.sektor_id = s.id
                JOIN kullanicilar k ON f.kullanici_id = k.id
                WHERE f.kullanici_id = $1 AND f.silinme IS NULL
                LIMIT 1`,
                [userId]
            );

            if (firmaResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Başvuru bulunamadı'
                });
            }

            const firma = firmaResult.rows[0];

            // Firmaya ait belgeleri getir
            const belgelerResult = await pool.query(
                `SELECT 
                    b.id,
                    bt.ad as belge_adi,
                    bt.kod as belge_kodu,
                    b.durum,
                    b.dosya_yolu,
                    b.yonetici_notu as admin_notu,
                    b.red_nedeni,
                    b.zorunlu
                FROM belgeler b
                JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                WHERE b.firma_id = $1
                ORDER BY bt.ad`,
                [firma.id]
            );

            // Durum mapping
            const durumMap = {
                'aktif': 'Onaylandı',
                'beklemede': 'Beklemede',
                'incelemede': 'İncelemede',
                'onaylandi': 'Onaylandı',
                'reddedildi': 'Reddedildi',
                'eksik': 'Eksik Evrak',
                'pasif': 'Pasif'
            };

            return res.json({
                success: true,
                basvuru: {
                    id: firma.id,
                    firmaAdi: firma.firma_adi,
                    sektor: firma.sektor_adi || 'Belirtilmemiş',
                    durum: durumMap[firma.durum] || firma.durum,
                    durumKod: firma.durum,
                    basvuruTarihi: firma.basvuru_tarihi,
                    sonGuncelleme: firma.guncelleme,
                    adminNotu: null,
                    redNedeni: null,
                    yetkili: {
                        ad: firma.kullanici_ad,
                        soyad: firma.kullanici_soyad,
                        telefon: firma.kullanici_telefon || firma.telefon,
                        eposta: firma.kullanici_eposta
                    },
                    belgeler: belgelerResult.rows.map(b => ({
                        id: b.id,
                        ad: b.belge_adi,
                        kod: b.belge_kodu,
                        durum: durumMap[b.durum] || b.durum,
                        durumKod: b.durum,
                        dosyaUrl: b.dosya_yolu ? `/api/documents/file/${b.dosya_yolu}` : null,
                        adminNotu: b.admin_notu,
                        redNedeni: b.red_nedeni,
                        zorunlu: b.zorunlu
                    }))
                }
            });
        }

        const basvuru = basvuruResult.rows[0];

        // Başvuruya ait belgeleri getir
        const belgelerResult = await pool.query(
            `SELECT 
                b.id,
                bt.ad as belge_adi,
                bt.kod as belge_kodu,
                b.durum,
                b.dosya_yolu,
                b.yonetici_notu as admin_notu,
                b.red_nedeni,
                b.zorunlu
            FROM belgeler b
            JOIN belge_turleri bt ON b.belge_turu_id = bt.id
            WHERE b.basvuru_id = $1 OR b.firma_id = $2
            ORDER BY bt.ad`,
            [basvuru.id, basvuru.firma_id]
        );

        // Durum mapping (veritabanı değerleri -> UI değerleri)
        const durumMap = {
            'aktif': 'Onaylandı',
            'beklemede': 'Beklemede',
            'incelemede': 'İncelemede',
            'onaylandi': 'Onaylandı',
            'reddedildi': 'Reddedildi',
            'eksik': 'Eksik Evrak',
            'pasif': 'Pasif'
        };

        res.json({
            success: true,
            basvuru: {
                id: basvuru.id,
                firmaId: basvuru.firma_id,
                firmaAdi: basvuru.firma_adi,
                sektor: basvuru.sektor_adi || 'Belirtilmemiş',
                durum: durumMap[basvuru.durum] || basvuru.durum,
                durumKod: basvuru.durum,
                vergiNo: basvuru.vergi_no,
                telefon: basvuru.telefon,
                eposta: basvuru.eposta,
                adres: basvuru.adres,
                aciklama: basvuru.aciklama,
                basvuruTarihi: basvuru.basvuru_tarihi,
                incelemeTarihi: basvuru.inceleme_tarihi,
                onayTarihi: basvuru.onay_tarihi,
                sonGuncelleme: basvuru.guncelleme,
                adminNotu: basvuru.admin_notu,
                redNedeni: basvuru.red_nedeni,
                yetkili: {
                    ad: basvuru.kullanici_ad || basvuru.basvuran_adi?.split(' ')[0],
                    soyad: basvuru.kullanici_soyad || basvuru.basvuran_adi?.split(' ').slice(1).join(' '),
                    telefon: basvuru.kullanici_telefon || basvuru.telefon,
                    eposta: basvuru.kullanici_eposta || basvuru.eposta
                },
                belgeler: belgelerResult.rows.map(b => ({
                    id: b.id,
                    ad: b.belge_adi,
                    kod: b.belge_kodu,
                    durum: durumMap[b.durum] || b.durum,
                    durumKod: b.durum,
                    dosyaUrl: b.dosya_yolu ? `/api/documents/file/${b.dosya_yolu}` : null,
                    adminNotu: b.admin_notu,
                    redNedeni: b.red_nedeni,
                    zorunlu: b.zorunlu
                }))
            }
        });

    } catch (error) {
        console.error('Başvuru durum hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Başvuru durumu alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Çalışan sayısını aralığa çevir (1-5, 6-10, 11-50, 51-100, 100+)
const getCalisanSayisiRange = (sayi) => {
    if (sayi <= 5) return '1-5';
    if (sayi <= 10) return '6-10';
    if (sayi <= 50) return '11-50';
    if (sayi <= 100) return '51-100';
    return '100+';
};

// Çalışan sayısı aralığını sayıya çevir (güncelleme için)
const parseCalisanSayisi = (range) => {
    if (!range) return null;
    const parts = range.split('-');
    if (parts.length === 2) {
        return parseInt(parts[1]);
    }
    if (range === '100+') return 101;
    return parseInt(range) || null;
};

// Firma Profil Bilgilerini Getir - GET /api/firma/profile
const getFirmaProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Firma profil isteği:', {
                userId: userId,
                userRole: req.user.rol
            });
        }

        // Firma bilgilerini getir (firmalar tablosundan)
        const firmaResult = await pool.query(
            `SELECT 
                f.id,
                f.ad,
                f.vergi_no,
                f.ticaret_sicil_no,
                f.telefon,
                f.adres,
                f.website,
                f.aciklama,
                f.calisan_sayisi,
                f.kurulus_yili,
                f.dogrulandi,
                f.dogrulama_tarihi,
                f.durum,
                f.sektor_id,
                s.ad as sektor_adi,
                k.eposta,
                k.ad as kullanici_ad,
                k.soyad as kullanici_soyad,
                k.avatar_url as profil_foto_url,
                f.olusturma,
                f.guncelleme
            FROM firmalar f
            JOIN kullanicilar k ON f.kullanici_id = k.id
            LEFT JOIN sektorler s ON f.sektor_id = s.id
            WHERE f.kullanici_id = $1 AND f.silinme IS NULL`,
            [userId]
        );

        if (firmaResult.rows.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ Firma bulunamadı:', {
                    userId: userId,
                    query: 'firmalar tablosunda kullanici_id ile firma aranıyor'
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        const firma = firmaResult.rows[0];

        // Sertifikaları getir
        const sertifikaResult = await pool.query(
            `SELECT 
                fs.id,
                fs.sertifika_no,
                fs.veren_kurum,
                fs.baslangic_tarihi,
                fs.bitis_tarihi,
                fs.suresiz,
                fs.dosya_url,
                st.ad as sertifika_turu_adi
            FROM firma_sertifikalari fs
            LEFT JOIN sertifika_turleri st ON fs.sertifika_turu_id = st.id
            WHERE fs.firma_id = $1
            ORDER BY fs.baslangic_tarihi DESC`,
            [firma.id]
        );

        res.json({
            success: true,
            firma: {
                id: firma.id,
                ad: firma.ad,
                sektor: firma.sektor_adi || 'Sektör Yok',
                sektorId: firma.sektor_id,
                vergiNo: firma.vergi_no,
                ticaretSicilNo: firma.ticaret_sicil_no || '',
                telefon: firma.telefon || '',
                email: firma.eposta || '',
                website: firma.website || '',
                adres: firma.adres || '',
                kurulusYili: firma.kurulus_yili ? firma.kurulus_yili.toString() : '',
                calisanSayisi: firma.calisan_sayisi ? getCalisanSayisiRange(firma.calisan_sayisi) : '',
                aciklama: firma.aciklama || '',
                dogrulanmis: firma.dogrulandi || false,
                dogrulamaTarihi: firma.dogrulama_tarihi,
                durum: firma.durum,
                olusturma: firma.olusturma,
                guncelleme: firma.guncelleme,
                profilFotoUrl: firma.profil_foto_url || null,
                yetkili: {
                    ad: firma.kullanici_ad,
                    soyad: firma.kullanici_soyad,
                    eposta: firma.eposta
                },
                sertifikalar: sertifikaResult.rows.map(s => ({
                    id: s.id,
                    ad: s.sertifika_turu_adi || 'Sertifika',
                    no: s.sertifika_no || '',
                    verenKurum: s.veren_kurum || '',
                    baslangicTarihi: s.baslangic_tarihi,
                    bitisTarihi: s.bitis_tarihi,
                    suresiz: s.suresiz || false,
                    dosyaUrl: s.dosya_url || ''
                }))
            }
        });
    } catch (error) {
        console.error('Firma profil hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Firma profili alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Firma Profil Güncelle - PUT /api/firma/profile
const updateFirmaProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const userId = req.user.id;
        const {
            ad,
            telefon,
            website,
            adres,
            kurulusYili,
            calisanSayisi,
            aciklama,
            sektorId
        } = req.body;

        // Önce firmayı bul
        const firmaCheck = await client.query(
            'SELECT id FROM firmalar WHERE kullanici_id = $1 AND silinme IS NULL',
            [userId]
        );

        if (firmaCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        const firmaId = firmaCheck.rows[0].id;

        // Güncelleme sorgusu - sadece gönderilen alanları güncelle
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (ad !== undefined) {
            updateFields.push(`ad = $${paramIndex++}`);
            updateValues.push(ad);
        }
        if (telefon !== undefined) {
            updateFields.push(`telefon = $${paramIndex++}`);
            updateValues.push(telefon);
        }
        if (website !== undefined) {
            updateFields.push(`website = $${paramIndex++}`);
            updateValues.push(website);
        }
        if (adres !== undefined) {
            updateFields.push(`adres = $${paramIndex++}`);
            updateValues.push(adres);
        }
        if (kurulusYili !== undefined) {
            updateFields.push(`kurulus_yili = $${paramIndex++}`);
            updateValues.push(kurulusYili ? parseInt(kurulusYili) : null);
        }
        if (calisanSayisi !== undefined) {
            updateFields.push(`calisan_sayisi = $${paramIndex++}`);
            updateValues.push(parseCalisanSayisi(calisanSayisi));
        }
        if (aciklama !== undefined) {
            updateFields.push(`aciklama = $${paramIndex++}`);
            updateValues.push(aciklama);
        }
        if (sektorId !== undefined) {
            updateFields.push(`sektor_id = $${paramIndex++}`);
            updateValues.push(sektorId || null);
        }

        if (updateFields.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Güncellenecek alan bulunamadı'
            });
        }

        // Güncelleme tarihini ekle
        updateFields.push(`guncelleme = CURRENT_TIMESTAMP`);
        updateValues.push(firmaId);

        const updateQuery = `
            UPDATE firmalar 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id, ad, telefon, website, adres, kurulus_yili, calisan_sayisi, aciklama, sektor_id, guncelleme
        `;

        const updateResult = await client.query(updateQuery, updateValues);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Firma profili başarıyla güncellendi',
            firma: updateResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Firma profil güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Firma profili güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Profil Fotoğrafı Yükle - POST /api/firma/profile/photo
const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Dosya yüklenmedi'
            });
        }

        // Firma bilgisini bul
        const firmaResult = await pool.query(
            'SELECT id FROM firmalar WHERE kullanici_id = $1 AND silinme IS NULL',
            [userId]
        );

        if (firmaResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        const firmaId = firmaResult.rows[0].id;

        // Dosya yolunu normalize et
        const filePath = file.path.replace(/\\/g, '/');
        // Dosya yolundan uploads klasörünü çıkar (sadece alt klasör ve dosya adı)
        // Örnek: C:/path/to/uploads/photos/profile-xxx.jpg -> photos/profile-xxx.jpg
        const relativePath = filePath.replace(/.*[\/\\]uploads[\/\\]/, '');
        const photoUrl = `/api/documents/file/${relativePath}`;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('📸 Profil fotoğrafı yüklendi:', {
                originalPath: file.path,
                filePath: filePath,
                relativePath: relativePath,
                photoUrl: photoUrl,
                fileName: file.filename
            });
        }

        // Profil fotoğrafı URL'sini kullanicilar tablosundaki avatar_url'e kaydet
        // Eski fotoğrafı sil (varsa ve farklıysa)
        // TODO: Dosya sisteminden silme işlemi

        // Profil fotoğrafı URL'sini güncelle (avatar_url kolonunu kullan)
        await pool.query(
            'UPDATE kullanicilar SET avatar_url = $1 WHERE id = $2',
            [photoUrl, userId]
        );

        res.json({
            success: true,
            message: 'Profil fotoğrafı başarıyla yüklendi',
            photoUrl: photoUrl
        });

    } catch (error) {
        console.error('Profil fotoğrafı yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Profil fotoğrafı yüklenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Sertifika Türlerini Getir - GET /api/firma/certificates/types
const getSertifikaTurleri = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, kod, ad, aciklama FROM sertifika_turleri WHERE aktif = TRUE ORDER BY ad'
        );

        res.json({
            success: true,
            types: result.rows
        });
    } catch (error) {
        console.error('Sertifika türleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sertifika türleri alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Sertifika Ekle - POST /api/firma/certificates
const addSertifika = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const userId = req.user.id;
        const {
            sertifikaTuruId,
            sertifikaNo,
            verenKurum,
            baslangicTarihi,
            bitisTarihi,
            suresiz
        } = req.body;

        const file = req.file;

        // Firma bilgisini bul
        const firmaResult = await client.query(
            'SELECT id FROM firmalar WHERE kullanici_id = $1 AND silinme IS NULL',
            [userId]
        );

        if (firmaResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        const firmaId = firmaResult.rows[0].id;

        // Dosya yolu (varsa)
        let dosyaUrl = null;
        if (file) {
            const filePath = file.path.replace(/\\/g, '/');
            dosyaUrl = `/api/documents/file/${filePath.replace(/.*\/uploads\//, 'uploads/')}`;
        }

        // Sertifikayı ekle
        const sertifikaResult = await client.query(
            `INSERT INTO firma_sertifikalari 
            (firma_id, sertifika_turu_id, sertifika_no, veren_kurum, baslangic_tarihi, bitis_tarihi, suresiz, dosya_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, sertifika_no, veren_kurum, baslangic_tarihi, bitis_tarihi, suresiz, dosya_url`,
            [
                firmaId,
                sertifikaTuruId,
                sertifikaNo || null,
                verenKurum || null,
                baslangicTarihi,
                bitisTarihi || null,
                suresiz || false,
                dosyaUrl
            ]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Sertifika başarıyla eklendi',
            sertifika: sertifikaResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Sertifika ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sertifika eklenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Sertifika Sil - DELETE /api/firma/certificates/:id
const deleteSertifika = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const userId = req.user.id;
        const { id } = req.params;

        // Firma bilgisini bul
        const firmaResult = await client.query(
            'SELECT id FROM firmalar WHERE kullanici_id = $1 AND silinme IS NULL',
            [userId]
        );

        if (firmaResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        const firmaId = firmaResult.rows[0].id;

        // Sertifikanın bu firmaya ait olduğunu kontrol et
        const sertifikaResult = await client.query(
            'SELECT id, dosya_url FROM firma_sertifikalari WHERE id = $1 AND firma_id = $2',
            [id, firmaId]
        );

        if (sertifikaResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Sertifika bulunamadı veya bu firmaya ait değil'
            });
        }

        // Dosyayı sil (varsa)
        // TODO: Dosya silme işlemi

        // Sertifikayı sil
        await client.query(
            'DELETE FROM firma_sertifikalari WHERE id = $1',
            [id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Sertifika başarıyla silindi'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Sertifika silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sertifika silinemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Başvuru Belgesi Güncelle - POST /api/firma/basvuru-belge/:belgeId
const updateBasvuruBelge = async (req, res) => {
    try {
        const userId = req.user.id;
        const { belgeId } = req.params;
        const { mesaj } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Dosya yüklenmedi'
            });
        }

        // Belgenin kullanıcıya ait olduğunu kontrol et
        const belgeResult = await pool.query(
            `SELECT b.id, b.belge_turu_id, b.durum, bt.ad as belge_adi
             FROM belgeler b
             JOIN belge_turleri bt ON b.belge_turu_id = bt.id
             WHERE b.id = $1 AND b.kullanici_id = $2`,
            [belgeId, userId]
        );

        if (belgeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Belge bulunamadı veya yetkiniz yok'
            });
        }

        const belge = belgeResult.rows[0];

        // Sadece reddedilmiş veya beklemede olan belgeler güncellenebilir
        if (!['beklemede', 'reddedildi', 'eksik'].includes(belge.durum)) {
            return res.status(400).json({
                success: false,
                message: 'Bu belge güncellenemez. Sadece reddedilmiş veya beklemede olan belgeler güncellenebilir.'
            });
        }

        // Dosya yolunu normalize et
        const filePath = file.path.replace(/\\/g, '/');
        const relativePath = filePath.replace(/.*[\/\\]uploads[\/\\]/, '');

        // Belgeyi güncelle
        await pool.query(
            `UPDATE belgeler 
             SET dosya_yolu = $1, 
                 dosya_boyutu = $2, 
                 dosya_tipi = $3,
                 durum = 'beklemede',
                 kullanici_notu = $4,
                 guncelleme = NOW()
             WHERE id = $5`,
            [relativePath, file.size, file.mimetype, mesaj || null, belgeId]
        );

        // Aktivite kaydı ekle (eğer tablo varsa)
        try {
            // Firma ID'sini bul
            const firmaResult = await pool.query(
                'SELECT id FROM firmalar WHERE kullanici_id = $1 AND silinme IS NULL LIMIT 1',
                [userId]
            );

            if (firmaResult.rows.length > 0) {
                await pool.query(
                    `INSERT INTO aktiviteler (firma_id, kullanici_id, islem_tipi, aciklama, detaylar, olusturma)
                     VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [
                        firmaResult.rows[0].id,
                        userId,
                        'belge_guncelleme',
                        `${belge.belge_adi} belgesi güncellendi`,
                        JSON.stringify({ belgeId, eskiDurum: belge.durum, yeniDurum: 'beklemede' })
                    ]
                );
            }
        } catch (logError) {
            console.log('Aktivite kaydı eklenemedi (tablo mevcut olmayabilir):', logError.message);
        }

        res.json({
            success: true,
            message: 'Belge başarıyla güncellendi ve incelemeye gönderildi',
            belge: {
                id: belgeId,
                ad: belge.belge_adi,
                durum: 'Beklemede',
                dosyaUrl: `/api/documents/file/${relativePath}`
            }
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

// Toplu Belge Güncelle - POST /api/firma/basvuru-belgeler
const updateBasvuruBelgeler = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const files = req.files; // Multer'dan gelen dosyalar { belgeId: [file] }
        const { mesaj } = req.body;

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dosya yüklenmedi'
            });
        }

        await client.query('BEGIN');

        const updatedBelgeler = [];

        for (const [fieldName, fileArray] of Object.entries(files)) {
            const belgeId = fieldName; // fieldName = belgeId
            const file = fileArray[0];

            // Belgenin kullanıcıya ait olduğunu kontrol et
            const belgeResult = await client.query(
                `SELECT b.id, b.belge_turu_id, b.durum, bt.ad as belge_adi
                 FROM belgeler b
                 JOIN belge_turleri bt ON b.belge_turu_id = bt.id
                 WHERE b.id = $1 AND b.kullanici_id = $2`,
                [belgeId, userId]
            );

            if (belgeResult.rows.length === 0) {
                continue; // Bu belge atla
            }

            const belge = belgeResult.rows[0];

            // Sadece reddedilmiş veya beklemede olan belgeler güncellenebilir
            if (!['beklemede', 'reddedildi', 'eksik'].includes(belge.durum)) {
                continue;
            }

            // Dosya yolunu normalize et
            const filePath = file.path.replace(/\\/g, '/');
            const relativePath = filePath.replace(/.*[\/\\]uploads[\/\\]/, '');

            // Belgeyi güncelle
            await client.query(
                `UPDATE belgeler 
                 SET dosya_yolu = $1, 
                     dosya_boyutu = $2, 
                     dosya_tipi = $3,
                     durum = 'beklemede',
                     kullanici_notu = $4,
                     guncelleme = NOW()
                 WHERE id = $5`,
                [relativePath, file.size, file.mimetype, mesaj || null, belgeId]
            );

            updatedBelgeler.push({
                id: belgeId,
                ad: belge.belge_adi,
                durum: 'Beklemede'
            });
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `${updatedBelgeler.length} belge başarıyla güncellendi`,
            belgeler: updatedBelgeler
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Toplu belge güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Belgeler güncellenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Public - Tüm firmaları listele (auth gerektirmez)
const getPublicFirmalar = async (req, res) => {
    try {
        const { search, sektor, konum, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let whereConditions = [`f.durum = 'aktif'`, `f.silinme IS NULL`];
        let params = [];
        let paramIndex = 1;

        // Arama filtresi
        if (search) {
            whereConditions.push(`(f.ad ILIKE $${paramIndex} OR s.ad ILIKE $${paramIndex} OR f.adres ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Sektör filtresi
        if (sektor) {
            whereConditions.push(`s.ad ILIKE $${paramIndex}`);
            params.push(`%${sektor}%`);
            paramIndex++;
        }

        // Konum filtresi
        if (konum) {
            whereConditions.push(`f.adres ILIKE $${paramIndex}`);
            params.push(`%${konum}%`);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Toplam sayı
        const countQuery = `
            SELECT COUNT(*) as total
            FROM firmalar f
            LEFT JOIN sektorler s ON f.sektor_id = s.id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Firma listesi
        const firmaQuery = `
            SELECT 
                f.id,
                f.ad,
                f.vergi_no,
                f.telefon,
                f.adres,
                f.kurulus_yili,
                f.calisan_sayisi,
                f.aciklama,
                f.durum,
                f.olusturma as kayit_tarihi,
                s.ad as sektor,
                k.ad as yetkili_ad,
                k.soyad as yetkili_soyad,
                k.eposta as email,
                k.avatar_url as profil_foto,
                CASE WHEN f.durum = 'aktif' THEN true ELSE false END as dogrulandi
            FROM firmalar f
            LEFT JOIN sektorler s ON f.sektor_id = s.id
            LEFT JOIN kullanicilar k ON f.kullanici_id = k.id
            ${whereClause}
            ORDER BY f.olusturma DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        params.push(parseInt(limit), offset);
        const firmaResult = await pool.query(firmaQuery, params);

        // Konum bilgisini parse et
        const firmalar = firmaResult.rows.map(firma => {
            // Adres içinden şehir bilgisini çıkar
            let konum = firma.adres || '';
            const sehirler = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Adana', 'Antalya', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Malatya', 'Kahramanmaraş', 'Van', 'Trabzon', 'Manisa'];
            
            for (const sehir of sehirler) {
                if (konum.toLowerCase().includes(sehir.toLowerCase())) {
                    konum = sehir;
                    break;
                }
            }

            return {
                id: firma.id,
                ad: firma.ad,
                konum: konum || firma.adres,
                sektor: firma.sektor || 'Belirtilmemiş',
                telefon: firma.telefon,
                email: firma.email,
                dogrulandi: firma.dogrulandi,
                yetkili: firma.yetkili_ad && firma.yetkili_soyad 
                    ? `${firma.yetkili_ad} ${firma.yetkili_soyad}` 
                    : null,
                kurulusYili: firma.kurulus_yili,
                calisanSayisi: firma.calisan_sayisi,
                aciklama: firma.aciklama,
                kayitTarihi: firma.kayit_tarihi,
                profilFoto: firma.profil_foto
            };
        });

        res.json({
            success: true,
            firmalar,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Public firmalar listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Firmalar listelenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Public - Sektör listesi
const getSektorler = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, ad, aciklama FROM sektorler ORDER BY ad`
        );
        
        res.json({
            success: true,
            sektorler: result.rows
        });
    } catch (error) {
        console.error('Sektörler listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sektörler listelenemedi'
        });
    }
};

// Public - Firma detay
const getFirmaDetay = async (req, res) => {
    try {
        const { id } = req.params;

        // Firma bilgilerini al
        const firmaQuery = `
            SELECT 
                f.id,
                f.ad,
                f.vergi_no,
                f.ticaret_sicil_no,
                f.telefon,
                f.adres,
                f.kurulus_yili,
                f.calisan_sayisi,
                f.aciklama,
                f.durum,
                f.olusturma as kayit_tarihi,
                f.guncelleme as son_guncelleme,
                s.id as sektor_id,
                s.ad as sektor,
                k.ad as yetkili_ad,
                k.soyad as yetkili_soyad,
                k.eposta as email,
                k.telefon as yetkili_telefon,
                k.avatar_url as profil_foto,
                CASE WHEN f.durum = 'aktif' THEN true ELSE false END as dogrulandi
            FROM firmalar f
            LEFT JOIN sektorler s ON f.sektor_id = s.id
            LEFT JOIN kullanicilar k ON f.kullanici_id = k.id
            WHERE f.id = $1 AND f.silinme IS NULL
        `;
        
        const firmaResult = await pool.query(firmaQuery, [id]);
        
        if (firmaResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Firma bulunamadı'
            });
        }

        const firma = firmaResult.rows[0];

        // Sertifikaları al
        const sertifikaQuery = `
            SELECT 
                fs.id,
                st.ad as sertifika_adi,
                fs.sertifika_no,
                fs.veren_kurum,
                fs.baslangic_tarihi,
                fs.bitis_tarihi,
                fs.suresiz,
                fs.dosya_url
            FROM firma_sertifikalari fs
            LEFT JOIN sertifika_turleri st ON fs.sertifika_turu_id = st.id
            WHERE fs.firma_id = $1
            ORDER BY fs.baslangic_tarihi DESC
        `;
        const sertifikaResult = await pool.query(sertifikaQuery, [id]);

        // Konum bilgisini parse et
        let konum = firma.adres || '';
        let sehir = '';
        let ilce = '';
        const sehirler = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Adana', 'Antalya', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Malatya', 'Kahramanmaraş', 'Van', 'Trabzon', 'Manisa'];
        
        for (const s of sehirler) {
            if (konum.toLowerCase().includes(s.toLowerCase())) {
                sehir = s;
                break;
            }
        }

        // Adres parçalarından ilçe bulmaya çalış
        const adresParcalari = konum.split(',').map(p => p.trim());
        if (adresParcalari.length > 1) {
            ilce = adresParcalari[adresParcalari.length - 2] || '';
        }

        const response = {
            success: true,
            firma: {
                id: firma.id,
                ad: firma.ad,
                vergiNo: firma.vergi_no,
                ticaretSicilNo: firma.ticaret_sicil_no,
                sektor: firma.sektor || 'Belirtilmemiş',
                sektorId: firma.sektor_id,
                telefon: firma.telefon,
                email: firma.email,
                adres: firma.adres,
                sehir: sehir || konum,
                ilce: ilce,
                kurulusYili: firma.kurulus_yili,
                calisanSayisi: firma.calisan_sayisi,
                aciklama: firma.aciklama,
                dogrulandi: firma.dogrulandi,
                kayitTarihi: firma.kayit_tarihi,
                sonGuncelleme: firma.son_guncelleme,
                profilFoto: firma.profil_foto,
                yetkili: {
                    ad: firma.yetkili_ad,
                    soyad: firma.yetkili_soyad,
                    telefon: firma.yetkili_telefon,
                    eposta: firma.email
                },
                sertifikalar: sertifikaResult.rows.map(s => ({
                    id: s.id,
                    ad: s.sertifika_adi,
                    no: s.sertifika_no,
                    verenKurum: s.veren_kurum,
                    baslangicTarihi: s.baslangic_tarihi,
                    bitisTarihi: s.bitis_tarihi,
                    suresiz: s.suresiz,
                    dosyaUrl: s.dosya_url
                }))
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Firma detay hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Firma detayları alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
     getPanelStats,
     getBasvuruStatus,
     getFirmaProfile,
     updateFirmaProfile,
     uploadProfilePhoto,
     getSertifikaTurleri,
     addSertifika,
     deleteSertifika,
     updateBasvuruBelge,
     updateBasvuruBelgeler,
     getPublicFirmalar,
     getSektorler,
     getFirmaDetay
 };
