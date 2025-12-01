-- durum_tipi ENUM'unu yeniden oluştur
-- Sadece gerekli değerler: aktif, beklemede, eksik, incelemede, pasif, iptal

-- ÖNEMLİ: Bu işlem mevcut verileri etkileyebilir!
-- Önce hangi tablolarda kullanıldığını kontrol edin:
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE udt_name = 'durum_tipi';

-- 1. Mevcut ENUM değerlerini kontrol et
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'durum_tipi'::regtype 
ORDER BY enumsortorder;

-- 2. Mevcut verileri kontrol et (askida ve silindi değerlerini kullanan kayıtlar var mı?)
SELECT 'firmalar' as tablo, durum, COUNT(*) as sayi FROM firmalar WHERE durum IN ('askida', 'silindi') GROUP BY durum
UNION ALL
SELECT 'ciftlikler' as tablo, durum, COUNT(*) as sayi FROM ciftlikler WHERE durum IN ('askida', 'silindi') GROUP BY durum
UNION ALL
SELECT 'urunler' as tablo, durum, COUNT(*) as sayi FROM urunler WHERE durum IN ('askida', 'silindi') GROUP BY durum;

-- 3. askida ve silindi değerlerini kullanan kayıtları pasif'e map et
-- (Yeni ENUM'da bu değerler olmayacağı için önce map etmeliyiz)
UPDATE firmalar SET durum = 'pasif' WHERE durum IN ('askida', 'silindi');
UPDATE ciftlikler SET durum = 'pasif' WHERE durum IN ('askida', 'silindi');
UPDATE urunler SET durum = 'pasif' WHERE durum IN ('askida', 'silindi');

-- 4. Yeni ENUM oluştur
CREATE TYPE durum_tipi_new AS ENUM (
    'aktif',
    'beklemede',
    'eksik',
    'incelemede',
    'pasif',
    'iptal'
);

-- 5. Tablolardaki durum sütunlarını yeni ENUM'a çevir
-- NOT: Bu işlem sırasında tablolar kilitlenebilir, dikkatli olun!

-- firmalar tablosu
ALTER TABLE firmalar 
    ALTER COLUMN durum TYPE durum_tipi_new 
    USING durum::text::durum_tipi_new;

-- ciftlikler tablosu
ALTER TABLE ciftlikler 
    ALTER COLUMN durum TYPE durum_tipi_new 
    USING durum::text::durum_tipi_new;

-- urunler tablosu
ALTER TABLE urunler 
    ALTER COLUMN durum TYPE durum_tipi_new 
    USING durum::text::durum_tipi_new;

-- 6. Eski ENUM'u sil ve yeni ENUM'u eski isimle değiştir
DROP TYPE durum_tipi;
ALTER TYPE durum_tipi_new RENAME TO durum_tipi;

-- 7. Kontrol et
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'durum_tipi'::regtype 
ORDER BY enumsortorder;

-- Sonuç şöyle olmalı:
-- aktif
-- beklemede
-- eksik
-- incelemede
-- pasif
-- iptal

