-- =====================================================
-- DENETİM SİSTEMİ KONTROL SORGUSU
-- =====================================================
-- Bu sorgu denetim sistemi ile ilgili tüm tabloları,
-- kolonları, index'leri ve trigger'ları kontrol eder.
-- Tarih: 2024-12-XX
-- =====================================================
-- 
-- Kullanım: Bu sorguyu çalıştırarak denetim ile ilgili
-- hangi yapıların hala veritabanında olduğunu görebilirsiniz.
-- =====================================================

-- =====================================================
-- 1. DENETİM TABLOLARINI KONTROL ET
-- =====================================================

SELECT 
    'TABLO KONTROLÜ' as kontrol_tipi,
    table_name as ad,
    CASE 
        WHEN table_name IN ('denetim_kategorileri', 'denetim_maddeleri', 'denetimler', 'denetim_sonuclari') 
        THEN '❌ HALA VAR - SİLİNMELİ' 
        ELSE '✅ YOK' 
    END as durum
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('denetim_kategorileri', 'denetim_maddeleri', 'denetimler', 'denetim_sonuclari')
ORDER BY table_name;

-- =====================================================
-- 2. CİFTLİK_BASVURULARI TABLOSUNDAKİ DENETİM KOLONLARINI KONTROL ET
-- =====================================================

SELECT 
    'CİFTLİK_BASVURULARI KOLON KONTROLÜ' as kontrol_tipi,
    column_name as ad,
    data_type as tip,
    CASE 
        WHEN column_name IN ('denetim_tarihi', 'denetci_id') 
        THEN '❌ HALA VAR - SİLİNMELİ' 
        ELSE '✅ YOK' 
    END as durum
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'ciftlik_basvurulari'
    AND column_name IN ('denetim_tarihi', 'denetci_id')
ORDER BY column_name;

-- =====================================================
-- 3. FİRMA_BASVURULARI TABLOSUNDAKİ DENETİM KOLONLARINI KONTROL ET
-- =====================================================

SELECT 
    'FİRMA_BASVURULARI KOLON KONTROLÜ' as kontrol_tipi,
    column_name as ad,
    data_type as tip,
    CASE 
        WHEN column_name IN ('denetim_tarihi', 'denetci_id') 
        THEN '❌ HALA VAR - SİLİNMELİ' 
        ELSE '✅ YOK' 
    END as durum
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'firma_basvurulari'
    AND column_name IN ('denetim_tarihi', 'denetci_id')
ORDER BY column_name;

-- =====================================================
-- 4. DENETİM İNDEX'LERİNİ KONTROL ET
-- =====================================================

SELECT 
    'İNDEX KONTROLÜ' as kontrol_tipi,
    indexname as ad,
    tablename as tablo_adi,
    CASE 
        WHEN indexname LIKE 'idx_denetimler%' 
        THEN '❌ HALA VAR - SİLİNMELİ' 
        ELSE '✅ YOK' 
    END as durum
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_denetimler_ciftlik',
        'idx_denetimler_firma',
        'idx_denetimler_denetci',
        'idx_denetimler_tarih'
    )
ORDER BY indexname;

-- =====================================================
-- 5. DENETİM TRİGGER'LARINI KONTROL ET
-- =====================================================

SELECT 
    'TRİGGER KONTROLÜ' as kontrol_tipi,
    trigger_name as ad,
    event_object_table as tablo_adi,
    CASE 
        WHEN trigger_name = 'trg_denetimler_guncelleme' 
        THEN '❌ HALA VAR - SİLİNMELİ' 
        ELSE '✅ YOK' 
    END as durum
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name = 'trg_denetimler_guncelleme'
ORDER BY trigger_name;

-- =====================================================
-- 6. ÖZET RAPOR (TÜM KONTROLLERİ BİRLEŞTİR)
-- =====================================================

-- Tablolar
SELECT 
    'TABLO' as yapi_tipi,
    COUNT(*) as kalan_sayisi,
    STRING_AGG(table_name, ', ') as kalan_isimler
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('denetim_kategorileri', 'denetim_maddeleri', 'denetimler', 'denetim_sonuclari')

UNION ALL

-- ciftlik_basvurulari kolonları
SELECT 
    'CİFTLİK_BASVURULARI KOLON' as yapi_tipi,
    COUNT(*) as kalan_sayisi,
    STRING_AGG(column_name, ', ') as kalan_isimler
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'ciftlik_basvurulari'
    AND column_name IN ('denetim_tarihi', 'denetci_id')

UNION ALL

-- firma_basvurulari kolonları
SELECT 
    'FİRMA_BASVURULARI KOLON' as yapi_tipi,
    COUNT(*) as kalan_sayisi,
    STRING_AGG(column_name, ', ') as kalan_isimler
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'firma_basvurulari'
    AND column_name IN ('denetim_tarihi', 'denetci_id')

UNION ALL

-- Index'ler
SELECT 
    'İNDEX' as yapi_tipi,
    COUNT(*) as kalan_sayisi,
    STRING_AGG(indexname, ', ') as kalan_isimler
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_denetimler_ciftlik',
        'idx_denetimler_firma',
        'idx_denetimler_denetci',
        'idx_denetimler_tarih'
    )

UNION ALL

-- Trigger'lar
SELECT 
    'TRİGGER' as yapi_tipi,
    COUNT(*) as kalan_sayisi,
    STRING_AGG(trigger_name, ', ') as kalan_isimler
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name = 'trg_denetimler_guncelleme';

-- =====================================================
-- 7. DETAYLI KONTROL (TÜM DENETİM İLE İLGİLİ YAPILAR)
-- =====================================================

-- Tüm denetim ile ilgili tabloları listele
SELECT 
    'TABLO' as yapi_tipi,
    table_name as ad,
    'public' as schema_adi
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name LIKE '%denetim%' 
        OR table_name LIKE '%Denetim%'
    )
ORDER BY table_name;

-- Tüm denetim ile ilgili kolonları listele
SELECT 
    'KOLON' as yapi_tipi,
    table_name as tablo_adi,
    column_name as ad,
    data_type as tip
FROM information_schema.columns
WHERE table_schema = 'public'
    AND (
        column_name LIKE '%denetim%' 
        OR column_name LIKE '%Denetim%'
        OR column_name LIKE '%denetci%'
        OR column_name LIKE '%Denetci%'
    )
ORDER BY table_name, column_name;

-- Tüm denetim ile ilgili index'leri listele
SELECT 
    'İNDEX' as yapi_tipi,
    indexname as ad,
    tablename as tablo_adi
FROM pg_indexes
WHERE schemaname = 'public'
    AND (
        indexname LIKE '%denetim%' 
        OR indexname LIKE '%Denetim%'
    )
ORDER BY indexname;

-- Tüm denetim ile ilgili trigger'ları listele
SELECT 
    'TRİGGER' as yapi_tipi,
    trigger_name as ad,
    event_object_table as tablo_adi
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND (
        trigger_name LIKE '%denetim%' 
        OR trigger_name LIKE '%Denetim%'
    )
ORDER BY trigger_name;

-- =====================================================
-- 8. SONUÇ YORUMU
-- =====================================================

-- Eğer hiçbir sonuç dönmüyorsa, tüm denetim yapıları başarıyla kaldırılmış demektir.
-- Eğer sonuçlar varsa, migration SQL dosyasını çalıştırmanız gerekir.

