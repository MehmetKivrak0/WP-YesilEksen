import api from './api';

// Çiftçi Panel İstatistikleri
export interface CiftciPanelStats {
    toplamSatis: number;
    bekleyenOnay: number;
    aktifUrun: number;
    toplamGelir: number;
}

// Bekleyen Onay (Teklif)
export interface BekleyenOnay {
    id: string;
    urun: string;
    miktar: string;
    teklifFiyat: string;
    birimFiyat: string;
    alici: string;
    tarih: string;
    sure: string;
}

// Son Satış
export interface SonSatis {
    id: string;
    siparisNo?: string;
    urun: string;
    miktar: string;
    fiyat: string;
    durum: string;
    durumClass: string;
    alici: string;
    tarih: string;
}

// Aktif Ürün
export interface AktifUrun {
    id: string;
    urun: string;
    miktar: string;
    fiyat: string;
    durum: string;
    durumClass: string;
    resimUrl?: string;
}

// Çiftlik Profil
export interface CiftlikProfil {
    ad: string;
    sahibi: string;
    telefon: string;
    email: string;
    adres: string;
    alan: string;
    alanBirim: string;
    kurulusYili: string;
    sehir_adi?: string;
    enlem?: string;
    boylam?: string;
    yillik_gelir?: string;
    uretim_kapasitesi?: string;
    urunTurleri: string[];
    sertifikalar: string[];
    sertifikalarDetay?: Array<{
        id: string;
        sertifika_adi: string;
        sertifika_no: string;
        veren_kurum: string;
        baslangic_tarihi: string;
        bitis_tarihi: string | null;
        suresiz: boolean;
        dosya_url: string;
        olusturma: string;
    }>;
    dogrulanmis: boolean;
    urun_tur?: string;
    hakkimizda?: string;
    website?: string;
    logo_url?: string;
    foto?: string;
}

export const ciftciService = {
    /**
     * Çiftçi panel istatistikleri
     * @param timeRange - 'hafta' | 'ay' | 'yil'
     */
    getPanelStats: async (timeRange: 'hafta' | 'ay' | 'yil' = 'ay'): Promise<{ success: boolean; stats: CiftciPanelStats }> => {
        const response = await api.get('/ciftlik/panel/stats', {
            params: { timeRange }
        });
        return response.data;
    },

    /**
     * Bekleyen onaylar (teklifler)
     */
    getPendingOffers: async (): Promise<{ success: boolean; offers: BekleyenOnay[] }> => {
        const response = await api.get('/ciftlik/panel/pending-offers');
        return response.data;
    },

    /**
     * Son satışlar
     */
    getRecentSales: async (): Promise<{ success: boolean; sales: SonSatis[] }> => {
        const response = await api.get('/ciftlik/panel/recent-sales');
        return response.data;
    },

    /**
     * Aktif ürünler
     */
    getActiveProducts: async (): Promise<{ success: boolean; products: AktifUrun[] }> => {
        // Not: Aktif ürünler için 'aktif' veya 'stokta' durumundaki ürünleri getir
        // Backend'de durum filtresi tek değer alıyor, bu yüzden önce 'aktif' sonra 'stokta' denenebilir
        // Veya backend'de IN clause kullanılabilir, şimdilik 'aktif' kullanıyoruz
        const response = await api.get('/ciftlik/urunler', {
            params: {
                durum: 'aktif', // Backend'de 'aktif' veya 'stokta' durumundaki ürünler için güncellenebilir
                limit: 10
            }
        });
        
        // Backend'den gelen veriyi frontend formatına dönüştür
        // Not: urunler tablosunda durum değerleri: 'aktif', 'onay_bekliyor', 'satildi', 'pasif', 'stokta'
        const products = response.data.products.map((product: any) => {
            const durumMap: Record<string, { text: string; class: string }> = {
                'aktif': { text: 'Aktif', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                'stokta': { text: 'Stokta', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                'onay_bekliyor': { text: 'Onay Bekliyor', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
                'satildi': { text: 'Satıldı', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
                'pasif': { text: 'Pasif', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
            };

            const durumInfo = durumMap[product.durum] || { text: product.durum, class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };

            return {
                id: product.id,
                urun: product.baslik || product.ad || 'Ürün Adı Yok', // Backend'den baslik veya ad gelebilir
                miktar: `${product.miktar || 0} ${product.birim || 'Ton'}`,
                fiyat: `${parseFloat(product.fiyat || 0).toLocaleString('tr-TR')} ₺ / ${product.birim || 'ton'}`,
                durum: durumInfo.text,
                durumClass: durumInfo.class,
                resimUrl: product.resim_url || undefined
            };
        });

        return {
            success: response.data.success,
            products
        };
    },

    /**
     * Çiftlik profil bilgilerini getir
     */
    getCiftlikProfil: async (): Promise<{ success: boolean; profil: CiftlikProfil }> => {
        const response = await api.get('/ciftlik/profil');
        return response.data;
    },

    /**
     * Çiftlik profil bilgilerini güncelle
     */
    updateCiftlikProfil: async (profil: Partial<CiftlikProfil>): Promise<{ success: boolean; message: string; profil: any }> => {
        const response = await api.put('/ciftlik/profil', profil);
        return response.data;
    },

    /**
     * Çiftlik logosunu yükle
     */
    uploadCiftlikLogo: async (file: File): Promise<{ success: boolean; message: string; logo_url: string }> => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post('/ciftlik/upload-logo', formData);
        return response.data;
    },

    /**
     * Eksik belgeleri getir
     */
    getMissingDocuments: async (): Promise<{ 
        success: boolean; 
        hasMissingDocuments: boolean;
        hasNewlyUploadedDocuments?: boolean;
        hasGuncelBelgeler?: boolean;
        application: { id: string; name: string; owner: string; status: string } | null;
        missingDocuments: Array<{
            id: string;
            name: string;
            belgeTuruAdi: string;
            belgeTuruKod: string;
            durum: string;
            url: string | null;
            yuklenmeTarihi: string | null;
            guncellemeTarihi: string | null;
            incelemeTarihi: string | null;
            kullaniciNotu: string | null;
            yoneticiNotu: string | null;
            redNedeni: string | null;
        }>;
    }> => {
        const response = await api.get('/ciftlik/missing-documents');
        return response.data;
    },

    /**
     * Eksik belgeyi yükle
     */
    uploadMissingDocument: async (belgeId: string, file: File, message?: string): Promise<{ success: boolean; message: string; belgeId: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('belgeId', belgeId);
        if (message) {
            formData.append('message', message);
        }
        
        const response = await api.post('/ciftlik/upload-missing-document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Güncel belgeleri getir (gcbelge durumundaki belgeler)
     */
    getGuncelBelgeler: async (): Promise<{ 
        success: boolean; 
        documents: Array<{
            id: string;
            name: string;
            belgeTuruAdi: string;
            belgeTuruKod: string;
            durum: string;
            url: string | null;
            yuklenmeTarihi: string | null;
            guncellemeTarihi: string | null;
            incelemeTarihi: string | null;
            kullaniciNotu: string | null;
            yoneticiNotu: string | null;
            redNedeni: string | null;
        }>;
        application: { id: string; name: string; owner: string; status: string } | null;
    }> => {
        const response = await api.get('/ciftlik/guncel-belgeler');
        return response.data;
    },

    /**
     * Sertifika türlerini getir
     */
    getSertifikaTurleri: async (): Promise<{ success: boolean; turler: Array<{ id: string; ad: string }> }> => {
        const response = await api.get('/ciftlik/sertifika-turleri');
        return response.data;
    },

    /**
     * Sertifika ekle
     */
    addSertifika: async (sertifikaData: {
        sertifika_turu_id: string;
        sertifika_no?: string;
        veren_kurum?: string;
        baslangic_tarihi: string;
        bitis_tarihi?: string;
        suresiz: boolean;
        dosya?: File;
    }): Promise<{ success: boolean; message: string }> => {
        const formData = new FormData();
        formData.append('sertifika_turu_id', sertifikaData.sertifika_turu_id);
        if (sertifikaData.sertifika_no) formData.append('sertifika_no', sertifikaData.sertifika_no);
        if (sertifikaData.veren_kurum) formData.append('veren_kurum', sertifikaData.veren_kurum);
        formData.append('baslangic_tarihi', sertifikaData.baslangic_tarihi);
        if (sertifikaData.bitis_tarihi) formData.append('bitis_tarihi', sertifikaData.bitis_tarihi);
        formData.append('suresiz', sertifikaData.suresiz.toString());
        if (sertifikaData.dosya) formData.append('dosya', sertifikaData.dosya);
        
        const response = await api.post('/ciftlik/sertifika-ekle', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Atık/Ürün ekle (belgelerle birlikte)
     */
    addWasteProduct: async (productData: {
        atikTuru: string;
        miktar: number;
        birim: string;
        isAnalyzed: boolean;
        hasGuarantee: boolean;
        productPhoto?: File;
        originDocument?: File;
        analysisReport?: File;
        guaranteeDocument?: File;
        additionalPhoto?: File;
        qualityCertificate?: File;
    }): Promise<{ success: boolean; message: string; productId?: string }> => {
        const formData = new FormData();
        formData.append('atikTuru', productData.atikTuru);
        formData.append('miktar', productData.miktar.toString());
        formData.append('birim', productData.birim);
        formData.append('isAnalyzed', productData.isAnalyzed.toString());
        formData.append('hasGuarantee', productData.hasGuarantee.toString());

        if (productData.productPhoto) formData.append('productPhoto', productData.productPhoto);
        if (productData.originDocument) formData.append('originDocument', productData.originDocument);
        if (productData.analysisReport) formData.append('analysisReport', productData.analysisReport);
        if (productData.guaranteeDocument) formData.append('guaranteeDocument', productData.guaranteeDocument);
        if (productData.additionalPhoto) formData.append('additionalPhoto', productData.additionalPhoto);
        if (productData.qualityCertificate) formData.append('qualityCertificate', productData.qualityCertificate);

        const response = await api.post('/ciftlik/atik-ekle', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Ürün başvuru durumlarını getir
    getMyProductApplications: async (): Promise<{
        success: boolean;
        applications: Array<{
            id: string;
            product: string;
            category: string;
            status: 'Onaylandı' | 'İncelemede' | 'Revizyon' | 'Reddedildi';
            submittedAt: string;
            lastUpdate: string;
            adminNotes: string;
            documents: Array<{
                name: string;
                status: 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';
                url?: string;
                belgeId?: string;
                farmerNote?: string;
            }>;
        }>;
    }> => {
        const response = await api.get('/ciftlik/urun-basvurulari');
        return response.data;
    }
};

