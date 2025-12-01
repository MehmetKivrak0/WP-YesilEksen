import { useEffect, useState } from 'react';
import Navbar from '../../../../components/navbar';

type ProductStatus = 'Aktif' | 'Beklemede' | 'Taslak';

type ProductRow = {
  name: string;
  category: string;
  supplier: string;
  price: string;
  status: ProductStatus;
  statusNote: string;
};

const initialProductRows: ProductRow[] = [
  {
    name: 'Organik Zeytinyağı',
    category: 'Gıda',
    supplier: 'Güney Ege Zeytincilik',
    price: '₺320 / 1L',
    status: 'Aktif',
    statusNote: 'Stoklar güncel.',
  },
  {
    name: 'Doğal Bal',
    category: 'Gıda',
    supplier: 'Anadolu Arıcılık',
    price: '₺250 / 850g',
    status: 'Aktif',
    statusNote: 'Kalite kontrol tamamlandı.',
  },
  {
    name: 'Taze Keçi Peyniri',
    category: 'Süt Ürünleri',
    supplier: 'Akdeniz Çiftliği',
    price: '₺180 / 500g',
    status: 'Beklemede',
    statusNote: 'Soğuk zincir teyidi bekleniyor.',
  },
  {
    name: 'Lavanta Sabunu',
    category: 'Kişisel Bakım',
    supplier: 'Ege Bitki Atölyesi',
    price: '₺55 / Adet',
    status: 'Aktif',
    statusNote: 'Paketleme tamam.',
  },
  {
    name: 'Doğal Yün İpliği',
    category: 'El Sanatları',
    supplier: 'Anadolu Tekstil',
    price: '₺120 / 100g',
    status: 'Taslak',
    statusNote: 'Ürün fotoğrafı bekleniyor.',
  },
];

const productCategories = ['Gıda', 'Süt Ürünleri', 'Kişisel Bakım', 'El Sanatları', 'Atık Dönüşüm'];
const productStatusOptions: ProductStatus[] = ['Aktif', 'Beklemede', 'Taslak'];

type ChangeLogEntry = {
  name: string;
  field: 'Durum' | 'Kategori' | 'Silme';
  from: string;
  to: string;
  reason?: string;
  timestamp: string;
};

type StatusModalState = {
  open: boolean;
  productName: string | null;
  currentStatus: ProductStatus | null;
  nextStatus: ProductStatus | null;
  reason: string;
  error: string | null;
};

const initialStatusModalState: StatusModalState = {
  open: false,
  productName: null,
  currentStatus: null,
  nextStatus: null,
  reason: '',
  error: null,
};

type DeleteModalState = {
  open: boolean;
  productName: string | null;
  reason: string;
  error: string | null;
};

const initialDeleteModalState: DeleteModalState = {
  open: false,
  productName: null,
  reason: '',
  error: null,
};

function WasteManagementPage() {
  const [products, setProducts] = useState<ProductRow[]>(initialProductRows);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [statusModal, setStatusModal] = useState<StatusModalState>(initialStatusModalState);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>(initialDeleteModalState);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleCategoryChange = (name: string, nextCategory: string) => {
    const currentProduct = products.find((product) => product.name === name);

    if (!currentProduct || currentProduct.category === nextCategory) {
      return;
    }

    setProducts((prev) =>
      prev.map((product) => (product.name === name ? { ...product, category: nextCategory } : product)),
    );

    setChangeLog((log) => [
      {
        name,
        field: 'Kategori',
        from: currentProduct.category,
        to: nextCategory,
        timestamp: new Date().toISOString(),
      },
      ...log,
    ]);
  };

  const openStatusModal = (product: ProductRow, nextStatus: ProductStatus) => {
    if (product.status === nextStatus) {
      return;
    }

    setStatusModal({
      open: true,
      productName: product.name,
      currentStatus: product.status,
      nextStatus,
      reason: '',
      error: null,
    });
  };

  const closeStatusModal = () => setStatusModal(initialStatusModalState);

  const confirmStatusChange = () => {
    if (!statusModal.productName || !statusModal.nextStatus) {
      closeStatusModal();
      return;
    }

    const reason = statusModal.reason.trim();

    if (!reason) {
      setStatusModal((prev) => ({ ...prev, error: 'Lütfen bir neden belirtin.' }));
      return;
    }

    const currentProduct = products.find((product) => product.name === statusModal.productName);

    if (!currentProduct || currentProduct.status === statusModal.nextStatus) {
      closeStatusModal();
      return;
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.name === statusModal.productName
          ? { ...product, status: statusModal.nextStatus as ProductStatus, statusNote: reason }
          : product,
      ),
    );

    setChangeLog((log) => [
      {
        name: statusModal.productName,
        field: 'Durum',
        from: currentProduct.status,
        to: statusModal.nextStatus,
        reason,
        timestamp: new Date().toISOString(),
      },
      ...log,
    ]);

    setToast({
      message: `${statusModal.productName} için durum ${statusModal.nextStatus} olarak güncellendi.`,
      tone: 'success',
    });

    closeStatusModal();
  };

  const openDeleteModal = (product: ProductRow) => {
    setDeleteModal({
      open: true,
      productName: product.name,
      reason: '',
      error: null,
    });
  };

  const closeDeleteModal = () => setDeleteModal(initialDeleteModalState);

  const confirmDelete = () => {
    if (!deleteModal.productName) {
      closeDeleteModal();
      return;
    }

    const reason = deleteModal.reason.trim();

    if (!reason) {
      setDeleteModal((prev) => ({ ...prev, error: 'Lütfen silme nedenini belirtin.' }));
      return;
    }

    const existingProduct = products.find((product) => product.name === deleteModal.productName);

    if (!existingProduct) {
      closeDeleteModal();
      return;
    }

    setProducts((prev) => prev.filter((product) => product.name !== deleteModal.productName));

    setChangeLog((log) => [
      {
        name: deleteModal.productName,
        field: 'Silme',
        from: existingProduct.category,
        to: 'Listeden Kaldırıldı',
        reason,
        timestamp: new Date().toISOString(),
      },
      ...log,
    ]);

    setToast({
      message: `${deleteModal.productName} listeden kaldırıldı.`,
      tone: 'success',
    });

    closeDeleteModal();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {toast && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                toast.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {toast.tone === 'success' ? 'check_circle' : 'info'}
              </span>
              <span>{toast.message}</span>
            </div>
          )}
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">Ürün Yönetimi</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">
              Kırsal üreticilerden gelen sürdürülebilir ürünleri yönetin, kataloglayın ve güncel tutun.
            </p>
          </div>

          {/* Dashboard Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">156</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">inventory</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 dark:text-green-400">+%8</span>
                <span className="text-sm text-subtle-light dark:text-subtle-dark"> geçen aydan</span>
              </div>
            </div>

            <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Aktif Ürün</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">142</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 dark:text-green-400">+%12</span>
                <span className="text-sm text-subtle-light dark:text-subtle-dark"> geçen aydan</span>
              </div>
            </div>

            <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Ürün Kategorisi</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">24</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">category</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 dark:text-green-400">+%5</span>
                <span className="text-sm text-subtle-light dark:text-subtle-dark"> geçen aydan</span>
              </div>
            </div>

            <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Aylık Sipariş</p>
                  <p className="text-3xl font-bold text-content-light dark:text-content-dark">2.4K</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 dark:text-green-400">+%18</span>
                <span className="text-sm text-subtle-light dark:text-subtle-dark"> geçen aydan</span>
              </div>
            </div>
          </div>

          {/* Ürün Listesi */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Ürün Kataloğu</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                    search
                  </span>
                  <input
                    className="pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Ürün ara"
                    type="search"
                  />
                </div>
                <select className="p-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                  <option>Tüm Kategoriler</option>
                  <option>Gıda</option>
                  <option>Süt Ürünleri</option>
                  <option>Kişisel Bakım</option>
                  <option>El Sanatları</option>
                  <option>Atık Dönüşüm</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-border-light dark:border-border-dark">
              <table className="w-full table-auto">
                <thead className="bg-background-light dark:bg-background-dark">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      Ürün Adı
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      Tedarikçi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      Fiyat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {products.map((row) => (
                    <tr key={row.name} className="hover:bg-primary/5 dark:hover:bg-primary/10">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-content-light dark:text-content-dark">
                        {row.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                        <select
                          value={row.category}
                          className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-1 text-sm"
                          onChange={(event) => handleCategoryChange(row.name, event.target.value)}
                        >
                          {productCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                        {row.supplier}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                        {row.price}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtle-light dark:text-subtle-dark">
                        <select
                          value={row.status}
                          className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-1 text-sm font-medium"
                          onChange={(event) => openStatusModal(row, event.target.value as ProductStatus)}
                        >
                          {productStatusOptions.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          className="rounded border border-red-600 px-3 py-1 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                          onClick={() => openDeleteModal(row)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark p-6">
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">Yapılan Değişiklikler</h3>
            {changeLog.length === 0 ? (
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Henüz kaydedilmiş bir değişiklik bulunmuyor.
              </p>
            ) : (
              <ul className="space-y-3">
                {changeLog.map((log, index) => (
                  <li
                    key={`${log.name}-${log.timestamp}-${index}`}
                    className="rounded-lg border border-border-light dark:border-border-dark px-4 py-3 text-sm text-subtle-light dark:text-subtle-dark"
                  >
                    <span className="block font-medium text-content-light dark:text-content-dark">
                      {log.field === 'Silme'
                        ? `${log.name} • ${log.from} kategorisinden kaldırıldı`
                        : `${log.name} • ${log.field} değişti: ${log.from} → ${log.to}`}
                    </span>
                    {log.reason && <span className="block">Neden: {log.reason}</span>}
                    <span className="block text-xs mt-1 text-subtle-light dark:text-subtle-dark">
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {statusModal.open && statusModal.productName && statusModal.currentStatus && statusModal.nextStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-light bg-background-light p-6 text-content-light shadow-2xl dark:border-border-dark dark:bg-background-dark dark:text-content-dark">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold">Durum Değişikliğini Onayla</h4>
                <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
                  {statusModal.productName} için durumu{' '}
                  <span className="font-medium text-primary">{statusModal.currentStatus}</span> seviyesinden{' '}
                  <span className="font-medium text-primary">{statusModal.nextStatus}</span> seviyesine almak üzeresiniz.
                </p>
              </div>
              <button
                className="rounded-full bg-transparent p-1 text-subtle-light transition hover:text-content-light dark:text-subtle-dark dark:hover:text-content-dark"
                onClick={closeStatusModal}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <label className="mt-6 block text-sm font-medium text-content-light dark:text-content-dark">
              Değişiklik Nedeni
              <textarea
                className="mt-2 h-28 w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm text-content-light focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                placeholder="Çiftçiye iletilecek açıklamayı girin..."
                value={statusModal.reason}
                onChange={(event) =>
                  setStatusModal((prev) => ({ ...prev, reason: event.target.value, error: null }))
                }
              />
            </label>
            {statusModal.error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{statusModal.error}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-subtle-light transition hover:bg-border-light/60 dark:border-border-dark dark:text-subtle-dark dark:hover:bg-border-dark/60"
                onClick={closeStatusModal}
              >
                Vazgeç
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                onClick={confirmStatusChange}
              >
                <span className="material-symbols-outlined text-base">send</span>
                Onayla ve Bildir
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && deleteModal.productName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-light bg-background-light p-6 text-content-light shadow-2xl dark:border-border-dark dark:bg-background-dark dark:text-content-dark">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold">Ürünü Sil</h4>
                <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
                  {deleteModal.productName} kaydını sistemden kaldırmak üzeresiniz. Lütfen çiftçiye iletilecek silme
                  nedenini belirtin.
                </p>
              </div>
              <button
                className="rounded-full bg-transparent p-1 text-subtle-light transition hover:text-content-light dark:text-subtle-dark dark:hover:text-content-dark"
                onClick={closeDeleteModal}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <label className="mt-6 block text-sm font-medium text-content-light dark:text-content-dark">
              Silme Nedeni
              <textarea
                className="mt-2 h-28 w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm text-content-light focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                placeholder="Silme gerekçesini yazın..."
                value={deleteModal.reason}
                onChange={(event) =>
                  setDeleteModal((prev) => ({ ...prev, reason: event.target.value, error: null }))
                }
              />
            </label>
            {deleteModal.error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteModal.error}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-subtle-light transition hover:bg-border-light/60 dark:border-border-dark dark:text-subtle-dark dark:hover:bg-border-dark/60"
                onClick={closeDeleteModal}
              >
                Vazgeç
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                onClick={confirmDelete}
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Sil ve Bildir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteManagementPage;

