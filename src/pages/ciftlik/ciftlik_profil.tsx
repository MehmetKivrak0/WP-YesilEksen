import CftNavbar from '../../components/cftnavbar';
import { useState, useEffect, useRef } from 'react';
import { ciftciService, type CiftlikProfil } from '../../services/ciftciService';
import Toast from '../../components/Toast';

function CiftlikProfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', isVisible: false });
  const [isSertifikaModalOpen, setIsSertifikaModalOpen] = useState(false);
  const [isBelgeModalOpen, setIsBelgeModalOpen] = useState(false);
  const [selectedBelgeUrl, setSelectedBelgeUrl] = useState<string | null>(null);
  const [selectedBelgeName, setSelectedBelgeName] = useState<string>('Sertifika Belgesi');
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [sertifikaTurleri, setSertifikaTurleri] = useState<Array<{ id: string; ad: string }>>([]);
  const [sertifikaForm, setSertifikaForm] = useState({
    sertifika_turu_id: '',
    sertifika_no: '',
    veren_kurum: '',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    suresiz: false,
    dosya: null as File | null
  });
  const baslangicTarihRef = useRef<HTMLInputElement>(null);
  const bitisTarihRef = useRef<HTMLInputElement>(null);
  
  // Çiftlik bilgileri
  const [ciftlikBilgileri, setCiftlikBilgileri] = useState<CiftlikProfil>({
    ad: '',
    sahibi: '',
    telefon: '',
    email: '',
    adres: '',
    alan: '',
    alanBirim: 'Dönüm',
    kurulusYili: '',
    sehir_adi: '',
    enlem: '',
    boylam: '',
    yillik_gelir: '',
    uretim_kapasitesi: '',
    urunTurleri: [],
    sertifikalar: [],
    dogrulanmis: false,
    urun_tur: '',
    hakkimizda: '',
    website: '',
    logo_url: ''
  });

  // Orijinal verileri sakla (iptal için)
  const [originalData, setOriginalData] = useState<CiftlikProfil | null>(null);

  // Veri yükleme
  useEffect(() => {
    fetchCiftlikProfil();
    fetchSertifikaTurleri();
  }, []);

  const fetchSertifikaTurleri = async () => {
    try {
      const response = await ciftciService.getSertifikaTurleri();
      if (response.success && response.turler) {
        setSertifikaTurleri(response.turler);
      }
    } catch (err: any) {
      setToast({
        message: 'Sertifika türleri yüklenirken bir hata oluştu',
        type: 'error',
        isVisible: true
      });
    }
  };

  const fetchCiftlikProfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ciftciService.getCiftlikProfil();
      if (response.success) {
        const profil = response.profil;
        // logo_url yoksa website'den al
        if (!profil.logo_url && profil.website) {
          profil.logo_url = profil.website;
        }
        setCiftlikBilgileri(profil);
        setOriginalData(profil);
      }
    } catch (err: any) {
      console.error('Çiftlik profili yükleme hatası:', err);
      console.error('Hata detayları:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.error?.detail 
        || err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || 'Profil bilgileri yüklenirken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await ciftciService.updateCiftlikProfil(ciftlikBilgileri);
      if (response.success) {
        setIsEditing(false);
        setFotoPreview(null);
        setOriginalData(ciftlikBilgileri);
        setToast({
          message: 'Çiftlik profili başarıyla güncellendi',
          type: 'success',
          isVisible: true
        });
      }
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err);
      const errorMessage = err.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: 'error',
        isVisible: true
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setCiftlikBilgileri(originalData);
    }
    setIsEditing(false);
    setFotoPreview(null);
    setError(null);
  };

  const handleChange = (field: string, value: string) => {
    setCiftlikBilgileri(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Önce preview göster
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Backend'e yükle
        const response = await ciftciService.uploadCiftlikLogo(file);
        if (response.success) {
          setCiftlikBilgileri(prev => ({
            ...prev,
            logo_url: response.logo_url,
            website: response.logo_url
          }));
          setToast({
            message: 'Logo başarıyla yüklendi',
            type: 'success',
            isVisible: true
          });
        }
      } catch (err: any) {
        console.error('Logo yükleme hatası:', err);
        setToast({
          message: err.response?.data?.message || 'Logo yüklenirken bir hata oluştu',
          type: 'error',
          isVisible: true
        });
        setFotoPreview(null);
      }
    }
  };

  // Belge görüntüleme fonksiyonu
  const handleViewDocument = async (url: string, name: string) => {
    setSelectedBelgeUrl(url);
    setSelectedBelgeName(name);
    setIsBelgeModalOpen(true);
    setDocumentError(false);
    setDocumentBlobUrl(null);
    setDocumentLoading(true);
    
    // Dosya türünü kontrol et
    const cleanUrl = url.split('?')[0];
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
    const isPdf = /\.pdf$/i.test(cleanUrl);
    
    // Resim veya PDF ise blob URL oluştur
    if (isImage || isPdf) {
      try {
        const token = localStorage.getItem('token');
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setDocumentBlobUrl(blobUrl);
        } else {
          setDocumentError(true);
        }
      } catch (error) {
        console.error('Belge yükleme hatası:', error);
        setDocumentError(true);
      } finally {
        setDocumentLoading(false);
      }
    } else {
      setDocumentLoading(false);
    }
  };

  // Belge indirme fonksiyonu
  const handleDownloadDocument = async (url: string, name: string) => {
    try {
      const token = localStorage.getItem('token');
      const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
      
      // Fetch ile blob al
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }
      
      const blob = await response.blob();
      
      // Blob URL oluştur ve indir
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Dosya adını al (URL'den veya name parametresinden)
      const fileName = name || url.split('/').pop()?.split('?')[0] || 'sertifika-belgesi';
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Blob URL'i temizle
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('İndirme hatası:', error);
      setToast({
        message: 'Belge indirilemedi. Lütfen tekrar deneyin.',
        type: 'error',
        isVisible: true
      });
    }
  };


  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark min-h-screen flex flex-col">
        <CftNavbar 
          logoUrl={ciftlikBilgileri.logo_url || ciftlikBilgileri.website || undefined}
          farmName={ciftlikBilgileri.ad || undefined}
        />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-subtle-light dark:text-subtle-dark">Yükleniyor...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark min-h-screen flex flex-col">
      <CftNavbar 
        logoUrl={ciftlikBilgileri.logo_url || ciftlikBilgileri.website || undefined}
        farmName={ciftlikBilgileri.ad || undefined}
      />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Çiftlik Profili</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">Çiftlik bilgilerinizi görüntüleyin ve düzenleyin</p>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Profil Kartı */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-6 py-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 dark:bg-primary/30 flex items-center justify-center border-2 border-primary/30 dark:border-primary/50">
                    {(fotoPreview || ciftlikBilgileri.logo_url || ciftlikBilgileri.website) ? (
                      <img 
                        src={fotoPreview || ciftlikBilgileri.logo_url || ciftlikBilgileri.website || ''} 
                        alt={ciftlikBilgileri.ad}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Resim yüklenemedi:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-5xl">agriculture</span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                      <span className="material-symbols-outlined text-base">camera_alt</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">{ciftlikBilgileri.ad}</h2>
                    {ciftlikBilgileri.dogrulanmis && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 dark:bg-primary/30 text-primary text-sm font-medium">
                        <span className="material-symbols-outlined text-base">verified</span>
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-subtle-light dark:text-subtle-dark">Sahibi: {ciftlikBilgileri.sahibi}</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Düzenle
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">save</span>
                          Kaydet
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      İptal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bilgi Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* İletişim Bilgileri */}
            <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
              <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_mail</span>
                İletişim Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">person</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Çiftlik Sahibi</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={ciftlikBilgileri.sahibi}
                        onChange={(e) => handleChange('sahibi', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.sahibi}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">phone</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Telefon</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={ciftlikBilgileri.telefon}
                        onChange={(e) => handleChange('telefon', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.telefon}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">email</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">E-posta</p>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="email"
                          value={ciftlikBilgileri.email}
                          readOnly
                          disabled
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-content-light/60 dark:text-content-dark/60 cursor-not-allowed"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subtle-light dark:text-subtle-dark flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          Değiştirilemez
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Adres</p>
                    {isEditing ? (
                      <textarea
                        value={ciftlikBilgileri.adres}
                        onChange={(e) => handleChange('adres', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      />
                    ) : (
                      <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.adres}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Çiftlik Detayları */}
            <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
              <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Çiftlik Detayları
              </h3>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">agriculture</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Çiftlik Adı</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={ciftlikBilgileri.ad}
                          onChange={(e) => handleChange('ad', e.target.value)}
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.ad}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">location_city</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Şehir</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={ciftlikBilgileri.sehir_adi || ''}
                          onChange={(e) => handleChange('sehir_adi', e.target.value)}
                          placeholder="Şehir adı"
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.sehir_adi || 'Belirtilmemiş'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">square_foot</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Toplam Alan</p>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={ciftlikBilgileri.alan}
                            onChange={(e) => handleChange('alan', e.target.value)}
                            className="flex-1 px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                          <select
                            value={ciftlikBilgileri.alanBirim}
                            onChange={(e) => handleChange('alanBirim', e.target.value)}
                            className="px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="Dönüm">Dönüm</option>
                            <option value="Hektar">Hektar</option>
                            <option value="Dekar">Dekar</option>
                          </select>
                        </div>
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.alan} {ciftlikBilgileri.alanBirim}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">calendar_today</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Kuruluş Yılı</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={ciftlikBilgileri.kurulusYili}
                          onChange={(e) => handleChange('kurulusYili', e.target.value)}
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.kurulusYili}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">payments</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Yıllık Gelir (₺)</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={ciftlikBilgileri.yillik_gelir || ''}
                          onChange={(e) => handleChange('yillik_gelir', e.target.value)}
                          placeholder="Yıllık gelir"
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">
                          {ciftlikBilgileri.yillik_gelir ? `${parseFloat(ciftlikBilgileri.yillik_gelir).toLocaleString('tr-TR')} ₺` : 'Belirtilmemiş'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">factory</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Üretim Kapasitesi (Ton)</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={ciftlikBilgileri.uretim_kapasitesi || ''}
                          onChange={(e) => handleChange('uretim_kapasitesi', e.target.value)}
                          placeholder="Üretim kapasitesi"
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">
                          {ciftlikBilgileri.uretim_kapasitesi ? `${parseFloat(ciftlikBilgileri.uretim_kapasitesi).toLocaleString('tr-TR')} Ton` : 'Belirtilmemiş'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">explore</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Enlem</p>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.00000001"
                          value={ciftlikBilgileri.enlem || ''}
                          onChange={(e) => handleChange('enlem', e.target.value)}
                          placeholder="Örn: 39.9334"
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.enlem || 'Belirtilmemiş'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">explore</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1.5">Boylam</p>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.00000001"
                          value={ciftlikBilgileri.boylam || ''}
                          onChange={(e) => handleChange('boylam', e.target.value)}
                          placeholder="Örn: 32.8597"
                          className="w-full px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <p className="text-sm text-content-light dark:text-content-dark">{ciftlikBilgileri.boylam || 'Belirtilmemiş'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ürün Türü */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 mb-6">
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">eco</span>
              Ürün Türü
            </h3>
            {isEditing ? (
              <textarea
                value={ciftlikBilgileri.urun_tur || ''}
                onChange={(e) => handleChange('urun_tur', e.target.value)}
                rows={3}
                placeholder="Ürün türü bilgisi..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            ) : (
              <p className="text-sm text-content-light/80 dark:text-content-dark/80 leading-relaxed">
                {ciftlikBilgileri.urun_tur || 'Henüz bilgi eklenmemiş.'}
              </p>
            )}
          </div>

          {/* Hakkımızda */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 mb-6">
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Hakkımızda
            </h3>
            {isEditing ? (
              <textarea
                value={ciftlikBilgileri.hakkimizda || ''}
                onChange={(e) => handleChange('hakkimizda', e.target.value)}
                rows={5}
                placeholder="Çiftliğiniz hakkında bilgi verin..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            ) : (
              <p className="text-sm text-content-light/80 dark:text-content-dark/80 leading-relaxed">
                {ciftlikBilgileri.hakkimizda || 'Henüz bilgi eklenmemiş.'}
              </p>
            )}
          </div>

          {/* Sertifikalar */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-content-light dark:text-content-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                Sertifikalar
              </h3>
              <button
                onClick={async () => {
                  setIsSertifikaModalOpen(true);
                  // Modal açıldığında sertifika türlerini yükle (eğer yüklenmemişse)
                  if (sertifikaTurleri.length === 0) {
                    await fetchSertifikaTurleri();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                type="button"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Sertifika Ekle
              </button>
            </div>
            <div className="space-y-3">
              {ciftlikBilgileri.sertifikalarDetay && ciftlikBilgileri.sertifikalarDetay.length > 0 ? (
                ciftlikBilgileri.sertifikalarDetay.map((sertifika) => (
                  <div key={sertifika.id} className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-content-light dark:text-content-dark mb-2">
                          {sertifika.sertifika_adi}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {sertifika.sertifika_no && (
                            <div>
                              <span className="text-subtle-light dark:text-subtle-dark">Sertifika No:</span>
                              <span className="ml-2 text-content-light dark:text-content-dark font-medium">{sertifika.sertifika_no}</span>
                            </div>
                          )}
                          {sertifika.veren_kurum && (
                            <div>
                              <span className="text-subtle-light dark:text-subtle-dark">Veren Kurum:</span>
                              <span className="ml-2 text-content-light dark:text-content-dark">{sertifika.veren_kurum}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-subtle-light dark:text-subtle-dark">Başlangıç:</span>
                            <span className="ml-2 text-content-light dark:text-content-dark">
                              {sertifika.baslangic_tarihi ? new Date(sertifika.baslangic_tarihi).toLocaleDateString('tr-TR') : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-subtle-light dark:text-subtle-dark">Bitiş:</span>
                            <span className="ml-2 text-content-light dark:text-content-dark">
                              {sertifika.suresiz ? (
                                <span className="text-primary font-medium">Süresiz</span>
                              ) : sertifika.bitis_tarihi ? (
                                new Date(sertifika.bitis_tarihi).toLocaleDateString('tr-TR')
                              ) : (
                                '-'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {sertifika.dosya_url && (
                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleViewDocument(sertifika.dosya_url!, sertifika.sertifika_adi)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            Görüntüle
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(sertifika.dosya_url!, sertifika.sertifika_adi)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-subtle-light dark:text-subtle-dark hover:bg-background-light/50 dark:hover:bg-background-dark/50 rounded-lg transition-colors border border-border-light dark:border-border-dark"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                            İndir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : ciftlikBilgileri.sertifikalar.length > 0 ? (
                // Geriye dönük uyumluluk için eski format
                ciftlikBilgileri.sertifikalar.map((sertifika, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <p className="text-sm text-content-light dark:text-content-dark">{sertifika}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-subtle-light dark:text-subtle-dark text-center py-4">
                  Henüz sertifika eklenmemiş.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Sertifika Ekle Modal */}
      {isSertifikaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Yeni Sertifika Ekle</h2>
              <button
                onClick={() => {
                  setIsSertifikaModalOpen(false);
                  setSertifikaForm({
                    sertifika_turu_id: '',
                    sertifika_no: '',
                    veren_kurum: '',
                    baslangic_tarihi: '',
                    bitis_tarihi: '',
                    suresiz: false,
                    dosya: null
                  });
                }}
                className="text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Sertifika Türü <span className="text-red-500">*</span>
                </label>
                <select
                  value={sertifikaForm.sertifika_turu_id}
                  onChange={(e) => setSertifikaForm(prev => ({ ...prev, sertifika_turu_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Sertifika türü seçin</option>
                  {sertifikaTurleri.length > 0 ? (
                    sertifikaTurleri.map((tur) => (
                      <option key={tur.id} value={tur.id}>{tur.ad}</option>
                    ))
                  ) : (
                    <option value="" disabled>Yükleniyor...</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Sertifika No
                </label>
                <input
                  type="text"
                  value={sertifikaForm.sertifika_no}
                  onChange={(e) => {
                    // Sadece harf ve sayı kabul et, boşlukları kaldır
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    // Maksimum 15 karakter
                    const limitedValue = value.slice(0, 15);
                    setSertifikaForm(prev => ({ ...prev, sertifika_no: limitedValue }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Sertifika numarası (max 15 karakter)"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Veren Kurum
                </label>
                <input
                  type="text"
                  value={sertifikaForm.veren_kurum}
                  onChange={(e) => setSertifikaForm(prev => ({ ...prev, veren_kurum: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Sertifikayı veren kurum adı"
                  maxLength={255}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                    Başlangıç Tarihi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={baslangicTarihRef}
                      type="date"
                      value={sertifikaForm.baslangic_tarihi}
                      onChange={(e) => setSertifikaForm(prev => ({ ...prev, baslangic_tarihi: e.target.value }))}
                      onClick={async () => {
                        if (baslangicTarihRef.current && 'showPicker' in baslangicTarihRef.current) {
                          try {
                            await (baslangicTarihRef.current as any).showPicker();
                          } catch (err) {
                            // showPicker desteklenmiyorsa normal davranış devam eder
                          }
                        }
                      }}
                      className="w-full px-3 py-2 pl-10 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
                      required
                    />
                    <span 
                      className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-lg cursor-pointer z-10"
                      onClick={() => baslangicTarihRef.current?.click()}
                    >
                      calendar_today
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                    Bitiş Tarihi
                  </label>
                  <div className="relative">
                    <input
                      ref={bitisTarihRef}
                      type="date"
                      value={sertifikaForm.bitis_tarihi}
                      onChange={(e) => setSertifikaForm(prev => ({ ...prev, bitis_tarihi: e.target.value }))}
                      onClick={async () => {
                        if (bitisTarihRef.current && 'showPicker' in bitisTarihRef.current && !sertifikaForm.suresiz) {
                          try {
                            await (bitisTarihRef.current as any).showPicker();
                          } catch (err) {
                            // showPicker desteklenmiyorsa normal davranış devam eder
                          }
                        }
                      }}
                      className="w-full px-3 py-2 pl-10 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={sertifikaForm.suresiz}
                    />
                    <span 
                      className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-lg cursor-pointer z-10"
                      onClick={() => !sertifikaForm.suresiz && bitisTarihRef.current?.click()}
                    >
                      event
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="suresiz"
                  checked={sertifikaForm.suresiz}
                  onChange={(e) => {
                    setSertifikaForm(prev => ({ 
                      ...prev, 
                      suresiz: e.target.checked,
                      bitis_tarihi: e.target.checked ? '' : prev.bitis_tarihi
                    }));
                  }}
                  className="w-4 h-4 text-primary border-border-light dark:border-border-dark rounded focus:ring-primary"
                />
                <label htmlFor="suresiz" className="text-sm text-content-light dark:text-content-dark">
                  Süresiz
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Sertifika Dosyası
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSertifikaForm(prev => ({ ...prev, dosya: file }));
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {sertifikaForm.dosya && (
                  <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                    Seçilen dosya: {sertifikaForm.dosya.name}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={async () => {
                    if (!sertifikaForm.sertifika_turu_id || !sertifikaForm.baslangic_tarihi) {
                      setToast({
                        message: 'Lütfen zorunlu alanları doldurun',
                        type: 'error',
                        isVisible: true
                      });
                      return;
                    }
                    try {
                      await ciftciService.addSertifika({
                        sertifika_turu_id: sertifikaForm.sertifika_turu_id,
                        sertifika_no: sertifikaForm.sertifika_no || undefined,
                        veren_kurum: sertifikaForm.veren_kurum || undefined,
                        baslangic_tarihi: sertifikaForm.baslangic_tarihi,
                        bitis_tarihi: sertifikaForm.suresiz ? undefined : (sertifikaForm.bitis_tarihi || undefined),
                        suresiz: sertifikaForm.suresiz,
                        dosya: sertifikaForm.dosya || undefined
                      });
                      setToast({
                        message: 'Sertifika başarıyla eklendi',
                        type: 'success',
                        isVisible: true
                      });
                      setIsSertifikaModalOpen(false);
                      setSertifikaForm({
                        sertifika_turu_id: '',
                        sertifika_no: '',
                        veren_kurum: '',
                        baslangic_tarihi: '',
                        bitis_tarihi: '',
                        suresiz: false,
                        dosya: null
                      });
                      await fetchCiftlikProfil();
                    } catch (err: any) {
                      setToast({
                        message: err.response?.data?.message || 'Sertifika eklenirken bir hata oluştu',
                        type: 'error',
                        isVisible: true
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  type="button"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => {
                    setIsSertifikaModalOpen(false);
                    setSertifikaForm({
                      sertifika_turu_id: '',
                      sertifika_no: '',
                      veren_kurum: '',
                      baslangic_tarihi: '',
                      bitis_tarihi: '',
                      suresiz: false,
                      dosya: null
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-border-light dark:border-border-dark text-content-light dark:text-content-dark rounded-lg hover:bg-background-light/50 dark:hover:bg-background-dark/50 transition-colors text-sm font-medium"
                  type="button"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Belge Görüntüle Modal */}
      {isBelgeModalOpen && selectedBelgeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">{selectedBelgeName}</h2>
              <button
                onClick={() => {
                  setIsBelgeModalOpen(false);
                  setSelectedBelgeUrl(null);
                  setSelectedBelgeName('Sertifika Belgesi');
                  if (documentBlobUrl) {
                    URL.revokeObjectURL(documentBlobUrl);
                    setDocumentBlobUrl(null);
                  }
                  setDocumentError(false);
                  setDocumentLoading(false);
                }}
                className="text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {(() => {
                const cleanUrl = selectedBelgeUrl.split('?')[0];
                const isPdf = /\.pdf$/i.test(cleanUrl);
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
                
                // Loading durumu
                if (documentLoading) {
                  return (
                    <div className="flex items-center justify-center p-8 min-h-[60vh]">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">Belge yükleniyor...</p>
                      </div>
                    </div>
                  );
                }
                
                // Hata durumu
                if (documentError) {
                  return (
                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                      <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                        {isPdf ? 'picture_as_pdf' : 'broken_image'}
                      </span>
                      <p className="text-content-light dark:text-content-dark mb-4">
                        {isPdf ? 'PDF yüklenemedi' : 'Resim yüklenemedi'}
                      </p>
                      <button
                        onClick={() => handleDownloadDocument(selectedBelgeUrl, selectedBelgeName)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        İndir
                      </button>
                    </div>
                  );
                }
                
                // PDF görüntüleme
                if (isPdf && documentBlobUrl) {
                  return (
                    <iframe
                      src={documentBlobUrl}
                      className="w-full h-[70vh] rounded-lg border border-border-light dark:border-border-dark"
                      title={selectedBelgeName}
                    />
                  );
                }
                
                // Resim görüntüleme
                if (isImage && documentBlobUrl) {
                  return (
                    <div className="flex items-center justify-center">
                      <img
                        src={documentBlobUrl}
                        alt={selectedBelgeName}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg border border-border-light dark:border-border-dark"
                        onError={() => {
                          setDocumentError(true);
                          if (documentBlobUrl) {
                            URL.revokeObjectURL(documentBlobUrl);
                            setDocumentBlobUrl(null);
                          }
                        }}
                      />
                    </div>
                  );
                }
                
                // Desteklenmeyen dosya türü veya blob URL yoksa
                return (
                  <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                    <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                      description
                    </span>
                    <p className="text-content-light dark:text-content-dark mb-4">
                      Bu dosya türü tarayıcıda görüntülenemiyor
                    </p>
                    <button
                      onClick={() => handleDownloadDocument(selectedBelgeUrl, selectedBelgeName)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      İndir
                    </button>
                  </div>
                );
              })()}
            </div>
            <div className="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => handleDownloadDocument(selectedBelgeUrl, selectedBelgeName)}
                className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-medium text-content-light transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark/50 dark:text-content-dark dark:hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-base">download</span>
                İndir
              </button>
              <button
                onClick={() => {
                  setIsBelgeModalOpen(false);
                  setSelectedBelgeUrl(null);
                  setSelectedBelgeName('Sertifika Belgesi');
                  if (documentBlobUrl) {
                    URL.revokeObjectURL(documentBlobUrl);
                    setDocumentBlobUrl(null);
                  }
                  setDocumentError(false);
                  setDocumentLoading(false);
                }}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default CiftlikProfil;

