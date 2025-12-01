import { useState } from 'react';
import type { FarmApplication } from '../../types';
import FarmStatusBadge from '../FarmStatusBadge';

type InspectModalProps = {
  application: FarmApplication;
  onClose: () => void;
};

function InspectModal({
  application,
  onClose,
}: InspectModalProps) {
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  // Telefon numarasını formatla (Türk formatı: (5XX) XXX-XX-XX)
  const formatPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone || !phone.trim()) return '-';
    
    // Sadece sayıları al
    const numbers = phone.replace(/[^0-9]/g, '');
    
    // 10 haneli telefon numarası formatla
    if (numbers.length === 10) {
      return `(${numbers.substring(0, 3)}) ${numbers.substring(3, 6)}-${numbers.substring(6, 8)}-${numbers.substring(8)}`;
    }
    
    // 11 haneli (0 ile başlayan) telefon numarası formatla
    if (numbers.length === 11 && numbers.startsWith('0')) {
      const withoutZero = numbers.substring(1);
      return `(${withoutZero.substring(0, 3)}) ${withoutZero.substring(3, 6)}-${withoutZero.substring(6, 8)}-${withoutZero.substring(8)}`;
    }
    
    // Formatlanamazsa orijinal değeri döndür
    return phone;
  };

  const handleViewDocument = async (url: string, name: string) => {
    setViewingDocument({ url, name });
    setDocumentError(false);
    setDocumentBlobUrl(null);
    setDocumentLoading(true);
    
    // Dosya türünü kontrol et
    const cleanUrl = url.split('?')[0];
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
    const isPdf = /\.pdf$/i.test(cleanUrl);
    
    // Resim veya PDF ise blob URL oluştur
    if (isImage || isPdf) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setDocumentBlobUrl(blobUrl);
        } else {
          setDocumentError(true);
        }
      } catch (error) {
        console.error('Belge yükleme hatası:', error);
        setDocumentError(true);
      } finally {
        setDocumentLoading(false);
      }
    } else {
      setDocumentLoading(false);
    }
  };


  const handleDownloadDocument = async (url: string, name: string) => {
    try {
      const token = localStorage.getItem('token');
      const downloadUrl = `${url}?download=true`;
      
      // Fetch ile blob al
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }
      
      const blob = await response.blob();
      
      // Blob URL oluştur ve indir
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Dosya adını al (URL'den veya name parametresinden)
      const fileName = name || url.split('/').pop()?.split('?')[0] || 'belge';
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Blob URL'i temizle
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('Belge indirilemedi. Lütfen tekrar deneyin.');
    }
  };


  return (
    <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/40 px-4 py-8 sm:px-8">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
        <button
          className="group absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={onClose}
          aria-label="Kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-8">
          {/* Başlık ve Durum */}
          <div className="border-b border-border-light pb-4 dark:border-border-dark">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">{application.farm}</h2>
                <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
                  Sahibi: {application.owner}
                </p>
              </div>
              <span className="text-xs text-subtle-light dark:text-subtle-dark pr-10">
                {application.lastUpdate}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FarmStatusBadge status={application.status} />
            </div>
          </div>

          {/* Çiftlik Bilgileri - Kompakt Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">location_on</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">Lokasyon</span>
              </div>
              <p className="text-sm font-medium text-content-light dark:text-content-dark">{application.location}</p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">person</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">Sorumlu Kişi</span>
              </div>
              <p className="text-sm font-medium text-content-light dark:text-content-dark">{application.contact.name}</p>
            </div>

            {application.contact.phone && application.contact.phone.trim() && (
              <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">phone</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">Telefon</span>
                </div>
                <p className="text-sm font-medium text-content-light dark:text-content-dark">{formatPhoneNumber(application.contact.phone)}</p>
              </div>
            )}

            <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">email</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">E-Posta</span>
              </div>
              <p className="text-sm font-medium text-content-light dark:text-content-dark">{application.contact.email}</p>
            </div>

            {application.wasteTypes && application.wasteTypes.length > 0 && (
              <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50 sm:col-span-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">category</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">Atık Türleri</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.wasteTypes.map((type, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Belgeler Bölümü */}
          <div className="rounded-xl border-2 border-border-light bg-gradient-to-br from-background-light to-background-light/50 p-6 dark:border-border-dark dark:from-background-dark dark:to-background-dark/50 shadow-lg">
            <div className="mb-6 flex items-center justify-between border-b border-border-light pb-4 dark:border-border-dark">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                  <span className="material-symbols-outlined text-primary text-2xl">description</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-content-light dark:text-content-dark">Belgeler</h3>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    {application.documents.length} belge mevcut
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((document) => {
                // Dosya adını URL'den çıkar - URL formatı: /api/documents/file/farmer/filename.png veya tam URL
                let fileName: string | null = null;
                if (document.url) {
                  try {
                    // URL'den dosya yolunu çıkar
                    const urlParts = document.url.split('/file/');
                    if (urlParts.length > 1) {
                      // Decode edilmiş dosya yolunu al (örn: farmer/filename.png)
                      const filePath = decodeURIComponent(urlParts[1].split('?')[0]); // Query string'i temizle
                      // Dosya adını al (son kısmı)
                      fileName = filePath.split('/').pop() || filePath;
                    } else {
                      // Eğer format beklenen gibi değilse, en sondan al
                      fileName = document.url.split('/').pop()?.split('?')[0] || null;
                    }
                  } catch (e) {
                    // Hata durumunda sadece son kısmı al
                    fileName = document.url.split('/').pop()?.split('?')[0] || null;
                  }
                }
                const truncatedFileName = fileName && fileName.length > 50 ? fileName.substring(0, 50) + '...' : fileName;

                return (
                  <div
                    key={document.name}
                    className="group relative overflow-hidden rounded-lg border border-border-light bg-background-light transition-all hover:border-primary/50 hover:shadow-md dark:border-border-dark dark:bg-background-dark dark:hover:border-primary/30"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                              <span className="material-symbols-outlined text-primary text-lg">
                                {fileName?.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 
                                 fileName?.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i) ? 'image' : 
                                 'description'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-content-light dark:text-content-dark text-sm truncate">{document.name}</h4>
                                {document.status !== 'Beklemede' && (
                                  <FarmStatusBadge status={document.status} />
                                )}
                              </div>
                              {fileName && (
                                <p className="text-xs text-subtle-light dark:text-subtle-dark truncate mt-1" title={fileName}>
                                  {truncatedFileName}
                                </p>
                              )}
                              {!document.url && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">warning</span>
                                  <span>Belge henüz yüklenmemiş</span>
                                </p>
                              )}
                              
                              {/* Admin Notları ve Red Nedenleri */}
                              {((document.adminNote && document.adminNote.trim()) || 
                                (document.redNedeni && document.redNedeni.trim()) || 
                                (document.yoneticiNotu && document.yoneticiNotu.trim())) && (
                                <div className="mt-3 space-y-2 border-t border-border-light pt-3 dark:border-border-dark">
                                  {document.adminNote && document.adminNote.trim() && (
                                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                      <div className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                        <span className="material-symbols-outlined text-sm">note</span>
                                        <span>Admin Notu</span>
                                      </div>
                                      <p className="text-xs text-blue-900 dark:text-blue-200 whitespace-pre-wrap">{document.adminNote.trim()}</p>
                                    </div>
                                  )}
                                  {document.redNedeni && document.redNedeni.trim() && (
                                    <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                      <div className="mb-1 flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                        <span>Red Nedeni</span>
                                      </div>
                                      <p className="text-xs text-red-900 dark:text-red-200 whitespace-pre-wrap">{document.redNedeni.trim()}</p>
                                    </div>
                                  )}
                                  {document.yoneticiNotu && document.yoneticiNotu.trim() && (
                                    <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                                      <div className="mb-1 flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                                        <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                                        <span>Yönetici Notu</span>
                                      </div>
                                      <p className="text-xs text-purple-900 dark:text-purple-200 whitespace-pre-wrap">{document.yoneticiNotu.trim()}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {document.url && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleViewDocument(document.url!, document.name)}
                              className="inline-flex items-center justify-center rounded-lg border border-border-light bg-white p-2.5 text-content-light transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark/50 dark:text-content-dark dark:hover:bg-primary/10"
                              title="Belgeyi görüntüle"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(document.url!, document.name)}
                              className="inline-flex items-center justify-center rounded-lg border border-border-light bg-white p-2.5 text-content-light transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark/50 dark:text-content-dark dark:hover:bg-primary/10"
                              title="Belgeyi indir"
                            >
                              <span className="material-symbols-outlined text-lg">download</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-border-light bg-background-light/50 p-8 text-center dark:border-border-dark dark:bg-background-dark/50">
                  <span className="material-symbols-outlined mb-2 text-4xl text-subtle-light dark:text-subtle-dark">description</span>
                  <p className="text-sm font-medium text-content-light dark:text-content-dark">Henüz belge yüklenmemiş</p>
                  <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">Bu çiftlik için henüz belge yüklenmemiş.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              onClick={onClose}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Belge Görüntüleme Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
            <button
              className="absolute right-4 top-4 z-10 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => {
                if (documentBlobUrl) {
                  URL.revokeObjectURL(documentBlobUrl);
                }
                setViewingDocument(null);
                setDocumentBlobUrl(null);
                setDocumentError(false);
                setDocumentLoading(false);
              }}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-content-light dark:text-content-dark">
                {viewingDocument.name}
              </h3>
              <div className="flex items-center justify-center rounded-lg border border-border-light bg-gray-100 dark:border-border-dark dark:bg-gray-900 min-h-[60vh] relative">
                {(() => {
                  // URL'den query string'i temizle ve dosya uzantısını kontrol et
                  const cleanUrl = viewingDocument.url.split('?')[0];
                  const isPdf = /\.pdf$/i.test(cleanUrl);
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
                  
                  // Loading durumu
                  if (documentLoading) {
                    return (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">Belge yükleniyor...</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Hata durumu
                  if (documentError) {
                    return (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                          {isPdf ? 'picture_as_pdf' : 'broken_image'}
                        </span>
                        <p className="text-content-light dark:text-content-dark mb-4">
                          {isPdf ? 'PDF yüklenemedi' : 'Resim yüklenemedi'}
                        </p>
                        <button
                          onClick={() => handleDownloadDocument(viewingDocument.url, viewingDocument.name)}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          İndir
                        </button>
                      </div>
                    );
                  }
                  
                  // PDF görüntüleme
                  if (isPdf && documentBlobUrl) {
                    return (
                      <iframe
                        src={documentBlobUrl}
                        className="w-full h-[70vh] rounded-lg border-0"
                        title={viewingDocument.name}
                      />
                    );
                  }
                  
                  // Resim görüntüleme
                  if (isImage && documentBlobUrl) {
                    return (
                      <img
                        src={documentBlobUrl}
                        alt={viewingDocument.name}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                        onError={() => {
                          setDocumentError(true);
                          if (documentBlobUrl) {
                            URL.revokeObjectURL(documentBlobUrl);
                            setDocumentBlobUrl(null);
                          }
                        }}
                      />
                    );
                  }
                  
                  // Desteklenmeyen dosya türü
                  return (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                        description
                      </span>
                      <p className="text-content-light dark:text-content-dark mb-4">
                        Bu dosya türü tarayıcıda görüntülenemiyor
                      </p>
                      <button
                        onClick={() => handleDownloadDocument(viewingDocument.url, viewingDocument.name)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        İndir
                      </button>
                    </div>
                  );
                })()}
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleDownloadDocument(viewingDocument.url, viewingDocument.name)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-medium text-content-light transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark/50 dark:text-content-dark dark:hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  İndir
                </button>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default InspectModal;

