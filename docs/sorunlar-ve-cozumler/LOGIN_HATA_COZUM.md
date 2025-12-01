# Login Hatası Çözümü

## Sorun
- Frontend'de "email is not defined" hatası görünüyor
- Backend'de 500 Internal Server Error alınıyor
- Login işlemi başarısız oluyor

## Yapılan Düzeltmeler

### 1. Backend Error Handling İyileştirildi
- `authController.js`'deki `login` fonksiyonunda catch bloğu düzeltildi
- `email` değişkeni catch bloğunda tanımlı olmayabilir diye güvenli hale getirildi
- Daha detaylı logging eklendi

### 2. Test Etme
1. Server'ı yeniden başlatın:
   ```bash
   cd server
   npm start
   ```

2. Server konsolunda şu logları görmelisiniz:
   - Login isteği geldiğinde body içeriği
   - Herhangi bir hata durumunda detaylı hata mesajı

3. Frontend'den tekrar giriş yapmayı deneyin:
   - Email: selam77@gmail.com
   - Şifre: 3136785972

### 3. Olası Sorunlar ve Çözümleri

#### Veritabanı Bağlantısı
- `.env` dosyasında DB bilgileri doğru mu kontrol edin
- PostgreSQL servisinin çalıştığından emin olun

#### Kullanıcı Kaydı
- SQL sorgusunu çalıştırdıysanız kullanıcı oluşturulmuş olmalı
- Veritabanında kullanıcıyı kontrol edin:
  ```sql
  SELECT * FROM kullanicilar WHERE eposta = 'selam77@gmail.com';
  ```

#### Şifre Hash
- SQL'de bcrypt hash kullanıldı: `$2b$10$Qm1msElnHvnyOD54gBEv.e7Ju6OOo1eMi8mrqpNmiQR1BABaKDt/2`
- Şifre: `3136785972`

### 4. Debug Adımları

Eğer hata devam ederse:

1. **Server loglarını kontrol edin** - Konsolda tam hata mesajını göreceksiniz

2. **Network sekmesini kontrol edin** (F12 > Network)
   - `/api/auth/login` isteğine bakın
   - Request payload'ını kontrol edin
   - Response'u kontrol edin

3. **Veritabanını kontrol edin**:
   ```sql
   -- Kullanıcı var mı?
   SELECT id, eposta, rol, durum FROM kullanicilar WHERE eposta = 'selam77@gmail.com';
   
   -- Firma kaydı var mı?
   SELECT f.* FROM firmalar f
   JOIN kullanicilar k ON f.kullanici_id = k.id
   WHERE k.eposta = 'selam77@gmail.com';
   ```

4. **PostgreSQL extension kontrolü**:
   ```sql
   -- UUID extension aktif mi?
   SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
   
   -- Yoksa aktifleştir:
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

## Güncellenen Dosyalar

1. `server/src/controllers/authController.js` - Login fonksiyonu error handling iyileştirildi
2. `server/server.js` - Error handler middleware düzeltildi

