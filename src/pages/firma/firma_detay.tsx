import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FrmNavbar from '../../components/frmnavbar';
import { publicFirmaService, type FirmaDetay } from '../../services/firmaService';
import TomTomMap from '../../components/TomTomMap';

function FirmaDetayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [firma, setFirma] = useState<FirmaDetay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firma verilerini yükle
  useEffect(() => {
    const loadFirma = async () => {
      if (!id) {
        setError('Firma ID\'si bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await publicFirmaService.getFirmaDetay(id);
        
        if (response.success) {
          setFirma(response.firma);
        } else {
          setError('Firma bilgileri yüklenemedi');
        }
      } catch (err: any) {
        console.error('Firma detay yükleme hatası:', err);
        if (err.response?.status === 404) {
          setError('Firma bulunamadı');
        } else {
          setError(err.response?.data?.message || 'Firma bilgileri yüklenirken bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    loadFirma();
  }, [id]);

  // Profil fotoğrafı URL'si oluştur
  const getProfilFotoUrl = (fotoUrl?: string | null) => {
    if (!fotoUrl) return null;
    
    if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) {
      return fotoUrl;
    }
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    
    if (fotoUrl.startsWith('/')) {
      return `${baseUrl}${fotoUrl}`;
    }
    
    return `${baseUrl}/api/documents/file/${fotoUrl}`;
  };

  // Firma adından baş harfleri al
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
        <FrmNavbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-subtle-light dark:text-subtle-dark">Firma bilgileri yükleniyor...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !firma) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
        <FrmNavbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
          <button
            onClick={() => navigate('/firmalar')}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Firmalara Dön</span>
          </button>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">error</span>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              {error || 'Firma Bulunamadı'}
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-6">
              Aradığınız firma mevcut değil veya bir hata oluştu.
            </p>
            <button
              onClick={() => navigate('/firmalar')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <span className="material-symbols-outlined">list</span>
              Firma Listesine Git
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Harita için firma verisi
  const mapFirma = {
    id: firma.id,
    ad: firma.ad,
    konum: firma.sehir || firma.adres || '',
    sektor: firma.sektor,
    telefon: firma.telefon,
    email: firma.email,
    dogrulandi: firma.dogrulandi
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Geri Dön Butonu */}
        <button
          onClick={() => navigate('/firmalar')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Firmalara Dön</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            {/* Firma Kartı */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {firma.profilFoto ? (
                    <img
                      src={getProfilFotoUrl(firma.profilFoto) || ''}
                      alt={firma.ad}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-avatar');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`fallback-avatar w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center border-4 border-primary/20 ${firma.profilFoto ? 'hidden' : ''}`}
                    style={{ display: firma.profilFoto ? 'none' : 'flex' }}
                  >
                    <span className="text-4xl font-bold text-white">
                      {getInitials(firma.ad)}
                    </span>
                  </div>
                  {firma.dogrulandi && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 shadow-lg">
                      <span className="material-symbols-outlined !text-base">verified</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{firma.ad}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{firma.sektor}</p>
                {firma.dogrulandi && (
                  <p className="text-sm font-medium text-primary mt-1">Doğrulanmış Firma</p>
                )}
                {firma.sehir && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {firma.ilce ? `${firma.ilce}, ${firma.sehir}` : firma.sehir}
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-2">
                {firma.email && (
                  <a 
                    href={`mailto:${firma.email}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                  >
                    <span className="material-symbols-outlined">mail</span> E-posta Gönder
                  </a>
                )}
                {firma.telefon && (
                  <a 
                    href={`tel:${firma.telefon}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-white shadow-sm hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                  >
                    <span className="material-symbols-outlined">call</span> Ara
                  </a>
                )}
              </div>
            </div>

            {/* Firma Bilgileri */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Firma Bilgileri</h2>
              <ul className="space-y-4 text-sm">
                {firma.adres && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Adres</p>
                      <p className="text-gray-800 dark:text-gray-200">{firma.adres}</p>
                  </div>
                </li>
                )}
                {firma.telefon && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">call</span>
                  <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Telefon</p>
                      <p className="text-gray-800 dark:text-gray-200">{firma.telefon}</p>
                  </div>
                </li>
                )}
                {firma.email && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">email</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">E-posta</p>
                      <p className="text-gray-800 dark:text-gray-200">{firma.email}</p>
                  </div>
                </li>
                )}
                {firma.kurulusYili && (
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">calendar_today</span>
                  <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Kuruluş Yılı</p>
                      <p className="text-gray-800 dark:text-gray-200">{firma.kurulusYili}</p>
                  </div>
                </li>
                )}
                {firma.calisanSayisi && (
                <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">groups</span>
                  <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Çalışan Sayısı</p>
                      <p className="text-gray-800 dark:text-gray-200">{firma.calisanSayisi}</p>
                    </div>
                  </li>
                )}
                {firma.yetkili && (firma.yetkili.ad || firma.yetkili.soyad) && (
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">person</span>
                    <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Yetkili Kişi</p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {[firma.yetkili.ad, firma.yetkili.soyad].filter(Boolean).join(' ')}
                      </p>
                  </div>
                </li>
                )}
              </ul>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Harita */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Konum</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <TomTomMap
                  firmalar={[mapFirma]}
                  selectedFirma={mapFirma}
                  className="h-full"
                />
              </div>
              {firma.adres && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{firma.adres}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(firma.adres)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">directions</span>
                    Yol Tarifi Al
                  </a>
                </div>
              )}
            </div>

            {/* Hakkında */}
            {firma.aciklama && (
              <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hakkında</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {firma.aciklama}
                </p>
              </div>
            )}

            {/* Sertifikalar */}
            {firma.sertifikalar && firma.sertifikalar.length > 0 && (
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sertifikalar</h2>
              <ul className="space-y-3">
                  {firma.sertifikalar.map((sertifika) => (
                    <li key={sertifika.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 size-10">
                      <span className="material-symbols-outlined text-primary">workspace_premium</span>
                    </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{sertifika.ad}</p>
                        {sertifika.verenKurum && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sertifika.verenKurum}
                          </p>
                        )}
                        {sertifika.baslangicTarihi && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(sertifika.baslangicTarihi).toLocaleDateString('tr-TR')}
                            {sertifika.suresiz ? ' - Süresiz' : sertifika.bitisTarihi ? ` - ${new Date(sertifika.bitisTarihi).toLocaleDateString('tr-TR')}` : ''}
                          </p>
                        )}
                      </div>
                      {sertifika.dosyaUrl && (
                        <a
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/documents/file/${sertifika.dosyaUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Sertifikayı Görüntüle"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </a>
                      )}
                  </li>
                ))}
              </ul>
            </div>
            )}

            {/* Ek Bilgiler */}
              <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ek Bilgiler</h2>
              <div className="grid grid-cols-2 gap-4">
                {firma.vergiNo && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Vergi No</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{firma.vergiNo}</p>
                  </div>
                )}
                {firma.ticaretSicilNo && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ticaret Sicil No</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{firma.ticaretSicilNo}</p>
                          </div>
                )}
                {firma.kayitTarihi && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Kayıt Tarihi</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {new Date(firma.kayitTarihi).toLocaleDateString('tr-TR')}
                    </p>
                          </div>
                )}
                {firma.sonGuncelleme && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {new Date(firma.sonGuncelleme).toLocaleDateString('tr-TR')}
                    </p>
                        </div>
                          )}
                        </div>
                      </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FirmaDetayPage;
