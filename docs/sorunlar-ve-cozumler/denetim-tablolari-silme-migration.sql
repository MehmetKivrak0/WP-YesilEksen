-- =====================================================
-- DENETİM SİSTEMİ KALDIRMA MİGRATİON
-- =====================================================
-- Bu dosya denetim sistemi ile ilgili tüm tabloları,
-- kolonları, index'leri ve trigger'ları kaldırır.
-- Tarih: 2024-12-XX
-- =====================================================
-- 
-- UYARI: Bu migration geri alınamaz (irreversible)!
-- Çalıştırmadan önce mutlaka veritabanı yedeği alın!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DENETİM TABLOLARINI SİL
-- =====================================================
-- Bağımlılık sırasına göre silme (en bağımlı olandan başla)

-- 1.1. Denetim Sonuçları (en bağımlı tablo)
DROP TABLE IF EXISTS denetim_sonuclari CASCADE;

-- 1.2. Denetimler (denetim_sonuclari'na bağımlı)
DROP TABLE IF EXISTS denetimler CASCADE;

-- 1.3. Denetim Maddeleri (denetim_sonuclari'na bağımlı)
DROP TABLE IF EXISTS denetim_maddeleri CASCADE;

-- 1.4. Denetim Kategorileri (denetim_maddeleri'ne bağımlı)
DROP TABLE IF EXISTS denetim_kategorileri CASCADE;

-- =====================================================
-- 2. DENETİM İNDEX'LERİNİ SİL
-- =====================================================
-- Tablolar silindiği için index'ler otomatik silinir,
-- ama yine de manuel olarak silmek iyi bir pratiktir

DROP INDEX IF EXISTS idx_denetimler_ciftlik;
DROP INDEX IF EXISTS idx_denetimler_firma;
DROP INDEX IF EXISTS idx_denetimler_denetci;
DROP INDEX IF EXISTS idx_denetimler_tarih;

-- =====================================================
-- 3. DENETİM TRİGGER'INI SİL
-- =====================================================
-- Tablo silindiği için trigger otomatik silinir,
-- ama yine de manuel olarak silmek iyi bir pratiktir

DROP TRIGGER IF EXISTS trg_denetimler_guncelleme ON denetimler;

-- =====================================================
-- 4. CİFTLİK_BASVURULARI TABLOSUNDAN DENETİM KOLONLARINI SİL
-- =====================================================

ALTER TABLE IF EXISTS ciftlik_basvurulari 
DROP COLUMN IF EXISTS denetim_tarihi,
DROP COLUMN IF EXISTS denetci_id;

-- =====================================================
-- 5. FİRMA_BASVURULARI TABLOSUNDAN DENETİM KOLONLARINI SİL
-- =====================================================

ALTER TABLE IF EXISTS firma_basvurulari 
DROP COLUMN IF EXISTS denetim_tarihi,
DROP COLUMN IF EXISTS denetci_id;

-- =====================================================
-- 6. VERİTABANI YORUMLARINI GÜNCELLE (OPSİYONEL)
-- =====================================================
-- Tablo yorumlarını kaldır (eğer varsa)
-- Not: Tablolar silindiği için bu komutlar hata verebilir, 
-- ama IF EXISTS benzeri bir kontrol yok, bu yüzden hata durumunda 
-- devam eder (tablo zaten yok)

DO $$
BEGIN
    -- Yorumları kaldırmaya çalış, hata olsa bile devam et
    BEGIN
        COMMENT ON TABLE denetim_kategorileri IS NULL;
    EXCEPTION WHEN undefined_table THEN
        -- Tablo yoksa devam et
        NULL;
    END;
    
    BEGIN
        COMMENT ON TABLE denetim_maddeleri IS NULL;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;
    
    BEGIN
        COMMENT ON TABLE denetimler IS NULL;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;
    
    BEGIN
        COMMENT ON TABLE denetim_sonuclari IS NULL;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;
END $$;

-- =====================================================
-- 7. İŞLEM ONAYI
-- =====================================================

COMMIT;

-- =====================================================
-- NOTLAR VE UYARILAR
-- =====================================================
-- 
-- ⚠️ ÖNEMLİ UYARILAR:
-- 
-- 1. Bu migration çalıştırılmadan önce MUTLAKA veritabanı yedeği alınmalıdır
-- 2. CASCADE kullanıldığı için bağımlı tablolar otomatik silinir
-- 3. IF EXISTS kullanıldığı için tablo/index/trigger yoksa hata vermez
-- 4. Production ortamında uygulanmadan önce test ortamında test edilmelidir
-- 5. Bu işlem geri alınamaz (irreversible) - veriler kalıcı olarak silinir
-- 
-- ✅ KONTROL LİSTESİ:
-- 
-- [ ] Veritabanı yedeği alındı
-- [ ] Test ortamında test edildi
-- [ ] Tüm bağımlılıklar kontrol edildi
-- [ ] Production'a uygulanmadan önce onay alındı
-- 
-- 📋 SİLİNEN ÖĞELER:
-- 
-- Tablolar:
--   - denetim_kategorileri
--   - denetim_maddeleri
--   - denetimler
--   - denetim_sonuclari
-- 
-- Kolonlar:
--   - ciftlik_basvurulari.denetim_tarihi
--   - ciftlik_basvurulari.denetci_id
--   - firma_basvurulari.denetim_tarihi
--   - firma_basvurulari.denetci_id
-- 
-- Index'ler:
--   - idx_denetimler_ciftlik
--   - idx_denetimler_firma
--   - idx_denetimler_denetci
--   - idx_denetimler_tarih
-- 
-- Trigger'lar:
--   - trg_denetimler_guncelleme
-- 
-- =====================================================

