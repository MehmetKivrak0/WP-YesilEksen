import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ZrtnNavbar from '../../../../components/zrtnavbar';
import SummaryCards from './components/SummaryCards';
import ActivityFeed from './components/ActivityFeed';
import RegisteredFarmersTable from './components/RegisteredFarmersTable';
import ProductsTable from './components/ProductsTable';
import ApplicationDetailModal from './components/ApplicationDetailModal';
import FarmerDetailModal from './components/FarmerDetailModal';
import { useDashboardFilters } from './hooks/useDashboardFilters';
import { ziraatService } from '../../../../services/ziraatService';
import type { DashboardStats, ProductApplication, FarmApplication } from '../../../../services/ziraatService';

function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [productApplications, setProductApplications] = useState<ProductApplication[]>([]);
  const [farmApplications, setFarmApplications] = useState<FarmApplication[]>([]);
  const [registeredFarmersData, setRegisteredFarmersData] = useState<any[]>([]);
  const [dashboardProductsData, setDashboardProductsData] = useState<any[]>([]);
  const [activityLogData, setActivityLogData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [bildirimler, setBildirimler] = useState<any[]>([]);
  const {
    activityFilter,
    setActivityFilter,
    farmerSearch,
    setFarmerSearch,
    productSearch,
    setProductSearch,
    farmerPage,
    totalFarmerPages,
    filteredFarmers,
    paginatedFarmers,
    farmerRange,
    filteredProducts,
    goToPreviousFarmerPage,
    goToNextFarmerPage,
    setFarmerPage,
  } = useDashboardFilters({
    farmers: registeredFarmersData,
    products: dashboardProductsData,
  });

  // API'den veri yükleme
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Paralel olarak tüm verileri yükle - her isteği ayrı ayrı yakala
      const [statsRes, productsRes, farmsRes, farmersRes, dashboardProductsRes, activityRes] = await Promise.all([
        ziraatService.getDashboardStats().catch((err) => {
          console.error('Dashboard stats hatası:', err);
          return { success: false, stats: { productSummary: { pending: 0, approved: 0, revision: 0 }, farmSummary: { newApplications: 0, inspections: 0, missingDocuments: 0, rejected: 0, totalApplications: 0, approved: 0 }, totalFarmers: 0, totalProducts: 0 } };
        }),
        ziraatService.getProductApplications({ limit: 3 }).catch((err) => {
          console.error('Product applications hatası:', err);
          return { success: false, applications: [], pagination: {} };
        }),
        ziraatService.getFarmApplications({ limit: 3 }).catch((err) => {
          console.error('Farm applications hatası:', err);
          return { success: false, applications: [], pagination: {} };
        }),
        ziraatService.getRegisteredFarmers().catch((err) => {
          console.error('Registered farmers hatası:', err);
          return { success: true, farmers: [], pagination: {} };
        }),
        ziraatService.getDashboardProducts().catch((err) => {
          console.error('Dashboard products hatası:', err);
          return { success: true, products: [] };
        }),
        ziraatService.getActivityLog().catch((err) => {
          console.error('Activity log hatası:', err);
          return { success: true, activities: [], pagination: {} };
        })
      ]);

      if (statsRes.stats) {
        setDashboardStats(statsRes.stats);
      }
      setProductApplications(productsRes.applications || []);
      setFarmApplications(farmsRes.applications || []);
      
      // API'den gelen çiftçileri frontend formatına map et
      if (farmersRes.success && farmersRes.farmers && farmersRes.farmers.length > 0) {
        const mappedFarmers = farmersRes.farmers.map((farmer: any) => ({
          id: farmer.id,
          name: farmer.name || 'İsimsiz',
          farm: farmer.farmName || farmer.farm || 'Çiftlik adı yok',
          registrationDate: farmer.registrationDate 
            ? new Date(farmer.registrationDate).toLocaleDateString('tr-TR')
            : 'Tarih yok',
          status: farmer.status === 'aktif' ? 'Aktif' : 'Beklemede',
          detailPath: `/admin/ziraat/ciftci/${farmer.id}`
        }));
        setRegisteredFarmersData(mappedFarmers);
      } else {
        setRegisteredFarmersData([]);
      }
      
      // API'den gelen ürünleri frontend formatına map et
      if (dashboardProductsRes.success && dashboardProductsRes.products && dashboardProductsRes.products.length > 0) {
        const mappedProducts = dashboardProductsRes.products.map((product: any) => ({
          id: product.id,
          name: product.name || 'Ürün adı yok',
          producer: product.farmer || 'Üretici yok',
          status: product.status === 'stokta' ? 'Stokta' : 
                 product.status === 'aktif' ? 'Stokta' : 
                 product.status === 'incelemede' ? 'İncelemede' : 'Tükendi',
          lastUpdate: new Date().toLocaleDateString('tr-TR') // API'de lastUpdate yok, şimdilik bugünün tarihi
        }));
        setDashboardProductsData(mappedProducts);
      } else {
        setDashboardProductsData([]);
      }

      // API'den gelen aktiviteleri frontend formatına map et
      if (activityRes.success && activityRes.activities && activityRes.activities.length > 0) {
        const mappedActivities = activityRes.activities.map((activity: any) => ({
          id: activity.id,
          title: activity.description || activity.baslik || 'Aktivite',
          description: activity.details?.aciklama || activity.user || 'Detay yok',
          timestamp: activity.timestamp 
            ? new Date(activity.timestamp).toLocaleString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'Tarih yok',
          type: activity.type || 'kayit'
        }));
        setActivityLogData(mappedActivities);
      } else {
        setActivityLogData([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Veriler yüklenemedi');
      console.error('Dashboard veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // API'den gelen aktiviteleri kullan
  const filteredActivities =
    activityFilter === 'hepsi'
      ? activityLogData
      : activityLogData.filter((activity) => activity.type === activityFilter);

  const getStatusClass = (status: string) => {
    if (status === 'beklemede' || status === 'incelemede' || status === 'İncelemede' || status === 'ilk_inceleme' || status === 'İlk İnceleme') {
      return 'inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    if (status === 'onaylandi' || status === 'Onaylandı') {
      return 'inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    return 'inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-200';
  };

  const formatStatus = (status: string) => {
    if (status === 'beklemede' || status === 'incelemede') return 'İncelemede';
    if (status === 'onaylandi') return 'Onaylandı';
    if (status === 'revizyon') return 'Revizyon';
    if (status === 'ilk_inceleme') return 'İlk İnceleme';
    if (status === 'reddedildi') return 'Reddedildi';
    return status;
  };

  const productApprovalStats = [
    { label: 'Bekleyen', value: dashboardStats?.productSummary?.pending ?? 0 },
    { label: 'Onaylanan', value: dashboardStats?.productSummary?.approved ?? 0 },
    { label: 'Reddedilen', value: dashboardStats?.productSummary?.revision ?? 0 },
  ];

  const farmApprovalStats = [
    { label: 'Yeni Başvuru', value: dashboardStats?.farmSummary?.newApplications ?? 0 },
    { label: 'Onaylanan Çiftlik', value: dashboardStats?.farmSummary?.approved ?? 0 },
    { label: 'Eksik Belge', value: dashboardStats?.farmSummary?.missingDocuments ?? 0 },
  ];

  const handleProductRowClick = (row: any) => {
    setSelectedProduct(row);
    setIsProductModalOpen(true);
  };

  const handleFarmRowClick = (row: any) => {
    setSelectedFarm(row);
    setIsFarmModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      if (selectedProduct) {
        await ziraatService.approveProduct(selectedProduct.id);
        alert('Ürün başvurusu onaylandı');
      } else if (selectedFarm) {
        await ziraatService.approveFarm(selectedFarm.id);
        alert('Çiftlik başvurusu onaylandı');
      }
      
      // Verileri yeniden yükle
      await loadDashboardData();
      
      setIsProductModalOpen(false);
      setIsFarmModalOpen(false);
      setSelectedProduct(null);
      setSelectedFarm(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Onaylama başarısız');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      if (selectedProduct) {
        await ziraatService.rejectProduct(selectedProduct.id, { reason });
        alert('Ürün başvurusu reddedildi');
      } else if (selectedFarm) {
        await ziraatService.rejectFarm(selectedFarm.id, { reason });
        alert('Çiftlik başvurusu reddedildi');
      }
      
      // Verileri yeniden yükle
      await loadDashboardData();
      
      setIsProductModalOpen(false);
      setIsFarmModalOpen(false);
      setSelectedProduct(null);
      setSelectedFarm(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Reddetme başarısız');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <ZrtnNavbar />

      <main className="flex-grow">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <header id="overview" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
                Ziraat Odası Admin Dashboard
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Çiftçileri ve çiftlik faaliyetlerini yönetin
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="relative"
                onMouseEnter={() => setIsNotificationMenuOpen(true)}
                onMouseLeave={() => setIsNotificationMenuOpen(false)}
              >
                <button 
                  className="p-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors relative"
                  type="button"
                  onClick={() => setIsNotificationMenuOpen((prev) => !prev)}
                >
                  <span className="material-symbols-outlined text-content-light dark:text-content-dark">notifications</span>
                  {bildirimler.filter(b => !b.okundu).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </button>
                {isNotificationMenuOpen && (
                  <div 
                    className="absolute right-0 top-full pt-1 z-[100] w-80"
                    onMouseEnter={() => setIsNotificationMenuOpen(true)}
                    onMouseLeave={() => setIsNotificationMenuOpen(false)}
                  >
                    <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg pointer-events-auto max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark sticky top-0 bg-background-light dark:bg-background-dark">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-content-light dark:text-content-dark">Bildirimler</h3>
                          {bildirimler.filter(b => !b.okundu).length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 dark:bg-primary/30 text-primary text-xs font-medium">
                              {bildirimler.filter(b => !b.okundu).length} yeni
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="py-2">
                        {bildirimler.length > 0 ? (
                          bildirimler.map((bildirim) => (
                            <div
                              key={bildirim.id}
                              className={`px-4 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-b border-border-light/50 dark:border-border-dark/50 ${
                                !bildirim.okundu ? 'bg-primary/5 dark:bg-primary/10' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !bildirim.okundu ? 'bg-primary' : 'bg-transparent'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-content-light dark:text-content-dark mb-0.5">
                                    {bildirim.baslik}
                                  </p>
                                  <p className="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2">
                                    {bildirim.mesaj}
                                  </p>
                                  <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                    {bildirim.tarih}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBildirimler(prev => prev.filter(b => b.id !== bildirim.id));
                                  }}
                                  className="p-1 hover:bg-primary/10 dark:hover:bg-primary/20 rounded transition-colors flex-shrink-0"
                                  type="button"
                                  title="Sil"
                                >
                                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">close</span>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-4xl mb-2 block">notifications_none</span>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">Bildirim yok</p>
                          </div>
                        )}
                      </div>
                      {bildirimler.length > 0 && (
                        <div className="px-4 py-3 border-t border-border-light dark:border-border-dark">
                          <button
                            onClick={() => {
                              setBildirimler([]);
                              setIsNotificationMenuOpen(false);
                            }}
                            className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
                            type="button"
                          >
                            Tümünü Temizle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-2xl">Yükleniyor...</div>
                <div className="text-subtle-light dark:text-subtle-dark">Dashboard verileri yükleniyor</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-2xl text-red-600">Hata</div>
                <div className="text-subtle-light dark:text-subtle-dark">{error}</div>
                <button 
                  onClick={loadDashboardData}
                  className="mt-4 rounded bg-primary px-4 py-2 text-white"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : (
            <>
              <SummaryCards 
                productSummary={dashboardStats?.productSummary || { pending: 0, approved: 0, revision: 0 }} 
                farmSummary={
                  dashboardStats?.farmSummary
                    ? {
                        ...dashboardStats.farmSummary,
                        totalApplications: dashboardStats.farmSummary.totalApplications ?? 0,
                      }
                    : {
                        newApplications: 0,
                        inspections: 0,
                        missingDocuments: 0,
                        rejected: 0,
                        totalApplications: 0,
                        approved: 0,
                      }
                } 
              />

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div id="product-approvals" className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Ürün Onayları</h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Bekleyen ürün başvurularını takip edin
                  </p>
                </div>
                <Link
                  to="/admin/ziraat/urun-onay"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Detaya Git
                  <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                </Link>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {productApprovalStats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                    <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      {item.label}
                    </p>
                    <p className="text-2xl font-semibold text-content-light dark:text-content-dark">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border-light dark:border-border-dark">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      <th className="px-4 py-3 text-left">Ürün</th>
                      <th className="px-4 py-3 text-left">Başvuru Sahibi</th>
                      <th className="px-4 py-3 text-left">Durum</th>
                      <th className="px-4 py-3 text-left">Son Güncelleme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
                    {productApplications.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleProductRowClick({
                          ...row,
                          status: formatStatus(row.status),
                          lastUpdate: new Date(row.lastUpdate).toLocaleDateString('tr-TR'),
                        })}
                        className="cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
                      >
                        <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">{row.name}</td>
                        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.applicant}</td>
                        <td className="px-4 py-3">
                          <span className={getStatusClass(row.status)}>{formatStatus(row.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{new Date(row.lastUpdate).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="farm-approvals" className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Çiftlik Onayları</h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Yeni çiftlik kayıt taleplerini yönetin
                  </p>
                </div>
                <Link
                  to="/admin/ziraat/ciftlik-onay"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Detaya Git
                  <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                </Link>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {farmApprovalStats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                    <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      {item.label}
                    </p>
                    <p className="text-2xl font-semibold text-content-light dark:text-content-dark">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border-light dark:border-border-dark">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      <th className="px-4 py-3 text-left">Çiftlik</th>
                      <th className="px-4 py-3 text-left">Sahip</th>
                      <th className="px-4 py-3 text-left">Durum</th>
                      <th className="px-4 py-3 text-left">Son Güncelleme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
                    {farmApplications.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
                      >
                        <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">{row.name}</td>
                        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.owner}</td>
                        <td className="px-4 py-3">
                          <span className={getStatusClass(row.status)}>{formatStatus(row.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.lastUpdate ? new Date(row.lastUpdate).toLocaleDateString('tr-TR') : 'Bekleniyor'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <ActivityFeed
            activities={filteredActivities}
            activeFilter={activityFilter}
            onFilterChange={setActivityFilter}
          />

          <section id="farm-management" className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RegisteredFarmersTable
              farmers={paginatedFarmers}
              filteredTotal={filteredFarmers.length}
              rangeStart={farmerRange.start}
              rangeEnd={farmerRange.end}
              currentPage={farmerPage}
              totalPages={totalFarmerPages}
              search={farmerSearch}
              onSearchChange={setFarmerSearch}
              onPageChange={setFarmerPage}
              onPreviousPage={goToPreviousFarmerPage}
              onNextPage={goToNextFarmerPage}
              onInspect={(farmerId) => {
                setSelectedFarmerId(farmerId);
                setIsFarmerModalOpen(true);
              }}
            />
            <ProductsTable
              products={filteredProducts}
              search={productSearch}
              onSearchChange={setProductSearch}
            />
          </section>

          <section id="reports" className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Raporlar</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Detaylı analiz ve raporlara erişin
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                to="/admin/ziraat/raporlar/genel"
                className="group flex items-center gap-4 rounded-lg border border-border-light bg-background-light p-6 transition-all hover:border-primary hover:bg-primary/5 dark:border-border-dark dark:bg-background-dark dark:hover:bg-primary/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">
                    assessment
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-content-light dark:text-content-dark">
                    Genel Rapor
                  </h3>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Başvurular, onaylar, trendler ve kapsamlı istatistikler
                  </p>
                </div>
                <span className="material-symbols-outlined text-content-light transition-transform group-hover:translate-x-1 dark:text-content-dark">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/admin/ziraat/raporlar/sdg"
                className="group flex items-center gap-4 rounded-lg border border-border-light bg-background-light p-6 transition-all hover:border-primary hover:bg-primary/5 dark:border-border-dark dark:bg-background-dark dark:hover:bg-primary/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">
                    eco
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-content-light dark:text-content-dark">
                    SDG Raporu
                  </h3>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Sürdürülebilir kalkınma hedeflerine katkı analizi
                  </p>
                </div>
                <span className="material-symbols-outlined text-content-light transition-transform group-hover:translate-x-1 dark:text-content-dark">
                  chevron_right
                </span>
              </Link>
            </div>
          </section>
            </>
          )}
        </div>
      </main>

      {/* Product Application Detail Modal */}
      {selectedProduct && (
        <ApplicationDetailModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          application={{
            name: selectedProduct.name,
            applicationNumber: selectedProduct.applicationNumber,
            applicant: selectedProduct.applicant,
            sector: selectedProduct.sector,
            establishmentYear: selectedProduct.establishmentYear,
            employeeCount: selectedProduct.employeeCount,
            email: selectedProduct.email,
            applicationDate: selectedProduct.applicationDate,
            lastUpdate: selectedProduct.lastUpdate,
            taxNumber: selectedProduct.taxNumber,
            description: selectedProduct.description,
            status: selectedProduct.status,
            documents: selectedProduct.documents,
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Farm Application Detail Modal */}
      {selectedFarm && (
        <ApplicationDetailModal
          isOpen={isFarmModalOpen}
          onClose={() => setIsFarmModalOpen(false)}
          application={{
            name: selectedFarm.name,
            applicationNumber: selectedFarm.applicationNumber,
            applicant: selectedFarm.owner,
            sector: selectedFarm.sector,
            establishmentYear: selectedFarm.establishmentYear,
            employeeCount: selectedFarm.employeeCount,
            email: selectedFarm.email,
            applicationDate: selectedFarm.applicationDate,
            lastUpdate: selectedFarm.inspectionDate,
            taxNumber: selectedFarm.taxNumber,
            description: selectedFarm.description,
            status: selectedFarm.status,
            documents: selectedFarm.documents,
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Farmer Detail Modal */}
      <FarmerDetailModal
        isOpen={isFarmerModalOpen}
        farmerId={selectedFarmerId}
        onClose={() => {
          setIsFarmerModalOpen(false);
          setSelectedFarmerId(null);
        }}
      />
    </div>
  );
}

export default DashboardPage;

