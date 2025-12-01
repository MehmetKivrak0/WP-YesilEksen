-- Log tablolarını kontrol et
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('aktiviteler', 'detayli_aktiviteler', 'degisiklik_loglari') 
        THEN '✅ VAR'
        ELSE '❌ YOK'
    END as durum
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('aktiviteler', 'detayli_aktiviteler', 'degisiklik_loglari')
ORDER BY table_name;

-- Eğer tablolar yoksa, oluşturma sorguları:
-- 1. aktiviteler tablosu
CREATE TABLE IF NOT EXISTS aktiviteler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID REFERENCES kullanicilar(id) ON DELETE SET NULL,
    tip VARCHAR(50) NOT NULL,
    varlik_tipi VARCHAR(100),
    varlik_id UUID,
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    ip_adresi INET,
    user_agent TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. detayli_aktiviteler tablosu
CREATE TABLE IF NOT EXISTS detayli_aktiviteler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori VARCHAR(50) NOT NULL,
    kullanici_id UUID REFERENCES kullanicilar(id) ON DELETE SET NULL,
    rol VARCHAR(50),
    islem_tipi VARCHAR(100) NOT NULL,
    hedef_tipi VARCHAR(100),
    hedef_id UUID,
    onceki_durum VARCHAR(100),
    sonraki_durum VARCHAR(100),
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    gonderilen_mesaj TEXT,
    etkilenen_kullanici_id UUID REFERENCES kullanicilar(id),
    ip_adresi INET,
    user_agent TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. degisiklik_loglari tablosu
CREATE TABLE IF NOT EXISTS degisiklik_loglari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    varlik_tipi VARCHAR(100) NOT NULL,
    varlik_id UUID NOT NULL,
    alan_adi VARCHAR(100) NOT NULL,
    eski_deger TEXT,
    yeni_deger TEXT,
    sebep TEXT,
    degistiren_id UUID REFERENCES kullanicilar(id),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_aktiviteler_varlik ON aktiviteler(varlik_tipi, varlik_id);
CREATE INDEX IF NOT EXISTS idx_aktiviteler_kullanici ON aktiviteler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_aktiviteler_olusturma ON aktiviteler(olusturma DESC);

CREATE INDEX IF NOT EXISTS idx_detayli_aktiviteler_hedef ON detayli_aktiviteler(hedef_tipi, hedef_id);
CREATE INDEX IF NOT EXISTS idx_detayli_aktiviteler_kullanici ON detayli_aktiviteler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_detayli_aktiviteler_olusturma ON detayli_aktiviteler(olusturma DESC);

CREATE INDEX IF NOT EXISTS idx_degisiklik_loglari_varlik ON degisiklik_loglari(varlik_tipi, varlik_id);
CREATE INDEX IF NOT EXISTS idx_degisiklik_loglari_degistiren ON degisiklik_loglari(degistiren_id);
CREATE INDEX IF NOT EXISTS idx_degisiklik_loglari_olusturma ON degisiklik_loglari(olusturma DESC);

