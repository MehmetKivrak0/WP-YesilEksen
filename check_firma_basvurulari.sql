-- Firma başvurularını kontrol et
SELECT 
    id,
    firma_adi,
    basvuran_adi,
    durum,
    basvuru_tarihi,
    kullanici_id
FROM firma_basvurulari
ORDER BY basvuru_tarihi DESC
LIMIT 10;

-- Son kayıtları kontrol et
SELECT 
    COUNT(*) as toplam_basvuru,
    COUNT(*) FILTER (WHERE durum = 'beklemede') as beklemede,
    COUNT(*) FILTER (WHERE durum = 'onaylandi') as onaylandi,
    COUNT(*) FILTER (WHERE durum = 'reddedildi') as reddedildi
FROM firma_basvurulari;

