import { useState, useEffect } from 'react';
import FrmNavbar from '../../components/frmnavbar';
import { firmaService, type BasvuruDurumu } from '../../services/firmaService';
import api from '../../services/api';

type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi' | 'İncelemede';
type ApplicationStatus = 'Beklemede' | 'İncelemede' | 'Onaylandı' | 'Reddedildi' | 'Eksik Evrak';

const statusConfig: Record<ApplicationStatus, { color: string; icon: string; bgColor: string; borderColor: string }> = {
  'Beklemede': { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: 'schedule', bgColor: 'bg-gray-50 dark:bg-gray-900/20', borderColor: 'border-gray-200 dark:border-gray-800' },
  'İncelemede': { color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200', icon: 'manage_search', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
  'Eksik Evrak': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'warning', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800' },
};

const documentStatusConfig: Record<DocumentStatus, { color: string; icon: string }> = {
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle' },
  'Beklemede': { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: 'pending' },
  'İncelemede': { color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200', icon: 'manage_search' },
  'Eksik': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'warning' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel' },
};

function FirmaBasvuruDurum() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [basvuru, setBasvuru] = useState<BasvuruDurumu | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [updateMessage, setUpdateMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  
  // Belge görüntüleme modal state'leri
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);
  const [viewingDocName, setViewingDocName] = useState<string>('');
  const [viewingDocType, setViewingDocType] = useState<string>('');
  const [loadingView, setLoadingView] = useState(false);

  // Belge görüntüleme (popup modal)
  const handleViewDocument = async (dosyaUrl: string, belgeAdi: string) => {
    try {
      setLoadingView(true);
      setViewingDocName(belgeAdi);
      setShowViewModal(true);
      
      // dosyaUrl: /api/documents/file/... şeklinde geliyor
      // api base URL: /api olduğu için /api'yi kaldırıyoruz
      const cleanUrl = dosyaUrl.replace(/^\/api/, '');
      
      const response = await api.get(cleanUrl, {
        responseType: 'blob'
      });
      
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      setViewingDocType(contentType);
      
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      setViewingDocUrl(url);
    } catch (err: any) {
      console.error('Belge görüntüleme hatası:', err);
      setError('Belge görüntülenemedi');
      setShowViewModal(false);
    } finally {
      setLoadingView(false);
    }
  };
  
  // Modal kapatma
  const closeViewModal = () => {
    if (viewingDocUrl) {
      window.URL.revokeObjectURL(viewingDocUrl);
    }
    setShowViewModal(false);
    setViewingDocUrl(null);
    setViewingDocName('');
    setViewingDocType('');
  };

  // Belge indirme
  const handleDownloadDocument = async (dosyaUrl: string, belgeAdi: string) => {
    try {
      setDownloadingDoc(dosyaUrl);
      
      // dosyaUrl: /api/documents/file/... şeklinde geliyor
      // api base URL: /api olduğu için /api'yi kaldırıyoruz
      const cleanUrl = dosyaUrl.replace(/^\/api/, '');
      
      const response = await api.get(`${cleanUrl}?download=true`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      // Dosya adını belirle
      const contentDisposition = response.headers['content-disposition'];
      let filename = belgeAdi || 'belge';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = decodeURIComponent(match[1]);
      }
      
      // Dosya uzantısını ekle (yoksa)
      if (!filename.includes('.')) {
        const contentType = response.headers['content-type'];
        if (contentType?.includes('pdf')) filename += '.pdf';
        else if (contentType?.includes('jpeg') || contentType?.includes('jpg')) filename += '.jpg';
        else if (contentType?.includes('png')) filename += '.png';
      }
      
      // İndirme linkini oluştur ve tıkla
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL'i temizle
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Belge indirme hatası:', err);
      setError('Belge indirilemedi');
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Başvuru durumunu yükle
  useEffect(() => {
    loadBasvuruDurumu();
  }, []);

  const loadBasvuruDurumu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await firmaService.getBasvuruDurumu();
      if (response.success) {
        setBasvuru(response.basvuru);
      } else {
        setError('Başvuru bilgileri yüklenemedi');
      }
    } catch (err: any) {
      console.error('Başvuru durumu yükleme hatası:', err);
      if (err.response?.status === 404) {
        setError('Henüz bir başvurunuz bulunmamaktadır.');
      } else {
        setError(err.response?.data?.message || 'Başvuru bilgileri yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatDate(dateString);
  };

  // Loading state
  if (loading) {
    return (
      <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
        <FrmNavbar />
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-subtle-light dark:text-subtle-dark">Başvuru durumu yükleniyor...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state veya başvuru yok
  if (error || !basvuru) {
    return (
      <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
        <FrmNavbar />
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Başvuru Durumum</h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Sanayi Odası üyelik başvurunuzun durumunu takip edin
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-yellow-600 dark:text-yellow-400 mb-4 block">info</span>
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                {error || 'Başvuru Bulunamadı'}
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                Henüz bir üyelik başvurusu yapmadıysanız, kayıt sırasında başvurunuz oluşturulmuş olmalıdır.
              </p>
              <button
                onClick={loadBasvuruDurumu}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <span className="material-symbols-outlined">refresh</span>
                Yenile
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const config = statusConfig[basvuru.durum as ApplicationStatus] || statusConfig['Beklemede'];
  const approvedDocs = basvuru.belgeler.filter(d => d.durum === 'Onaylandı').length;
  const totalDocs = basvuru.belgeler.length;
  const progress = totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0;

  return (
    <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
      <FrmNavbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Başvuru Durumum</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">
              Sanayi Odası üyelik başvurunuzun durumunu ve admin notlarını takip edin
            </p>
          </div>

          {/* Main Status Card */}
          <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-8 mb-8`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${config.color}`}>
                    <span className="material-symbols-outlined text-2xl">{config.icon}</span>
                    {basvuru.durum}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-content-light dark:text-content-dark mb-2">{basvuru.firmaAdi}</h2>
                <p className="text-subtle-light dark:text-subtle-dark mb-4">
                  Başvuru No: {basvuru.id.substring(0, 8).toUpperCase()} • Sektör: {basvuru.sektor}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-medium">Başvuru Tarihi:</span> {formatDate(basvuru.basvuruTarihi)}</p>
                  <p><span className="font-medium">Son Güncelleme:</span> {getRelativeTime(basvuru.sonGuncelleme)}</p>
                  <p><span className="font-medium">Yetkili Kişi:</span> {basvuru.yetkili.ad} {basvuru.yetkili.soyad}</p>
                  <p><span className="font-medium">İletişim:</span> {basvuru.yetkili.telefon}</p>
                </div>
              </div>
              
              {totalDocs > 0 && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-border-light dark:text-border-dark"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-content-light dark:text-content-dark">{approvedDocs}/{totalDocs}</span>
                    <span className="text-xs text-subtle-light dark:text-subtle-dark">Belge</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined">visibility</span>
                  Detaylı İncele
                </button>
              </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {basvuru.adminNotu && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">campaign</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Sanayi Odası Mesajı</h3>
                  <p className="text-blue-800 dark:text-blue-200">{basvuru.adminNotu}</p>
                </div>
              </div>
            </div>
          )}

          {/* Red Nedeni */}
          {basvuru.redNedeni && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">error</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Başvuru Ret Nedeni</h3>
                  <p className="text-red-800 dark:text-red-200">{basvuru.redNedeni}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents Overview */}
          {basvuru.belgeler.length > 0 && (
          <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6">
            <h3 className="text-xl font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Belgeler ve Durumları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {basvuru.belgeler.map((doc) => {
                  const docConfig = documentStatusConfig[doc.durum as DocumentStatus] || documentStatusConfig['Beklemede'];
                return (
                  <div
                      key={doc.id}
                    className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="material-symbols-outlined text-2xl text-subtle-light dark:text-subtle-dark">description</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${docConfig.color}`}>
                        <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                          {doc.durum}
                      </span>
                    </div>
                      <p className="font-medium text-content-light dark:text-content-dark text-sm mb-2">{doc.ad}</p>
                      {doc.zorunlu && (
                        <span className="text-xs text-red-500 dark:text-red-400">Zorunlu</span>
                      )}
                      {doc.dosyaUrl && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleViewDocument(doc.dosyaUrl!, doc.ad)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                            title="Görüntüle"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Görüntüle
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc.dosyaUrl!, doc.ad)}
                            disabled={downloadingDoc === doc.dosyaUrl}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-white bg-primary hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
                            title="İndir"
                          >
                            {downloadingDoc === doc.dosyaUrl ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span className="material-symbols-outlined text-sm">download</span>
                            )}
                            İndir
                          </button>
                        </div>
                      )}
                      {doc.adminNotu && (
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2 italic">
                          Not: {doc.adminNotu}
                        </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Belge yoksa bilgi mesajı */}
          {basvuru.belgeler.length === 0 && (
            <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-4 block">folder_open</span>
              <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-2">Belge Bulunamadı</h3>
              <p className="text-subtle-light dark:text-subtle-dark">
                Başvurunuza ait yüklenmiş belge bulunmamaktadır.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">Başvuru Detayları</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Başvuru No: {basvuru.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
              {/* Company Info */}
              <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                <h3 className="font-semibold text-content-light dark:text-content-dark mb-3">Firma Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-medium">Firma Adı:</span> {basvuru.firmaAdi}</p>
                  <p><span className="font-medium">Sektör:</span> {basvuru.sektor}</p>
                  <p><span className="font-medium">Yetkili:</span> {basvuru.yetkili.ad} {basvuru.yetkili.soyad}</p>
                  <p><span className="font-medium">Telefon:</span> {basvuru.yetkili.telefon}</p>
                  <p><span className="font-medium">E-posta:</span> {basvuru.yetkili.eposta}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Durum:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <span className="material-symbols-outlined text-sm">{config.icon}</span>
                      {basvuru.durum}
                    </span>
                  </p>
                </div>
              </div>

              {/* Documents Detail */}
              {basvuru.belgeler.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">Belgeler ve Durumları</h3>
                <div className="space-y-3">
                    {basvuru.belgeler.map((doc) => {
                      const docConfig = documentStatusConfig[doc.durum as DocumentStatus] || documentStatusConfig['Beklemede'];
                    return (
                      <div
                          key={doc.id}
                        className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                              <p className="font-medium text-content-light dark:text-content-dark mb-1">{doc.ad}</p>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${docConfig.color}`}>
                              <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                                {doc.durum}
                            </span>
                          </div>
                            {doc.dosyaUrl && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDocument(doc.dosyaUrl!, doc.ad)}
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                                  title="Görüntüle"
                                >
                                  <span className="material-symbols-outlined text-base">visibility</span>
                                  Görüntüle
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(doc.dosyaUrl!, doc.ad)}
                                  disabled={downloadingDoc === doc.dosyaUrl}
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
                                  title="İndir"
                                >
                                  {downloadingDoc === doc.dosyaUrl ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <span className="material-symbols-outlined text-base">download</span>
                                  )}
                                  İndir
                                </button>
                              </div>
                            )}
                        </div>
                          {(doc.adminNotu || doc.redNedeni) && (
                          <div className={`mt-3 p-3 rounded-lg ${
                              doc.durum === 'Reddedildi' 
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          }`}>
                            <p className={`text-xs font-medium mb-1 ${
                                doc.durum === 'Reddedildi' 
                                ? 'text-red-800 dark:text-red-200' 
                                : 'text-blue-800 dark:text-blue-200'
                            }`}>
                                {doc.durum === 'Reddedildi' ? 'Reddetme Nedeni:' : 'Sanayi Odası Notu:'}
                            </p>
                            <p className={`text-sm ${
                                doc.durum === 'Reddedildi' 
                                ? 'text-red-700 dark:text-red-300' 
                                : 'text-blue-700 dark:text-blue-300'
                            }`}>
                                {doc.redNedeni || doc.adminNotu}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Action Buttons */}
              {(basvuru.durum === 'Eksik Evrak' || basvuru.durum === 'İncelemede') && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border-2 border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
                  >
                    Kapat
                  </button>
                  <button 
                    onClick={() => {
                      setShowUpdateModal(true);
                      setShowDetailModal(false);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Belgeleri Güncelle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Documents Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">Belgeleri Güncelle</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Reddedilen veya eksik belgeleri yükleyin</p>
              </div>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUploadedFiles({});
                  setUpdateMessage('');
                }}
                className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-4">
              {/* Bilgilendirme */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Bilgilendirme</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Sadece reddedilen veya eksik belgelerinizi güncelleyin. Onaylanmış belgeler değiştirilemez.
                    </p>
                  </div>
                </div>
              </div>

              {/* Firma Bilgisi */}
              <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                <h3 className="font-semibold text-content-light dark:text-content-dark mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">business</span>
                  {basvuru.firmaAdi}
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                  Başvuru No: {basvuru.id.substring(0, 8).toUpperCase()}
                </p>

                {/* Belge Yükleme Alanları */}
                <div className="space-y-4">
                  {basvuru.belgeler
                    .filter(doc => doc.durum === 'Reddedildi' || doc.durum === 'Eksik' || doc.durum === 'Beklemede')
                    .map((doc) => {
                      const docKey = doc.id;
                      return (
                        <div key={doc.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-content-light dark:text-content-dark flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-subtle-light dark:text-subtle-dark">description</span>
                              {doc.ad}
                              {doc.durum === 'Reddedildi' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
                                  Reddedildi
                                </span>
                              )}
                              {doc.durum === 'Beklemede' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200">
                                  İncelemede
                                </span>
                              )}
                            </label>
                            {uploadedFiles[docKey] && (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Seçildi
                              </span>
                            )}
                          </div>
                          {(doc.adminNotu || doc.redNedeni) && (
                            <div className={`text-xs p-2 rounded ${
                              doc.durum === 'Reddedildi'
                                ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            }`}>
                              <span className="font-medium">Not: </span>{doc.redNedeni || doc.adminNotu}
                            </div>
                          )}
                          <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary bg-background-light dark:bg-background-dark rounded-lg p-4 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-xl text-primary">upload_file</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-content-light dark:text-content-dark">
                                  {uploadedFiles[docKey]?.name || 'Belge yüklemek için tıklayın'}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark">PDF, JPG, PNG (Max 10MB)</p>
                              </div>
                            </div>
                            <input
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setUploadedFiles(prev => ({ ...prev, [docKey]: file }));
                              }}
                            />
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Mesaj Alanı */}
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Sanayi Odası'na Mesaj (Opsiyonel)
                </label>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Güncelleme hakkında Sanayi Odası'na iletmek istediğiniz bir mesaj varsa yazabilirsiniz..."
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUploadedFiles({});
                  setUpdateMessage('');
                }}
                className="px-4 py-2 border-2 border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    
                    // Yüklenecek belgeleri hazırla
                    const belgeler = Object.entries(uploadedFiles)
                      .filter(([_, file]) => file !== null)
                      .map(([belgeId, file]) => ({ belgeId, file: file as File }));
                    
                    if (belgeler.length === 0) {
                      setError('Lütfen en az bir belge seçin');
                      return;
                    }
                    
                    // API çağrısı yap
                    const response = await firmaService.updateBasvuruBelgeler(belgeler, updateMessage || undefined);
                    
                    if (response.success) {
                  // Başarı mesajını göster
                  setShowUpdateModal(false);
                  setShowSuccessMessage(true);
                  setUploadedFiles({});
                  setUpdateMessage('');
                      
                      // Başvuru durumunu yeniden yükle
                      loadBasvuruDurumu();
                  
                  // 3 saniye sonra mesajı gizle
                  setTimeout(() => {
                    setShowSuccessMessage(false);
                  }, 3000);
                    } else {
                      setError(response.message || 'Belgeler güncellenemedi');
                    }
                  } catch (err: any) {
                    console.error('Belge güncelleme hatası:', err);
                    setError(err.response?.data?.message || 'Belgeler güncellenemedi');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={Object.keys(uploadedFiles).filter(k => uploadedFiles[k] !== null).length === 0 || submitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                <span className="material-symbols-outlined text-base">send</span>
                Gönder ve Sanayi Odası'na Bildir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-4 z-[60] animate-slide-in-right">
          <div className="bg-green-50 dark:bg-green-900/90 border-2 border-green-500 dark:border-green-400 rounded-xl p-4 shadow-xl min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-300">check_circle</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Belgeler Başarıyla Gönderildi!</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Belgeleriniz Sanayi Odası'na iletildi. İnceleme sonucunu bu sayfadan takip edebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="group p-1 rounded-lg border border-green-200 dark:border-green-700 bg-green-100/70 dark:bg-green-900/40 transition-colors hover:border-green-500 hover:bg-green-200 dark:hover:bg-green-800/70"
              >
                <span className="material-symbols-outlined text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Belge Görüntüleme Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[90vw] h-[85vh] max-w-5xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary">description</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewingDocName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Belge Önizleme</p>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-800/30">
              {loadingView ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400">Belge yükleniyor...</p>
                  </div>
                </div>
              ) : viewingDocUrl ? (
                <div className="h-full flex items-center justify-center">
                  {viewingDocType.includes('pdf') ? (
                    <iframe
                      src={viewingDocUrl}
                      className="w-full h-full rounded-lg border border-gray-300 dark:border-gray-600"
                      title={viewingDocName}
                    />
                  ) : viewingDocType.includes('image') ? (
                    <img
                      src={viewingDocUrl}
                      alt={viewingDocName}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">insert_drive_file</span>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Bu dosya türü önizlenemiyor</p>
                      <a
                        href={viewingDocUrl}
                        download={viewingDocName}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        İndir
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">Belge yüklenemedi</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              {viewingDocUrl && (
                <a
                  href={viewingDocUrl}
                  download={viewingDocName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  İndir
                </a>
              )}
              <button
                onClick={closeViewModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-base">close</span>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FirmaBasvuruDurum;
