import ZrtnNavbar from '../../../../components/zrtnavbar';
import FarmStatsCards from './components/FarmStatsCards';
import FarmSearchBar from './components/FarmSearchBar';
import FarmTable from './components/FarmTable';
import ChangeLog from './components/ChangeLog';
import FarmToast from './components/FarmToast';
import StatusModal from './components/modals/StatusModal';
import DeleteModal from './components/modals/DeleteModal';
import FarmProductsModal from './components/modals/FarmProductsModal';
import { useFarmList } from './hooks/useFarmList';
import { initialFarmRows, farmProductsCatalog } from './data/farmList';

function FarmListPage() {
  const {
    farms,
    stats,
    changeLog,
    filteredFarms,
    searchQuery,
    setSearchQuery,
    statusModal,
    openStatusModal,
    closeStatusModal,
    confirmStatusChange,
    updateStatusReason,
    selectNextStatus,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    updateDeleteReason,
    productsModal,
    openProductsModal,
    closeProductsModal,
    toast,
    setToast,
  } = useFarmList({ initialFarms: initialFarmRows, productsCatalog: farmProductsCatalog });

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <ZrtnNavbar />

      <main className="flex-grow">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-content-light dark:text-content-dark">Çiftlik Yönetimi</h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Çiftlik kayıtlarını yönetin, durum değişikliklerini takip edin ve ürün portföylerini görüntüleyin.
              </p>
            </div>
            <FarmSearchBar query={searchQuery} onChange={setSearchQuery} />
          </header>

          <FarmStatsCards farms={farms} stats={stats} />

          <section className="rounded-xl border border-border-light bg-background-light dark:border-border-dark dark:bg-background-dark">
            <div className="flex flex-col gap-4 border-b border-border-light px-6 py-4 dark:border-border-dark md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Çiftlik Listesi</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Toplam {filteredFarms.length} kayıt listeleniyor.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/40 dark:hover:bg-primary/30"
                onClick={() => setToast({ message: 'Çiftlik içe aktarma özelliği yakında eklenecek.', tone: 'error' })}
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                Toplu İçe Aktar
              </button>
            </div>

            <FarmTable
              farms={filteredFarms}
              onOpenProducts={openProductsModal}
              onOpenStatusModal={openStatusModal}
              onOpenDeleteModal={openDeleteModal}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,1fr]">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="text-lg font-semibold text-content-light dark:text-content-dark">Son Değişiklikler</h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Durum güncellemeleri ve silme kayıtları.</p>
              <div className="mt-4 max-h-80 overflow-y-auto pr-2">
                <ChangeLog entries={changeLog} />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border-light bg-background-light p-6 text-sm text-subtle-light dark:border-border-dark dark:bg-background-dark dark:text-subtle-dark">
              <h2 className="text-lg font-semibold text-content-light dark:text-content-dark">İpuçları</h2>
              <ul className="mt-3 space-y-2">
                <li>Durum değişikliklerinde çiftçiyle paylaşılan mesajların kopyasını kaydedin.</li>
                <li>Ürün kataloğunu güncel tutmak için çiftliklerle aylık olarak iletişim kurun.</li>
                <li>Silinen kayıtlar 30 gün boyunca geri yüklenebilir.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <StatusModal
        open={statusModal.open}
        farmName={statusModal.farmName}
        currentStatus={statusModal.currentStatus}
        nextStatus={statusModal.nextStatus}
        reason={statusModal.reason}
        error={statusModal.error}
        onReasonChange={updateStatusReason}
        onSelectStatus={selectNextStatus}
        onClose={closeStatusModal}
        onConfirm={confirmStatusChange}
      />

      <DeleteModal
        open={deleteModal.open}
        farmName={deleteModal.farmName}
        reason={deleteModal.reason}
        error={deleteModal.error}
        onReasonChange={updateDeleteReason}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <FarmProductsModal
        open={productsModal.open}
        farmName={productsModal.farmName}
        products={productsModal.products}
        onClose={closeProductsModal}
      />

      <FarmToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default FarmListPage;
