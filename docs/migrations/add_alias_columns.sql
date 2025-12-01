-- =====================================================
-- ALIAS KOLONLARI EKLEME MİGRATİON
-- Alias kullanımını kaldırmak için yeni kolonlar ekleniyor
-- =====================================================

-- 1. URUNLER TABLOSUNA KOLONLAR EKLE
ALTER TABLE urunler 
ADD COLUMN IF NOT EXISTS baslik VARCHAR(200),
ADD COLUMN IF NOT EXISTS miktar DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS fiyat DECIMAL(12, 2);

-- Mevcut verileri senkronize et
UPDATE urunler 
SET 
    baslik = ad,
    miktar = mevcut_miktar,
    fiyat = birim_fiyat
WHERE baslik IS NULL OR miktar IS NULL OR fiyat IS NULL;

-- Trigger oluştur: ad değiştiğinde baslik'i güncelle
CREATE OR REPLACE FUNCTION sync_urunler_columns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.baslik = COALESCE(NEW.baslik, NEW.ad);
    NEW.miktar = COALESCE(NEW.miktar, NEW.mevcut_miktar);
    NEW.fiyat = COALESCE(NEW.fiyat, NEW.birim_fiyat);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_urunler_columns ON urunler;
CREATE TRIGGER trigger_sync_urunler_columns
BEFORE INSERT OR UPDATE ON urunler
FOR EACH ROW
EXECUTE FUNCTION sync_urunler_columns();

-- 2. TEKLİFLER TABLOSUNA KOLON EKLE
ALTER TABLE teklifler 
ADD COLUMN IF NOT EXISTS son_gecerlilik_tarihi DATE;

-- Mevcut verileri senkronize et
UPDATE teklifler 
SET son_gecerlilik_tarihi = gecerlilik_tarihi
WHERE son_gecerlilik_tarihi IS NULL;

-- Trigger oluştur: gecerlilik_tarihi değiştiğinde son_gecerlilik_tarihi'ni güncelle
CREATE OR REPLACE FUNCTION sync_teklifler_columns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.son_gecerlilik_tarihi = COALESCE(NEW.son_gecerlilik_tarihi, NEW.gecerlilik_tarihi);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_teklifler_columns ON teklifler;
CREATE TRIGGER trigger_sync_teklifler_columns
BEFORE INSERT OR UPDATE ON teklifler
FOR EACH ROW
EXECUTE FUNCTION sync_teklifler_columns();

-- 3. SİPARİŞLER TABLOSUNA KOLON EKLE
ALTER TABLE siparisler 
ADD COLUMN IF NOT EXISTS fiyat DECIMAL(15, 2);

-- Mevcut verileri senkronize et
UPDATE siparisler 
SET fiyat = genel_toplam
WHERE fiyat IS NULL;

-- Trigger oluştur: genel_toplam değiştiğinde fiyat'ı güncelle
CREATE OR REPLACE FUNCTION sync_siparisler_columns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fiyat = COALESCE(NEW.fiyat, NEW.genel_toplam);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_siparisler_columns ON siparisler;
CREATE TRIGGER trigger_sync_siparisler_columns
BEFORE INSERT OR UPDATE ON siparisler
FOR EACH ROW
EXECUTE FUNCTION sync_siparisler_columns();

-- =====================================================
-- NOT: Bu migration çalıştırıldıktan sonra
-- ciftlikController.js dosyasındaki alias'lar kaldırılmalı
-- =====================================================

