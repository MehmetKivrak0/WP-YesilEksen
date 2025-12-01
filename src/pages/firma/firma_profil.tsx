import FrmNavbar from '../../components/frmnavbar';
import { useState, useEffect } from 'react';
import { firmaService, type FirmaProfile, type SertifikaTuru, type AddSertifikaData } from '../../services/firmaService';

function FirmaProfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Firma bilgileri - API'den gelecek
  const [firmaBilgileri, setFirmaBilgileri] = useState<FirmaProfile | null>(null);
  const [originalData, setOriginalData] = useState<FirmaProfile | null>(null);
  const [sertifikaTurleri, setSertifikaTurleri] = useState<SertifikaTuru[]>([]);
  const [showSertifikaModal, setShowSertifikaModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingSertifika, setUploadingSertifika] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [showPhotoConfirmModal, setShowPhotoConfirmModal] = useState(false);
  
  // Sertifika form state
  const [sertifikaForm, setSertifikaForm] = useState<AddSertifikaData>({
    sertifikaTuruId: '',
    sertifikaNo: '',
    verenKurum: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    suresiz: false
  });
  const [sertifikaFile, setSertifikaFile] = useState<File | null>(null);

  // Firma profil verilerini yükle
  useEffect(() => {
    loadFirmaProfile();
    loadSertifikaTurleri();
  }, []);

  const loadFirmaProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Firma profil yükleniyor...');
      const response = await firmaService.getProfile();
      console.log('✅ Firma profil yanıtı:', response);
      if (response.success) {
        setFirmaBilgileri(response.firma);
        setOriginalData(JSON.parse(JSON.stringify(response.firma))); // Deep copy
      } else {
        setError('Firma profili yüklenemedi');
      }
    } catch (err: any) {
      console.error('❌ Firma profil yükleme hatası:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setError(err.response?.data?.message || err.message || 'Firma profili yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firmaBilgileri) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updateData = {
        ad: firmaBilgileri.ad,
        telefon: firmaBilgileri.telefon,
        adres: firmaBilgileri.adres,
        kurulusYili: firmaBilgileri.kurulusYili,
        calisanSayisi: firmaBilgileri.calisanSayisi,
        aciklama: firmaBilgileri.aciklama,
        sektorId: firmaBilgileri.sektorId
      };

      const response = await firmaService.updateProfile(updateData);
      
      if (response.success) {
        setSuccessMessage('Firma profili başarıyla güncellendi');
    setIsEditing(false);
        setFotoPreview(null);
        // Verileri yeniden yükle
        await loadFirmaProfile();
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Güncelleme başarısız');
      }
    } catch (err: any) {
      console.error('Firma profil güncelleme hatası:', err);
      setError(err.response?.data?.message || 'Firma profili güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFotoPreview(null);
    // Orijinal verileri geri yükle
    if (originalData) {
      setFirmaBilgileri(JSON.parse(JSON.stringify(originalData)));
    }
  };

  const handleChange = (field: string, value: string) => {
    if (!firmaBilgileri) return;
    setFirmaBilgileri({
      ...firmaBilgileri,
      [field]: value
    });
  };

  const loadSertifikaTurleri = async () => {
    try {
      const response = await firmaService.getSertifikaTurleri();
      if (response.success) {
        setSertifikaTurleri(response.types);
      }
    } catch (err) {
      console.error('Sertifika türleri yükleme hatası:', err);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosyayı kaydet ve onay modalını göster
    setPendingPhotoFile(file);
    
    // Preview göster
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      setShowPhotoConfirmModal(true);
      };
      reader.readAsDataURL(file);
    
    // Input'u temizle (aynı dosya tekrar seçilebilsin)
    e.target.value = '';
  };

  const handlePhotoUploadConfirm = async () => {
    if (!pendingPhotoFile) return;

    try {
      setUploadingPhoto(true);
      setShowPhotoConfirmModal(false);
      
      const response = await firmaService.uploadProfilePhoto(pendingPhotoFile);
      if (response.success) {
        setSuccessMessage('Profil fotoğrafı başarıyla yüklendi');
        // Profil verilerini yeniden yükle
        await loadFirmaProfile();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Profil fotoğrafı yüklenemedi');
      }
    } catch (err: any) {
      console.error('Profil fotoğrafı yükleme hatası:', err);
      setError(err.response?.data?.message || 'Profil fotoğrafı yüklenirken bir hata oluştu');
    } finally {
      setUploadingPhoto(false);
      setPendingPhotoFile(null);
    }
  };

  const handlePhotoUploadCancel = () => {
    setShowPhotoConfirmModal(false);
    setPendingPhotoFile(null);
    // Preview'u eski fotoğrafa geri döndür
    setFotoPreview(null);
  };

  const handleAddSertifika = async () => {
    if (!sertifikaForm.sertifikaTuruId || !sertifikaForm.baslangicTarihi) {
      setError('Sertifika türü ve başlangıç tarihi zorunludur');
      return;
    }

    try {
      setUploadingSertifika(true);
      setError(null);
      
      const response = await firmaService.addSertifika({
        ...sertifikaForm,
        file: sertifikaFile || undefined
      });

      if (response.success) {
        setSuccessMessage('Sertifika başarıyla eklendi');
        setShowSertifikaModal(false);
        // Formu sıfırla
        setSertifikaForm({
          sertifikaTuruId: '',
          sertifikaNo: '',
          verenKurum: '',
          baslangicTarihi: '',
          bitisTarihi: '',
          suresiz: false
        });
        setSertifikaFile(null);
        // Profil verilerini yeniden yükle
        await loadFirmaProfile();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Sertifika eklenemedi');
      }
    } catch (err: any) {
      console.error('Sertifika ekleme hatası:', err);
      setError(err.response?.data?.message || 'Sertifika eklenirken bir hata oluştu');
    } finally {
      setUploadingSertifika(false);
    }
  };

  const handleDeleteSertifika = async (id: string) => {
    if (!confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await firmaService.deleteSertifika(id);
      if (response.success) {
        setSuccessMessage('Sertifika başarıyla silindi');
        await loadFirmaProfile();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Sertifika silinemedi');
      }
    } catch (err: any) {
      console.error('Sertifika silme hatası:', err);
      setError(err.response?.data?.message || 'Sertifika silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
        <FrmNavbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-subtle-light dark:text-subtle-dark">Firma profili yükleniyor...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!firmaBilgileri) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
        <FrmNavbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <p className="text-red-600 dark:text-red-400">{error || 'Firma profili bulunamadı'}</p>
              <button
                onClick={loadFirmaProfile}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-background-dark dark:text-background-light mb-2">Firma Profili</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">Firma bilgilerinizi görüntüleyin ve düzenleyin</p>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Başarı Mesajı */}
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Profil Kartı */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-6 py-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 dark:bg-primary/30 flex items-center justify-center border-2 border-primary/30 dark:border-primary/50 relative">
                    {fotoPreview || firmaBilgileri.profilFotoUrl ? (
                      <img 
                        src={fotoPreview || (() => {
                          const photoUrl = firmaBilgileri.profilFotoUrl || '';
                          if (!photoUrl) return '';
                          
                          console.log('🖼️ Profil fotoğrafı URL oluşturuluyor:', photoUrl);
                          
                          // Eğer zaten tam URL ise
                          if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                            return photoUrl;
                          }
                          
                          // Eğer / ile başlıyorsa (relative path)
                          if (photoUrl.startsWith('/')) {
                            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                            const baseUrl = apiBaseUrl.replace('/api', '');
                            const fullUrl = `${baseUrl}${photoUrl}`;
                            console.log('🖼️ Tam URL (relative):', fullUrl);
                            return fullUrl;
                          }
                          
                          // Eğer sadece dosya yolu ise (örn: profile-photos/xxx.jpg)
                          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                          const baseUrl = apiBaseUrl.replace('/api', '');
                          const fullUrl = `${baseUrl}/api/documents/file/${photoUrl}`;
                          console.log('🖼️ Tam URL (file path):', fullUrl);
                          return fullUrl;
                        })()} 
                        alt={firmaBilgileri.ad}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const imgSrc = e.currentTarget.src;
                          console.error('❌ Profil fotoğrafı yüklenemedi:', {
                            src: imgSrc,
                            photoUrl: firmaBilgileri.profilFotoUrl,
                            error: 'Image load failed',
                            status: 'ERR_BLOCKED_BY_RESPONSE veya CORS hatası olabilir'
                          });
                          // Hata durumunda varsayılan ikonu göster
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Profil fotoğrafı başarıyla yüklendi:', firmaBilgileri.profilFotoUrl);
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-5xl">business</span>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-base">{uploadingPhoto ? 'hourglass_empty' : 'camera_alt'}</span>
                      <input
                        type="file"
                      accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFotoChange}
                      disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-background-dark dark:text-background-light">{firmaBilgileri.ad}</h2>
                    {firmaBilgileri.dogrulanmis && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 dark:bg-primary/30 text-primary text-sm font-medium">
                        <span className="material-symbols-outlined text-base">verified</span>
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-subtle-light dark:text-subtle-dark">{firmaBilgileri.sektor}</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-base align-middle mr-1">edit</span>
                    Düzenle
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-1">{saving ? 'hourglass_empty' : 'save'}</span>
                      {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-1">close</span>
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
              <h3 className="text-lg font-semibold text-background-dark dark:text-background-light mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_mail</span>
                İletişim Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">phone</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Telefon</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={firmaBilgileri.telefon}
                        onChange={(e) => handleChange('telefon', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.telefon}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">email</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">E-posta</p>
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.email}</p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">E-posta adresi değiştirilemez</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Adres</p>
                    {isEditing ? (
                      <textarea
                        value={firmaBilgileri.adres}
                        onChange={(e) => handleChange('adres', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.adres}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Firma Detayları */}
            <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
              <h3 className="text-lg font-semibold text-background-dark dark:text-background-light mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Firma Detayları
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">badge</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Vergi No</p>
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.vergiNo}</p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">Vergi numarası değiştirilemez</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">calendar_today</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Kuruluş Yılı</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={firmaBilgileri.kurulusYili}
                        onChange={(e) => handleChange('kurulusYili', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.kurulusYili}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">groups</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Çalışan Sayısı</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={firmaBilgileri.calisanSayisi}
                        onChange={(e) => handleChange('calisanSayisi', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.calisanSayisi}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">category</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Sektör</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={firmaBilgileri.sektor}
                        onChange={(e) => handleChange('sektor', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.sektor}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 mb-6">
            <h3 className="text-lg font-semibold text-background-dark dark:text-background-light mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Hakkımızda
            </h3>
            {isEditing ? (
              <textarea
                value={firmaBilgileri.aciklama}
                onChange={(e) => handleChange('aciklama', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            ) : (
              <p className="text-sm text-background-dark/80 dark:text-background-light/80 leading-relaxed">
                {firmaBilgileri.aciklama}
              </p>
            )}
          </div>

          {/* Sertifikalar */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-background-dark dark:text-background-light flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              Sertifikalar
            </h3>
              <button
                onClick={() => setShowSertifikaModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Sertifika Ekle
              </button>
            </div>
            {firmaBilgileri.sertifikalar && firmaBilgileri.sertifikalar.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {firmaBilgileri.sertifikalar.map((sertifika, index) => (
                  <div key={sertifika.id || index} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
                    <div className="flex items-start gap-3 flex-1">
                  <span className="material-symbols-outlined text-primary">verified</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-background-dark dark:text-background-light">{sertifika.ad}</p>
                        {sertifika.no && (
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">No: {sertifika.no}</p>
                        )}
                        {sertifika.verenKurum && (
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">Veren Kurum: {sertifika.verenKurum}</p>
                        )}
                        {sertifika.baslangicTarihi && (
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">
                            Başlangıç: {new Date(sertifika.baslangicTarihi).toLocaleDateString('tr-TR')}
                            {sertifika.bitisTarihi && !sertifika.suresiz && ` - Bitiş: ${new Date(sertifika.bitisTarihi).toLocaleDateString('tr-TR')}`}
                            {sertifika.suresiz && ' (Süresiz)'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSertifika(sertifika.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-white hover:bg-red-500 transition-colors"
                      title="Sertifikayı Sil"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Henüz sertifika eklenmemiş.</p>
            )}
          </div>

          {/* Sertifika Ekleme Modal */}
          {showSertifikaModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-background-dark dark:text-background-light">Yeni Sertifika Ekle</h2>
                  <button
                    onClick={() => {
                      setShowSertifikaModal(false);
                      setSertifikaForm({
                        sertifikaTuruId: '',
                        sertifikaNo: '',
                        verenKurum: '',
                        baslangicTarihi: '',
                        bitisTarihi: '',
                        suresiz: false
                      });
                      setSertifikaFile(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-background-dark dark:text-background-light mb-2">
                      Sertifika Türü <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sertifikaForm.sertifikaTuruId}
                      onChange={(e) => setSertifikaForm({ ...sertifikaForm, sertifikaTuruId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light"
                      required
                    >
                      <option value="">Sertifika türü seçin</option>
                      {sertifikaTurleri.map((tur) => (
                        <option key={tur.id} value={tur.id}>{tur.ad}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-background-dark dark:text-background-light mb-2">
                      Sertifika No
                    </label>
                    <input
                      type="text"
                      value={sertifikaForm.sertifikaNo}
                      onChange={(e) => setSertifikaForm({ ...sertifikaForm, sertifikaNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-background-dark dark:text-background-light mb-2">
                      Veren Kurum
                    </label>
                    <input
                      type="text"
                      value={sertifikaForm.verenKurum}
                      onChange={(e) => setSertifikaForm({ ...sertifikaForm, verenKurum: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-background-dark dark:text-background-light mb-2">
                        Başlangıç Tarihi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={sertifikaForm.baslangicTarihi}
                        onChange={(e) => setSertifikaForm({ ...sertifikaForm, baslangicTarihi: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-background-dark dark:text-background-light mb-2">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={sertifikaForm.bitisTarihi}
                        onChange={(e) => setSertifikaForm({ ...sertifikaForm, bitisTarihi: e.target.value })}
                        disabled={sertifikaForm.suresiz}
                        className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="suresiz"
                      checked={sertifikaForm.suresiz}
                      onChange={(e) => setSertifikaForm({ ...sertifikaForm, suresiz: e.target.checked, bitisTarihi: e.target.checked ? '' : sertifikaForm.bitisTarihi })}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor="suresiz" className="text-sm text-background-dark dark:text-background-light">
                      Süresiz
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-background-dark dark:text-background-light mb-2">
                      Sertifika Dosyası (PDF, JPG, PNG - Max 5MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSertifikaFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light"
                    />
                    {sertifikaFile && (
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                        Seçilen dosya: {sertifikaFile.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowSertifikaModal(false);
                      setSertifikaForm({
                        sertifikaTuruId: '',
                        sertifikaNo: '',
                        verenKurum: '',
                        baslangicTarihi: '',
                        bitisTarihi: '',
                        suresiz: false
                      });
                      setSertifikaFile(null);
                    }}
                    className="px-4 py-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddSertifika}
                    disabled={uploadingSertifika || !sertifikaForm.sertifikaTuruId || !sertifikaForm.baslangicTarihi}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingSertifika ? 'Ekleniyor...' : 'Ekle'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fotoğraf Onay Modalı */}
          {showPhotoConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-xl max-w-md w-full border border-border-light dark:border-border-dark">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 text-center">
                    Profil Fotoğrafını Güncelle
                  </h3>
                  
                  {/* Preview */}
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/30">
                      {fotoPreview && (
                        <img 
                          src={fotoPreview} 
                          alt="Yeni profil fotoğrafı"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-subtle-light dark:text-subtle-dark text-center mb-6">
                    Bu fotoğrafı profil fotoğrafınız olarak kaydetmek istiyor musunuz?
                  </p>
                  
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handlePhotoUploadCancel}
                      className="px-6 py-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-content-light dark:text-content-dark"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handlePhotoUploadConfirm}
                      disabled={uploadingPhoto}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">check</span>
                          Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </div>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default FirmaProfil;

