import { useState } from 'react';
import CftNavbar from '../../components/cftnavbar';

function CiftciSatisGecmisi() {
  const [selectedFilter, setSelectedFilter] = useState<'tumu' | 'tamamlandi' | 'kargoda' | 'hazirlaniyor'>('tumu');

  // Örnek veriler - gerçek uygulamada API'den gelecek
  const satislar = [
    {
      id: 1,
      urun: 'Mısır Sapı',
      miktar: '10 Ton',
      fiyat: '2.800 ₺',
      birimFiyat: '280 ₺ / ton',
      tarih: '2024-01-15',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alici: 'BioEnerji A.Ş.',
      siparisNo: 'SP-2024-001',
    },
    {
      id: 2,
      urun: 'Buğday Samanı',
      miktar: '20 Ton',
      fiyat: '6.400 ₺',
      birimFiyat: '320 ₺ / ton',
      tarih: '2024-01-12',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alici: 'Organik Gübre Sanayi',
      siparisNo: 'SP-2024-002',
    },
    {
      id: 3,
      urun: 'Ayçiçeği Sapı',
      miktar: '5 Ton',
      fiyat: '1.900 ₺',
      birimFiyat: '380 ₺ / ton',
      tarih: '2024-01-10',
      durum: 'Kargoda',
      durumClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      alici: 'Yeşil Yakıtlar Ltd.',
      siparisNo: 'SP-2024-003',
    },
    {
      id: 4,
      urun: 'Organik Kompost',
      miktar: '8 Ton',
      fiyat: '4.400 ₺',
      birimFiyat: '550 ₺ / ton',
      tarih: '2024-01-08',
      durum: 'Hazırlanıyor',
      durumClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      alici: 'Doğa Tarım Ürünleri',
      siparisNo: 'SP-2024-004',
    },
    {
      id: 5,
      urun: 'Hayvansal Gübre',
      miktar: '15 Ton',
      fiyat: '6.750 ₺',
      birimFiyat: '450 ₺ / ton',
      tarih: '2024-01-05',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alici: 'BioEnerji A.Ş.',
      siparisNo: 'SP-2024-005',
    },
    {
      id: 6,
      urun: 'Pamuk Atığı',
      miktar: '12 Ton',
      fiyat: '5.040 ₺',
      birimFiyat: '420 ₺ / ton',
      tarih: '2024-01-03',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alici: 'Sönmez Tekstil',
      siparisNo: 'SP-2024-006',
    },
    {
      id: 7,
      urun: 'Zeytin Karasuyu',
      miktar: '5 m³',
      fiyat: '3.400 ₺',
      birimFiyat: '680 ₺ / m³',
      tarih: '2024-01-01',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alici: 'Organik Gübre Sanayi',
      siparisNo: 'SP-2024-007',
    },
    {
      id: 8,
      urun: 'Mısır Sapı',
      miktar: '25 Ton',
      fiyat: '7.000 ₺',
      birimFiyat: '280 ₺ / ton',
      tarih: '2023-12-28',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alici: 'BioEnerji A.Ş.',
      siparisNo: 'SP-2023-045',
    },
  ];

  const filtrelenmisSatislar = satislar.filter((satis) => {
    if (selectedFilter === 'tumu') return true;
    if (selectedFilter === 'tamamlandi') return satis.durum === 'Tamamlandı';
    if (selectedFilter === 'kargoda') return satis.durum === 'Kargoda';
    if (selectedFilter === 'hazirlaniyor') return satis.durum === 'Hazırlanıyor';
    return true;
  });

  const toplamGelir = filtrelenmisSatislar
    .filter((s) => s.durum === 'Tamamlandı')
    .reduce((toplam, satis) => {
      const fiyat = parseFloat(satis.fiyat.replace(/[^\d,]/g, '').replace(',', '.'));
      return toplam + fiyat;
    }, 0);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark min-h-screen flex flex-col">
      <CftNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Başlık ve Filtreler */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">
                  Satış Geçmişi
                </h1>
                <p className="text-lg text-subtle-light dark:text-subtle-dark">
                  Tüm satış işlemlerinizi görüntüleyin ve takip edin
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
                  <input
                    className="w-full min-w-0 sm:min-w-[300px] pl-10 pr-4 py-2.5 rounded-xl bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark"
                    placeholder="Ürün veya alıcı ara"
                    type="search"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as any)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all text-content-light dark:text-content-dark text-sm font-medium"
                  >
                    <option value="tumu">Tümü</option>
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="kargoda">Kargoda</option>
                    <option value="hazirlaniyor">Hazırlanıyor</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark pointer-events-none text-sm">expand_more</span>
                </div>
              </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Toplam Satış</p>
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">sell</span>
                </div>
                <p className="text-2xl font-bold text-content-light dark:text-content-dark">{filtrelenmisSatislar.length}</p>
              </div>
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Toplam Gelir</p>
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">payments</span>
                </div>
                <p className="text-2xl font-bold text-content-light dark:text-content-dark">{toplamGelir.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
              </div>
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Tamamlanan</p>
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">check_circle</span>
                </div>
                <p className="text-2xl font-bold text-content-light dark:text-content-dark">
                  {filtrelenmisSatislar.filter((s) => s.durum === 'Tamamlandı').length}
                </p>
              </div>
            </div>
          </div>

          {/* Satış Tablosu */}
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-background-light dark:bg-black/20 border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Sipariş No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Ürün Adı</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Miktar</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Birim Fiyat</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Toplam Fiyat</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Alıcı Firma</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Satış Tarihi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {filtrelenmisSatislar.length > 0 ? (
                    filtrelenmisSatislar.map((satis) => (
                      <tr
                        key={satis.id}
                        className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-content-light dark:text-content-dark">
                          {satis.siparisNo}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-content-light dark:text-content-dark">
                          {satis.urun}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                          {satis.miktar}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                          {satis.birimFiyat}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-content-light dark:text-content-dark">
                          {satis.fiyat}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                          {satis.alici}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                          {satis.tarih}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${satis.durumClass}`}>
                            {satis.durum}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark">inventory_2</span>
                          <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Satış bulunamadı</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CiftciSatisGecmisi;

