import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FrmNavbar from '../../components/frmnavbar';

function Ciftlikler() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Çiftlik ID'lerini oluştur (gerçek uygulamada API'den gelecek)
  const getFarmId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/\s+/g, '-');
  };
  
  const allFarms = [
    { name: 'Güney Çiftliği', city: 'Antalya' },
    { name: 'Toros Çiftliği', city: 'Mersin' },
    { name: 'Çukurova Çiftliği', city: 'Adana' },
    { name: 'Güneydoğu Çiftliği', city: 'Gaziantep' },
    { name: 'Amanos Çiftliği', city: 'Hatay' },
    { name: 'Dulkadiroğlu Çiftliği', city: 'Kahramanmaraş' },
    { name: 'Akdeniz Çiftliği', city: 'Mersin' },
    { name: 'Ege Çiftliği', city: 'İzmir' },
    { name: 'Marmara Çiftliği', city: 'Bursa' },
    { name: 'Karadeniz Çiftliği', city: 'Trabzon' },
    { name: 'İç Anadolu Çiftliği', city: 'Konya' },
    { name: 'Doğu Anadolu Çiftliği', city: 'Erzurum' },
  ];

  const totalPages = Math.ceil(allFarms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFarms = allFarms.slice(startIndex, endIndex);

  // Sayfalama mantığı: Hangi sayfa numaralarını göstereceğimizi hesapla
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      // 5 veya daha az sayfa varsa hepsini göster
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // İlk sayfa her zaman göster
    pages.push(1);

    // Mevcut sayfanın etrafındaki sayfaları hesapla
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Eğer başlangıç sayfası 1'den uzaksa, "..." ekle
    if (startPage > 2) {
      pages.push('...');
    }

    // Mevcut sayfa ve etrafındaki sayfaları ekle
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Eğer bitiş sayfası son sayfadan uzaksa, "..." ekle
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Son sayfa her zaman göster (1'den farklıysa)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Çiftlikler</h1>
          </div>
          <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Harita Bölümü */}
            <div className="relative flex-1 rounded-x overflow-hidden min-h-[500px] lg:min-h-[600px] shadow-lg">
              {/* Harita Arka Plan */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYgQs_lAQKoYnnEIuAc0BN0yaYgXJEymLr8yhyWbLN_-yHWk1TK_4MEZorMlaXBNDRrCTnbyQJof6ksiutopYlzj9L3fjINxeZiIbJ25jTvYAkmW8NGxO1NvGOxXcgFbFhf-9v_yW-ftZWtU3wV4TmPZzUiS4xFN-mIv1daWY5UWW_H1vF8TRIJ2NIHl87ybYO3zV9suDaK0zHVdF_RUHXaFTpTvMBMK9PIMlipkBI2ImJ0jOvPIq5lQf3JGXvbSr4NNIwGJN4TXI")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Harita İçerik */}
              <div className="relative flex h-full flex-col p-4 sm:p-6">
                {/* Arama Kutusu */}
                <label className="relative z-20">
                  <span className="sr-only">Çiftlik ara</span>
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="material-symbols-outlined text-white/80">search</span>
                  </span>
                  <input
                    type="text"
                    className="form-input block w-full max-w-sm rounded-full border-transparent bg-white/20 backdrop-blur-sm py-3 pl-12 pr-4 text-white placeholder:text-white/80 focus:border-primary focus:ring-primary focus:outline-none transition-all"
                    placeholder="Haritada çiftlik ara"
                    defaultValue=""
                  />
                </label>

                {/* Harita Kontrolleri (Zoom ve Konum) */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 z-20">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className="flex size-10 items-center justify-center rounded-t-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md transition-colors"
                      aria-label="Yakınlaştır"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                    <button
                      type="button"
                      className="flex size-10 items-center justify-center rounded-b-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md transition-colors"
                      aria-label="Uzaklaştır"
                    >
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex size-10 items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md transition-colors"
                    aria-label="Konumumu göster"
                  >
                    <span className="material-symbols-outlined text-lg">navigation</span>
                  </button>
                </div>

                {/* Çiftlik Detay Kartı */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-full max-w-xs rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 z-20">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-12 sm:size-14 flex-shrink-0"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB4TCRb0xWP5UBMjpvg-1ETr7_Ew5aiHnTc7L7NEClMq0pNWjel0oYwh0Fvm6hRilTiHw7HGRPQXO2G8v_TXqieXs5I1F35uFX-nbidtVjcmSYdMb77U9jR__JBPZTxeOrU3Bu4-ISMxdSoh5v0qj045LUaB6lRl_5KMU_WPq2ZPsMvckfzJQtiDh3xMmzl039g0pVnl_L3C-OZVwVfGPx22wZmCOTNs389hs9ChILoFnBHVKjef5ziDcBlnUuGD0Z7H4EYMzy5fKc")',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">Toros Çiftliği</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Mersin</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Organik Sertifikalı
                          </span>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            İyi Tarım
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Toros Çiftliği, Mersin, Türkiye')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <span className="material-symbols-outlined text-sm">map</span>
                            <span className="hidden sm:inline">Haritada Göster</span>
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/ciftlik/detay/toros-ciftligi');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            <span className="hidden sm:inline">Detay</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mevcut Ürünler */}
                  <div className="mt-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Mevcut Ürünler</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2.5">
                      {[
                        { name: 'Domates', qty: '20 ton' },
                        { name: 'Salatalık', qty: '15 ton' },
                        { name: 'Zeytin', qty: '5 ton' },
                        { name: 'Portakal', qty: '30 ton' },
                        { name: 'Limon', qty: '10 ton' },
                      ].map((item, idx) => (
                        <div className="group relative" key={idx}>
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-full shadow-sm group-hover:shadow-md transition-shadow"
                            style={{
                              backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc")',
                            }}
                          />
                          <div className="mt-1.5 text-center">
                            <h4 className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{item.name}</h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{item.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Yan Panel - Filtreler ve Çiftlik Listesi */}
            <div className="w-full lg:w-96 shrink-0 z-10 flex flex-col gap-6">
              {/* Filtreler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Filtreler</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                  >
                    Konum
                    <span className="material-symbols-outlined text-base">expand_more</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                  >
                    Ürün Türü
                    <span className="material-symbols-outlined text-base">expand_more</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                  >
                    Sertifikalar
                    <span className="material-symbols-outlined text-base">expand_more</span>
                  </button>
                </div>
              </div>

              {/* Çiftlik Listesi */}
              <div className="flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Çiftlik Listesi</h3>
                <div className="space-y-2 flex-1 mb-4">
                  {currentFarms.map((farm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 sm:gap-4 rounded-lg p-3 transition-colors duration-200 bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div
                        onClick={() => navigate(`/ciftlik/detay/${getFarmId(farm.name)}`)}
                        className="bg-center bg-no-repeat aspect-video bg-cover rounded h-14 w-24 flex-shrink-0 cursor-pointer"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBU2XUogdPi89L37V-OwqoOzjDWEgn5l7qKFJYifO0zvL7SN2KuQepW-sD8ntTejLyJLl9AvpVo0EfR6Eo41F2rls0XLv-J9ltixWEBGezoDE4HU9TJGt5tSRO4hx7CKmmaQU0uHSjI51D7G7GFQBfSIvLgbVtzNkqJgVjqdnIVNqwuH2iORgWT5rAVNLX35TfTsVIc80l87KpdPJC0a0L4KCJkucHK8fRGaGQ1KYh481AxML62ANtxe7K_uDRRu60OLDo7tncWmp0")',
                        }}
                      />
                      <div 
                        onClick={() => navigate(`/ciftlik/detay/${getFarmId(farm.name)}`)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{farm.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{farm.city}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${farm.name}, ${farm.city}, Türkiye`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Haritada Göster"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">map</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ciftlik/detay/${getFarmId(farm.name)}`);
                          }}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Detay Sayfasına Git"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sayfalama */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Önceki Sayfa Butonu */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>

                  {/* Sayfa Numaraları */}
                  {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Sonraki Sayfa Butonu */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Ciftlikler;

