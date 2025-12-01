-- Telefon kolonu kontrol sorgusu
-- Migration çalıştırılmış mı kontrol et

-- 1. ciftlik_basvurulari tablosunda telefon kolonu var mı?
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ciftlik_basvurulari' 
  AND column_name = 'telefon';

-- 2. Kullanıcı telefon bilgilerini kontrol et
SELECT 
    k.id,
    k.ad,
    k.soyad,
    k.eposta,
    k.telefon as kullanici_telefon,
    cb.id as basvuru_id,
    cb.ciftlik_adi,
    cb.telefon as basvuru_telefon,
    COALESCE(NULLIF(cb.telefon, ''), k.telefon, '') as son_telefon
FROM kullanicilar k
LEFT JOIN ciftlik_basvurulari cb ON k.id = cb.kullanici_id
WHERE k.telefon IS NOT NULL 
  AND k.telefon != ''
LIMIT 5;

-- 3. Migration çalıştırılmışsa bu sorgu çalışır
-- Migration çalıştırılmamışsa hata verecektir
-- Bu durumda migration_add_telefon_ciftlik_basvurulari.sql dosyasını çalıştırın




