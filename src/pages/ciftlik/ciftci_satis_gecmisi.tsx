import { useState, useEffect } from 'react';
import CftNavbar from '../../components/cftnavbar';
import { ciftciService } from '../../services/ciftciService';
import { useToast } from '../../context/ToastContext';

interface Satis {
  id: string;
  urun: string;
  miktar: string;
  fiyat: string;
  birimFiyat: string;
  tarih: string;
  durum: string;
  durumClass: string;
  alici: string;
  siparisNo: string;
}

function CiftciSatisGecmisi() {
  const toast = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'tumu' | 'tamamlandi' | 'kargoda' | 'hazirlaniyor'>('tumu');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [satislar, setSatislar] = useState<Satis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    toplamSatis: 0,
    tamamlanan: 0,
    toplamGelir: 0
  });

  // Satışları API'den yükle
  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await ciftciService.getSalesHistory({
        page: currentPage,
        limit: 50,
        durum: selectedFilter,
        search: searchTerm || undefined
      });

      if (response.success) {
        setSatislar(response.sales);
        setTotalPages(response.pagination.totalPages);
        setStats(response.stats);
      } else {
        toast.error('Satış geçmişi yüklenemedi');
        setSatislar([]);
      }
    } catch (error: any) {
      console.error('Satış geçmişi yükleme hatası:', error);
      toast.error(error.response?.data?.message || 'Satış geçmişi yüklenirken bir hata oluştu');
      setSatislar([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [currentPage, selectedFilter, searchTerm]);

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm]);


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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <p className="text-2xl font-bold text-content-light dark:text-content-dark">{stats.toplamSatis}</p>
              </div>
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Toplam Gelir</p>
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">payments</span>
                </div>
                <p className="text-2xl font-bold text-content-light dark:text-content-dark">{stats.toplamGelir.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
              </div>
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Tamamlanan</p>
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">check_circle</span>
                </div>
                <p className="text-2xl font-bold text-content-light dark:text-content-dark">
                  {stats.tamamlanan}
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
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Yükleniyor...</p>
                        </div>
                      </td>
                    </tr>
                  ) : satislar.length > 0 ? (
                    satislar.map((satis) => (
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

          {/* Sayfalama */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mt-8">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CiftciSatisGecmisi;

