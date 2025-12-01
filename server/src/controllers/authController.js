const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtHelper');
const path = require('path');

/**
 * Dosya yolunu normalize et (veritabanına kayıt için)
 */
const normalizeFilePath = (file, userType, userId) => {
    if (!file) return null;
    
    // Multer diskStorage kullanıldığında file.path otomatik olarak set edilir
    // Ancak güvenlik için kontrol edelim
    if (!file.path) {
        // Eğer path yoksa, destination ve filename'den oluştur
        if (file.destination && file.filename) {
            const fullPath = path.join(file.destination, file.filename);
            const relativePath = path.relative(path.join(__dirname, '../../uploads'), fullPath);
            return relativePath.replace(/\\/g, '/'); // Windows için backslash'i slash'e çevir
        }
        return null;
    }
    
    try {
        const relativePath = path.relative(path.join(__dirname, '../../uploads'), file.path);
        return relativePath.replace(/\\/g, '/'); // Windows için backslash'i slash'e çevir
    } catch (error) {
        console.error('❌ normalizeFilePath hatası:', error.message);
        return null;
    }
};

/**
 * Kullanıcı kaydı (FormData ile - dosya yükleme desteği)
 * POST /api/auth/register
 */
const register = async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Debug: Gelen verileri logla
        if (process.env.NODE_ENV === 'development') {
            console.log('📝 Register isteği:', {
                body: req.body,
                bodyKeys: Object.keys(req.body || {}),
                hasFiles: !!req.files,
                filesKeys: req.files ? Object.keys(req.files) : []
            });
        }

        // FormData'dan gelen veriler (req.body ve req.files)
        const {
            firstName,
            lastName,
            email,
            password,
            userType, // 'farmer', 'company', 'ziraat', 'sanayi'
            phone,
            terms,
            // Çiftlik bilgileri
            farmName,
            address,
            wasteTypes,
            otherWasteType,
            // Şirket bilgileri
            companyName,
            taxNumber
        } = req.body;
        
        // Dosyalar (req.files)
        const files = req.files || {};

        // Debug: Parse edilen değerleri logla
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Parse edilen değerler:', {
                firstName: firstName ? '✓' : '✗',
                lastName: lastName ? '✓' : '✗',
                email: email ? '✓' : '✗',
                password: password ? `✓ (${password.length} karakter)` : '✗',
                userType: userType ? `✓ (${userType})` : '✗',
                phone: phone ? '✓' : '✗',
                terms: terms,
                termsType: typeof terms,
                farmName: farmName || 'yok',
                companyName: companyName || 'yok'
            });
        }

        // Validasyon - FormData'dan gelen değerler string olabilir
        // Trim işlemi yaparak boş string kontrolü de yapıyoruz
        const trimmedFirstName = firstName?.trim();
        const trimmedLastName = lastName?.trim();
        const trimmedEmail = email?.trim();
        const trimmedPhone = phone?.trim();
        
        if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !userType || !trimmedPhone) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanları doldurunuz',
                missing: {
                    firstName: !trimmedFirstName,
                    lastName: !trimmedLastName,
                    email: !trimmedEmail,
                    userType: !userType,
                    phone: !trimmedPhone
                }
            });
        }

        // Şifre kontrolü - Sosyal medya girişi için opsiyonel olabilir
        // Ama normal kayıt için zorunlu
        const trimmedPassword = password?.trim();
        if (!trimmedPassword || trimmedPassword === '') {
            return res.status(400).json({
                success: false,
                message: 'Şifre gereklidir',
                field: 'password'
            });
        }
        
        // Şifre uzunluk kontrolü
        if (trimmedPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 8 karakter olmalıdır',
                field: 'password'
            });
        }

        // Terms kontrolü - FormData'dan string olarak gelebilir ("true" veya "false")
        const termsValue = typeof terms === 'string' 
            ? terms.toLowerCase() === 'true' 
            : Boolean(terms);
        
        if (!termsValue) {
            return res.status(400).json({
                success: false,
                message: 'Şartları kabul etmelisiniz'
            });
        }

        // Email format kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir e-posta adresi giriniz',
                field: 'email'
            });
        }

        // Email kontrolü - Reddedilen kullanıcılar için özel mantık
        // Not: Transaction başlamadan önce pool kullanıyoruz
        const emailCheck = await pool.query(
            `SELECT k.id, k.rol, k.durum, 
                    (SELECT COUNT(*) FROM ciftlik_basvurulari cb 
                     WHERE cb.kullanici_id = k.id AND cb.durum IN ('ilk_inceleme', 'belge_eksik', 'onaylandi')) as aktif_basvuru_sayisi,
                    (SELECT COUNT(*) FROM ciftlik_basvurulari cb 
                     WHERE cb.kullanici_id = k.id) as toplam_basvuru_sayisi
             FROM kullanicilar k 
             WHERE k.eposta = $1`,
            [trimmedEmail]
        );

        let existingUser = null;
        let isRejectedUser = false;

        if (emailCheck.rows.length > 0) {
            existingUser = emailCheck.rows[0];
            
            // Eğer kullanıcı çiftçi ise ve aktif başvurusu yoksa (reddedilmiş ve silinmiş olabilir)
            // izin ver
            if (existingUser.rol === 'ciftci' && userType === 'farmer') {
                const aktifBasvuruSayisi = parseInt(existingUser.aktif_basvuru_sayisi) || 0;
                const toplamBasvuruSayisi = parseInt(existingUser.toplam_basvuru_sayisi) || 0;
                
                // Eğer aktif başvurusu yoksa (reddedilmiş ve silinmiş olabilir), yeniden kayıt olabilir
                if (aktifBasvuruSayisi === 0) {
                    isRejectedUser = true;
                    console.log(`🔄 [KAYIT] Reddedilen kullanıcı yeniden kayıt oluyor:`, {
                        email: trimmedEmail,
                        kullanici_id: existingUser.id,
                        aktif_basvuru_sayisi: aktifBasvuruSayisi,
                        toplam_basvuru_sayisi: toplamBasvuruSayisi
                    });
                } else {
                    // Aktif başvurusu var, kayıt olamaz
                    return res.status(400).json({
                        success: false,
                        message: 'Bu email adresi zaten kayıtlı ve aktif başvurunuz bulunmaktadır',
                        field: 'email'
                    });
                }
            } else {
                // Çiftçi değilse veya farklı rol ile kayıt olmaya çalışıyorsa, normal hata
                return res.status(400).json({
                    success: false,
                    message: 'Bu email adresi zaten kayıtlı',
                    field: 'email'
                });
            }
        }

        // Şifreyi hashle - Node.js bcrypt kullan (kayıt için)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Şifre hash\'lendi:', {
                hashPrefix: hashedPassword.substring(0, 10) + '...',
                hashLength: hashedPassword.length,
                hashFormat: hashedPassword.substring(0, 7) // $2b$10$ formatını görmek için
            });
        }

        // Kullanıcı rolünü belirle
        let rol = 'ciftci'; // default

        if (userType === 'farmer' || userType === 'ciftci') {
            rol = 'ciftci';
        } else if (userType === 'company' || userType === 'firma') {
            rol = 'firma';
        } else if (userType === 'sanayi' || userType === 'sanayi_odasi') {
            rol = 'sanayi_yoneticisi';
        } else if (userType === 'ziraat' || userType === 'ziraat_odasi') {
            rol = 'ziraat_yoneticisi';
        } else {
            // Geçersiz userType
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kullanıcı tipi. Seçenekler: farmer, company, sanayi, ziraat'
            });
        }

        // Çiftçi kaydı için çiftlik bilgileri kontrolü
        if (rol === 'ciftci') {
            if (!farmName || farmName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Çiftlik adı gereklidir',
                    field: 'farmName'
                });
            }
            if (!address || address.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Çiftlik adresi gereklidir',
                    field: 'address'
                });
            }
        }
        
        // Şirket kaydı için şirket bilgileri kontrolü
        if (rol === 'firma') {
            if (!companyName || companyName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Şirket adı gereklidir',
                    field: 'companyName'
                });
            }
            if (!taxNumber || taxNumber.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Vergi numarası gereklidir',
                    field: 'taxNumber'
                });
            }
        }

        // Ziraat ve sanayi yöneticileri için durum 'aktif', diğerleri için 'beklemede'
        const durum = (rol === 'ziraat_yoneticisi' || rol === 'sanayi_yoneticisi') ? 'aktif' : 'beklemede';

        await client.query('BEGIN');
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Transaction başlatıldı');
        }

        // Kullanıcı oluştur veya güncelle (reddedilen kullanıcılar için)
        let user;
        try {
            if (isRejectedUser && existingUser) {
                // Reddedilen kullanıcı: Mevcut kullanıcıyı güncelle
                const userUpdateResult = await client.query(
                    `UPDATE kullanicilar 
                    SET ad = $1, soyad = $2, sifre_hash = $3, telefon = $4, durum = $5, 
                        sartlar_kabul = TRUE, sartlar_kabul_tarihi = CURRENT_TIMESTAMP
                    WHERE id = $6
                    RETURNING id, ad, soyad, eposta, telefon, rol, durum`,
                    [trimmedFirstName, trimmedLastName, hashedPassword, trimmedPhone, durum, existingUser.id]
                );

                user = userUpdateResult.rows[0];
                
                if (!user || !user.id) {
                    throw new Error('Kullanıcı güncellenemedi - user.id bulunamadı');
                }
                
                if (process.env.NODE_ENV === 'development') {
                    console.log('✅ Reddedilen kullanıcı güncellendi:', {
                        id: user.id,
                        email: user.eposta,
                        rol: user.rol,
                        durum: user.durum
                    });
                }

                // Eski belgeleri sil (eğer varsa)
                const eskiBelgelerResult = await client.query(
                    `SELECT id, dosya_yolu FROM belgeler 
                     WHERE kullanici_id = $1 AND basvuru_tipi = 'ciftlik_basvurusu'`,
                    [user.id]
                );

                if (eskiBelgelerResult.rows.length > 0) {
                    console.log(`🗑️ [KAYIT] ${eskiBelgelerResult.rows.length} eski belge siliniyor...`);
                    await client.query(
                        `DELETE FROM belgeler 
                         WHERE kullanici_id = $1 AND basvuru_tipi = 'ciftlik_basvurusu'`,
                        [user.id]
                    );
                    console.log(`✅ [KAYIT] Eski belgeler silindi`);
                }
            } else {
                // Yeni kullanıcı oluştur
                const userResult = await client.query(
                    `INSERT INTO kullanicilar 
                    (ad, soyad, eposta, sifre_hash, telefon, rol, durum, eposta_dogrulandi, sartlar_kabul, sartlar_kabul_tarihi)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, TRUE, CURRENT_TIMESTAMP)
                    RETURNING id, ad, soyad, eposta, telefon, rol, durum`,
                    [trimmedFirstName, trimmedLastName, trimmedEmail, hashedPassword, trimmedPhone, rol, durum]
                );

                user = userResult.rows[0];
                
                if (!user || !user.id) {
                    throw new Error('Kullanıcı oluşturulamadı - user.id bulunamadı');
                }
                
                if (process.env.NODE_ENV === 'development') {
                    console.log('✅ Kullanıcı oluşturuldu:', {
                        id: user.id,
                        email: user.eposta,
                        rol: user.rol,
                        durum: user.durum,
                        idType: typeof user.id
                    });
                }
            }
        } catch (userError) {
            console.error('❌ Kullanıcı oluşturma/güncelleme hatası:', {
                message: userError.message,
                code: userError.code,
                detail: userError.detail,
                stack: userError.stack
            });
            throw userError;
        }

        // Rol'e göre ilgili tabloya kayıt ekle
        let ciftlikId = null; // Onaylandıktan sonra set edilecek
        let basvuruId = null; // Başvuru ID'si (çiftlik için)
        let firmaId = null;

        if (rol === 'ciftci') {
            // Çiftlik başvurusu oluştur veya güncelle (reddedilen kullanıcılar için)
            const ciftlikName = (farmName?.trim() || `${trimmedFirstName} ${trimmedLastName}'nin Çiftliği`);
            const ciftlikAdres = (address?.trim() || 'Belirtilmemiş');
            const sahipAdi = `${trimmedFirstName} ${trimmedLastName}`;
            
            let basvuruId = null;
            
            // Reddedilen kullanıcılar için eski başvuruyu bul ve güncelle
            if (isRejectedUser && existingUser) {
                // Önce kullanıcının durumu "reddedildi" olan başvurusunu bul
                const reddedilenBasvuruResult = await client.query(
                    `SELECT id, durum FROM ciftlik_basvurulari 
                     WHERE kullanici_id = $1 AND durum = 'reddedildi'
                     ORDER BY guncelleme DESC, olusturma DESC 
                     LIMIT 1`,
                    [user.id]
                );
                
                if (reddedilenBasvuruResult.rows.length > 0) {
                    // "Reddedildi" durumundaki başvuruyu bulduk, üzerine yaz
                    const eskiBasvuru = reddedilenBasvuruResult.rows[0];
                    basvuruId = eskiBasvuru.id;
                    
                    await client.query(
                        `UPDATE ciftlik_basvurulari 
                         SET ciftlik_adi = $1, sahip_adi = $2, konum = $3, durum = 'ilk_inceleme', 
                             olusturma = CURRENT_TIMESTAMP, guncelleme = CURRENT_TIMESTAMP,
                             red_nedeni = NULL, notlar = NULL
                         WHERE id = $4`,
                        [ciftlikName, sahipAdi, ciftlikAdres, basvuruId]
                    );
                    
                    console.log(`🔄 [KAYIT] "Reddedildi" durumundaki başvuru güncellendi (üzerine yazıldı):`, {
                        basvuru_id: basvuruId,
                        onceki_durum: eskiBasvuru.durum,
                        yeni_durum: 'ilk_inceleme'
                    });
                } else {
                    // "Reddedildi" durumunda başvuru bulunamadı, yeni oluştur
                    const basvuruResult = await client.query(
                        `INSERT INTO ciftlik_basvurulari 
                        (kullanici_id, ciftlik_adi, sahip_adi, konum, durum)
                        VALUES ($1, $2, $3, $4, 'ilk_inceleme')
                        RETURNING id`,
                        [user.id, ciftlikName, sahipAdi, ciftlikAdres]
                    );
                    basvuruId = basvuruResult.rows[0].id;
                    console.log(`✅ [KAYIT] Yeni başvuru oluşturuldu ("reddedildi" durumunda başvuru bulunamadı):`, {
                        basvuru_id: basvuruId
                    });
                }
            } else {
                // Yeni kullanıcı için yeni başvuru oluştur
                const basvuruResult = await client.query(
                    `INSERT INTO ciftlik_basvurulari 
                    (kullanici_id, ciftlik_adi, sahip_adi, konum, durum)
                    VALUES ($1, $2, $3, $4, 'ilk_inceleme')
                    RETURNING id`,
                    [user.id, ciftlikName, sahipAdi, ciftlikAdres]
                );
                basvuruId = basvuruResult.rows[0].id;
                
                if (process.env.NODE_ENV === 'development') {
                    console.log('✅ Çiftlik başvurusu oluşturuldu:', {
                        basvuru_id: basvuruId,
                        ciftlik_adi: ciftlikName,
                        durum: 'ilk_inceleme'
                    });
                }
            }

            // Atık türlerini başvuru notlarına kaydet (varsa)
            // Not: Atık kapasiteleri onaylandıktan sonra ciftlik_atik_kapasiteleri tablosuna eklenecek
            // Başvuru aşamasında sadece notlar alanında saklıyoruz
            if (wasteTypes) {
                const wasteTypesArray = Array.isArray(wasteTypes) ? wasteTypes : JSON.parse(wasteTypes);
                const atikTurleriListesi = wasteTypesArray.join(', ');
                
                // Eğer eski başvuru güncelleniyorsa, notları temizle ve yeni not ekle
                if (isRejectedUser && existingUser) {
                    await client.query(
                        `UPDATE ciftlik_basvurulari 
                        SET notlar = $1
                        WHERE id = $2`,
                        [`Atık Türleri: ${atikTurleriListesi}`, basvuruId]
                    );
                } else {
                    // Yeni başvuru için not ekle
                    await client.query(
                        `UPDATE ciftlik_basvurulari 
                        SET notlar = COALESCE(notlar || E'\\n', '') || $1
                        WHERE id = $2`,
                        [`Atık Türleri: ${atikTurleriListesi}`, basvuruId]
                    );
                }
            }

            // Çiftçi belgelerini kaydet (belgeler tablosu kullanılıyor)
            console.log(`📄 [BELGE KAYIT] Çiftçi belgelerinin kaydı başlatılıyor...`);
            console.log(`📄 [BELGE KAYIT] Başvuru ID: ${basvuruId}, Kullanıcı ID: ${user.id}`);
            
            const belgeTypes = {
                tapuOrKiraDocument: 'tapu_kira',
                nufusCuzdani: 'nufus_cuzdani',
                ciftciKutuguKaydi: 'ciftci_kutugu',
                muvafakatname: 'muvafakatname',
                taahhutname: 'taahhutname',
                donerSermayeMakbuz: 'doner_sermaye'
            };

            let kaydedilenBelgeSayisi = 0;
            let hataliDosyaSayisi = 0;

            for (const [fileKey, belgeKod] of Object.entries(belgeTypes)) {
                const fileArray = files[fileKey];
                if (fileArray && fileArray.length > 0) {
                    const file = fileArray[0];
                    console.log(`📄 [BELGE KAYIT] ${fileKey} işleniyor - Dosya adı: ${file.originalname}, Boyut: ${file.size} bytes`);
                    
                    const filePath = normalizeFilePath(file, userType, user.id);
                    
                    // Belge türü ID'sini bul (kod'a göre)
                    const belgeTuruResult = await client.query(
                        `SELECT id FROM belge_turleri WHERE kod = $1`,
                        [belgeKod]
                    );
                    
                    let belgeTuruId;
                    if (belgeTuruResult.rows.length > 0) {
                        belgeTuruId = belgeTuruResult.rows[0].id;
                        console.log(`📄 [BELGE KAYIT] Belge türü bulundu: ${belgeKod} (ID: ${belgeTuruId})`);
                    } else {
                        // Belge türü yoksa oluştur
                        console.log(`📄 [BELGE KAYIT] Belge türü bulunamadı, yeni oluşturuluyor: ${belgeKod}`);
                        const newBelgeTuruResult = await client.query(
                            `INSERT INTO belge_turleri (kod, ad, zorunlu, aktif)
                            VALUES ($1, $2, $3, TRUE)
                            RETURNING id`,
                            [belgeKod, belgeKod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), true]
                        );
                        belgeTuruId = newBelgeTuruResult.rows[0].id;
                        console.log(`✅ [BELGE KAYIT] Yeni belge türü oluşturuldu (ID: ${belgeTuruId})`);
                    }
                    
                    // Dosya bilgilerini al
                    if (!filePath) {
                        console.error(`❌ [BELGE KAYIT] HATA: Dosya yolu oluşturulamadı - ${fileKey}`);
                        console.error(`❌ [BELGE KAYIT] Dosya detayları:`, {
                            fieldname: file.fieldname,
                            originalname: file.originalname,
                            destination: file.destination,
                            filename: file.filename,
                            path: file.path
                        });
                        hataliDosyaSayisi++;
                        continue; // Bu dosyayı atla ve bir sonrakine geç
                    }
                    
                    const fileExt = filePath.split('.').pop()?.toLowerCase() || 'pdf';
                    const fileSize = file.size || 0;
                    
                    console.log(`💾 [BELGE KAYIT] Veritabanına kaydediliyor:`, {
                        kullanici_id: user.id,
                        basvuru_id: basvuruId,
                        basvuru_tipi: 'ciftlik_basvurusu',
                        belge_turu_id: belgeTuruId,
                        dosya_adi: file.originalname,
                        dosya_yolu: filePath,
                        dosya_boyutu: fileSize,
                        dosya_tipi: fileExt
                    });
                    
                    // Belgeyi kaydet - basvuru_id ve basvuru_tipi ile bağla
                    try {
                        const belgeInsertResult = await client.query(
                            `INSERT INTO belgeler 
                            (kullanici_id, basvuru_id, basvuru_tipi, belge_turu_id, ad, dosya_yolu, dosya_boyutu, dosya_tipi, durum, zorunlu)
                            VALUES ($1, $2, 'ciftlik_basvurusu', $3, $4, $5, $6, $7, 'beklemede', $8)
                            RETURNING id`,
                            [user.id, basvuruId, belgeTuruId, file.originalname, filePath, fileSize, fileExt, true]
                        );
                        const belgeId = belgeInsertResult.rows[0].id;
                        console.log(`✅ [BELGE KAYIT] Belge başarıyla kaydedildi - ${fileKey} (Belge ID: ${belgeId})`);
                        kaydedilenBelgeSayisi++;
                    } catch (belgeError) {
                        console.error(`❌ [BELGE KAYIT] HATA: Belge veritabanına kaydedilemedi - ${fileKey}`);
                        console.error(`❌ [BELGE KAYIT] Hata detayı:`, {
                            message: belgeError.message,
                            code: belgeError.code,
                            detail: belgeError.detail,
                            hint: belgeError.hint
                        });
                        hataliDosyaSayisi++;
                    }
                } else {
                    console.log(`ℹ️ [BELGE KAYIT] ${fileKey} için dosya yüklenmemiş (opsiyonel)`);
                }
            }

            console.log(`📊 [BELGE KAYIT] Belge kayıt özeti:`, {
                toplam_beklenen: Object.keys(belgeTypes).length,
                basarili: kaydedilenBelgeSayisi,
                hatali: hataliDosyaSayisi,
                atlanmis: Object.keys(belgeTypes).length - kaydedilenBelgeSayisi - hataliDosyaSayisi
            });

            if (kaydedilenBelgeSayisi === 0) {
                console.warn(`⚠️ [BELGE KAYIT] UYARI: Hiçbir belge kaydedilemedi! Bu çiftlik onaylanamayabilir.`);
            }

        } else if (rol === 'firma') {
            // Şirket kaydı oluştur
            const firmaName = companyName || `${firstName} ${lastName} Firma`;
            const firmaAdres = address || 'Belirtilmemiş';
            const vergiNo = taxNumber || `TEMP-${String(user.id).substring(0, 8)}`;
            
            const firmaResult = await client.query(
                `INSERT INTO firmalar (kullanici_id, ad, vergi_no, adres, durum)
                VALUES ($1, $2, $3, $4, 'beklemede')
                RETURNING id`,
                [user.id, firmaName, vergiNo, firmaAdres]
            );
            firmaId = firmaResult.rows[0].id;

            // Şirket belgelerini kaydet (belgeler tablosu kullanılıyor)
            const firmaBelgeTypes = {
                ticaretSicilGazetesi: 'ticaret_sicil',
                vergiLevhasi: 'vergi_levhasi',
                imzaSirkuleri: 'imza_sirkuleri',
                faaliyetBelgesi: 'faaliyet_belgesi',
                odaKayitSicilSureti: 'oda_kayit',
                gidaIsletmeKayit: 'gida_isletme',
                sanayiSicilBelgesi: 'sanayi_sicil',
                kapasiteRaporu: 'kapasite_raporu'
            };

            for (const [fileKey, belgeKod] of Object.entries(firmaBelgeTypes)) {
                const fileArray = files[fileKey];
                if (fileArray && fileArray.length > 0) {
                    const file = fileArray[0];
                    const filePath = normalizeFilePath(file, userType, user.id);
                    
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
                            [belgeKod, belgeKod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), true]
                        );
                        belgeTuruId = newBelgeTuruResult.rows[0].id;
                    }
                    
                    // Dosya bilgilerini al
                    if (!filePath) {
                        console.warn(`⚠️ Dosya yolu oluşturulamadı: ${fileKey}`);
                        continue; // Bu dosyayı atla ve bir sonrakine geç
                    }
                    
                    const fileExt = filePath.split('.').pop()?.toLowerCase() || 'pdf';
                    const fileSize = file.size || 0;
                    
                    // Belgeyi kaydet
                    await client.query(
                        `INSERT INTO belgeler 
                        (kullanici_id, firma_id, belge_turu_id, ad, dosya_yolu, dosya_boyutu, dosya_tipi, durum, zorunlu)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, 'beklemede', $8)`,
                        [user.id, firmaId, belgeTuruId, file.originalname, filePath, fileSize, fileExt, true]
                    );
                }
            }

        } else if (rol === 'ziraat_yoneticisi' || rol === 'sanayi_yoneticisi') {
            // Oda yöneticileri için sadece kullanicilar tablosunda rol yeterli
            // oda_tipi bilgisi rol'den türetilebilir (ziraat_yoneticisi -> ziraat, sanayi_yoneticisi -> sanayi)
            // Normalizasyon: Gereksiz oda_kullanicilari tablosu kaldırıldı
            
            if (process.env.NODE_ENV === 'development') {
                const odaTipi = rol === 'ziraat_yoneticisi' ? 'ziraat' : 'sanayi';
                console.log(`✅ ${rol} kaydedildi - kullanicilar tablosuna eklendi:`, {
                    kullanici_id: user.id,
                    email: user.eposta,
                    rol: user.rol,
                    oda_tipi: odaTipi + ' (rol\'den türetildi)'
                });
            }
        }

        // Transaction'ı commit et
        await client.query('COMMIT');
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Transaction commit edildi - Kullanıcı veritabanına kaydedildi:', {
                id: user.id,
                email: user.eposta,
                rol: user.rol
            });
            
            // Commit sonrası veritabanında kaydın varlığını doğrula
            const verifyResult = await pool.query(
                'SELECT id, ad, soyad, eposta, rol, durum FROM kullanicilar WHERE id = $1',
                [user.id]
            );
            
            if (verifyResult.rows.length > 0) {
                console.log('✅ Doğrulama: Kullanıcı veritabanında bulundu:', verifyResult.rows[0]);
            } else {
                console.error('❌ Doğrulama: Kullanıcı veritabanında BULUNAMADI!', {
                    id: user.id,
                    email: user.eposta
                });
            }
        }

        // Ziraat ve sanayi yöneticileri için token oluştur ve otomatik giriş yap
        let token = null;
        if (rol === 'ziraat_yoneticisi' || rol === 'sanayi_yoneticisi') {
            token = generateToken({
                id: user.id,
                email: user.eposta,
                rol: user.rol
            });
        }

        // Mesajı duruma göre belirle
        const successMessage = (rol === 'ziraat_yoneticisi' || rol === 'sanayi_yoneticisi') 
            ? 'Kayıt başarılı! Otomatik giriş yapılıyor...' 
            : 'Kayıt başarılı! Admin onayı bekleniyor.';

        const responseData = {
            success: true,
            message: successMessage,
            user: {
                id: user.id,
                ad: user.ad,
                soyad: user.soyad,
                eposta: user.eposta,
                rol: user.rol,
                durum: user.durum
            }
        };

        // Token varsa ekle
        if (token) {
            responseData.token = token;
        }

        res.status(201).json(responseData);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Response gönderildi - Kayıt başarılı');
        }

    } catch (error) {
        // Transaction'ı rollback et
        try {
            await client.query('ROLLBACK');
            if (process.env.NODE_ENV === 'development') {
                console.log('🔄 Transaction rollback edildi');
            }
        } catch (rollbackError) {
            console.error('❌ Rollback hatası:', rollbackError.message);
        }
        
        console.error('❌ Register hatası:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail,
            body: req.body,
            email: req.body?.email || 'tanımsız'
        });
        
        // Veritabanı hatalarını özel olarak handle et
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi veya vergi numarası zaten kayıtlı'
            });
        }
        
        if (error.code === '23503') { // Foreign key constraint violation
            return res.status(400).json({
                success: false,
                message: 'Geçersiz referans (veritabanı hatası)'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Kayıt sırasında bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Kullanıcı girişi
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        // Request body'yi logla (development için)
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Login isteği:', { 
                body: req.body,
                hasEmail: !!req.body?.email,
                hasPassword: !!req.body?.password
            });
        }

        const { email, password } = req.body;

        // Validasyon
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre gerekli'
            });
        }

        // Kullanıcıyı bul
        const result = await pool.query(
            `SELECT id, ad, soyad, eposta, sifre_hash, telefon, rol, durum, eposta_dogrulandi
            FROM kullanicilar 
            WHERE eposta = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Kullanıcı bulunamadı:', email);
            }
            return res.status(401).json({
                success: false,
                message: 'Email veya şifre hatalı'
            });
        }

        const user = result.rows[0];

        // Şifre kontrolü - PostgreSQL crypt() ile hash'lenmiş şifreler için
        // İki yöntem deniyoruz:
        // 1. PostgreSQL'in crypt() fonksiyonu ile (pgcrypto extension)
        // 2. Node.js bcrypt ile (fallback)
        
        let isPasswordValid = false;
        
        // Önce PostgreSQL crypt() ile kontrol et (pgcrypto extension gerekli)
        try {
            const cryptCheck = await pool.query(
                `SELECT crypt($1, $2) = $2 as is_valid`,
                [password, user.sifre_hash]
            );
            isPasswordValid = cryptCheck.rows[0]?.is_valid || false;
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 PostgreSQL crypt() kontrolü:', {
                    email: user.eposta,
                    hashFormat: user.sifre_hash?.substring(0, 7),
                    isValid: isPasswordValid
                });
            }
        } catch (cryptError) {
            // pgcrypto extension yoksa veya hata varsa, Node.js bcrypt kullan
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ PostgreSQL crypt() hatası, bcrypt kullanılıyor:', cryptError.message);
            }
            isPasswordValid = await bcrypt.compare(password, user.sifre_hash);
        }
        
        // Eğer hala false ise, Node.js bcrypt ile tekrar dene (fallback)
        if (!isPasswordValid) {
            try {
                isPasswordValid = await bcrypt.compare(password, user.sifre_hash);
                if (process.env.NODE_ENV === 'development') {
                    console.log('🔍 Node.js bcrypt kontrolü:', {
                        email: user.eposta,
                        hashFormat: user.sifre_hash?.substring(0, 7),
                        isValid: isPasswordValid
                    });
                }
            } catch (bcryptError) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('❌ bcrypt.compare hatası:', bcryptError.message);
                }
            }
        }

        if (!isPasswordValid) {
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Şifre eşleşmedi:', {
                    email: user.eposta,
                    hashFormat: user.sifre_hash?.substring(0, 7),
                    hashLength: user.sifre_hash?.length
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Email veya şifre hatalı'
            });
        }

        // Kullanıcı durumu kontrolü
        // Ziraat ve sanayi yöneticileri için durum kontrolünü atla (direkt giriş yapabilirler)
        // Normalizasyon: Sadece kullanicilar.rol kullanılıyor, oda_kullanicilari tablosu kaldırıldı
        const isOdaYoneticisi = user.rol === 'ziraat_yoneticisi' || 
                                user.rol === 'sanayi_yoneticisi' || 
                                user.rol === 'super_yonetici';
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Kullanıcı durum kontrolü:', {
                email: user.eposta,
                rol: user.rol,
                durum: user.durum,
                isOdaYoneticisi: isOdaYoneticisi
            });
        }
        
        // Çiftçi ise ve durumu "beklemede" ise, çiftlik başvurusunun durumunu kontrol et
        if (!isOdaYoneticisi && user.durum === 'beklemede' && user.rol === 'ciftci') {
            // Çiftlik başvurusunun durumunu kontrol et
            const basvuruResult = await pool.query(
                `SELECT durum 
                 FROM ciftlik_basvurulari 
                 WHERE kullanici_id = $1::uuid 
                 ORDER BY guncelleme DESC 
                 LIMIT 1`,
                [user.id]
            );
            
            // Eğer başvuru durumu "belge_eksik" ise, girişe izin ver
            if (basvuruResult.rows.length > 0 && basvuruResult.rows[0].durum === 'belge_eksik') {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ Çiftçi belge_eksik durumunda - girişe izin veriliyor (frontend'de kontrol yapılacak)`);
                }
                // Girişe izin ver, frontend'de eksik belgeler sayfasına yönlendirilecek
            } else if (basvuruResult.rows.length > 0 && basvuruResult.rows[0].durum === 'gcbelge') {
                // "gcbelge" durumunda ise, girişe izin ver ama özel mesaj döndür
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ Çiftçi gcbelge durumunda - girişe izin veriliyor (frontend'de mesaj gösterilecek)`);
                }
                // Girişe izin ver, frontend'de "gcbelge" kontrolü yapılacak
            } else {
                // Diğer durumlarda (ilk_inceleme, beklemede vb.) admin onayı mesajı göster
                if (process.env.NODE_ENV === 'development') {
                    console.log('❌ Çiftçi beklemede durumunda ve belge_eksik/gcbelge değil');
                }
                return res.status(403).json({
                    success: false,
                    message: 'Hesabınız admin onayı bekliyor'
                });
            }
        } else if (!isOdaYoneticisi && user.durum === 'beklemede') {
            // Çiftçi değilse normal kontrol
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Kullanıcı beklemede durumunda ve oda yöneticisi değil');
            }
            return res.status(403).json({
                success: false,
                message: 'Hesabınız admin onayı bekliyor'
            });
        }

        if (user.durum === 'pasif') {
            return res.status(403).json({
                success: false,
                message: 'Hesabınız pasif durumda'
            });
        }

        // Token oluştur
        const token = generateToken({
            id: user.id,
            email: user.eposta,
            rol: user.rol
        });

        // Son giriş zamanını güncelle
        await pool.query(
            'UPDATE kullanicilar SET son_giris = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                ad: user.ad,
                soyad: user.soyad,
                eposta: user.eposta,
                telefon: user.telefon,
                rol: user.rol,
                durum: user.durum
            }
        });

    } catch (error) {
        console.error('❌ Login hatası:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            email: req.body?.email || 'tanımsız',
            body: req.body
        });
        res.status(500).json({
            success: false,
            message: 'Giriş sırasında bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Mevcut kullanıcı bilgisi
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, ad, soyad, eposta, telefon, rol, durum, olusturma, son_giris
            FROM kullanicilar 
            WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ GetMe hatası:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgisi alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Çıkış
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // Client-side'da token silinecek
        res.json({
            success: true,
            message: 'Çıkış başarılı'
        });
    } catch (error) {
        console.error('Logout hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Çıkış sırasında bir hata oluştu'
        });
    }
};

/**
 * E-posta kontrolü (şifre sıfırlama için)
 * POST /api/auth/check-email
 */
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Validasyon
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'E-posta adresi gereklidir'
            });
        }

        // E-posta format kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir e-posta adresi giriniz'
            });
        }

        // Kullanıcıyı bul ve aktif başvuru kontrolü yap
        const result = await pool.query(
            `SELECT k.id, k.eposta, k.rol,
                    (SELECT COUNT(*) FROM ciftlik_basvurulari cb 
                     WHERE cb.kullanici_id = k.id AND cb.durum IN ('ilk_inceleme', 'belge_eksik', 'onaylandi')) as aktif_basvuru_sayisi,
                    (SELECT COUNT(*) FROM ciftlik_basvurulari cb 
                     WHERE cb.kullanici_id = k.id) as toplam_basvuru_sayisi
             FROM kullanicilar k 
             WHERE k.eposta = $1`,
            [email]
        );

        // E-posta kontrolü için: kayıtlıysa duplicate, değilse available
        // Şifre sıfırlama için: kayıtlı değilse 404 döndür
        // Request'te checkType parametresi varsa e-posta kontrolü yapıyoruz
        const checkType = req.body.checkType; // 'availability' veya undefined (şifre sıfırlama)
        
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 Check Email:', {
                email: email,
                checkType: checkType,
                emailFound: result.rows.length > 0,
                aktifBasvuru: result.rows.length > 0 ? result.rows[0].aktif_basvuru_sayisi : 0,
                toplamBasvuru: result.rows.length > 0 ? result.rows[0].toplam_basvuru_sayisi : 0
            });
        }

        if (result.rows.length === 0) {
            // E-posta kontrolü için
            if (checkType === 'availability') {
                return res.json({
                    success: true,
                    available: true,
                    message: 'Bu e-posta ile kayıt olabilirsiniz'
                });
            }
            // Şifre sıfırlama için
            return res.status(404).json({
                success: false,
                message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
            });
        }

        // E-posta kayıtlı - Aktif başvuru kontrolü
        if (checkType === 'availability') {
            const user = result.rows[0];
            const aktifBasvuruSayisi = parseInt(user.aktif_basvuru_sayisi) || 0;
            
            // Eğer çiftçi ise ve aktif başvurusu yoksa (reddedilmiş ve silinmiş olabilir)
            // izin ver
            if (user.rol === 'ciftci' && aktifBasvuruSayisi === 0) {
                return res.json({
                    success: true,
                    available: true,
                    message: 'Bu e-posta ile kayıt olabilirsiniz (önceki başvurunuz reddedilmiş)'
                });
            }
            
            // Aktif başvurusu var veya çiftçi değil
            return res.json({
                success: true,
                available: false,
                message: 'Bu e-posta adresi zaten kayıtlı'
            });
        }

        // Şifre sıfırlama için
        res.json({
            success: true,
            message: 'E-posta adresi doğrulandı'
        });

    } catch (error) {
        console.error('❌ Check Email hatası:', {
            message: error.message,
            stack: error.stack,
            email: req.body?.email || 'tanımsız'
        });
        res.status(500).json({
            success: false,
            message: 'E-posta kontrolü sırasında bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Şifre sıfırlama
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validasyon
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'E-posta ve yeni şifre gereklidir'
            });
        }

        // Şifre validasyonu
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 8 karakter olmalıdır'
            });
        }

        // Büyük harf kontrolü
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az bir büyük harf içermelidir'
            });
        }

        // Küçük harf kontrolü
        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az bir küçük harf içermelidir'
            });
        }

        // Sayı kontrolü
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az bir sayı içermelidir'
            });
        }

        // Kullanıcıyı bul
        const result = await pool.query(
            'SELECT id, eposta FROM kullanicilar WHERE eposta = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
            });
        }

        // Yeni şifreyi hashle
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Şifreyi güncelle
        await pool.query(
            'UPDATE kullanicilar SET sifre_hash = $1 WHERE eposta = $2',
            [hashedPassword, email]
        );

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Şifre sıfırlandı:', {
                email: email,
                hashPrefix: hashedPassword.substring(0, 10) + '...'
            });
        }

        res.json({
            success: true,
            message: 'Şifreniz başarıyla güncellendi'
        });

    } catch (error) {
        console.error('❌ Reset Password hatası:', {
            message: error.message,
            stack: error.stack,
            email: req.body?.email || 'tanımsız'
        });
        res.status(500).json({
            success: false,
            message: 'Şifre sıfırlama sırasında bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    checkEmail,
    resetPassword
};
