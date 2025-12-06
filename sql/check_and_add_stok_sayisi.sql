-- =====================================================
-- STOK_SAYISI KOLONU KONTROL VE EKLEME SORGUSU
-- =====================================================
-- Bu script önce kolonun var olup olmadığını kontrol eder,
-- yoksa ekler

-- 1. Kolonun var olup olmadığını kontrol et
DO $$
BEGIN
    -- urun_basvurulari tablosu için kontrol
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'urun_basvurulari' 
          AND column_name = 'stok_sayisi'
    ) THEN
        ALTER TABLE public.urun_basvurulari 
        ADD COLUMN stok_sayisi NUMERIC(10, 2) DEFAULT 0;
        
        COMMENT ON COLUMN public.urun_basvurulari.stok_sayisi IS 'Ürün başvurusu için mevcut stok miktarı';
        
        RAISE NOTICE '✅ urun_basvurulari.stok_sayisi kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ urun_basvurulari.stok_sayisi kolonu zaten mevcut';
    END IF;

    -- urunler tablosu için kontrol
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'urunler' 
          AND column_name = 'stok_sayisi'
    ) THEN
        ALTER TABLE public.urunler 
        ADD COLUMN stok_sayisi NUMERIC(10, 2) DEFAULT 0;
        
        COMMENT ON COLUMN public.urunler.stok_sayisi IS 'Ürünün mevcut stok miktarı';
        
        -- Mevcut kayıtlar için stok_sayisi'ni güncelle
        UPDATE public.urunler 
        SET stok_sayisi = COALESCE(mevcut_miktar, miktar, 0)
        WHERE stok_sayisi = 0 OR stok_sayisi IS NULL;
        
        RAISE NOTICE '✅ urunler.stok_sayisi kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ urunler.stok_sayisi kolonu zaten mevcut';
    END IF;
END $$;

-- 2. Kontrol sorgusu: Kolonların başarıyla eklendiğini doğrula
SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('urun_basvurulari', 'urunler')
  AND column_name = 'stok_sayisi'
ORDER BY table_name;

