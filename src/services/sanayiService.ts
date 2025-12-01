import api from './api';

export interface DashboardStats {
    productSummary: {
        pending: number;
        approved: number;
        revision: number;
    };
    companySummary: {
        newApplications: number;
        inspections: number;
        approved: number;
        rejected: number;
    };
    totalCompanies: number;
    totalProducts: number;
}

export interface CompanyApplication {
    id: string;
    name: string;
    owner: string; // Backend'den basvuran_adi olarak geliyor
    status: string;
    lastUpdate?: string;
    applicationNumber: string;
    sector: string;
    establishmentYear?: number;
    employeeCount?: string;
    email: string;
    phone?: string;
    applicationDate: string;
    taxNumber: string;
    description: string;
    documents: Array<{ 
        name: string; 
        status: string;
        url?: string; 
        belgeId?: string;
        farmerNote?: string;
        adminNote?: string;
    }>;
    documentsWithStatus?: Array<{ 
        name: string; 
        status: string;
        url?: string; 
        belgeId?: string;
        farmerNote?: string;
        adminNote?: string;
    }>;
}

export interface RegisteredCompany {
    id: string;
    name: string;
    email: string;
    companyName: string;
    phone: string;
    status: string;
    registrationDate: string;
    sector: string;
}

export const sanayiService = {
    getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
        const response = await api.get('/sanayi/dashboard/stats');
        return response.data;
    },

    getCompanyApplications: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{ success: boolean; applications: CompanyApplication[]; pagination: any }> => {
        const response = await api.get('/sanayi/companies/applications', { params });
        return response.data;
    },

    // Firma Başvurusu Onayla
    approveCompany: async (id: string, data?: { note?: string }): Promise<{ success: boolean; message: string }> => {
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        const response = await api.post(`/sanayi/companies/approve/${encodeURIComponent(cleanId)}`, data);
        return response.data;
    },

    // Firma Başvurusu Reddet
    rejectCompany: async (id: string, data: { reason: string }): Promise<{ success: boolean; message: string }> => {
        const cleanId = String(id).trim();
        if (!cleanId) {
            throw new Error('Geçersiz başvuru ID\'si');
        }
        const response = await api.post(`/sanayi/companies/reject/${encodeURIComponent(cleanId)}`, data);
        return response.data;
    },

    // Kayıtlı firmalar listesi
    getRegisteredCompanies: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ success: boolean; companies: RegisteredCompany[]; pagination: any }> => {
        const response = await api.get('/sanayi/companies/registered', { params });
        return response.data;
    },

    // Dashboard Ürünleri
    getDashboardProducts: async (params?: {
        search?: string;
    }): Promise<{ success: boolean; products: any[] }> => {
        const response = await api.get('/sanayi/dashboard/products', { params });
        return response.data;
    },

    // Aktivite Logları
    getActivityLog: async (params?: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{ success: boolean; activities: any[]; pagination: any }> => {
        const response = await api.get('/sanayi/activity-log', { params });
        return response.data;
    },

    // Firma Logları (Belirli bir firma için)
    getCompanyLogs: async (id: string): Promise<{ 
        success: boolean; 
        logs: {
            activities: any[];
            detailedActivities: any[];
            changeLogs: any[];
        }
    }> => {
        const response = await api.get(`/sanayi/companies/${id}/logs`);
        return response.data;
    },

    // Tüm Firma Logları
    getAllCompanyLogs: async (): Promise<{ 
        success: boolean; 
        logs: {
            activities: any[];
            detailedActivities: any[];
            changeLogs: any[];
        }
    }> => {
        const response = await api.get('/sanayi/companies/logs/all');
        return response.data;
    },

    // Belge Durumunu Güncelle
    updateDocumentStatus: async (belgeId: string, data: { 
        status: string; 
        reason?: string; 
        adminNote?: string;
    }): Promise<{ success: boolean; message: string }> => {
        const response = await api.put(`/sanayi/documents/${belgeId}`, data);
        return response.data;
    },

    updateCompany: async (id: string, data: { 
        status?: string; 
        sector?: string;
        reason?: string; // Pasif durumuna çekme sebebi
    }): Promise<{ success: boolean; message: string; data?: any }> => {
        const response = await api.put(`/sanayi/companies/${id}`, data);
        return response.data;
    },
};

