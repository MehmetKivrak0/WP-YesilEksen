import type { FarmApplication, DocumentReviewState } from '../../types';

type PreviewApprovalModalProps = {
  application: FarmApplication;
  documentReviews: DocumentReviewState;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
};

function PreviewApprovalModal({
  application,
  documentReviews,
  onClose,
  onConfirm,
  isProcessing = false,
}: PreviewApprovalModalProps) {
  // Belge değişikliği kontrolü helper fonksiyonu
  const hasDocumentChanged = (doc: typeof application.documents[0], review: typeof documentReviews[string]) => {
    if (!review) return false;

    const statusChanged = review.status !== doc.status;
    const reasonAdded = !doc.farmerNote && review.reason && review.reason.trim();
    const adminNoteAdded = !doc.adminNote && review.adminNote && review.adminNote.trim();
    const reasonChanged = doc.farmerNote !== review.reason;
    const adminNoteChanged = doc.adminNote !== review.adminNote;

    return statusChanged || reasonAdded || adminNoteAdded || reasonChanged || adminNoteChanged;
  };

  // Değişiklik yapılan belgeleri bul
  const changedDocuments = application.documents.filter((doc) => {
    const review = documentReviews[doc.name];
    return hasDocumentChanged(doc, review);
  });

  // Belgeleri duruma göre filtrele
  const getDocumentsByStatus = (status: 'Onaylandı' | 'Reddedildi') => {
    return changedDocuments.filter((doc) => {
      const review = documentReviews[doc.name];
      const currentStatus = review?.status ?? doc.status;
      return currentStatus === status;
    });
  };

  const approvedDocuments = getDocumentsByStatus('Onaylandı');
  const rejectedDocuments = getDocumentsByStatus('Reddedildi');
  const hasChanges = changedDocuments.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
        <button
          className="group absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-6">
          <div>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">
              Onay Ön İzleme
            </h2>
            <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
              {application.farm} çiftliği için yapılacak değişikliklerin özeti
            </p>
          </div>

          {!hasChanges ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Henüz belge durumunda değişiklik yapılmamış. Onaylamak için belgeleri inceleyip durumlarını güncelleyin.
              </p>
            </div>
          ) : (
            <>
              {/* Onaylanan Belgeler */}
              {approvedDocuments.length > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-800 dark:bg-green-900/20">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">
                        check_circle
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Onaylanan Belgeler ({approvedDocuments.length})
                      </h3>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Bu belgeler onaylandı olarak işaretlenecek
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {approvedDocuments.map((doc) => {
                      const review = documentReviews[doc.name];
                      const wasChanged = review && review.status !== doc.status;
                      return (
                        <li
                          key={doc.name}
                          className={`flex items-center gap-2 rounded-lg border p-3 ${
                            wasChanged
                              ? 'border-green-300 bg-white dark:border-green-700 dark:bg-background-dark'
                              : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                          }`}
                        >
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                            {wasChanged ? 'arrow_forward' : 'check_circle'}
                          </span>
                          <span className="flex-1 text-sm font-medium text-green-800 dark:text-green-200">
                            {doc.name}
                          </span>
                          {wasChanged && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {doc.status} → Onaylandı
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Reddedilen Belgeler */}
              {rejectedDocuments.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-800 dark:bg-red-900/20">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">
                        cancel
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                        Reddedilen Belgeler ({rejectedDocuments.length})
                      </h3>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Bu belgeler reddedildi olarak işaretlenecek ve çiftçiye bildirilecek
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {rejectedDocuments.map((doc) => {
                      const review = documentReviews[doc.name];
                      const wasChanged = review && review.status !== doc.status;
                      return (
                        <li
                          key={doc.name}
                          className={`rounded-lg border p-4 ${
                            wasChanged
                              ? 'border-red-300 bg-white dark:border-red-700 dark:bg-background-dark'
                              : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                              {wasChanged ? 'arrow_forward' : 'cancel'}
                            </span>
                            <span className="flex-1 text-sm font-medium text-red-800 dark:text-red-200">
                              {doc.name}
                            </span>
                            {wasChanged && (
                              <span className="text-xs text-red-600 dark:text-red-400">
                                {doc.status} → Reddedildi
                              </span>
                            )}
                          </div>
                          {review?.reason && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-white p-3 dark:border-red-700 dark:bg-background-dark/50">
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-800 dark:text-red-200">
                                Çiftçiye İletilecek Açıklama:
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                                {review.reason}
                              </p>
                            </div>
                          )}
                          {review?.adminNote && (
                            <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800/50">
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                Admin İç Notu:
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {review.adminNote}
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 border-t border-border-light pt-4 dark:border-border-dark">
            <button
              className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isProcessing}
            >
              İptal
            </button>
            <button
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={onConfirm}
              disabled={isProcessing || !hasChanges}
            >
              {isProcessing ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Onayla</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewApprovalModal;

