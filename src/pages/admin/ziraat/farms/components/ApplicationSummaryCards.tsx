import { useMemo } from 'react';
import type { FarmApplication } from '../types';

type ApplicationSummaryCardsProps = {
  applications: FarmApplication[];
  approvedFarmCount: number;
  pendingCount?: number;
  belgeEksikCount?: number;
  rejectedCount?: number;
  guncelBelgeCount?: number;
};

function ApplicationSummaryCards({ applications, approvedFarmCount, pendingCount: propPendingCount, belgeEksikCount: propBelgeEksikCount, rejectedCount: propRejectedCount, guncelBelgeCount: propGuncelBelgeCount }: ApplicationSummaryCardsProps) {
  // Backend'den gelen dinamik istatistikleri kullan, yoksa frontend'de hesapla
  const { pendingCount, approvedCount, belgeEksikCount, rejectedCount, guncelBelgeCount } = useMemo(() => {
    const pending = propPendingCount ?? applications.filter((farm) => farm.status === 'İlk İnceleme').length;
    const approved = applications.filter((farm) => farm.status === 'Onaylandı').length;
    const belgeEksik = propBelgeEksikCount ?? applications.filter((farm) => farm.status === 'Belge Eksik').length;
    const rejected = propRejectedCount ?? applications.filter((farm) => farm.status === 'Reddedildi').length;
    const guncelBelge = propGuncelBelgeCount ?? applications.filter((farm) => farm.status === 'Güncel Belge').length;

    return {
      pendingCount: pending,
      approvedCount: approved,
      belgeEksikCount: belgeEksik,
      rejectedCount: rejected,
      guncelBelgeCount: guncelBelge,
    };
  }, [applications, propPendingCount, propBelgeEksikCount, propRejectedCount, propGuncelBelgeCount]);

  const cards = [
    {
      label: 'Bekleyen Başvurular',
      value: pendingCount,
      description: 'İlk inceleme bekleyen başvurular',
      icon: 'schedule',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Onaylanan Çiftlikler',
      value: approvedFarmCount || approvedCount,
      description: approvedFarmCount
        ? 'Aktif çiftlikler (ciftlikler tablosu)'
        : 'Toplam onaylanan çiftlik sayısı',
      icon: 'verified',
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Eksik Bilgiler',
      value: belgeEksikCount,
      description: 'Kabul Edilmeyen Belge sayısı',
      icon: 'cancel',
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      label: 'Güncellenen Belgeler',
      value: guncelBelgeCount,
      description: 'Admin onayı bekleyen güncel belgeler',
      icon: 'update',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">{card.label}</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{card.value}</p>
              <p className="mt-2 text-xs text-subtle-light dark:text-subtle-dark">{card.description}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}>
              <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ApplicationSummaryCards;

