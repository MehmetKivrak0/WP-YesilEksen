import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ciftciService } from '../services/ciftciService';

interface CftNavbarProps {
  logoUrl?: string;
  farmName?: string;
}

// URL normalize fonksiyonu - /uploads/ path'lerini /api/documents/file/ ile değiştir
const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === '') return null;
  
  // Eğer URL /uploads/ içeriyorsa, /api/documents/file/ ile değiştir
  if (url.includes('/uploads/')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const pathAfterUploads = url.substring(uploadsIndex + '/uploads/'.length);
      return `${baseUrl}/api/documents/file/${pathAfterUploads}`;
    }
  }
  
  // Eğer tam URL ise ve domain normalize edilmesi gerekiyorsa
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const apiUrlObj = new URL(apiBaseUrl);
      const urlObj = new URL(url);
      
      // Eğer path /uploads/ içeriyorsa, /api/documents/file/ ile değiştir
      let path = urlObj.pathname;
      if (path.includes('/uploads/')) {
        const uploadsIndex = path.indexOf('/uploads/');
        const pathAfterUploads = path.substring(uploadsIndex + '/uploads/'.length);
        path = `/api/documents/file/${pathAfterUploads}`;
      }
      
      return `${apiUrlObj.protocol}//${apiUrlObj.host}${path}${urlObj.search}`;
    } catch (e) {
      // URL parse edilemezse olduğu gibi döndür
      return url;
    }
  }
  
  return url;
};

function CftNavbar({ logoUrl: propLogoUrl, farmName: propFarmName }: CftNavbarProps = {}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(propLogoUrl);
  const [farmName, setFarmName] = useState<string | undefined>(propFarmName);
  const navigate = useNavigate();
  const location = useLocation();

  const kullaniciTipi = location.pathname.startsWith('/ciftlik') || location.pathname.startsWith('/atiklar/ekle') ? 'ciftci' : 'firma';

  // Çiftlik profilini yükle (sadece çiftçi sayfalarında ve prop geçilmemişse)
  useEffect(() => {
    // Eğer prop geçilmişse, prop'u kullan
    if (propLogoUrl !== undefined) {
      setLogoUrl(propLogoUrl);
    }
    if (propFarmName !== undefined) {
      setFarmName(propFarmName);
    }

    // Eğer çiftçi sayfasındaysak ve prop geçilmemişse, API'den çek
    if (kullaniciTipi === 'ciftci' && propLogoUrl === undefined && propFarmName === undefined) {
      const fetchProfile = async () => {
        try {
          const response = await ciftciService.getCiftlikProfil();
          if (response.success && response.profil) {
            const profil = response.profil;
            
            // logo_url yoksa website'den al
            let finalLogoUrl = profil.logo_url || profil.website;
            
            // Logo URL'lerini normalize et
            if (finalLogoUrl) {
              finalLogoUrl = normalizeImageUrl(finalLogoUrl) || finalLogoUrl;
            }
            
            setLogoUrl(finalLogoUrl);
            setFarmName(profil.ad);
          }
        } catch (error) {
          console.error('Çiftlik profili yüklenemedi:', error);
          // Hata durumunda sessizce devam et
        }
      };
      
      fetchProfile();
    }
  }, [kullaniciTipi, propLogoUrl, propFarmName]);

  // Logo URL değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  // Bildirimler - gerçek uygulamada API'den gelecek
  const [bildirimler, setBildirimler] = useState([
    {
      id: 1,
      baslik: 'Yeni Ürün Eklendi',
      mesaj: 'Mısır Sapı ürünü kataloğa eklendi',
      tarih: '2 saat önce',
      okundu: false,
      tip: 'urun'
    },
    {
      id: 2,
      baslik: 'Sipariş Onaylandı',
      mesaj: 'Satın alma talebiniz onaylandı',
      tarih: '5 saat önce',
      okundu: false,
      tip: 'siparis'
    },
    {
      id: 3,
      baslik: 'Yeni Çiftlik Eklendi',
      mesaj: 'Toros Çiftliği platforma katıldı',
      tarih: '1 gün önce',
      okundu: true,
      tip: 'ciftlik'
    }
  ]);

  const okunmamisSayisi = bildirimler.filter(b => !b.okundu).length;

  const handleTumunuTemizle = () => {
    // Gerçek uygulamada API çağrısı yapılacak
    setBildirimler([]);
    setIsNotificationMenuOpen(false);
  };

  const handleBildirimSil = (id: number) => {
    // Gerçek uygulamada API çağrısı yapılacak
    setBildirimler(prev => prev.filter(b => b.id !== id));
  };

  // Çiftçi/Firma bilgileri - prop'tan veya varsayılan değer
  const kullaniciAdi = farmName || 'Çiftlik Adı';

  const handleLogout = () => {
    // Çıkış yapma işlemi
    setIsProfileMenuOpen(false);
    navigate('/giris');
  };

  // Aktif link kontrolü
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2 text-xl font-bold text-content-light dark:text-content-dark" to={kullaniciTipi === 'ciftci' ? '/ciftlik/panel' : '/firma/panel'}>
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
              </svg>
              Yeşil-Eksen
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {kullaniciTipi === 'ciftci' ? (
                <>
                  {!isActive('/ciftlik/panel') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/ciftlik/panel"
                    >
                      Panel
                    </Link>
                  )}
                  {!isActive('/ciftlik/urunlerim') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/ciftlik/urunlerim"
                    >
                      Ürünlerim
                    </Link>
                  )}
                  {!isActive('/atiklar/ekle') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/atiklar/ekle"
                    >
                      Atık Ekle
                    </Link>
                  )}
                  {!isActive('/ciftlik/urun-durum') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/ciftlik/urun-durum"
                    >
                      Ürün Durumu
                    </Link>
                  )}
                  {!isActive('/ciftlik/satis-gecmisi') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/ciftlik/satis-gecmisi"
                    >
                      Satış Geçmişi
                    </Link>
                  )}
                </>
              ) : (
                <>
                  {!isActive('/firma/panel') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/firma/panel"
                    >
                      Panel
                    </Link>
                  )}
                  {!isActive('/atiklar') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/atiklar"
                    >
                      Ürünler
                    </Link>
                  )}
                  {!isActive('/firma/satis-gecmisi') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/firma/satis-gecmisi"
                    >
                      Satın Alma Geçmişi
                    </Link>
                  )}
                  {!isActive('/ciftlikler') && (
                    <Link 
                      className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                      to="/ciftlikler"
                    >
                      Çiftlikler
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
              <input className="w-full max-w-xs pl-10 pr-4 py-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-subtle-light dark:placeholder:text-subtle-dark" placeholder="Ara..." type="text" />
            </div>
            <div
              className="relative"
              onMouseEnter={() => setIsNotificationMenuOpen(true)}
              onMouseLeave={() => setIsNotificationMenuOpen(false)}
            >
              <button 
                className="p-2 rounded-full bg-white/20 dark:bg-white/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors relative"
                type="button"
                onClick={() => setIsNotificationMenuOpen((prev) => !prev)}
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">notifications</span>
                {okunmamisSayisi > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </button>
              {isNotificationMenuOpen && (
                <div 
                  className="absolute right-0 top-full pt-1 z-[100] w-80"
                  onMouseEnter={() => setIsNotificationMenuOpen(true)}
                  onMouseLeave={() => setIsNotificationMenuOpen(false)}
                >
                  <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg pointer-events-auto max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark sticky top-0 bg-background-light dark:bg-background-dark">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-content-light dark:text-content-dark">Bildirimler</h3>
                        {okunmamisSayisi > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 dark:bg-primary/30 text-primary text-xs font-medium">
                            {okunmamisSayisi} yeni
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="py-2">
                      {bildirimler.length > 0 ? (
                        bildirimler.map((bildirim) => (
                          <div
                            key={bildirim.id}
                            className={`px-4 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-b border-border-light/50 dark:border-border-dark/50 ${
                              !bildirim.okundu ? 'bg-primary/5 dark:bg-primary/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !bildirim.okundu ? 'bg-primary' : 'bg-transparent'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-content-light dark:text-content-dark mb-0.5">
                                  {bildirim.baslik}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2">
                                  {bildirim.mesaj}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                  {bildirim.tarih}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBildirimSil(bildirim.id);
                                }}
                                className="p-1 hover:bg-primary/10 dark:hover:bg-primary/20 rounded transition-colors flex-shrink-0"
                                type="button"
                                title="Sil"
                              >
                                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">close</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-4xl mb-2 block">notifications_none</span>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">Bildirim yok</p>
                        </div>
                      )}
                    </div>
                    {bildirimler.length > 0 && (
                      <div className="px-4 py-2 border-t border-border-light dark:border-border-dark">
                        <button 
                          onClick={handleTumunuTemizle}
                          className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center justify-center gap-1"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">delete_sweep</span>
                          Tümünü Temizle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className="relative"
              onMouseEnter={() => setIsProfileMenuOpen(true)}
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center overflow-hidden">
                  {logoUrl && !logoError ? (
                    <img 
                      src={logoUrl} 
                      alt={kullaniciAdi}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={() => {
                        // Resim yüklenemezse icon göster
                        setLogoError(true);
                      }}
                    />
                  ) : (
                    <span className={`material-symbols-outlined text-primary text-base ${kullaniciTipi === 'ciftci' ? 'agriculture' : 'business'}`}></span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-content-light dark:text-content-dark">{kullaniciAdi}</span>
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">expand_more</span>
              </button>
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 top-full pt-1 z-[100] w-56"
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg py-2 pointer-events-auto">
                    <div className="px-4 py-2 border-b border-border-light dark:border-border-dark pointer-events-auto">
                      <p className="text-sm font-semibold text-content-light dark:text-content-dark">{kullaniciAdi}</p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">{kullaniciTipi === 'ciftci' ? 'Çiftlik Hesabı' : 'Firma Hesabı'}</p>
                    </div>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer pointer-events-auto"
                      to={kullaniciTipi === 'ciftci' ? '/ciftlik/panel' : '/firma/panel'}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-2">dashboard</span>
                      Panel
                    </Link>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer pointer-events-auto"
                      to={kullaniciTipi === 'ciftci' ? '/ciftlik/profil' : '/firma/profil'}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-2">account_circle</span>
                      Profil
                    </Link>
                    <div className="border-t border-border-light dark:border-border-dark my-1"></div>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer pointer-events-auto"
                      onClick={handleLogout}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-2">logout</span>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default CftNavbar;

