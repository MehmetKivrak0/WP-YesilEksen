import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

import SanayiNavbar from "./components/SanayiNavbar";
import { sanayiService } from "../../../services/sanayiService";
import type { DashboardStats, CompanyApplication } from "../../../services/sanayiService";

const MATERIAL_SYMBOLS_STYLES = `
  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
`;

const MATERIAL_SYMBOLS_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";

const MATERIAL_SYMBOLS_FONT_ID = "material-symbols-font-link";

const STYLE_ELEMENT_ID = "sanayi-dsah-inline-style";

const SanayiIdsahPage = () => {
  const location = useLocation();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApplication[]>([]);
  const [memberCompanies, setMemberCompanies] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Paralel olarak tüm verileri yükle
      const [statsRes, companiesRes, registeredRes, activityRes] = await Promise.all([
        sanayiService.getDashboardStats().catch((err) => {
          console.error('Dashboard stats hatası:', err);
          return { success: false, stats: { productSummary: { pending: 0, approved: 0, revision: 0 }, companySummary: { newApplications: 0, inspections: 0, approved: 0, rejected: 0 }, totalCompanies: 0, totalProducts: 0 } };
        }),
        sanayiService.getCompanyApplications({ limit: 3 }).catch((err) => {
          console.error('Company applications hatası:', err);
          return { success: false, applications: [], pagination: {} };
        }),
        sanayiService.getRegisteredCompanies({ limit: 3 }).catch((err) => {
          console.error('Registered companies hatası:', err);
          return { success: true, companies: [], pagination: {} };
        }),
        sanayiService.getActivityLog({ limit: 5 }).catch((err) => {
          console.error('Activity log hatası:', err);
          return { success: true, activities: [], pagination: {} };
        })
      ]);

      if (statsRes.stats) {
        setDashboardStats(statsRes.stats);
      }
      setPendingCompanies(companiesRes.applications || []);
      
      // API'den gelen firmaları frontend formatına map et
      if (registeredRes.success && registeredRes.companies) {
        const mappedCompanies = registeredRes.companies.map((company: any) => {
          // Status mapping: backend'den gelen durum değerlerini frontend formatına çevir
          let status = 'Beklemede';
          if (company.status === 'aktif' || company.status === 'onaylandi') {
            status = 'Aktif';
          } else if (company.status === 'beklemede') {
            status = 'Beklemede';
          } else {
            status = company.status || 'Beklemede';
          }
          
          return {
            id: company.id, // Şirket ID'sini de ekle (güncelleme için gerekli)
            name: company.companyName || company.name || 'İsimsiz',
            sector: company.sector || 'Sektör Bilgisi Yok', // Backend'den gelen sektör bilgisini kullan
            joinedAt: company.registrationDate 
              ? new Date(company.registrationDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            status: status,
            statusClass: status === 'Aktif' 
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-amber-600 dark:text-amber-300"
          };
        });
        setMemberCompanies(mappedCompanies);
      } else {
        // API'den veri gelmese bile boş array set et
        setMemberCompanies([]);
      }

      // Aktivite loglarını map et
      if (activityRes.success && activityRes.activities && activityRes.activities.length > 0) {
        const mappedActivities = activityRes.activities.map((activity: any) => ({
          id: activity.id || Date.now(),
          action: activity.description || activity.type || 'İşlem',
          company: activity.details?.varlik_id || 'Bilinmeyen Firma',
          user: activity.user || 'Sistem',
          timestamp: activity.timestamp 
            ? new Date(activity.timestamp).toLocaleString('tr-TR')
            : new Date().toLocaleString('tr-TR'),
          type: activity.type === 'onay' ? 'approval' : 
                activity.type === 'red' ? 'rejection' : 
                activity.type === 'guncelleme' ? 'update' : 'delete'
        }));
        setActivityLog(mappedActivities);
      }
    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Şirket Yönetimi - AgriConnect";
    loadDashboardData();

    let fontLink = document.getElementById(
      MATERIAL_SYMBOLS_FONT_ID,
    ) as HTMLLinkElement | null;

    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = MATERIAL_SYMBOLS_FONT_ID;
      fontLink.rel = "stylesheet";
      fontLink.href = MATERIAL_SYMBOLS_FONT_URL;
      document.head.appendChild(fontLink);
    }

    let styleElement = document.getElementById(STYLE_ELEMENT_ID);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ELEMENT_ID;
      styleElement.textContent = MATERIAL_SYMBOLS_STYLES;
      document.head.appendChild(styleElement);
    }

    return () => {
      const activeFontLink = document.getElementById(
        MATERIAL_SYMBOLS_FONT_ID,
      ) as HTMLLinkElement | null;
      if (activeFontLink?.parentElement === document.head) {
        document.head.removeChild(activeFontLink);
      }

      const activeStyleElement = document.getElementById(STYLE_ELEMENT_ID);
      if (activeStyleElement?.parentElement === document.head) {
        document.head.removeChild(activeStyleElement);
      }
    };
  }, []);

  // Sayfa her görüntülendiğinde verileri yenile (şirket güncellemesi sonrası için)
  useEffect(() => {
    // Sadece dashboard sayfasındayken ve location değiştiğinde yenile
    if (location.pathname === '/admin/sanayi') {
      loadDashboardData();
    }
  }, [location.pathname, loadDashboardData]);

  const statusBadgeVariants: Record<string, string> = {
    Beklemede:
      "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900",
    İncelemede:
      "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900",
    "Eksik Evrak":
      "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900",
    Aktif:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900",
  };


  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <SanayiNavbar />
      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8" id="overview">
          {/* Page Header */}
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
              Şirket Yönetimi (Sanayi Odası)
            </h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">
              Sanayi odası üyelerini ve şirket faaliyetlerini yönetin
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Toplam Üye
              </p>
              <p className="text-2xl font-bold text-content-light dark:text-content-dark">
                {loading ? '...' : (dashboardStats?.totalCompanies || memberCompanies.length)}
              </p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Aktif
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {loading ? '...' : (dashboardStats?.companySummary?.approved || memberCompanies.filter((c) => c.status === "Aktif").length)}
              </p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Beklemede
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {loading ? '...' : (dashboardStats?.companySummary?.newApplications ?? 0)}
              </p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Toplam Ürün
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : (dashboardStats?.totalProducts || 0)}
              </p>
            </div>
          </div>

          {/* Firma Onayları and Üye Şirketler - Side by Side */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pending Company Approvals */}
            <div
              id="approvals"
              className="rounded-2xl border border-border-light/80 bg-background-light/80 p-6 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                    Firma Onayları
                  </h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Bekleyen firma başvurularını inceleyin
                  </p>
                </div>
                <Link
                  to="/admin/sanayi/firma-onaylari"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Detaya Git
                  <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                </Link>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Bekleyen
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {loading ? '...' : (dashboardStats?.companySummary?.newApplications || pendingCompanies.filter((c) => c.status === "beklemede" || c.status === "Beklemede").length)}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    İncelemede
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {loading ? '...' : (dashboardStats?.companySummary?.inspections || pendingCompanies.filter((c) => c.status === "incelemede" || c.status === "İncelemede").length)}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Toplam
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {loading ? '...' : ((dashboardStats?.companySummary?.newApplications || 0) + (dashboardStats?.companySummary?.inspections || 0) + (dashboardStats?.companySummary?.approved || 0) || pendingCompanies.length)}
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                  Yükleniyor...
                </div>
              ) : pendingCompanies.length > 0 ? (
                <div className="rounded-lg border border-border-light dark:border-border-dark">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                        <th className="px-4 py-3 text-left">Firma Adı</th>
                        <th className="px-4 py-3 text-left">Sektör</th>
                        <th className="px-4 py-3 text-left">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
                      {pendingCompanies.slice(0, 3).map((row) => (
                        <tr key={row.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
                          <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">{row.name}</td>
                          <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.sector || 'Sektör Yok'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeVariants[row.status] ?? statusBadgeVariants.Aktif}`}
                            >
                              {row.status === 'beklemede' ? 'Beklemede' : 
                               row.status === 'onaylandi' ? 'Onaylandı' : 
                               row.status === 'reddedildi' ? 'Reddedildi' : row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                  Henüz başvuru bulunmamaktadır.
                </div>
              )}
            </div>

            {/* Company List */}
            <div
              id="members"
              className="rounded-2xl border border-border-light/80 bg-background-light/80 p-6 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                   Şirketler  
                  </h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Kayıtlı  şirketleri görüntüleyin
                  </p>
                </div>
                <Link
                  to="/admin/sanayi/uye-sirketler"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Detaya Git
                  <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                </Link>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Aktif
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {loading ? '...' : (dashboardStats?.companySummary?.approved || memberCompanies.filter((c) => c.status === "Aktif").length)}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Beklemede
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {loading ? '...' : (dashboardStats?.companySummary?.newApplications || memberCompanies.filter((c) => c.status === "Beklemede").length)}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Toplam
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {loading ? '...' : (dashboardStats?.totalCompanies || memberCompanies.length)}
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                  Yükleniyor...
                </div>
              ) : memberCompanies.length > 0 ? (
                <div className="rounded-lg border border-border-light dark:border-border-dark">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                        <th className="px-4 py-3 text-left">Şirket Adı</th>
                        <th className="px-4 py-3 text-left">Sektör</th>
                        <th className="px-4 py-3 text-left">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
                      {memberCompanies.slice(0, 3).map((row) => (
                        <tr key={row.name} className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10">
                          <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">{row.name}</td>
                          <td className="px-4 py-3 text-subtle-light dark:text-subtle-dark">{row.sector}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeVariants[row.status] ?? statusBadgeVariants.Aktif}`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                  Henüz kayıtlı firma bulunmamaktadır.
                </div>
              )}
            </div>
          </div>

          {/* Activity Log / Geçmiş İşlemler */}
          <div className="mb-8 rounded-2xl border border-border-light/80 bg-background-light/80 p-6 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                Geçmiş İşlemler
              </h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Son gerçekleştirilen işlemlerin kaydı
              </p>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                  Yükleniyor...
                </div>
              ) : activityLog.length > 0 ? (
                activityLog.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-xl border border-border-light/70 bg-background-light/70 p-4 transition-colors hover:bg-primary/5 dark:border-border-dark/60 dark:bg-background-dark/70 dark:hover:bg-primary/10"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.type === "approval"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : activity.type === "rejection"
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300"
                        : activity.type === "update"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {activity.type === "approval"
                        ? "check_circle"
                        : activity.type === "rejection"
                        ? "cancel"
                        : activity.type === "update"
                        ? "edit"
                        : "delete"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-content-light dark:text-content-dark">
                          {activity.action}
                        </p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">
                          {activity.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">
                          {activity.timestamp}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">
                          {activity.user}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="py-8 text-center text-subtle-light dark:text-subtle-dark">
                  Henüz aktivite logu bulunmamaktadır.
                </div>
              )}
            </div>
          </div>

          {/* Reports Section */}
          <div
            id="reports"
            className="mt-8 rounded-2xl border border-border-light/80 bg-background-light/80 p-6 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">
                Raporlar ve Analitik
              </h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Detaylı rapor ve analitik ekranlarına erişin
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                to="/admin/sanayi/raporlar/genel"
                className="group rounded-xl border border-[#E8F5E9] bg-[#E8F5E9] p-6 transition-all hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 hover:shadow-md dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:hover:border-[#2E7D32] dark:hover:bg-[#2E7D32]/20"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20">
                    <span className="material-symbols-outlined text-2xl text-[#2E7D32] dark:text-[#4CAF50]">bar_chart</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2E7D32] dark:text-[#4CAF50]">
                      Genel Raporlar
                    </h3>
                    <p className="text-sm text-[#424242] dark:text-[#E0E0E0]">
                      Kapsamlı istatistikler ve analizler
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                  Raporu Görüntüle
                  <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </Link>

              <Link
                to="/admin/sanayi/raporlar/sdg"
                className="group rounded-xl border border-[#E8F5E9] bg-[#E8F5E9] p-6 transition-all hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 hover:shadow-md dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:hover:border-[#2E7D32] dark:hover:bg-[#2E7D32]/20"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20">
                    <span className="material-symbols-outlined text-2xl text-[#2E7D32] dark:text-[#4CAF50]">
                      eco
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2E7D32] dark:text-[#4CAF50]">
                      SDG Raporu
                    </h3>
                    <p className="text-sm text-[#424242] dark:text-[#E0E0E0]">
                      Sürdürülebilir kalkınma hedefleri analizi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                  Raporu Görüntüle
                  <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SanayiIdsahPage;

