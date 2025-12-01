-- =====================================================
-- SEHIR_ID KOLONUNU DEĞİŞTİRME (VIEW DESTEKLİ)
-- =====================================================
-- Bu migration, sehir_id kolonunu sehir_adi VARCHAR olarak değiştirir
-- ve v_urunler_detay view'ını günceller
-- =====================================================

-- 1. View'ı kaldır (sehir_id'ye bağımlı olduğu için)
DROP VIEW IF EXISTS v_urunler_detay;

-- 2. Foreign key constraint'ini kaldır
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

-- 3. Geçici VARCHAR kolonu ekle
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi_temp VARCHAR(50);

-- 4. Mevcut sehir_id değerlerini şehir adlarına çevir
UPDATE ciftlikler c
SET sehir_adi_temp = s.ad
FROM sehirler s
WHERE c.sehir_id = s.id AND c.sehir_adi_temp IS NULL;

-- 5. Eski sehir_id kolonunu sil
ALTER TABLE ciftlikler 
DROP COLUMN IF EXISTS sehir_id;

-- 6. Geçici kolonu sehir_adi olarak yeniden adlandır
ALTER TABLE ciftlikler 
RENAME COLUMN sehir_adi_temp TO sehir_adi;

-- 7. View'ı yeniden oluştur (sehir_adi kullanarak)
CREATE OR REPLACE VIEW v_urunler_detay AS
SELECT 
    u.*,
    c.ad AS uretici_adi,
    c.sehir_adi AS bolge,  -- sehir_id yerine sehir_adi kullanılıyor
    c.telefon AS uretici_telefon,
    c.organik,
    c.iyi_tarim,
    uk.ad AS kategori_adi,
    b.ad AS birim_adi,
    b.sembol AS birim_sembol
FROM urunler u
JOIN ciftlikler c ON u.ciftlik_id = c.id
JOIN urun_kategorileri uk ON u.kategori_id = uk.id
JOIN birimler b ON u.birim_id = b.id
WHERE u.silinme IS NULL;

-- Not: Artık sehir_adi VARCHAR(50) kolonu kullanılıyor ve view güncellendi

