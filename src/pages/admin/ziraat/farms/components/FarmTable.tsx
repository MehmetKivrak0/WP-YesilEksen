import type { FarmListRow, FarmStatus } from '../types';
import FarmStatusBadge from './FarmStatusBadge';

const statusOptions: Array<Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>> = ['Aktif', 'Beklemede', 'Askıda'];

type FarmTableProps = {
  farms: FarmListRow[];
  onOpenProducts: (farmName: string) => void;
  onOpenStatusModal: (farm: FarmListRow, nextStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>) => void;
  onOpenDeleteModal: (farm: FarmListRow) => void;
};

function FarmTable({ farms, onOpenProducts, onOpenStatusModal, onOpenDeleteModal }: FarmTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-background-light dark:bg-background-dark">
          <tr className="text-xs uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
            <th className="px-6 py-3 text-left">Çiftlik</th>
            <th className="px-6 py-3 text-left">Çiftçi</th>
            <th className="px-6 py-3 text-left">Kayıt Tarihi</th>
            <th className="px-6 py-3 text-left">Durum</th>
            <th className="px-6 py-3 text-left">Yıllık Üretim (Ton)</th>
            <th className="px-6 py-3 text-left">Yıllık Gelir</th>
            <th className="px-6 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
          {farms.map((farm) => (
            <tr key={farm.name} className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
              <td className="px-6 py-4 font-medium text-content-light dark:text-content-dark">{farm.name}</td>
              <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{farm.farmer}</td>
              <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{farm.registrationDate}</td>
              <td className="px-6 py-4">
                <FarmStatusBadge status={farm.status} />
              </td>
              <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{farm.productionTons.toLocaleString('tr-TR')}</td>
              <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">₺{farm.annualRevenue.toLocaleString('tr-TR')}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30"
                    onClick={() => onOpenProducts(farm.name)}
                  >
                    <span className="material-symbols-outlined text-base">inventory_2</span>
                    Ürünler
                  </button>
                  <div className="relative inline-flex items-center gap-1">
                    <span className="text-xs text-subtle-light dark:text-subtle-dark">Durum</span>
                    <div className="flex items-center gap-1">
                      {statusOptions.map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            farm.status === statusOption
                              ? 'border-primary bg-primary text-white'
                              : 'border-border-light text-subtle-light hover:border-primary hover:text-primary dark:border-border-dark dark:text-subtle-dark'
                          }`}
                          onClick={() => onOpenStatusModal(farm, statusOption)}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-red-500 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    onClick={() => onOpenDeleteModal(farm)}
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FarmTable;
