import type { Activity } from '../types';

export const activityLog: Activity[] = [
  {
    id: 'activity-1',
    title: 'Yeni çiftçi kaydı oluşturuldu',
    description: 'Mehmet Yılmaz sisteme eklendi ve temel bilgiler tamamlandı.',
    timestamp: '2 saat önce',
    type: 'kayit',
  },
  {
    id: 'activity-2',
    title: 'Çiftlik bilgileri güncellendi',
    description: 'Güneş Çiftliği arazi bilgileri ve üretim kapasitesi güncellendi.',
    timestamp: '4 saat önce',
    type: 'guncelleme',
  },
  {
    id: 'activity-3',
    title: 'Çiftlik sertifikası onaylandı',
    description: 'Bereket Çiftliği için organik sertifika süreci tamamlandı.',
    timestamp: '6 saat önce',
    type: 'onay',
  },
];

