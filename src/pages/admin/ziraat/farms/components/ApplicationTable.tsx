import { useState } from 'react';
import type { FarmApplication } from '../types';
import FarmStatusBadge from './FarmStatusBadge';

type ApplicationTableProps = {
  applications: FarmApplication[];
  onInspect: (application: FarmApplication) => void;
  onReject: (application: FarmApplication) => void;
  onQuickApprove?: (application: FarmApplication) => void;
  onBelgeEksik?: (application: FarmApplication) => void;
  onUpdatedDocuments?: (application: FarmApplication) => void;
  rejectingId?: string | null;
  approvingId?: string | null;
};

function ApplicationTable({
  applications,
  onInspect,
  onReject,
  onQuickApprove,
  onBelgeEksik,
  onUpdatedDocuments,
  rejectingId,
  approvingId,
}: ApplicationTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<FarmApplication | null>(null);

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

  const renderActionButtons = (farm: FarmApplication) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onInspect(farm)}
        disabled={rejectingId === farm.id || approvingId === farm.id}
      >
        <span className="material-symbols-outlined text-sm">visibility</span>
        <span>İncele</span>
      </button>
      {farm.status !== 'Onaylandı' && farm.status !== 'Reddedildi' && (
        <>
          {onQuickApprove && (
            <button
              className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickApprove(farm);
              }}
              disabled={rejectingId === farm.id || approvingId === farm.id}
            >
              {approvingId === farm.id ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  <span>Onaylanıyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Onayla</span>
                </>
              )}
            </button>
          )}
          {/* Sadece Güncel Belge durumunda "Güncellenen Belgeler" butonu, Belge Eksik durumunda "Belge Eksik" butonu */}
          {farm.status === 'Güncel Belge' && onUpdatedDocuments ? (
            <button
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onUpdatedDocuments?.(farm)}
              disabled={rejectingId === farm.id || approvingId === farm.id}
            >
              <span className="material-symbols-outlined text-sm">update</span>
              <span>Güncellenen Belgeler</span>
            </button>
          ) : onBelgeEksik && farm.status !== 'Güncel Belge' ? (
            <button
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onBelgeEksik?.(farm)}
              disabled={rejectingId === farm.id || approvingId === farm.id}
            >
              <span className="material-symbols-outlined text-sm">description</span>
              <span>Belge Eksik</span>
            </button>
          ) : null}
          <button
            className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onReject(farm)}
            disabled={rejectingId === farm.id || approvingId === farm.id}
          >
            {rejectingId === farm.id ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Reddediliyor...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">cancel</span>
                <span>Reddet</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );

  const renderNotes = (farm: FarmApplication) => {
    // Belgelerde not var mı kontrol et (admin_notu, yonetici_notu, red_nedeni)
    const hasDocumentNotes = farm.documents && farm.documents.length > 0 && farm.documents.some(doc => 
      (doc.adminNote && doc.adminNote.trim()) || 
      (doc.yoneticiNotu && doc.yoneticiNotu.trim()) || 
      (doc.redNedeni && doc.redNedeni.trim())
    );

    // Genel notlar var mı kontrol et
    const filteredNotes = farm.notes
      ? farm.notes
          .split('\n')
          .filter(line => !line.trim().startsWith('Atık Türleri:'))
          .join('\n')
          .trim()
      : null;

    const hasAnyNotes = hasDocumentNotes || filteredNotes;

    if (!hasAnyNotes) {
      return (
        <span className="text-xs text-subtle-light dark:text-subtle-dark">-</span>
      );
    }

    return (
      <button
        onClick={() => setSelectedApplication(farm)}
        className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 dark:border-primary/40 dark:hover:bg-primary/30"
      >
        <span className="material-symbols-outlined text-sm">note</span>
        Göster
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* Mobil Görünüm - Kartlar */}
      <div className="space-y-4 md:hidden">
        {applications.map((farm) => (
          <div
            key={farm.id}
            className="rounded-lg border border-border-light bg-background-light p-4 shadow-sm transition-shadow hover:shadow-md dark:border-border-dark dark:bg-background-dark"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-content-light dark:text-content-dark truncate">{farm.farm}</h3>
                  <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">{farm.owner}</p>
                </div>
                <FarmStatusBadge status={farm.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">location_on</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-content-light dark:text-content-dark truncate">{farm.location}</p>
                  </div>
                </div>
                {farm.contact.phone && farm.contact.phone.trim() && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">phone</span>
                    <p className="text-subtle-light dark:text-subtle-dark">{formatPhoneNumber(farm.contact.phone)}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">schedule</span>
                  <p className="text-subtle-light dark:text-subtle-dark">{farm.lastUpdate}</p>
                </div>
              </div>

              {renderNotes(farm)}

              <div className="pt-2 border-t border-border-light dark:border-border-dark">
                {renderActionButtons(farm)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Görünüm - Tablo */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr className="text-xs uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
              <th className="px-4 py-3 text-left">Çiftlik</th>
              <th className="px-4 py-3 text-left">Sahip</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Adres</th>
              <th className="px-4 py-3 text-left hidden xl:table-cell">Telefon</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-left whitespace-nowrap hidden xl:table-cell">Son Güncelleme</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Notlar</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
            {applications.map((farm) => (
              <tr key={farm.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
                <td className="px-4 py-4 font-medium text-content-light dark:text-content-dark">{farm.farm}</td>
                <td className="px-4 py-4 text-subtle-light dark:text-subtle-dark">{farm.owner}</td>
                <td className="px-4 py-4 text-subtle-light dark:text-subtle-dark hidden lg:table-cell">{farm.location}</td>
                <td className="px-4 py-4 text-subtle-light dark:text-subtle-dark whitespace-nowrap hidden xl:table-cell">
                  {farm.contact.phone && farm.contact.phone.trim() ? formatPhoneNumber(farm.contact.phone) : '-'}
                </td>
                <td className="px-4 py-4">
                  <FarmStatusBadge status={farm.status} />
                </td>
                <td className="px-4 py-4 text-subtle-light dark:text-subtle-dark whitespace-nowrap hidden xl:table-cell">{farm.lastUpdate}</td>
                <td className="px-4 py-4 text-subtle-light dark:text-subtle-dark hidden lg:table-cell max-w-[200px]">
                  {renderNotes(farm)}
                </td>
                <td className="px-4 py-4 text-right">
                  {renderActionButtons(farm)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Notları Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
            <button
              className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => setSelectedApplication(null)}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                Belgeler ve Notlar - {selectedApplication.farm}
              </h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                  selectedApplication.documents
                    .filter(doc => 
                      (doc.adminNote && doc.adminNote.trim()) || 
                      (doc.yoneticiNotu && doc.yoneticiNotu.trim()) || 
                      (doc.redNedeni && doc.redNedeni.trim())
                    )
                    .map((doc, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">description</span>
                          <h4 className="font-semibold text-content-light dark:text-content-dark">{doc.name}</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Çiftçiye Gidecek Mesaj (Admin Notu) */}
                          {doc.adminNote && doc.adminNote.trim() && (
                            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                <span className="material-symbols-outlined text-sm">mail</span>
                                <span>Çiftçiye Gidecek Mesaj</span>
                              </div>
                              <p className="text-xs text-blue-900 dark:text-blue-200 whitespace-pre-wrap">{doc.adminNote.trim()}</p>
                            </div>
                          )}
                          
                          {/* Admin Notu (Yönetici Notu) */}
                          {doc.yoneticiNotu && doc.yoneticiNotu.trim() && (
                            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                                <span>Admin Notu</span>
                              </div>
                              <p className="text-xs text-purple-900 dark:text-purple-200 whitespace-pre-wrap">{doc.yoneticiNotu.trim()}</p>
                            </div>
                          )}
                          
                          {/* Red Nedeni */}
                          {doc.redNedeni && doc.redNedeni.trim() && (
                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                <span>Red Nedeni</span>
                              </div>
                              <p className="text-xs text-red-900 dark:text-red-200 whitespace-pre-wrap">{doc.redNedeni.trim()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-8 text-center dark:border-border-dark dark:bg-background-dark/50">
                    <span className="material-symbols-outlined mb-2 text-4xl text-subtle-light dark:text-subtle-dark">note</span>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">Henüz belge notu eklenmemiş</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedApplication(null)}
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

export default ApplicationTable;

