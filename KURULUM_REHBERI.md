# 🚀 YEŞİL-EKSEN - KURULUM REHBERİ

## ✅ KESİN ÇÖZÜM - ADIM ADIM

### ADIM 1: Seed Data'yı Çalıştır (MUTLAKA YAPILMALI!)
```bash
# Terminal/PowerShell'den:
psql -U postgres -d yesileksen -f docs\seed_data.sql
```

**Kontrol:**
```sql
-- pgAdmin'den Query Tool açıp çalıştır:
SELECT COUNT(*) FROM atik_turleri WHERE aktif = TRUE;  -- 6 olmalı
SELECT COUNT(*) FROM belge_turleri WHERE aktif = TRUE; -- 14 olmalı
SELECT COUNT(*) FROM birimler;                         -- 4 olmalı
```

### ADIM 2: Test Kullanıcılarını Ekle (Login Testi İçin)
```bash
psql -U postgres -d yesileksen -f docs\test_kullanicilar.sql
```

**Test Kullanıcıları:**
- **Çiftçi:** `ciftci@test.com` / `123456`
- **Firma:** `firma@test.com` / `123456`

### ADIM 3: Kurulum Script'ini Çalıştır
```bash
# Windows'ta:
setup.bat
```

**Veya Manuel:**
```bash
# Backend bağımlılıkları
cd server
npm install
cd ..

# Frontend bağımlılıkları
npm install
```

### ADIM 4: Backend'i Başlat
```bash
cd server
npm run dev
```

**Beklenen Çıktı:**
```
🚀 Server 5000 portunda çalışıyor
📍 API: http://localhost:5000/api
🏥 Health: http://localhost:5000/api/health
```

### ADIM 5: Frontend'i Başlat (Yeni Terminal)
```bash
npm run dev
```

**Beklenen Çıktı:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### ADIM 6: Test Et

#### 6.1 Health Check
```bash
curl http://localhost:5000/api/health
```
**Beklenen:** `{"status":"ok",...}`

#### 6.2 Login Test
1. Browser: http://localhost:5173/giris
2. Email: `ciftci@test.com`
3. Password: `123456`
4. **Beklenen:** Çiftçi paneline yönlendirme

#### 6.3 Register Test
1. Browser: http://localhost:5173/kayit
2. Formu doldur
3. Belgeleri yükle
4. Submit
5. **Beklenen:** "Kayıt başarılı! Admin onayı bekleniyor."

## ❌ SORUN GİDERME

### Seed Data Hatası
```
ERROR: relation "atik_turleri" does not exist
```
**Çözüm:** Önce ana SQL dosyasını çalıştır: `docs/Kullanılan Sql.sql`

### Database Bağlantı Hatası
```
❌ PostgreSQL Havuz Hatası: password authentication failed
```
**Çözüm:** 
1. `.env` dosyasında `DB_PASSWORD` doğru mu?
2. PostgreSQL şifresi: `3136785972` (mevcut .env'de)
3. Database adı: `YeşilEksen` veya `yesileksen` kontrol et

### CORS Hatası
```
Access to XMLHttpRequest blocked by CORS policy
```
**Çözüm:** 
- Backend `.env`: `CLIENT_URL=http://localhost:5173`
- Frontend `.env`: `VITE_API_URL=http://localhost:5000/api`

### Port Zaten Kullanılıyor
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Çözüm:**
```bash
# Windows'ta port'u kullanan process'i bul:
netstat -ano | findstr :5000
# PID'yi öldür veya .env'de PORT değiştir
```

### Module Not Found
```
Error: Cannot find module 'xxx'
```
**Çözüm:**
```bash
cd server
npm install
cd ..
npm install
```

## 📋 KONTROL LİSTESİ

- [ ] ✅ Seed data çalıştırıldı (`docs/seed_data.sql`)
- [ ] ✅ Test kullanıcıları eklendi (`docs/test_kullanicilar.sql`)
- [ ] ✅ Frontend .env dosyası var (`VITE_API_URL=http://localhost:5000/api`)
- [ ] ✅ Backend .env dosyası var (DB_PASSWORD, JWT_SECRET vb.)
- [ ] ✅ Backend bağımlılıkları kuruldu (`cd server && npm install`)
- [ ] ✅ Frontend bağımlılıkları kuruldu (`npm install`)
- [ ] ✅ PostgreSQL servisi çalışıyor
- [ ] ✅ Backend çalışıyor (`http://localhost:5000/api/health`)
- [ ] ✅ Frontend çalışıyor (`http://localhost:5173`)
- [ ] ✅ Login test edildi
- [ ] ✅ Register test edildi

## 🔍 HIZLI KONTROL

```bash
# 1. Health Check
curl http://localhost:5000/api/health

# 2. Seed Data Kontrol
psql -U postgres -d yesileksen -c "SELECT COUNT(*) FROM atik_turleri WHERE aktif = TRUE;"

# 3. Test Kullanıcı Kontrol
psql -U postgres -d yesileksen -c "SELECT eposta, rol, durum FROM kullanicilar WHERE eposta LIKE '%test.com';"
```

## 📝 ÖNEMLİ NOTLAR

1. **Seed Data Olmadan Register Çalışmaz!**
   - `atik_turleri`, `belge_turleri`, `birimler` tabloları boş olmamalı

2. **Test Kullanıcıları Olmadan Login Test Edilemez!**
   - En az 1 test kullanıcısı ekleyin

3. **Port'lar:**
   - Backend: `5000`
   - Frontend: `5173`
   - PostgreSQL: `5432`

4. **Database Adı:**
   - `.env` dosyasında: `DB_NAME=YeşilEksen`
   - Encoding sorunu olabilir, `yesileksen` de kullanılabilir

---

**Son Güncelleme:** 2024-11-19  
**Durum:** ✅ Hazır - Tüm dosyalar kontrol edildi

