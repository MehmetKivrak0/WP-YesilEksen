import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { firmaService } from '../services/firmaService';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

function FrmNavbar() {
  const { 
    notifications: bildirimler, 
    unreadCount: okunmamisSayisi,
    loading: notificationsLoading,
    markAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();
  const toast = useToast();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Firma bilgileri
  const [firmaAdi, setFirmaAdi] = useState('Firma');
  const [firmaFoto, setFirmaFoto] = useState<string | null>(null);

  // Firma bilgilerini yükle
  useEffect(() => {
    const loadFirmaBilgileri = async () => {
      try {
        const response = await firmaService.getProfile();
        console.log('🏢 Navbar firma bilgileri:', response);
        
        if (response.success && response.firma) {
          setFirmaAdi(response.firma.ad || 'Firma');
          
          const photoUrl = response.firma.profilFotoUrl;
          console.log('🖼️ Navbar fotoğraf URL:', photoUrl);
          
          if (photoUrl) {
            let finalUrl = '';
            if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
              finalUrl = photoUrl;
            } else if (photoUrl.startsWith('/')) {
              finalUrl = `http://localhost:5000${photoUrl}`;
            } else {
              finalUrl = `http://localhost:5000/api/documents/file/${photoUrl}`;
            }
            console.log('🖼️ Navbar final URL:', finalUrl);
            setFirmaFoto(finalUrl);
          }
        }
      } catch (error) {
        console.error('Firma bilgileri yüklenemedi:', error);
      }
    };
    loadFirmaBilgileri();
  }, []);

  // Bildirim tıklandığında okundu işaretle
  const handleBildirimClick = async (bildirim: any) => {
    if (!bildirim.okundu) {
      await markAsRead(bildirim.id);
    }
    
    // Eğer link varsa, o sayfaya git
    if (bildirim.link) {
      navigate(bildirim.link);
      setIsNotificationMenuOpen(false);
    }
  };

  const handleTumunuTemizle = async () => {
    try {
      await deleteAllNotifications();
      setIsNotificationMenuOpen(false);
      toast.success('Tüm bildirimler temizlendi');
    } catch (error) {
      toast.error('Bildirimler temizlenirken bir hata oluştu');
    }
  };

  const handleBildirimSil = async (id: string | number) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      toast.error('Bildirim silinirken bir hata oluştu');
    }
  };

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
            <Link className="flex items-center gap-2 text-xl font-bold text-content-light dark:text-content-dark" to="/firma/panel">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
              </svg>
              Yeşil-Eksen
            </Link>
            <nav className="hidden md:flex items-center gap-6">
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
              {!isActive('/firma/basvuru-durum') && (
                <Link 
                  className="text-sm font-medium transition-colors text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary"
                  to="/firma/basvuru-durum"
                >
                  Başvuru Durumu
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
                      {notificationsLoading ? (
                        <div className="px-4 py-8 text-center">
                          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-4xl mb-2 block animate-spin">sync</span>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">Yükleniyor...</p>
                        </div>
                      ) : bildirimler.length > 0 ? (
                        bildirimler.map((bildirim) => (
                          <div
                            key={bildirim.id}
                            onClick={() => handleBildirimClick(bildirim)}
                            className={`px-4 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-b border-border-light/50 dark:border-border-dark/50 cursor-pointer ${
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
                  {firmaFoto ? (
                    <img 
                      src={firmaFoto} 
                      alt={firmaAdi}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={() => {
                        console.error('❌ Navbar fotoğraf yüklenemedi:', firmaFoto);
                        setFirmaFoto(null);
                      }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-base">business</span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-content-light dark:text-content-dark">{firmaAdi}</span>
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-base">expand_more</span>
              </button>
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 top-full pt-1 z-[100] w-56"
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg py-2 pointer-events-auto">
                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark pointer-events-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {firmaFoto ? (
                            <img 
                              src={firmaFoto} 
                              alt={firmaAdi}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                              onError={() => setFirmaFoto(null)}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-primary text-lg">business</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-content-light dark:text-content-dark">{firmaAdi}</p>
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">Firma Hesabı</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer pointer-events-auto"
                      to="/firma/panel"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-2">dashboard</span>
                      Panel
                    </Link>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer pointer-events-auto"
                      to="/firma/profil"
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

export default FrmNavbar;

