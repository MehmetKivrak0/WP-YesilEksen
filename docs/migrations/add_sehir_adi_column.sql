-- =====================================================
-- ÇİFTLİKLER TABLOSUNA SEHIR_ADI ALANI EKLEME
-- =====================================================
-- Bu migration, ciftlikler tablosuna sehir_adi VARCHAR alanı ekler
-- ve mevcut sehir_id değerlerini sehir_adi'ye kopyalar
-- =====================================================

-- 1. sehir_adi alanını ekle
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi VARCHAR(50);

-- 2. Mevcut sehir_id değerlerini sehir_adi'ye kopyala (JOIN ile)
UPDATE ciftlikler c
SET sehir_adi = s.ad
FROM sehirler s
WHERE c.sehir_id = s.id AND c.sehir_adi IS NULL;

-- 3. sehir_id kolonunu kaldır (foreign key constraint'i önce kaldırılmalı)
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

ALTER TABLE ciftlikler 
DROP COLUMN IF EXISTS sehir_id;

-- Not: sehir_id kaldırıldı, artık sadece sehir_adi VARCHAR alanı kullanılacak

