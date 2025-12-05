import api from './api';

// Bildirim tipi
export type NotificationType = 'urun' | 'siparis' | 'ciftlik' | 'onay' | 'sistem' | 'teklif' | 'belge';

// Bildirim interface
export interface Notification {
  id: string | number;
  baslik: string;
  mesaj: string;
  tarih: string;
  okundu: boolean;
  tip: NotificationType;
  link?: string; // Bildirime tıklandığında gidilecek sayfa
  createdAt?: string; // ISO tarih formatı
}

// Bildirim listesi response
export interface NotificationsResponse {
  success: boolean;
  notifications?: Notification[];
  unreadCount?: number;
  message?: string;
}

// Bildirim servisi
export const notificationService = {
  /**
   * Tüm bildirimleri getir
   */
  getNotifications: async (): Promise<NotificationsResponse> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('Bildirimler yüklenirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Bildirimler yüklenirken bir hata oluştu',
      };
    }
  },

  /**
   * Okunmamış bildirim sayısını getir
   */
  getUnreadCount: async (): Promise<{ success: boolean; count?: number; message?: string }> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      console.error('Okunmamış bildirim sayısı yüklenirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Okunmamış bildirim sayısı yüklenirken bir hata oluştu',
      };
    }
  },

  /**
   * Bildirimi okundu olarak işaretle
   */
  markAsRead: async (notificationId: string | number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Bildirim okundu işaretlenirken bir hata oluştu',
      };
    }
  },

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  markAllAsRead: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Bildirimler okundu işaretlenirken bir hata oluştu',
      };
    }
  },

  /**
   * Bildirimi sil
   */
  deleteNotification: async (notificationId: string | number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim silinirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Bildirim silinirken bir hata oluştu',
      };
    }
  },

  /**
   * Tüm bildirimleri sil
   */
  deleteAllNotifications: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('Tüm bildirimler silinirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Bildirimler silinirken bir hata oluştu',
      };
    }
  },
};

