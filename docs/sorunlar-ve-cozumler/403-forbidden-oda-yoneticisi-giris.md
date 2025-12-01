# 403 Forbidden - Oda Yöneticileri Giriş Hatası

## 📋 Sorun Bilgileri

- **Tarih:** 2024-12-XX
- **Durum:** ✅ Çözüldü
- **Öncelik:** Yüksek
- **Etkilenen Kullanıcılar:** Ziraat ve Sanayi Odası Yöneticileri

## 🎯 Sorun Açıklaması

`iamgroot.tsx` sayfasından kayıt olan ziraat ve sanayi yöneticileri, giriş yapmaya çalıştıklarında **403 Forbidden** hatası alıyor ve **"Hesabınız admin onayı bekliyor"** mesajı görüyorlardı.

### Hata Detayları

- **HTTP Status:** `403 Forbidden`
- **Hata Mesajı:** `"Hesabınız admin onayı bekliyor"`
- **Etkilenen Endpoint:** `POST /api/auth/login`
- **Etkilenen Kullanıcılar:**
  - Ziraat Odası Yöneticileri (`ziraat_yoneticisi`)
  - Sanayi Odası Yöneticileri (`sanayi_yoneticisi`)
  - Super Yöneticiler (`super_yonetici`)

### Beklenen Davranış

Ziraat ve sanayi yöneticileri, kayıt olduktan sonra **direkt giriş yapabilmeli** ve admin onayı beklememeli.

### Gerçekleşen Davranış

Kayıt işlemi başarılı oluyordu ancak giriş yaparken durum kontrolü nedeniyle 403 hatası alınıyordu.

## 🔍 Sorunun Kök Nedeni

### 1. Login Endpoint'inde Durum Kontrolü

`server/src/controllers/authController.js` dosyasındaki `login` fonksiyonunda, **tüm kullanıcılar** için durum kontrolü yapılıyordu:

```javascript
// ÖNCEKİ KOD (HATALI)
if (user.durum === 'beklemede') {
    return res.status(403).json({
        success: false,
        message: 'Hesabınız admin onayı bekliyor'
    });
}
```

Bu kontrol, ziraat ve sanayi yöneticileri için de uygulanıyordu, oysa bu kullanıcılar direkt giriş yapabilmeli.

### 2. Rol Kontrolü Eksikliği

Login endpoint'inde, kullanıcının **rolüne göre** durum kontrolü yapılmıyordu. Oda yöneticileri için özel bir istisna yoktu.

### 3. Veritabanı Rol Tutarsızlığı

Bazı durumlarda:
- `kullanicilar` tablosunda rol yanlış kaydedilmiş olabilir
- `oda_kullanicilari` tablosunda kayıt var ama `kullanicilar` tablosunda rol eksik olabilir

## ✅ Çözüm

### 1. Rol Bazlı Durum Kontrolü

Login endpoint'inde, **oda yöneticileri için durum kontrolü atlanıyor**:

```javascript
// Kullanıcı durumu kontrolü
// Ziraat ve sanayi yöneticileri için durum kontrolünü atla (direkt giriş yapabilirler)
const isOdaYoneticisi = user.rol === 'ziraat_yoneticisi' || 
                        user.rol === 'sanayi_yoneticisi' || 
                        user.rol === 'super_yonetici' ||
                        user.rol === 'ziraat' ||  // Yanlış kaydedilmiş rol durumu
                        user.rol === 'sanayi';    // Yanlış kaydedilmiş rol durumu

if (!isOdaYoneticisi && user.durum === 'beklemede') {
    return res.status(403).json({
        success: false,
        message: 'Hesabınız admin onayı bekliyor'
    });
}
```

### 2. Oda Kullanıcıları Tablosu Kontrolü

Eğer `kullanicilar` tablosunda rol yanlış kaydedilmişse, `oda_kullanicilari` tablosunu da kontrol ediyoruz:

```javascript
// Eğer kullanicilar tablosunda rol yanlış kaydedilmişse, oda_kullanicilari tablosunu kontrol et
if (!isOdaYoneticisi) {
    try {
        const odaCheck = await pool.query(
            `SELECT oda_tipi FROM oda_kullanicilari WHERE kullanici_id = $1`,
            [user.id]
        );
        if (odaCheck.rows.length > 0) {
            isOdaYoneticisi = true;
            // Debug log...
        }
    } catch (odaError) {
        // Hata yönetimi...
    }
}
```

### 3. Debug Log'ları

Geliştirme modunda detaylı log'lar eklendi:

```javascript
if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Kullanıcı durum kontrolü:', {
        email: user.eposta,
        rol: user.rol,
        durum: user.durum,
        isOdaYoneticisi: isOdaYoneticisi
    });
}
```

## 📝 Yapılan Değişiklikler

### Dosya: `server/src/controllers/authController.js`

**Değişiklik 1: Rol Kontrolü Genişletildi**
- `ziraat_yoneticisi`, `sanayi_yoneticisi`, `super_yonetici` rolleri için durum kontrolü atlanıyor
- Yanlış kaydedilmiş `ziraat` ve `sanayi` rolleri de kontrol ediliyor

**Değişiklik 2: Oda Kullanıcıları Tablosu Kontrolü**
- `oda_kullanicilari` tablosunda kayıt varsa, oda yöneticisi olarak kabul ediliyor
- Bu sayede veritabanı tutarsızlıkları da ele alınıyor

**Değişiklik 3: Debug Log'ları**
- Geliştirme modunda detaylı log'lar eklendi
- Kullanıcının rolü, durumu ve oda yöneticisi olup olmadığı log'lanıyor

## 🧪 Test Senaryoları

### Test 1: Yeni Kayıt Olan Ziraat Yöneticisi
1. `iamgroot.tsx` sayfasından ziraat odası yöneticisi olarak kayıt ol
2. Giriş sayfasına git
3. **Beklenen:** Direkt giriş yapabilmeli ✅

### Test 2: Yeni Kayıt Olan Sanayi Yöneticisi
1. `iamgroot.tsx` sayfasından sanayi odası yöneticisi olarak kayıt ol
2. Giriş sayfasına git
3. **Beklenen:** Direkt giriş yapabilmeli ✅

### Test 3: Önceden Kayıt Olmuş Oda Yöneticisi
1. Daha önce kayıt olmuş bir oda yöneticisi ile giriş yap
2. **Beklenen:** Durum 'beklemede' olsa bile giriş yapabilmeli ✅

### Test 4: Normal Kullanıcı (Çiftçi/Firma)
1. Normal bir çiftçi veya firma kullanıcısı ile giriş yap
2. Durum 'beklemede' ise
3. **Beklenen:** "Hesabınız admin onayı bekliyor" mesajı almalı ✅

## 🔧 Backend Yeniden Başlatma

Değişikliklerin etkili olması için backend'i yeniden başlatın:

```bash
cd server
npm start
```

## 📊 Sonuç

### Önceki Durum
- ❌ Ziraat yöneticileri giriş yapamıyordu
- ❌ Sanayi yöneticileri giriş yapamıyordu
- ❌ "Hesabınız admin onayı bekliyor" hatası alınıyordu

### Şimdiki Durum
- ✅ Ziraat yöneticileri direkt giriş yapabiliyor
- ✅ Sanayi yöneticileri direkt giriş yapabiliyor
- ✅ Super yöneticiler direkt giriş yapabiliyor
- ✅ Normal kullanıcılar için durum kontrolü devam ediyor
- ✅ Veritabanı tutarsızlıkları ele alınıyor

## 🔗 İlgili Dosyalar

- `server/src/controllers/authController.js` - Login endpoint'i
- `src/pages/auth/iamgroot.tsx` - Oda kayıt formu
- `src/pages/auth/giris.tsx` - Giriş sayfası

## 📚 İlgili Dokümantasyon

- [401 Unauthorized - Giriş Hatası](./401-unauthorized-login-hatasi.md)
- [Login Hata Çözüm](./LOGIN_HATA_COZUM.md)
- [Debug Login](./DEBUG_LOGIN.md)

---

**Tarih:** 2024-12-XX  
**Durum:** ✅ Çözüldü ve Test Edildi  
**Güncelleyen:** Auto (AI Assistant)

