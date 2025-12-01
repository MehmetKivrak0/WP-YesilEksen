import { useEffect, useMemo, useState } from 'react';
import { ziraatService, type FarmApplication as ApiFarmApplication } from '../../../../../services/ziraatService';
import type { FarmApplication, FarmStatus, FarmDocument, DocumentStatus } from '../types';

export type ToastState = { message: string; tone: 'success' | 'error' } | null;

// Backend status değerlerini frontend status değerlerine map et
// ciftlikler tablosundaki durum değerleri: 'beklemede', 'aktif', 'pasif', 'askida', 'iptal', 'silindi'
const mapStatusFromBackend = (status: string | null | undefined): Exclude<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'> => {
  // Null veya undefined kontrolü
  if (!status || typeof status !== 'string') {
    console.warn('⚠️ [MAP STATUS] Geçersiz durum değeri:', status);
    return 'İlk İnceleme';
  }
  
  const statusLower = status.toLowerCase().trim();
  const statusMap: Record<string, Exclude<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>> = {
    'beklemede': 'İlk İnceleme',
    'aktif': 'Onaylandı',
    'pasif': 'Reddedildi',
    'askida': 'İlk İnceleme',
    'iptal': 'Reddedildi',
    // Eski mapping'ler (geriye dönük uyumluluk için)
    'ilk_inceleme': 'İlk İnceleme',
    'denetimde': 'İlk İnceleme', // Denetimde durumu artık kullanılmıyor, İlk İnceleme'ye map ediliyor
    'onaylandi': 'Onaylandı',
    'reddedildi': 'Reddedildi',
    'belge_eksik': 'Belge Eksik',
    'gcbelge': 'Güncel Belge',
    'yeni': 'İlk İnceleme',
  };
  
  return statusMap[statusLower] || 'İlk İnceleme';
};

// Backend'den gelen veriyi frontend formatına çevir
const mapApiApplicationToFarmApplication = (apiApp: ApiFarmApplication): FarmApplication => {
  // Tarih formatlaması için yardımcı fonksiyon
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Bekleniyor';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR');
    } catch {
      return 'Bekleniyor';
    }
  };

  // Belgeleri map et - backend'den gelen belgeler array'i
  const mapDocuments = (docs: any[] | null | undefined): FarmDocument[] => {
    if (!docs || !Array.isArray(docs)) return [];
    
    return docs.map((doc) => ({
      name: doc.name || 'Belirtilmemiş',
      status: (doc.status as DocumentStatus) || 'Beklemede',
      url: doc.url || undefined,
      belgeId: doc.belgeId || undefined,
      farmerNote: doc.farmerNote || undefined,
      adminNote: doc.adminNote || undefined,
      zorunlu: doc.zorunlu !== undefined ? doc.zorunlu : true, // Default true
    }));
  };

  const mappedStatus = mapStatusFromBackend(apiApp.status);
  
  return {
    id: apiApp.id,
    farm: apiApp.name,
    owner: apiApp.owner,
    location: apiApp.sector || 'Belirtilmemiş',
    status: mappedStatus,
    lastUpdate: formatDate(apiApp.lastUpdate || apiApp.applicationDate),
    notes: apiApp.description || '',
    wasteTypes: apiApp.wasteTypes || [],
    contact: {
      name: apiApp.owner,
      phone: apiApp.phone || '', // Backend'den gelen telefon bilgisi
      email: apiApp.email || '',
    },
    documents: mapDocuments(apiApp.documents),
  };
};

export function useFarmApplications() {
  const [selectedStatus, setSelectedStatus] = useState<'Hepsi' | FarmStatus>('İlk İnceleme');
  const [records, setRecords] = useState<FarmApplication[]>([]);
  const [allApplications, setAllApplications] = useState<FarmApplication[]>([]); // İstatistikler için tüm başvurular
  const [approvedFarmCount, setApprovedFarmCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [belgeEksikCount, setBelgeEksikCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [guncelBelgeCount, setGuncelBelgeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectedApplication, setInspectedApplication] = useState<FarmApplication | null>(null);
  const [rejectedApplication, setRejectedApplication] = useState<FarmApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [missingDocumentsModal, setMissingDocumentsModal] = useState<{
    isOpen: boolean;
    application: FarmApplication | null;
    missingDocuments: any[];
  }>({
    isOpen: false,
    application: null,
    missingDocuments: [],
  });

  // Verileri yükle
  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ciftlik_basvurulari tablosundaki durum değerlerine göre mapping
      // "Hepsi" seçildiğinde 'all' gönder, backend tüm durumları gösterecek
      const statusParam = selectedStatus === 'Hepsi' ? 'all' : 
        selectedStatus === 'İlk İnceleme' ? 'ilk_inceleme' :
        selectedStatus === 'Onaylandı' ? 'onaylandi' :
        selectedStatus === 'Reddedildi' ? 'reddedildi' :
        selectedStatus === 'Belge Eksik' ? 'belge_eksik' :
        selectedStatus === 'Güncel Belge' ? 'gcbelge' : undefined;

      // Filtrelenmiş veriyi yükle
      const response = await ziraatService.getFarmApplications({
        status: statusParam,
      });

      // İstatistikler için tüm başvuruları yükle (filtre olmadan)
      // "Hepsi" seçildiğinde zaten tüm başvurular geliyor, tekrar yüklemeye gerek yok
      const allResponse = selectedStatus !== 'Hepsi' 
        ? await ziraatService.getFarmApplications({ status: 'all' })
        : response;

      if (response.success) {
        const mappedApplications = response.applications.map(mapApiApplicationToFarmApplication);
        
        // Debug: Gelen verileri kontrol et
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [FARM APPLICATIONS] Backend\'den gelen başvurular:', response.applications);
          console.log('🔍 [FARM APPLICATIONS] Map edilmiş başvurular:', mappedApplications);
          console.log('🔍 [FARM APPLICATIONS] Seçili durum:', selectedStatus);
          console.log('🔍 [FARM APPLICATIONS] Status parametresi:', statusParam);
        }

        setRecords(mappedApplications);

        // Tüm başvuruları istatistikler için kaydet
        if (allResponse.success) {
          const mappedAllApplications = allResponse.applications.map(mapApiApplicationToFarmApplication);
          setAllApplications(mappedAllApplications);
        }
      } else {
        setError('Başvurular yüklenemedi');
      }
    } catch (err) {
      console.error('Farm applications yükleme hatası:', err);
      setError('Başvurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsResponse = await ziraatService.getDashboardStats();
      if (statsResponse.success) {
        setApprovedFarmCount(statsResponse.stats?.farmSummary?.approved ?? 0);
        setPendingCount(statsResponse.stats?.farmSummary?.newApplications ?? 0);
        setBelgeEksikCount(statsResponse.stats?.farmSummary?.missingDocuments ?? 0);
        setRejectedCount(statsResponse.stats?.farmSummary?.rejected ?? 0);
        setGuncelBelgeCount(statsResponse.stats?.farmSummary?.guncelBelgeler ?? 0);
      }
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
    }
  };


  useEffect(() => {
    if (!inspectedApplication) {
      return;
    }

    // Records'tan güncel uygulamayı bul (eğer varsa)
    const currentApplication = records.find(app => app.id === inspectedApplication.id);
    
    // Eğer records'ta güncel uygulama varsa, inspectedApplication'ı güncelle
    if (currentApplication) {
      setInspectedApplication(currentApplication);
    }
  }, [inspectedApplication, records]);

  const filteredApplications = useMemo(() => {
    // Backend'den zaten filtrelenmiş veriler geliyor, bu yüzden frontend'de tekrar filtreleme yapmaya gerek yok
    // Sadece "Hepsi" seçildiğinde tüm kayıtları göster (backend'den 'all' parametresi ile gelir)
    // Diğer durumlarda backend'den zaten filtrelenmiş veriler gelir
    return records;
  }, [records]);

  const closeInspectModal = () => setInspectedApplication(null);

  const handleApprove = async (application: FarmApplication) => {
    // Validasyon: Zaten onaylanmışsa işlem yapma
    if (application.status === 'Onaylandı') {
      setToast({
        message: `${application.farm} çiftliği zaten onaylanmış durumda.`,
        tone: 'error',
      });
      return;
    }

    // Loading state başlat
    setApprovingId(application.id);
    setError(null);

    try {
      // ID'nin geçerli olduğundan emin ol
      if (!application.id || typeof application.id !== 'string') {
        throw new Error('Geçersiz başvuru ID\'si');
      }
      
      console.log('🔄 [ONAY] API çağrısı yapılıyor:', {
        applicationId: application.id,
        applicationName: application.farm,
        currentStatus: application.status
      });

      const response = await ziraatService.approveFarm(application.id);

      console.log('📥 [ONAY] API yanıtı:', {
        success: response.success,
        message: response.message,
        ciftlikId: response.ciftlikId || 'N/A',
        hasMissingDocuments: response.hasMissingDocuments
      });

      // Eksik belgeler varsa modal aç
      if (response.hasMissingDocuments && response.missingDocuments) {
        setMissingDocumentsModal({
          isOpen: true,
          application: application,
          missingDocuments: response.missingDocuments,
        });
        setApprovingId(null);
        return;
      }

      if (response.success) {
        // Başarılı mesajı göster
        setToast({
          message: `${application.farm} çiftliği başarıyla onaylandı.`,
          tone: 'success',
        });

        // Onaylanan başvuruyu listeden hemen kaldır (backend'den onaylanmış başvurular gelmiyor)
        setRecords((prev) => prev.filter((app) => app.id !== application.id));
        setAllApplications((prev) => prev.filter((app) => app.id !== application.id));

        // Listeyi yenile (backend'den güncel veriyi çek)
        await loadApplications();

        // İstatistikleri güncelle (onaylanan çiftlik sayısı)
        await loadStats();
      } else {
        const errorMessage = response.message || 'Onay işlemi başarısız oldu';
        setError(errorMessage);
        setToast({
          message: errorMessage,
          tone: 'error',
        });
      }
    } catch (err: any) {
      console.error('Onay hatası:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Onay işlemi sırasında bir hata oluştu';
      setError(errorMessage);
      setToast({
        message: errorMessage,
        tone: 'error',
      });
    } finally {
      setApprovingId(null);
    }
  };

  // Başvuru listesinden direkt onaylama
  const handleQuickApprove = async (application: FarmApplication) => {
    // handleApprove ile aynı mantık - tek tıkla onaylama
    await handleApprove(application);
  };

  const handleReject = async (application: FarmApplication, reason: string) => {
    if (!reason.trim()) {
      setToast({
        message: 'Red nedeni belirtilmelidir.',
        tone: 'error',
      });
      return;
    }

    // Loading state başlat
    setRejectingId(application.id);
    setError(null);

    try {
      const response = await ziraatService.rejectFarm(application.id, { reason });
      
      if (response.success) {
        // Başarılı mesajı göster
        setToast({
          message: `${application.farm} çiftliği reddedildi ve tüm bilgiler silindi.`,
          tone: 'success',
        });
        
        // Listeyi yenile
        await loadApplications();
        
        // İstatistikleri güncelle
        await loadStats();
        
        // Modal'ı kapat ve state'i temizle
        setRejectedApplication(null);
        setRejectReason('');
      } else {
        const errorMessage = response.message || 'Red işlemi başarısız oldu';
        setError(errorMessage);
        setToast({
          message: errorMessage,
          tone: 'error',
        });
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Red işlemi sırasında bir hata oluştu';
      console.error('Red hatası:', err);
      setError(errorMessage);
      setToast({
        message: errorMessage,
        tone: 'error',
      });
    } finally {
      setRejectingId(null);
    }
  };

  // Toast otomatik kapanma
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return {
    selectedStatus,
    setSelectedStatus,
    applications: records,
    allApplications,
    approvedFarmCount,
    pendingCount,
    belgeEksikCount,
    rejectedCount,
    guncelBelgeCount,
    inspectedApplication,
    setInspectedApplication,
    rejectedApplication,
    setRejectedApplication,
    rejectReason,
    setRejectReason,
    filteredApplications,
    closeInspectModal,
    handleApprove,
    handleReject,
    handleQuickApprove,
    loadStats,
    loadApplications,
    loading,
    error,
    approvingId,
    rejectingId,
    toast,
    setToast,
    missingDocumentsModal,
    setMissingDocumentsModal,
  };
}

