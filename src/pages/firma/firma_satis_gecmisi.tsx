import FrmNavbar from '../../components/frmnavbar';

function FirmaSatisGecmisi() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Satın Alma Geçmişi</h1>
            <div className="flex w-full sm:w-auto items-center gap-4">
              <div className="relative flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
                <input
                  className="form-input w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-white dark:bg-background-dark ring-1 ring-inset ring-primary/20 dark:ring-primary/40 focus:ring-2 focus:ring-inset focus:ring-primary h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-10 pr-4 text-base"
                  placeholder="Ürün veya satıcı ara"
                  type="search"
                />
              </div>
              <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90">
                <span className="material-symbols-outlined">filter_list</span>
                <span>Filtrele</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-primary/20 bg-white dark:border-primary/30 dark:bg-background-dark shadow-sm">
            <table className="w-full table-auto">
              <thead className="bg-background-light dark:bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Ürün/Atık Adı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Miktar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Fiyat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Satın Alma Tarihi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Satıcı Firma</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">İşlem Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20 dark:divide-primary/30">
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Ayçiçeği Sapı</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">500 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1500 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-07-20</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Gül Tarım</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Zeytin Prinası</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1000 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2000 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-07-15</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Ege Organik</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Buğday Samanı</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">750 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1800 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-07-10</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Bereket Çiftliği</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Mısır Sapı</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">600 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1600 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-07-05</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Trakya Tarım</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Fındık Kabuğu</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">800 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1700 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-06-30</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Karadeniz Çiftliği</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Pamuk Sapı</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">900 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1900 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-06-25</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Çukurova Tarım</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Pirinç Kabuğu</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1200 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2200 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-06-20</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Marmara Organik</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Domates Sapı</td>
                  <td className="whitespace-nowrap px-6 py-4 text sm text-gray-600 dark:text-gray-300">400 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1400 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-06-15</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Akdeniz Çiftliği</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hover:bg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Elma Posası</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">550 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1550 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-06-10</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Anadolu Tarım</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 dark:hoverbg-primary/10">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Armut Posası</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">650 kg</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">1650 TL</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">2024-06-05</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">İç Anadolu Organik</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/30 dark:text-primary">Tamamlandı</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FirmaSatisGecmisi;
