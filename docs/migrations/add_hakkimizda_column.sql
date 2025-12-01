-- =====================================================
-- HAKKIMIZDA KOLONU EKLEME
-- =====================================================
-- Bu migration, ciftlikler tablosuna hakkimizda kolonu ekler
-- =====================================================

-- hakkimizda kolonunu ekle
ALTER TABLE ciftlikler 
ADD COLUMN IF NOT EXISTS hakkimizda TEXT;

-- Not: Kolon tipi TEXT (sınırsız metin)
-- Varsayılan değer NULL (opsiyonel)

