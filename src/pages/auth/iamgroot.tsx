import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import TermsModal from '../../components/TermsModal';
import PrivacyModal from '../../components/PrivacyModal';
import Toast from '../../components/Toast';

function IamGroot() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', isVisible: false });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    userType: '', // 'ziraat' veya 'sanayi'
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  // Telefon numarası formatlama fonksiyonu
  const formatPhoneNumber = (value: string): string => {
    // Sadece sayıları al
    const numbers = value.replace(/[^0-9]/g, '');
    
    // +90 ile başlıyorsa kaldır (Türkiye kodu)
    let cleanNumbers = numbers;
    if (numbers.startsWith('90') && numbers.length > 10) {
      cleanNumbers = numbers.substring(2);
    }
    
    // Maksimum 10 haneli numara
    const limitedNumbers = cleanNumbers.substring(0, 10);
    
    // Format: (5XX) XXX-XX-XX
    if (limitedNumbers.length === 0) return '';
    if (limitedNumbers.length <= 3) return `(${limitedNumbers}`;
    if (limitedNumbers.length <= 6) return `(${limitedNumbers.substring(0, 3)}) ${limitedNumbers.substring(3)}`;
    if (limitedNumbers.length <= 8) return `(${limitedNumbers.substring(0, 3)}) ${limitedNumbers.substring(3, 6)}-${limitedNumbers.substring(6)}`;
    return `(${limitedNumbers.substring(0, 3)}) ${limitedNumbers.substring(3, 6)}-${limitedNumbers.substring(6, 8)}-${limitedNumbers.substring(8)}`;
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'password') {
      validatePassword(value);
    }
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'phone') {
      // Telefon için formatlama yap
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validasyon
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.userType || !formData.terms) {
        setToast({
          message: 'Lütfen tüm alanları doldurun ve kullanım şartlarını kabul edin.',
          type: 'error',
          isVisible: true
        });
        setLoading(false);
        return;
      }

      const isValid = validatePassword(formData.password);
      if (!isValid) {
        setError('Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve sayı içermelidir.');
        setLoading(false);
        return;
      }

      // Telefon numarasını temizle (sadece sayılar)
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');

      const registerData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: cleanPhone,
        userType: formData.userType as 'ziraat' | 'sanayi',
        terms: formData.terms,
      };

      const response = await authService.register(registerData);

      // Eğer token varsa (ziraat/sanayi yöneticileri için), otomatik giriş yap
      if (response.token && response.user) {
        // Token ve user bilgisini localStorage'a kaydet
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        setToast({
          message: response.message || 'Kayıt başarılı! Otomatik giriş yapılıyor...',
          type: 'success',
          isVisible: true
        });
        
        // Seçilen oda türüne göre yönlendir
        setTimeout(() => {
          if (formData.userType === 'ziraat') {
            navigate('/admin/ziraat');
          } else if (formData.userType === 'sanayi') {
            navigate('/admin/sanayi');
          } else {
            navigate('/giris');
          }
        }, 1500);
      } else {
        // Token yoksa (normal kullanıcılar için), giriş sayfasına yönlendir
        setToast({
          message: response.message || 'Kayıt başarılı! Admin onayı bekleniyor.',
          type: 'success',
          isVisible: true
        });
        
        setTimeout(() => {
          navigate('/giris');
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Kayıt başarısız';
      const missingFields = err.response?.data?.missing;
      
      if (missingFields) {
        const missingList = Object.entries(missingFields)
          .filter(([_, isMissing]) => isMissing)
          .map(([field]) => field)
          .join(', ');
        setError(`${errorMessage} (Eksik alanlar: ${missingList})`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
            </svg>
            <h1 className="text-2xl font-bold text-content-light dark:text-content-dark">Yeşil-Eksen</h1>
          </div>
          <h2 className="text-3xl font-bold text-content-light dark:text-content-dark">Oda Kayıt Formu</h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="font-medium text-primary hover:text-primary/80 transition-colors">Giriş yapın</Link>
          </p>
          <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
            <Link to="/" className="font-medium text-primary hover:text-primary/80 transition-colors">← Anasayfaya Dön</Link>
          </p>
        </div>

        {/* Form İçeriği */}
        <form onSubmit={handleSubmit} className="bg-background-light dark:bg-background-dark rounded-xl p-8 border border-border-light dark:border-border-dark">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">Hesap Bilgileri</h2>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Ad */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Ad
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">person</span>
                  <input 
                    id="firstName" 
                    name="firstName" 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                    placeholder="Adınız"
                  />
                </div>
              </div>

              {/* Soyad */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Soyad
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">person</span>
                  <input 
                    id="lastName" 
                    name="lastName" 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">mail</span>    
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="E-posta adresiniz"
                  />
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Telefon *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">phone</span>
                  <input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    required 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="(5XX) XXX-XX-XX"
                  />
                </div>
              </div>  

              {/* Şifre */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">lock</span>
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                    placeholder="Şifreniz"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs flex items-center gap-1 ${passwordErrors.minLength ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                      <span className="material-symbols-outlined text-sm">{passwordErrors.minLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                      En az 8 karakter
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${passwordErrors.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                      <span className="material-symbols-outlined text-sm">{passwordErrors.hasUpperCase ? 'check_circle' : 'radio_button_unchecked'}</span>
                      En az bir büyük harf
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${passwordErrors.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                      <span className="material-symbols-outlined text-sm">{passwordErrors.hasLowerCase ? 'check_circle' : 'radio_button_unchecked'}</span>
                      En az bir küçük harf
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${passwordErrors.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-subtle-light dark:text-subtle-dark'}`}>
                      <span className="material-symbols-outlined text-sm">{passwordErrors.hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                      En az bir sayı
                    </div>
                  </div>
                )}
              </div>

              {/* Oda Türü */}
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Oda Türü
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-border-light dark:border-border-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                    <input 
                      type="radio" 
                      name="userType" 
                      value="ziraat" 
                      checked={formData.userType === 'ziraat'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark"
                    />
                    <div className="ml-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">agriculture</span>
                        <span className="text-sm font-medium text-content-light dark:text-content-dark">Ziraat Odası</span>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-border-light dark:border-border-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                    <input 
                      type="radio" 
                      name="userType" 
                      value="sanayi" 
                      checked={formData.userType === 'sanayi'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark"
                    />
                    <div className="ml-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">factory</span>
                        <span className="text-sm font-medium text-content-light dark:text-content-dark">Sanayi Odası</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Kullanım Şartları */}
              <div className="flex items-center">
                <input 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required 
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-subtle-light dark:text-subtle-dark">
                  <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary hover:text-primary/80 transition-colors">Kullanım şartlarını</button> ve{' '}
                  <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary hover:text-primary/80 transition-colors">gizlilik politikasını</button> kabul ediyorum
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                )}
                {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
              </button>
            </div>
          </div>
        </form>

        {/* Modals */}
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        
        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  )
}

export default IamGroot;
