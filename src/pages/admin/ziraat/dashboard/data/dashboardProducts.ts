import type { DashboardProduct } from '../types';

export const dashboardProducts: DashboardProduct[] = [
  {
    id: 'product-1',
    name: 'Organik Kompost',
    producer: 'Anadolu Tarım Kooperatifi',
    status: 'İncelemede',
    lastUpdate: '2 saat önce',
  },
  {
    id: 'product-2',
    name: 'Sıvı Gübre',
    producer: 'Çukurova Ziraat',
    status: 'Stokta',
    lastUpdate: 'Dün',
  },
  {
    id: 'product-3',
    name: 'Hayvansal Yem',
    producer: 'Bereket Gıda',
    status: 'Tükendi',
    lastUpdate: '3 gün önce',
  },
];

