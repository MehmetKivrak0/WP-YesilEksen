import { useState } from 'react';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    name: string;
    applicationNumber: string;
    applicant: string;
    sector?: string;
    establishmentYear?: number;
    employeeCount?: string;
    email?: string;
    applicationDate: string;
    lastUpdate: string;
    taxNumber?: string;
    description?: string;
    status: string;
    documents?: Array<{ name: string; url?: string }>;
  };
  onApprove?: () => void;
  onReject?: (reason: string) => void;
}

function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
}: ApplicationDetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRejectClick = () => {
    setShowRejectForm(true);
    setError(null);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setError('Lütfen reddetme sebebini giriniz');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (onReject) {
        await onReject(rejectReason);
        setShowRejectForm(false);
        setRejectReason('');
      }
    } catch (err: any) {
      setError(err.message || 'Reddetme işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (onApprove) {
        await onApprove();
      }
    } catch (err: any) {
      setError(err.message || 'Onaylama işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'İncelemede':
        return 'inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Onaylandı':
        return 'inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Revizyon':
      case 'Reddedildi':
        return 'inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-200';
      default:
        return 'inline-flex items-center rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-medium text-[#2E7D32] dark:bg-[#2E7D32]/20 dark:text-[#4CAF50]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl rounded-xl bg-background-light shadow-xl dark:bg-background-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                {application.name}
              </h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Başvuru No: {application.applicationNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-green-900 transition-colors hover:bg-green-50 dark:text-green-600 dark:hover:bg-green-900/20"
          >
            <span className="material-symbols-outlined text-xl font-bold leading-none">close</span>
          </button>
        </div>

        {/* Status Badge */}
        <div className="px-6 pt-4 pb-2">
          <span className={getStatusClass(application.status)}>{application.status}</span>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Genel Bilgiler */}
              <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                  Genel Bilgiler
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">Firma Adı</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {application.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">Başvuru Sahibi</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {application.applicant}
                    </p>
                  </div>
                  {application.sector && (
                    <div>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Sektör</p>
                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {application.sector}
                      </p>
                    </div>
                  )}
                  {application.establishmentYear && (
                    <div>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Kuruluş Yılı</p>
                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {application.establishmentYear}
                      </p>
                    </div>
                  )}
                  {application.employeeCount && (
                    <div>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Çalışan Sayısı</p>
                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {application.employeeCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* İletişim Bilgileri */}
              {application.email && (
                <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    İletişim Bilgileri
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">E-posta</p>
                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {application.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Başvuru Bilgileri */}
              <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                  Başvuru Bilgileri
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">Başvuru Tarihi</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {application.applicationDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">Son Güncelleme</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {application.lastUpdate}
                    </p>
                  </div>
                  {application.taxNumber && (
                    <div>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Vergi Numarası</p>
                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {application.taxNumber}
                      </p>
                    </div>
                  )}
                  {application.description && (
                    <div>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Açıklama</p>
                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {application.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Yüklenen Belgeler */}
              {application.documents && application.documents.length > 0 && (
                <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Yüklenen Belgeler
                  </h3>
                  <div className="space-y-2">
                    {application.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border-light p-3 dark:border-border-dark"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                            description
                          </span>
                          <span className="text-sm text-content-light dark:text-content-dark">{doc.name}</span>
                        </div>
                        {doc.url && (
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-green-600 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                              title="Yeni sekmede görüntüle"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Görüntüle
                            </a>
                            <a
                              href={`${doc.url}?download=true`}
                              download
                              className="inline-flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900"
                              title="İndir"
                            >
                              <span className="material-symbols-outlined text-sm">download</span>
                              İndir
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reject Form */}
        {showRejectForm && (
          <div className="border-t border-border-light px-6 py-4 dark:border-border-dark">
            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark">
                Reddetme Sebebi <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Lütfen reddetme sebebini açıklayınız..."
                rows={3}
                className="w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm text-content-light focus:border-red-500 focus:ring-2 focus:ring-red-500 dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                  setError(null);
                }}
                disabled={isLoading}
                className="rounded-lg border border-border-light bg-background-light px-4 py-2 text-sm font-medium text-content-light transition-colors hover:bg-background-light/80 dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
              >
                İptal
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isLoading || !rejectReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isLoading ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        {!showRejectForm && (
          <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
            >
              Kapat
            </button>
            {onReject && (
              <button
                onClick={handleRejectClick}
                disabled={isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Reddet
              </button>
            )}
            {onApprove && (
              <button
                onClick={handleApproveClick}
                disabled={isLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
              >
                {isLoading ? 'İşleniyor...' : 'Onayla'}
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && !showRejectForm && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationDetailModal;

