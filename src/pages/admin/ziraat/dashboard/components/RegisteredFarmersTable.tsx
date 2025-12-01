import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import type { RegisteredFarmer } from '../types';
import { farmerStatusStyles } from '../data/statusStyles';

type RegisteredFarmersTableProps = {
  farmers: RegisteredFarmer[];
  filteredTotal: number;
  rangeStart: number;
  rangeEnd: number;
  currentPage: number;
  totalPages: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onInspect?: (farmerId: string) => void;
};

function RegisteredFarmersTable({
  farmers,
  filteredTotal,
  rangeStart,
  rangeEnd,
  currentPage,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onInspect,
}: RegisteredFarmersTableProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
    onPageChange(1);
  };

  return (
    <div className="space-y-6 rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Kayıtlı Çiftçiler</h2>
        <div className="relative w-full sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
            search
          </span>
          <input
            className="w-full rounded-lg border border-border-light bg-background-light py-2 pl-10 pr-4 focus:border-primary focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark"
            placeholder="Çiftçi ara"
            type="search"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border-light dark:border-border-dark">
        <table className="w-full table-auto">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Çiftçi Adı
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Çiftlik Adı
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Kayıt Tarihi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {farmers.map((farmer) => (
              <tr key={farmer.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
                <td className="px-4 py-3 text-sm font-medium text-content-light dark:text-content-dark">
                  {farmer.name}
                </td>
                <td className="px-4 py-3 text-sm text-subtle-light dark:text-subtle-dark">
                  {farmer.farm}
                </td>
                <td className="px-4 py-3 text-sm text-subtle-light dark:text-subtle-dark">
                  {farmer.registrationDate}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${farmerStatusStyles[farmer.status]}`}>
                    {farmer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {onInspect ? (
                    <button
                      onClick={() => onInspect(farmer.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 hover:border-primary/50 dark:border-primary/40 dark:bg-primary/20 dark:hover:bg-primary/30"
                    >
                      İncele
                      <span className="material-symbols-outlined text-sm leading-none">visibility</span>
                    </button>
                  ) : (
                    <Link
                      to={farmer.detailPath}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 hover:border-primary/50 dark:border-primary/40 dark:bg-primary/20 dark:hover:bg-primary/30"
                    >
                      İncele
                      <span className="material-symbols-outlined text-sm leading-none">open_in_new</span>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {farmers.length === 0 && (
              <tr className="bg-background-light dark:bg-background-dark">
                <td className="px-4 py-4 text-sm text-subtle-light dark:text-subtle-dark" colSpan={5}>
                  Aradığınız kriterlere uygun kayıtlı çiftçi bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle-light dark:text-subtle-dark">
          {filteredTotal === 0 ? 'Gösterilecek çiftçi bulunamadı' : `${rangeStart}-${rangeEnd} / ${filteredTotal} kayıt gösteriliyor`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={filteredTotal === 0 || currentPage === 1}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filteredTotal === 0 || currentPage === 1
                ? 'cursor-not-allowed border-border-light text-subtle-light dark:border-border-dark dark:text-subtle-dark'
                : 'border-primary/30 text-primary hover:bg-primary/10 dark:border-primary/30 dark:text-primary-light dark:hover:bg-primary/20'
            }`}
          >
            Önceki
          </button>
          <span className="text-xs text-subtle-light dark:text-subtle-dark">
            Sayfa {filteredTotal === 0 ? 0 : currentPage} / {filteredTotal === 0 ? 0 : totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={filteredTotal === 0 || currentPage === totalPages}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filteredTotal === 0 || currentPage === totalPages
                ? 'cursor-not-allowed border-border-light text-subtle-light dark:border-border-dark dark:text-subtle-dark'
                : 'border-primary/30 text-primary hover:bg-primary/10 dark:border-primary/30 dark:text-primary-light dark:hover:bg-primary/20'
            }`}
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisteredFarmersTable;

