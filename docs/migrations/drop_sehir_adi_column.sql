-- =====================================================
-- SEHIR_ADI KOLONUNU KALDIRMA
-- =====================================================
-- Bu migration, ciftlikler tablosundan sehir_adi kolonunu kaldırır
-- =====================================================

-- sehir_adi kolonunu kaldır
ALTER TABLE ciftlikler 
DROP COLUMN IF EXISTS sehir_adi;

