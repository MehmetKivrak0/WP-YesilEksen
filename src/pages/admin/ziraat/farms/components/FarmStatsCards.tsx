import type { FarmListRow } from '../types';

type FarmStatsCardsProps = {
  farms: FarmListRow[];
  stats: {
    totalFarmers: number;
    totalActiveFarms: number;
    totalProduction: number;
    totalRevenue: number;
  };
};

function FarmStatsCards({ farms, stats }: FarmStatsCardsProps) {
  const cards = [
    {
      label: 'Toplam Çiftlik',
      value: farms.length,
      description: 'Sisteme kayıtlı tüm çiftlikler',
    },
    {
      label: 'Aktif Çiftlik',
      value: stats.totalActiveFarms,
      description: 'Üretimi devam eden onaylı kayıtlar',
    },
    {
      label: 'Toplam Çiftçi',
      value: stats.totalFarmers,
      description: 'Listeye kayıtlı benzersiz çiftçi sayısı',
    },
    {
      label: 'Yıllık Ciro',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      description: 'Tahmini toplam yıllık gelir',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark"
        >
          <p className="text-sm text-subtle-light dark:text-subtle-dark">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-content-light dark:text-content-dark">{card.value}</p>
          <p className="mt-3 text-xs text-subtle-light dark:text-subtle-dark">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

export default FarmStatsCards;
