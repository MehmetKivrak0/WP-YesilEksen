-- Çiftlikler tablosundaki onay bekleyen çiftlikleri getiren SQL sorgusu

-- Basit sorgu (sadece çiftlikler)
SELECT * 
FROM ciftlikler 
WHERE durum = 'beklemede' 
AND silinme IS NULL
ORDER BY olusturma DESC;

-- Detaylı sorgu (kullanıcı bilgileriyle birlikte)
SELECT 
    c.id,
    c.ad as ciftlik_adi,
    c.kullanici_id,
    k.ad || ' ' || k.soyad as kullanici_adi,
    k.eposta,
    k.telefon,
    c.adres,
    c.durum,
    c.olusturma,
    c.guncelleme
FROM ciftlikler c
JOIN kullanicilar k ON c.kullanici_id = k.id
WHERE c.durum = 'beklemede' 
AND c.silinme IS NULL
ORDER BY c.olusturma DESC;




