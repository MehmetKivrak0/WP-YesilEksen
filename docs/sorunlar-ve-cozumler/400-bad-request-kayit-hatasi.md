# 400 Bad Request - Kayıt Hatası

**Tarih:** 2024-11-19  
**Durum:** ✅ Çözüldü

## 🔴 Sorun

Kullanıcı kayıt sayfasında form gönderildiğinde `400 Bad Request` hatası alınıyordu.

### Hata Detayları

- **Frontend Console:**
  ```
  POST http://localhost:5000/api/auth/register 400 (Bad Request)
  ❌ Kayıt hatası: {status: 400, message: '...'}
  ```

- **Backend:** Validasyon hatası veya eksik alan

## 🔍 Sorunun Kök Nedenleri

### 1. FormData Boolean Değer Sorunu

**Sorun:** FormData'dan gelen `terms` değeri string olarak geliyor (`"true"` veya `"false"`), ama backend'de boolean kontrolü yapılıyordu.

```javascript
// Frontend'de
formData.append('terms', data.terms.toString()); // "true" veya "false" string'i

// Backend'de (YANLIŞ)
if (!terms) { // String "false" truthy bir değer!
    return res.status(400).json({...});
}
```

**Çözüm:** String değeri boolean'a çevir:
```javascript
const termsValue = typeof terms === 'string' 
    ? terms.toLowerCase() === 'true' 
    : Boolean(terms);
```

### 2. Eksik Alan Kontrolü

**Sorun:** Hangi alanların eksik olduğu belirtilmiyordu.

**Çözüm:** Detaylı hata mesajı eklendi:
```javascript
return res.status(400).json({
    success: false,
    message: 'Tüm alanları doldurunuz',
    missing: {
        firstName: !firstName,
        lastName: !lastName,
        email: !email,
        userType: !userType,
        phone: !phone
    }
});
```

### 3. Şifre Hash Formatı

**Sorun:** Kayıt sırasında şifre Node.js `bcrypt` ile hash'leniyor (`$2b$10$` formatı), ama veritabanında bazı kullanıcılar PostgreSQL `crypt()` ile hash'lenmiş (`$2a$06$` formatı).

**Not:** Bu aslında sorun değil, çünkü login'de her iki format da destekleniyor. Ama tutarlılık için Node.js bcrypt kullanılıyor.

## ✅ Çözüm

### Yapılan Değişiklikler

**Dosya:** `server/src/controllers/authController.js`

1. **Debug logları eklendi:**
   - Gelen request body loglanıyor
   - Parse edilen değerler loglanıyor
   - Şifre hash formatı loglanıyor

2. **Boolean kontrolü düzeltildi:**
   ```javascript
   const termsValue = typeof terms === 'string' 
       ? terms.toLowerCase() === 'true' 
       : Boolean(terms);
   ```

3. **Detaylı hata mesajları:**
   - Hangi alanların eksik olduğu belirtiliyor
   - Daha açıklayıcı hata mesajları

**Dosya:** `src/pages/auth/kayit.tsx`

1. **Frontend validasyonu:**
   - Şifre kontrolü eklendi
   - Sosyal medya girişi için özel kontrol

2. **Debug logları:**
   - Kayıt verileri loglanıyor
   - Hata detayları loglanıyor

## 🧪 Test

### Test Senaryosu

1. **Normal Kayıt:**
   - Tüm alanları doldur
   - Şifre gir
   - Terms'i kabul et
   - **Beklenen:** Başarılı kayıt

2. **Eksik Alan:**
   - Bir alanı boş bırak
   - **Beklenen:** Hangi alanın eksik olduğunu gösteren hata

3. **Terms Kontrolü:**
   - Terms'i işaretleme
   - **Beklenen:** "Şartları kabul etmelisiniz" hatası

### Kontrol Edilmesi Gerekenler

1. **Backend Terminal Logları:**
   ```
   📝 Register isteği: { body: {...}, bodyKeys: [...], hasFiles: true }
   🔍 Parse edilen değerler: { firstName: '✓', lastName: '✓', ... }
   🔐 Şifre hash'lendi: { hashPrefix: '$2b$10$...', hashFormat: '$2b$10$' }
   ```

2. **Browser Console:**
   ```
   📝 Kayıt verileri: { firstName: '...', email: '...', hasPassword: true, ... }
   ```

3. **Hata Durumunda:**
   ```
   ❌ Kayıt hatası: { status: 400, message: '...', missing: {...} }
   ```

## 📝 Notlar

### FormData ve Boolean Değerler

FormData API'si tüm değerleri string olarak gönderir. Boolean değerler için:
- Frontend: `toString()` ile string'e çevir
- Backend: String'i boolean'a çevir

### Şifre Hash Formatı

- **Kayıt:** Node.js `bcrypt` → `$2b$10$` formatı
- **Giriş:** Hem PostgreSQL `crypt()` hem de Node.js `bcrypt` destekleniyor
- **Tutarlılık:** Yeni kayıtlarda Node.js bcrypt kullanılıyor

### Sosyal Medya Girişi

Sosyal medya girişi ile kayıt için şifre opsiyonel olabilir, ama şu an için zorunlu tutuluyor. Gelecekte özel bir akış eklenebilir.

## 🔗 İlgili Dosyalar

- `server/src/controllers/authController.js` - Register controller
- `src/services/authService.ts` - Frontend auth service
- `src/pages/auth/kayit.tsx` - Registration page
- `src/services/api.ts` - API client

## 📚 Referanslar

- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Node.js bcrypt](https://www.npmjs.com/package/bcrypt)
- [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)

---

**Çözümü Uygulayan:** AI Assistant  
**Onaylayan:** Mehmet  
**Durum:** ✅ Test Edildi ve Çalışıyor

