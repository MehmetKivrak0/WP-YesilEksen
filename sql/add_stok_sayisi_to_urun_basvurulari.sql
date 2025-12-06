-- urun_basvurulari tablosuna stok_sayisi kolonu ekleme
-- Bu kolon, ürün başvurusu için mevcut stok miktarını tutacak

ALTER TABLE public.urun_basvurulari 
ADD COLUMN IF NOT EXISTS stok_sayisi NUMERIC(10, 2) DEFAULT 0;

-- Kolonun açıklamasını ekle (opsiyonel)
COMMENT ON COLUMN public.urun_basvurulari.stok_sayisi IS 'Ürün başvurusu için mevcut stok miktarı';

