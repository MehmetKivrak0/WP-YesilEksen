import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Vite için import.meta.env kullanılmalı (process.env değil)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // FormData gönderiliyorsa Content-Type'ı otomatik ayarla
        // (Axios otomatik olarak multipart/form-data yapar ve boundary ekler)
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Login endpoint'i için 401 hatası geliyorsa yönlendirme yapma
            // (email/şifre hatalı durumunda kullanıcı zaten login sayfasında olmalı)
            const isLoginEndpoint = error.config?.url?.includes('/auth/login');
            
            if (!isLoginEndpoint) {
                // Token geçersiz veya süresi dolmuş - sadece login sayfasında değilsek yönlendir
                const currentPath = window.location.pathname;
                if (currentPath !== '/giris' && currentPath !== '/kayit') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/giris';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;