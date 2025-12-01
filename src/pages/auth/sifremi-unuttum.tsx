import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

function SifremiUnuttum() {
  const navigate = useNavigate();
  
  // Form state
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'back' | 'navigate'>('back');
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  // Şifre validasyonu
  const validatePassword = (password: string) => {
    const errors = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
    setPasswordErrors(errors);
    return Object.values(errors).every(Boolean);
  };

  // E-posta doğrulama ve şifre alanını aç
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // E-posta format kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Geçerli bir e-posta adresi giriniz');
        setLoading(false);
        return;
      }

      // Backend'de e-posta kontrolü yap
      await authService.checkEmail({ email: formData.email });
      
      // E-posta doğrulandıysa şifre adımına geç
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Şifre validasyonu
    if (!validatePassword(formData.newPassword)) {
      setError('Şifre gereksinimlerini karşılamıyor');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: formData.email,
        newPassword: formData.newPassword
      });

      // Başarılı olursa giriş sayfasına yönlendir
      navigate('/giris', { 
        state: { message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Geri butonuna tıklandığında onay dialog'unu aç
  const handleBackClick = () => {
    setConfirmAction('back');
    setShowConfirmDialog(true);
  };

  // Giriş sayfasına dön linkine tıklandığında onay dialog'unu aç
  const handleNavigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setConfirmAction('navigate');
    setShowConfirmDialog(true);
  };

  // Onay dialog'unda iptal edildiğinde
  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  // Onay dialog'unda onaylandığında
  const handleConfirm = () => {
    setShowConfirmDialog(false);
    
    if (confirmAction === 'back') {
      // Geri butonu için - email adımına dön
      setStep('email');
      setFormData({ ...formData, newPassword: '' });
      setPasswordErrors({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
      });
    } else if (confirmAction === 'navigate') {
      // Giriş sayfasına dön linki için - giriş sayfasına yönlendir
      navigate('/giris');
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
          <h2 className="text-3xl font-bold text-content-light dark:text-content-dark">
            {step === 'email' ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}
          </h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            <button
              type="button"
              onClick={handleNavigateToLogin}
              className="font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              ← Giriş sayfasına dön
            </button>
          </p>
        </div>

        {/* Form */}
        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">email</span>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                  placeholder="E-posta adresiniz"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <span className={`material-symbols-outlined text-white ${loading ? 'animate-spin' : ''}`}>
                    {loading ? 'refresh' : 'arrow_forward'}
                  </span>
                </span>
                {loading ? 'Kontrol Ediliyor...' : 'Devam Et'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">lock</span>
                <input 
                  id="newPassword" 
                  name="newPassword" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, newPassword: e.target.value });
                    validatePassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                  placeholder="Yeni şifreniz"
                  disabled={loading}
                  minLength={8}
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
              
              {/* Şifre Gereksinimleri */}
              {formData.newPassword && (
                <div className="mt-3 space-y-1 text-sm">
                  <div className={`flex items-center gap-2 ${passwordErrors.minLength ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                    <span className="material-symbols-outlined text-base">
                      {passwordErrors.minLength ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>En az 8 karakter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                    <span className="material-symbols-outlined text-base">
                      {passwordErrors.hasUpperCase ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>En az bir büyük harf (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                    <span className="material-symbols-outlined text-base">
                      {passwordErrors.hasLowerCase ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>En az bir küçük harf (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                    <span className="material-symbols-outlined text-base">
                      {passwordErrors.hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>En az bir sayı (0-9)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleBackClick}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-border-light dark:border-border-dark text-sm font-medium rounded-lg text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Geri
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <span className={`material-symbols-outlined text-white ${loading ? 'animate-spin' : ''}`}>
                    {loading ? 'refresh' : 'check_circle'}
                  </span>
                </span>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        )}

        {/* Onay Dialog'u */}
        {showConfirmDialog && (
          <>
            <div 
              className="fixed z-40" 
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                backdropFilter: 'blur(4px)',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0
              }}
              onClick={handleCancel}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                    warning
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                  İşlemi İptal Etmek İstiyor musunuz?
                </h3>
              </div>
              
              <p className="text-sm text-subtle-light dark:text-subtle-dark pl-13">
                {confirmAction === 'back' 
                  ? 'Geri dönerseniz, girdiğiniz yeni şifre bilgileri kaybolacaktır. Emin misiniz?'
                  : 'Giriş sayfasına dönerseniz, şifre sıfırlama işlemi iptal edilecektir. Emin misiniz?'
                }
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 border border-border-light dark:border-border-dark text-sm font-medium rounded-lg text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Hayır, Devam Et
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Evet, İptal Et
                </button>
              </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SifremiUnuttum;

