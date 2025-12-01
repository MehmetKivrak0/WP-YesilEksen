import type { FarmStatus } from '../types';

export const farmStatusStyles: Record<FarmStatus, string> = {
  Onaylandı: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  'Reddedildi': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
  'İlk İnceleme': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  'Belge Eksik': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
  Aktif: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
  Beklemede: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200',
  Askıda: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
};

