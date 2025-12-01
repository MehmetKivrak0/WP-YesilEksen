-- =====================================================
-- SEHIR_ID KOLONUNU VARCHAR'A DÖNÜŞTÜRME
-- =====================================================
-- Bu migration, sehir_id SMALLINT kolonunu VARCHAR'a dönüştürür
-- ve mevcut ID değerlerini şehir adlarına çevirir
-- =====================================================

-- 1. Foreign key constraint'ini kaldır
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

-- 2. Geçici bir kolon oluştur (şehir adlarını tutmak için)
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi_temp VARCHAR(50);

-- 3. Mevcut sehir_id değerlerini şehir adlarına çevir ve geçici kolona kopyala
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

