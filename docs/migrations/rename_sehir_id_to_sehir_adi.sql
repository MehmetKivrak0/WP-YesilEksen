-- =====================================================
-- SEHIR_ID KOLONUNU SEHIR_ADI OLARAK YENİDEN ADLANDIRMA
-- (Tip değiştirmeden, sadece ad değiştirme)
-- =====================================================
-- Bu migration, sehir_id kolonunu sehir_adi olarak yeniden adlandırır
-- ve tipini SMALLINT'ten VARCHAR'a değiştirir (şehir adlarını tutmak için)
-- =====================================================

-- 1. Foreign key constraint'ini kaldır
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

-- 2. Geçici VARCHAR kolonu ekle
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi_temp VARCHAR(50);

-- 3. Mevcut sehir_id değerlerini şehir adlarına çevir
UPDATE ciftlikler c
SET sehir_adi_temp = s.ad
FROM sehirler s
WHERE c.sehir_id = s.id AND c.sehir_adi_temp IS NULL;

-- 4. Eski sehir_id kolonunu sil
ALTER TABLE ciftlikler 
DROP COLUMN IF EXISTS sehir_id;

-- 5. Geçici kolonu sehir_adi olarak yeniden adlandır
ALTER TABLE ciftlikler 
RENAME COLUMN sehir_adi_temp TO sehir_adi;

-- Not: Artık sehir_adi VARCHAR(50) kolonu kullanılıyor

