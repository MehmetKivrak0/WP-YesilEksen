# Login 500 Hatası Debug Kılavuzu

## 1. Backend Server Konsolunu Kontrol Edin

Backend terminal penceresinde şu şekilde bir hata görmelisiniz:

```
❌ Login hatası: {
  message: '...',
  stack: '...',
  code: '...',
  email: 'selam77@gmail.com',
  body: { email: '...', password: '...' }
}
```

**Lütfen bu tam hata mesajını kopyalayıp paylaşın.**

## 2. Olası Hata Nedenleri ve Çözümleri

### A) Veritabanı Bağlantı Hatası
**Hata:** `ECONNREFUSED` veya `connection refused`
**Çözüm:**
- PostgreSQL servisinin çalıştığından emin olun
- `.env` dosyasındaki DB bilgilerini kontrol edin
- Port 5432'nin açık olduğundan emin olun

### B) Kullanıcı Bulunamadı
**Hata:** `result.rows.length === 0`
**Çözüm:**
```sql
-- Kullanıcıyı kontrol edin
SELECT id, eposta, rol, durum, sifre_hash 
FROM kullanicilar 
WHERE eposta = 'selam77@gmail.com';

-- Eğer yoksa SQL dosyasını çalıştırın:
-- docs/firma_sahibi_kullanici.sql
```

### C) Şifre Hash Hatası
**Hata:** `bcrypt.compare` hatası
**Çözüm:**
- Veritabanındaki `sifre_hash` değerini kontrol edin
- Hash bcrypt formatında olmalı: `$2b$10$...`

### D) UUID Tipi Hatası
**Hata:** `invalid input syntax for type uuid`
**Çözüm:**
- Veritabanında ID kolonları UUID tipinde olmalı
- SQL sorgusunda UUID kullanıldığından emin olun

## 3. Hızlı Test Sorguları

### Kullanıcı Var mı Kontrol
```sql
SELECT 
    id, 
    eposta, 
    rol, 
    durum,
    LENGTH(sifre_hash) as hash_length,
    LEFT(sifre_hash, 7) as hash_start
FROM kullanicilar 
WHERE eposta = 'selam77@gmail.com';
```

### Firma Kaydı Var mı Kontrol
```sql
SELECT f.* 
FROM firmalar f
JOIN kullanicilar k ON f.kullanici_id = k.id
WHERE k.eposta = 'selam77@gmail.com';
```

### Veritabanı Bağlantısını Test Et
```sql
SELECT version();
```

## 4. Backend Loglarını Aktifleştirme

Backend'i development modunda çalıştırın:
```bash
cd server
set NODE_ENV=development  # Windows
# veya
export NODE_ENV=development  # Linux/Mac
node server.js
```

## 5. Frontend'den İstek Detaylarını Kontrol

Browser DevTools > Network sekmesinde:
1. `/api/auth/login` isteğine tıklayın
2. "Payload" sekmesine bakın - email ve password gönderiliyor mu?
3. "Response" sekmesine bakın - backend ne dönüyor?

