import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CftNavbar from '../../components/cftnavbar';
import { ciftciService } from '../../services/ciftciService';
import { useToast } from '../../context/ToastContext';

type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';

type ProductApplication = {
  id: string;
  product: string;
  category: string;
  status: 'Onaylandı' | 'İncelemede' | 'Revizyon' | 'Reddedildi';
  submittedAt: string;
  lastUpdate: string;
  adminNotes: string;
  documents: Array<{
    name: string;
    status: DocumentStatus;
    url?: string;
    belgeId?: string;
    adminNote?: string;
  }>;
};

// API'den veri çekilecek, örnek veri kaldırıldı

const statusConfig = {
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle' },
  'İncelemede': { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: 'hourglass_top' },
  'Revizyon': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'edit_note' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel' },
};

const documentStatusConfig = {
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle' },
  'Beklemede': { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: 'pending' },
  'Eksik': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'warning' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel' },
};

function UrunDurum() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [myProductApplications, setMyProductApplications] = useState<ProductApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ProductApplication | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [updateMessage, setUpdateMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // API'den veri çek
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ciftciService.getMyProductApplications();
      if (response.success) {
        setMyProductApplications(response.applications);
        
        // URL parametresinden modal açma kontrolü
        const openModal = searchParams.get('openModal');
        const applicationId = searchParams.get('applicationId');
        
        if (openModal === 'true' && applicationId) {
          // İlgili başvuruyu bul
          const application = response.applications.find((app: ProductApplication) => app.id === applicationId);
          if (application && (application.status === 'Revizyon' || application.status === 'İncelemede')) {
            // URL parametrelerini temizle
            setSearchParams({}, { replace: true });
            // Eksik belge modalını aç
            setShowUpdateModal(true);
          }
        }
      } else {
        setError('Başvurular yüklenemedi');
      }
    } catch (err: any) {
      console.error('Başvurular yükleme hatası:', err);
      setError(err.response?.data?.message || 'Başvurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchParams, setSearchParams]);

  // ESC tuşu ile resim modal'ını kapatma
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && imageModalOpen) {
        setImageModalOpen(false);
        setSelectedImageUrl(null);
        setSelectedImageName('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [imageModalOpen]);

  return (
    <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
      <CftNavbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Ürün Başvuru Durumlarım</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">
              Eklediğiniz ürünlerin onay durumlarını ve admin notlarını takip edin
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                <p className="text-subtle-light dark:text-subtle-dark">Başvurular yükleniyor...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Hata</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && myProductApplications.length === 0 && (
            <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">inventory_2</span>
              <h3 className="text-xl font-semibold text-content-light dark:text-content-dark mb-2">Henüz başvuru yok</h3>
              <p className="text-subtle-light dark:text-subtle-dark mb-6">
                Ürün eklediğinizde başvurularınız burada görünecek
              </p>
            </div>
          )}

          {/* Stats Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Toplam Ürün</p>
                <p className="text-3xl font-bold text-content-light dark:text-content-dark">{myProductApplications.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Onaylanan</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                  {myProductApplications.filter(p => p.status === 'Onaylandı').length}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">İncelemede</p>
                <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                  {myProductApplications.filter(p => p.status === 'İncelemede').length}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">Revizyon</p>
                <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                  {myProductApplications.filter(p => p.status === 'Revizyon').length}
                </p>
              </div>
            </div>
          )}

          {/* Applications List */}
          {!loading && !error && myProductApplications.length > 0 && (
            <div className="space-y-4">
              {myProductApplications.map((application) => {
              const config = statusConfig[application.status];
              return (
                <div
                  key={application.id}
                  className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">{application.product}</h2>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                          <span className="material-symbols-outlined text-base">{config.icon}</span>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        Kategori: {application.category} • Başvuru: {application.submittedAt} • Son Güncelleme: {application.lastUpdate}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      Detayları Gör
                    </button>
                  </div>

                  {/* Admin Notes */}
                  {application.adminNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Admin Notu:</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{application.adminNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents Quick View */}
                  <div>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark mb-2">Belgeler:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.documents.map((doc, idx) => {
                        const docConfig = documentStatusConfig[doc.status];
                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${docConfig.color}`}
                          >
                            <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                            {doc.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">{selectedApplication.product}</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Başvuru No: {selectedApplication.id}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
              {/* Status and Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                  <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-2">Başvuru Bilgileri</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Kategori:</span> {selectedApplication.category}</p>
                    <p><span className="font-medium">Başvuru Tarihi:</span> {selectedApplication.submittedAt}</p>
                    <p><span className="font-medium">Son Güncelleme:</span> {selectedApplication.lastUpdate}</p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Durum:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedApplication.status].color}`}>
                        <span className="material-symbols-outlined text-sm">{statusConfig[selectedApplication.status].icon}</span>
                        {selectedApplication.status}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedApplication.adminNotes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">Admin Notu</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{selectedApplication.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Documents Detail */}
              <div>
                <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">Belgeler ve Durumları</h3>
                <div className="space-y-3">
                  {selectedApplication.documents.map((doc, idx) => {
                    const docConfig = documentStatusConfig[doc.status];
                    return (
                      <div
                        key={idx}
                        className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-content-light dark:text-content-dark mb-1">{doc.name}</p>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${docConfig.color}`}>
                              <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                              {doc.status}
                            </span>
                          </div>
                          {doc.url && (() => {
                            // Belge URL'sini normalize et
                            let documentUrl = doc.url;
                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                            // Base URL'den /api kısmını temizle (eğer varsa)
                            const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.substring(0, baseUrl.length - 4) : baseUrl.replace(/\/api$/, '');
                            
                            // Mutlak URL ise, relative path'e çevir
                            if (documentUrl.startsWith('http://') || documentUrl.startsWith('https://')) {
                              try {
                                const urlObj = new URL(documentUrl);
                                // /uploads/ kısmından sonrasını al
                                if (urlObj.pathname.includes('/uploads/')) {
                                  const relativePath = urlObj.pathname.split('/uploads/')[1];
                                  documentUrl = `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(relativePath)}`;
                                } else {
                                  // Eğer /uploads/ yoksa, direkt path'i kullan
                                  const pathWithoutSlash = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
                                  documentUrl = `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(pathWithoutSlash)}`;
                                }
                              } catch (e) {
                                console.error('URL parse hatası:', e, 'Orijinal URL:', documentUrl);
                                // URL parse edilemezse, eski formatı kullan
                                if (documentUrl.includes('/uploads/')) {
                                  const relativePath = documentUrl.split('/uploads/')[1];
                                  documentUrl = `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(relativePath)}`;
                                } else {
                                  // Eğer /uploads/ yoksa, direkt URL'i kullan
                                  documentUrl = documentUrl;
                                }
                              }
                            } else {
                              // Relative path ise, /api/documents/file/ endpoint'ini kullan
                              // Eski formatları destekle (ciftlik/... veya farmer/...)
                              const cleanPath = documentUrl.startsWith('/') ? documentUrl.substring(1) : documentUrl;
                              documentUrl = `${cleanBaseUrl}/api/documents/file/${encodeURIComponent(cleanPath)}`;
                            }
                            
                            // Belge türüne göre ikon ve buton metni
                            const isImage = doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const isPdf = doc.url.match(/\.pdf$/i);
                            
                            // Tüm belgeler için pop-up açma fonksiyonu
                            const handleDocumentClick = async (e: React.MouseEvent) => {
                              e.preventDefault();
                              setSelectedImageUrl(documentUrl);
                              setSelectedImageName(doc.name);
                              
                              // PDF ise blob olarak yükle (CSP sorununu çözmek için)
                              if (isPdf) {
                                setPdfLoading(true);
                                setPdfBlobUrl(null);
                                try {
                                  const response = await fetch(documentUrl);
                                  if (response.ok) {
                                    const blob = await response.blob();
                                    const blobUrl = URL.createObjectURL(blob);
                                    setPdfBlobUrl(blobUrl);
                                  } else {
                                    console.error('PDF yüklenemedi:', response.status, response.statusText);
                                  }
                                } catch (error) {
                                  console.error('PDF yükleme hatası:', error);
                                } finally {
                                  setPdfLoading(false);
                                }
                              } else {
                                setPdfBlobUrl(null);
                              }
                              
                              setImageModalOpen(true);
                            };
                            
                            return (
                              <button
                                onClick={handleDocumentClick}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">
                                  {isImage ? 'image' : isPdf ? 'picture_as_pdf' : 'description'}
                                </span>
                                {isImage ? 'Görüntüle' : isPdf ? 'PDF Görüntüle' : 'Görüntüle'}
                              </button>
                            );
                          })()}
                        </div>
                        {doc.adminNote && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            doc.status === 'Reddedildi' 
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                          }`}>
                            <p className={`text-xs font-medium mb-1 ${
                              doc.status === 'Reddedildi' 
                                ? 'text-red-800 dark:text-red-200' 
                                : 'text-amber-800 dark:text-amber-200'
                            }`}>
                              {doc.status === 'Reddedildi' ? 'Reddetme Nedeni:' : 'Admin Notu:'}
                            </p>
                            <p className={`text-sm ${
                              doc.status === 'Reddedildi' 
                                ? 'text-red-700 dark:text-red-300' 
                                : 'text-amber-700 dark:text-amber-300'
                            }`}>
                              {doc.adminNote}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              {(selectedApplication.status === 'Revizyon' || selectedApplication.status === 'İncelemede') && (
                <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border-2 border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
              >
                Kapat
              </button>
                  <button 
                    onClick={() => {
                      setShowUpdateModal(true);
                      setSelectedApplication(null);
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
              {/* Ürün Seçimi */}
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

              {/* Belge Yükleme Alanları */}
              {myProductApplications
                .filter(app => app.status === 'Revizyon' || app.status === 'İncelemede')
                .map((application) => {
                  const problemDocs = application.documents.filter(
                    doc => doc.status === 'Reddedildi' || doc.status === 'Eksik' || doc.status === 'Beklemede'
                  );

                  if (problemDocs.length === 0) return null;

                  return (
                    <div key={application.id} className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                      <h3 className="font-semibold text-content-light dark:text-content-dark mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                        {application.product}
                      </h3>
                      <div className="space-y-4">
                        {problemDocs.map((doc, idx) => {
                          // docKey'i belge ID'si ile oluştur (UUID'lerde olmayan :: separator kullan)
                          // Eğer belge ID yoksa, belge adını kullan (:: separator ile)
                          // Backend'den gelen belge ID'si camelCase veya küçük harf olabilir
                          const belgeId = (doc as any).belgeId || (doc as any).belgeid;
                          const docKey = belgeId 
                            ? `${application.id}::${belgeId}` 
                            : `${application.id}::${doc.name}`;
                          const isReddedildi = doc.status === 'Reddedildi';
                          const isEksik = doc.status === 'Eksik';
                          const isBeklemede = doc.status === 'Beklemede';
                          // Sadece "Eksik" durumunda revize gerekli badge'i göster
                          const needsRevision = isEksik;
                          
                          return (
                            <div 
                              key={idx} 
                              className={`space-y-2 ${
                                isEksik 
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 shadow-sm' 
                                  : ''
                              }`}
                            >
                              {/* Revize Edilecek Belge Başlığı - Sadece Eksik durumunda */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  {isEksik && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700">
                                      <span className="material-symbols-outlined text-base text-amber-700 dark:text-amber-300 animate-pulse">warning</span>
                                      <span className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                                        Revize Gerekli
                                      </span>
                                    </div>
                                  )}
                                  <label className="text-sm font-semibold text-content-light dark:text-content-dark flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-base ${
                                      isReddedildi ? 'text-red-600 dark:text-red-400' :
                                      isEksik ? 'text-orange-600 dark:text-orange-400' :
                                      'text-amber-600 dark:text-amber-400'
                                    }`}>
                                      description
                                    </span>
                                    <span className={isEksik ? 'font-bold' : ''}>{doc.name}</span>
                                  </label>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isReddedildi && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 font-semibold">
                                      Reddedildi
                                    </span>
                                  )}
                                  {isEksik && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-200 font-semibold">
                                      Eksik
                                    </span>
                                  )}
                                  {isBeklemede && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-200 font-semibold">
                                      Beklemede
                                    </span>
                                  )}
                                  {uploadedFiles[docKey] && (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-semibold">
                                      <span className="material-symbols-outlined text-sm">check_circle</span>
                                      Seçildi
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Admin Notu - Daha Belirgin */}
                              {doc.adminNote && (
                                <div className={`text-xs font-medium ${
                                  isReddedildi 
                                    ? 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700' 
                                    : 'text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700'
                                } rounded-lg p-3`}>
                                  <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-base flex-shrink-0">
                                      {isReddedildi ? 'error' : 'info'}
                                    </span>
                                    <div>
                                      <span className="font-bold">{isReddedildi ? 'Reddetme Nedeni: ' : 'Admin Notu: '}</span>
                                      {doc.adminNote}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Belge Yükleme Alanı - Sadece Eksik durumunda özel stil */}
                              <label className={`group relative flex flex-col border-2 border-dashed ${
                                isEksik
                                  ? 'border-amber-400 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                                  : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary bg-background-light dark:bg-background-dark'
                              } rounded-lg p-4 transition-all duration-300 cursor-pointer`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isEksik
                                      ? 'bg-amber-200 dark:bg-amber-800'
                                      : 'bg-primary/20 dark:bg-primary/30'
                                  }`}>
                                    <span className={`material-symbols-outlined text-xl ${
                                      isEksik
                                        ? 'text-amber-700 dark:text-amber-300'
                                        : 'text-primary'
                                    }`}>
                                      upload_file
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      isEksik
                                        ? 'text-amber-900 dark:text-amber-100'
                                        : 'text-content-light dark:text-content-dark'
                                    }`}>
                                      {uploadedFiles[docKey]?.name || 'Belge yüklemek için tıklayın'}
                                    </p>
                                    <p className={`text-xs ${
                                      isEksik
                                        ? 'text-amber-700 dark:text-amber-300'
                                        : 'text-subtle-light dark:text-subtle-dark'
                                    }`}>
                                      PDF, JPG, PNG (Max 10MB)
                                    </p>
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
                  );
                })}

              {/* Mesaj Alanı */}
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Admin'e Mesaj (Opsiyonel)
                </label>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Güncelleme hakkında admin'e iletmek istediğiniz bir mesaj varsa yazabilirsiniz..."
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
                  if (Object.keys(uploadedFiles).length === 0) {
                    toast.warning('Lütfen en az bir belge seçin');
                    return;
                  }

                  setUploading(true);
                  try {
                    // Tüm belgeleri yükle
                    const uploadPromises = Object.entries(uploadedFiles).map(async ([docKey, file]) => {
                      if (!file) return;
                      
                      // docKey formatı: "applicationId::belgeId" veya "applicationId::docName"
                      // :: separator kullanarak UUID'lerdeki - karakterlerinden kaçınıyoruz
                      const parts = docKey.split('::');
                      if (parts.length !== 2) {
                        console.error('Geçersiz docKey formatı:', docKey);
                        return;
                      }
                      
                      const [applicationId, belgeIdentifier] = parts;
                      
                      // İlgili başvuruyu bul
                      const application = myProductApplications.find(app => app.id === applicationId);
                      if (!application) {
                        console.error('Başvuru bulunamadı:', applicationId, 'Tüm başvurular:', myProductApplications.map(a => a.id));
                        return;
                      }
                      
                      // Belgeyi bul - önce belge ID'si ile ara (hem camelCase hem küçük harf), sonra isim ile ara
                      let document = application.documents.find(doc => {
                        const docBelgeId = (doc as any).belgeId || (doc as any).belgeid;
                        return docBelgeId === belgeIdentifier;
                      });
                      
                      // Bulunamadıysa, belge adı ile ara (geriye dönük uyumluluk için)
                      if (!document) {
                        document = application.documents.find(doc => doc.name === belgeIdentifier);
                      }
                      
                      if (!document) {
                        console.error('Belge bulunamadı:', {
                          docKey,
                          applicationId,
                          belgeIdentifier,
                          mevcutBelgeler: application.documents.map(d => ({ 
                            name: d.name, 
                            belgeId: (d as any).belgeId || (d as any).belgeid,
                            tümKeys: Object.keys(d)
                          }))
                        });
                        return;
                      }
                      
                      // Backend'den gelen belge ID'si camelCase veya küçük harf olabilir
                      const belgeId = (document as any).belgeId || (document as any).belgeid;
                      
                      if (!belgeId) {
                        console.error('Belge ID bulunamadı:', {
                          document,
                          tümKeys: Object.keys(document),
                          belgeIdCamelCase: (document as any).belgeId,
                          belgeIdKucukHarf: (document as any).belgeid
                        });
                        return;
                      }
                      
                      // Belgeyi yükle (mesaj ile birlikte)
                      await ciftciService.uploadMissingDocument(belgeId, file, updateMessage || undefined);
                    });

                    await Promise.all(uploadPromises);
                    
                    // Başarı mesajını göster
                    toast.success('Belgeler başarıyla gönderildi! Durum güncelleniyor...');
                    
                    // Modal'ı kapat
                    setShowUpdateModal(false);
                    setUploadedFiles({});
                    setUpdateMessage('');
                    
                    // Backend'in durumu güncellemesi için kısa bir bekleme
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Başvuruları yeniden yükle (durum güncellemesi için)
                    await fetchApplications();
                    
                    // Başarı mesajını göster
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                      setShowSuccessMessage(false);
                    }, 3000);
                  } catch (err: any) {
                    console.error('Belge yükleme hatası:', err);
                    toast.error(err.response?.data?.message || 'Belgeler yüklenirken bir hata oluştu');
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={Object.keys(uploadedFiles).length === 0 || uploading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Gönder ve Admin'e Bildir
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
                  Belgeleriniz admin'e iletildi. İnceleme sonucunu bu sayfadan takip edebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="group p-1.5 rounded-lg border border-green-200 dark:border-green-700 bg-green-100/70 dark:bg-green-900/40 transition-colors hover:border-green-500 hover:bg-green-200 dark:hover:bg-green-800/70"
              >
                <span className="material-symbols-outlined text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Belge Görüntüleme Modal - Tüm belge türleri için */}
      {imageModalOpen && selectedImageUrl && (() => {
        // Orijinal belge URL'sinden belge türünü belirle (normalize edilmiş URL'den değil)
        const originalDoc = selectedApplication?.documents.find(d => d.name === selectedImageName);
        const originalUrl = originalDoc?.url || selectedImageUrl;
        const isImage = originalUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isPdf = originalUrl.match(/\.pdf$/i);
        const isDocument = !isImage && !isPdf;
        
        return (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setImageModalOpen(false);
                setSelectedImageUrl(null);
                setSelectedImageName('');
                // PDF blob URL'ini temizle
                if (pdfBlobUrl) {
                  URL.revokeObjectURL(pdfBlobUrl);
                  setPdfBlobUrl(null);
                }
              }
            }}
          >
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark shadow-2xl flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      {isImage ? 'image' : isPdf ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                      {selectedImageName}
                    </h3>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                      {isImage ? 'Resim Görüntüleme' : isPdf ? 'PDF Görüntüleme' : 'Belge Görüntüleme'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setImageModalOpen(false);
                    setSelectedImageUrl(null);
                    setSelectedImageName('');
                  }}
                  className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-content-light dark:text-content-dark">close</span>
                </button>
              </div>

              {/* Modal Content - Belge türüne göre görüntüleme */}
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
                {isImage ? (
                  // Resim görüntüleme
                  <img
                    src={selectedImageUrl}
                    alt={selectedImageName}
                    className="max-w-full max-h-[calc(90vh-120px)] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      const errorDetails = {
                        belgeAdi: selectedImageName,
                        belgeUrl: selectedImageUrl,
                        belgeTuru: 'Resim',
                        hataTipi: 'Yükleme Hatası',
                        olasıNedenler: [
                          'Dosya sunucuda bulunamadı',
                          'URL formatı hatalı olabilir',
                          'CORS hatası olabilir',
                          'Dosya yolu yanlış olabilir'
                        ],
                        kontrolEdilecekler: [
                          `URL: ${selectedImageUrl}`,
                          `Backend endpoint: /api/documents/file/`,
                          `Fiziksel dosya yolu kontrol edilmeli`
                        ]
                      };
                      console.error('❌ Resim Yükleme Hatası:', errorDetails);
                      console.error('📋 Detaylı Hata Bilgisi:', {
                        orijinalUrl: doc?.url || 'Bilinmiyor',
                        normalizeEdilmisUrl: selectedImageUrl,
                        belgeAdi: selectedImageName,
                        timestamp: new Date().toISOString()
                      });
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23fee2e2" width="400" height="300"/%3E%3Ctext fill="%23dc2626" font-family="sans-serif" font-size="16" font-weight="bold" x="50%25" y="40%25" text-anchor="middle"%3EResim Yüklenemedi%3C/text%3E%3Ctext fill="%23991b1b" font-family="sans-serif" font-size="12" x="50%25" y="55%25" text-anchor="middle"%3E' + encodeURIComponent(selectedImageName) + '%3C/text%3E%3Ctext fill="%23991b1b" font-family="sans-serif" font-size="10" x="50%25" y="70%25" text-anchor="middle"%3EKonsolu kontrol edin%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : isPdf ? (
                  // PDF görüntüleme - blob URL kullan (CSP sorununu çözer)
                  <div className="w-full h-[calc(90vh-120px)] rounded-lg shadow-lg border border-border-light dark:border-border-dark overflow-hidden bg-background-light dark:bg-background-dark">
                    {pdfLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <span className="material-symbols-outlined text-6xl text-primary animate-spin">sync</span>
                        <p className="text-content-light dark:text-content-dark font-medium">PDF yükleniyor...</p>
                      </div>
                    ) : pdfBlobUrl ? (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full h-full border-0"
                        title={selectedImageName}
                      />
                    ) : (
                      // PDF yüklenemezse fallback
                      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                        <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-red-600 dark:text-red-400">error</span>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-content-light dark:text-content-dark mb-2">
                            PDF Yüklenemedi
                          </p>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                            PDF dosyası tarayıcıda görüntülenemedi. Lütfen konsolu kontrol edin veya dosyayı indirin.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                              href={selectedImageUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                              <span className="material-symbols-outlined text-xl">download</span>
                              PDF'yi İndir
                            </a>
                            <a
                              href={selectedImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark rounded-lg hover:bg-primary/10 transition-colors font-medium"
                            >
                              <span className="material-symbols-outlined text-xl">open_in_new</span>
                              Yeni Sekmede Aç
                            </a>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg max-w-md">
                          <p className="text-xs text-amber-800 dark:text-amber-200 mb-2 font-semibold">Hata Detayları:</p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            URL: <span className="font-mono break-all">{selectedImageUrl}</span>
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                            Konsolu kontrol edin (F12) daha fazla bilgi için.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Diğer belgeler için iframe veya indirme linki
                  <div className="flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-primary">description</span>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-content-light dark:text-content-dark mb-2">
                        {selectedImageName}
                      </p>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                        Bu belge türü tarayıcıda görüntülenemiyor
                      </p>
                      <a
                        href={selectedImageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-xl">download</span>
                        Belgeyi İndir
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    {isImage 
                      ? 'Resmi büyütmek için tıklayın veya ESC tuşuna basarak kapatın'
                      : isPdf
                      ? 'PDF\'yi görüntülemek için yukarıdaki alanı kullanın veya ESC tuşuna basarak kapatın'
                      : 'Belgeyi indirmek için butona tıklayın veya ESC tuşuna basarak kapatın'}
                  </p>
                  <a
                    href={selectedImageUrl}
                    download={!isPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    İndir
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default UrunDurum;

