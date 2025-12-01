-- =====================================================
-- YEŞİL-EKSEN TARIMSAL ATIK YÖNETİM SİSTEMİ
-- BİRLEŞTİRİLMİŞ VERİTABANI KURULUM DOSYASI
-- Tüm tablolar, seed data ve oda kullanıcıları dahil
-- PostgreSQL 14+ - 3NF/BCNF - 52 TABLO
-- =====================================================

-- Extension'ları aktifleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TEMEL REFERANS TABLOLARI
-- =====================================================

-- Roller
CREATE TYPE rol_tipi AS ENUM ('ciftci', 'firma', 'ziraat_yoneticisi', 'sanayi_yoneticisi', 'super_yonetici');

-- Durumlar
CREATE TYPE durum_tipi AS ENUM ('aktif', 'beklemede', 'askida', 'pasif', 'iptal', 'silindi');

-- Sektörler
CREATE TABLE sektorler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(20) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sertifika Türleri
CREATE TABLE sertifika_turleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(30) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    gecerlilik_suresi INTEGER, -- Ay olarak
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Şehirler
CREATE TABLE sehirler (
    id SMALLINT PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    bolge VARCHAR(50)
);

-- Ürün Kategorileri
CREATE TABLE urun_kategorileri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(20) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    ust_kategori_id UUID REFERENCES urun_kategorileri(id),
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atık Türleri
CREATE TABLE atik_turleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(20) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Birimler
CREATE TABLE birimler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(10) UNIQUE NOT NULL, -- 'ton', 'kg', 'm3', 'lt'
    ad VARCHAR(50) NOT NULL,
    sembol VARCHAR(10) NOT NULL,
    tur VARCHAR(20), -- 'agirlik', 'hacim', 'adet'
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. KULLANICI YÖNETİMİ
-- =====================================================

-- Kullanıcılar
CREATE TABLE kullanicilar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    eposta VARCHAR(255) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255),
    telefon VARCHAR(20),
    rol rol_tipi NOT NULL,
    durum durum_tipi DEFAULT 'beklemede',
    eposta_dogrulandi BOOLEAN DEFAULT FALSE,
    eposta_dogrulama_token VARCHAR(255),
    sifre_sifirlama_token VARCHAR(255),
    sifre_sifirlama_gecerlilik TIMESTAMP,
    son_giris TIMESTAMP,
    avatar_url TEXT,
    sartlar_kabul BOOLEAN DEFAULT FALSE,
    sartlar_kabul_tarihi TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    silinme TIMESTAMP
);

-- Sosyal Medya Bağlantıları (Frontend'de kullanılıyor!)
CREATE TABLE kullanici_sosyal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    saglayici VARCHAR(20) NOT NULL, -- 'github', 'linkedin', 'google'
    saglayici_id VARCHAR(255) NOT NULL,
    profil_url TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(saglayici, saglayici_id)
);

-- Oda Kullanıcıları Tablosu
-- /iamgroot sayfasından kayıt olan ziraat ve sanayi odası yöneticileri için
-- Oda Kullanıcıları Tablosu (Normalize edilmiş yapı)
-- Foreign key ile kullanicilar tablosuna bağlı
-- Sadece oda yöneticilerine özel bilgileri tutar (oda_tipi)
-- Diğer bilgiler (ad, soyad, email, şifre) kullanicilar tablosunda
CREATE TABLE oda_kullanicilari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID NOT NULL UNIQUE REFERENCES kullanicilar(id) ON DELETE CASCADE,
    oda_tipi VARCHAR(20) NOT NULL CHECK (oda_tipi IN ('ziraat', 'sanayi')),
    sartlar_kabul BOOLEAN DEFAULT FALSE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. ÇİFTLİK YÖNETİMİ
-- =====================================================

-- Çiftlikler
CREATE TABLE ciftlikler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    ad VARCHAR(200) NOT NULL,
    kayit_no VARCHAR(100) UNIQUE,
    telefon VARCHAR(20),
    adres TEXT NOT NULL,
    sehir_id SMALLINT REFERENCES sehirler(id),
    enlem DECIMAL(10, 8),
    boylam DECIMAL(11, 8),
    alan DECIMAL(10, 2), -- Hektar
    durum durum_tipi DEFAULT 'beklemede',
    kayit_tarihi DATE,
    yillik_gelir DECIMAL(15, 2),
    uretim_kapasitesi DECIMAL(10, 2),
    organik BOOLEAN DEFAULT FALSE,
    iyi_tarim BOOLEAN DEFAULT FALSE,
    aciklama TEXT,
    website VARCHAR(255),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    silinme TIMESTAMP
);

-- Çiftlik Sertifikaları
CREATE TABLE ciftlik_sertifikalari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id) ON DELETE CASCADE,
    sertifika_turu_id UUID NOT NULL REFERENCES sertifika_turleri(id),
    sertifika_no VARCHAR(100),
    veren_kurum VARCHAR(255),
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE,
    suresiz BOOLEAN DEFAULT FALSE,
    dosya_url TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ciftlik_id, sertifika_turu_id, sertifika_no)
);

-- Çiftlik Atık Kapasiteleri
CREATE TABLE ciftlik_atik_kapasiteleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id) ON DELETE CASCADE,
    atik_turu_id UUID NOT NULL REFERENCES atik_turleri(id),
    kapasite DECIMAL(10, 2) NOT NULL,
    birim_id UUID NOT NULL REFERENCES birimler(id),
    periyot VARCHAR(20), -- 'yillik', 'aylik'
    aciklama TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ciftlik_id, atik_turu_id)
);

-- Çiftlik Başvuruları (Frontend'de kullanılıyor!)
CREATE TABLE ciftlik_basvurulari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID REFERENCES ciftlikler(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    ciftlik_adi VARCHAR(200) NOT NULL,
    sahip_adi VARCHAR(200) NOT NULL,
    konum VARCHAR(255) NOT NULL,
    durum VARCHAR(50) DEFAULT 'ilk_inceleme',
    notlar TEXT,
    red_nedeni TEXT,
    basvuru_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inceleme_tarihi TIMESTAMP,
    inceleyen_id UUID REFERENCES kullanicilar(id),
    onay_tarihi TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. FİRMA YÖNETİMİ
-- =====================================================

-- Firmalar
CREATE TABLE firmalar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    ad VARCHAR(255) NOT NULL,
    vergi_no VARCHAR(50) UNIQUE NOT NULL,
    ticaret_sicil_no VARCHAR(100),
    telefon VARCHAR(20),
    adres TEXT NOT NULL,
    sehir_id SMALLINT REFERENCES sehirler(id),
    enlem DECIMAL(10, 8),
    boylam DECIMAL(11, 8),
    sektor_id UUID REFERENCES sektorler(id),
    durum durum_tipi DEFAULT 'beklemede',
    dogrulandi BOOLEAN DEFAULT FALSE,
    dogrulama_tarihi TIMESTAMP,
    dogrulayen_id UUID REFERENCES kullanicilar(id),
    website VARCHAR(255),
    aciklama TEXT,
    calisan_sayisi INTEGER,
    kurulus_yili INTEGER,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    silinme TIMESTAMP
);

-- Firma Sertifikaları
CREATE TABLE firma_sertifikalari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firma_id UUID NOT NULL REFERENCES firmalar(id) ON DELETE CASCADE,
    sertifika_turu_id UUID NOT NULL REFERENCES sertifika_turleri(id),
    sertifika_no VARCHAR(100),
    veren_kurum VARCHAR(255),
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE,
    suresiz BOOLEAN DEFAULT FALSE,
    dosya_url TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firma_id, sertifika_turu_id, sertifika_no)
);

-- Firma Başvuruları (Frontend'de firma_basvuru_durum.tsx kullanıyor!)
-- durum: 'beklemede', 'incelemede', 'onaylandi', 'reddedildi', 'eksik_evrak'
-- notlar: Sanayi Odası'nın genel başvuru hakkındaki mesajı (Frontend'de adminNotes olarak gösteriliyor)
-- Belgeler ayrı ayrı belgeler tablosunda tutulur ve belge bazında onaylanır
CREATE TABLE firma_basvurulari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firma_id UUID REFERENCES firmalar(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    firma_adi VARCHAR(255) NOT NULL,
    basvuran_adi VARCHAR(200) NOT NULL,
    sektor_id UUID REFERENCES sektorler(id),
    durum VARCHAR(50) DEFAULT 'beklemede', -- Genel başvuru durumu
    vergi_no VARCHAR(50),
    telefon VARCHAR(20),
    eposta VARCHAR(255),
    adres TEXT,
    aciklama TEXT,
    notlar TEXT, -- Sanayi Odası'nın genel mesajı
    red_nedeni TEXT, -- Başvuru reddedilme nedeni
    basvuru_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inceleme_tarihi TIMESTAMP,
    inceleyen_id UUID REFERENCES kullanicilar(id),
    onay_tarihi TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Frontend'de lastUpdate olarak gösteriliyor
);

-- =====================================================
-- 5. ÜRÜN YÖNETİMİ
-- =====================================================

-- Ürünler (Frontend'de urunlerim.tsx kullanıyor!)
-- durum: 'aktif', 'onay_bekliyor', 'satildi', 'pasif', 'stokta'
-- goruntulenme: Ürünün görüntülenme sayısı (Frontend'de gösteriliyor)
-- Teklif sayısı teklifler tablosundan hesaplanır (COUNT ile)
CREATE TABLE urunler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id) ON DELETE CASCADE,
    kategori_id UUID NOT NULL REFERENCES urun_kategorileri(id),
    ad VARCHAR(200) NOT NULL,
    aciklama TEXT,
    birim_id UUID NOT NULL REFERENCES birimler(id),
    birim_fiyat DECIMAL(12, 2),
    mevcut_miktar DECIMAL(10, 2),
    min_siparis_miktari DECIMAL(10, 2),
    durum VARCHAR(50) DEFAULT 'stokta', -- Ürün durumu
    onerilir BOOLEAN DEFAULT FALSE,
    goruntulenme INTEGER DEFAULT 0, -- Görüntülenme sayısı
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    silinme TIMESTAMP
);

-- Ürün Resimleri
CREATE TABLE urun_resimleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urun_id UUID NOT NULL REFERENCES urunler(id) ON DELETE CASCADE,
    resim_url TEXT NOT NULL,
    sira_no INTEGER DEFAULT 0,
    baslik VARCHAR(255),
    ana_resim BOOLEAN DEFAULT FALSE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ürün Özellikleri
CREATE TABLE urun_ozellikleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urun_id UUID NOT NULL REFERENCES urunler(id) ON DELETE CASCADE,
    anahtar VARCHAR(100) NOT NULL,
    deger VARCHAR(255) NOT NULL,
    birim VARCHAR(50),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(urun_id, anahtar)
);

-- Ürün Sertifikaları
CREATE TABLE urun_sertifikalari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urun_id UUID NOT NULL REFERENCES urunler(id) ON DELETE CASCADE,
    sertifika_turu_id UUID NOT NULL REFERENCES sertifika_turleri(id),
    sertifika_no VARCHAR(100),
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    dosya_url TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ürün Başvuruları (Frontend'de urun_durum.tsx kullanıyor!)
-- durum: 'incelemede', 'onaylandi', 'revizyon', 'reddedildi'
-- notlar: Admin'in genel başvuru hakkındaki notu (Frontend'de adminNotes olarak gösteriliyor)
-- Belgeler ayrı ayrı belgeler tablosunda tutulur ve belge bazında onaylanır
CREATE TABLE urun_basvurulari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urun_id UUID REFERENCES urunler(id) ON DELETE CASCADE,
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id) ON DELETE CASCADE,
    basvuran_adi VARCHAR(200) NOT NULL,
    urun_adi VARCHAR(200) NOT NULL,
    kategori_id UUID NOT NULL REFERENCES urun_kategorileri(id),
    durum VARCHAR(50) DEFAULT 'incelemede', -- Genel başvuru durumu
    notlar TEXT, -- Admin'in genel notu
    red_nedeni TEXT, -- Başvuru reddedilme nedeni
    basvuru_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inceleme_tarihi TIMESTAMP,
    inceleyen_id UUID REFERENCES kullanicilar(id),
    onay_tarihi TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Frontend'de lastUpdate olarak gösteriliyor
);

-- =====================================================
-- 6. BELGE YÖNETİMİ
-- =====================================================

-- Belge Türleri
CREATE TABLE belge_turleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(50) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    gecerlilik_suresi INTEGER, -- Ay olarak
    zorunlu BOOLEAN DEFAULT TRUE, -- Belgenin zorunlu olup olmadığı
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Belgeler (Başvurulara bağlı belgeler - urun_basvurulari, firma_basvurulari, ciftlik_basvurulari)
-- Her belge ayrı ayrı onaylanır, reddedilir veya eksik olarak işaretlenir
-- durum: 'beklemede', 'onaylandi', 'reddedildi', 'eksik'
-- basvuru_tipi: 'urun_basvurusu', 'firma_basvurusu', 'ciftlik_basvurusu'
CREATE TABLE belgeler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    ciftlik_id UUID REFERENCES ciftlikler(id) ON DELETE CASCADE,
    firma_id UUID REFERENCES firmalar(id) ON DELETE CASCADE,
    basvuru_id UUID, -- İlgili başvurunun ID'si
    basvuru_tipi VARCHAR(50), -- Başvuru türü
    belge_turu_id UUID NOT NULL REFERENCES belge_turleri(id),
    ad VARCHAR(255) NOT NULL,
    dosya_yolu TEXT NOT NULL,
    dosya_boyutu INTEGER,
    dosya_tipi VARCHAR(50),
    durum VARCHAR(50) DEFAULT 'beklemede', -- Belge durumu (belge bazında)
    kullanici_notu TEXT,
    yonetici_notu TEXT, -- Admin'in belge hakkındaki notu (Frontend'de adminNote olarak gösteriliyor)
    red_nedeni TEXT, -- Belge reddedilme nedeni
    yuklenme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inceleme_tarihi TIMESTAMP,
    inceleyen_id UUID REFERENCES kullanicilar(id),
    gecerlilik_tarihi DATE,
    zorunlu BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evrak Kontrol Listesi
CREATE TABLE evrak_kontrol (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    belge_turu_id UUID NOT NULL REFERENCES belge_turleri(id),
    gerekli_durum VARCHAR(100),
    zorunlu BOOLEAN DEFAULT TRUE,
    aciklama TEXT,
    ornek_url TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    sira_no INTEGER,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eksik Evraklar
CREATE TABLE eksik_evraklar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    basvuru_id UUID NOT NULL,
    basvuru_tipi VARCHAR(50) NOT NULL,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id),
    belge_turu_id UUID NOT NULL REFERENCES belge_turleri(id),
    eksiklik TEXT,
    son_tarih DATE,
    hatirlatma_gonderildi BOOLEAN DEFAULT FALSE,
    hatirlatma_tarihi TIMESTAMP,
    tamamlandi BOOLEAN DEFAULT FALSE,
    tamamlanma_tarihi TIMESTAMP,
    yuklenen_belge_id UUID REFERENCES belgeler(id),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. TEKLİF & SİPARİŞ SİSTEMİ
-- =====================================================

-- Teklifler
CREATE TABLE teklifler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urun_id UUID NOT NULL REFERENCES urunler(id) ON DELETE CASCADE,
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id) ON DELETE CASCADE,
    firma_id UUID NOT NULL REFERENCES firmalar(id) ON DELETE CASCADE,
    alici_id UUID NOT NULL REFERENCES kullanicilar(id),
    satici_id UUID NOT NULL REFERENCES kullanicilar(id),
    miktar DECIMAL(10, 2) NOT NULL,
    birim_id UUID NOT NULL REFERENCES birimler(id),
    birim_fiyat DECIMAL(12, 2) NOT NULL,
    toplam_fiyat DECIMAL(15, 2) NOT NULL,
    notlar TEXT,
    durum VARCHAR(50) DEFAULT 'beklemede',
    gecerlilik_tarihi DATE,
    yanit_tarihi TIMESTAMP,
    yanit_notu TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Siparişler
CREATE TABLE siparisler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siparis_no VARCHAR(50) UNIQUE NOT NULL,
    teklif_id UUID REFERENCES teklifler(id),
    urun_id UUID NOT NULL REFERENCES urunler(id),
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id),
    firma_id UUID NOT NULL REFERENCES firmalar(id),
    alici_id UUID NOT NULL REFERENCES kullanicilar(id),
    satici_id UUID NOT NULL REFERENCES kullanicilar(id),
    miktar DECIMAL(10, 2) NOT NULL,
    birim_id UUID NOT NULL REFERENCES birimler(id),
    birim_fiyat DECIMAL(12, 2) NOT NULL,
    toplam_fiyat DECIMAL(15, 2) NOT NULL,
    kdv_tutari DECIMAL(12, 2),
    kargo_ucreti DECIMAL(10, 2),
    genel_toplam DECIMAL(15, 2),
    durum VARCHAR(50) DEFAULT 'olusturuldu',
    teslimat_adresi TEXT,
    teslimat_tarihi DATE,
    sevk_tarihi TIMESTAMP,
    teslim_tarihi TIMESTAMP,
    fatura_no VARCHAR(100),
    fatura_tarihi DATE,
    odeme_yontemi VARCHAR(50),
    odeme_durumu VARCHAR(50),
    notlar TEXT,
    iptal_nedeni TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sipariş Durum Geçmişi
CREATE TABLE siparis_durum_gecmisi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siparis_id UUID NOT NULL REFERENCES siparisler(id) ON DELETE CASCADE,
    durum VARCHAR(50) NOT NULL,
    notlar TEXT,
    degistiren_id UUID REFERENCES kullanicilar(id),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. ATIK YÖNETİMİ
-- =====================================================

-- Atık İşlemleri (Frontend'de WasteManagementPage.tsx kullanıyor!)
CREATE TABLE atik_islemleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID NOT NULL REFERENCES ciftlikler(id) ON DELETE CASCADE,
    firma_id UUID REFERENCES firmalar(id) ON DELETE CASCADE,
    urun_id UUID REFERENCES urunler(id),
    atik_turu_id UUID NOT NULL REFERENCES atik_turleri(id),
    miktar DECIMAL(10, 2) NOT NULL,
    birim_id UUID NOT NULL REFERENCES birimler(id),
    islem_tipi VARCHAR(50),
    islem_tarihi DATE NOT NULL,
    fiyat DECIMAL(12, 2),
    aciklama TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Çevre Etki Metrikleri
CREATE TABLE atik_cevre_etkileri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atik_islem_id UUID NOT NULL REFERENCES atik_islemleri(id) ON DELETE CASCADE,
    metrik_adi VARCHAR(100) NOT NULL,
    metrik_degeri DECIMAL(15, 2) NOT NULL,
    birim VARCHAR(50),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. AKTİVİTE & LOG SİSTEMİ
-- =====================================================

-- Aktiviteler
CREATE TABLE aktiviteler (
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

-- Aktivite Metadata
CREATE TABLE aktivite_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aktivite_id UUID NOT NULL REFERENCES aktiviteler(id) ON DELETE CASCADE,
    anahtar VARCHAR(100) NOT NULL,
    deger TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Değişiklik Logları
CREATE TABLE degisiklik_loglari (
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

-- Detaylı Aktiviteler (Sanayi/Ziraat dashboard'ları için)
CREATE TABLE detayli_aktiviteler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori VARCHAR(50) NOT NULL,
    kullanici_id UUID REFERENCES kullanicilar(id) ON DELETE SET NULL,
    rol rol_tipi,
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

-- =====================================================
-- 10. RAPORLAMA SİSTEMİ
-- =====================================================

-- Rapor Türleri
CREATE TABLE rapor_turleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(20) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raporlar (Frontend'de GeneralReportPage.tsx kullanıyor!)
CREATE TABLE raporlar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rapor_turu_id UUID NOT NULL REFERENCES rapor_turleri(id),
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    olusturan_id UUID REFERENCES kullanicilar(id),
    ciftlik_id UUID REFERENCES ciftlikler(id),
    firma_id UUID REFERENCES firmalar(id),
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    dosya_yolu TEXT,
    herkese_acik BOOLEAN DEFAULT FALSE,
    goruntulenme INTEGER DEFAULT 0,
    rapor_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rapor Verileri
CREATE TABLE rapor_verileri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rapor_id UUID NOT NULL REFERENCES raporlar(id) ON DELETE CASCADE,
    veri_anahtari VARCHAR(100) NOT NULL,
    veri_degeri TEXT,
    veri_tipi VARCHAR(50),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SDG Metrikleri (Frontend'de SDGReportPage.tsx kullanıyor!)
CREATE TABLE sdg_metrikleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID REFERENCES ciftlikler(id),
    firma_id UUID REFERENCES firmalar(id),
    metrik_tarihi DATE NOT NULL,
    sdg_hedef_no SMALLINT CHECK (sdg_hedef_no BETWEEN 1 AND 17),
    metrik_adi VARCHAR(200) NOT NULL,
    metrik_degeri DECIMAL(15, 2),
    birim VARCHAR(50),
    aciklama TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. BİLDİRİM & MESAJLAŞMA
-- =====================================================

-- Bildirim Türleri
CREATE TABLE bildirim_turleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kod VARCHAR(30) UNIQUE NOT NULL,
    ad VARCHAR(100) NOT NULL,
    sablon TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bildirimler
CREATE TABLE bildirimler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    bildirim_turu_id UUID NOT NULL REFERENCES bildirim_turleri(id),
    baslik VARCHAR(255) NOT NULL,
    mesaj TEXT NOT NULL,
    link VARCHAR(500),
    okundu BOOLEAN DEFAULT FALSE,
    okunma_tarihi TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bildirim Metadata
CREATE TABLE bildirim_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bildirim_id UUID NOT NULL REFERENCES bildirimler(id) ON DELETE CASCADE,
    anahtar VARCHAR(100) NOT NULL,
    deger TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mesajlar
CREATE TABLE mesajlar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gonderen_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    alici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    konu VARCHAR(255),
    mesaj TEXT NOT NULL,
    okundu BOOLEAN DEFAULT FALSE,
    okunma_tarihi TIMESTAMP,
    ust_mesaj_id UUID REFERENCES mesajlar(id),
    gonderen_sildi BOOLEAN DEFAULT FALSE,
    alici_sildi BOOLEAN DEFAULT FALSE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mesaj Ekleri
CREATE TABLE mesaj_ekleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mesaj_id UUID NOT NULL REFERENCES mesajlar(id) ON DELETE CASCADE,
    dosya_adi VARCHAR(255) NOT NULL,
    dosya_yolu TEXT NOT NULL,
    dosya_boyutu INTEGER,
    dosya_tipi VARCHAR(50),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resmi Bildirimler (Oda onay/red mesajları için)
CREATE TABLE resmi_bildirimler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bildirim_no VARCHAR(50) UNIQUE NOT NULL,
    mesaj_turu VARCHAR(50) NOT NULL,
    gonderen_id UUID NOT NULL REFERENCES kullanicilar(id),
    alici_id UUID NOT NULL REFERENCES kullanicilar(id),
    ciftlik_id UUID REFERENCES ciftlikler(id),
    firma_id UUID REFERENCES firmalar(id),
    basvuru_id UUID,
    konu VARCHAR(255) NOT NULL,
    mesaj TEXT NOT NULL,
    resmi_tarih DATE DEFAULT CURRENT_DATE,
    gecerlilik_tarihi DATE,
    okundu BOOLEAN DEFAULT FALSE,
    okunma_tarihi TIMESTAMP,
    tebligat_yapildi BOOLEAN DEFAULT FALSE,
    tebligat_tarihi TIMESTAMP,
    imza_bilgisi TEXT,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resmi Bildirim Ekleri
CREATE TABLE resmi_bildirim_ekleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bildirim_id UUID NOT NULL REFERENCES resmi_bildirimler(id) ON DELETE CASCADE,
    dosya_adi VARCHAR(255) NOT NULL,
    dosya_yolu TEXT NOT NULL,
    dosya_tipi VARCHAR(50),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. SİSTEM AYARLARI
-- =====================================================

-- Sistem Ayarları
CREATE TABLE ayarlar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anahtar VARCHAR(100) UNIQUE NOT NULL,
    deger TEXT,
    deger_tipi VARCHAR(50),
    aciklama TEXT,
    herkese_acik BOOLEAN DEFAULT FALSE,
    guncelleyen_id UUID REFERENCES kullanicilar(id),
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 13. ODA ÜYELİKLERİ
-- =====================================================

-- Oda Üyelikleri
CREATE TABLE oda_uyelikleri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oda_tipi VARCHAR(50) NOT NULL,
    ciftlik_id UUID REFERENCES ciftlikler(id) ON DELETE CASCADE,
    firma_id UUID REFERENCES firmalar(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id),
    uyelik_no VARCHAR(100) UNIQUE NOT NULL,
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE,
    yenileme_tarihi DATE,
    durum VARCHAR(50) DEFAULT 'basvuru',
    uyelik_ucreti DECIMAL(12, 2),
    odeme_durumu VARCHAR(50),
    son_odeme_tarihi DATE,
    otomatik_yenileme BOOLEAN DEFAULT FALSE,
    belge_url TEXT,
    notlar TEXT,
    onaylayan_id UUID REFERENCES kullanicilar(id),
    onay_tarihi TIMESTAMP,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_oda_varlik CHECK (
        (ciftlik_id IS NOT NULL AND firma_id IS NULL) OR
        (ciftlik_id IS NULL AND firma_id IS NOT NULL)
    )
);

-- Lisanslar
CREATE TABLE lisanslar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciftlik_id UUID REFERENCES ciftlikler(id) ON DELETE CASCADE,
    firma_id UUID REFERENCES firmalar(id) ON DELETE CASCADE,
    lisans_turu VARCHAR(100) NOT NULL,
    ad VARCHAR(255) NOT NULL,
    lisans_no VARCHAR(100) UNIQUE NOT NULL,
    veren_kurum VARCHAR(255) NOT NULL,
    baslangic DATE NOT NULL,
    bitis DATE,
    suresiz BOOLEAN DEFAULT FALSE,
    durum VARCHAR(50) DEFAULT 'aktif',
    yenileme_gerekli BOOLEAN DEFAULT TRUE,
    yenileme_uyari_gun INTEGER DEFAULT 90,
    belge_url TEXT,
    aciklama TEXT,
    hatirlatici_gonderildi BOOLEAN DEFAULT FALSE,
    olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_lisans_varlik CHECK (
        (ciftlik_id IS NOT NULL AND firma_id IS NULL) OR
        (ciftlik_id IS NULL AND firma_id IS NOT NULL)
    )
);

-- =====================================================
-- İNDEXLER (Performans)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_kullanicilar_eposta ON kullanicilar(eposta);
CREATE INDEX IF NOT EXISTS idx_kullanicilar_rol ON kullanicilar(rol);
CREATE INDEX IF NOT EXISTS idx_kullanicilar_durum ON kullanicilar(durum);
CREATE INDEX IF NOT EXISTS idx_ciftlikler_kullanici ON ciftlikler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_ciftlikler_durum ON ciftlikler(durum);
CREATE INDEX IF NOT EXISTS idx_ciftlikler_sehir ON ciftlikler(sehir_id);
CREATE INDEX IF NOT EXISTS idx_firmalar_kullanici ON firmalar(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_firmalar_durum ON firmalar(durum);
CREATE INDEX IF NOT EXISTS idx_firmalar_sektor ON firmalar(sektor_id);
CREATE INDEX IF NOT EXISTS idx_urunler_ciftlik ON urunler(ciftlik_id);
CREATE INDEX IF NOT EXISTS idx_urunler_kategori ON urun_kategorileri(id);
CREATE INDEX IF NOT EXISTS idx_urunler_durum ON urunler(durum);
CREATE INDEX IF NOT EXISTS idx_teklifler_urun ON teklifler(urun_id);
CREATE INDEX IF NOT EXISTS idx_teklifler_firma ON teklifler(firma_id);
CREATE INDEX IF NOT EXISTS idx_siparisler_no ON siparisler(siparis_no);
CREATE INDEX IF NOT EXISTS idx_siparisler_durum ON siparisler(durum);
CREATE INDEX IF NOT EXISTS idx_bildirimler_kullanici ON bildirimler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_bildirimler_okundu ON bildirimler(okundu);
CREATE INDEX IF NOT EXISTS idx_oda_kullanicilari_kullanici_id ON oda_kullanicilari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_oda_kullanicilari_oda_tipi ON oda_kullanicilari(oda_tipi);

-- =====================================================
-- TRİGGERLAR
-- =====================================================

CREATE OR REPLACE FUNCTION guncelleme_tarihi_func()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kullanicilar_guncelleme BEFORE UPDATE ON kullanicilar
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();
CREATE TRIGGER trg_ciftlikler_guncelleme BEFORE UPDATE ON ciftlikler
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();
CREATE TRIGGER trg_firmalar_guncelleme BEFORE UPDATE ON firmalar
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();
CREATE TRIGGER trg_urunler_guncelleme BEFORE UPDATE ON urunler
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();
CREATE TRIGGER trg_siparisler_guncelleme BEFORE UPDATE ON siparisler
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();
CREATE TRIGGER trg_oda_uyelikleri_guncelleme BEFORE UPDATE ON oda_uyelikleri
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();
CREATE TRIGGER trg_oda_kullanicilari_guncelleme BEFORE UPDATE ON oda_kullanicilari
    FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_func();

-- Otomatik numara oluşturma
CREATE SEQUENCE IF NOT EXISTS seq_siparis_no START 1;
CREATE SEQUENCE IF NOT EXISTS seq_bildirim_no START 1;
CREATE SEQUENCE IF NOT EXISTS seq_ziraat_uyelik START 1;
CREATE SEQUENCE IF NOT EXISTS seq_sanayi_uyelik START 1;

CREATE OR REPLACE FUNCTION siparis_no_olustur()
RETURNS TRIGGER AS $$
BEGIN
    NEW.siparis_no = 'SIP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('seq_siparis_no')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_siparis_no ON siparisler;
CREATE TRIGGER trg_siparis_no BEFORE INSERT ON siparisler
    FOR EACH ROW EXECUTE FUNCTION siparis_no_olustur();

CREATE OR REPLACE FUNCTION bildirim_no_olustur()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bildirim_no = 'BLD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('seq_bildirim_no')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bildirim_no ON resmi_bildirimler;
CREATE TRIGGER trg_bildirim_no BEFORE INSERT ON resmi_bildirimler
    FOR EACH ROW EXECUTE FUNCTION bildirim_no_olustur();

CREATE OR REPLACE FUNCTION uyelik_no_olustur()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.oda_tipi = 'Ziraat' THEN
        NEW.uyelik_no = 'ZRT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('seq_ziraat_uyelik')::TEXT, 6, '0');
    ELSIF NEW.oda_tipi = 'Sanayi' THEN
        NEW.uyelik_no = 'SNY-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('seq_sanayi_uyelik')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_uyelik_no ON oda_uyelikleri;
CREATE TRIGGER trg_uyelik_no BEFORE INSERT ON oda_uyelikleri
    FOR EACH ROW EXECUTE FUNCTION uyelik_no_olustur();

-- =====================================================
-- VİEWLAR
-- =====================================================

CREATE OR REPLACE VIEW v_urunler_detay AS
SELECT 
    u.*,
    c.ad AS uretici_adi,
    s.ad AS bolge,
    c.telefon AS uretici_telefon,
    c.organik,
    c.iyi_tarim,
    uk.ad AS kategori_adi,
    b.ad AS birim_adi,
    b.sembol AS birim_sembol
FROM urunler u
JOIN ciftlikler c ON u.ciftlik_id = c.id
LEFT JOIN sehirler s ON c.sehir_id = s.id
JOIN urun_kategorileri uk ON u.kategori_id = uk.id
JOIN birimler b ON u.birim_id = b.id
WHERE u.silinme IS NULL;

CREATE OR REPLACE VIEW v_aktif_ciftlikler AS
SELECT 
    c.*,
    k.ad || ' ' || k.soyad AS sahip_adi,
    k.eposta,
    k.telefon AS kullanici_telefon,
    s.ad AS sehir_adi,
    COUNT(DISTINCT u.id) AS urun_sayisi
FROM ciftlikler c
JOIN kullanicilar k ON c.kullanici_id = k.id
LEFT JOIN sehirler s ON c.sehir_id = s.id
LEFT JOIN urunler u ON c.id = u.ciftlik_id
WHERE c.durum = 'aktif' AND c.silinme IS NULL
GROUP BY c.id, k.id, s.id;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Sektörler
INSERT INTO sektorler (kod, ad) VALUES
    ('ENERJI', 'Enerji'),
    ('TARIM', 'Tarım'),
    ('TEKSTIL', 'Tekstil'),
    ('GIDA', 'Gıda'),
    ('KIMYA', 'Kimya'),
    ('INSAAT', 'İnşaat'),
    ('DIGER', 'Diğer')
ON CONFLICT (kod) DO NOTHING;

-- Sertifika Türleri
INSERT INTO sertifika_turleri (kod, ad, gecerlilik_suresi) VALUES
    ('ORGANIK', 'Organik Üretim Sertifikası', 12),
    ('IYI_TARIM', 'İyi Tarım Uygulaması', 24),
    ('ISO9001', 'ISO 9001 Kalite Yönetimi', 36),
    ('ISO14001', 'ISO 14001 Çevre Yönetimi', 36),
    ('HALAL', 'Helal Gıda Sertifikası', 12)
ON CONFLICT (kod) DO NOTHING;

-- Birimler (Büyük harf kodları)
INSERT INTO birimler (kod, ad, sembol, tur) VALUES
    ('TON', 'Ton', 't', 'agirlik'),
    ('KG', 'Kilogram', 'kg', 'agirlik'),
    ('M3', 'Metreküp', 'm³', 'hacim'),
    ('LT', 'Litre', 'lt', 'hacim'),
    ('ADET', 'Adet', 'adet', 'adet')
ON CONFLICT (kod) DO NOTHING;

-- Birimler (Küçük harf kodları - Frontend'den gelen veriler için)
INSERT INTO birimler (kod, ad, sembol, tur) VALUES
    ('ton', 'Ton', 'ton', 'agirlik'),
    ('kg', 'Kilogram', 'kg', 'agirlik'),
    ('m3', 'Metreküp', 'm³', 'hacim'),
    ('lt', 'Litre', 'lt', 'hacim')
ON CONFLICT (kod) DO NOTHING;

-- Atık Türleri (Büyük harf kodları)
INSERT INTO atik_turleri (kod, ad) VALUES
    ('HAYVANSAL', 'Hayvansal Gübre'),
    ('BITKISEL', 'Bitkisel Atık'),
    ('TARIMSAL', 'Tarımsal Sanayi Atığı'),
    ('ORGANIK', 'Organik Atık'),
    ('BIYOKUTLE', 'Biyokütle'),
    ('DIGER', 'Diğer')
ON CONFLICT (kod) DO NOTHING;

-- Atık Türleri (Küçük harf kodları - Frontend'de kullanılan kodlar)
INSERT INTO atik_turleri (kod, ad, aciklama, aktif) VALUES
    ('hayvansal-gubre', 'Hayvansal Gübre', 'Hayvansal gübre atıkları', TRUE),
    ('bitkisel-atik', 'Bitkisel Atık', 'Bitkisel kökenli atıklar', TRUE),
    ('tarimsal-sanayi', 'Tarımsal Sanayi Yan Ürünü', 'Tarımsal sanayi atıkları', TRUE),
    ('organik-atik', 'Organik Atık', 'Organik kökenli atıklar', TRUE),
    ('biyokutle', 'Biyokütle', 'Biyokütle atıkları', TRUE),
    ('diger', 'Diğer Atık Türleri', 'Diğer atık türleri', TRUE)
ON CONFLICT (kod) DO NOTHING;

-- Ürün Kategorileri
INSERT INTO urun_kategorileri (kod, ad) VALUES
    ('ATIK', 'Çiftlik Atıkları'),
    ('GUBRE', 'Organik Gübre'),
    ('KOMPOST', 'Kompost'),
    ('BIYOKUTLE', 'Biyokütle'),
    ('TOPRAK', 'Toprak İyileştirici'),
    ('YEM', 'Yem'),
    ('ENERJI', 'Enerji')
ON CONFLICT (kod) DO NOTHING;

-- Kullanıcılar (Admin hesapları)
INSERT INTO kullanicilar (ad, soyad, eposta, sifre_hash, rol, durum, eposta_dogrulandi, sartlar_kabul) VALUES 
    ('Sistem', 'Yöneticisi', 'admin@yesileksen.com', crypt('Admin123!', gen_salt('bf')), 'super_yonetici', 'aktif', TRUE, TRUE),
    ('Ziraat', 'Yöneticisi', 'ziraat@yesileksen.com', crypt('Ziraat123!', gen_salt('bf')), 'ziraat_yoneticisi', 'aktif', TRUE, TRUE),
    ('Sanayi', 'Yöneticisi', 'sanayi@yesileksen.com', crypt('Sanayi123!', gen_salt('bf')), 'sanayi_yoneticisi', 'aktif', TRUE, TRUE)
ON CONFLICT (eposta) DO NOTHING;

-- Rapor Türleri
INSERT INTO rapor_turleri (kod, ad) VALUES
    ('SDG', 'SDG Raporu'),
    ('GENEL', 'Genel Rapor'),
    ('FINANSAL', 'Finansal Rapor'),
    ('CEVRESEL', 'Çevresel Rapor')
ON CONFLICT (kod) DO NOTHING;

-- Bildirim Türleri
INSERT INTO bildirim_turleri (kod, ad) VALUES
    ('SISTEM', 'Sistem Bildirimi'),
    ('BASVURU', 'Başvuru Durumu'),
    ('SIPARIS', 'Sipariş Durumu'),
    ('TEKLIF', 'Teklif Alındı'),
    ('BELGE', 'Belge İncelemesi'),
    ('MESAJ', 'Yeni Mesaj'),
    ('UYARI', 'Uyarı'),
    ('URUN_DUZENLEME', 'Ürün Düzenleme Talebi'),
    ('URUN_SILME', 'Ürün Silme Talebi'),
    ('BELGE_GUNCELLEME', 'Belge Güncelleme')
ON CONFLICT (kod) DO NOTHING;

-- Belge Türleri (Ana şemadaki belgeler)
INSERT INTO belge_turleri (kod, ad, gecerlilik_suresi, zorunlu) VALUES
    ('TAPU', 'Tapu Belgesi', NULL, TRUE),
    ('RUHSAT', 'İşletme Ruhsatı', 12, TRUE),
    ('KIMLIK', 'Kimlik Belgesi', NULL, TRUE),
    ('VERGI', 'Vergi Levhası', 12, TRUE),
    ('SICIL', 'Ticaret Sicil Belgesi', NULL, TRUE),
    ('IMZA_SIRKULERI', 'İmza Sirküleri', NULL, TRUE),
    ('FAALIYET_BELGESI', 'Faaliyet Belgesi', 12, TRUE),
    ('ODA_KAYIT', 'Oda Kayıt Sicil Sureti', 12, TRUE),
    ('URUN_FOTOGRAFI', 'Ürün Fotoğrafı', NULL, TRUE),
    ('MENSEI_BELGESI', 'Menşei Belgesi (ÇKS / İşletme Tescil)', NULL, TRUE),
    ('LABORATUVAR_ANALIZ', 'Laboratuvar Analiz Raporu', 12, FALSE),
    ('TICARET_SICIL_GAZETESI', 'Ticaret Sicil Gazetesi', NULL, TRUE)
ON CONFLICT (kod) DO NOTHING;

-- Belge Türleri - ÇİFTÇİ (Kayıt sisteminden)
INSERT INTO belge_turleri (kod, ad, zorunlu, aktif) VALUES
    ('tapu_kira', 'Tapu Senedi veya Onaylı Kira Sözleşmesi', TRUE, TRUE),
    ('nufus_cuzdani', 'Nüfus Cüzdanı Fotokopisi', TRUE, TRUE),
    ('ciftci_kutugu', 'Çiftçi Kütüğü Kaydı', TRUE, TRUE),
    ('muvafakatname', 'Muvafakatname', FALSE, TRUE),
    ('taahhutname', 'Taahhütname', FALSE, TRUE),
    ('doner_sermaye', 'Döner Sermaye Ücret Makbuzu', FALSE, TRUE)
ON CONFLICT (kod) DO NOTHING;

-- Belge Türleri - ŞİRKET (Kayıt sisteminden)
INSERT INTO belge_turleri (kod, ad, zorunlu, aktif) VALUES
    ('ticaret_sicil', 'Ticaret Sicil Gazetesi', TRUE, TRUE),
    ('vergi_levhasi', 'Vergi Levhası', TRUE, TRUE),
    ('imza_sirkuleri', 'İmza Sirküleri', TRUE, TRUE),
    ('faaliyet_belgesi', 'Faaliyet Belgesi', TRUE, TRUE),
    ('oda_kayit', 'Oda Kayıt Sicil Sureti', TRUE, TRUE),
    ('gida_isletme', 'Gıda İşletme Kayıt/Onay Belgesi', FALSE, TRUE),
    ('sanayi_sicil', 'Sanayi Sicil Belgesi', FALSE, TRUE),
    ('kapasite_raporu', 'Kapasite Raporu', FALSE, TRUE)
ON CONFLICT (kod) DO NOTHING;

-- Sistem Ayarları
INSERT INTO ayarlar (anahtar, deger, deger_tipi, aciklama, herkese_acik) VALUES 
    ('site_adi', 'Yeşil-Eksen', 'metin', 'Site adı', TRUE),
    ('site_aciklama', 'Tarımı Sanayi ile Buluşturan Platform', 'metin', 'Site açıklaması', TRUE),
    ('bakim_modu', 'false', 'mantiksal', 'Bakım modu', FALSE),
    ('maks_dosya_mb', '10', 'sayi', 'Maksimum dosya boyutu (MB)', FALSE)
ON CONFLICT (anahtar) DO NOTHING;

-- =====================================================
-- KURULUM TAMAMLANDI
-- =====================================================
--
-- Bu dosya birleştirilmiş veritabanı kurulum dosyasıdır ve şunları içerir:
-- 1. Kullanılan Sql.sql - Ana veritabanı şeması (51 tablo)
-- 2. seed_data.sql - Kayıt sistemi için seed data
-- 3. oda_kullanicilari_tablosu.sql - Oda kullanıcıları tablosu
--
-- TOPLAM: 52 TABLO
-- - 51 tablo (ana şema)
-- - 1 tablo (oda_kullanicilari - iamgroot sayfası için)
--
-- ÖNEMLİ NOTLAR:
-- - Tüm INSERT komutları ON CONFLICT DO NOTHING ile korumalıdır
-- - Birden fazla kez çalıştırılabilir (idempotent)
-- - Frontend'deki farklı kod formatları için hem büyük hem küçük harf kodlar eklenmiştir
--
-- ÇALIŞTIRMA:
-- psql -U postgres -d yesileksen -f docs/yesileksen_birlesik_kurulum.sql
-- 
-- Veya pgAdmin'de bu dosyayı çalıştırın
-- =====================================================

