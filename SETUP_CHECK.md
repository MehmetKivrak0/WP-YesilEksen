# 🔍 YEŞİL-EKSEN - KURULUM KONTROL LİSTESİ

## ✅ ZORUNLU ADIMLAR

### 1. Seed Data'yı Çalıştır (KRİTİK!)
```bash
# Terminal/PowerShell'den:
psql -U postgres -d yesileksen -f docs/seed_data.sql

# Veya pgAdmin'den:
# 1. pgAdmin aç
# 2. yesileksen veritabanına bağlan
# 3. Query Tool aç (F5)
# 4. docs/seed_data.sql dosyasını aç
# 5. Execute (F5)
```

**Kontrol:**
```sql
-- Atık türleri var mı?
SELECT COUNT(*) FROM atik_turleri WHERE aktif = TRUE;
-- Sonuç: 6 olmalı

-- Belge türleri var mı?
SELECT COUNT(*) FROM belge_turleri WHERE aktif = TRUE;
-- Sonuç: 14 olmalı

-- Birimler var mı?
SELECT COUNT(*) FROM birimler;
-- Sonuç: 4 olmalı
```

### 2. Frontend .env Dosyası Oluştur
**Dosya:** `.env` (proje root dizini)

```env
VITE_API_URL=http://localhost:5000/api
```

**Oluştur:**
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 3. Backend Bağımlılıklarını Kur
```bash
cd server
npm install
```

### 4. Frontend Bağımlılıklarını Kur
```bash
npm install
```

### 5. PostgreSQL Servisini Kontrol Et
```bash
# Windows Services'den kontrol et
# Services > PostgreSQL > Running olmalı
```

### 6. Test Kullanıcıları Ekle (Login için)
```sql
-- Test Çiftçi
INSERT INTO kullanicilar (ad, soyad, eposta, sifre_hash, telefon, rol, durum, eposta_dogrulandi, sartlar_kabul, sartlar_kabul_tarihi)
VALUES ('Test', 'Çiftçi', 'ciftci@test.com', crypt('123456', gen_salt('bf')), '+90 532 111 22 33', 'ciftci', 'aktif', TRUE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (eposta) DO NOTHING;

-- Test Firma
INSERT INTO kullanicilar (ad, soyad, eposta, sifre_hash, telefon, rol, durum, eposta_dogrulandi, sartlar_kabul, sartlar_kabul_tarihi)
VALUES ('Test', 'Firma', 'firma@test.com', crypt('123456', gen_salt('bf')), '+90 532 444 55 66', 'firma', 'aktif', TRUE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (eposta) DO NOTHING;
```

## 🚀 BAŞLATMA

### Backend'i Başlat
```bash
cd server
npm run dev
```
**Beklenen:** `🚀 Server 5000 portunda çalışıyor`

### Frontend'i Başlat (Yeni Terminal)
```bash
npm run dev
```
**Beklenen:** `Local: http://localhost:5173/`

## ✅ TEST

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
**Beklenen:** `{"status":"ok",...}`

### 2. Login Test
- Browser: http://localhost:5173/giris
- Email: `ciftci@test.com`
- Password: `123456`
- **Beklenen:** Çiftçi paneline yönlendirme

### 3. Register Test
- Browser: http://localhost:5173/kayit
- Form doldur → Submit
- **Beklenen:** "Kayıt başarılı! Admin onayı bekleniyor."

## ❌ SORUN GİDERME

### Seed Data Hatası
```
ERROR: relation "atik_turleri" does not exist
```
**Çözüm:** Önce ana SQL dosyasını çalıştır: `docs/Kullanılan Sql.sql`

### Database Bağlantı Hatası
```
❌ PostgreSQL Havuz Hatası
```
**Çözüm:** 
1. PostgreSQL servisi çalışıyor mu?
2. .env dosyasındaki şifre doğru mu?
3. Database adı doğru mu? (`YeşilEksen` veya `yesileksen`)

### CORS Hatası
```
Access to XMLHttpRequest blocked by CORS policy
```
**Çözüm:** Backend'de `CLIENT_URL=http://localhost:5173` doğru mu?

### API 404
```
GET http://localhost:5000/api/health 404
```
**Çözüm:** Backend çalışıyor mu? `npm run dev` başlatıldı mı?

### Token Hatası
```
Geçersiz token
```
**Çözüm:** .env dosyasında `JWT_SECRET` var mı?

## 📋 KONTROL LİSTESİ

- [ ] Seed data çalıştırıldı
- [ ] Frontend .env dosyası oluşturuldu
- [ ] Backend bağımlılıkları kuruldu (`cd server && npm install`)
- [ ] Frontend bağımlılıkları kuruldu (`npm install`)
- [ ] PostgreSQL servisi çalışıyor
- [ ] Backend çalışıyor (`http://localhost:5000/api/health`)
- [ ] Frontend çalışıyor (`http://localhost:5173`)
- [ ] Test kullanıcıları eklendi
- [ ] Login test edildi
- [ ] Register test edildi

---

**Son Güncelleme:** 2024-11-19

