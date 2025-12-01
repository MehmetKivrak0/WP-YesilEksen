-- =====================================================
-- AÇIKLAMA KOLONUNU URUN_TUR OLARAK YENİDEN ADLANDIRMA
-- =====================================================
-- Bu migration, ciftlikler tablosundaki aciklama kolonunu urun_tur olarak yeniden adlandırır
-- =====================================================

-- aciklama kolonunu urun_tur olarak yeniden adlandır
ALTER TABLE ciftlikler 
RENAME COLUMN aciklama TO urun_tur;

-- Not: Kolon tipi ve uzunluğu aynı kalır (TEXT)
-- Sadece kolon adı değişir

