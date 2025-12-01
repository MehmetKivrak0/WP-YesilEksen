import { useState, useEffect, useMemo } from 'react';
import { ziraatService } from '../../../../../services/ziraatService';

type FarmerDetailModalProps = {
  isOpen: boolean;
  farmerId: string | null;
  onClose: () => void;
};

function FarmerDetailModal({ isOpen, farmerId, onClose }: FarmerDetailModalProps) {
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(false);
  // API base URL'ini api.ts ile aynı mantıkta oluştur
  const apiBaseUrl = useMemo(() => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }, []);

  useEffect(() => {
    if (isOpen && farmerId) {
      loadFarmerDetails();
    } else {
      setFarmer(null);
      setError(null);
    }
  }, [isOpen, farmerId]);

  const loadFarmerDetails = async () => {
    if (!farmerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await ziraatService.getFarmerDetails(farmerId);
      if (response.success) {
        setFarmer(response.farmer);
      } else {
        setError('Çiftçi detayları yüklenemedi');
      }
    } catch (err: any) {
      console.error('Çiftçi detayları yükleme hatası:', err);
      setError(err.response?.data?.message || 'Çiftçi detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const formatFileName = (name?: string) => {
    if (!name) return 'Belge';
    try {
      return decodeURIComponent(name);
    } catch {
      return name;
    }
  };

  const handleViewDocument = async (doc: any) => {
    if (!doc?.url) return;

    setViewingDocument({ url: doc.url, name: formatFileName(doc.name || doc.belgeTuru) });
    setDocumentError(false);
    setDocumentBlobUrl(null);
    setDocumentLoading(true);

    const token = localStorage.getItem('token');
    
    // URL'yi doğru şekilde oluştur
    let absoluteUrl: string;
    if (doc.url.startsWith('http')) {
      absoluteUrl = doc.url;
    } else {
      // Backend'den gelen path: /documents/file/... formatında
      // apiBaseUrl zaten http://localhost:5000/api formatında
      // Sadece birleştir, çift /api oluşmasın
      const cleanPath = doc.url.startsWith('/') ? doc.url : '/' + doc.url;
      absoluteUrl = `${apiBaseUrl}${cleanPath}`;
    }
    
    console.log('🔍 [BELGE URL]', { 
      originalUrl: doc.url, 
      apiBaseUrl, 
      absoluteUrl,
      fileName: doc.name 
    });
    
    // Dosya uzantısını kontrol et (dosya adından veya URL'den)
    const fileName = doc.name || doc.belgeTuru || '';
    const urlForExtension = absoluteUrl.split('?')[0];
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) || /\.(jpg|jpeg|png|gif|webp)$/i.test(urlForExtension);
    const isPdf = /\.pdf$/i.test(fileName) || /\.pdf$/i.test(urlForExtension);

    if (isImage || isPdf) {
      try {
        const response = await fetch(absoluteUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setDocumentBlobUrl(blobUrl);
        } else {
          setDocumentError(true);
        }
      } catch (err) {
        console.error('Belge görüntüleme hatası:', err);
        setDocumentError(true);
      } finally {
        setDocumentLoading(false);
      }
    } else {
      setDocumentLoading(false);
      window.open(absoluteUrl, '_blank');
    }
  };

  const handleCloseDocument = () => {
    if (documentBlobUrl) {
      URL.revokeObjectURL(documentBlobUrl);
    }
    setViewingDocument(null);
    setDocumentBlobUrl(null);
    setDocumentError(false);
    setDocumentLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark max-h-[90vh] overflow-hidden">
        <button
          className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={onClose}
          aria-label="Kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <h2 className="mb-6 text-2xl font-semibold text-content-light dark:text-content-dark">
            Çiftçi Detayları
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Yükleniyor...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          ) : farmer ? (
            <div className="space-y-6">
              {/* Durum Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Durum: Onaylandı
                </span>
              </div>

              {/* Çiftlik Bilgileri */}
              <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark">
                <h3 className="mb-4 text-lg font-semibold text-content-light dark:text-content-dark">
                  Çiftlik Bilgileri
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Çiftçi Adı
                    </p>
                    <p className="mt-1 text-sm font-medium text-content-light dark:text-content-dark">
                      {farmer.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Çiftlik Adı
                    </p>
                    <p className="mt-1 text-sm font-medium text-content-light dark:text-content-dark">
                      {farmer.farmName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      E-posta
                    </p>
                    <p className="mt-1 text-sm text-content-light dark:text-content-dark">
                      {farmer.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Telefon
                    </p>
                    <p className="mt-1 text-sm text-content-light dark:text-content-dark">
                      {farmer.phone || '-'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Adres
                    </p>
                    <p className="mt-1 text-sm text-content-light dark:text-content-dark">
                      {farmer.address || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Kayıt Tarihi
                    </p>
                    <p className="mt-1 text-sm text-content-light dark:text-content-dark">
                      {farmer.registrationDate
                        ? new Date(farmer.registrationDate).toLocaleDateString('tr-TR')
                        : '-'}
                    </p>
                  </div>
                </div>
                {farmer.description && (
                  <div className="mt-6 rounded-lg border-l-4 border-primary/50 bg-primary/5 p-4 dark:bg-primary/10">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                      <div className="flex-1">
                        <p className="mb-2 text-sm font-semibold text-content-light dark:text-content-dark">
                          Açıklama
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-light dark:text-content-dark">
                          {farmer.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Belgeler */}
              <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark">
                <h3 className="mb-4 text-lg font-semibold text-content-light dark:text-content-dark">
                  Belgeler
                </h3>
                {farmer.documents && farmer.documents.length > 0 ? (
                  <div className="space-y-3">
                    {farmer.documents.map((doc: any) => {
                      const getStatusColor = (status: string) => {
                        const normalizedStatus = (status || '').toLowerCase();
                        if (normalizedStatus === 'onaylandi' || normalizedStatus === 'onaylandı') {
                          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                        }
                        if (normalizedStatus === 'eksik') {
                          return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
                        }
                        if (normalizedStatus === 'reddedildi') {
                          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                        }
                        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                      };

                      const getStatusLabel = (status: string) => {
                        const normalizedStatus = (status || '').toLowerCase();
                        if (normalizedStatus === 'onaylandi' || normalizedStatus === 'onaylandı') return 'Onaylandı';
                        if (normalizedStatus === 'eksik') return 'Eksik';
                        if (normalizedStatus === 'reddedildi') return 'Reddedildi';
                        if (normalizedStatus === 'beklemede') return 'Beklemede';
                        return status || 'Bilinmiyor';
                      };

                      const documentUrl = doc.url
                        ? (doc.url.startsWith('http')
                            ? doc.url
                            : `${apiBaseUrl}${doc.url.startsWith('/') ? '' : '/'}${doc.url}`)
                        : null;
                      const displayName = formatFileName(doc.name || doc.belgeTuru);

                      return (
                        <div
                          key={doc.belgeId}
                          className="flex items-center justify-between rounded-lg border border-border-light bg-background-light p-4 transition-colors hover:bg-primary/5 dark:border-border-dark dark:bg-background-dark dark:hover:bg-primary/10"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg text-primary">description</span>
                              <p className="text-sm font-medium text-content-light dark:text-content-dark">
                                {displayName}
                              </p>
                            </div>
                            {doc.status && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(doc.status)}`}>
                                  {getStatusLabel(doc.status)}
                                </span>
                              </div>
                            )}
                            {doc.belgeTuru && (
                              <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                                Tür: {doc.belgeTuru}
                              </p>
                            )}
                          </div>
                          {documentUrl && (
                            <button
                              type="button"
                              onClick={() => handleViewDocument(doc)}
                              className="ml-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 hover:border-primary/50 dark:border-primary/40 dark:hover:bg-primary/30"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Görüntüle
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border-light bg-background-light/50 p-6 text-center dark:border-border-dark dark:bg-background-dark/50">
                    <span className="material-symbols-outlined mb-2 text-4xl text-subtle-light dark:text-subtle-dark">description</span>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Henüz belge yüklenmemiş
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Belge görüntüleme popup */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="relative w-full max-w-4xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
            <button
              className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={handleCloseDocument}
              aria-label="Belgeyi kapat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-content-light dark:text-content-dark">
                {viewingDocument.name}
              </h3>

              {documentLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Belge yükleniyor...</p>
                  </div>
                </div>
              ) : documentError ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined mb-3 text-5xl text-red-500">error</span>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Belge görüntülenemedi. Lütfen tekrar deneyin.
                  </p>
                </div>
              ) : documentBlobUrl ? (
                /\.(pdf)$/i.test(viewingDocument.url.split('?')[0]) ? (
                  <iframe
                    src={documentBlobUrl}
                    title={viewingDocument.name}
                    className="h-[70vh] w-full rounded-xl border border-border-light dark:border-border-dark"
                  />
                ) : (
                  <img
                    src={documentBlobUrl}
                    alt={viewingDocument.name}
                    className="mx-auto max-h-[70vh] w-auto rounded-xl border border-border-light object-contain dark:border-border-dark"
                  />
                )
              ) : (
                <div className="flex h-[60vh] items-center justify-center text-sm text-subtle-light dark:text-subtle-dark">
                  Belge açılıyor...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerDetailModal;

