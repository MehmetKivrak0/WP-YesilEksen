# Çiftçi Belge Eksik Giriş Yönlendirme Sorunu

## 📋 Sorun Bilgileri

- **Tarih:** 2024-12-XX
- **Durum:** ✅ Çözüldü
- **Öncelik:** Yüksek
- **Etkilenen Kullanıcılar:** Çiftçiler (durumu "belge_eksik" olan başvuruları olan)

## 🎯 Sorun Açıklaması

Çiftçi giriş yaptığında, eğer çiftlik başvurusunun durumu "belge_eksik" ise, eksik belgeler sayfasına (`/ciftlik/eksik-belgeler`) yönlendirilmesi gerekiyordu. Ancak sistem **"Hesabınız aktif değil"** hatası veriyordu ve çiftçi paneline yönlendiriyordu.

### Beklenen Davranış

- Çiftçi giriş yapar
- Sistem başvuru durumunu kontrol eder
- Eğer durum "belge_eksik" ise → `/ciftlik/eksik-belgeler` sayfasına yönlendirilir
- Eğer durum farklıysa → Normal çiftçi paneline yönlendirilir

### Gerçekleşen Davranış

- Çiftçi giriş yapmaya çalışır
- **"Hesabınız aktif değil"** hatası alır
- Eksik belgeler sayfasına gidemez

## 🔍 Sorunun Kök Nedeni

### 1. Auth Middleware'de Durum Kontrolü

`server/src/middleware/auth.js` dosyasında, tüm kullanıcılar için durum kontrolü yapılıyordu:

```javascript
// ÖNCEKİ KOD (HATALI)
if (user.durum !== 'aktif') {
    return res.status(403).json({
        success: false,
        message: 'Hesabınız aktif değil'
    });
}
```

Bu kontrol, çiftçi için durum "beklemede" olduğunda bile çalışıyordu. Ancak çiftçi için durum "beklemede" olabilir ama çiftlik başvurusunun durumu "belge_eksik" olabilir. Bu durumda çiftçinin eksik belgeler sayfasına gitmesi gerekiyordu.

### 2. Frontend Yönlendirme Mantığı

Frontend'de eksik belgeler kontrolü yapılıyordu ancak API çağrısı middleware'den geçemediği için başarısız oluyordu.

## ✅ Çözüm

### 1. Backend Auth Middleware Güncellemesi

`server/src/middleware/auth.js` dosyasında çiftçi için özel kontrol eklendi:

```javascript
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
        
        // Eğer başvuru durumu "belge_eksik" ise, middleware'den geçmesine izin ver
        if (basvuruResult.rows.length > 0 && basvuruResult.rows[0].durum === 'belge_eksik') {
            // Girişe izin ver, frontend'de eksik belgeler sayfasına yönlendirilecek
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
```

### 2. Backend Login Controller Güncellemesi

`server/src/controllers/authController.js` dosyasında zaten çiftçi için özel kontrol vardı, bu kontrol korundu.

### 3. Frontend Giriş Sayfası İyileştirmesi

`src/pages/auth/giris.tsx` dosyasında eksik belgeler kontrolü iyileştirildi:

```typescript
// Çiftçi ise ve başvuru durumu "belge_eksik" ise eksik belgeler sayfasına yönlendir
if (user.rol === 'ciftci') {
    try {
        const missingDocsResponse = await ciftciService.getMissingDocuments();
        
        if (missingDocsResponse.success && 
            missingDocsResponse.hasMissingDocuments && 
            missingDocsResponse.application &&
            missingDocsResponse.application.status === 'belge_eksik') {
            // Eksik belgeler varsa eksik belgeler sayfasına yönlendir
            navigate('/ciftlik/eksik-belgeler');
            setLoading(false);
            return;
        }
    } catch (err: any) {
        // Eğer 403 hatası alırsak (hesap aktif değil), hata mesajını göster
        if (err?.response?.status === 403) {
            setError(err?.response?.data?.message || 'Hesabınız aktif değil');
            setLoading(false);
            return;
        }
    }
}
```

### 4. Eksik Belgeler Sayfası Oluşturuldu

`src/pages/ciftlik/MissingDocumentsPage.tsx` sayfası oluşturuldu ve `App.tsx`'e route eklendi:

```typescript
<Route path="/ciftlik/eksik-belgeler" element={<MissingDocumentsPage />} />
```

## 📝 Değiştirilen Dosyalar

1. `server/src/middleware/auth.js` - Çiftçi için özel durum kontrolü eklendi
2. `src/pages/auth/giris.tsx` - Eksik belgeler kontrolü iyileştirildi
3. `src/pages/ciftlik/MissingDocumentsPage.tsx` - Yeni sayfa oluşturuldu
4. `src/App.tsx` - Route eklendi

## 🧪 Test Senaryosu

1. Çiftçi hesabı ile giriş yap (`selam112@gmail.com`)
2. Sistem başvuru durumunu kontrol eder
3. Eğer durum "belge_eksik" ise:
   - ✅ Giriş başarılı olur
   - ✅ `/ciftlik/eksik-belgeler` sayfasına yönlendirilir
   - ✅ Eksik belgeler listelenir
   - ✅ Yeni belge yükleme yapılabilir
4. Eğer durum farklıysa:
   - ✅ Normal çiftçi paneline yönlendirilir

## 🎯 Sonuç

Artık çiftçiler, durumu "belge_eksik" olan başvuruları varsa, giriş yaptıktan sonra otomatik olarak eksik belgeler sayfasına yönlendiriliyor ve eksik belgelerini yükleyebiliyorlar.

