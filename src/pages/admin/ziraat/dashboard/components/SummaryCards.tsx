import type { FarmSummary, ProductSummary } from '../types';

type SummaryCardsProps = {
  productSummary: ProductSummary;
  farmSummary: FarmSummary;
};

function SummaryCards({ productSummary, farmSummary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">Bekleyen Ürün Başvurusu</p>
            <p className="text-3xl font-bold text-content-light dark:text-content-dark">
              {productSummary.pending}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <span className="material-symbols-outlined text-2xl text-primary">shopping_bag</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-600 dark:text-green-400">+3 yeni başvuru</span>
          <span className="text-sm text-subtle-light dark:text-subtle-dark"> son 24 saatte</span>
        </div>
      </div>

      <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">Bekleyen Çiftlik Başvurusu</p>
            <p className="text-3xl font-bold text-content-light dark:text-content-dark">
              {farmSummary.newApplications ?? 0}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <span className="material-symbols-outlined text-2xl text-primary">agriculture</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-subtle-light dark:text-subtle-dark"> Sayısı</span>
        </div>
      </div>

      <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">Bu Ay Onaylanan Ürün</p>
            <p className="text-3xl font-bold text-content-light dark:text-content-dark">
              {productSummary.approved}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <span className="material-symbols-outlined text-2xl text-primary">check_circle</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-600 dark:text-green-400">%22 artış</span>
          <span className="text-sm text-subtle-light dark:text-subtle-dark"> geçen aya göre</span>
        </div>
      </div>

      <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">Onaylanan Çiftlikler</p>
            <p className="text-3xl font-bold text-content-light dark:text-content-dark">
              {farmSummary.approved}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <span className="material-symbols-outlined text-2xl text-primary">home</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-600 dark:text-green-400">Aktif çiftlik toplamı</span>
          <span className="text-sm text-subtle-light dark:text-subtle-dark"> ciftlikler tablosu</span>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;

