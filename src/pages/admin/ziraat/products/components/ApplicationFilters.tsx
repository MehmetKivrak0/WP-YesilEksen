import type { ProductStatus } from '../types';

type ApplicationFiltersProps = {
  selectedStatus: 'Hepsi' | ProductStatus;
  onStatusChange: (status: 'Hepsi' | ProductStatus) => void;
};

const statusOptions: Array<'Hepsi' | ProductStatus> = ['Hepsi', 'İncelemede', 'Onaylandı', 'Revizyon'];

function ApplicationFilters({ selectedStatus, onStatusChange }: ApplicationFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark" htmlFor="product-status-filter">
        Durum Filtresi
      </label>
      <select
        id="product-status-filter"
        className="rounded-lg border border-border-light bg-background-light p-2 text-sm dark:border-border-dark dark:bg-background-dark"
        value={selectedStatus}
        onChange={(event) => onStatusChange(event.target.value as 'Hepsi' | ProductStatus)}
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ApplicationFilters;
