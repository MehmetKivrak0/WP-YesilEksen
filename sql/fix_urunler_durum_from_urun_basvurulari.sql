-- urun_basvurulari tablosunda durumu 'onaylandi' olan ama urunler tablosunda durumu hala 'onay_bekliyor' olan ürünleri düzelt
-- Bu script, mevcut verilerdeki uyumsuzlukları giderir

-- 1. urun_id ile eşleşen kayıtları güncelle
UPDATE urunler u
SET durum = 'aktif',
    guncelleme = CURRENT_TIMESTAMP
FROM urun_basvurulari ub
WHERE u.id = ub.urun_id
  AND ub.durum = 'onaylandi'
  AND u.durum = 'onay_bekliyor';

-- 2. urun_id olmayan ama urun_adi ve ciftlik_id ile eşleşen kayıtları güncelle
UPDATE urunler u
SET durum = 'aktif',
    guncelleme = CURRENT_TIMESTAMP
FROM urun_basvurulari ub
WHERE ub.urun_id IS NULL
  AND u.ciftlik_id = ub.ciftlik_id
  AND (u.baslik = ub.urun_adi OR u.ad = ub.urun_adi)
  AND ub.durum = 'onaylandi'
  AND u.durum = 'onay_bekliyor'
  AND NOT EXISTS (
    SELECT 1 FROM urun_basvurulari ub2 
    WHERE ub2.urun_id = u.id 
      AND ub2.durum != 'onaylandi'
  );

-- 3. urun_basvurulari tablosunda urun_id'yi güncelle (eğer null ise)
UPDATE urun_basvurulari ub
SET urun_id = u.id
FROM urunler u
WHERE ub.urun_id IS NULL
  AND ub.ciftlik_id = u.ciftlik_id
  AND (u.baslik = ub.urun_adi OR u.ad = ub.urun_adi)
  AND ub.durum = 'onaylandi'
  AND u.durum = 'aktif';

-- Kontrol sorgusu: Kaç ürün güncellendi?
SELECT 
    COUNT(*) as guncellenen_urun_sayisi,
    COUNT(DISTINCT ub.id) as onaylanmis_basvuru_sayisi
FROM urunler u
JOIN urun_basvurulari ub ON u.id = ub.urun_id
WHERE ub.durum = 'onaylandi'
  AND u.durum = 'aktif';

