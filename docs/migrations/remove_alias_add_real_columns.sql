-- =====================================================
-- ALIAS MANTIĞINI KALDIRMA VE GERÇEK KOLONLAR EKLEME
-- Trigger'ları kaldırıp bağımsız kolonlar olarak ekliyoruz
-- =====================================================

-- 1. TRIGGER'LARI KALDIR
DROP TRIGGER IF EXISTS trigger_sync_urunler_columns ON urunler;
DROP FUNCTION IF EXISTS sync_urunler_columns();

-- 2. URUNLER TABLOSUNA GERÇEK KOLONLAR EKLE
ALTER TABLE urunler 
ADD COLUMN IF NOT EXISTS baslik VARCHAR(200),
ADD COLUMN IF NOT EXISTS miktar DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS fiyat DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS birim VARCHAR(50),  -- Birim string değeri (ton, kg, m3, litre)
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100);  -- Kategori string değeri (Çiftlik Atıkları)

-- 3. MEVCUT VERİLERİ SENKRONİZE ET (Sadece bir kez)
UPDATE urunler 
SET 
    baslik = COALESCE(baslik, ad),
    miktar = COALESCE(miktar, mevcut_miktar),
    fiyat = COALESCE(fiyat, birim_fiyat),
    birim = COALESCE(birim, (SELECT kod FROM birimler WHERE birimler.id = urunler.birim_id)),
    kategori = COALESCE(kategori, (SELECT ad FROM urun_kategorileri WHERE urun_kategorileri.id = urunler.kategori_id))
WHERE baslik IS NULL OR miktar IS NULL OR fiyat IS NULL OR birim IS NULL OR kategori IS NULL;

-- 4. NOT: Artık trigger yok, her kolon bağımsız olarak yönetilecek
-- Backend kodunda hem ID'ler (kategori_id, birim_id) hem de string değerler (kategori, birim) kaydedilecek

