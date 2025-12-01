import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ciftciService } from '../../services/ciftciService';

function Giris() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // "Beni hatırla" için localStorage'dan email'i yükle
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Debug: Giriş denemesi
      console.log('🔐 Giriş denemesi:', {
        email: formData.email,
        hasPassword: !!formData.password,
        passwordLength: formData.password?.length
      });

      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      const user = response.user;
      
      // "Beni hatırla" seçili ise email'i kaydet, değilse sil
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Çiftçi ise ve başvuru durumu "belge_eksik" ise eksik belgeler sayfasına yönlendir
      if (user.rol === 'ciftci') {
        try {
          const missingDocsResponse = await ciftciService.getMissingDocuments();
          console.log('🔍 Eksik belgeler kontrol sonucu:', missingDocsResponse);
          console.log('🔍 hasGuncelBelgeler:', missingDocsResponse.hasGuncelBelgeler);
          
          // Önce "gcbelge" (güncel belge) kontrolü yap - en öncelikli kontrol
          // Eğer "gcbelge" durumunda belgeler varsa, giriş yapılmasın
          if (missingDocsResponse.success && missingDocsResponse.hasGuncelBelgeler) {
            console.log('✅ Güncel belgeler bulundu, mesaj gösteriliyor...');
            setInfoMessage('Güncel belgeler admine gönderildi. Bekleyiniz.');
            setLoading(false);
            return;
          }
          
          // Önce başvuru durumunu kontrol et
          if (missingDocsResponse.success && missingDocsResponse.application) {
            const appStatus = missingDocsResponse.application.status;
            
            // Sadece "belge_eksik" durumunda VE eksik belgeler varsa eksik belgeler sayfasına git
            if (appStatus === 'belge_eksik' && missingDocsResponse.hasMissingDocuments) {
              // Eksik belgeler varsa eksik belgeler sayfasına yönlendir
              console.log('✅ Eksik belgeler bulundu, eksik belgeler sayfasına yönlendiriliyor...');
              navigate('/ciftlik/eksik-belgeler');
              setLoading(false);
              return;
            }
            
            // "gcbelge" durumunda ise giriş yapılmasın (eksik belgeler yüklendi, admin onayı bekleniyor)
            if (appStatus === 'gcbelge') {
              setInfoMessage('Güncel belgeler admine gönderildi. Bekleyiniz.');
              setLoading(false);
              return;
            }
            
            // "beklemede" durumunda ise giriş yapılmasın (ilk kayıt sırasında)
            if (appStatus === 'beklemede') {
              // İlk kayıt sırasında "beklemede" durumunda olan başvurular için normal mesaj
              setInfoMessage('Yüklenilen belge inceleniyor. 1 Gün içerisinde geri dönüt verilecektir.');
              setLoading(false);
              return;
            }
          } else if (missingDocsResponse.success && 
                     missingDocsResponse.application === null) {
            // Başvuru bulunamadı - bu durumda çiftlik henüz onaylanmamış olabilir
            // Giriş yapılmasın, bilgilendirme mesajı göster
            setInfoMessage('Başvurunuz henüz onaylanmadı. Lütfen bekleyiniz.');
            setLoading(false);
            return;
          } else {
            console.log('ℹ️ Eksik belge yok veya durum belge_eksik değil, normal yönlendirme yapılıyor');
          }
        } catch (err: any) {
          console.error('❌ Eksik belgeler kontrol hatası:', err);
          // Eğer 403 hatası alırsak, başvuru durumunu kontrol et
          if (err?.response?.status === 403) {
            // Login endpoint'inden gelen response'u kontrol et
            // Eğer başvuru durumu "gcbelge" ise, doğru mesajı göster
            // Ama önce login response'unu kontrol etmeliyiz
            // getMissingDocuments hatası olduğu için, login başarılı olmuş demektir
            // Bu durumda başvuru durumunu login endpoint'inden almalıyız
            // Şimdilik genel bir mesaj gösterelim
            setInfoMessage('Güncel belgeler admine gönderildi. Bekleyiniz.');
            setLoading(false);
            return;
          }
          // Diğer hatalarda da giriş yapılmasını engelle (çiftlik henüz onaylanmamış olabilir)
          setInfoMessage('Başvurunuz kontrol ediliyor. Lütfen bekleyiniz.');
          setLoading(false);
          return;
        }
      }
      
      // Rol bazlı yönlendirme (sadece belge_eksik durumu yoksa ve başvuru onaylandıysa)
      switch (user.rol) {
        case 'firma':
          navigate('/firma/panel');
          break;
        case 'ciftci':
          navigate('/ciftlik/panel');
          break;
        case 'ziraat_yoneticisi':
          navigate('/admin/ziraat');
          break;
        case 'sanayi_yoneticisi':
          navigate('/admin/sanayi');
          break;
        case 'super_yonetici':
          // Super yönetici için varsayılan olarak ziraat dashboard'a yönlendir
          navigate('/admin/ziraat');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      // Debug: Hata detayları
      console.error('❌ Giriş hatası:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
        error: err.message
      });
      
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                </svg>
                <h1 className="text-2xl font-bold text-content-light dark:text-content-dark">Yeşil-Eksen</h1>
            </div>
            <h2 className="text-3xl font-bold text-content-light dark:text-content-dark">Hesabınıza Giriş Yapın</h2>
            <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
                Hesabınız yok mu?{' '}
                <Link to="/kayit" className="font-medium text-primary hover:text-primary/80 transition-colors">Kayıt olun</Link>
            </p>
            <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
                <Link to="/" className="font-medium text-primary hover:text-primary/80 transition-colors">← Anasayfaya Dön</Link>
            </p>
        </div>

        {/* Giriş Formu */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {/* Info Message */}
            {infoMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">info</span>
                        <span>{infoMessage}</span>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {/* E-posta/Telefon */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        E-posta veya Telefon
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">person</span>
                        <input 
                            id="email" 
                            name="email" 
                            type="text" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                            placeholder="E-posta veya telefon numaranız"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Şifre */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Şifre
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">lock</span>
                        <input 
                            id="password" 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-10 pr-10 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                            placeholder="Şifreniz"
                            disabled={loading}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Şifremi Unuttum */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input 
                        id="remember-me" 
                        name="remember-me" 
                        type="checkbox" 
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark rounded"
                        disabled={loading}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-subtle-light dark:text-subtle-dark">
                        Beni hatırla
                    </label>
                </div>
                <div className="text-sm">
                    <Link to="/sifremi-unuttum" className="font-medium text-primary hover:text-primary/80 transition-colors">
                        Şifremi unuttum
                    </Link>
                </div>
            </div>

            {/* Giriş Butonu */}
            <div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <span className={`material-symbols-outlined text-white ${loading ? 'animate-spin' : ''}`}>
                            {loading ? 'refresh' : 'login'}
                        </span>
                    </span>
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
            </div>
        </form>
    </div>
</div>
  )
}

export default Giris;
