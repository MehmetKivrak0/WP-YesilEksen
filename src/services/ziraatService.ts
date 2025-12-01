import api from './api';

export interface DashboardStats {
    productSummary: {
        pending: number;
        approved: number;
        revision: number;
    };
    farmSummary: {
        newApplications: number;
        inspections: number;
        missingDocuments: number;
        rejected: number;
        guncelBelgeler?: number;
        totalApplications: number;
        approved: number;
    };
    totalFarmers: number;
    totalProducts: number;
}

export interface MissingDocument {
    id: string;
    name: string;
    belgeTuruAdi: string;
    belgeTuruKod: string;
    durum: string;
    url: string | null;
    yuklenmeTarihi: string | null;
    guncellemeTarihi: string | null;
    incelemeTarihi?: string | null;
    kullaniciNotu?: string | null;
    yoneticiNotu?: string | null;
    redNedeni?: string | null;
    yeniBelgeYuklendi?: boolean;
    yeniYuklendi?: boolean;
}

export interface ApproveFarmResponse {
    success: boolean;
    message: string;
    status?: string;
    ciftlikId?: string;
    hasMissingDocuments?: boolean;
    missingDocuments?: MissingDocument[];
}

export interface ProductApplication {

    id: string;
    name: string;
    applicant: string;
    status: string;
    lastUpdate: string;
    applicationNumber: string;
    sector: string;
    establishmentYear: number;
    employeeCount: string;
    email: string;
    applicationDate: string;
    taxNumber: string;
    description: string;
    documents: Array<{ name: string; url?: string }>;

}

export interface FarmApplication {
    id: string;
    name: string;
    owner: string;
    status: string;
    lastUpdate?: string;
    applicationNumber: string;
    sector: string;
    establishmentYear: number;
    employeeCount: string;
    email: string;
    phone?: string;
    applicationDate: string;
    taxNumber: string;
    description: string;
    wasteTypes?: string[];
    documents: Array<{ 
        name: string; 
        status: string;
        url?: string; 
        farmerNote?: string;
    }>;
}

export const ziraatService = {

    getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
        const response = await api.get('/ziraat/dashboard/stats');
        return response.data;
    },
    getProductApplications: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; applications: ProductApplication[]; pagination: any }> => {
        const response = await api.get('/ziraat/products/applications', { params });
        return response.data;
    },

    //Çiftlik Başvurusu Listesi
    getFarmApplications: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; applications: FarmApplication[]; pagination: any }> => {
        const response = await api.get('/ziraat/farms/applications', { params });
        return response.data;
    },

    //Ürün Başvurusu Onayla
    approveProduct: async (id: string, data?: { note?: string }): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/ziraat/products/${id}/approve`, data);
        return response.data;
    },

    // Ürün Başvurusu Reddet
    rejectProduct: async (id: string, data: { reason: string }): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/ziraat/products/${id}/reject`, data);
        return response.data;
    },
    //Çiftlik Başvurusu Onayla
    approveFarm: async (id: string, data?: { note?: string }): Promise<ApproveFarmResponse> => {
        // ID'yi temizle ve doğrula
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        // data undefined olsa bile boş obje gönder (req.body undefined olmasın)
        const response = await api.post(`/ziraat/farms/approve/${encodeURIComponent(cleanId)}`, data || {});
        return response.data;
    },

    //Çiftlik Başvurusu Reddet
    rejectFarm: async (id: string, data: { reason: string }): Promise<{ success: boolean; message: string }> => {
        // ID'yi temizle ve doğrula
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        const response = await api.post(`/ziraat/farms/reject/${encodeURIComponent(cleanId)}`, data);
        return response.data;
    },

    //Çiftlik Başvurusu Reddet ve Sil (Güncellenen Belgeler Modal'ından)
    rejectFarmAndDelete: async (id: string, data: { reason: string }): Promise<{ success: boolean; message: string }> => {
        // ID'yi temizle ve doğrula
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        const response = await api.post(`/ziraat/farms/reject-and-delete/${encodeURIComponent(cleanId)}`, data);
        return response.data;
    },

    sendBelgeEksikMessage: async (id: string, data: { belgeMessages: Array<{ belgeId: string; farmerMessage: string; adminNote: string }> }): Promise<{ success: boolean; message: string }> => {
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        const response = await api.post(`/ziraat/farms/belge-eksik/${encodeURIComponent(cleanId)}`, data);
        return response.data;
    },

    getUpdatedDocuments: async (id: string): Promise<{ 
        success: boolean; 
        application: { id: string; name: string; owner: string; status: string };
        updatedDocuments: MissingDocument[];
    }> => {
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        const response = await api.get(`/ziraat/farms/${encodeURIComponent(cleanId)}/updated-documents`);
        return response.data;
    },

    updateDocumentStatus: async (belgeId: string, data: { status: string; reason?: string; adminNote?: string }): Promise<{ success: boolean; message: string }> => {
        const cleanId = String(belgeId).trim();
        if (!cleanId) {
            throw new Error('Geçersiz belge ID\'si');
        }
        const response = await api.put(`/ziraat/documents/${encodeURIComponent(cleanId)}`, data);
        return response.data;
    },

    //Kayıtlı çiftçiler listesi
    getRegisteredFarmers: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ success: boolean; farmers: any[]; pagination: any }> => {
        const response = await api.get('/ziraat/farmers/registered', { params });
        return response.data;
    },

    //Çiftçi detayları
    getFarmerDetails: async (id: string): Promise<{ success: boolean; farmer: any }> => {
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz çiftçi ID\'si');
        }
        const response = await api.get(`/ziraat/farmers/${encodeURIComponent(cleanId)}`);
        return response.data;
    },
    //Dashboard Ürünleri
    getDashboardProducts: async (params?: {
        search?: string;
    }): Promise<{ success: boolean; products: any[] }> => {
        const response = await api.get('/ziraat/dashboard/products', { params });
        return response.data;
    },
    //Aktivite Logları
    getActivityLog: async (params?: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{ success: boolean; activities: any[]; pagination: any }> => {
        const response = await api.get('/ziraat/activity-log', { params });
        return response.data;
    },

    //Çiftlik Logları (Belirli bir çiftlik için)
    getFarmLogs: async (id: string): Promise<{ 
        success: boolean; 
        farmName?: string;
        logs: {
            activities: any[];
            detailedActivities: any[];
            changeLogs: any[];
        }
    }> => {
        const response = await api.get(`/ziraat/farms/${id}/logs`);
        return response.data;
    },

    //Tüm Çiftlik Logları
    getAllFarmLogs: async (): Promise<{ 
        success: boolean; 
        logs: {
            activities: any[];
            detailedActivities: any[];
            changeLogs: any[];
        }
    }> => {
        const response = await api.get('/ziraat/farms/logs/all');
        return response.data;
    },
}