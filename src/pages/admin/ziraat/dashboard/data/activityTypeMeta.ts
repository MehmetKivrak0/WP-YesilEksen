import type { ActivityTypeMetaMap } from '../types';

export const activityTypeMeta: ActivityTypeMetaMap = {
  kayit: {
    label: 'Kayıt',
    icon: 'person_add',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200',
    bubbleClass: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconClass: 'text-emerald-600 dark:text-emerald-300',
  },
  guncelleme: {
    label: 'Güncelleme',
    icon: 'update',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-200',
    bubbleClass: 'bg-amber-100 dark:bg-amber-900/40',
    iconClass: 'text-amber-600 dark:text-amber-300',
  },
  onay: {
    label: 'Onay',
    icon: 'verified',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-200',
    bubbleClass: 'bg-green-100 dark:bg-green-900/40',
    iconClass: 'text-green-600 dark:text-green-300',
  },
  red: {
    label: 'Red',
    icon: 'cancel',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200',
    bubbleClass: 'bg-red-100 dark:bg-red-900/40',
    iconClass: 'text-red-600 dark:text-red-300',
  },
  durum_degisikligi: {
    label: 'Durum Değişikliği',
    icon: 'swap_horiz',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-200',
    bubbleClass: 'bg-blue-100 dark:bg-blue-900/40',
    iconClass: 'text-blue-600 dark:text-blue-300',
  },
};

