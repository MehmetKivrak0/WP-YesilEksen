-- =====================================================
-- WEBSITE KOLONUNU LOGO_URL OLARAK YENİDEN ADLANDIRMA
-- =====================================================
-- Bu migration, ciftlikler tablosundaki website kolonunu logo_url olarak yeniden adlandırır
-- =====================================================

-- website kolonunu logo_url olarak yeniden adlandır
ALTER TABLE ciftlikler 
RENAME COLUMN website TO logo_url;

-- Not: Kolon tipi ve uzunluğu aynı kalır (VARCHAR(255))
-- Sadece kolon adı değişir

