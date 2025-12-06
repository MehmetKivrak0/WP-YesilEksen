-- urunler tablosuna stok_sayisi kolonu ekleme
-- Bu kolon, ürünün mevcut stok miktarını tutacak

ALTER TABLE public.urunler 
ADD COLUMN IF NOT EXISTS stok_sayisi NUMERIC(10, 2) DEFAULT 0;

-- Kolonun açıklamasını ekle (opsiyonel)
COMMENT ON COLUMN public.urunler.stok_sayisi IS 'Ürünün mevcut stok miktarı';

-- Mevcut kayıtlar için stok_sayisi'ni miktar değeri ile güncelle (opsiyonel)
-- Eğer stok_sayisi 0 ise ve miktar varsa, miktar değerini stok_sayisi olarak ayarla
UPDATE public.urunler 
SET stok_sayisi = COALESCE(mevcut_miktar, miktar, 0)
WHERE stok_sayisi = 0 OR stok_sayisi IS NULL;

