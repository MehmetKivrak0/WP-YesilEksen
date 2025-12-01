# 🔧 YEŞİL-EKSEN Veritabanı Kurulum Rehberi

## ❌ SORUN
Postman'de `/api/auth/register` endpoint'i şu hatayı veriyor:
```
"password authentication failed for user 'postgres'"
```

## ✅ ÇÖZÜM ADIMLARI

### Adım 1: PostgreSQL Servisini Başlatın

1. **Windows Arama**'da "Services" yazın
2. **Services** (Hizmetler) uygulamasını açın
3. **postgresql-x64-XX** veya **PostgreSQL** servisini bulun
4. Sağ tıklayın ve **Start** (Başlat) seçin
5. Servis durumu **Running** olmalı

### Adım 2: pgAdmin'i Açın ve Bağlantıyı Test Edin

1. **pgAdmin** uygulamasını açın
2. Sol taraftan **Servers** > **PostgreSQL XX** 'e tıklayın
3. Şifrenizi girin (PostgreSQL kurulumunda belirlediğiniz)
4. Bağlantı başarılıysa devam edin

**ÖNEMLİ:** Bu şifreyi not edin!

### Adım 3: Veritabanını Oluşturun

pgAdmin'de:

1. **Databases** üzerine sağ tıklayın
2. **Create** > **Database** seçin
3. **Database Name:** `yesileksen` yazın
4. **Save** butonuna tıklayın

### Adım 4: SQL Dosyasını Çalıştırın

1. pgAdmin'de yeni oluşturduğunuz **yesileksen** veritabanına tıklayın
2. Üst menüden **Tools** > **Query Tool** seçin
3. Dosya aç butonuna tıklayın
4. `docs/Kullanılan Sql.sql` dosyasını seçin
5. **Execute** (F5) butonuna basın
6. Tüm tabloların oluşturulduğundan emin olun

### Adım 5: `.env` Dosyasını Düzenleyin

`server/.env` dosyasını açın ve şu satırları düzenleyin:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yesileksen
DB_USER=postgres
DB_PASSWORD=BURAYA_POSTGRESQL_ŞİFRENİZİ_YAZIN
```

**Önemli:** `DB_PASSWORD` değerini Adım 2'de girdiğiniz şifre ile değiştirin!

### Adım 6: Sunucuyu Yeniden Başlatın

PowerShell'de:

```powershell
# Mevcut sunucuyu durdurun (Ctrl+C)
# Sonra tekrar başlatın:
cd server
npm run dev
```

### Adım 7: Test Edin

1. **Postman**'i açın
2. **POST** `http://localhost:5000/api/auth/register`
3. **Body** > **raw** > **JSON** seçin
4. Şu JSON'u yapıştırın:

```json
{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@test.com",
  "password": "123456",
  "userType": "farmer",
  "phone": "+90 532 123 45 67",
  "terms": true
}
```

5. **Send** butonuna tıklayın

### ✅ Başarılı Yanıt

```json
{
  "success": true,
  "message": "Kayıt başarılı! Admin onayı bekleniyor.",
  "user": {
    "id": "...",
    "ad": "Ahmet",
    "soyad": "Yılmaz",
    "eposta": "ahmet@test.com",
    "rol": "ciftci",
    "durum": "beklemede"
  }
}
```

## 🔍 Hala Çalışmıyorsa

### Test 1: PostgreSQL Bağlantısını Doğrudan Test Edin

PowerShell'de (PostgreSQL bin klasörünü PATH'e eklediyseniz):

```powershell
& "C:\Program Files\PostgreSQL\XX\bin\psql.exe" -U postgres -d yesileksen
# Şifrenizi girin
# Bağlantı başarılı olursa:
\dt  # Tabloları listeler
\q   # Çıkış
```

### Test 2: pgAdmin'de Şifreyi Doğrulayın

pgAdmin'de sunucu özelliklerinde şifrenizi kaydedin:
1. **Servers** > **PostgreSQL** > Sağ tık > **Properties**
2. **Connection** sekmesine gidin
3. **Password** alanına şifrenizi yazın
4. **Save password** işaretleyin
5. **Save**

### Test 3: Health Check ile Bağlantıyı Kontrol Edin

Tarayıcıda: `http://localhost:5000/api/health`

Başarılı yanıt:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

## 📞 Yardım

Sorun devam ediyorsa, şu bilgileri paylaşın:
- PostgreSQL versiyonu
- `.env` dosyanızdaki DB_ satırları (ŞİFRE HARİÇ!)
- pgAdmin'de bağlantı kurabildiniz mi?
- Sunucu konsol çıktısı (npm run dev)





