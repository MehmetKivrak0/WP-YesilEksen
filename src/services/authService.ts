import api from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    // Temel bilgiler
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: 'farmer' | 'company' | 'ziraat' | 'sanayi';
    phone: string;
    terms: boolean;
    // Çiftlik bilgileri
    farmName?: string;
    address?: string;
    wasteTypes?: string[];
    otherWasteType?: string;
    // Şirket bilgileri
    companyName?: string;
    taxNumber?: string;
    // Belgeler (File objeleri)
    tapuOrKiraDocument?: File | null;
    nufusCuzdani?: File | null;
    ciftciKutuguKaydi?: File | null;
    muvafakatname?: File | null;
    taahhutname?: File | null;
    donerSermayeMakbuz?: File | null;
    // Şirket belgeleri
    ticaretSicilGazetesi?: File | null;
    vergiLevhasi?: File | null;
    imzaSirkuleri?: File | null;
    faaliyetBelgesi?: File | null;
    odaKayitSicilSureti?: File | null;
    gidaIsletmeKayit?: File | null;
    sanayiSicilBelgesi?: File | null;
    kapasiteRaporu?: File | null;
}

export interface User {
    id: number;
    ad: string;
    soyad: string;
    eposta: string;
    telefon: string;
    rol: 'ciftci' | 'firma' | 'ziraat_yoneticisi' | 'sanayi_yoneticisi' | 'super_yonetici';
    durum: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
}

export interface ResetPasswordData {
    email: string;
    newPassword: string;
}

export interface CheckEmailData {
    email: string;
    checkType?: 'availability'; // E-posta kontrolü için
}

export const authService = {
    /**
     * Kullanıcı girişi
     */
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        
        // Token ve user bilgisini localStorage'a kaydet
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
    },

    /**
     * Kullanıcı kaydı (FormData ile - dosya yükleme desteği)
     */
    register: async (data: RegisterData): Promise<any> => {
        // FormData oluştur
        const formData = new FormData();

        // Temel bilgileri ekle
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('userType', data.userType);
        formData.append('phone', data.phone);
        formData.append('terms', data.terms.toString());

        // Çiftlik bilgileri (varsa)
        if (data.farmName) formData.append('farmName', data.farmName);
        if (data.address) formData.append('address', data.address);
        if (data.wasteTypes && data.wasteTypes.length > 0) {
            formData.append('wasteTypes', JSON.stringify(data.wasteTypes));
        }
        if (data.otherWasteType) formData.append('otherWasteType', data.otherWasteType);

        // Şirket bilgileri (varsa)
        if (data.companyName) formData.append('companyName', data.companyName);
        if (data.taxNumber) formData.append('taxNumber', data.taxNumber);

        // Belgeleri ekle (varsa)
        const documentFields = [
            'tapuOrKiraDocument',
            'nufusCuzdani',
            'ciftciKutuguKaydi',
            'muvafakatname',
            'taahhutname',
            'donerSermayeMakbuz',
            'ticaretSicilGazetesi',
            'vergiLevhasi',
            'imzaSirkuleri',
            'faaliyetBelgesi',
            'odaKayitSicilSureti',
            'gidaIsletmeKayit',
            'sanayiSicilBelgesi',
            'kapasiteRaporu'
        ];

        documentFields.forEach(field => {
            const file = data[field as keyof RegisterData];
            if (file instanceof File) {
                formData.append(field, file);
            }
        });

        // FormData ile POST isteği (multipart/form-data)
        // Content-Type otomatik olarak interceptor tarafından ayarlanır
        const response = await api.post('/auth/register', formData);

        return response.data;
    },

    /**
     * Mevcut kullanıcı bilgisi
     */
    getMe: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    /**
     * Çıkış
     */
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Giriş yapılmış mı kontrol
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },

    /**
     * Mevcut kullanıcıyı localStorage'dan al
     */
    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    /**
     * E-posta kontrolü (şifre sıfırlama için)
     */
    checkEmail: async (data: CheckEmailData): Promise<any> => {
        const response = await api.post('/auth/check-email', data);
        return response.data;
    },

    /**
     * Şifre sıfırlama
     */
    resetPassword: async (data: ResetPasswordData): Promise<any> => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },

};
