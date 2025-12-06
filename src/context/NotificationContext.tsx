import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { notificationService, type Notification } from '../services/notificationService';

// Context tipi
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

// Context oluştur
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Tarih formatlama fonksiyonu
const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Bilinmeyen';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
  } catch (error) {
    return dateString; // Hata durumunda orijinal değeri döndür
  }
};

// Provider bileşeni
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bildirimleri yükle
  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await notificationService.getNotifications();

      if (response.success && response.notifications) {
        // Tarihleri formatla
        const formattedNotifications = response.notifications.map(notif => ({
          ...notif,
          tarih: notif.createdAt 
            ? formatRelativeTime(notif.createdAt)
            : (notif.tarih || 'Bilinmeyen'),
        }));

        setNotifications(formattedNotifications);
        
        // Okunmamış sayısını güncelle
        if (response.unreadCount !== undefined) {
          setUnreadCount(response.unreadCount);
        } else {
          setUnreadCount(formattedNotifications.filter(n => !n.okundu).length);
        }
      } else {
        setError(response.message || 'Bildirimler yüklenemedi');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Bildirimler yüklenirken hata:', err);
      setError('Bildirimler yüklenirken bir hata oluştu');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Polling kaldırıldı - Sadece gerektiğinde refreshNotifications() çağrılacak

  // Bildirimleri yenile
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Okundu işaretle
  const markAsRead = useCallback(async (id: string | number) => {
    const result = await notificationService.markAsRead(id);
    
    if (result.success) {
      // Optimistik güncelleme
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, okundu: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Tümünü okundu işaretle
  const markAllAsRead = useCallback(async () => {
    const result = await notificationService.markAllAsRead();
    
    if (result.success) {
      setNotifications(prev => prev.map(notif => ({ ...notif, okundu: true })));
      setUnreadCount(0);
    }
  }, []);

  // Bildirim sil
  const deleteNotification = useCallback(async (id: string | number) => {
    const result = await notificationService.deleteNotification(id);
    
    if (result.success) {
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Eğer silinen bildirim okunmamışsa, sayıyı güncelle
      if (deletedNotif && !deletedNotif.okundu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [notifications]);

  // Tümünü sil
  const deleteAllNotifications = useCallback(async () => {
    const result = await notificationService.deleteAllNotifications();
    
    if (result.success) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook - Context'i kullanmak için
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

