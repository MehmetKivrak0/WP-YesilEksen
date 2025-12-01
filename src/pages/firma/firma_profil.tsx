import FrmNavbar from '../../components/frmnavbar';
import { useState } from 'react';

function FirmaProfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  
  // Firma bilgileri - gerçek uygulamada API'den gelecek
  const [firmaBilgileri, setFirmaBilgileri] = useState({
    ad: 'BioEnerji A.Ş.',
    sektor: 'Enerji',
    vergiNo: '1234567890',
    telefon: '+90 312 123 45 67',
    email: 'info@bioenerji.com.tr',
    website: 'www.bioenerji.com.tr',
    adres: 'Çankaya Mah. Enerji Sok. No: 123, Çankaya, Ankara, Türkiye',
    kurulusYili: '2015',
    calisanSayisi: '50-100',
    aciklama: 'BioEnerji A.Ş., tarımsal atıkların ve organik maddelerin biyogaz ve biyoyakıt üretiminde kullanılması konusunda uzmanlaşmış bir enerji firmasıdır. Sürdürülebilir enerji çözümleri sunarak çevreye katkı sağlamaktadır.',
    sertifikalar: [
      'ISO 9001 Kalite Yönetim Sistemi',
      'ISO 14001 Çevre Yönetim Sistemi',
      'OHSAS 18001 İş Sağlığı ve Güvenliği Yönetim Sistemi'
    ],
    dogrulanmis: true,
    foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4'
  });

  const handleSave = () => {
    // Gerçek uygulamada API çağrısı yapılacak
    setIsEditing(false);
    // API çağrısı: kaydetme işlemi
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFotoPreview(null);
    // Değişiklikleri geri al (gerçek uygulamada orijinal verileri yükle)
  };

  const handleChange = (field: string, value: string) => {
    setFirmaBilgileri(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Gerçek uygulamada dosya yükleme işlemi yapılacak
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
        setFirmaBilgileri(prev => ({
          ...prev,
          foto: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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

          {/* Profil Kartı */}
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-6 py-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 dark:bg-primary/30 flex items-center justify-center border-2 border-primary/30 dark:border-primary/50">
                    {firmaBilgileri.foto || fotoPreview ? (
                      <img 
                        src={fotoPreview || firmaBilgileri.foto} 
                        alt={firmaBilgileri.ad}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-5xl">business</span>
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
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-1">save</span>
                      Kaydet
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
                    {isEditing ? (
                      <input
                        type="email"
                        value={firmaBilgileri.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">language</span>
                  <div className="flex-1">
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-0.5">Web Sitesi</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={firmaBilgileri.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <a href={`https://${firmaBilgileri.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {firmaBilgileri.website}
                      </a>
                    )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        value={firmaBilgileri.vergiNo}
                        onChange={(e) => handleChange('vergiNo', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-background-dark dark:text-background-light focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-background-dark dark:text-background-light">{firmaBilgileri.vergiNo}</p>
                    )}
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
            <h3 className="text-lg font-semibold text-background-dark dark:text-background-light mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              Sertifikalar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {firmaBilgileri.sertifikalar.map((sertifika, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <p className="text-sm text-background-dark dark:text-background-light">{sertifika}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FirmaProfil;

