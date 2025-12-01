# 401 Unauthorized - Giriş Hatası

**Tarih:** 2024-11-19  
**Durum:** ✅ Çözüldü

## 🔴 Sorun

Kullanıcı giriş yapmaya çalıştığında `401 Unauthorized` hatası alınıyordu.

### Hata Detayları

- **Frontend Console:**
  ```
  POST http://localhost:5000/api/auth/login 401 (Unauthorized)
  ❌ Giriş hatası: {status: 401, message: 'Email veya şifre hatalı'}
  ```

- **Backend Terminal:**
  ```
  ❌ Şifre eşleşmedi: { email: 'ziraat@yesileksen.com', hashFormat: '$2a$06$' }
  ```

### Sorunun Kök Nedeni

**Şifre Hash Formatı Uyumsuzluğu:**

1. **Veritabanında:** PostgreSQL'in `crypt()` fonksiyonu ile `$2a$06$` formatında hash'lenmiş şifreler
2. **Backend'de:** Node.js'in `bcrypt.compare()` fonksiyonu kullanılıyor
3. **Uyumsuzluk:** PostgreSQL'in `crypt()` ile üretilen `$2a$` formatı, Node.js `bcrypt` ile bazen uyumsuzluk yaratıyor

### Etkilenen Kullanıcılar

- `ziraat@yesileksen.com` (Ziraat Yöneticisi)
- `admin@yesileksen.com` (Sistem Yöneticisi)
- `sanayi@yesileksen.com` (Sanayi Yöneticisi)
- Veritabanında `crypt()` ile hash'lenmiş tüm kullanıcılar

## ✅ Çözüm

### Yapılan Değişiklikler

**Dosya:** `server/src/controllers/authController.js`

Şifre kontrolü artık **iki yöntemle** yapılıyor:

1. **PostgreSQL `crypt()` ile kontrol** (pgcrypto extension varsa)
2. **Node.js `bcrypt` ile kontrol** (fallback)

### Kod Değişiklikleri

```javascript
// Önce PostgreSQL crypt() ile kontrol et
try {
    const cryptCheck = await pool.query(
        `SELECT crypt($1, $2) = $2 as is_valid`,
        [password, user.sifre_hash]
    );
    isPasswordValid = cryptCheck.rows[0]?.is_valid || false;
} catch (cryptError) {
    // pgcrypto extension yoksa, Node.js bcrypt kullan
    isPasswordValid = await bcrypt.compare(password, user.sifre_hash);
}

// Eğer hala false ise, Node.js bcrypt ile tekrar dene (fallback)
if (!isPasswordValid) {
    isPasswordValid = await bcrypt.compare(password, user.sifre_hash);
}
```

### Debug Logları Eklendi

**Backend'e eklenen loglar:**
- `🔐 Login isteği:` - Gelen request bilgileri
- `❌ Kullanıcı bulunamadı:` - Email yanlışsa
- `🔍 PostgreSQL crypt() kontrolü:` - PostgreSQL ile şifre kontrolü
- `🔍 Node.js bcrypt kontrolü:` - Node.js ile şifre kontrolü
- `❌ Şifre eşleşmedi:` - Şifre yanlışsa detaylı bilgi

**Frontend'e eklenen loglar:**
- `🔐 Giriş denemesi:` - Gönderilen email ve şifre bilgileri
- `❌ Giriş hatası:` - Backend'den gelen hata detayları

## 🧪 Test

### Test Senaryosu

1. **Email:** `ziraat@yesileksen.com`
2. **Şifre:** `Ziraat123!`
3. **Beklenen:** Başarılı giriş ve `/admin/ziraat` sayfasına yönlendirme

### Kontrol Edilmesi Gerekenler

1. **Backend Terminal Logları:**
   ```
   🔐 Login isteği: { body: {...}, hasEmail: true, hasPassword: true }
   🔍 PostgreSQL crypt() kontrolü: { email: '...', hashFormat: '$2a$06$', isValid: true }
   ```

2. **Browser Console:**
   ```
   🔐 Giriş denemesi: { email: 'ziraat@yesileksen.com', hasPassword: true, passwordLength: 11 }
   ```

3. **Başarılı Giriş:**
   - Token localStorage'a kaydedilmeli
   - Kullanıcı bilgileri localStorage'a kaydedilmeli
   - Rol bazlı yönlendirme yapılmalı

## 📝 Notlar

### Neden Bu Çözüm?

1. **Geriye Dönük Uyumluluk:** Mevcut veritabanındaki `crypt()` ile hash'lenmiş şifreler çalışmaya devam eder
2. **Yeni Kayıtlar:** Yeni kayıtlarda Node.js `bcrypt` kullanılmaya devam eder
3. **Güvenlik:** Her iki yöntem de güvenli (bcrypt algoritması)

### Alternatif Çözümler (Kullanılmadı)

1. **Tüm şifreleri yeniden hash'lemek:**
   - ❌ Mevcut kullanıcıların şifrelerini sıfırlamak gerekir
   - ❌ Kullanıcı deneyimi kötüleşir

2. **Sadece Node.js bcrypt kullanmak:**
   - ❌ Mevcut kullanıcılar giriş yapamaz
   - ❌ Veritabanı güncellemesi gerekir

3. **Sadece PostgreSQL crypt() kullanmak:**
   - ❌ Yeni kayıtlarda sorun çıkar
   - ❌ pgcrypto extension zorunlu olur

## 🔗 İlgili Dosyalar

- `server/src/controllers/authController.js` - Login controller
- `src/services/authService.ts` - Frontend auth service
- `src/pages/auth/giris.tsx` - Login page
- `src/services/api.ts` - API client
- `docs/Kullanılan Sql.sql` - Veritabanı seed data (satır 1076-1078)

## 📚 Referanslar

- [PostgreSQL pgcrypto Documentation](https://www.postgresql.org/docs/current/pgcrypto.html)
- [Node.js bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [bcrypt Hash Format](https://en.wikipedia.org/wiki/Bcrypt)

---

**Çözümü Uygulayan:** AI Assistant  
**Onaylayan:** Mehmet  
**Durum:** ✅ Test Edildi ve Çalışıyor

