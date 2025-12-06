-- =====================================================
-- STOK_SAYISI KOLONU EKLEME SORGU
-- =====================================================
-- Bu script, urun_basvurulari ve urunler tablolarına
-- stok_sayisi kolonunu ekler
-- =====================================================

-- 1. urun_basvurulari tablosuna stok_sayisi kolonu ekleme
ALTER TABLE public.urun_basvurulari 
ADD COLUMN IF NOT EXISTS stok_sayisi NUMERIC(10, 2) DEFAULT 0;

-- Kolonun açıklamasını ekle
COMMENT ON COLUMN public.urun_basvurulari.stok_sayisi IS 'Ürün başvurusu için mevcut stok miktarı';

-- 2. urunler tablosuna stok_sayisi kolonu ekleme
ALTER TABLE public.urunler 
ADD COLUMN IF NOT EXISTS stok_sayisi NUMERIC(10, 2) DEFAULT 0;

-- Kolonun açıklamasını ekle
COMMENT ON COLUMN public.urunler.stok_sayisi IS 'Ürünün mevcut stok miktarı';

-- 3. (Opsiyonel) Mevcut kayıtlar için stok_sayisi'ni güncelle
-- urunler tablosunda mevcut_miktar veya miktar değerini stok_sayisi olarak ayarla
UPDATE public.urunler 
SET stok_sayisi = COALESCE(mevcut_miktar, miktar, 0)
WHERE stok_sayisi = 0 OR stok_sayisi IS NULL;

-- 4. Kontrol sorgusu: Kolonların başarıyla eklendiğini doğrula
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

