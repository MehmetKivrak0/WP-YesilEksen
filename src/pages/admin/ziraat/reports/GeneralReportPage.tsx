import { useState } from 'react';
import { Link } from 'react-router-dom';
import ZrtnNavbar from '../../../../components/zrtnavbar';
import {
  TrendLineChart,
  CategoryBarChart,
  StatusPieChart,
  ApprovalRateAreaChart,
} from './components/Charts';

function GeneralReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  const reportStats = {
    totalApplications: 1247,
    approvedApplications: 892,
    pendingApplications: 203,
    rejectedApplications: 152,
    averageProcessingTime: '4.2 gün',
    riskScore: 6.8,
  };

  const statusDistribution = [
    { label: 'Onaylanan', value: 892, percentage: 71.5, color: 'bg-green-500' },
    { label: 'Bekleyen', value: 203, percentage: 16.3, color: 'bg-yellow-500' },
    { label: 'Reddedilen', value: 152, percentage: 12.2, color: 'bg-red-500' },
  ];

  const trendData = [
    { month: 'Ocak', applications: 98, approved: 72, rejected: 12 },
    { month: 'Şubat', applications: 112, approved: 85, rejected: 15 },
    { month: 'Mart', applications: 134, approved: 98, rejected: 18 },
    { month: 'Nisan', applications: 145, approved: 108, rejected: 22 },
    { month: 'Mayıs', applications: 156, approved: 118, rejected: 25 },
    { month: 'Haziran', applications: 178, approved: 135, rejected: 28 },
  ];

  const categoryStats = [
    { category: 'Organik Tarım', applications: 456, approved: 342, pending: 78, rejected: 36 },
    { category: 'Hayvancılık', applications: 312, approved: 234, pending: 52, rejected: 26 },
    { category: 'Tarımsal Ürünler', applications: 289, approved: 218, pending: 41, rejected: 30 },
    { category: 'Atık Yönetimi', applications: 190, approved: 98, pending: 32, rejected: 60 },
  ];

  const highRiskFarms = [
    { name: 'Lale Bahçesi', owner: 'Hilal Karaca', riskScore: 8.5, issues: ['Eksik belgeler', 'İnceleme gecikmesi'] },
    { name: 'Pamukova Tarım', owner: 'Selim Demirtaş', riskScore: 7.8, issues: ['Eksik evraklar'] },
    { name: 'Yeşil Vadi', owner: 'Ayşe Yılmaz', riskScore: 7.2, issues: ['Son güncelleme gecikmesi'] },
  ];

  const delayedApprovals = [
    { applicationNumber: 'C-2001', applicant: 'Lale Bahçesi', daysDelayed: 12, status: 'İncelemede' },
    { applicationNumber: 'P-1024', applicant: 'Anadolu Tarım', daysDelayed: 8, status: 'İncelemede' },
    { applicationNumber: 'C-2003', applicant: 'Pamukova Tarım', daysDelayed: 15, status: 'Evrak Bekliyor' },
  ];

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    // Export işlemi burada yapılacak
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <ZrtnNavbar />

      <main className="flex-grow">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
                Genel Raporlar
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Ziraat odası faaliyetlerinin kapsamlı analizi ve istatistikleri
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 pr-10 text-sm font-medium text-[#2E7D32] shadow-sm transition-all hover:border-[#2E7D32] focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50]"
                >
                  <option value="week">Son Hafta</option>
                  <option value="month">Son Ay</option>
                  <option value="quarter">Son Çeyrek</option>
                  <option value="year">Son Yıl</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-base text-[#2E7D32] dark:text-[#4CAF50]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 pr-10 text-sm font-medium text-[#2E7D32] shadow-sm transition-all hover:border-[#2E7D32] focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50]"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="organic">Organik Tarım</option>
                  <option value="livestock">Hayvancılık</option>
                  <option value="products">Tarımsal Ürünler</option>
                  <option value="waste">Atık Yönetimi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-base text-[#2E7D32] dark:text-[#4CAF50]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  onBlur={() => setTimeout(() => setIsExportMenuOpen(false), 200)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] shadow-sm transition-all hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  İndir
                  <span className="material-symbols-outlined text-base">expand_more</span>
                </button>
                {isExportMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[#E8F5E9] bg-white shadow-lg dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10">
                    <button
                      onClick={() => {
                        handleExport('pdf');
                        setIsExportMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] dark:text-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
                    >
                      PDF olarak indir
                    </button>
                    <button
                      onClick={() => {
                        handleExport('csv');
                        setIsExportMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] dark:text-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
                    >
                      CSV olarak indir
                    </button>
                    <button
                      onClick={() => {
                        handleExport('excel');
                        setIsExportMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] dark:text-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
                    >
                      Excel olarak indir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Toplam Başvuru</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                    {reportStats.totalApplications}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                  <span className="material-symbols-outlined text-2xl text-primary">description</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Onaylanan</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {reportStats.approvedApplications}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">
                    check_circle
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Ortalama İşlem Süresi</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                    {reportStats.averageProcessingTime}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">schedule</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Bekleyen</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {reportStats.pendingApplications}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <span className="material-symbols-outlined text-2xl text-yellow-600 dark:text-yellow-400">
                    pending
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Reddedilen</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {reportStats.rejectedApplications}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">cancel</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Ortalama Risk Skoru</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                    {reportStats.riskScore}/10
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <span className="material-symbols-outlined text-2xl text-orange-600 dark:text-orange-400">
                    warning
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Status Distribution & Trend Analysis */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                Durum Dağılımı
              </h2>
              <StatusPieChart data={statusDistribution} />
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                Aylık Trend Analizi
              </h2>
              <TrendLineChart data={trendData} />
            </div>
          </section>

          {/* Approval Rate Trend */}
          <section className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
            <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
              Onay Oranı Trendi
            </h2>
            <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
              Zaman içinde başvuru onay oranlarının değişimi
            </p>
            <ApprovalRateAreaChart data={trendData} />
          </section>

          {/* Category Statistics */}
          <section className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
            <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
              Kategori Bazlı İstatistikler
            </h2>
            <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
              Kategorilere göre başvuru durumları karşılaştırması
            </p>
            <CategoryBarChart data={categoryStats} />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-border-light text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:border-border-dark dark:text-subtle-dark">
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Toplam Başvuru</th>
                    <th className="px-4 py-3">Onaylanan</th>
                    <th className="px-4 py-3">Bekleyen</th>
                    <th className="px-4 py-3">Reddedilen</th>
                    <th className="px-4 py-3">Onay Oranı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
                  {categoryStats.map((stat) => {
                    const approvalRate = ((stat.approved / stat.applications) * 100).toFixed(1);
                    return (
                      <tr key={stat.category} className="hover:bg-primary/5 dark:hover:bg-primary/10">
                        <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">
                          {stat.category}
                        </td>
                        <td className="px-4 py-3 text-content-light dark:text-content-dark">{stat.applications}</td>
                        <td className="px-4 py-3 text-green-600 dark:text-green-400">{stat.approved}</td>
                        <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">{stat.pending}</td>
                        <td className="px-4 py-3 text-red-600 dark:text-red-400">{stat.rejected}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-content-light dark:text-content-dark">{approvalRate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* High Risk Farms & Delayed Approvals */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                Yüksek Riskli Çiftlikler
              </h2>
              <div className="space-y-4">
                {highRiskFarms.map((farm) => (
                  <div
                    key={farm.name}
                    className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-content-light dark:text-content-dark">{farm.name}</p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{farm.owner}</p>
                      </div>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                        {farm.riskScore}/10
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {farm.issues.map((issue) => (
                        <span
                          key={issue}
                          className="rounded-full bg-red-200 px-2 py-1 text-xs text-red-800 dark:bg-red-800 dark:text-red-200"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                Geciken Onaylar
              </h2>
              <div className="space-y-4">
                {delayedApprovals.map((approval) => (
                  <div
                    key={approval.applicationNumber}
                    className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-content-light dark:text-content-dark">
                          {approval.applicationNumber}
                        </p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{approval.applicant}</p>
                      </div>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                        {approval.daysDelayed} gün
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
                      Durum: <span className="font-medium">{approval.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Back to Dashboard */}
          <div className="flex justify-center">
            <Link
              to="/admin/ziraat"
              className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-6 py-3 text-sm font-medium text-content-light transition-colors hover:bg-primary/5 dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Dashboard'a Dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GeneralReportPage;

