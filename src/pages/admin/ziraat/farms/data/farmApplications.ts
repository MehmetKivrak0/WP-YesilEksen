import type { FarmApplication } from '../types';

export const initialFarmApplications: FarmApplication[] = [
  {
    farm: 'Lale Bahçesi',
    owner: 'Hilal Karaca',
    location: 'Konya, Meram',
    status: 'İlk İnceleme',
    lastUpdate: 'Bugün',
    notes: 'İlk inceleme tamamlandı, rapor hazırlanıyor.',
    contact: {
      name: 'Hilal Karaca',
      phone: '+90 536 111 22 33',
      email: 'hilal.karaca@lalebahcesi.com',
    },
    documents: [
      { name: 'Tapu Senedi veya Onaylı Kira Sözleşmesi', status: 'Onaylandı', url: '/docs/lale-bahcesi-tapu.pdf' },
      { name: 'Nüfus Cüzdanı Fotokopisi', status: 'Onaylandı', url: '/docs/lale-bahcesi-nufus.pdf' },
      { name: 'Çiftçi Kütüğü Kaydı', status: 'Beklemede', farmerNote: 'Ziraat Odasından güncel kayıt bekleniyor.' },
      { name: 'Muvafakatname', status: 'Eksik' },
    ],
  },
  {
    farm: 'Göksu Organik',
    owner: 'Yağız Yıldırım',
    location: 'Antalya, Manavgat',
    status: 'Onaylandı',
    lastUpdate: '2 gün önce',
    notes: 'Onay belgesi iletildi.',
    contact: {
      name: 'Yağız Yıldırım',
      phone: '+90 533 987 65 43',
      email: 'yagiz.yildirim@goksuorganik.com',
    },
    documents: [
      { name: 'Tapu Senedi veya Onaylı Kira Sözleşmesi', status: 'Onaylandı', url: '/docs/goksu-tapu.pdf' },
      { name: 'Nüfus Cüzdanı Fotokopisi', status: 'Onaylandı', url: '/docs/goksu-nufus.pdf' },
      { name: 'Çiftçi Kütüğü Kaydı', status: 'Onaylandı', url: '/docs/goksu-ciftci-kutuğü.pdf' },
      { name: 'Taahhütname', status: 'Onaylandı', url: '/docs/goksu-taahhutname.pdf' },
      { name: 'Döner Sermaye Ücret Makbuzu', status: 'Onaylandı', url: '/docs/goksu-makbuz.pdf' },
    ],
  },
  {
    farm: 'Pamukova Tarım',
    owner: 'Selim Demirtaş',
    location: 'Sakarya, Pamukova',
    status: 'Evrak Bekliyor',
    lastUpdate: '3 gün önce',
    notes: 'Analiz raporu eksik.',
    contact: {
      name: 'Selim Demirtaş',
      phone: '+90 542 321 54 76',
      email: 'selim.demirtas@pamukovatarim.com',
    },
    documents: [
      { name: 'Tapu Senedi veya Onaylı Kira Sözleşmesi', status: 'Onaylandı', url: '/docs/pamukova-kira.pdf' },
      { name: 'Nüfus Cüzdanı Fotokopisi', status: 'Onaylandı', url: '/docs/pamukova-nufus.pdf' },
      { name: 'Çiftçi Kütüğü Kaydı', status: 'Beklemede', farmerNote: 'Güncel çiftçi kayıt belgesi bekleniyor.' },
      { name: 'Muvafakatname', status: 'Eksik' },
    ],
  },
  {
    farm: 'Bereket Vadisi',
    owner: 'Nisa Güler',
    location: 'Kütahya, Gediz',
    status: 'İlk İnceleme',
    lastUpdate: '5 saat önce',
    notes: 'İlk değerlendirme formu tamamlandı.',
    contact: {
      name: 'Nisa Güler',
      phone: '+90 505 222 44 55',
      email: 'nisa.guler@bereketvadisi.com',
    },
    documents: [
      { name: 'Tapu Senedi veya Onaylı Kira Sözleşmesi', status: 'Beklemede', farmerNote: 'Noter onaylı kira sözleşmesi bekleniyor.' },
      { name: 'Nüfus Cüzdanı Fotokopisi', status: 'Onaylandı', url: '/docs/bereket-nufus.pdf' },
      { name: 'Çiftçi Kütüğü Kaydı', status: 'Beklemede' },
      { name: 'Taahhütname', status: 'Eksik' },
    ],
  },
  {
    farm: 'Güven Çiftliği',
    owner: 'Saim Bulut',
    location: 'Balıkesir, Gönen',
    status: 'Onaylandı',
    lastUpdate: 'Geçen hafta',
    notes: 'Yeni sezon üretim planı onaylandı.',
    contact: {
      name: 'Saim Bulut',
      phone: '+90 532 444 77 88',
      email: 'saim.bulut@guvenciftligi.com',
    },
    documents: [
      { name: 'Tapu Senedi veya Onaylı Kira Sözleşmesi', status: 'Onaylandı', url: '/docs/guven-tapu.pdf' },
      { name: 'Nüfus Cüzdanı Fotokopisi', status: 'Onaylandı', url: '/docs/guven-nufus.pdf' },
      { name: 'Çiftçi Kütüğü Kaydı', status: 'Onaylandı', url: '/docs/guven-ciftci-kutuğü.pdf' },
      { name: 'Muvafakatname', status: 'Onaylandı', url: '/docs/guven-muvafakatname.pdf' },
      { name: 'Taahhütname', status: 'Onaylandı', url: '/docs/guven-taahhutname.pdf' },
      { name: 'Döner Sermaye Ücret Makbuzu', status: 'Onaylandı', url: '/docs/guven-makbuz.pdf' },
    ],
  },
];

