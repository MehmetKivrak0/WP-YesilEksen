-- =====================================================
-- SEHIR_ID KOLONUNU DOĞRUDAN DEĞİŞTİRME
-- =====================================================
-- Bu migration, sehir_id kolonunu sehir_adi VARCHAR olarak değiştirir
-- =====================================================

-- 1. Foreign key constraint'ini kaldır
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

-- 2. Geçici VARCHAR kolonu ekle
ALTER TABLE ciftlikler 
ADD COLUMN sehir_adi VARCHAR(50);

-- 3. Mevcut sehir_id değerlerini şehir adlarına çevir
UPDATE ciftlikler c
SET sehir_adi = s.ad
FROM sehirler s
WHERE c.sehir_id = s.id;

-- 4. Eski sehir_id kolonunu sil
ALTER TABLE ciftlikler 
DROP COLUMN sehir_id;

-- Not: Artık sehir_adi VARCHAR(50) kolonu kullanılıyor
-- Backend kodunda sehir_id referanslarını sehir_adi olarak güncellemeyi unutmayın!

