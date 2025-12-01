import FrmNavbar from '../../components/frmnavbar';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import TomTomMap from '../../components/TomTomMap';
import { publicFirmaService, type PublicFirma, type Sektor } from '../../services/firmaService';

interface MapFirma {
  id: string;
  ad: string;
  konum: string;
  sektor: string;
  telefon?: string;
  email?: string;
  dogrulandi?: boolean;
  lat?: number;
  lng?: number;
}

function Firmalar() {
  const navigate = useNavigate();
  const [selectedFirma, setSelectedFirma] = useState<MapFirma | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [sektorFilter, setSektorFilter] = useState('');
  
  // API state
  const [firmalar, setFirmalar] = useState<PublicFirma[]>([]);
  const [sektorler, setSektorler] = useState<Sektor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });

  // Dropdown states
  const [showSektorDropdown, setShowSektorDropdown] = useState(false);
  const [showKonumDropdown, setShowKonumDropdown] = useState(false);

  // Firma ID oluştur
  const getFirmaId = (id: string) => {
    return id;
  };

  // Firmaları yükle
  const loadFirmalar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicFirmaService.getFirmalar({
        search: searchQuery || undefined,
        sektor: sektorFilter || undefined,
        konum: locationSearch || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setFirmalar(response.firmalar);
        setPagination(response.pagination);
      } else {
        setError('Firmalar yüklenemedi');
      }
    } catch (err: any) {
      console.error('Firmalar yükleme hatası:', err);
      setError(err.response?.data?.message || 'Firmalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sektorFilter, locationSearch, pagination.page, pagination.limit]);

  // Sektörleri yükle
  const loadSektorler = useCallback(async () => {
    try {
      const response = await publicFirmaService.getSektorler();
      if (response.success) {
        setSektorler(response.sektorler);
      }
    } catch (err) {
      console.error('Sektörler yükleme hatası:', err);
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    loadFirmalar();
    loadSektorler();
  }, []);

  // Filtre değiştiğinde yeniden yükle
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFirmalar();
    }, 300); // Debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery, sektorFilter, locationSearch]);

  // Firma seçimi
  const handleFirmaSelect = useCallback((firma: MapFirma) => {
    setSelectedFirma(firma);
  }, []);

  // Harita için firma verilerini dönüştür
  const mapFirmalar: MapFirma[] = firmalar.map(f => ({
    id: f.id,
    ad: f.ad,
    konum: f.konum,
    sektor: f.sektor,
    telefon: f.telefon,
    email: f.email,
    dogrulandi: f.dogrulandi
  }));

  // Benzersiz konumları çıkar
  const uniqueKonumlar = [...new Set(firmalar.map(f => f.konum))].filter(Boolean).sort();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Harita Bölümü */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-background-dark dark:text-background-light">Firmalar</h1>
            <div className="relative rounded-xl overflow-hidden h-96 lg:h-[calc(100vh-200px)] shadow-lg">
              {/* Konum Arama */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-background-dark/50">search</span>
                  <input
                    className="form-input w-full pl-10 pr-4 py-2.5 rounded-lg border-none bg-background-light/95 dark:bg-background-dark/90 text-background-dark dark:text-background-light placeholder:text-background-dark/50 dark:placeholder:text-background-light/50 focus:ring-2 focus:ring-primary shadow-lg backdrop-blur-sm"
                    placeholder="Haritada konum ara..."
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* TomTom Harita */}
              <TomTomMap
                firmalar={mapFirmalar}
                selectedFirma={selectedFirma}
                onFirmaSelect={handleFirmaSelect}
                className="h-full"
              />

              {/* Seçili Firma Kartı */}
              {selectedFirma && (
                <div 
                  className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-background-light dark:bg-background-dark rounded-xl shadow-lg p-3 sm:p-4 max-w-xs cursor-pointer hover:shadow-xl transition-shadow z-10"
                  onClick={() => navigate(`/firma/detay/${getFirmaId(selectedFirma.id)}`)}
                >
                  <div className="flex justify-between items-start mb-2 gap-1.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-background-dark dark:text-background-light truncate">{selectedFirma.ad}</h3>
                      <p className="text-xs text-background-dark/70 dark:text-background-light/70 truncate">{selectedFirma.konum}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/firma/detay/${getFirmaId(selectedFirma.id)}`);
                        }}
                        className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Detay Sayfasına Git"
                      >
                        <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFirma(null);
                        }}
                        className="p-0.5 text-background-dark/60 dark:text-background-light/60 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {selectedFirma.telefon && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">phone</span>
                        <span className="text-xs text-background-dark dark:text-background-light truncate">{selectedFirma.telefon}</span>
                      </div>
                    )}
                    {selectedFirma.email && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">mail</span>
                        <span className="text-xs text-background-dark dark:text-background-light truncate">{selectedFirma.email}</span>
                      </div>
                    )}
                    {selectedFirma.dogrulandi && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">verified</span>
                        <span className="text-xs font-medium text-primary">Doğrulanmış Firma</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">category</span>
                      <span className="text-xs text-background-dark dark:text-background-light">{selectedFirma.sektor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Harita Açıklaması */}
            <div className="flex items-center gap-4 text-xs text-subtle-light dark:text-subtle-dark">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Doğrulanmış</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/60 rounded-full"></div>
                <span>Kayıtlı</span>
              </div>
            </div>
          </div>

          {/* Firma Listesi Bölümü */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-background-dark dark:text-background-light">Kayıtlı Firmalar</h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                {loading ? 'Yükleniyor...' : `${pagination.total} firma listeleniyor`}
              </p>
            </div>

            {/* Arama */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-background-dark/40 dark:text-background-light/40">search</span>
              <input
                className="form-input w-full pl-10 pr-4 py-2.5 rounded-lg border-primary/20 dark:border-primary/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary text-background-dark dark:text-background-light placeholder:text-background-dark/40 dark:placeholder:text-background-light/40"
                placeholder="Firma ara..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-2">
              {/* Sektör Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowSektorDropdown(!showSektorDropdown);
                    setShowKonumDropdown(false);
                  }}
                  className={`flex h-8 sm:h-9 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 rounded-lg px-2 sm:px-3 transition-colors ${
                    sektorFilter 
                      ? 'bg-primary text-white' 
                      : 'bg-primary/20 dark:bg-primary/30 hover:bg-primary/30 dark:hover:bg-primary/40'
                  }`}
                >
                  <p className={`text-xs sm:text-sm font-medium ${sektorFilter ? 'text-white' : 'text-background-dark dark:text-background-light'}`}>
                    {sektorFilter || 'Sektör'}
                  </p>
                  <span className={`material-symbols-outlined text-sm sm:text-base ${sektorFilter ? 'text-white' : 'text-background-dark dark:text-background-light'}`}>
                    expand_more
                  </span>
                </button>
                {showSektorDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSektorFilter('');
                        setShowSektorDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 text-background-dark dark:text-background-light"
                    >
                      Tümü
                    </button>
                    {sektorler.map(sektor => (
                      <button
                        key={sektor.id}
                        onClick={() => {
                          setSektorFilter(sektor.ad);
                          setShowSektorDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 ${
                          sektorFilter === sektor.ad ? 'bg-primary/20 text-primary' : 'text-background-dark dark:text-background-light'
                        }`}
                      >
                        {sektor.ad}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Konum Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowKonumDropdown(!showKonumDropdown);
                    setShowSektorDropdown(false);
                  }}
                  className={`flex h-8 sm:h-9 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 rounded-lg px-2 sm:px-3 transition-colors ${
                    locationSearch 
                      ? 'bg-primary text-white' 
                      : 'bg-primary/20 dark:bg-primary/30 hover:bg-primary/30 dark:hover:bg-primary/40'
                  }`}
                >
                  <p className={`text-xs sm:text-sm font-medium ${locationSearch ? 'text-white' : 'text-background-dark dark:text-background-light'}`}>
                    {locationSearch || 'Konum'}
                  </p>
                  <span className={`material-symbols-outlined text-sm sm:text-base ${locationSearch ? 'text-white' : 'text-background-dark dark:text-background-light'}`}>
                    expand_more
                  </span>
                </button>
                {showKonumDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setLocationSearch('');
                        setShowKonumDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 text-background-dark dark:text-background-light"
                    >
                      Tümü
                    </button>
                    {uniqueKonumlar.map(konum => (
                      <button
                        key={konum}
                        onClick={() => {
                          setLocationSearch(konum);
                          setShowKonumDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 ${
                          locationSearch === konum ? 'bg-primary/20 text-primary' : 'text-background-dark dark:text-background-light'
                        }`}
                      >
                        {konum}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Temizle butonu */}
              {(searchQuery || locationSearch || sektorFilter) && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setLocationSearch('');
                    setSektorFilter('');
                  }}
                  className="flex h-8 sm:h-9 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 px-2 sm:px-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                  <p className="text-red-500 text-xs sm:text-sm font-medium">Temizle</p>
                </button>
              )}
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <button
                  onClick={loadFirmalar}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
                >
                  Tekrar dene
                </button>
              </div>
            )}

            {/* Firma Tablosu */}
            <div className="rounded-xl border border-primary/20 dark:border-primary/10 bg-background-light dark:bg-background-dark/50 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Firmalar yükleniyor...</p>
                  </div>
                </div>
              ) : (
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
                    {firmalar.map((firma, index) => (
                      <tr 
                        key={firma.id}
                        className={`
                          ${index !== firmalar.length - 1 ? 'border-b border-primary/10 dark:border-primary/20' : ''}
                          hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer
                          ${selectedFirma?.id === firma.id ? 'bg-primary/10 dark:bg-primary/20' : ''}
                        `}
                        onClick={() => {
                          setSelectedFirma({
                            id: firma.id,
                            ad: firma.ad,
                            konum: firma.konum,
                            sektor: firma.sektor,
                            telefon: firma.telefon,
                            email: firma.email,
                            dogrulandi: firma.dogrulandi
                          });
                        }}
                      >
                        <th className="px-3 sm:px-4 py-4 font-medium text-background-dark dark:text-background-light max-w-[150px] sm:max-w-none" scope="row">
                          <span className="truncate block">{firma.ad}</span>
                        </th>
                        <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80 hidden sm:table-cell">{firma.sektor}</td>
                        <td className="px-3 sm:px-4 py-4 text-background-dark/80 dark:text-background-light/80">{firma.konum}</td>
                        <td className="px-3 sm:px-4 py-4 text-center hidden md:table-cell">
                          <div className="flex justify-center">
                            <div className="w-5 h-5 rounded-md border-primary/30 bg-background-light dark:bg-background-dark flex items-center justify-center">
                              {firma.dogrulandi && (
                                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFirma({
                                  id: firma.id,
                                  ad: firma.ad,
                                  konum: firma.konum,
                                  sektor: firma.sektor,
                                  telefon: firma.telefon,
                                  email: firma.email,
                                  dogrulandi: firma.dogrulandi
                                });
                              }}
                              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                                selectedFirma?.id === firma.id 
                                  ? 'text-white bg-blue-500 hover:bg-blue-600' 
                                  : 'text-white bg-primary hover:bg-primary/90'
                              }`}
                              title="Haritada Göster"
                            >
                              <span className="material-symbols-outlined text-sm sm:text-base">location_on</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/firma/detay/${getFirmaId(firma.id)}`);
                              }}
                              className="p-1.5 sm:p-2 text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Detay Sayfasına Git"
                            >
                              <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {firmalar.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-subtle-light dark:text-subtle-dark">
                          <span className="material-symbols-outlined text-3xl mb-2 block">search_off</span>
                          {searchQuery || sektorFilter || locationSearch 
                            ? 'Arama kriterlerine uygun firma bulunamadı.'
                            : 'Henüz kayıtlı firma bulunmamaktadır.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm text-subtle-light dark:text-subtle-dark">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Click outside to close dropdowns */}
      {(showSektorDropdown || showKonumDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowSektorDropdown(false);
            setShowKonumDropdown(false);
          }}
        />
      )}
    </div>
  );
}

export default Firmalar;
