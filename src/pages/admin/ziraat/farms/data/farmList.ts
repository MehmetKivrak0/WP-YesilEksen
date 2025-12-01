import type { FarmListRow } from '../types';

export const initialFarmRows: FarmListRow[] = [
  {
    name: 'Güneş Çiftliği',
    farmer: 'Mehmet Yılmaz',
    registrationDate: '2024-01-15',
    status: 'Aktif',
    productionTons: 5300,
    annualRevenue: 840_000,
  },
  {
    name: 'Bereket Çiftliği',
    farmer: 'Ayşe Demir',
    registrationDate: '2024-01-10',
    status: 'Beklemede',
    productionTons: 4800,
    annualRevenue: 780_000,
  },
  {
    name: 'Ege Organik',
    farmer: 'Ali Kaya',
    registrationDate: '2024-01-05',
    status: 'Aktif',
    productionTons: 5100,
    annualRevenue: 795_000,
  },
  {
    name: 'Anadolu Hasat',
    farmer: 'Selin Acar',
    registrationDate: '2024-01-02',
    status: 'Askıda',
    productionTons: 4200,
    annualRevenue: 610_000,
  },
];

export const farmProductsCatalog: Record<string, string[]> = {
  'Güneş Çiftliği': ['Organik Zeytinyağı', 'Güneş Domatesi'],
  'Bereket Çiftliği': ['Doğal Bal'],
  'Ege Organik': [],
  'Anadolu Hasat': ['Anadolu Buğdayı', 'Yerel Nohut'],
};
