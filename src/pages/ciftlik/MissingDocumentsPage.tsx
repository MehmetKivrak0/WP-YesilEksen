import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ciftciService } from '../../services/ciftciService';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

type MissingDocument = {
    id: string;
    name: string;
    belgeTuruAdi: string;
    belgeTuruKod: string;
    durum: string;
    url: string | null;
    yuklenmeTarihi: string | null;
    guncellemeTarihi: string | null;
    incelemeTarihi: string | null;
    kullaniciNotu: string | null;
    yoneticiNotu: string | null;
    redNedeni: string | null;
};

function MissingDocumentsPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [missingDocuments, setMissingDocuments] = useState<MissingDocument[]>([]);
    const [application, setApplication] = useState<{ id: string; name: string; owner: string; status: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
    const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);
    const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
    const [documentError, setDocumentError] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadMissingDocuments();
    }, []);

    const loadMissingDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ciftciService.getMissingDocuments();
            
            // Eğer "gcbelge" (güncel belge) durumunda belgeler varsa, giriş sayfasına yönlendir
            if (response.success && response.hasGuncelBelgeler) {
                navigate('/giris');
                return;
            }
            
            if (response.success && response.hasMissingDocuments) {
                setMissingDocuments(response.missingDocuments);
                setApplication(response.application);
            } else if (response.success && response.application && 
                      (response.application.status === 'gcbelge' || response.application.status === 'beklemede')) {
                // Başvuru durumu "gcbelge" veya "beklemede" ise, belgeler yüklendi demektir
                // Giriş sayfasına yönlendir (orada mesaj gösterilecek)
                navigate('/giris');
            } else {
                // Eksik belge yoksa ve başvuru durumu "gcbelge" veya "beklemede" değilse
                // Giriş sayfasına yönlendir
                navigate('/giris');
            }
        } catch (err: any) {
            console.error('Eksik belgeler yükleme hatası:', err);
            setError(err?.response?.data?.message || 'Eksik belgeler yüklenirken bir hata oluştu');
            // Hata durumunda da giriş sayfasına yönlendir
            setTimeout(() => {
                navigate('/giris');
            }, 2000);
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

    const handleFileSelect = (belgeId: string, file: File | null) => {
        if (file) {
            // Dosya validasyonu
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            
            if (file.size > maxSize) {
                setError(`${file.name} dosyası çok büyük! Maksimum 5MB olmalıdır. (Mevcut: ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                setError(`${file.name} için geçersiz dosya formatı! Sadece PDF, JPG, JPEG ve PNG dosyaları yüklenebilir.`);
                return;
            }
            
            setError(null);
        }
        
        setUploadedFiles(prev => {
            if (file) {
                return { ...prev, [belgeId]: file };
            } else {
                const newFiles = { ...prev };
                delete newFiles[belgeId];
                return newFiles;
            }
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(uploadedFiles).length === 0) {
            setError('Lütfen en az bir belge seçin');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Tüm belgeleri yükle
            const uploadPromises = Object.entries(uploadedFiles).map(([belgeId, file]) =>
                ciftciService.uploadMissingDocument(belgeId, file)
            );

            await Promise.all(uploadPromises);

            // Başarılı mesajı göster
            setSuccessMessage('Belgeleriniz başarıyla yüklendi! Admin incelemesi için gönderildi.');
            setUploadedFiles({});
            
            // 2 saniye sonra çıkış yap ve giriş sayfasına yönlendir
            setTimeout(async () => {
                try {
                    await authService.logout();
                    navigate('/giris');
                } catch (err) {
                    console.error('Çıkış hatası:', err);
                    // Hata olsa bile giriş sayfasına git
                    navigate('/giris');
                }
            }, 1000);
        } catch (err: any) {
            console.error('Belge yükleme hatası:', err);
            setError(err?.response?.data?.message || 'Belgeler yüklenirken bir hata oluştu');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-content-light dark:text-content-dark mb-2">
                            Eksik Belgeler
                        </h1>
                        <p className="text-subtle-light dark:text-subtle-dark">
                            {application && `Çiftlik: ${application.name} - Sahibi: ${application.owner}`}
                        </p>
                    </div>

                    {successMessage && (
                        <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                <span>{successMessage}</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-subtle-light dark:text-subtle-dark">Yükleniyor...</div>
                        </div>
                    ) : missingDocuments.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border-light bg-background-light/50 p-8 text-center dark:border-border-dark dark:bg-background-dark/50">
                            <span className="material-symbols-outlined mb-2 text-4xl text-subtle-light dark:text-subtle-dark">check_circle</span>
                            <p className="text-sm font-medium text-content-light dark:text-content-dark">Eksik belge bulunmuyor</p>
                            <button
                                onClick={() => navigate('/ciftlik/panel')}
                                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                            >
                                Çiftçi Paneline Dön
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800 dark:bg-amber-900/20 shadow-lg">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900">
                                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">warning</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Eksik Belgeler</h2>
                                        <p className="text-sm text-subtle-light dark:text-subtle-dark">
                                            Ziraat yöneticisi tarafından eksik olarak işaretlenen belgeleri yükleyin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid gap-4 mb-6">
                                {missingDocuments.map((document) => {
                                    const hasFile = uploadedFiles[document.id] !== undefined;
                                    const hasExistingFile = document.url !== null;

                                    return (
                                        <div
                                            key={document.id}
                                            className="group relative overflow-hidden rounded-lg border-2 border-amber-200 bg-white transition-all hover:border-amber-400 hover:shadow-md dark:border-amber-800 dark:bg-background-dark dark:hover:border-amber-600"
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-800 flex-shrink-0">
                                                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">
                                                                    description
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-content-light dark:text-content-dark text-sm truncate">{document.name}</h4>
                                                                    <span className="inline-flex items-center rounded-full bg-amber-600 px-2 py-0.5 text-xs font-medium text-white">
                                                                        Eksik
                                                                    </span>
                                                                </div>
                                                                {document.yoneticiNotu && (
                                                                    <div className="mt-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                                                        <p className="text-xs text-blue-900 dark:text-blue-200">
                                                                            <span className="font-semibold">Yönetici Notu:</span> {document.yoneticiNotu}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Mevcut belge varsa göster */}
                                                        {hasExistingFile && (
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <span className="text-xs text-subtle-light dark:text-subtle-dark">Mevcut belge:</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewDocument(document.url!, document.name)}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-border-light bg-white px-2 py-1 text-xs text-content-light transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark/50 dark:text-content-dark dark:hover:bg-primary/10"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                                    Görüntüle
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDownloadDocument(document.url!, document.name)}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-border-light bg-white px-2 py-1 text-xs text-content-light transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark/50 dark:text-content-dark dark:hover:bg-primary/10"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                                    İndir
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Yeni belge yükleme alanı */}
                                                        <div className="mt-3">
                                                            <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary bg-background-light dark:bg-background-dark rounded-lg p-4 transition-all duration-300 cursor-pointer">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                                                                        <span className="material-symbols-outlined text-xl text-primary">upload_file</span>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                                                                            {hasFile ? uploadedFiles[document.id].name : 'Yeni belge yüklemek için tıklayın'}
                                                                        </p>
                                                                        <p className="text-xs text-subtle-light dark:text-subtle-dark">PDF, JPG, PNG (Max 5MB)</p>
                                                                        {hasFile && (
                                                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                                Belge seçildi
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    type="file"
                                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0] || null;
                                                                        handleFileSelect(document.id, file);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-border-light pt-4 dark:border-border-dark">
                                <button
                                    className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center gap-2"
                                    onClick={async () => {
                                        try {
                                            await authService.logout();
                                            navigate('/giris');
                                        } catch (err) {
                                            console.error('Çıkış hatası:', err);
                                            // Hata olsa bile çıkış yap ve giriş sayfasına git
                                            navigate('/giris');
                                        }
                                    }}
                                    disabled={uploading}
                                >
                                    <span className="material-symbols-outlined text-base">logout</span>
                                    <span>Çıkış Yap</span>
                                </button>
                                <button
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    onClick={handleSubmit}
                                    disabled={uploading || Object.keys(uploadedFiles).length === 0}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            <span>Yükleniyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">send</span>
                                            <span>Gönder</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
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

export default MissingDocumentsPage;

