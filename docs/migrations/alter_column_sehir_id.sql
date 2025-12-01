-- =====================================================
-- SEHIR_ID KOLONUNU ALTER COLUMN İLE DEĞİŞTİRME
-- =====================================================
-- PostgreSQL'de MODIFY COLUMN yok, ALTER COLUMN TYPE kullanılır
-- Bu migration, sehir_id SMALLINT kolonunu VARCHAR'a dönüştürür
-- =====================================================

-- 1. Foreign key constraint'ini kaldır (tip değişikliği için gerekli)
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

-- 2. Önce mevcut sehir_id değerlerini şehir adlarına çevirip geçici kolona kopyala
-- (SMALLINT'ten VARCHAR'a direkt dönüşüm yapmak için önce veriyi dönüştürmeliyiz)
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi_temp VARCHAR(50);

UPDATE ciftlikler c
SET sehir_adi_temp = s.ad
FROM sehirler s
WHERE c.sehir_id = s.id AND c.sehir_adi_temp IS NULL;

-- 3. Eski sehir_id kolonunu sil
ALTER TABLE ciftlikler 
DROP COLUMN IF EXISTS sehir_id;

-- 4. Geçici kolonu sehir_adi olarak yeniden adlandır
ALTER TABLE ciftlikler 
RENAME COLUMN sehir_adi_temp TO sehir_adi;

-- Alternatif: Eğer direkt tip değişikliği yapmak isterseniz (ama veri kaybı olabilir):
-- ALTER TABLE ciftlikler 
-- ALTER COLUMN sehir_id TYPE VARCHAR(50) USING sehir_id::VARCHAR;
-- Bu yöntem ID numaralarını string'e çevirir, şehir adlarını değil!

-- Not: Yukarıdaki yöntem şehir adlarını korur, direkt tip değişikliği ID'leri string'e çevirir

