import api from './api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Public API instance (auth gerektirmez)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PublicFirma {
  id: string;
  ad: string;
  konum: string;
  sektor: string;
  telefon?: string;
  email?: string;
  dogrulandi: boolean;
  yetkili?: string;
  kurulusYili?: number;
  calisanSayisi?: string;
  aciklama?: string;
  kayitTarihi?: string;
  profilFoto?: string;
}

export interface Sektor {
  id: string;
  ad: string;
  aciklama?: string;
}

export interface FirmaProfile {
    id: string;
    ad: string;
    sektor: string;
    sektorId?: string;
    vergiNo: string;
    ticaretSicilNo?: string;
    telefon: string;
    email: string;
    website: string;
    adres: string;
    kurulusYili: string;
    calisanSayisi: string;
    aciklama: string;
    dogrulanmis: boolean;
    dogrulamaTarihi?: string;
    durum: string;
    olusturma: string;
    guncelleme: string;
    profilFotoUrl?: string | null;
    yetkili: {
        ad: string;
        soyad: string;
        eposta: string;
    };
    sertifikalar: Array<{
        id: string;
        ad: string;
        no: string;
        verenKurum: string;
        baslangicTarihi: string;
        bitisTarihi?: string;
        suresiz: boolean;
        dosyaUrl?: string;
    }>;
}

export interface SertifikaTuru {
    id: string;
    kod: string;
    ad: string;
    aciklama?: string;
}

export interface AddSertifikaData {
    sertifikaTuruId: string;
    sertifikaNo?: string;
    verenKurum?: string;
    baslangicTarihi: string;
    bitisTarihi?: string;
    suresiz?: boolean;
    file?: File;
}

export interface UpdateFirmaProfileData {
    ad?: string;
    telefon?: string;
    website?: string;
    adres?: string;
    kurulusYili?: string;
    calisanSayisi?: string;
    aciklama?: string;
    sektorId?: string;
}

// Başvuru Durumu tipi
export interface BasvuruDurumu {
    id: string;
    firmaId?: string;
    firmaAdi: string;
    sektor: string;
    durum: string;
    durumKod: string;
    vergiNo?: string;
    telefon?: string;
    eposta?: string;
    adres?: string;
    aciklama?: string;
    basvuruTarihi: string;
    incelemeTarihi?: string;
    onayTarihi?: string;
    sonGuncelleme: string;
    adminNotu?: string;
    redNedeni?: string;
    yetkili: {
        ad: string;
        soyad: string;
        telefon: string;
        eposta: string;
    };
    belgeler: Array<{
        id: string;
        ad: string;
        kod: string;
        durum: string;
        durumKod: string;
        dosyaUrl?: string;
        adminNotu?: string;
        redNedeni?: string;
        zorunlu: boolean;
    }>;
}

export const firmaService = {
    // Başvuru durumu getir
    getBasvuruDurumu: async (): Promise<{ success: boolean; basvuru: BasvuruDurumu }> => {
        const response = await api.get('/firma/basvuru-durum');
        return response.data;
    },

    // Firma profil bilgilerini getir
    getProfile: async (): Promise<{ success: boolean; firma: FirmaProfile }> => {
        const response = await api.get('/firma/profile');
        return response.data;
    },

    // Firma profil bilgilerini güncelle
    updateProfile: async (data: UpdateFirmaProfileData): Promise<{ success: boolean; message: string; firma: any }> => {
        const response = await api.put('/firma/profile', data);
        return response.data;
    },

    // Profil fotoğrafı yükle
    uploadProfilePhoto: async (file: File): Promise<{ success: boolean; message: string; photoUrl: string }> => {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await api.post('/firma/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Sertifika türlerini getir
    getSertifikaTurleri: async (): Promise<{ success: boolean; types: SertifikaTuru[] }> => {
        const response = await api.get('/firma/certificates/types');
        return response.data;
    },

    // Sertifika ekle
    addSertifika: async (data: AddSertifikaData): Promise<{ success: boolean; message: string; sertifika: any }> => {
        const formData = new FormData();
        formData.append('sertifikaTuruId', data.sertifikaTuruId);
        if (data.sertifikaNo) formData.append('sertifikaNo', data.sertifikaNo);
        if (data.verenKurum) formData.append('verenKurum', data.verenKurum);
        formData.append('baslangicTarihi', data.baslangicTarihi);
        if (data.bitisTarihi) formData.append('bitisTarihi', data.bitisTarihi);
        formData.append('suresiz', data.suresiz ? 'true' : 'false');
        if (data.file) formData.append('file', data.file);
        
        const response = await api.post('/firma/certificates', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Sertifika sil
    deleteSertifika: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/firma/certificates/${id}`);
        return response.data;
    },

    // Başvuru belgesi güncelle (tek belge)
    updateBasvuruBelge: async (belgeId: string, file: File, mesaj?: string): Promise<{ success: boolean; message: string; belge: any }> => {
        const formData = new FormData();
        formData.append('file', file);
        if (mesaj) formData.append('mesaj', mesaj);
        
        const response = await api.post(`/firma/basvuru-belge/${belgeId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Başvuru belgeleri güncelle (toplu)
    updateBasvuruBelgeler: async (belgeler: { belgeId: string; file: File }[], mesaj?: string): Promise<{ success: boolean; message: string; belgeler: any[] }> => {
        const formData = new FormData();
        
        belgeler.forEach(({ belgeId, file }) => {
            formData.append(belgeId, file);
        });
        
        if (mesaj) formData.append('mesaj', mesaj);
        
        const response = await api.post('/firma/basvuru-belgeler', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export interface FirmaDetay {
  id: string;
  ad: string;
  vergiNo?: string;
  ticaretSicilNo?: string;
  sektor: string;
  sektorId?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  sehir?: string;
  ilce?: string;
  kurulusYili?: number;
  calisanSayisi?: string;
  aciklama?: string;
  dogrulandi: boolean;
  kayitTarihi?: string;
  sonGuncelleme?: string;
  profilFoto?: string;
  yetkili?: {
    ad?: string;
    soyad?: string;
    telefon?: string;
    eposta?: string;
  };
  sertifikalar: Array<{
    id: string;
    ad: string;
    no?: string;
    verenKurum?: string;
    baslangicTarihi?: string;
    bitisTarihi?: string;
    suresiz?: boolean;
    dosyaUrl?: string;
  }>;
}

// ===== PUBLIC SERVICES (Auth gerektirmez) =====
export const publicFirmaService = {
    // Tüm aktif firmaları listele
    getFirmalar: async (params?: {
        search?: string;
        sektor?: string;
        konum?: string;
        page?: number;
        limit?: number;
    }): Promise<{ 
        success: boolean; 
        firmalar: PublicFirma[]; 
        pagination: { total: number; page: number; limit: number; totalPages: number } 
    }> => {
        const response = await publicApi.get('/firma/public/list', { params });
        return response.data;
    },

    // Sektör listesi
    getSektorler: async (): Promise<{ success: boolean; sektorler: Sektor[] }> => {
        const response = await publicApi.get('/firma/public/sektorler');
        return response.data;
    },

    // Firma detay
    getFirmaDetay: async (id: string): Promise<{ success: boolean; firma: FirmaDetay }> => {
        const response = await publicApi.get(`/firma/public/detay/${id}`);
        return response.data;
    }
};

