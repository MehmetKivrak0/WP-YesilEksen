import { useState } from 'react';
import { Link } from 'react-router-dom';
import SanayiNavbar from '../components/SanayiNavbar';
import {
  TrendLineChart,
  SectorBarChart,
  StatusPieChart,
  ApprovalRateAreaChart,
} from './components/Charts';

function GeneralReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSector, setSelectedSector] = useState('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  const reportStats = {
    totalApplications: 856,
    approvedApplications: 642,
    pendingApplications: 134,
    rejectedApplications: 80,
    averageProcessingTime: '3.8 gün',
    riskScore: 5.2,
  };

  const statusDistribution = [
    { label: 'Onaylanan', value: 642, percentage: 75.0, color: 'bg-green-500' },
    { label: 'Bekleyen', value: 134, percentage: 15.7, color: 'bg-yellow-500' },
    { label: 'Reddedilen', value: 80, percentage: 9.3, color: 'bg-red-500' },
  ];

  const trendData = [
    { month: 'Ocak', applications: 72, approved: 54, rejected: 8 },
    { month: 'Şubat', applications: 85, approved: 64, rejected: 10 },
    { month: 'Mart', applications: 98, approved: 74, rejected: 12 },
    { month: 'Nisan', applications: 112, approved: 85, rejected: 15 },
    { month: 'Mayıs', applications: 134, approved: 102, rejected: 18 },
    { month: 'Haziran', applications: 156, approved: 118, rejected: 22 },
  ];

  const sectorStats = [
    { sector: 'Yenilenebilir Enerji', applications: 234, approved: 178, pending: 38, rejected: 18 },
    { sector: 'Kimya', applications: 198, approved: 148, pending: 32, rejected: 18 },
    { sector: 'Biyoteknoloji', applications: 156, approved: 118, pending: 24, rejected: 14 },
    { sector: 'Gıda İşleme', applications: 134, approved: 102, pending: 20, rejected: 12 },
    { sector: 'Tarım Teknolojisi', applications: 134, approved: 98, pending: 20, rejected: 18 },
  ];

  const highRiskCompanies = [
    { name: 'Eko Enerji A.Ş.', contact: 'info@ekoenerji.com', riskScore: 7.8, issues: ['Eksik belgeler', 'İnceleme gecikmesi'] },
    { name: 'Anadolu Kimya Ltd.', contact: 'iletisim@anadolukimya.com', riskScore: 7.2, issues: ['Eksik evraklar'] },
    { name: 'BioTarımsal Çözümler', contact: 'destek@biotarim.com', riskScore: 6.9, issues: ['Son güncelleme gecikmesi'] },
  ];

  const delayedApprovals = [
    { applicationNumber: 'P-2001', company: 'Eko Enerji A.Ş.', daysDelayed: 10, status: 'İncelemede' },
    { applicationNumber: 'P-2024', company: 'Anadolu Kimya Ltd.', daysDelayed: 7, status: 'İncelemede' },
    { applicationNumber: 'P-2003', company: 'BioTarımsal Çözümler', daysDelayed: 12, status: 'Evrak Bekliyor' },
  ];

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    // Export işlemi burada yapılacak
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <SanayiNavbar />

      <main className="flex-grow">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
                Genel Raporlar
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Sanayi odası faaliyetlerinin kapsamlı analizi ve istatistikleri
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
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="appearance-none rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 pr-10 text-sm font-medium text-[#2E7D32] shadow-sm transition-all hover:border-[#2E7D32] focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50]"
                >
                  <option value="all">Tüm Sektörler</option>
                  <option value="energy">Yenilenebilir Enerji</option>
                  <option value="chemistry">Kimya</option>
                  <option value="biotech">Biyoteknoloji</option>
                  <option value="food">Gıda İşleme</option>
                  <option value="agritech">Tarım Teknolojisi</option>
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

          {/* Sector Statistics */}
          <section className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
            <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
              Sektör Bazlı İstatistikler
            </h2>
            <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
              Sektörlere göre başvuru durumları karşılaştırması
            </p>
            <SectorBarChart data={sectorStats} />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-border-light text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:border-border-dark dark:text-subtle-dark">
                    <th className="px-4 py-3">Sektör</th>
                    <th className="px-4 py-3">Toplam Başvuru</th>
                    <th className="px-4 py-3">Onaylanan</th>
                    <th className="px-4 py-3">Bekleyen</th>
                    <th className="px-4 py-3">Reddedilen</th>
                    <th className="px-4 py-3">Onay Oranı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-sm dark:divide-border-dark">
                  {sectorStats.map((stat) => {
                    const approvalRate = ((stat.approved / stat.applications) * 100).toFixed(1);
                    return (
                      <tr key={stat.sector} className="hover:bg-primary/5 dark:hover:bg-primary/10">
                        <td className="px-4 py-3 font-medium text-content-light dark:text-content-dark">
                          {stat.sector}
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

          {/* High Risk Companies & Delayed Approvals */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                Yüksek Riskli Şirketler
              </h2>
              <div className="space-y-4">
                {highRiskCompanies.map((company) => (
                  <div
                    key={company.name}
                    className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-content-light dark:text-content-dark">{company.name}</p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{company.contact}</p>
                      </div>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                        {company.riskScore}/10
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {company.issues.map((issue) => (
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
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{approval.company}</p>
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
              to="/admin/sanayi"
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

