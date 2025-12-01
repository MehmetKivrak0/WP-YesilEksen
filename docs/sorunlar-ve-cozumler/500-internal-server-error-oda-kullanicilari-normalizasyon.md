# 500 Internal Server Error - oda_kullanicilari Normalizasyon Sorunu

**Tarih:** 2024-11-22  
**Durum:** ✅ Çözüldü

## 🔴 Sorun

`/iamgroot` sayfasından oda yöneticisi (ziraat/sanayi) kaydı yapılırken `500 Internal Server Error` hatası alınıyordu.

### Hata Detayları

- **Frontend Console:**
  ```
  POST http://localhost:5000/api/auth/register 500 (Internal Server Error)
  ```

- **Backend:** `oda_kullanicilari` tablosuna INSERT yapılmaya çalışılıyordu
- **Durum:** Normalizasyon ihlali nedeniyle gereksiz tablo kullanılıyordu

## 🔍 Sorunun Kök Nedeni

### Normalizasyon İhlali

`oda_kullanicilari` tablosu normalizasyon prensiplerine aykırıydı:

1. **Veri Tekrarı (Redundancy):**
   - `sartlar_kabul` hem `kullanicilar` hem de `oda_kullanicilari` tablosunda tutuluyordu
   - Aynı bilgi iki yerde saklanıyordu

2. **Türetilmiş Veri (Derived Data):**
   - `oda_tipi` bilgisi doğrudan `rol` kolonundan türetilebilir:
     - `rol = 'ziraat_yoneticisi'` → `oda_tipi = 'ziraat'`
     - `rol = 'sanayi_yoneticisi'` → `oda_tipi = 'sanayi'`
   - Ayrı bir tabloda tutulmasına gerek yoktu

3. **Veri Tutarsızlığı Riski:**
   - `kullanicilar.rol` ve `oda_kullanicilari.oda_tipi` arasında uyumsuzluk olabilirdi
   - Örnek: `rol = 'ziraat_yoneticisi'` ama `oda_tipi = 'sanayi'`

4. **Gereksiz JOIN:**
   - Her sorguda `oda_kullanicilari` tablosuna JOIN yapmak gerekiyordu
   - Performans kaybına neden oluyordu

### Tablo Yapısı

```sql
-- Kaldırılan tablo
CREATE TABLE oda_kullanicilari (
    id UUID PRIMARY KEY,
    kullanici_id UUID NOT NULL UNIQUE REFERENCES kullanicilar(id),
    oda_tipi VARCHAR(20) NOT NULL CHECK (oda_tipi IN ('ziraat', 'sanayi')),
    sartlar_kabul BOOLEAN DEFAULT FALSE,
    olusturma TIMESTAMP,
    guncelleme TIMESTAMP
);
```

**Sorun:** Bu tablo gereksizdi çünkü:
- `kullanici_id` → Zaten `kullanicilar` tablosunda var
- `oda_tipi` → `kullanicilar.rol`'den türetilebilir
- `sartlar_kabul` → Zaten `kullanicilar` tablosunda var

## ✅ Çözüm

### 1. Kod Değişiklikleri

**Dosya:** `server/src/controllers/authController.js`

#### Register Fonksiyonu

**Önceki Kod (Hatalı):**
```javascript
} else if (rol === 'ziraat_yoneticisi' || rol === 'sanayi_yoneticisi') {
    const odaTipi = rol === 'ziraat_yoneticisi' ? 'ziraat' : 'sanayi';
    
    // oda_kullanicilari tablosuna kayıt ekle
    await client.query(
        `INSERT INTO oda_kullanicilari 
        (kullanici_id, oda_tipi, sartlar_kabul)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (kullanici_id) DO UPDATE SET
            oda_tipi = EXCLUDED.oda_tipi,
            sartlar_kabul = EXCLUDED.sartlar_kabul,
            guncelleme = CURRENT_TIMESTAMP`,
        [user.id, odaTipi]
    );
}
```

**Yeni Kod (Düzeltilmiş):**
```javascript
} else if (rol === 'ziraat_yoneticisi' || rol === 'sanayi_yoneticisi') {
    // Oda yöneticileri için sadece kullanicilar tablosunda rol yeterli
    // oda_tipi bilgisi rol'den türetilebilir (ziraat_yoneticisi -> ziraat, sanayi_yoneticisi -> sanayi)
    // Normalizasyon: Gereksiz oda_kullanicilari tablosu kaldırıldı
    
    if (process.env.NODE_ENV === 'development') {
        const odaTipi = rol === 'ziraat_yoneticisi' ? 'ziraat' : 'sanayi';
        console.log(`✅ ${rol} kaydedildi - kullanicilar tablosuna eklendi:`, {
            kullanici_id: user.id,
            email: user.eposta,
            rol: user.rol,
            oda_tipi: odaTipi + ' (rol\'den türetildi)'
        });
    }
}
```

#### Login Fonksiyonu

**Önceki Kod (Hatalı):**
```javascript
// Hem kullanicilar tablosundaki rolü hem de oda_kullanicilari tablosundaki kaydı kontrol et
let isOdaYoneticisi = user.rol === 'ziraat_yoneticisi' || 
                      user.rol === 'sanayi_yoneticisi' || 
                      user.rol === 'super_yonetici' ||
                      user.rol === 'ziraat' ||  // Yanlış kaydedilmiş rol durumu
                      user.rol === 'sanayi';    // Yanlış kaydedilmiş rol durumu

// Eğer kullanicilar tablosunda rol yanlış kaydedilmişse, oda_kullanicilari tablosunu kontrol et
if (!isOdaYoneticisi) {
    try {
        const odaCheck = await pool.query(
            `SELECT oda_tipi FROM oda_kullanicilari WHERE kullanici_id = $1`,
            [user.id]
        );
        if (odaCheck.rows.length > 0) {
            isOdaYoneticisi = true;
        }
    } catch (odaError) {
        // Hata yönetimi...
    }
}
```

**Yeni Kod (Düzeltilmiş):**
```javascript
// Kullanıcı durumu kontrolü
// Ziraat ve sanayi yöneticileri için durum kontrolünü atla (direkt giriş yapabilirler)
// Normalizasyon: Sadece kullanicilar.rol kullanılıyor, oda_kullanicilari tablosu kaldırıldı
const isOdaYoneticisi = user.rol === 'ziraat_yoneticisi' || 
                        user.rol === 'sanayi_yoneticisi' || 
                        user.rol === 'super_yonetici';
```

### 2. Veritabanı Migration

**Dosya:** `migration_remove_oda_kullanicilari.sql`

```sql
-- oda_kullanicilari tablosunu kaldır
DROP TABLE IF EXISTS oda_kullanicilari CASCADE;
```

**Not:** Migration çalıştırılmadan önce kod değişiklikleri yapıldı.

### 3. Oda Tipi Bilgisini Türetme

Artık `oda_tipi` bilgisi `rol`'den türetiliyor:

```sql
-- Oda tipi bilgisini rol'den türet
SELECT 
    id,
    eposta,
    rol,
    CASE 
        WHEN rol = 'ziraat_yoneticisi' THEN 'ziraat'
        WHEN rol = 'sanayi_yoneticisi' THEN 'sanayi'
        ELSE NULL
    END as oda_tipi
FROM kullanicilar
WHERE rol IN ('ziraat_yoneticisi', 'sanayi_yoneticisi');
```

## 📝 Yapılan Değişiklikler

### Backend Kod Değişiklikleri

1. **`server/src/controllers/authController.js`:**
   - `register` fonksiyonunda `oda_kullanicilari` INSERT'i kaldırıldı
   - `login` fonksiyonunda `oda_kullanicilari` kontrolü kaldırıldı
   - Sadece `kullanicilar.rol` kullanılıyor

### Veritabanı Değişiklikleri

1. **Migration Script:**
   - `migration_remove_oda_kullanicilari.sql` oluşturuldu
   - `oda_kullanicilari` tablosu kaldırıldı

## ✅ Sonuç

- ✅ Normalizasyon ihlali düzeltildi
- ✅ Veri tekrarı kaldırıldı
- ✅ Gereksiz JOIN'ler kaldırıldı
- ✅ Veri tutarlılığı sağlandı
- ✅ Kayıt işlemi başarıyla çalışıyor

## 📚 İlgili Dosyalar

- `server/src/controllers/authController.js` - Register ve login fonksiyonları
- `migration_remove_oda_kullanicilari.sql` - Migration script
- `docs/sorunlar-ve-cozumler/OZET_NOT_ODA_YONETICISI.md` - Önceki notlar

## 🔗 İlgili Sorunlar

- [403 Forbidden - Oda Yöneticisi Giriş](./403-forbidden-oda-yoneticisi-giris.md)
- [Oda Yöneticisi Özet Not](./OZET_NOT_ODA_YONETICISI.md)

---

**Son Güncelleme:** 2024-11-22




