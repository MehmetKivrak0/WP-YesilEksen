import type { FarmStatus } from '../../types';

const statusLabels: Array<Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>> = ['Aktif', 'Beklemede', 'Askıda'];

type StatusModalProps = {
  open: boolean;
  farmName: string | null;
  currentStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'> | null;
  nextStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'> | null;
  reason: string;
  error: string | null;
  onReasonChange: (reason: string) => void;
  onSelectStatus: (status: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function StatusModal({
  open,
  farmName,
  currentStatus,
  nextStatus,
  reason,
  error,
  onReasonChange,
  onSelectStatus,
  onClose,
  onConfirm,
}: StatusModalProps) {
  if (!open || !farmName || !currentStatus) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-light bg-background-light p-6 shadow-2xl dark:border-border-dark dark:bg-background-dark">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Durum Güncelle</h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {farmName} için mevcut durum {currentStatus}. Yeni durumu seçip gerekçeyi paylaşın.
            </p>
          </div>
          <button
            className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-2xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {statusLabels.map((status) => (
            <button
              key={status}
              type="button"
              className={`rounded-full border px-4 py-1 text-sm font-medium transition-colors ${
                nextStatus === status
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-light text-subtle-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-subtle-dark'
              }`}
              onClick={() => onSelectStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark" htmlFor="status-reason">
              Geçiş Gerekçesi
            </label>
            <textarea
              id="status-reason"
              rows={4}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Durum değişikliğini açıklayın ve yapılacak aksiyonları belirtin."
              className="w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm text-content-light focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            onClick={onConfirm}
          >
            <span className="material-symbols-outlined text-base">sync_saved_locally</span>
            Güncelle
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusModal;
