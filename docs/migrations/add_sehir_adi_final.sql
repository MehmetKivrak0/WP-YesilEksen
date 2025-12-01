-- =====================================================
-- ÇİFTLİKLER TABLOSUNA SEHIR_ADI KOLONU EKLEME
-- =====================================================
-- Bu migration, ciftlikler tablosuna sehir_adi VARCHAR kolonu ekler
-- Mevcut sehir_id kolonu korunur, sadece sehir_adi eklenir
-- =====================================================

-- 1. sehir_adi kolonunu ekle
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi VARCHAR(50);

-- 2. Mevcut sehir_id değerlerini şehir adlarına çevir ve sehir_adi'ye kopyala
UPDATE ciftlikler c
SET sehir_adi = s.ad
FROM sehirler s
WHERE c.sehir_id = s.id AND c.sehir_adi IS NULL;

-- Not: 
-- - sehir_id kolonu korunuyor (foreign key ilişkisi devam ediyor)
-- - sehir_adi kolonu eklendi ve mevcut veriler kopyalandı
-- - İleride sehir_id'yi kaldırmak isterseniz ayrı bir migration çalıştırabilirsiniz

