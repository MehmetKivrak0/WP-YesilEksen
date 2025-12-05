import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ZrtnNavbar from '../../../../components/zrtnavbar';
import { ziraatService } from '../../../../services/ziraatService';
import { useToast } from '../../../../context/ToastContext';
import { useNotifications } from '../../../../context/NotificationContext';

type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi' | 'Güncel Belge';

type ProductApplication = {
  id: string;
  product: string;
  applicant: string;
  category: string;
  status: 'Onaylandı' | 'İncelemede' | 'Revizyon' | 'Reddedildi';
  submittedAt: string;
  lastUpdate: string;
  notes: string;
  farm: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  documents: Array<{
    name: string;
    status: DocumentStatus;
    url?: string;
    belgeId?: string;
    farmerNote?: string;
    adminNote?: string;
  }>;
};

// Tarih formatlama helper
const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
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
};

// Backend durumunu frontend durumuna çevir
const mapStatus = (backendStatus: string): 'Onaylandı' | 'İncelemede' | 'Revizyon' | 'Reddedildi' => {
  if (backendStatus === 'onaylandi') return 'Onaylandı';
  if (backendStatus === 'revizyon') return 'Revizyon';
  if (backendStatus === 'reddedildi') return 'Reddedildi';
  return 'İncelemede';
};

const statusColors: Record<string, string> = {
  Onaylandı: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  İncelemede: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  Revizyon: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
};

function ProductApplicationsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading, 
    markAsRead, 
    deleteNotification, 
    deleteAllNotifications, 
    refreshNotifications 
  } = useNotifications();
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'Hepsi' | keyof typeof statusColors>('İncelemede');
  const [applications, setApplications] = useState<ProductApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectedApplication, setInspectedApplication] = useState<ProductApplication | null>(null);
  const [rejectedApplication, setRejectedApplication] = useState<ProductApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [documentReviews, setDocumentReviews] = useState<Record<string, { status: DocumentStatus; reason?: string }>>({});
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [belgeEksikModalOpen, setBelgeEksikModalOpen] = useState(false);
  const [selectedApplicationForBelgeEksik, setSelectedApplicationForBelgeEksik] = useState<ProductApplication | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [documentMessages, setDocumentMessages] = useState<Record<string, { farmerMessage: string; adminNote: string }>>({});
  const [belgeEksikLoading, setBelgeEksikLoading] = useState(false);
  const [belgeEksikError, setBelgeEksikError] = useState<string | null>(null);

  // Verileri yükle
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const statusFilter = selectedStatus === 'Hepsi' ? undefined : 
          selectedStatus === 'Onaylandı' ? 'onaylandi' :
          selectedStatus === 'Revizyon' ? 'revizyon' :
          selectedStatus === 'Reddedildi' ? 'reddedildi' : 'incelemede';
        
        const response = await ziraatService.getProductApplications({
          page: 1,
          limit: 100,
          status: statusFilter,
        });

        if (response.success) {
          // Backend verilerini frontend formatına dönüştür
          const mappedApplications: ProductApplication[] = response.applications.map((app: any) => ({
            id: app.id,
            product: app.name || app.urun_adi || 'Ürün Adı Yok',
            applicant: app.applicant || app.basvuran_adi || 'Başvuran Yok',
            category: app.sector || 'Kategori Yok',
            status: mapStatus(app.status),
            submittedAt: app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : '',
            lastUpdate: app.lastUpdate ? formatRelativeTime(app.lastUpdate) : 'Bilinmiyor',
            notes: app.description || app.notlar || '',
            farm: app.farmName || app.sector || 'Çiftlik Adı Yok',
            contact: {
              name: app.contactName || app.applicant || 'İsim Yok',
              phone: app.phone || 'Telefon Yok',
              email: app.email || 'E-posta Yok',
            },
            documents: (app.documents || []).map((doc: any) => ({
              name: doc.name || 'Belge',
              status: (doc.status || 'Beklemede') as DocumentStatus,
              url: doc.url,
              belgeId: doc.belgeId,
              farmerNote: doc.farmerNote,
              adminNote: doc.adminNote,
            })),
          }));
          setApplications(mappedApplications);
        } else {
          setError('Başvurular yüklenemedi');
        }
      } catch (err: any) {
        console.error('Başvurular yükleme hatası:', err);
        const errorMessage = err.response?.data?.error?.detail || 
                           err.response?.data?.error?.message || 
                           err.response?.data?.message || 
                           err.message || 
                           'Başvurular yüklenirken bir hata oluştu';
        setError(errorMessage);
        if (err.response?.data?.error) {
          console.error('Backend hata detayı:', err.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [selectedStatus]);

  const filteredApplications =
    selectedStatus === 'Hepsi'
      ? applications
      : applications.filter((application) => application.status === selectedStatus);

  const closeInspectModal = () => setInspectedApplication(null);
  
  const handleApprove = async (applicationId: string) => {
    try {
      setIsApproving(applicationId);
      await ziraatService.approveProduct(applicationId);
      
      // Başvuruları yeniden yükle
      const response = await ziraatService.getProductApplications({
        page: 1,
        limit: 100,
        status: selectedStatus === 'Hepsi' ? undefined : 
          selectedStatus === 'Onaylandı' ? 'onaylandi' :
          selectedStatus === 'Revizyon' ? 'revizyon' :
          selectedStatus === 'Reddedildi' ? 'reddedildi' : 'incelemede',
      });

      if (response.success) {
        const mappedApplications: ProductApplication[] = response.applications.map((app: any) => ({
          id: app.id,
          product: app.name || app.urun_adi || 'Ürün Adı Yok',
          applicant: app.applicant || app.basvuran_adi || 'Başvuran Yok',
          category: app.sector || 'Kategori Yok',
          status: mapStatus(app.status),
          submittedAt: app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : '',
          lastUpdate: app.lastUpdate ? formatRelativeTime(app.lastUpdate) : 'Bilinmiyor',
          notes: app.description || app.notlar || '',
          farm: app.farmName || app.sector || 'Çiftlik Adı Yok',
          contact: {
            name: app.contactName || app.applicant || 'İsim Yok',
            phone: app.phone || 'Telefon Yok',
            email: app.email || 'E-posta Yok',
          },
          documents: (app.documents || []).map((doc: any) => ({
            name: doc.name || 'Belge',
            status: (doc.status || 'Beklemede') as DocumentStatus,
            url: doc.url,
            belgeId: doc.belgeId,
            farmerNote: doc.farmerNote,
            adminNote: doc.adminNote,
          })),
        }));
        setApplications(mappedApplications);
        toast.success('Ürün başvurusu başarıyla onaylandı');
      }
    } catch (err: any) {
      console.error('Onaylama hatası:', err);
      toast.error(err.response?.data?.message || 'Onaylama işlemi başarısız');
    } finally {
      setIsApproving(null);
    }
  };

  const handleRejectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectedApplication || !rejectReason.trim()) {
      toast.warning('Lütfen red nedeni girin');
      return;
    }

    try {
      setIsRejecting(rejectedApplication.id);
      await ziraatService.rejectProduct(rejectedApplication.id, { reason: rejectReason });
      
      // Başvuruları yeniden yükle
      const response = await ziraatService.getProductApplications({
        page: 1,
        limit: 100,
        status: selectedStatus === 'Hepsi' ? undefined : 
          selectedStatus === 'Onaylandı' ? 'onaylandi' :
          selectedStatus === 'Revizyon' ? 'revizyon' :
          selectedStatus === 'Reddedildi' ? 'reddedildi' : 'incelemede',
      });

      if (response.success) {
        const mappedApplications: ProductApplication[] = response.applications.map((app: any) => ({
          id: app.id,
          product: app.name || app.urun_adi || 'Ürün Adı Yok',
          applicant: app.applicant || app.basvuran_adi || 'Başvuran Yok',
          category: app.sector || 'Kategori Yok',
          status: mapStatus(app.status),
          submittedAt: app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : '',
          lastUpdate: app.lastUpdate ? formatRelativeTime(app.lastUpdate) : 'Bilinmiyor',
          notes: app.description || app.notlar || '',
          farm: app.farmName || app.sector || 'Çiftlik Adı Yok',
          contact: {
            name: app.contactName || app.applicant || 'İsim Yok',
            phone: app.phone || 'Telefon Yok',
            email: app.email || 'E-posta Yok',
          },
          documents: (app.documents || []).map((doc: any) => ({
            name: doc.name || 'Belge',
            status: (doc.status || 'Beklemede') as DocumentStatus,
            url: doc.url,
            belgeId: doc.belgeId,
            farmerNote: doc.farmerNote,
            adminNote: doc.adminNote,
          })),
        }));
        setApplications(mappedApplications);
        toast.success('Ürün başvurusu reddedildi');
      }
      
      setRejectedApplication(null);
      setRejectReason('');
    } catch (err: any) {
      console.error('Reddetme hatası:', err);
      toast.error(err.response?.data?.message || 'Reddetme işlemi başarısız');
    } finally {
      setIsRejecting(null);
    }
  };

  useEffect(() => {
    if (!inspectedApplication) {
      setDocumentReviews({});
      return;
    }

    const initial = inspectedApplication.documents.reduce<Record<string, { status: DocumentStatus; reason?: string }>>(
      (acc, doc) => {
        acc[doc.name] = { status: doc.status, reason: doc.farmerNote };
        return acc;
      },
      {},
    );

    setDocumentReviews(initial);
  }, [inspectedApplication]);

  // Belge URL'ini normalize et
  const normalizeDocumentUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    
    const cleanBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const urlObj = new URL(url);
        if (urlObj.pathname.includes('/uploads/')) {
          const relativePath = urlObj.pathname.split('/uploads/')[1];
          return `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(relativePath)}`;
        } else {
          return `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(urlObj.pathname.substring(1))}`;
        }
      } catch (e) {
        if (url.includes('/uploads/')) {
          const relativePath = url.split('/uploads/')[1];
          return `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(relativePath)}`;
        }
      }
    } else {
      const cleanPath = url.startsWith('/') ? url.substring(1) : url;
      return `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(cleanPath)}`;
    }
    
    return url;
  };

  const updateDocumentStatus = async (belgeId: string, name: string, status: DocumentStatus, reason?: string) => {
    if (!belgeId) {
      // Eğer belgeId yoksa sadece local state'i güncelle
      setDocumentReviews((prev) => ({
        ...prev,
        [name]: {
          status,
          reason: status === 'Reddedildi' ? prev[name]?.reason : undefined,
        },
      }));
      return;
    }

    try {
      // Backend API'ye istek gönder
      const backendStatus = status === 'Onaylandı' ? 'onaylandi' :
                           status === 'Reddedildi' ? 'reddedildi' :
                           status === 'Eksik' ? 'eksik' : 'beklemede';
      
      await ziraatService.updateDocumentStatus(belgeId, {
        status: backendStatus,
        reason: reason,
        adminNote: reason || '',
      });

      // Local state'i güncelle
      setDocumentReviews((prev) => ({
        ...prev,
        [name]: {
          status,
          reason: status === 'Reddedildi' ? reason : undefined,
        },
      }));

      // Başvuruları yeniden yükle
      const response = await ziraatService.getProductApplications({
        page: 1,
        limit: 100,
        status: selectedStatus === 'Hepsi' ? undefined : 
          selectedStatus === 'Onaylandı' ? 'onaylandi' :
          selectedStatus === 'Revizyon' ? 'revizyon' :
          selectedStatus === 'Reddedildi' ? 'reddedildi' : 'incelemede',
      });

      if (response.success && inspectedApplication) {
        const updatedApp = response.applications.find((app: any) => app.id === inspectedApplication.id);
        if (updatedApp) {
          const mappedApp: ProductApplication = {
            id: updatedApp.id,
            product: updatedApp.name || updatedApp.urun_adi || 'Ürün Adı Yok',
            applicant: updatedApp.applicant || updatedApp.basvuran_adi || 'Başvuran Yok',
            category: updatedApp.sector || 'Kategori Yok',
            status: mapStatus(updatedApp.status),
            submittedAt: updatedApp.applicationDate ? new Date(updatedApp.applicationDate).toISOString().split('T')[0] : '',
            lastUpdate: updatedApp.lastUpdate ? formatRelativeTime(updatedApp.lastUpdate) : 'Bilinmiyor',
            notes: updatedApp.description || updatedApp.notlar || '',
            farm: updatedApp.farmName || updatedApp.sector || 'Çiftlik Adı Yok',
            contact: {
              name: updatedApp.contactName || updatedApp.applicant || 'İsim Yok',
              phone: updatedApp.phone || 'Telefon Yok',
              email: updatedApp.email || 'E-posta Yok',
            },
            documents: (updatedApp.documents || []).map((doc: any) => ({
              name: doc.name || 'Belge',
              status: (doc.status || 'Beklemede') as DocumentStatus,
              url: doc.url,
              belgeId: doc.belgeId,
              farmerNote: doc.farmerNote,
              adminNote: doc.adminNote,
            })),
          };
          setInspectedApplication(mappedApp);
        }
      }
    } catch (err: any) {
      console.error('Belge durumu güncelleme hatası:', err);
      toast.error(err.response?.data?.message || 'Belge durumu güncellenemedi');
    }
  };

  const updateDocumentReason = (name: string, reason: string) => {
    setDocumentReviews((prev) => ({
      ...prev,
      [name]: {
        status: prev[name]?.status ?? 'Reddedildi',
        reason,
      },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark">
      <ZrtnNavbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Ürün Onay Başvuruları</h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Ziraat Odası’na iletilen ürün başvurularını inceleyin, durumlarını güncelleyin.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark" htmlFor="status-filter">
                Durum Filtresi
              </label>
              <select
                id="status-filter"
                className="p-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as typeof selectedStatus)}
              >
                <option value="Hepsi">Hepsi</option>
                <option value="İncelemede">İncelemede</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Revizyon">Revizyon</option>
              </select>
              
              {/* Bildirim Butonu */}
              <div
                className="relative"
                onMouseEnter={() => setIsNotificationMenuOpen(true)}
                onMouseLeave={() => setIsNotificationMenuOpen(false)}
              >
                <button
                  className="p-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors relative"
                  type="button"
                  onClick={() => {
                    setIsNotificationMenuOpen((prev) => {
                      if (!prev) {
                        refreshNotifications();
                      }
                      return !prev;
                    });
                  }}
                >
                  <span className="material-symbols-outlined text-content-light dark:text-content-dark">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </button>
                {isNotificationMenuOpen && (
                  <div
                    className="absolute right-0 top-full pt-1 z-[100] w-80"
                    onMouseEnter={() => setIsNotificationMenuOpen(true)}
                    onMouseLeave={() => setIsNotificationMenuOpen(false)}
                  >
                    <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg pointer-events-auto max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark sticky top-0 bg-background-light dark:bg-background-dark">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-content-light dark:text-content-dark">Bildirimler</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 dark:bg-primary/30 text-primary text-xs font-medium">
                              {unreadCount} yeni
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="py-2">
                        {notificationsLoading ? (
                          <div className="px-4 py-8 text-center">
                            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-4xl mb-2 block animate-spin">sync</span>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">Bildirimler yükleniyor...</p>
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((bildirim) => (
                            <div
                              key={bildirim.id}
                              className={`px-4 py-3 border-b transition-colors ${
                                !bildirim.okundu 
                                  ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50 border-l-4 border-l-amber-500 dark:border-l-amber-400' 
                                  : 'border-border-light/50 dark:border-border-dark/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !bildirim.okundu ? 'bg-amber-500 dark:bg-amber-400 animate-pulse' : 'bg-transparent'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium mb-0.5 ${
                                    !bildirim.okundu 
                                      ? 'text-amber-900 dark:text-amber-100 font-bold' 
                                      : 'text-content-light dark:text-content-dark'
                                  }`}>
                                    {bildirim.baslik}
                                  </p>
                                  <p className={`text-xs line-clamp-2 ${
                                    !bildirim.okundu 
                                      ? 'text-amber-800 dark:text-amber-200' 
                                      : 'text-subtle-light dark:text-subtle-dark'
                                  }`}>
                                    {bildirim.mesaj}
                                  </p>
                                  <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                    {new Date(bildirim.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                <button
                                  onClick={async () => {
                                    await deleteNotification(bildirim.id);
                                  }}
                                  className="p-1 hover:bg-primary/10 dark:hover:bg-primary/20 rounded transition-colors flex-shrink-0"
                                  type="button"
                                  title="Sil"
                                >
                                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">close</span>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-4xl mb-2 block">notifications_none</span>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">Bildirim yok</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-border-light dark:border-border-dark">
                          <button
                            onClick={async () => {
                              await deleteAllNotifications();
                              setIsNotificationMenuOpen(false);
                              toast.success('Tüm bildirimler temizlendi');
                            }}
                            className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
                            type="button"
                          >
                            Tümünü Temizle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Toplam Başvuru</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{applications.length}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Bu ay sisteme girilen tüm başvurular</p>
            </div>
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">İnceleme Sürecinde</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {applications.filter((item) => item.status === 'İncelemede').length}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Uzman görüşü bekleyen başvurular</p>
            </div>
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Onaylanan Ürünler</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {applications.filter((item) => item.status === 'Onaylandı').length}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Satışa açılmasına izin verilen ürünler</p>
            </div>
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Revizyon Bekleyen</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {applications.filter((item) => item.status === 'Revizyon').length}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Ek belge/tasarım istenen başvurular</p>
            </div>
          </div>

          <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
            <div className="flex flex-col gap-4 border-b border-border-light dark:border-border-dark px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Başvuru Listesi</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Filtreye göre görüntülenen {filteredApplications.length} başvuru
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30">
                  <span className="material-symbols-outlined text-base">download</span>
                  Rapor İndir
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-background-light dark:bg-background-dark">
                  <tr className="text-xs uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                    <th className="px-6 py-3 text-left">Ürün</th>
                    <th className="px-6 py-3 text-left">Başvuru Sahibi</th>
                    <th className="px-6 py-3 text-left">Kategori</th>
                    <th className="px-6 py-3 text-left">Durum</th>
                    <th className="px-6 py-3 text-left">Başvuru Tarihi</th>
                    <th className="px-6 py-3 text-left">Son Güncelleme</th>
                    <th className="px-6 py-3 text-left">Notlar</th>
                    <th className="px-6 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-subtle-light dark:text-subtle-dark">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                          <span>Başvurular yükleniyor...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-red-600 dark:text-red-400">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl">error</span>
                          <span>{error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-subtle-light dark:text-subtle-dark">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl">inbox</span>
                          <span>Henüz başvuru bulunmuyor</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-content-light dark:text-content-dark">{application.product}</td>
                        <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.applicant}</td>
                        <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.category}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              statusColors[application.status] ?? 'bg-muted text-content-light'
                            }`}
                          >
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.submittedAt}</td>
                        <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.lastUpdate}</td>
                        <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.notes}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                            <button
                              className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30"
                              onClick={() => setInspectedApplication(application)}
                            >
                              İncele
                            </button>
                            {application.status === 'İncelemede' && (
                              <button
                                className="rounded-full border border-amber-500/40 bg-amber-50 dark:bg-amber-900/20 px-4 py-1 text-sm font-medium text-amber-700 dark:text-amber-300 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                                onClick={() => {
                                  setSelectedApplicationForBelgeEksik(application);
                                  setBelgeEksikModalOpen(true);
                                }}
                              >
                                <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                Eksik Belge
                              </button>
                            )}
                            <button
                              className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleApprove(application.id)}
                              disabled={isApproving === application.id || application.status === 'Onaylandı'}
                            >
                              {isApproving === application.id ? 'Onaylanıyor...' : 'Onayla'}
                            </button>
                            <button
                              className="rounded-full bg-red-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-red-500 dark:hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setRejectedApplication(application)}
                              disabled={isRejecting === application.id || application.status === 'Reddedildi'}
                            >
                              Reddet
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {inspectedApplication && (
        <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/40 px-4 py-8 sm:px-8">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-2xl">
            <button
              className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 z-10"
              onClick={closeInspectModal}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="max-h-[85vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">
                  {inspectedApplication.product}
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Başvuran: {inspectedApplication.applicant} • Başvuru Tarihi: {inspectedApplication.submittedAt}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
                  <h3 className="text-sm font-semibold text-content-light dark:text-content-dark mb-3">
                    Çiftlik Bilgileri
                  </h3>
                  <ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Çiftlik:</span>{' '}
                      {inspectedApplication.farm}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Sorumlu:</span>{' '}
                      {inspectedApplication.contact.name}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Telefon:</span>{' '}
                      {inspectedApplication.contact.phone}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">E-Posta:</span>{' '}
                      {inspectedApplication.contact.email}
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
                  <h3 className="text-sm font-semibold text-content-light dark:text-content-dark mb-3">
                    Başvuru Özeti
                  </h3>
                  <ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Kategori:</span>{' '}
                      {inspectedApplication.category}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Son Güncelleme:</span>{' '}
                      {inspectedApplication.lastUpdate}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Durum:</span>{' '}
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[inspectedApplication.status]
                        }`}
                      >
                        {inspectedApplication.status}
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 space-y-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light/40 dark:bg-background-dark/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Notlar
                    </p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">{inspectedApplication.notes}</p>
                    {Object.values(documentReviews)
                      .filter((review) => review.status === 'Reddedildi' && review.reason)
                      .map((review, index) => (
                        <p
                          key={index}
                          className="text-sm text-red-700 dark:text-red-200"
                        >
                          Geçerli Neden: {review.reason}
                        </p>
                      ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border-light dark:border-border-dark p-4 sm:p-6 bg-gradient-to-br from-background-light/50 to-background-light dark:from-background-dark/50 dark:to-background-dark overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">description</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-content-light dark:text-content-dark">
                    Belgeler ve Durumları
                  </h3>
                </div>
                <div className="space-y-3 overflow-x-hidden">
                  {inspectedApplication.documents.map((document) => {
                    const review = documentReviews[document.name] ?? { status: document.status, reason: document.farmerNote };
                    const statusClass =
                      review.status === 'Onaylandı'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                        : review.status === 'Eksik'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                          : review.status === 'Reddedildi'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                            : review.status === 'Güncel Belge'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';

                    return (
                      <div
                        key={document.name}
                        className="flex flex-col gap-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 sm:p-4 hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-lg">
                              {document.url?.match(/\.pdf$/i) ? 'picture_as_pdf' : 'description'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h4 className="text-sm font-semibold text-content-light dark:text-content-dark mb-1 truncate">
                              {document.name}
                            </h4>
                            {document.url && (
                              <p className="text-xs text-subtle-light dark:text-subtle-dark truncate break-all">
                                {document.url.split('/').pop()}
                              </p>
                            )}
                            {document.adminNote && (
                              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 break-words">
                                {document.adminNote}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-medium border whitespace-nowrap ${statusClass}`}>
                            {review.status === 'Onaylandı' && <span className="material-symbols-outlined text-xs">check_circle</span>}
                            {review.status === 'Reddedildi' && <span className="material-symbols-outlined text-xs">cancel</span>}
                            {review.status === 'Eksik' && <span className="material-symbols-outlined text-xs">error</span>}
                            {review.status === 'Güncel Belge' && <span className="material-symbols-outlined text-xs">update</span>}
                            {review.status === 'Beklemede' && <span className="material-symbols-outlined text-xs">schedule</span>}
                            <span className="hidden sm:inline">{review.status}</span>
                            <span className="sm:hidden">{review.status.length > 8 ? review.status.substring(0, 8) + '...' : review.status}</span>
                          </span>
                          {document.url && (() => {
                            const normalizedUrl = normalizeDocumentUrl(document.url);
                            return normalizedUrl ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={normalizedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 active:scale-95 whitespace-nowrap"
                                  title="Yeni sekmede görüntüle"
                                >
                                  <span className="material-symbols-outlined text-sm">visibility</span>
                                  <span className="hidden sm:inline">Görüntüle</span>
                                  <span className="sm:hidden">Gör</span>
                                </a>
                                <a
                                  href={`${normalizedUrl}?download=true`}
                                  download
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 active:scale-95 whitespace-nowrap"
                                  title="İndir"
                                >
                                  <span className="material-symbols-outlined text-sm">download</span>
                                  <span className="hidden sm:inline">İndir</span>
                                  <span className="sm:hidden">İnd</span>
                                </a>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    );
                  })}
                  {inspectedApplication.documents.length === 0 && (
                    <div className="text-center py-8 text-subtle-light dark:text-subtle-dark">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                      <p className="text-sm">Henüz belge yüklenmemiş</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  className="rounded-lg border border-primary/30 bg-primary/10 px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                  onClick={closeInspectModal}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectedApplication && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Reddet ve Bilgilendir</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {rejectedApplication.product} başvurusu için reddetme nedenini belirterek üreticiyi bilgilendirin.
                </p>
              </div>
              <button
                className="flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                onClick={() => {
                  setRejectedApplication(null);
                  setRejectReason('');
                }}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleRejectSubmit}>
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2" htmlFor="reject-reason">
                  Geçerli Neden
                </label>
                <textarea
                  id="reject-reason"
                  required
                  rows={4}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-content-light dark:text-content-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Örneğin: İçerik analiz raporunda belirtilen değerler mevzuata uygun değil..."
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2" htmlFor="owner-message">
                  Çiftlik Sahibine Mesaj
                </label>
                <textarea
                  id="owner-message"
                  rows={4}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-content-light dark:text-content-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`${rejectedApplication.contact.name} için ileti: Reddetme nedenini ve düzeltme için talimatları paylaşın.`}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                  onClick={() => {
                    setRejectedApplication(null);
                    setRejectReason('');
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRejecting === rejectedApplication?.id || !rejectReason.trim()}
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  {isRejecting === rejectedApplication?.id ? 'Gönderiliyor...' : 'Reddi Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eksik Belge Modal */}
      {belgeEksikModalOpen && selectedApplicationForBelgeEksik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-2xl flex flex-col">
            <button
              className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 z-10"
              onClick={() => {
                setBelgeEksikModalOpen(false);
                setSelectedApplicationForBelgeEksik(null);
                setSelectedDocuments(new Set());
                setDocumentMessages({});
                setBelgeEksikError(null);
              }}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="p-6 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">error</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                    Eksik Belge Bildirimi
                  </h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                    {selectedApplicationForBelgeEksik.product} - {selectedApplicationForBelgeEksik.applicant}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              <div className="space-y-4">
                {belgeEksikError && (
                  <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                    {belgeEksikError}
                  </div>
                )}
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Bilgi:</strong> Eksik belge bildirimi göndermek için aşağıdaki belgelerden eksik olanları seçin ve çiftçiye mesaj yazın.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-content-light dark:text-content-dark">
                    Belgeler
                  </h3>
                  {selectedApplicationForBelgeEksik.documents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedApplicationForBelgeEksik.documents.map((document) => {
                        const isSelected = document.belgeId ? selectedDocuments.has(document.belgeId) : false;
                        const normalizedStatus = (document.status || '').toLowerCase();
                        const hasFarmerNote = Boolean(document.farmerNote && document.farmerNote.trim());
                        const isAlreadyMissing = normalizedStatus.includes('eksik') || hasFarmerNote;
                        const isChecked = isSelected || isAlreadyMissing;
                        const documentUrl = document.url ? normalizeDocumentUrl(document.url) : null;
                        const isImage = document.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const isPdf = document.url?.match(/\.pdf$/i);

                        return (
                          <div
                            key={document.belgeId || document.name}
                            className={`rounded-lg border-2 p-4 transition-all ${
                              isChecked
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20'
                                : 'border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark'
                            }`}
                          >
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (document.belgeId && !isAlreadyMissing) {
                                    setSelectedDocuments(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(document.belgeId!)) {
                                        newSet.delete(document.belgeId!);
                                        setDocumentMessages(prev => {
                                          const newMessages = { ...prev };
                                          delete newMessages[document.belgeId!];
                                          return newMessages;
                                        });
                                      } else {
                                        newSet.add(document.belgeId!);
                                        setDocumentMessages(prev => ({
                                          ...prev,
                                          [document.belgeId!]: { farmerMessage: '', adminNote: '' }
                                        }));
                                      }
                                      return newSet;
                                    });
                                  }
                                }}
                                className="mt-1 h-4 w-4 rounded border-border-light text-primary focus:ring-primary dark:border-border-dark"
                                disabled={!document.belgeId || isAlreadyMissing}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  {/* Belge Önizleme */}
                                  {documentUrl && (
                                    <div className="flex-shrink-0">
                                      {isImage ? (
                                        <img
                                          src={documentUrl}
                                          alt={document.name}
                                          className="w-20 h-20 object-cover rounded-lg border border-border-light dark:border-border-dark"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      ) : isPdf ? (
                                        <div className="w-20 h-20 rounded-lg border border-border-light dark:border-border-dark bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                          <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">picture_as_pdf</span>
                                        </div>
                                      ) : (
                                        <div className="w-20 h-20 rounded-lg border border-border-light dark:border-border-dark bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                          <span className="material-symbols-outlined text-primary text-3xl">description</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-content-light dark:text-content-dark mb-1">
                                      {document.name}
                                    </div>
                                    {document.status && (
                                      <div className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                                        Durum: {isAlreadyMissing ? 'Belge Bekleniyor' : document.status}
                                      </div>
                                    )}
                                    {isAlreadyMissing && (
                                      <div className="mt-2 rounded-lg bg-amber-100/70 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
                                        <p className="font-medium">Bu belge eksik olarak işaretlenmiş.</p>
                                        <p>Çiftçinin güncellemesi bekleniyor; yeni mesaj eklenemez.</p>
                                        {hasFarmerNote && (
                                          <p className="mt-2 text-[11px] text-amber-950/80 dark:text-amber-50">
                                            <span className="font-semibold">Çiftçiye iletilen mesaj:</span> {document.farmerNote}
                                          </p>
                                        )}
                                        {document.adminNote && (
                                          <p className="mt-1 text-[11px] text-amber-950/80 dark:text-amber-50">
                                            <span className="font-semibold">Admin notu:</span> {document.adminNote}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Her belge için çiftçi mesajı ve admin notu */}
                                    {isSelected && document.belgeId && !isAlreadyMissing && (
                                      <div className="mt-3 space-y-3">
                                        {/* Çiftçiye Gidecek Mesaj */}
                                        <div>
                                          <label className="mb-1 block text-xs font-medium text-content-light dark:text-content-dark">
                                            Çiftçiye Gidecek Mesaj *
                                          </label>
                                          <textarea
                                            value={documentMessages[document.belgeId]?.farmerMessage || ''}
                                            onChange={(e) => {
                                              setDocumentMessages(prev => ({
                                                ...prev,
                                                [document.belgeId!]: {
                                                  ...(prev[document.belgeId!] || { farmerMessage: '', adminNote: '' }),
                                                  farmerMessage: e.target.value
                                                }
                                              }));
                                            }}
                                            placeholder={`${document.name} için çiftçiye gönderilecek mesajı yazın...`}
                                            rows={3}
                                            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-2 text-xs text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:text-content-dark"
                                            required
                                          />
                                        </div>
                                        
                                        {/* Admin Notu */}
                                        <div>
                                          <label className="mb-1 block text-xs font-medium text-content-light dark:text-content-dark">
                                            Admin Notu (Opsiyonel)
                                          </label>
                                          <textarea
                                            value={documentMessages[document.belgeId]?.adminNote || ''}
                                            onChange={(e) => {
                                              setDocumentMessages(prev => ({
                                                ...prev,
                                                [document.belgeId!]: {
                                                  ...(prev[document.belgeId!] || { farmerMessage: '', adminNote: '' }),
                                                  adminNote: e.target.value
                                                }
                                              }));
                                            }}
                                            placeholder={`${document.name} için admin notu yazın (sadece admin görür)...`}
                                            rows={2}
                                            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-2 text-xs text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:text-content-dark"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-subtle-light dark:text-subtle-dark text-center py-4">
                      Bu başvuru için belge bulunmuyor.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border-light dark:border-border-dark flex items-center justify-end gap-3">
              <button
                className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                onClick={() => {
                  setBelgeEksikModalOpen(false);
                  setSelectedApplicationForBelgeEksik(null);
                  setSelectedDocuments(new Set());
                  setDocumentMessages({});
                  setBelgeEksikError(null);
                }}
                disabled={belgeEksikLoading}
              >
                İptal
              </button>
              <button
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={async () => {
                  if (selectedDocuments.size === 0) {
                    setBelgeEksikError('Lütfen en az bir belge seçin');
                    return;
                  }

                  const missingMessages: string[] = [];
                  const belgeMessages: Array<{ belgeId: string; farmerMessage: string; adminNote: string }> = [];
                  
                  selectedDocuments.forEach(belgeId => {
                    const messageData = documentMessages[belgeId];
                    const farmerMessage = messageData?.farmerMessage?.trim() || '';
                    const adminNote = messageData?.adminNote?.trim() || '';
                    
                    if (!farmerMessage) {
                      const doc = selectedApplicationForBelgeEksik?.documents.find(d => d.belgeId === belgeId);
                      missingMessages.push(doc?.name || belgeId);
                    } else {
                      belgeMessages.push({ 
                        belgeId, 
                        farmerMessage,
                        adminNote 
                      });
                    }
                  });

                  if (missingMessages.length > 0) {
                    setBelgeEksikError(`Lütfen şu belgeler için çiftçiye mesaj yazın: ${missingMessages.join(', ')}`);
                    return;
                  }

                  setBelgeEksikLoading(true);
                  setBelgeEksikError(null);
                  try {
                    // Backend API'ye eksik belge mesajı gönder
                    await ziraatService.sendProductBelgeEksikMessage(selectedApplicationForBelgeEksik.id, { belgeMessages });
                    toast.success('Eksik belge bildirimi başarıyla gönderildi');
                    
                    // Başvuruları yeniden yükle
                    const response = await ziraatService.getProductApplications({
                      page: 1,
                      limit: 100,
                      status: selectedStatus === 'Hepsi' ? undefined : 
                        selectedStatus === 'Onaylandı' ? 'onaylandi' :
                        selectedStatus === 'Revizyon' ? 'revizyon' :
                        selectedStatus === 'Reddedildi' ? 'reddedildi' : 'incelemede',
                    });

                    if (response.success) {
                      const mappedApplications: ProductApplication[] = response.applications.map((app: any) => ({
                        id: app.id,
                        product: app.name || app.urun_adi || 'Ürün Adı Yok',
                        applicant: app.applicant || app.basvuran_adi || 'Başvuran Yok',
                        category: app.sector || 'Kategori Yok',
                        status: mapStatus(app.status),
                        submittedAt: app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : '',
                        lastUpdate: app.lastUpdate ? formatRelativeTime(app.lastUpdate) : 'Bilinmiyor',
                        notes: app.description || app.notlar || '',
                        farm: app.farmName || app.sector || 'Çiftlik Adı Yok',
                        contact: {
                          name: app.contactName || app.applicant || 'İsim Yok',
                          phone: app.phone || 'Telefon Yok',
                          email: app.email || 'E-posta Yok',
                        },
                        documents: (app.documents || []).map((doc: any) => ({
                          name: doc.name || 'Belge',
                          status: (doc.status || 'Beklemede') as DocumentStatus,
                          url: doc.url,
                          belgeId: doc.belgeId,
                          farmerNote: doc.farmerNote,
                          adminNote: doc.adminNote,
                        })),
                      }));
                      setApplications(mappedApplications);
                    }

                    setBelgeEksikModalOpen(false);
                    setSelectedApplicationForBelgeEksik(null);
                    setSelectedDocuments(new Set());
                    setDocumentMessages({});
                  } catch (err: any) {
                    console.error('Belge eksik mesajı gönderme hatası:', err);
                    setBelgeEksikError(err.response?.data?.message || 'Belge eksik mesajı gönderilemedi');
                  } finally {
                    setBelgeEksikLoading(false);
                  }
                }}
                disabled={belgeEksikLoading || selectedDocuments.size === 0}
              >
                {belgeEksikLoading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Gönder ve Belge Eksik Yap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductApplicationsPage;

