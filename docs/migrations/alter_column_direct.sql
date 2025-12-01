-- =====================================================
-- SEHIR_ID KOLONUNU DİREKT ALTER COLUMN İLE DEĞİŞTİRME
-- =====================================================
-- Bu migration, sehir_id kolonunu direkt VARCHAR'a dönüştürür
-- DİKKAT: Bu yöntem ID numaralarını string'e çevirir, şehir adlarını değil!
-- =====================================================

-- 1. Foreign key constraint'ini kaldır
ALTER TABLE ciftlikler 
DROP CONSTRAINT IF EXISTS ciftlikler_sehir_id_fkey;

-- 2. Kolon tipini direkt VARCHAR'a değiştir (ID numaraları string olur)
ALTER TABLE ciftlikler 
ALTER COLUMN sehir_id TYPE VARCHAR(50) USING sehir_id::VARCHAR;

-- 3. (Opsiyonel) Kolon adını değiştir
ALTER TABLE ciftlikler 
RENAME COLUMN sehir_id TO sehir_adi;

-- Not: Bu yöntem ID numaralarını string'e çevirir (örn: "1", "2", "3")
-- Şehir adlarını almak için JOIN yapmanız gerekir veya yukarıdaki migration'ı kullanın

