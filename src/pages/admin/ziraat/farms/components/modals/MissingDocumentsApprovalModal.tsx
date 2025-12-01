import { useState } from 'react';
import type { FarmApplication } from '../../types';
import type { MissingDocument } from '../../../../../../services/ziraatService';
import { ziraatService } from '../../../../../../services/ziraatService';

type MissingDocumentsApprovalModalProps = {
  isOpen: boolean;
  application: FarmApplication | null;
  missingDocuments: MissingDocument[];
  onClose: () => void;
  onApproved: () => void;
};

function MissingDocumentsApprovalModal({
  isOpen,
  application,
  missingDocuments,
  onClose,
  onApproved,
}: MissingDocumentsApprovalModalProps) {
  const [checkedAll, setCheckedAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(false);

  if (!isOpen || !application) return null;

  const handleViewDocument = async (url: string, name: string) => {
    if (!url) return;
    
    setViewingDocument({ url, name });
    setDocumentError(false);
    setDocumentBlobUrl(null);
    setDocumentLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Belge yüklenemedi');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setDocumentBlobUrl(blobUrl);
    } catch (error) {
      console.error('Belge görüntüleme hatası:', error);
      setDocumentError(true);
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleCloseDocument = () => {
    if (documentBlobUrl) {
      URL.revokeObjectURL(documentBlobUrl);
    }
    setViewingDocument(null);
    setDocumentBlobUrl(null);
    setDocumentError(false);
  };

  const handleApprove = async () => {
    if (!checkedAll) return;

    setLoading(true);
    try {
      const response = await ziraatService.approveFarm(application.id);
      
      if (response.success) {
        onApproved();
        onClose();
      } else {
        alert(response.message || 'Onay işlemi başarısız');
      }
    } catch (error: any) {
      console.error('Onay hatası:', error);
      alert(error?.response?.data?.message || 'Onay işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const yeniBelgeSayisi = missingDocuments.filter(doc => doc.yeniBelgeYuklendi).length;
  const yuklenmeyenBelgeSayisi = missingDocuments.filter(doc => !doc.url).length;

  return (
    <>
      {/* Ana Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-3xl rounded-xl border border-border-light bg-background-light shadow-xl dark:border-border-dark dark:bg-background-dark">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-light p-6 dark:border-border-dark">
            <div>
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                ⚠️ Eksik Belgeler Kontrolü
              </h2>
              <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
                {application.farm} - {application.owner}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-subtle-light transition-colors hover:bg-primary/10 hover:text-primary dark:text-subtle-dark"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Bu başvuruda eksik belgeler bulunmaktadır. Çiftçi tarafından yüklenen belgeleri kontrol edin.
              </p>
              {yeniBelgeSayisi > 0 && (
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  ✅ {yeniBelgeSayisi} belge çiftçi tarafından yüklendi
                </p>
              )}
              {yuklenmeyenBelgeSayisi > 0 && (
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  ❌ {yuklenmeyenBelgeSayisi} belge henüz yüklenmedi
                </p>
              )}
            </div>

            <div className="space-y-3">
              {missingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                          {doc.url ? 'description' : 'error'}
                        </span>
                        <h4 className="font-semibold text-content-light dark:text-content-dark">
                          {doc.name}
                        </h4>
                        {doc.yeniBelgeYuklendi && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                            Yeni Yüklendi
                          </span>
                        )}
                        {!doc.url && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                            Henüz Yüklenmedi
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                        {doc.belgeTuruAdi}
                      </p>
                      {doc.guncellemeTarihi && (
                        <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                          Son güncelleme: {new Date(doc.guncellemeTarihi).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                    {doc.url && (
                      <button
                        onClick={() => handleViewDocument(doc.url!, doc.name)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/20 dark:hover:bg-primary/30"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Görüntüle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border-light p-6 dark:border-border-dark">
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="checkedAll"
                checked={checkedAll}
                onChange={(e) => setCheckedAll(e.target.checked)}
                className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary dark:border-border-dark"
              />
              <label
                htmlFor="checkedAll"
                className="text-sm font-medium text-content-light dark:text-content-dark"
              >
                Tüm belgeleri kontrol ettim ve onaylıyorum
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-content-light transition-colors hover:bg-primary/5 disabled:opacity-50 dark:border-border-dark dark:text-content-dark"
              >
                İptal
              </button>
              <button
                onClick={handleApprove}
                disabled={!checkedAll || loading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Onaylanıyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Belge Görüntüleme Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="relative h-[90vh] w-full max-w-5xl rounded-xl border border-border-light bg-background-light dark:border-border-dark dark:bg-background-dark">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={handleCloseDocument}
                className="rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex h-full flex-col p-6">
              <h3 className="mb-4 text-lg font-semibold text-content-light dark:text-content-dark">
                {viewingDocument.name}
              </h3>
              <div className="flex-1 overflow-auto rounded-lg border border-border-light bg-background-light dark:border-border-dark dark:bg-background-dark">
                {documentLoading && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-subtle-light dark:text-subtle-dark">Belge yükleniyor...</p>
                    </div>
                  </div>
                )}
                {documentError && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-red-600 dark:text-red-400">
                      <span className="material-symbols-outlined mb-2 text-4xl">error</span>
                      <p>Belge yüklenemedi</p>
                    </div>
                  </div>
                )}
                {documentBlobUrl && !documentLoading && !documentError && (
                  <>
                    {viewingDocument.url.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={documentBlobUrl}
                        className="h-full w-full"
                        title={viewingDocument.name}
                      />
                    ) : (
                      <img
                        src={documentBlobUrl}
                        alt={viewingDocument.name}
                        className="mx-auto h-full max-h-full w-auto object-contain"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MissingDocumentsApprovalModal;

