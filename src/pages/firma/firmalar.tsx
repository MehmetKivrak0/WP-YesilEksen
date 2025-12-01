import FrmNavbar from '../../components/frmnavbar';
import { useNavigate } from 'react-router-dom';

function Firmalar() {
  const navigate = useNavigate();
  
  // Firma ID'lerini oluştur (gerçek uygulamada API'den gelecek)
  const getFirmaId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/\s+/g, '-')
      .replace(/\./g, '')
      .replace(/a\.ş\./g, 'as')
      .replace(/ltd\./g, 'ltd');
  };
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-background-dark dark:text-background-light">Firmalar</h1>
            <div className="relative rounded-xl overflow-hidden h-96 lg:h-[calc(100vh-200px)] shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDV1QlBxRl9bhxtMQBzOMGyuaE_ylM__V26qSvD186fQd3iSjTFkXkTKTsciVRWGzQGNaUOegtEIlRQfXorUX2j8FHgkre6gRd5-ESWGHXzsf0ypWmuOcQLS5MM1YinSqNBIQCLwZAe4P1rUkPVOyr0PfEz2Dz6lFfF2GoW_JKooq2xpjpoR-6aWX2EI70g_0Op3gJQ8cinnNwI-9_QI4e1jD5yKxssjouPAQCM7p6A5c8c69LKKJcBh0T4ZFiHAjrI5F-dT7OHE9E")',
                }}
              ></div>
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute inset-0 p-4 sm:p-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-background-dark/50">search</span>
                  <input
                    className="form-input w-full pl-10 pr-4 py-2.5 rounded-lg border-none bg-background-light/90 dark:bg-background-dark/80 text-background-dark dark:text-background-light placeholder:text-background-dark/50 dark:placeholder:text-background-light/50 focus:ring-2 focus:ring-primary"
                    placeholder="Konum ara"
                    type="text"
                  />
                </div>
                <div 
                  className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-background-light dark:bg-background-dark rounded-xl shadow-lg p-2.5 sm:p-3 max-w-xs cursor-pointer hover:shadow-xl transition-shadow z-10"
                  onClick={() => navigate(`/firma/detay/${getFirmaId('BioEnerji A.Ş.')}`)}
                >
                  <div className="flex justify-between items-start mb-2 gap-1.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-background-dark dark:text-background-light truncate">BioEnerji A.Ş.</h3>
                      <p className="text-xs text-background-dark/70 dark:text-background-light/70 truncate">Çankaya, Ankara</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('BioEnerji A.Ş., Çankaya, Ankara, Türkiye')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 sm:p-1.5 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Haritada Göster"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">map</span>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/firma/detay/${getFirmaId('BioEnerji A.Ş.')}`);
                        }}
                        className="p-1 sm:p-1.5 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Detay Sayfasına Git"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">arrow_forward</span>
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-0.5 text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">phone</span>
                      <span className="text-xs text-background-dark dark:text-background-light truncate">+90 312 123 45 67</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">mail</span>
                      <span className="text-xs text-background-dark dark:text-background-light truncate">info@bioenerji.com.tr</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">verified</span>
                      <span className="text-xs font-medium text-primary">Doğrulanmış Firma</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-background-dark dark:text-background-light mb-1 text-xs sm:text-sm">Satın Alım Geçmişi</h4>
                      <div className="border-t border-primary/20 dark:border-primary/30 pt-1.5 space-y-1 text-xs max-h-20 sm:max-h-24 overflow-y-auto">
                        <div className="flex justify-between gap-2">
                          <span className="text-background-dark/80 dark:text-background-light/80 truncate">Mısır Sapı - 10 Ton</span>
                          <span className="text-background-dark/60 dark:text-background-light/60 flex-shrink-0">15.03.2024</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-background-dark/80 dark:text-background-light/80 truncate">Buğday Samanı - 20 Ton</span>
                          <span className="text-background-dark/60 dark:text-background-light/60 flex-shrink-0">02.02.2024</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-background-dark/80 dark:text-background-light/80 truncate">Ayçiçeği Sapı - 5 Ton</span>
                          <span className="text-background-dark/60 dark:text-background-light/60 flex-shrink-0">10.12.2023</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-background-dark dark:text-background-light">Kayıtlı Firmalar</h2>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-background-dark/40 dark:text-background-light/40">search</span>
              <input
                className="form-input w-full pl-10 pr-4 py-2.5 rounded-lg border-primary/20 dark:border-primary/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary text-background-dark dark:text-background-light placeholder:text-background-dark/40 dark:placeholder:text-background-light/40"
                placeholder="Firma ara"
                type="text"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex h-8 sm:h-9 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 rounded-lg bg-primary/20 dark:bg-primary/30 hover:bg-primary/30 dark:hover:bg-primary/40 px-2 sm:px-3 transition-colors">
                <p className="text-background-dark dark:text-background-light text-xs sm:text-sm font-medium">Sektör</p>
                <span className="material-symbols-outlined text-background-dark dark:text-background-light text-sm sm:text-base">expand_more</span>
              </button>
              <button className="flex h-8 sm:h-9 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 rounded-lg bg-primary/20 dark:bg-primary/30 hover:bg-primary/30 dark:hover:bg-primary/40 px-2 sm:px-3 transition-colors">
                <p className="text-background-dark dark:text-background-light text-xs sm:text-sm font-medium">Konum</p>
                <span className="material-symbols-outlined text-background-dark dark:text-background-light text-sm sm:text-base">expand_more</span>
              </button>
              <button className="flex h-8 sm:h-9 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 rounded-lg bg-primary/20 dark:bg-primary/30 hover:bg-primary/30 dark:hover:bg-primary/40 px-2 sm:px-3 transition-colors">
                <p className="text-background-dark dark:text-background-light text-xs sm:text-sm font-medium">Sertifikalar</p>
                <span className="material-symbols-outlined text-background-dark dark:text-background-light text-sm sm:text-base">expand_more</span>
              </button>
            </div>
            <div className="rounded-xl border border-primary/20 dark:border-primary/10 bg-background-light dark:bg-background-dark/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-background-dark/70 dark:text-background-light/70 uppercase bg-primary/10 dark:bg-primary/20">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 font-semibold" scope="col">Firma Adı</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold hidden sm:table-cell" scope="col">Sektör</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold" scope="col">Konum</th>
                    <th className="px-3 sm:px-4 py-3 text-center font-semibold hidden md:table-cell" scope="col">Doğrulanmış</th>
                    <th className="px-3 sm:px-4 py-3 text-center font-semibold" scope="col">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    className="border-b border-primary/10 dark:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
                    onClick={() => navigate(`/firma/detay/${getFirmaId('BioEnerji A.Ş.')}`)}
                  >
                    <th className="px-3 sm:px-4 py-4 font-medium text-background-dark dark:text-background-light max-w-[150px] sm:max-w-none" scope="row">
                      <span className="truncate block">BioEnerji A.Ş.</span>
                    </th>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80 hidden sm:table-cell">Enerji</td>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80">Ankara</td>
                    <td className="px-3 sm:px-4 py-4 text-center hidden md:table-cell">
                      <div className="flex justify-center">
                        <div className="w-5 h-5 rounded-md border-primary/30 bg-background-light dark:bg-background-dark flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('BioEnerji A.Ş., Ankara, Türkiye')}`}
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
                            navigate(`/firma/detay/${getFirmaId('BioEnerji A.Ş.')}`);
                          }}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Detay Sayfasına Git"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr 
                    className="border-b border-primary/10 dark:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
                    onClick={() => navigate(`/firma/detay/${getFirmaId('Organik Gübre Sanayi')}`)}
                  >
                    <th className="px-3 sm:px-4 py-4 font-medium text-background-dark dark:text-background-light max-w-[150px] sm:max-w-none" scope="row">
                      <span className="truncate block">Organik Gübre Sanayi</span>
                    </th>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80 hidden sm:table-cell">Tarım</td>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80">İzmir</td>
                    <td className="px-3 sm:px-4 py-4 text-center hidden md:table-cell">
                      <div className="flex justify-center">
                        <div className="w-5 h-5 rounded-md border-primary/30 bg-background-light dark:bg-background-dark flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Organik Gübre Sanayi, İzmir, Türkiye')}`}
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
                            navigate(`/firma/detay/${getFirmaId('Organik Gübre Sanayi')}`);
                          }}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Detay Sayfasına Git"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr 
                    className="border-b border-primary/10 dark:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
                    onClick={() => navigate(`/firma/detay/${getFirmaId('Sönmez Tekstil')}`)}
                  >
                    <th className="px-3 sm:px-4 py-4 font-medium text-background-dark dark:text-background-light max-w-[150px] sm:max-w-none" scope="row">
                      <span className="truncate block">Sönmez Tekstil</span>
                    </th>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80 hidden sm:table-cell">Tekstil</td>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80">Bursa</td>
                    <td className="px-3 sm:px-4 py-4 text-center hidden md:table-cell">
                      <div className="flex justify-center">
                        <div className="w-5 h-5 rounded-md border-primary/30 bg-background-light dark:bg-background-dark flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Sönmez Tekstil, Bursa, Türkiye')}`}
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
                            navigate(`/firma/detay/${getFirmaId('Sönmez Tekstil')}`);
                          }}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Detay Sayfasına Git"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr 
                    className="border-b border-primary/10 dark:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
                    onClick={() => navigate(`/firma/detay/${getFirmaId('Yeşil Yakıtlar Ltd.')}`)}
                  >
                    <th className="px-3 sm:px-4 py-4 font-medium text-background-dark dark:text-background-light max-w-[150px] sm:max-w-none" scope="row">
                      <span className="truncate block">Yeşil Yakıtlar Ltd.</span>
                    </th>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80 hidden sm:table-cell">Enerji</td>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80">Adana</td>
                    <td className="px-3 sm:px-4 py-4 text-center hidden md:table-cell">
                      <div className="flex justify-center">
                        <div className="w-5 h-5 rounded-md border-primary/30 bg-background-light dark:bg-background-dark flex items-center justify-center"></div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Yeşil Yakıtlar Ltd., Adana, Türkiye')}`}
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
                            navigate(`/firma/detay/${getFirmaId('Yeşil Yakıtlar Ltd.')}`);
                          }}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Detay Sayfasına Git"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr 
                    className="hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
                    onClick={() => navigate(`/firma/detay/${getFirmaId('Doğa Tarım Ürünleri')}`)}
                  >
                    <th className="px-3 sm:px-4 py-4 font-medium text-background-dark dark:text-background-light max-w-[150px] sm:max-w-none" scope="row">
                      <span className="truncate block">Doğa Tarım Ürünleri</span>
                    </th>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80 hidden sm:table-cell">Tarım</td>
                    <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80">Antalya</td>
                    <td className="px-3 sm:px-4 py-4 text-center hidden md:table-cell">
                      <div className="flex justify-center">
                        <div className="w-5 h-5 rounded-md border-primary/30 bg-background-light dark:bg-background-dark flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Doğa Tarım Ürünleri, Antalya, Türkiye')}`}
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
                            navigate(`/firma/detay/${getFirmaId('Doğa Tarım Ürünleri')}`);
                          }}
                          className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Detay Sayfasına Git"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Firmalar;
