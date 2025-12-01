-- =====================================================
-- WEBSITE KOLONUNU FOTO_URL OLARAK YENİDEN ADLANDIRMA
-- =====================================================
-- Bu migration, ciftlikler tablosundaki website kolonunu foto_url olarak yeniden adlandırır
-- =====================================================

-- website kolonunu foto_url olarak yeniden adlandır
ALTER TABLE ciftlikler 
RENAME COLUMN website TO foto_url;

-- Not: Kolon tipi ve uzunluğu aynı kalır (VARCHAR(255))
-- Sadece kolon adı değişir

