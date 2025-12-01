-- =====================================================
-- SEHIR_ADI KOLONUNU KONTROL ETME
-- =====================================================
-- Bu sorgu, ciftlikler tablosunda sehir_adi kolonunun olup olmadığını kontrol eder
-- =====================================================

-- 1. Kolonun varlığını kontrol et
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ciftlikler' 
AND column_name = 'sehir_adi';

-- 2. Eğer kolon yoksa, tüm kolonları listele
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'ciftlikler'
ORDER BY ordinal_position;

-- 3. Mevcut verileri kontrol et (eğer kolon varsa)
SELECT 
    id,
    ad,
    sehir_id,
    sehir_adi,
    COUNT(*) as kayit_sayisi
FROM ciftlikler
GROUP BY id, ad, sehir_id, sehir_adi
LIMIT 10;

