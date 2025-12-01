import { useEffect } from "react";
import { Link } from "react-router-dom";

import SanayiNavbar from "./components/SanayiNavbar";

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
  useEffect(() => {
    document.title = "Şirket Yönetimi - AgriConnect";

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

  const pendingCompanies = [
    {
      id: "P-1024",
      name: "Eko Enerji A.Ş.",
      sector: "Yenilenebilir Enerji",
      submittedAt: "2024-01-18",
      contact: "info@ekoenerji.com",
      status: "Beklemede",
      statusClass: "text-amber-600 dark:text-amber-300",
    },
    {
      id: "P-1025",
      name: "Anadolu Kimya Ltd.",
      sector: "Kimya",
      submittedAt: "2024-01-16",
      contact: "iletisim@anadolukimya.com",
      status: "İncelemede",
      statusClass: "text-blue-600 dark:text-blue-300",
    },
    {
      id: "P-1026",
      name: "BioTarımsal Çözümler",
      sector: "Biyoteknoloji",
      submittedAt: "2024-01-14",
      contact: "destek@biotarim.com",
      status: "Eksik Evrak",
      statusClass: "text-rose-600 dark:text-rose-300",
    },
  ];

  const memberCompanies = [
    {
      name: "Teknoloji A.Ş.",
      sector: "Bilgi Teknolojileri",
      joinedAt: "2024-01-15",
      status: "Aktif",
      statusClass: "text-emerald-600 dark:text-emerald-300",
    },
    {
      name: "Gıda Sanayi Ltd.",
      sector: "Gıda İşleme",
      joinedAt: "2024-01-10",
      status: "Beklemede",
      statusClass: "text-amber-600 dark:text-amber-300",
    },
    {
      name: "Tarım Teknolojileri A.Ş.",
      sector: "Tarım Teknolojisi",
      joinedAt: "2024-01-05",
      status: "Aktif",
      statusClass: "text-emerald-600 dark:text-emerald-300",
    },
  ];

  const activityLog = [
    {
      id: 1,
      action: "Firma Onaylandı",
      company: "Eko Enerji A.Ş.",
      user: "Ahmet Yılmaz",
      timestamp: "2024-01-18 14:30",
      type: "approval",
    },
    {
      id: 2,
      action: "Firma Reddedildi",
      company: "BioTarımsal Çözümler",
      user: "Mehmet Demir",
      timestamp: "2024-01-17 10:15",
      type: "rejection",
    },
    {
      id: 3,
      action: "Üye Şirket Güncellendi",
      company: "Teknoloji A.Ş.",
      user: "Ayşe Kaya",
      timestamp: "2024-01-16 16:45",
      type: "update",
    },
    {
      id: 4,
      action: "Firma Onaylandı",
      company: "Anadolu Kimya Ltd.",
      user: "Ahmet Yılmaz",
      timestamp: "2024-01-15 09:20",
      type: "approval",
    },
    {
      id: 5,
      action: "Üye Şirket Silindi",
      company: "Eski Firma A.Ş.",
      user: "Mehmet Demir",
      timestamp: "2024-01-14 11:30",
      type: "delete",
    },
  ];

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
                {memberCompanies.length}
              </p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Aktif
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {memberCompanies.filter((c) => c.status === "Aktif").length}
              </p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Beklemede
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {memberCompanies.filter((c) => c.status === "Beklemede").length + pendingCompanies.filter((c) => c.status === "Beklemede").length}
              </p>
            </div>

            <div className="rounded-lg border border-border-light bg-background-light p-4 text-center dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm font-medium text-[#2E7D32] dark:text-[#4CAF50]">
                Bu Ay Eklenen
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {memberCompanies.filter((c) => new Date(c.joinedAt) >= new Date("2024-01-01")).length}
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
                    {pendingCompanies.filter((c) => c.status === "Beklemede").length}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    İncelemede
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {pendingCompanies.filter((c) => c.status === "İncelemede").length}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Toplam
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {pendingCompanies.length}
                  </p>
                </div>
              </div>
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
                    {memberCompanies.filter((c) => c.status === "Aktif").length}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Beklemede
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {memberCompanies.filter((c) => c.status === "Beklemede").length}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light p-4 dark:border-border-dark">
                  <p className="mb-1 text-xs uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                    Toplam
                  </p>
                  <p className="text-2xl font-semibold text-content-light dark:text-content-dark">
                    {memberCompanies.length}
                  </p>
                </div>
              </div>
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
              {activityLog.map((activity) => (
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
              ))}
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

