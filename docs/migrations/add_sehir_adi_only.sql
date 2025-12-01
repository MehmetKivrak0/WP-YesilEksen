-- =====================================================
-- ÇİFTLİKLER TABLOSUNA SEHIR_ADI ALANI EKLEME
-- =====================================================
-- Bu migration, ciftlikler tablosuna sadece sehir_adi VARCHAR alanı ekler
-- =====================================================

-- sehir_adi alanını ekle
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS sehir_adi VARCHAR(50);

