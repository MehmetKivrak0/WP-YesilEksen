-- =====================================================
-- MIGRATION: oda_kullanicilari Tablosunu Kaldırma
-- Tarih: 2024
-- Açıklama: Normalizasyon ihlali nedeniyle oda_kullanicilari tablosu kaldırılıyor
-- =====================================================

-- NEDEN KALDIRILIYOR?
-- 1. Veri tekrarı: sartlar_kabul hem kullanicilar hem oda_kullanicilari'nda
-- 2. Türetilmiş veri: oda_tipi sadece rol'den türetilebilir
--    - rol = 'ziraat_yoneticisi' → oda_tipi = 'ziraat'
--    - rol = 'sanayi_yoneticisi' → oda_tipi = 'sanayi'
-- 3. Veri tutarsızlığı riski: rol ve oda_tipi arasında uyumsuzluk olabilir
-- 4. Gereksiz JOIN: Her sorguda ekstra JOIN gerekiyor

-- NOT: Bu migration çalıştırılmadan önce:
-- 1. Backend kodunda oda_kullanicilari kullanımları kaldırıldı
-- 2. Veritabanında oda_kullanicilari tablosu kullanılmıyor

-- =====================================================
-- 1. VERİ KONTROLÜ (Opsiyonel - veri kaybını önlemek için)
-- =====================================================

-- Oda kullanıcılarını kontrol et
SELECT 
    k.id,
    k.eposta,
    k.rol,
    ok.oda_tipi,
    ok.sartlar_kabul as ok_sartlar_kabul,
    k.sartlar_kabul as k_sartlar_kabul
FROM kullanicilar k
LEFT JOIN oda_kullanicilari ok ON k.id = ok.kullanici_id
WHERE k.rol IN ('ziraat_yoneticisi', 'sanayi_yoneticisi')
ORDER BY k.rol, k.eposta;

-- =====================================================
-- 2. VERİ TUTARLILIĞI KONTROLÜ
-- =====================================================

-- Rol ve oda_tipi arasında tutarsızlık var mı kontrol et
SELECT 
    k.id,
    k.eposta,
    k.rol,
    ok.oda_tipi,
    CASE 
        WHEN k.rol = 'ziraat_yoneticisi' AND ok.oda_tipi != 'ziraat' THEN 'TUTARSIZ'
        WHEN k.rol = 'sanayi_yoneticisi' AND ok.oda_tipi != 'sanayi' THEN 'TUTARSIZ'
        ELSE 'TUTARLI'
    END as durum
FROM kullanicilar k
INNER JOIN oda_kullanicilari ok ON k.id = ok.kullanici_id
WHERE k.rol IN ('ziraat_yoneticisi', 'sanayi_yoneticisi')
AND (
    (k.rol = 'ziraat_yoneticisi' AND ok.oda_tipi != 'ziraat') OR
    (k.rol = 'sanayi_yoneticisi' AND ok.oda_tipi != 'sanayi')
);

-- =====================================================
-- 3. TABLOYU KALDIR
-- =====================================================

-- DROP TABLE (CASCADE ile foreign key'leri de kaldırır)
DROP TABLE IF EXISTS oda_kullanicilari CASCADE;

-- =====================================================
-- 4. DOĞRULAMA
-- =====================================================

-- Tablo kaldırıldı mı kontrol et
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'oda_kullanicilari';

-- Oda yöneticileri hala kullanicilar tablosunda var mı kontrol et
SELECT 
    id,
    eposta,
    rol,
    durum,
    sartlar_kabul,
    sartlar_kabul_tarihi
FROM kullanicilar
WHERE rol IN ('ziraat_yoneticisi', 'sanayi_yoneticisi')
ORDER BY rol, eposta;

-- =====================================================
-- NOTLAR
-- =====================================================

-- Artık oda_tipi bilgisi rol'den türetilebilir:
-- 
-- SELECT 
--     id,
--     eposta,
--     rol,
--     CASE 
--         WHEN rol = 'ziraat_yoneticisi' THEN 'ziraat'
--         WHEN rol = 'sanayi_yoneticisi' THEN 'sanayi'
--         ELSE NULL
--     END as oda_tipi
-- FROM kullanicilar
-- WHERE rol IN ('ziraat_yoneticisi', 'sanayi_yoneticisi');




