import { useState } from 'react';
import type { FarmApplication, FarmDocument } from '../../types';
import { ziraatService } from '../../../../../../services/ziraatService';

type BelgeEksikModalProps = {
  application: FarmApplication;
  onClose: () => void;
  onSuccess?: () => void;
};

type DocumentMessageData = {
  farmerMessage: string; // Çiftçiye gidecek mesaj (admin_notu)
  adminNote: string; // Admin notu (yonetici_notu)
};

function BelgeEksikModal({ application, onClose, onSuccess }: BelgeEksikModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [documentMessages, setDocumentMessages] = useState<Record<string, DocumentMessageData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentToggle = (belgeId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(belgeId)) {
        newSet.delete(belgeId);
        // Belge seçimi kaldırıldığında mesajlarını da temizle
        setDocumentMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[belgeId];
          return newMessages;
        });
      } else {
        newSet.add(belgeId);
        // Yeni belge seçildiğinde boş mesaj objesi oluştur
        setDocumentMessages(prev => ({
          ...prev,
          [belgeId]: { farmerMessage: '', adminNote: '' }
        }));
      }
      return newSet;
    });
  };

  const handleFarmerMessageChange = (belgeId: string, message: string) => {
    setDocumentMessages(prev => ({
      ...prev,
      [belgeId]: {
        ...(prev[belgeId] || { farmerMessage: '', adminNote: '' }),
        farmerMessage: message
      }
    }));
  };

  const handleAdminNoteChange = (belgeId: string, note: string) => {
    setDocumentMessages(prev => ({
      ...prev,
      [belgeId]: {
        ...(prev[belgeId] || { farmerMessage: '', adminNote: '' }),
        adminNote: note
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedDocuments.size === 0) {
      setError('Lütfen en az bir belge seçin');
      return;
    }

    // Her seçili belge için çiftçi mesajı kontrolü (admin notu opsiyonel)
    const missingMessages: string[] = [];
    const belgeMessages: Array<{ belgeId: string; farmerMessage: string; adminNote: string }> = [];
    
    selectedDocuments.forEach(belgeId => {
      const messageData = documentMessages[belgeId];
      const farmerMessage = messageData?.farmerMessage?.trim() || '';
      const adminNote = messageData?.adminNote?.trim() || '';
      
      if (!farmerMessage) {
        const doc = application.documents.find(d => d.belgeId === belgeId);
        missingMessages.push(doc?.name || belgeId);
      } else {
        belgeMessages.push({ 
          belgeId, 
          farmerMessage,
          adminNote 
        });
      }
    });

    if (missingMessages.length > 0) {
      setError(`Lütfen şu belgeler için çiftçiye mesaj yazın: ${missingMessages.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await ziraatService.sendBelgeEksikMessage(application.id, {
        belgeMessages: belgeMessages,
      });

      // Başarılı - istatistikleri güncelle ve modal'ı kapat
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Belge eksik mesajı gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
        <button
          className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={onClose}
          aria-label="Kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold text-content-light dark:text-content-dark">
            Belge Eksik - {application.farm}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Belgeler Listesi */}
            <div>
              <h3 className="mb-3 text-lg font-medium text-content-light dark:text-content-dark">
                Eksik Belgeleri Seçin
              </h3>
              <div className="space-y-4 overflow-y-auto rounded-lg border border-border-light p-4 dark:border-border-dark max-h-[400px]">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc: FarmDocument) => {
                    const isSelected = doc.belgeId ? selectedDocuments.has(doc.belgeId) : false;
                    const normalizedStatus = (doc.status || '').toLowerCase();
                    const hasFarmerNote = Boolean(doc.farmerNote && doc.farmerNote.trim());
                    const isAlreadyMissing = normalizedStatus.includes('eksik') || hasFarmerNote;
                    const isChecked = isSelected || isAlreadyMissing;
                    return (
                      <div
                        key={doc.belgeId || doc.name}
                        className={`rounded-lg border-2 p-4 transition-all ${
                          isChecked
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-border-light dark:border-border-dark'
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => doc.belgeId && !isAlreadyMissing && handleDocumentToggle(doc.belgeId)}
                            className="mt-1 h-4 w-4 rounded border-border-light text-primary focus:ring-primary dark:border-border-dark"
                            disabled={!doc.belgeId || isAlreadyMissing}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-content-light dark:text-content-dark">
                              {doc.name}
                            </div>
                            {doc.status && (
                              <div className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                Durum: {isAlreadyMissing ? 'Belge Bekleniyor' : doc.status}
                              </div>
                            )}
                            {isAlreadyMissing && (
                              <div className="mt-2 rounded-lg bg-amber-100/70 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                                <p className="font-medium">Bu belge eksik olarak işaretlenmiş.</p>
                                <p>Çiftçinin güncellemesi bekleniyor; yeni mesaj eklenemez.</p>
                                {hasFarmerNote && (
                                  <p className="mt-2 text-[11px] text-amber-950/80 dark:text-amber-50">
                                    <span className="font-semibold">Çiftçiye iletilen mesaj:</span> {doc.farmerNote}
                                  </p>
                                )}
                                {doc.adminNote && (
                                  <p className="mt-1 text-[11px] text-amber-950/80 dark:text-amber-50">
                                    <span className="font-semibold">Admin notu:</span> {doc.adminNote}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Her belge için çiftçi mesajı ve admin notu */}
                            {isSelected && doc.belgeId && !isAlreadyMissing && (
                              <div className="mt-3 space-y-3">
                                {/* Çiftçiye Gidecek Mesaj */}
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-content-light dark:text-content-dark">
                                    Çiftçiye Gidecek Mesaj *
                                  </label>
                                  <textarea
                                    value={documentMessages[doc.belgeId]?.farmerMessage || ''}
                                    onChange={(e) => handleFarmerMessageChange(doc.belgeId!, e.target.value)}
                                    placeholder={`${doc.name} için çiftçiye gönderilecek mesajı yazın...`}
                                    rows={3}
                                    className="w-full rounded-lg border border-border-light bg-background-light p-2 text-xs text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                                    required
                                  />
                                </div>
                                
                                {/* Admin Notu */}
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-content-light dark:text-content-dark">
                                    Admin Notu (Opsiyonel)
                                  </label>
                                  <textarea
                                    value={documentMessages[doc.belgeId]?.adminNote || ''}
                                    onChange={(e) => handleAdminNoteChange(doc.belgeId!, e.target.value)}
                                    placeholder={`${doc.name} için admin notu yazın (sadece admin görür)...`}
                                    rows={2}
                                    className="w-full rounded-lg border border-border-light bg-background-light p-2 text-xs text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-sm text-subtle-light dark:text-subtle-dark">
                    Belge bulunamadı
                  </div>
                )}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={loading || selectedDocuments.size === 0}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Gönder ve Belge Eksik Yap</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BelgeEksikModal;

