import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ZrtnNavbar from '../../../../components/zrtnavbar';

type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';

type ProductApplication = {
  product: string;
  applicant: string;
  category: string;
  status: 'Onaylandı' | 'İncelemede' | 'Revizyon';
  submittedAt: string;
  lastUpdate: string;
  notes: string;
  farm: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  documents: Array<{
    name: string;
    status: DocumentStatus;
    url?: string;
    farmerNote?: string;
  }>;
};

const initialProductApplications: ProductApplication[] = [
  {
    product: 'Organik Kompost',
    applicant: 'Anadolu Tarım Kooperatifi',
    category: 'Toprak İyileştirici',
    status: 'İncelemede',
    submittedAt: '2024-02-12',
    lastUpdate: '2 saat önce',
    notes: 'Laboratuvar sonuçları bekleniyor.',
    farm: 'Güneş Çiftliği',
    contact: {
      name: 'Mehmet Yılmaz',
      phone: '+90 532 000 12 34',
      email: 'mehmet.yilmaz@anadolutarim.org',
    },
    documents: [
      { name: 'Ürün İçerik Analizi', status: 'Beklemede', url: '/docs/urun-icerik-analizi.pdf' },
      { name: 'ÇKS Belgesi', status: 'Onaylandı', url: '/docs/cks-belgesi.pdf' },
      { name: 'TSE Uygunluk', status: 'Onaylandı', url: '/docs/tse-uygunluk.pdf' },
      { name: 'Sevkiyat Planı', status: 'Eksik' },
    ],
  },
  {
    product: 'Sıvı Gübre',
    applicant: 'Çukurova Ziraat',
    category: 'Gübre',
    status: 'Onaylandı',
    submittedAt: '2024-02-08',
    lastUpdate: 'Dün',
    notes: 'Tüm belgeler eksiksiz teslim edildi.',
    farm: 'Bereket Vadisi',
    contact: {
      name: 'Ayşe Demir',
      phone: '+90 533 555 45 67',
      email: 'ayse.demir@cukurovaziraat.com',
    },
    documents: [
      { name: 'Ürün Güvenlik Formu', status: 'Onaylandı', url: '/docs/urun-guvenlik-formu.pdf' },
      { name: 'Tarım İl Müdürlüğü Onayı', status: 'Onaylandı', url: '/docs/tarim-il-mudurlugu-onayi.pdf' },
      { name: 'Numune Sonuçları', status: 'Onaylandı', url: '/docs/numune-sonuclari.pdf' },
    ],
  },
  {
    product: 'Hayvansal Yem',
    applicant: 'Bereket Gıda',
    category: 'Yem',
    status: 'Revizyon',
    submittedAt: '2024-02-05',
    lastUpdate: '3 gün önce',
    notes: 'İçerik analizi güncellenmeli.',
    farm: 'Yeşil Ovalar',
    contact: {
      name: 'Ali Kaya',
      phone: '+90 542 111 22 33',
      email: 'ali.kaya@bereketgida.com',
    },
    documents: [
      { name: 'İçerik Analiz Raporu', status: 'Eksik' },
      { name: 'Besin Değerleri Tablosu', status: 'Beklemede', url: '/docs/besin-degerleri.pdf' },
      { name: 'Üretim Sertifikası', status: 'Onaylandı', url: '/docs/uretim-sertifikasi.pdf' },
    ],
  },
  {
    product: 'Bitkisel Atık Peleti',
    applicant: 'EkoDönüşüm A.Ş.',
    category: 'Enerji',
    status: 'İncelemede',
    submittedAt: '2024-02-10',
    lastUpdate: '6 saat önce',
    notes: 'Saha ziyareti planlandı.',
    farm: 'Eko Enerji Çiftliği',
    contact: {
      name: 'Fatma Korkmaz',
      phone: '+90 506 777 88 99',
      email: 'fatma.korkmaz@ekodonusum.com',
    },
    documents: [
      { name: 'Enerji Üretim Lisansı', status: 'Beklemede', url: '/docs/enerji-uretim-lisansi.pdf' },
      { name: 'Atık Kaynağı Sözleşmesi', status: 'Onaylandı', url: '/docs/atik-kaynagi-sozlesmesi.pdf' },
      { name: 'Yangın Güvenliği Planı', status: 'Onaylandı', url: '/docs/yangin-guvenligi-plani.pdf' },
    ],
  },
  {
    product: 'Tavuk Gübresi Granülü',
    applicant: 'Anka Organik',
    category: 'Gübre',
    status: 'Onaylandı',
    submittedAt: '2024-01-29',
    lastUpdate: '4 gün önce',
    notes: 'Ürün sertifikası yayınlandı.',
    farm: 'Anka Organik Çiftliği',
    contact: {
      name: 'Hakan Arslan',
      phone: '+90 555 333 44 55',
      email: 'hakan.arslan@ankaorganik.com',
    },
    documents: [
      { name: 'Organik Ürün Sertifikası', status: 'Onaylandı', url: '/docs/organik-urun-sertifikasi.pdf' },
      { name: 'Geri Dönüşüm Raporu', status: 'Onaylandı', url: '/docs/geri-donusum-raporu.pdf' },
      { name: 'Lojistik Planı', status: 'Onaylandı', url: '/docs/lojistik-plani.pdf' },
    ],
  },
];

const statusColors: Record<string, string> = {
  Onaylandı: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  İncelemede: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  Revizyon: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
};

function ProductApplicationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<'Hepsi' | keyof typeof statusColors>('Hepsi');
  const [applications, setApplications] = useState<ProductApplication[]>(initialProductApplications);
  const [inspectedApplication, setInspectedApplication] = useState<ProductApplication | null>(null);
  const [rejectedApplication, setRejectedApplication] = useState<ProductApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [documentReviews, setDocumentReviews] = useState<Record<string, { status: DocumentStatus; reason?: string }>>({});

  const filteredApplications =
    selectedStatus === 'Hepsi'
      ? applications
      : applications.filter((application) => application.status === selectedStatus);

  const closeInspectModal = () => setInspectedApplication(null);
  const handleRejectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you could send the reason to your backend/API
    if (rejectedApplication) {
      const updatedApplications = applications.map((application) =>
        application.product === rejectedApplication.product
          ? {
              ...application,
              notes: `Red yanıtı: ${rejectReason}`,
            }
          : application,
      );
      setApplications(updatedApplications);
      const updatedCurrent = updatedApplications.find(
        (application) => application.product === rejectedApplication.product,
      );
      setInspectedApplication((current) =>
        current && current.product === rejectedApplication.product ? updatedCurrent ?? current : current,
      );
      console.info('Güncellenen başvurular', updatedApplications);
    }
    setRejectedApplication(null);
    setRejectReason('');
  };

  useEffect(() => {
    if (!inspectedApplication) {
      setDocumentReviews({});
      return;
    }

    const initial = inspectedApplication.documents.reduce<Record<string, { status: DocumentStatus; reason?: string }>>(
      (acc, doc) => {
        acc[doc.name] = { status: doc.status, reason: doc.farmerNote };
        return acc;
      },
      {},
    );

    setDocumentReviews(initial);
  }, [inspectedApplication]);

  const updateDocumentStatus = (name: string, status: DocumentStatus) => {
    setDocumentReviews((prev) => ({
      ...prev,
      [name]: {
        status,
        reason: status === 'Reddedildi' ? prev[name]?.reason : undefined,
      },
    }));
  };

  const updateDocumentReason = (name: string, reason: string) => {
    setDocumentReviews((prev) => ({
      ...prev,
      [name]: {
        status: prev[name]?.status ?? 'Reddedildi',
        reason,
      },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark">
      <ZrtnNavbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Ürün Onay Başvuruları</h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Ziraat Odası’na iletilen ürün başvurularını inceleyin, durumlarını güncelleyin.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark" htmlFor="status-filter">
                Durum Filtresi
              </label>
              <select
                id="status-filter"
                className="p-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as typeof selectedStatus)}
              >
                <option value="Hepsi">Hepsi</option>
                <option value="İncelemede">İncelemede</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Revizyon">Revizyon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Toplam Başvuru</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{applications.length}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Bu ay sisteme girilen tüm başvurular</p>
            </div>
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">İnceleme Sürecinde</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {applications.filter((item) => item.status === 'İncelemede').length}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Uzman görüşü bekleyen başvurular</p>
            </div>
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Onaylanan Ürünler</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {applications.filter((item) => item.status === 'Onaylandı').length}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Satışa açılmasına izin verilen ürünler</p>
            </div>
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Revizyon Bekleyen</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {applications.filter((item) => item.status === 'Revizyon').length}
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Ek belge/tasarım istenen başvurular</p>
            </div>
          </div>

          <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
            <div className="flex flex-col gap-4 border-b border-border-light dark:border-border-dark px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Başvuru Listesi</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Filtreye göre görüntülenen {filteredApplications.length} başvuru
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30">
                  <span className="material-symbols-outlined text-base">download</span>
                  Rapor İndir
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-background-light dark:bg-background-dark">
                  <tr className="text-xs uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                    <th className="px-6 py-3 text-left">Ürün</th>
                    <th className="px-6 py-3 text-left">Başvuru Sahibi</th>
                    <th className="px-6 py-3 text-left">Kategori</th>
                    <th className="px-6 py-3 text-left">Durum</th>
                    <th className="px-6 py-3 text-left">Başvuru Tarihi</th>
                    <th className="px-6 py-3 text-left">Son Güncelleme</th>
                    <th className="px-6 py-3 text-left">Notlar</th>
                    <th className="px-6 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                  {filteredApplications.map((application) => (
                    <tr key={application.product} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-content-light dark:text-content-dark">{application.product}</td>
                      <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.applicant}</td>
                      <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.category}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[application.status] ?? 'bg-muted text-content-light'
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.submittedAt}</td>
                      <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.lastUpdate}</td>
                      <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">{application.notes}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30"
                            onClick={() => setInspectedApplication(application)}
                          >
                            İncele
                          </button>
                          <button className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            Onayla
                          </button>
                          <button
                            className="rounded-full bg-red-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-red-500 dark:hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            onClick={() => setRejectedApplication(application)}
                          >
                            Reddet
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {inspectedApplication && (
        <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/40 px-4 py-8 sm:px-8">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-2xl">
            <button
              className="absolute right-4 top-4 flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
              onClick={closeInspectModal}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="max-h-[80vh] overflow-y-auto p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">
                  {inspectedApplication.product}
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Başvuran: {inspectedApplication.applicant} • Başvuru Tarihi: {inspectedApplication.submittedAt}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
                  <h3 className="text-sm font-semibold text-content-light dark:text-content-dark mb-3">
                    Çiftlik Bilgileri
                  </h3>
                  <ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Çiftlik:</span>{' '}
                      {inspectedApplication.farm}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Sorumlu:</span>{' '}
                      {inspectedApplication.contact.name}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Telefon:</span>{' '}
                      {inspectedApplication.contact.phone}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">E-Posta:</span>{' '}
                      {inspectedApplication.contact.email}
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
                  <h3 className="text-sm font-semibold text-content-light dark:text-content-dark mb-3">
                    Başvuru Özeti
                  </h3>
                  <ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Kategori:</span>{' '}
                      {inspectedApplication.category}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Son Güncelleme:</span>{' '}
                      {inspectedApplication.lastUpdate}
                    </li>
                    <li>
                      <span className="font-medium text-content-light dark:text-content-dark">Durum:</span>{' '}
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[inspectedApplication.status]
                        }`}
                      >
                        {inspectedApplication.status}
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 space-y-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light/40 dark:bg-background-dark/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Notlar
                    </p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">{inspectedApplication.notes}</p>
                    {Object.values(documentReviews)
                      .filter((review) => review.status === 'Reddedildi' && review.reason)
                      .map((review, index) => (
                        <p
                          key={index}
                          className="text-sm text-red-700 dark:text-red-200"
                        >
                          Geçerli Neden: {review.reason}
                        </p>
                      ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
                <h3 className="text-sm font-semibold text-content-light dark:text-content-dark mb-3">
                  Belgeler ve Durumları
                </h3>
                <ul className="space-y-2 text-sm">
                  {inspectedApplication.documents.map((document) => {
                    const review = documentReviews[document.name] ?? { status: document.status, reason: document.farmerNote };
                    const statusClass =
                      review.status === 'Onaylandı'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : review.status === 'Eksik'
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                          : review.status === 'Reddedildi'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
                    const canDownload = Boolean(document.url && review.status === 'Onaylandı');

                    return (
                      <li
                        key={document.name}
                        className="flex flex-col gap-3 rounded-lg bg-background-light/60 dark:bg-background-dark/60 px-4 py-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-subtle-light dark:text-subtle-dark">{document.name}</span>
                            {document.url && (
                              <span className="text-xs text-subtle-light/80 dark:text-subtle-dark/80">
                                Dosya: {document.url.split('/').pop()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
                              {review.status}
                            </span>
                            {document.url && (
                              <>
                                <a
                                  href={document.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
                                  title="Yeni sekmede görüntüle"
                                >
                                  <span className="material-symbols-outlined text-base">visibility</span>
                                  Görüntüle
                                </a>
                                <a
                                  href={`${document.url}?download=true`}
                                  download
                                  className="inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
                                  title="İndir"
                                >
                                  <span className="material-symbols-outlined text-base">download</span>
                                  İndir
                                </a>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => updateDocumentStatus(document.name, 'Onaylandı')}
                              className="inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                            >
                              <span className="material-symbols-outlined text-base">check</span>
                              Onayla
                            </button>
                            <button
                              type="button"
                              onClick={() => updateDocumentStatus(document.name, 'Reddedildi')}
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                review.status === 'Reddedildi'
                                  ? 'border-red-600 bg-red-600 text-white'
                                  : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                              Reddet
                            </button>
                          </div>
                        </div>
                        {review.status === 'Reddedildi' && (
                          <div className="mt-2 space-y-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/20 p-3">
                            <label className="flex flex-col gap-2 text-xs text-red-800 dark:text-red-200">
                              Çiftçiye iletilecek açıklama
                              <textarea
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-content-light dark:text-content-dark focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Belgenin reddedilme gerekçesini ve yapılması gerekenleri belirtin."
                                value={review.reason ?? ''}
                                onChange={(event) => updateDocumentReason(document.name, event.target.value)}
                              />
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateDocumentReason(
                                    document.name,
                                    'Belgede yer alan içerik değerleri mevzuat sınırlarının üzerinde. Güncel analiz sonuçlarını ekleyerek yeniden gönderiniz.',
                                  )
                                }
                                className="rounded-full border border-red-500 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500 hover:text-white"
                              >
                                İçerik değeri uyumsuz
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateDocumentReason(
                                    document.name,
                                    'Belgenin imzalı/kaşeli versiyonu eksik. Lütfen yetkili imzalı belgeyi sisteme yükleyiniz.',
                                  )
                                }
                                className="rounded-full border border-red-500 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500 hover:text-white"
                              >
                                İmzalı belge eksik
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateDocumentReason(
                                    document.name,
                                    'Belge formatı uygun değil. PDF formatında ve en fazla 10 MB boyutunda dosya yükleyiniz.',
                                  )
                                }
                                className="rounded-full border border-red-500 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500 hover:text-white"
                              >
                                Format sorunlu
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (review.reason) {
                                    // TODO: integrate with API to send notification
                                    console.info(`İletildi: ${document.name} için mesaj -> ${review.reason}`);
                                  }
                                }}
                                disabled={!review.reason}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  review.reason
                                    ? 'border border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
                                    : 'border border-border-light dark:border-border-dark text-subtle-light/70 dark:text-subtle-dark/70 cursor-not-allowed'
                                }`}
                              >
                                <span className="material-symbols-outlined text-base">forward_to_inbox</span>
                                İlet
                              </button>
                            </div>
                            {review.reason && (
                              <p className="text-xs text-red-700 dark:text-red-200">
                                Çiftçi panelinde gösterilecek açıklama: <span className="font-medium">{review.reason}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                  onClick={closeInspectModal}
                >
                  Kapat
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                  Onayı Tamamla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectedApplication && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Reddet ve Bilgilendir</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {rejectedApplication.product} başvurusu için reddetme nedenini belirterek üreticiyi bilgilendirin.
                </p>
              </div>
              <button
                className="flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                onClick={() => {
                  setRejectedApplication(null);
                  setRejectReason('');
                }}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleRejectSubmit}>
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2" htmlFor="reject-reason">
                  Geçerli Neden
                </label>
                <textarea
                  id="reject-reason"
                  required
                  rows={4}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-content-light dark:text-content-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Örneğin: İçerik analiz raporunda belirtilen değerler mevzuata uygun değil..."
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2" htmlFor="owner-message">
                  Çiftlik Sahibine Mesaj
                </label>
                <textarea
                  id="owner-message"
                  rows={4}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-content-light dark:text-content-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`${rejectedApplication.contact.name} için ileti: Reddetme nedenini ve düzeltme için talimatları paylaşın.`}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                  onClick={() => {
                    setRejectedApplication(null);
                    setRejectReason('');
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Reddi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductApplicationsPage;

