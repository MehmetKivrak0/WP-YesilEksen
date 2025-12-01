# 📊 Veritabanı Güncelleme Rehberi

## 🎯 Gerekli Tablolar ve Seed Data

Kayıt sistemi için gerekli ek tablolar ve seed data'ları eklemek için bu rehberi takip edin.

## ✅ Yapılacaklar

### 1. SQL Script'i Çalıştır

`docs/ek_tablolar.sql` dosyasını veritabanınızda çalıştırın.

#### Yöntem 1: pgAdmin ile
1. pgAdmin'i açın
2. `yesileksen` veritabanına bağlanın
3. Query Tool'u açın (F5)
4. `docs/ek_tablolar.sql` dosyasını açın
5. Execute (F5) tuşuna basın

#### Yöntem 2: Terminal/Command Line ile
```bash
psql -U postgres -d yesileksen -f docs/ek_tablolar.sql
```

#### Yöntem 3: Windows PowerShell ile
```powershell
psql -U postgres -d yesileksen -f docs\ek_tablolar.sql
```

## 📋 Eklenen Tablolar

### 1. `ciftlik_atik_turleri`
- **Amaç:** Çiftçinin hangi atık türlerini satacağını belirtir
- **Alanlar:**
  - `id` (UUID, Primary Key)
  - `ciftlik_id` (UUID, Foreign Key → ciftlikler)
  - `atik_turu_id` (UUID, Foreign Key → atik_turleri)
  - `olusturma` (Timestamp)

### 2. Seed Data

#### Atık Türleri
- `hayvansal-gubre` - Hayvansal Gübre
- `bitkisel-atik` - Bitkisel Atık
- `tarimsal-sanayi` - Tarımsal Sanayi Yan Ürünü
- `organik-atik` - Organik Atık
- `biyokutle` - Biyokütle
- `diger` - Diğer Atık Türleri

#### Belge Türleri (Çiftçi)
- `tapu_kira` - Tapu Senedi veya Onaylı Kira Sözleşmesi (Zorunlu)
- `nufus_cuzdani` - Nüfus Cüzdanı Fotokopisi (Zorunlu)
- `ciftci_kutugu` - Çiftçi Kütüğü Kaydı (Zorunlu)
- `muvafakatname` - Muvafakatname (Opsiyonel)
- `taahhutname` - Taahhütname (Opsiyonel)
- `doner_sermaye` - Döner Sermaye Ücret Makbuzu (Opsiyonel)

#### Belge Türleri (Şirket)
- `ticaret_sicil` - Ticaret Sicil Gazetesi (Zorunlu)
- `vergi_levhasi` - Vergi Levhası (Zorunlu)
- `imza_sirkuleri` - İmza Sirküleri (Zorunlu)
- `faaliyet_belgesi` - Faaliyet Belgesi (Zorunlu)
- `oda_kayit` - Oda Kayıt Sicil Sureti (Zorunlu)
- `gida_isletme` - Gıda İşletme Kayıt/Onay Belgesi (Opsiyonel)
- `sanayi_sicil` - Sanayi Sicil Belgesi (Opsiyonel)
- `kapasite_raporu` - Kapasite Raporu (Opsiyonel)

## ✅ Kontrol

Script başarıyla çalıştıktan sonra kontrol edin:

```sql
-- Atık türlerini kontrol et
SELECT * FROM atik_turleri WHERE aktif = TRUE;

-- Belge türlerini kontrol et
SELECT * FROM belge_turleri WHERE aktif = TRUE;

-- Tablo oluşturuldu mu kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'ciftlik_atik_turleri';
```

## ⚠️ Önemli Notlar

1. **ON CONFLICT DO NOTHING:** Script birden fazla kez çalıştırılabilir, mevcut veriler korunur.

2. **Mevcut Veriler:** Eğer `atik_turleri` veya `belge_turleri` tablolarında zaten veri varsa, sadece yeni kayıtlar eklenir.

3. **Index'ler:** Performans için otomatik index'ler oluşturulur.

## 🐛 Sorun Giderme

### Hata: "relation already exists"
- Tablo zaten var, sorun değil. Script devam edecek.

### Hata: "duplicate key value"
- Seed data zaten eklenmiş, sorun değil. `ON CONFLICT DO NOTHING` sayesinde hata vermez.

### Hata: "permission denied"
- PostgreSQL kullanıcınızın yeterli yetkisi olmayabilir. `postgres` kullanıcısı ile çalıştırın.

## 📞 Yardım

Sorun yaşarsanız:
1. PostgreSQL loglarını kontrol edin
2. Veritabanı bağlantısını kontrol edin
3. Kullanıcı yetkilerini kontrol edin

---

**Son Güncelleme:** 2024-11-19

