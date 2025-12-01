import type { ChangeEvent } from 'react';
import type { DashboardProduct } from '../types';
import { productStatusStyles } from '../data/statusStyles';

type ProductsTableProps = {
  products: DashboardProduct[];
  search: string;
  onSearchChange: (value: string) => void;
};

function ProductsTable({ products, search, onSearchChange }: ProductsTableProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="space-y-6 rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Ürünler</h2>
        <div className="relative w-full sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
            search
          </span>
          <input
            className="w-full rounded-lg border border-border-light bg-background-light py-2 pl-10 pr-4 focus:border-primary focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark"
            placeholder="Ürün ara"
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Ürün
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Üretici
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Durum
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                Son Güncelleme
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
                <td className="px-6 py-4 text-sm font-medium text-content-light dark:text-content-dark">{product.name}</td>
                <td className="px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">{product.producer}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${productStatusStyles[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">{product.lastUpdate}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr className="bg-background-light dark:bg-background-dark">
                <td className="px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark" colSpan={4}>
                  Aradığınız kriterlere uygun ürün kaydı bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsTable;

