import type { FarmStatus } from '../types';

type ApplicationFiltersProps = {
  selectedStatus: 'Hepsi' | FarmStatus;
  onStatusChange: (status: 'Hepsi' | FarmStatus) => void;
  onShowLogs?: () => void;
};

const statusOptions: Array<'Hepsi' | FarmStatus> = ['Hepsi', 'İlk İnceleme', 'Onaylandı', 'Belge Eksik', 'Güncel Belge'];

function ApplicationFilters({ selectedStatus, onStatusChange, onShowLogs }: ApplicationFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark" htmlFor="farm-status-filter">
        Durum Filtresi
      </label>
      <select
        id="farm-status-filter"
        className="rounded-lg border border-border-light bg-background-light p-2 text-sm dark:border-border-dark dark:bg-background-dark"
        value={selectedStatus}
        onChange={(event) => onStatusChange(event.target.value as 'Hepsi' | FarmStatus)}
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {onShowLogs && (
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30"
          onClick={onShowLogs}
        >
          <span className="material-symbols-outlined text-base">history</span>
          İşlem Geçmişi
        </button>
      )}
    </div>
  );
}

export default ApplicationFilters;

