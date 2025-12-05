import { useState, useEffect } from 'react';
import type { FarmApplication } from '../../types';
import { ziraatService } from '../../../../../../services/ziraatService';
import type { MissingDocument } from '../../../../../../services/ziraatService';
import { useToast } from '../../../../../../context/ToastContext';

type UpdatedDocumentsModalProps = {
  application: FarmApplication;
  onClose: () => void;
  onApproved?: () => void;
  onRejected?: () => void;
};

function UpdatedDocumentsModal({
  application,
  onClose,
  onApproved,
  onRejected,
}: UpdatedDocumentsModalProps) {
  const toast = useToast();
  const [updatedDocuments, setUpdatedDocuments] = useState<MissingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    loadUpdatedDocuments();
  }, [application.id]);

  const loadUpdatedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ziraatService.getUpdatedDocuments(application.id);
      if (response.success) {
        setUpdatedDocuments(response.updatedDocuments);
      } else {
        setError('Güncellenen belgeler yüklenemedi');
      }
    } catch (err: any) {
      console.error('Güncellenen belgeler yükleme hatası:', err);
      setError(err?.response?.data?.message || 'Güncellenen belgeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (url: string, name: string) => {
    setViewingDocument({ url, name });
    setDocumentError(false);
    setDocumentBlobUrl(null);
    setDocumentLoading(true);
    
    const cleanUrl = url.split('?')[0];
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
    const isPdf = /\.pdf$/i.test(cleanUrl);
    
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
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name || url.split('/').pop()?.split('?')[0] || 'belge';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('İndirme hatası:', error);
      toast.error('Belge indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleApprove = async () => {
    if (approving) return;
    
    setApproving(true);
    setError(null);
    
    try {
      const response = await ziraatService.approveFarm(application.id);
      
      if (response.success) {
        if (onApproved) {
          onApproved();
        }
        onClose();
      } else {
        setError(response.message || 'Onay işlemi başarısız oldu');
      }
    } catch (err: any) {
      console.error('Onay hatası:', err);
      setError(err?.response?.data?.message || 'Onay işlemi sırasında bir hata oluştu');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (rejecting) return;
    
    const reason = prompt('Red nedeni giriniz:');
    if (!reason || !reason.trim()) {
      return;
    }
    
    // Kullanıcıya onay sor
    const confirmed = window.confirm(
      'Bu çiftlik başvurusu reddedilecek ve tamamen silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?'
    );
    if (!confirmed) {
      return;
    }
    
    setRejecting(true);
    setError(null);
    
    try {
      // Güncellenen belgeler modalından reddetme: başvuruyu tamamen sil
      const response = await ziraatService.rejectFarmAndDelete(application.id, { reason });
      
      if (response.success) {
        if (onRejected) {
          onRejected();
        }
        onClose();
      } else {
        setError(response.message || 'Red işlemi başarısız oldu');
      }
    } catch (err: any) {
      console.error('Red hatası:', err);
      setError(err?.response?.data?.message || 'Red işlemi sırasında bir hata oluştu');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="relative w-full max-w-4xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
          <button
            className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={onClose}
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="max-h-[80vh] space-y-6 overflow-y-auto p-8">
            <div className="border-b border-border-light pb-4 dark:border-border-dark">
              <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">
                Çiftçinin Yeni Yüklediği Belgeler - {application.farm}
              </h2>
              <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
                Sahibi: {application.owner}
              </p>
              <p className="mt-2 text-xs text-subtle-light dark:text-subtle-dark bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                Aşağıda çiftçinin eksik belge mesajından sonra yeni yüklediği belgeler gösterilmektedir.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-subtle-light dark:text-subtle-dark">Yükleniyor...</div>
              </div>
            ) : updatedDocuments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-light bg-background-light/50 p-8 text-center dark:border-border-dark dark:bg-background-dark/50">
                <span className="material-symbols-outlined mb-2 text-4xl text-subtle-light dark:text-subtle-dark">description</span>
                <p className="text-sm font-medium text-content-light dark:text-content-dark">Henüz yeni belge yüklenmemiş</p>
                <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                  Çiftçi tarafından eksik belge mesajından sonra henüz yeni belge yüklenmemiş.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border-2 border-border-light bg-gradient-to-br from-background-light to-background-light/50 p-6 dark:border-border-dark dark:from-background-dark dark:to-background-dark/50 shadow-lg">
                  <div className="mb-6 flex items-center justify-between border-b border-border-light pb-4 dark:border-border-dark">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">update</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-content-light dark:text-content-dark">Yeni Yüklenen Belgeler</h3>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">
                          Çiftçi tarafından {updatedDocuments.length} belge yeni yüklendi
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {updatedDocuments.map((document) => {
                      let fileName: string | null = null;
                      if (document.url) {
                        try {
                          const urlParts = document.url.split('/file/');
                          if (urlParts.length > 1) {
                            const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
                            fileName = filePath.split('/').pop() || filePath;
                          } else {
                            fileName = document.url.split('/').pop()?.split('?')[0] || null;
                          }
                        } catch (e) {
                          fileName = document.url.split('/').pop()?.split('?')[0] || null;
                        }
                      }
                      const truncatedFileName = fileName && fileName.length > 50 ? fileName.substring(0, 50) + '...' : fileName;

                      return (
                        <div
                          key={document.id}
                          className="group relative overflow-hidden rounded-lg border-2 border-blue-200 bg-blue-50/50 transition-all hover:border-blue-400 hover:shadow-md dark:border-blue-800 dark:bg-blue-900/20 dark:hover:border-blue-600"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800 flex-shrink-0">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">
                                      {fileName?.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 
                                       fileName?.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i) ? 'image' : 
                                       'description'}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-content-light dark:text-content-dark text-sm truncate">{document.name}</h4>
                                      <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                        Yeni
                                      </span>
                                    </div>
                                    {fileName && (
                                      <p className="text-xs text-subtle-light dark:text-subtle-dark truncate mt-1" title={fileName}>
                                        {truncatedFileName}
                                      </p>
                                    )}
                                    {document.yuklenmeTarihi && (
                                      <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                        <span className="font-semibold">Yeni Yükleme Tarihi:</span> {new Date(document.yuklenmeTarihi).toLocaleString('tr-TR')}
                                      </p>
                                    )}
                                    {document.incelemeTarihi && (
                                      <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                        <span className="font-semibold">Eksik Belge Mesajı Tarihi:</span> {new Date(document.incelemeTarihi).toLocaleString('tr-TR')}
                                      </p>
                                    )}
                                    {document.kullaniciNotu && (
                                      <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                                        <p className="text-xs text-amber-900 dark:text-amber-200">
                                          <span className="font-semibold">Önceki mesaj:</span> {document.kullaniciNotu}
                                        </p>
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
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border-light pt-4 dark:border-border-dark">
                  <button
                    className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    onClick={onClose}
                    disabled={approving || rejecting}
                  >
                    İptal
                  </button>
                  <button
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={handleReject}
                    disabled={approving || rejecting}
                  >
                    {rejecting ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Reddediliyor...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">cancel</span>
                        <span>Reddet</span>
                      </>
                    )}
                  </button>
                  <button
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={handleApprove}
                    disabled={approving || rejecting}
                  >
                    {approving ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Onaylanıyor...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span>Onayla</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Belge Görüntüleme Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
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
                  const cleanUrl = viewingDocument.url.split('?')[0];
                  const isPdf = /\.pdf$/i.test(cleanUrl);
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
                  
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
                  
                  if (isPdf && documentBlobUrl) {
                    return (
                      <iframe
                        src={documentBlobUrl}
                        className="w-full h-[70vh] rounded-lg border-0"
                        title={viewingDocument.name}
                      />
                    );
                  }
                  
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
                  onClick={() => {
                    if (documentBlobUrl) {
                      URL.revokeObjectURL(documentBlobUrl);
                    }
                    setViewingDocument(null);
                    setDocumentBlobUrl(null);
                    setDocumentError(false);
                    setDocumentLoading(false);
                  }}
                  className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UpdatedDocumentsModal;

