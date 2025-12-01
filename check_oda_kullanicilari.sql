-- oda_kullanicilari tablosunun varlığını kontrol et
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'oda_kullanicilari';

-- Eğer tablo varsa, içindeki kayıtları göster
SELECT 
    ok.id,
    ok.kullanici_id,
    ok.oda_tipi,
    ok.sartlar_kabul,
    k.eposta,
    k.rol,
    k.durum
FROM oda_kullanicilari ok
JOIN kullanicilar k ON ok.kullanici_id = k.id
LIMIT 10;




