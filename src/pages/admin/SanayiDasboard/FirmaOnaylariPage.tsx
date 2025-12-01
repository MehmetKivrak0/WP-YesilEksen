import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SanayiNavbar from "./components/SanayiNavbar";
import { sanayiService } from "../../../services/sanayiService";
import type { CompanyApplication } from "../../../services/sanayiService";
import api from "../../../services/api";

const MATERIAL_SYMBOLS_STYLES = `
  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
`;

const MATERIAL_SYMBOLS_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";

const MATERIAL_SYMBOLS_FONT_ID = "sanayi-firma-onay-font-link";
const STYLE_ELEMENT_ID = "sanayi-firma-onay-inline-style";

const FirmaOnaylariPage = () => {
  useEffect(() => {
    document.title = "Firma Onayları - Sanayi Odası";

    let fontLink = document.getElementById(
      MATERIAL_SYMBOLS_FONT_ID,
    ) as HTMLLinkElement | null;

    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = MATERIAL_SYMBOLS_FONT_ID;
      fontLink.rel = "stylesheet";
      fontLink.href = MATERIAL_SYMBOLS_FONT_URL;
      document.head.appendChild(fontLink);
    }

    let styleElement = document.getElementById(STYLE_ELEMENT_ID);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ELEMENT_ID;
      styleElement.textContent = MATERIAL_SYMBOLS_STYLES;
      document.head.appendChild(styleElement);
    }

    return () => {
      const activeFontLink = document.getElementById(
        MATERIAL_SYMBOLS_FONT_ID,
      ) as HTMLLinkElement | null;
      if (activeFontLink?.parentElement === document.head) {
        document.head.removeChild(activeFontLink);
      }

      const activeStyleElement = document.getElementById(STYLE_ELEMENT_ID);
      if (activeStyleElement?.parentElement === document.head) {
        document.head.removeChild(activeStyleElement);
      }
    };
  }, []);

  // Belge indirme fonksiyonu
  const handleDownloadDocument = async (docUrl: string, docName: string) => {
    try {
      // URL'den dosya yolunu çıkar
      const urlMatch = docUrl.match(/\/api\/documents\/file\/(.+)$/);
      if (!urlMatch) {
        console.error('Geçersiz belge URL:', docUrl);
        return;
      }
      
      const filePath = decodeURIComponent(urlMatch[1]);
      
      // Axios ile belgeyi indir (token otomatik eklenir)
      const response = await api.get(`/documents/file/${encodeURIComponent(filePath)}`, {
        responseType: 'blob',
        params: { download: 'true' }
      });
      
      // Dosya adını belirle - her zaman PDF uzantısı ile kaydet
      let downloadFileName = docName || 'belge';
      // Mevcut uzantıyı kaldır ve PDF ekle
      downloadFileName = downloadFileName.replace(/\.[^/.]+$/, '') + '.pdf';
      
      // Blob'u PDF tipi ile oluştur
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Belge indirme hatası:', error);
      if (error.response?.status === 401) {
        alert('Giriş yapmanız gerekiyor. Lütfen tekrar giriş yapın.');
      } else {
        alert('Belge indirilemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const statusBadgeVariants: Record<string, string> = {
    Beklemede:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    İncelemede:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    "Eksik Evrak":
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    Pasif:
      "bg-[#E8F5E9] text-[#2E7D32] dark:bg-[#2E7D32]/20 dark:text-[#4CAF50]",
    Aktif:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Reddedildi:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  
  // API'den veri yükleme
  useEffect(() => {
    loadCompanyApplications();
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await sanayiService.getDashboardStats();
      if (response.success && response.stats) {
        // Onaylanan ve reddedilen firma sayılarını al
        setApprovedCount(response.stats.companySummary?.approved || 0);
        setRejectedCount(response.stats.companySummary?.rejected || 0);
      }
    } catch (err) {
      console.error('Dashboard stats yükleme hatası:', err);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const response = await sanayiService.getActivityLog({ limit: 50 });
      if (response.success && response.activities) {
        // API'den gelen aktiviteleri frontend formatına map et
        const mappedLogs = response.activities.map((activity: any) => {
          // Firma adını bul - backend'den gelen details'ten
          const companyName = activity.details?.firma_adi || 
                            (activity.details?.varlik_id ? 
                              pendingCompanies.find((c: any) => c.id === activity.details.varlik_id)?.name : 
                              null) || 
                            'Bilinmeyen Firma';

          return {
            id: activity.id || `L-${Date.now()}`,
            companyId: activity.details?.varlik_id || '',
            companyName: companyName,
            action: activity.type === 'onay' ? 'Onaylama' : 
                    activity.type === 'red' ? 'Reddetme' : 
                    activity.type === 'durum_degisikligi' ? 'Durum Değişikliği' : 
                    activity.description || 'İşlem',
            details: activity.description || activity.details?.aciklama || '',
            timestamp: activity.timestamp || new Date().toISOString(),
            user: activity.user || 'Sistem',
            fullMessage: activity.description || activity.details?.aciklama || ''
          };
        });
        setActivityLogs(mappedLogs);
      }
    } catch (err) {
      console.error('Aktivite logları yükleme hatası:', err);
      // Hata durumunda mevcut logları koru
    }
  };

  const loadCompanyApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sadece beklemede, incelemede, eksik ve pasif durumlarındaki başvuruları getir
      // Onaylanan başvurular "Şirketler" sayfasında görünecek
      const response = await sanayiService.getCompanyApplications({ 
        limit: 100,
        status: undefined // Backend default olarak beklemede, incelemede, eksik ve pasif getirir
      });
      if (response.success) {
        // API'den gelen verileri frontend formatına map et
        const mappedCompanies = response.applications.map((app: CompanyApplication) => ({
          id: app.id,
          name: app.name,
          applicant: app.owner || 'Bilinmiyor',
          sector: app.sector || 'Sektör Yok',
          submittedAt: app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          timeAgo: app.lastUpdate ? getTimeAgo(new Date(app.lastUpdate)) : 'Bilinmiyor',
          description: app.description || '',
          status: app.status === 'beklemede' ? 'Beklemede' : 
                  app.status === 'onaylandi' ? 'Onaylandı' : 
                  app.status === 'incelemede' ? 'İncelemede' : app.status,
          statusClass: app.status === 'beklemede' ? "text-amber-600 dark:text-amber-300" :
                      app.status === 'incelemede' ? "text-blue-600 dark:text-blue-300" :
                      app.status === 'onaylandi' ? "text-emerald-600 dark:text-emerald-300" :
                      "text-gray-600 dark:text-gray-300",
          email: app.email || '',
          phone: app.phone || '',
          address: '', // Backend'den gelmiyorsa boş
          taxNumber: app.taxNumber || '',
          employeeCount: app.employeeCount || '1-5',
          establishedYear: app.establishmentYear?.toString() || new Date().getFullYear().toString(),
          website: '',
          documents: app.documents?.map(doc => doc.name) || [],
          applicationNumber: app.applicationNumber,
          documentsWithStatus: app.documents || []
        }));
        setPendingCompanies(mappedCompanies);
        
        // Başvurular yüklendikten sonra aktivite loglarını yükle
        await loadActivityLogs();
      }
    } catch (err) {
      console.error('Firma başvuruları yükleme hatası:', err);
      setError('Başvurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return 'Az önce';
  };

  // CSV export fonksiyonu - Aktivite logları
  const exportLogsToCSV = () => {
    if (activityLogs.length === 0) {
      showToast("info", "Bilgi", "Dışa aktarılacak log kaydı bulunmamaktadır.");
      return;
    }

    // CSV başlıkları
    const headers = ['Tarih/Saat', 'Kullanıcı', 'İşlem', 'Şirket', 'Detay'];
    
    // CSV satırları
    const rows = activityLogs.map(log => {
      const logDate = new Date(log.timestamp);
      const formattedDate = logDate.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      return [
        formattedDate,
        log.user || '',
        log.action || '',
        log.companyName || '',
        log.details || ''
      ];
    });

    // CSV içeriğini oluştur
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Hücre içinde virgül, tırnak veya yeni satır varsa tırnak içine al
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // BOM ekle (Excel'de Türkçe karakterler için)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firma-onaylari-aktivite-loglari-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("success", "Başarılı", "Aktivite logları CSV formatında dışa aktarıldı.");
  };


  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [companyToReject, setCompanyToReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionToShow, setDescriptionToShow] = useState<{ companyName: string; fullMessage: string } | null>(null);
  const [fullRejectionMessages, setFullRejectionMessages] = useState<Map<string, string>>(new Map());
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; title: string; message: string } | null>(null);
  const [activityLogs, setActivityLogs] = useState<Array<{
    id: string;
    companyId: string;
    companyName: string;
    action: string;
    details: string;
    timestamp: string;
    user: string;
    fullMessage?: string;
  }>>([
    {
      id: "L-001",
      companyId: "P-1024",
      companyName: "Eko Enerji A.Ş.",
      action: "Reddetme",
      details: "Başvuru reddedildi",
      timestamp: new Date().toISOString(),
      user: "Admin",
      fullMessage: "Sayın Eko Enerji A.Ş. Yetkilileri,\n\nBaşvuru numaranız: P-1024\n\n12 Kasım 2024 tarihinde yapmış olduğunuz üyelik başvurunuz incelenmiş olup, aşağıdaki nedenlerden dolayı maalesef kabul edilememiştir:\n\n• Eksik belgeler\n\nBaşvurunuzla ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.\n\nSaygılarımızla,\nSanayi Odası Yönetimi",
    },
  ]);
  const [isLogDetailModalOpen, setIsLogDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof activityLogs[0] | null>(null);

  const handleInceleClick = (company: any) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const generateRejectionTemplate = (company: any) => {
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `Sayın ${company.name} Yetkilileri,

Başvuru numaranız: ${company.id}

${currentDate} tarihinde yapmış olduğunuz üyelik başvurunuz incelenmiş olup, aşağıdaki nedenlerden dolayı maalesef kabul edilememiştir:

• [Reddetme sebebini buraya yazın]

Başvurunuzla ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.

Saygılarımızla,
Sanayi Odası Yönetimi`;
  };

  const getShortDescription = (fullMessage: string, maxLength: number = 100) => {
    if (fullMessage.length <= maxLength) {
      return fullMessage;
    }
    // İlk satırı veya ilk maxLength karakteri al
    const firstLine = fullMessage.split('\n')[0];
    if (firstLine.length <= maxLength) {
      return firstLine;
    }
    return fullMessage.substring(0, maxLength) + "...";
  };

  const handleReddetClick = (company: any) => {
    setCompanyToReject(company);
    const template = generateRejectionTemplate(company);
    setRejectReason(template);
    setIsRejectModalOpen(true);
    // Eğer detay modalı açıksa kapat
    if (isModalOpen) {
      closeModal();
    }
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setCompanyToReject(null);
    setRejectReason("");
  };

  const handleDescriptionClick = (company: any) => {
    // Eğer reddetme mesajı varsa onu göster, yoksa normal açıklamayı göster
    const fullMessage = fullRejectionMessages.get(company.id) || company.description;
    setDescriptionToShow({
      companyName: company.name,
      fullMessage: fullMessage,
    });
    setIsDescriptionModalOpen(true);
  };

  const closeDescriptionModal = () => {
    setIsDescriptionModalOpen(false);
    setDescriptionToShow(null);
  };

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => prev ? { ...prev, show: false } : null);
      setTimeout(() => setToast(null), 300); // Animasyon için bekle
    }, 5000); // 5 saniye sonra otomatik kapanır
  };

  const closeToast = () => {
    setToast((prev) => prev ? { ...prev, show: false } : null);
    setTimeout(() => setToast(null), 300); // Animasyon için bekle
  };

  const handleLogClick = (log: typeof activityLogs[0]) => {
    setSelectedLog(log);
    setIsLogDetailModalOpen(true);
  };

  const closeLogDetailModal = () => {
    setIsLogDetailModalOpen(false);
    setSelectedLog(null);
  };

  const generateApprovalMessage = (company: any) => {
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `Sayın ${company.name} Yetkilileri,

Başvuru numaranız: ${company.id}

${currentDate} tarihinde yapmış olduğunuz üyelik başvurunuz incelenmiş olup, başvurunuz onaylanmıştır.

Üyeliğiniz aktif edilmiştir. Üyelik haklarınızdan yararlanabilirsiniz.

Herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.

Saygılarımızla,
Sanayi Odası Yönetimi`;
  };

  const handleApproveClick = async (company: any, closeModalAfterSuccess = false) => {
    if (!company || !company.id) {
      showToast("error", "Hata", "Firma bilgisi bulunamadı.");
      return;
    }

    try {
      // Loading state ekle
      setLoading(true);
      
      const approvalMessage = generateApprovalMessage(company);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Onaylama isteği:', {
          companyId: company.id,
          companyName: company.name,
          hasNote: !!approvalMessage
        });
      }

      // Backend API çağrısı
      const response = await sanayiService.approveCompany(company.id, { 
        note: approvalMessage 
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Onaylama yanıtı:', response);
      }

      if (!response.success) {
        throw new Error(response.message || 'Onaylama başarısız');
      }

      // Log kaydı ekle
      const newLog = {
        id: `L-${Date.now()}`,
        companyId: company.id,
        companyName: company.name,
        action: "Onaylama",
        details: "Başvuru onaylandı",
        timestamp: new Date().toISOString(),
        user: "Admin", // TODO: Gerçek kullanıcı bilgisi
        fullMessage: approvalMessage,
      };
      setActivityLogs((prevLogs) => [newLog, ...prevLogs]);

      // Başvuruları ve aktivite loglarını yeniden yükle
      await Promise.all([
        loadCompanyApplications(),
        loadActivityLogs()
      ]);

      // Modal açıksa kapat
      if (closeModalAfterSuccess && isModalOpen) {
        closeModal();
      }

      showToast(
        "success",
        "Onaylama Başarılı",
        `${company.name} firmasının başvurusu onaylandı ve firma yetkilisine mesaj gönderildi.`
      );
    } catch (error: any) {
      console.error("Onaylama sırasında hata oluştu:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Onaylama sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      showToast("error", "Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!companyToReject || !rejectReason.trim()) {
      showToast("error", "Eksik Bilgi", "Lütfen reddetme sebebini belirtin.");
      return;
    }

    try {
      // Loading state ekle
      setLoading(true);
      
      // Backend API çağrısı
      const response = await sanayiService.rejectCompany(companyToReject.id, { 
        reason: rejectReason 
      });

      if (!response.success) {
        throw new Error(response.message || 'Reddetme başarısız');
      }

      // Mesaj gönderme simülasyonu - Toast göster
      showToast(
        "success",
        "Reddetme Başarılı",
        `Reddetme mesajı ${companyToReject.name} firmasına başarıyla gönderildi.`
      );

      // Tam reddetme mesajını Map'e kaydet
      setFullRejectionMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(companyToReject.id, rejectReason);
        return newMap;
      });

      // Log kaydı ekle
      const newLog = {
        id: `L-${Date.now()}`,
        companyId: companyToReject.id,
        companyName: companyToReject.name,
        action: "Reddetme",
        details: `Başvuru reddedildi: ${getShortDescription(rejectReason, 50)}`,
        timestamp: new Date().toISOString(),
        user: "Admin", // TODO: Gerçek kullanıcı bilgisi
        fullMessage: rejectReason,
      };
      setActivityLogs((prevLogs) => [newLog, ...prevLogs]);
      
      // Başvuruları, dashboard stats ve aktivite loglarını yeniden yükle
      await Promise.all([
        loadCompanyApplications(),
        loadDashboardStats(),
        loadActivityLogs()
      ]);

      // Başarılı gönderimden sonra modalı kapat
      closeRejectModal();
    } catch (error: any) {
      console.error("Reddetme sırasında hata oluştu:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Reddetme sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      showToast("error", "Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <SanayiNavbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                to="/admin/sanayi"
                className="mb-4 inline-flex items-center gap-2 text-sm text-subtle-light transition-colors hover:text-primary dark:text-subtle-dark"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Geri Dön
              </Link>
              <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
                Firma Onayları
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Bekleyen firma başvurularını inceleyin, onaylayın veya reddedin
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-full border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Tümünü Onayla
              </button>
              <button className="flex items-center gap-2 rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20">
                <span className="material-symbols-outlined text-base">filter_list</span>
                Filtrele
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mb-6 py-8 text-center text-subtle-light dark:text-subtle-dark">
              Yükleniyor...
            </div>
          ) : error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
                  <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Toplam Başvuru</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                    {pendingCompanies.filter((c) => c.status === "Beklemede" || c.status === "beklemede").length + approvedCount + rejectedCount}
                  </p>
                </div>
                <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
                  <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Bekleyen</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {pendingCompanies.filter((c) => c.status === "Beklemede" || c.status === "beklemede").length}
                  </p>
                </div>
                <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
                  <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Onaylandı</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {approvedCount}
                  </p>
                </div>
                <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
                  <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Reddedildi</p>
                  <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                    {rejectedCount}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border-light/80 bg-background-light/80 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80">
                {pendingCompanies.length > 0 ? (
                  <table className="w-full table-auto border-separate border-spacing-0">
                    <thead className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                        <th className="px-4 py-3 first:rounded-tl-2xl">Firma Adı</th>
                        <th className="px-4 py-3">Başvuru Sahibi</th>
                        <th className="px-4 py-3">Sektör</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3">Tarih</th>
                        <th className="px-4 py-3">Son Güncelleme</th>
                        <th className="px-4 py-3">Açıklama</th>
                        <th className="px-4 py-3 text-right last:rounded-tr-2xl">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background-light/70 text-sm text-subtle-light dark:bg-background-dark/70 dark:text-subtle-dark">
                      {pendingCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="group transition-all hover:bg-primary/5 dark:hover:bg-primary/10"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-content-light dark:text-content-dark">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.applicant}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.sector}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeVariants[company.status] ?? statusBadgeVariants.Aktif}`}
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.submittedAt}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.timeAgo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleDescriptionClick(company)}
                          className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-3 py-2 text-left text-sm leading-tight text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
                          title="Açıklamayı görmek için tıklayın"
                        >
                          {company.description}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInceleClick(company)}
                          className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-3 py-1.5 text-xs font-medium text-[#2E7D32] transition-colors hover:bg-[#C8E6C9]"
                        >
                          İncele
                        </button>
                        <button
                          onClick={() => handleApproveClick(company)}
                          disabled={loading}
                          className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? 'İşleniyor...' : 'Onayla'}
                        </button>
                        <button
                          onClick={() => handleReddetClick(company)}
                          disabled={loading}
                          className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center text-subtle-light dark:text-subtle-dark">
                    Henüz başvuru bulunmamaktadır.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Aktivite Logları */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Aktivite Logları
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Firma başvuruları üzerinde yapılan tüm işlemlerin geçmişi
                </p>
              </div>
              <button 
                onClick={exportLogsToCSV}
                className="flex items-center gap-2 rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Dışa Aktar
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border-light/80 bg-background-light/80 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full table-auto border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      <th className="px-4 py-3 first:rounded-tl-2xl">Tarih/Saat</th>
                      <th className="px-4 py-3">Kullanıcı</th>
                      <th className="px-4 py-3">İşlem</th>
                      <th className="px-4 py-3">Şirket</th>
                      <th className="px-4 py-3 last:rounded-tr-2xl">Detay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background-light/70 text-sm text-subtle-light dark:bg-background-dark/70 dark:text-subtle-dark">
                    {activityLogs.length > 0 ? (
                      activityLogs.map((log) => {
                        const logDate = new Date(log.timestamp);
                        const formattedDate = logDate.toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        });
                        const formattedTime = logDate.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr
                            key={log.id}
                            onClick={() => handleLogClick(log)}
                            className="group cursor-pointer transition-all hover:bg-primary/5 dark:hover:bg-primary/10"
                          >
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-content-light dark:text-content-dark">
                                  {formattedDate}
                                </span>
                                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                                  {formattedTime}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-primary">
                                  person
                                </span>
                                <span className="text-sm">{log.user}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                  log.action === "Reddetme"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    : log.action === "Onaylama"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {log.action === "Reddetme"
                                    ? "cancel"
                                    : log.action === "Onaylama"
                                    ? "check_circle"
                                    : "edit"}
                                </span>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-content-light dark:text-content-dark">
                                {log.companyName}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">
                                {log.details}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-subtle-light dark:text-subtle-dark">
                          Henüz aktivite logu bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Firma Detay Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-background-light px-6 py-4 dark:border-border-dark dark:bg-background-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  {selectedCompany.name}
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Başvuru No: {selectedCompany.id}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${statusBadgeVariants[selectedCompany.status] ?? statusBadgeVariants.Aktif}`}
                >
                  {selectedCompany.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Sol Kolon */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Genel Bilgiler
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Firma Adı</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Başvuru Sahibi</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.applicant}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Sektör</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.sector}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Kuruluş Yılı</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.establishedYear}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Çalışan Sayısı</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.employeeCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      İletişim Bilgileri
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">E-posta</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Telefon</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Adres</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Web Sitesi</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.website}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Başvuru Bilgileri
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Başvuru Tarihi</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.submittedAt}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Son Güncelleme</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.timeAgo}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Vergi Numarası</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.taxNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Açıklama</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Yüklenen Belgeler
                    </h3>
                    <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      {/* Belgeler */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">verified</span>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                            Yüklenen Belgeler
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {selectedCompany.documentsWithStatus && selectedCompany.documentsWithStatus.length > 0 ? (
                            selectedCompany.documentsWithStatus.map((doc: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-3 py-2 dark:border-border-dark dark:bg-background-dark"
                              >
                                <span className="material-symbols-outlined text-base text-primary">description</span>
                                <span className="text-sm text-content-light dark:text-content-dark">{doc.name}</span>
                                <span className={`ml-auto mr-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  doc.status === 'Onaylandı' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                  doc.status === 'Reddedildi' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                  doc.status === 'Eksik' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                  {doc.status}
                                </span>
                                {doc.url && (
                                  <button
                                    onClick={() => handleDownloadDocument(doc.url, doc.name)}
                                    className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]"
                                  >
                                    İndir
                                  </button>
                                )}
                              </div>
                            ))
                          ) : selectedCompany.documents && selectedCompany.documents.length > 0 ? (
                            selectedCompany.documents.map((doc: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-3 py-2 dark:border-border-dark dark:bg-background-dark"
                              >
                                <span className="material-symbols-outlined text-base text-primary">description</span>
                                <span className="text-sm text-content-light dark:text-content-dark">{doc}</span>
                                <span className="ml-auto mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                  Beklemede
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="py-4 text-center text-sm text-subtle-light dark:text-subtle-dark">
                              Henüz belge yüklenmemiş
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border-light bg-background-light px-6 py-4 dark:border-border-dark dark:bg-background-dark">
              <button
                onClick={closeModal}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                Kapat
              </button>
              <button
                onClick={() => handleReddetClick(selectedCompany)}
                disabled={loading}
                className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reddet
              </button>
              <button
                onClick={async () => {
                  if (selectedCompany) {
                    await handleApproveClick(selectedCompany, true);
                  }
                }}
                disabled={loading}
                className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reddet Modal */}
      {isRejectModalOpen && companyToReject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeRejectModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Başvuruyu Reddet
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {companyToReject.name} - Başvuru No: {companyToReject.id}
                </p>
              </div>
              <button
                onClick={closeRejectModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="mb-2 text-sm text-content-light dark:text-content-dark">
                  Lütfen başvurunun reddedilme sebebini belirtin. Bu mesaj firma yetkilisine gönderilecektir.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="reject-reason"
                  className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
                >
                  Reddetme Sebebi <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setRejectReason(e.target.value);
                    }
                  }}
                  placeholder="Örn: Eksik belgeler, uygun olmayan sektör, yetersiz bilgiler vb..."
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm text-content-light placeholder:text-subtle-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:placeholder:text-subtle-dark"
                  rows={6}
                  maxLength={500}
                  required
                />
                <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                  {rejectReason.length} / 500 karakter
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                    warning
                  </span>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Dikkat
                    </p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      Bu işlem geri alınamaz. Reddetme mesajı {companyToReject.email} adresine gönderilecektir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeRejectModal}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || loading}
                className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'İşleniyor...' : 'Reddet ve Mesaj Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[100] w-full max-w-md transform transition-all duration-300 ${
            toast.show
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div
            className={`rounded-xl border shadow-2xl backdrop-blur-sm ${
              toast.type === "success"
                ? "border-emerald-500/50 bg-emerald-50/95 dark:border-emerald-400/50 dark:bg-emerald-900/95"
                : toast.type === "error"
                ? "border-red-500/50 bg-red-50/95 dark:border-red-400/50 dark:bg-red-900/95"
                : "border-blue-500/50 bg-blue-50/95 dark:border-blue-400/50 dark:bg-blue-900/95"
            }`}
          >
            <div className="flex items-start gap-4 p-4">
              <div
                className={`flex-shrink-0 rounded-full p-2 ${
                  toast.type === "success"
                    ? "bg-emerald-100 dark:bg-emerald-800"
                    : toast.type === "error"
                    ? "bg-red-100 dark:bg-red-800"
                    : "bg-blue-100 dark:bg-blue-800"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    toast.type === "success"
                      ? "text-emerald-600 dark:text-emerald-300"
                      : toast.type === "error"
                      ? "text-red-600 dark:text-red-300"
                      : "text-blue-600 dark:text-blue-300"
                  }`}
                >
                  {toast.type === "success"
                    ? "check_circle"
                    : toast.type === "error"
                    ? "error"
                    : "info"}
                </span>
              </div>
              <div className="flex-1">
                <h3
                  className={`mb-1 text-sm font-semibold ${
                    toast.type === "success"
                      ? "text-emerald-900 dark:text-emerald-100"
                      : toast.type === "error"
                      ? "text-red-900 dark:text-red-100"
                      : "text-blue-900 dark:text-blue-100"
                  }`}
                >
                  {toast.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    toast.type === "success"
                      ? "text-emerald-800 dark:text-emerald-200"
                      : toast.type === "error"
                      ? "text-red-800 dark:text-red-200"
                      : "text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                onClick={closeToast}
                className={`flex-shrink-0 rounded-full p-1 transition-colors hover:bg-[#E8F5E9]/50 dark:hover:bg-[#2E7D32]/20 ${
                  toast.type === "success"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : toast.type === "error"
                    ? "text-red-600 dark:text-red-300"
                    : "text-blue-600 dark:text-blue-300"
                }`}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Açıklama Popup Modal */}
      {isDescriptionModalOpen && descriptionToShow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDescriptionModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Açıklama
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {descriptionToShow.companyName}
                </p>
              </div>
              <button
                onClick={closeDescriptionModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-content-light dark:text-content-dark">
                  {descriptionToShow.fullMessage}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeDescriptionModal}
                className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Detay Modal */}
      {isLogDetailModalOpen && selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeLogDetailModal}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Log Detayı
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {selectedLog.companyName} - {selectedLog.action}
                </p>
              </div>
              <button
                onClick={closeLogDetailModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Log Bilgileri */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">Tarih/Saat</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {new Date(selectedLog.timestamp).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                      {new Date(selectedLog.timestamp).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">Kullanıcı</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {selectedLog.user}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">İşlem</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        selectedLog.action === "Reddetme"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : selectedLog.action === "Onaylama"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {selectedLog.action === "Reddetme"
                          ? "cancel"
                          : selectedLog.action === "Onaylama"
                          ? "check_circle"
                          : "edit"}
                      </span>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">Şirket</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {selectedLog.companyName}
                    </p>
                  </div>
                </div>

                {/* Detay Bilgisi */}
                <div>
                  <p className="mb-2 text-sm font-medium text-content-light dark:text-content-dark">
                    Detay
                  </p>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="text-sm text-content-light dark:text-content-dark">
                      {selectedLog.details}
                    </p>
                  </div>
                </div>

                {/* Tam Mesaj */}
                {selectedLog.fullMessage && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-content-light dark:text-content-dark">
                      Firma Yetkilisine Gönderilen Mesaj
                    </p>
                    <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-content-light dark:text-content-dark">
                          {selectedLog.fullMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedLog.fullMessage && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Bu log kaydı için mesaj bilgisi bulunmamaktadır.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeLogDetailModal}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirmaOnaylariPage;

