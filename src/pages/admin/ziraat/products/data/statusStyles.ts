import type { ProductStatus } from '../types';

export const productStatusStyles: Record<ProductStatus, string> = {
  Onaylandı: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  İncelemede: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  Revizyon: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
};
