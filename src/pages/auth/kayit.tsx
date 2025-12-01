import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import TermsModal from '../../components/TermsModal';
import PrivacyModal from '../../components/PrivacyModal';
import Toast from '../../components/Toast';

function Kayit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', isVisible: false });
  const [formData, setFormData] = useState({
    // Step 1: Temel Bilgiler
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '', // Telefon numarası Step 1'de alınacak
    userType: '',
    terms: false,
    // Step 2: Çiftlik/Şirket Bilgileri
    farmName: '',
    address: '',
    wasteTypes: [] as string[],
    otherWasteType: '',
    // Şirket için
    companyName: '',
    taxNumber: '',
    // Step 3: Belgeler - Bakanlığa Başvuru Sırasında Teslim Edilenler (Çiftçi için)
    tapuOrKiraDocument: null as File | null, // Tapu Senedi veya Onaylı Kira Sözleşmesi
    nufusCuzdani: null as File | null, // Nüfus Cüzdanı Fotokopisi
    ciftciKutuguKaydi: null as File | null, // Çiftçi Kütüğü Kaydı (Ziraat Odasından)
    muvafakatname: null as File | null, // Muvafakatname (Hisseli araziler için - Opsiyonel)
    taahhutname: null as File | null, // Taahhütname (Bakanlık matbu formu - Opsiyonel)
    donerSermayeMakbuz: null as File | null, // Döner Sermaye Ücret Makbuzu (Opsiyonel)
    // Step 3: Belgeler - Sanayi Odası İçin (Şirket için)
    ticaretSicilGazetesi: null as File | null, // Ticaret Sicil Gazetesi (Zorunlu)
    vergiLevhasi: null as File | null, // Vergi Levhası (Zorunlu)
    imzaSirkuleri: null as File | null, // İmza Sirküleri (Zorunlu)
    faaliyetBelgesi: null as File | null, // Faaliyet Belgesi (Zorunlu)
    odaKayitSicilSureti: null as File | null, // Oda Kayıt Sicil Sureti (Zorunlu)
    gidaIsletmeKayit: null as File | null, // Gıda İşletme Kayıt/Onay Belgesi (Opsiyonel)
    sanayiSicilBelgesi: null as File | null, // Sanayi Sicil Belgesi (Opsiyonel)
    kapasiteRaporu: null as File | null, // Kapasite Raporu (Opsiyonel)
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });
  const [emailCheck, setEmailCheck] = useState<{
    status: 'idle' | 'checking' | 'available' | 'duplicate' | 'error';
    message?: string;
    checkedEmail?: string;
    isRejected?: boolean; // Reddedilen kullanıcılar için özel renk
  }>({ status: 'idle' });

  // URL parametrelerinden gelen verileri formData'ya yükle
  useEffect(() => {
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const email = searchParams.get('email');
    const provider = searchParams.get('provider');

    if (firstName || lastName || email) {
      setFormData(prev => ({
        ...prev,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        // Sosyal medya girişi ile geldiyse şifre alanını boş bırak (kullanıcı girecek)
        ...(provider && { password: '' })
      }));
    }
  }, [searchParams]);

  // Dosya adını temizleme fonksiyonu (Türkçe karakterleri ve özel karakterleri kaldırır)
  const sanitizeFileName = (fileName: string): string => {
    // Dosya adını ve uzantısını ayır
    const lastDotIndex = fileName.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';

    // Türkçe karakterleri İngilizce karşılıklarına çevir
    const turkishToEnglish: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };

    let sanitized = nameWithoutExt
      .split('')
      .map(char => turkishToEnglish[char] || char)
      .join('');

    // Özel karakterleri ve boşlukları temizle (sadece harf, sayı, tire ve alt çizgi bırak)
    sanitized = sanitized
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Özel karakterleri alt çizgi ile değiştir
      .replace(/_+/g, '_') // Birden fazla alt çizgiyi tek alt çizgiye çevir
      .replace(/^_+|_+$/g, ''); // Başta ve sonda alt çizgileri kaldır

    // Eğer dosya adı boş kalırsa, varsayılan bir isim ver
    if (!sanitized) {
      sanitized = 'dosya';
    }

    // Uzantıyı ekle ve döndür
    return sanitized + extension;
  };

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

  // Sadece sayı girişi için handler
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Telefon için sayılar ve + karakteri, vergi numarası için sadece sayılar
    let numericValue: string;
    if (name === 'phone') {
      // Telefon için formatlama yap
      numericValue = formatPhoneNumber(value);
    } else {
      // Vergi numarası ve diğer sayısal alanlar için sadece sayılar
      numericValue = value.replace(/[^0-9]/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: numericValue }));
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
    
    // Şifre değiştiğinde validasyon yap
    if (name === 'password' && type !== 'file') {
      validatePassword(value);
    }

    if (name === 'email') {
      // E-posta değiştiğinde önceki kontrol sonuçlarını sıfırla
      setEmailCheck({ status: 'idle' });
    }
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      
      // Belge yüklendiğinde validasyon yap ve bildirim göster
      if (file) {
        const belgeIsimleri: { [key: string]: string } = {
          tapuOrKiraDocument: 'Tapu Senedi veya Kira Sözleşmesi',
          nufusCuzdani: 'Nüfus Cüzdanı',
          ciftciKutuguKaydi: 'Çiftçi Kütüğü Kaydı',
          muvafakatname: 'Muvafakatname',
          taahhutname: 'Taahhütname',
          donerSermayeMakbuz: 'Döner Sermaye Makbuzu',
          ticaretSicilGazetesi: 'Ticaret Sicil Gazetesi',
          vergiLevhasi: 'Vergi Levhası',
          imzaSirkuleri: 'İmza Sirküleri',
          faaliyetBelgesi: 'Faaliyet Belgesi',
          odaKayitSicilSureti: 'Oda Kayıt Sicil Sureti',
          gidaIsletmeKayit: 'Gıda İşletme Kayıt Belgesi',
          sanayiSicilBelgesi: 'Sanayi Sicil Belgesi',
          kapasiteRaporu: 'Kapasite Raporu'
        };
        
        const belgeAdi = belgeIsimleri[name] || 'Belge';
        const fileSizeMB = file.size / (1024 * 1024);
        const maxSizeMB = 5; // 5MB maksimum
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        
        // Validasyon kontrolleri
        let errorMessage = '';
        
        // Dosya boyutu kontrolü
        if (fileSizeMB > maxSizeMB) {
          errorMessage = `${belgeAdi} dosyası çok büyük! Maksimum ${maxSizeMB}MB olmalıdır. (Mevcut: ${fileSizeMB.toFixed(2)}MB)`;
        }
        // Dosya tipi kontrolü
        else if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
          errorMessage = `${belgeAdi} için geçersiz dosya formatı! Sadece PDF, JPG, JPEG ve PNG dosyaları yüklenebilir.`;
        }
        
        // Hata varsa göster ve dosyayı yükleme
        if (errorMessage) {
          setToast({
            message: errorMessage,
            type: 'error',
            isVisible: true
          });
          // Input'u temizle
          (e.target as HTMLInputElement).value = '';
          return;
        }
        
        // Dosya adını temizle (Türkçe karakterleri ve özel karakterleri kaldır)
        const sanitizedFileName = sanitizeFileName(file.name);
        const sanitizedFile = new File([file], sanitizedFileName, {
          type: file.type,
          lastModified: file.lastModified
        });
        
        // Başarılı yükleme
        setFormData(prev => ({ ...prev, [name]: sanitizedFile }));
        setToast({
          message: `${belgeAdi} başarıyla yüklendi (${fileSizeMB.toFixed(2)} MB)`,
          type: 'success',
          isVisible: true
        });
      } else {
        // Dosya seçimi iptal edildi
        setFormData(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const checkEmailAvailability = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailCheck({ status: 'idle' });
      return 'idle' as const;
    }

    if (
      emailCheck.checkedEmail === trimmedEmail &&
      (emailCheck.status === 'available' || emailCheck.status === 'duplicate')
    ) {
      return emailCheck.status;
    }

    setEmailCheck({ status: 'checking', checkedEmail: trimmedEmail });

    try {
      const response = await authService.checkEmail({ email: trimmedEmail, checkType: 'availability' });
      
      // Backend'den available bilgisi geliyor
      if (response.available === true) {
        // Backend'den gelen mesajı kullan (reddedilen kullanıcılar için özel mesaj olabilir)
        const message = response.message || 'Bu e-posta ile kayıt olabilirsiniz';
        const isRejected = message.toLowerCase().includes('reddedilmiş') || message.toLowerCase().includes('reddedildi');
        const availableState = { 
          status: 'available' as const, 
          checkedEmail: trimmedEmail,
          message: message,
          isRejected: isRejected
        };
        setEmailCheck(availableState);
        return availableState.status;
      } else if (response.available === false) {
        // E-posta zaten kayıtlı - Backend'den gelen mesajı kullan
        const duplicateState = {
          status: 'duplicate' as const,
          checkedEmail: trimmedEmail,
          message: response.message || 'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta kullanın.',
        };
        setEmailCheck(duplicateState);
        return duplicateState.status;
      } else {
        // Response'da available field'ı yoksa (eski backend versiyonu veya hata)
        // Bu durumda response.success'e bak
        if (response.success === true) {
          // E-posta kullanılabilir (eski mantık: 404 gelmediyse kullanılabilir)
          const availableState = { 
            status: 'available' as const, 
            checkedEmail: trimmedEmail,
            message: 'Bu e-posta ile kayıt olabilirsiniz',
            isRejected: false
          };
          setEmailCheck(availableState);
          return availableState.status;
        }
        // Diğer durumlar için duplicate kabul et
        const duplicateState = {
          status: 'duplicate' as const,
          checkedEmail: trimmedEmail,
          message: 'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta kullanın.',
        };
        setEmailCheck(duplicateState);
        return duplicateState.status;
      }
    } catch (err: any) {
      // 404 hatası e-posta kontrolü için aslında "kullanılabilir" demektir
      if (err.response?.status === 404) {
        const availableState = { 
          status: 'available' as const, 
          checkedEmail: trimmedEmail,
          message: 'Bu e-posta ile kayıt olabilirsiniz',
          isRejected: false
        };
        setEmailCheck(availableState);
        return availableState.status;
      }
      
      // Diğer hatalar için
      const errorMessage = err.response?.data?.message || 'E-posta kontrolü sırasında bir hata oluştu.';
      setEmailCheck({
        status: 'error',
        checkedEmail: trimmedEmail,
        message: errorMessage,
      });
      return 'error' as const;
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email) {
      setEmailCheck({ status: 'idle' });
      return;
    }
    await checkEmailAvailability(formData.email);
  };

  const handleWasteTypeChange = (wasteType: string) => {
    setFormData(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(wasteType)
        ? prev.wasteTypes.filter(w => w !== wasteType)
        : [...prev.wasteTypes, wasteType]
    }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const provider = searchParams.get('provider');
      // Sosyal medya girişi ile geliyorsa şifre zorunlu değil
      const isPasswordRequired = !provider;
      
      // Validasyon
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.userType || !formData.terms) {
        setToast({
          message: 'Lütfen tüm alanları doldurun ve kullanım şartlarını kabul edin.',
          type: 'error',
          isVisible: true
        });
        return;
      }
      
      // E-posta kontrolü - zaten kayıtlı mı?
      if (formData.email) {
        const emailStatus = await checkEmailAvailability(formData.email);
        if (emailStatus === 'duplicate') {
          const duplicateMessage = emailCheck.message || 'Lütfen Yeni Eposta ile devam ediniz';
          setError(duplicateMessage);
          setToast({
            message: duplicateMessage,
            type: 'error',
            isVisible: true
          });
          return;
        }
        if (emailStatus === 'error') {
          setError(emailCheck.message || 'E-posta kontrolü sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
          setToast({
            message: emailCheck.message || 'E-posta kontrolü sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            type: 'error',
            isVisible: true
          });
          return;
        }
      }
      
      if (isPasswordRequired && !formData.password) {
        setToast({
          message: 'Lütfen şifre alanını doldurun.',
          type: 'error',
          isVisible: true
        });
        return;
      }
      
      // Şifre validasyonu kontrolü
      if (isPasswordRequired && formData.password) {
        const isValid = validatePassword(formData.password);
        if (!isValid) {
          setToast({
            message: 'Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve sayı içermelidir.',
            type: 'error',
            isVisible: true
          });
          return;
        }
      }
    }
    
    // Step 2 validasyonu - Telefon numarası kontrolü
    if (currentStep === 2) {
      if (!formData.phone || formData.phone.trim() === '') {
        setToast({
          message: 'Lütfen telefon numarasını girin.',
          type: 'error',
          isVisible: true
        });
        return;
      }
      
      // Telefon numarasını temizle ve kontrol et
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setToast({
          message: 'Lütfen geçerli bir telefon numarası girin (en az 10 haneli).',
          type: 'error',
          isVisible: true
        });
        return;
      }
      
      // Çiftçi için çiftlik adı ve adres kontrolü
      if (formData.userType === 'farmer') {
        if (!formData.farmName || formData.farmName.trim() === '') {
          setToast({
            message: 'Lütfen çiftlik adını girin.',
            type: 'error',
            isVisible: true
          });
          return;
        }
        if (!formData.address || formData.address.trim() === '') {
          setToast({
            message: 'Lütfen adres bilgisini girin.',
            type: 'error',
            isVisible: true
          });
          return;
        }
      }
      
      // Şirket için şirket adı, vergi numarası ve adres kontrolü
      if (formData.userType === 'company') {
        if (!formData.companyName || formData.companyName.trim() === '') {
          setToast({
            message: 'Lütfen şirket adını girin.',
            type: 'error',
            isVisible: true
          });
          return;
        }
        if (!formData.taxNumber || formData.taxNumber.trim() === '') {
          setToast({
            message: 'Lütfen vergi numarasını girin.',
            type: 'error',
            isVisible: true
          });
          return;
        }
        if (!formData.address || formData.address.trim() === '') {
          setToast({
            message: 'Lütfen adres bilgisini girin.',
            type: 'error',
            isVisible: true
          });
          return;
        }
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Progress bar'daki step.number direkt currentStep ile eşleşiyor
    setCurrentStep(stepNumber);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Şifre kontrolü - Sosyal medya girişi için opsiyonel ama normal kayıt için zorunlu
      const provider = searchParams.get('provider');
      if (!provider && !formData.password) {
        setError('Lütfen şifre alanını doldurun.');
        setLoading(false);
        return;
      }
      
      // Şifre validasyonu kontrolü
      if (!provider && formData.password) {
        const isValid = validatePassword(formData.password);
        if (!isValid) {
          setError('Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve sayı içermelidir.');
          setLoading(false);
          return;
        }
      }

      // E-posta daha önce kullanılmış mı kontrol et
      const emailStatus = await checkEmailAvailability(formData.email);
      if (emailStatus === 'duplicate') {
        const duplicateMessage = emailCheck.message || 'Lütfen Yeni Eposta ile devam ediniz';
        setError(duplicateMessage);
        setToast({
          message: duplicateMessage,
          type: 'error',
          isVisible: true,
        });
        setLoading(false);
        return;
      }
      if (emailStatus === 'error') {
        setError(emailCheck.message || 'E-posta kontrolü sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
        return;
      }

      // Zorunlu belgeler kontrolü
      const missingDocuments: string[] = [];
      
      if (formData.userType === 'farmer') {
        // Çiftçi için zorunlu belgeler
        if (!formData.tapuOrKiraDocument) {
          missingDocuments.push('Tapu Senedi veya Onaylı Kira Sözleşmesi');
        }
        if (!formData.nufusCuzdani) {
          missingDocuments.push('Nüfus Cüzdanı Fotokopisi');
        }
        if (!formData.ciftciKutuguKaydi) {
          missingDocuments.push('Çiftçi Kütüğü Kaydı');
        }
      } else if (formData.userType === 'company') {
        // Şirket için zorunlu belgeler
        if (!formData.ticaretSicilGazetesi) {
          missingDocuments.push('Ticaret Sicil Gazetesi');
        }
        if (!formData.vergiLevhasi) {
          missingDocuments.push('Vergi Levhası');
        }
        if (!formData.imzaSirkuleri) {
          missingDocuments.push('İmza Sirküleri');
        }
        if (!formData.faaliyetBelgesi) {
          missingDocuments.push('Faaliyet Belgesi');
        }
        if (!formData.odaKayitSicilSureti) {
          missingDocuments.push('Oda Kayıt Sicil Sureti');
        }
      }
      
      // Eksik belgeler varsa uyarı ver
      if (missingDocuments.length > 0) {
        setToast({
          message: `Lütfen zorunlu belgeleri yükleyin: ${missingDocuments.join(', ')}`,
          type: 'error',
          isVisible: true
        });
        setLoading(false);
        return;
      }

      // Telefon numarası kontrolü
      if (!formData.phone || formData.phone.trim() === '') {
        setToast({
          message: 'Lütfen telefon numarasını girin.',
          type: 'error',
          isVisible: true
        });
        setLoading(false);
        return;
      }

      // Register verilerini hazırla
      // Telefon numarasını temizle (sadece sayılar)
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      
      // Temizlenmiş telefon numarası kontrolü (en az 10 haneli olmalı)
      if (!cleanPhone || cleanPhone.length < 10) {
        setToast({
          message: 'Lütfen geçerli bir telefon numarası girin (en az 10 haneli).',
          type: 'error',
          isVisible: true
        });
        setLoading(false);
        return;
      }
      
      const registerData: any = {
        // Temel bilgiler
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password || 'temp_password_' + Date.now(), // Sosyal medya için geçici şifre
        userType: formData.userType as 'farmer' | 'company' | 'ziraat' | 'sanayi',
        phone: cleanPhone,
        terms: formData.terms
      };

      // Kullanıcı tipine göre bilgileri ekle
      if (formData.userType === 'farmer') {
        // Çiftlik bilgileri
        registerData.farmName = formData.farmName;
        registerData.address = formData.address;
        registerData.wasteTypes = formData.wasteTypes;
        if (formData.otherWasteType) {
          registerData.otherWasteType = formData.otherWasteType;
        }
        
        // Çiftçi belgeleri
        registerData.tapuOrKiraDocument = formData.tapuOrKiraDocument;
        registerData.nufusCuzdani = formData.nufusCuzdani;
        registerData.ciftciKutuguKaydi = formData.ciftciKutuguKaydi;
        registerData.muvafakatname = formData.muvafakatname;
        registerData.taahhutname = formData.taahhutname;
        registerData.donerSermayeMakbuz = formData.donerSermayeMakbuz;

      } else if (formData.userType === 'company') {
        // Şirket bilgileri
        registerData.companyName = formData.companyName;
        registerData.taxNumber = formData.taxNumber;
        registerData.address = formData.address;
        
        // Şirket belgeleri
        registerData.ticaretSicilGazetesi = formData.ticaretSicilGazetesi;
        registerData.vergiLevhasi = formData.vergiLevhasi;
        registerData.imzaSirkuleri = formData.imzaSirkuleri;
        registerData.faaliyetBelgesi = formData.faaliyetBelgesi;
        registerData.odaKayitSicilSureti = formData.odaKayitSicilSureti;
        registerData.gidaIsletmeKayit = formData.gidaIsletmeKayit;
        registerData.sanayiSicilBelgesi = formData.sanayiSicilBelgesi;
        registerData.kapasiteRaporu = formData.kapasiteRaporu;
      }

      // Kayıt işlemini başlat
      await authService.register(registerData);

      setToast({
        message: 'Kayıt başarılı! Admin onayı bekleniyor.',
        type: 'success',
        isVisible: true
      });
      
      // Toast mesajını gösterdikten sonra yönlendir
      setTimeout(() => {
        navigate('/giris');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Kayıt hatası:', err);
      console.error('Hata detayları:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 'Kayıt başarısız';
      const missingFields = err.response?.data?.missing;
      const errorField = err.response?.data?.field;
      
      if (missingFields) {
        const missingList = Object.entries(missingFields)
          .filter(([_, isMissing]) => isMissing)
          .map(([field]) => {
            // Türkçe alan isimleri
            const fieldNames: Record<string, string> = {
              firstName: 'Ad',
              lastName: 'Soyad',
              email: 'E-posta',
              userType: 'Kullanıcı Tipi',
              phone: 'Telefon'
            };
            return fieldNames[field] || field;
          })
          .join(', ');
        setError(`${errorMessage} (Eksik alanlar: ${missingList})`);
      } else if (errorField) {
        const fieldNames: Record<string, string> = {
          password: 'Şifre',
          email: 'E-posta'
        };
        const fieldName = fieldNames[errorField] || errorField;
        setError(`${errorMessage} (${fieldName})`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Hesap Bilgileri' },
    { number: 2, label: formData.userType === 'farmer' ? 'Çiftlik Bilgileri' : 'Şirket Bilgileri' },
    { number: 3, label: 'Belge Yükleme' },
    { number: 4, label: 'Onay' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
            </svg>
            <h1 className="text-2xl font-bold text-content-light dark:text-content-dark">Yeşil-Eksen</h1>
          </div>
          <h2 className="text-3xl font-bold text-content-light dark:text-content-dark">Hesap Oluşturun</h2>
          <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="font-medium text-primary hover:text-primary/80 transition-colors">Giriş yapın</Link>
          </p>
          <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">
            <Link to="/" className="font-medium text-primary hover:text-primary/80 transition-colors">← Anasayfaya Dön</Link>
          </p>
        </div>

        {/* Adım Göstergesi */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const isActive = currentStep >= step.number;
                const isCompleted = currentStep > step.number;
                const isClickable = step.number <= currentStep; // Sadece kendinden önceki adımlara tıklanabilir
                  
                  return (
                    <div key={step.number} className="flex items-center">
                      <div 
                        className={`flex items-center transition-opacity ${
                          isClickable 
                            ? 'cursor-pointer hover:opacity-80' 
                            : 'cursor-not-allowed opacity-50'
                        }`}
                        onClick={isClickable ? () => handleStepClick(step.number) : undefined}
                        title={isClickable ? `${step.label} adımına git` : 'Bu adıma henüz ulaşmadınız'}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : isClickable
                            ? 'bg-border-light dark:bg-border-dark text-subtle-light dark:text-subtle-dark hover:bg-primary/20'
                            : 'bg-border-light dark:bg-border-dark text-subtle-light dark:text-subtle-dark'
                        }`}>
                          {step.number}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${
                          isActive
                            ? 'text-primary'
                            : 'text-subtle-light dark:text-subtle-dark'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 ${
                          isCompleted
                            ? 'bg-primary'
                            : 'bg-border-light dark:bg-border-dark'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Form İçeriği */}
        <form onSubmit={handleSubmit} className="bg-background-light dark:bg-background-dark rounded-xl p-8 border border-border-light dark:border-border-dark">
          {/* Step 1: Hesap Bilgileri */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">Hesap Bilgileri</h2>
              
              {/* Error Message */}
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
                    {searchParams.get('provider') && (
                      <span className="text-xs text-subtle-light dark:text-subtle-dark ml-1">
                        (GitHub ile giriş yaptınız)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">mail</span>    
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      required 
                      readOnly={!!searchParams.get('provider')}
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={searchParams.get('provider') ? undefined : handleEmailBlur}
                      className={`w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${searchParams.get('provider') ? 'opacity-75 cursor-not-allowed' : ''}`}
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                  {!searchParams.get('provider') && (
                    <>
                      {emailCheck.status === 'checking' && (
                        <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">E-posta kontrol ediliyor...</p>
                      )}
                      {emailCheck.status === 'available' && (
                        <p className={`mt-2 text-sm ${
                          emailCheck.isRejected 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {emailCheck.message || 'Bu e-posta ile kayıt olabilirsiniz'}
                        </p>
                      )}
                      {emailCheck.status === 'duplicate' && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{emailCheck.message}</p>
                      )}
                      {emailCheck.status === 'error' && (
                        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{emailCheck.message}</p>
                      )}
                    </>
                  )}
                </div>  

                {/* Şifre */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                    Şifre {!searchParams.get('provider') && '*'}
                    {searchParams.get('provider') && <span className="text-xs text-subtle-light dark:text-subtle-dark ml-1">(Opsiyonel - Sosyal medya girişi)</span>}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">lock</span>
                    <input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      required={!searchParams.get('provider')}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                      placeholder={searchParams.get('provider') ? "Şifreniz (Opsiyonel)" : "Şifreniz"}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {/* Şifre Validasyon Mesajları */}
                  {!searchParams.get('provider') && formData.password && (
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

                {/* Telefon Numarası */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                    Cep Telefonu *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">phone</span>
                    <input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={handleNumericInput}
                      className="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                      placeholder="(5XX) XXX-XX-XX"
                    />
                  </div>
                </div>

                {/* Kullanıcı Türü */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                    Kullanıcı Türü
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border border-border-light dark:border-border-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input 
                        type="radio" 
                        name="userType" 
                        value="farmer" 
                        checked={formData.userType === 'farmer'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">agriculture</span>
                          <span className="text-sm font-medium text-content-light dark:text-content-dark">Çiftçi</span>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-border-light dark:border-border-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input 
                        type="radio" 
                        name="userType" 
                        value="company" 
                        checked={formData.userType === 'company'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">business</span>
                          <span className="text-sm font-medium text-content-light dark:text-content-dark">Şirket</span>
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
                  type="button" 
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Çiftlik/Şirket Bilgileri */}
          {currentStep === 2 && formData.userType === 'farmer' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">Çiftlik Bilgileri</h2>
              
              <div className="space-y-6">
                {/* Çiftlik Adı */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Çiftlik Adı *</label>
                  <input 
                    type="text" 
                    name="farmName"
                    required 
                    value={formData.farmName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Çiftlik adınızı girin"
                  />
                </div>

                {/* İletişim Bilgileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Telefon *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required 
                      value={formData.phone}
                      onChange={handleNumericInput}
                      className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                      placeholder="(5XX) XXX-XX-XX"
                    />
                    <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">Hesap bilgileri adımından otomatik dolduruldu</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">E-posta</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark opacity-60" 
                      placeholder={formData.email}
                    />
                  </div>
                </div>

                {/* Adres Bilgileri */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Adres *</label>
                  <textarea 
                    required 
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Tam adresinizi girin"
                  ></textarea>
                </div>

                {/* Atık Türleri (Satış için) */}
                <div className="border-t border-border-light dark:border-border-dark pt-6">
                  <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">Satış Yapacağınız Atık Türleri *</h3>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">Sanayi firmalarına satışa sunacağınız atık türlerini seçin</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'hayvansal-gubre', label: 'Hayvansal Gübre', icon: 'pets' },
                      { value: 'bitkisel-atik', label: 'Bitkisel Atık', icon: 'eco' },
                      { value: 'tarimsal-sanayi', label: 'Tarımsal Sanayi Yan Ürünü', icon: 'factory' },
                      { value: 'organik-atik', label: 'Organik Atık', icon: 'recycling' },
                      { value: 'biyokutle', label: 'Biyokütle', icon: 'energy_savings_leaf' },
                      { value: 'diger', label: 'Diğer Atık Türleri', icon: 'category' }
                    ].map((waste) => (
                      <label key={waste.value} className="flex items-center p-4 border border-border-light dark:border-border-dark rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.wasteTypes.includes(waste.value)}
                          onChange={() => handleWasteTypeChange(waste.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-border-light dark:border-border-dark rounded"
                        />
                        <div className="ml-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">{waste.icon}</span>
                          <span className="text-sm font-medium text-content-light dark:text-content-dark">{waste.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {/* Diğer Atık Türü Input (Sadece "Diğer" seçildiğinde görünür) */}
                  {formData.wasteTypes.includes('diger') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Diğer Atık Türü Açıklaması *
                      </label>
                      <input 
                        type="text" 
                        name="otherWasteType"
                        required={formData.wasteTypes.includes('diger')}
                        value={formData.otherWasteType}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                        placeholder="Lütfen atık türünü açıklayın"
                      />
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-between pt-6">
                <button 
                  type="button" 
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-6 py-3 border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Geri
                </button>
                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Şirket Bilgileri */}
          {currentStep === 2 && formData.userType === 'company' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">Şirket Bilgileri</h2>
              
              <div className="space-y-6">
                {/* Şirket Adı */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Şirket Adı *</label>
                  <input 
                    type="text" 
                    name="companyName"
                    required 
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Şirket adınızı girin"
                  />
                </div>

                {/* İletişim Bilgileri */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Telefon *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required 
                    value={formData.phone}
                    onChange={handleNumericInput}
                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="(5XX) XXX-XX-XX"
                  />
                </div>

                {/* Vergi Numarası */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Vergi Numarası *</label>
                  <input 
                    type="text" 
                    name="taxNumber"
                    required 
                    value={formData.taxNumber}
                    onChange={handleNumericInput}
                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Vergi numaranızı girin"
                  />
                </div>

                {/* Adres Bilgileri */}
                <div>
                  <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">Adres *</label>
                  <textarea 
                    required 
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Tam adresinizi girin"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button 
                  type="button" 
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-6 py-3 border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Geri
                </button>
                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Belge Yükleme */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">Gerekli Belgeler</h2>
              
              <div className="space-y-6">
                {/* Zorunlu Belgeler */}
                <div className="border-t border-border-light dark:border-border-dark pt-4">
                  <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    Zorunlu Belgeler
                  </h3>

                  {/* Tapu Senedi veya Onaylı Kira Sözleşmesi (Sadece çiftçi için) */}
                  {formData.userType === 'farmer' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Tapu Senedi veya Onaylı Kira Sözleşmesi *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Arazi mülkiyetini veya kullanım hakkını gösteren resmi belge
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.tapuOrKiraDocument && (
                          <p className="text-sm text-primary mt-2">{formData.tapuOrKiraDocument.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="tapuOrKiraDocument"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  )}

                  {/* Nüfus Cüzdanı Fotokopisi */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                      Nüfus Cüzdanı Fotokopisi *
                    </label>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                      İşletme sahibinin TC kimlik belgesi fotokopisi
                    </p>
                    <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                      <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                      {formData.nufusCuzdani && (
                        <p className="text-sm text-primary mt-2">{formData.nufusCuzdani.name}</p>
                      )}
                      <input 
                        type="file" 
                        name="nufusCuzdani"
                        onChange={handleInputChange}
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>

                  {/* Çiftçi Kütüğü Kaydı (Sadece çiftçi için) */}
                  {formData.userType === 'farmer' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Çiftçi Kütüğü Kaydı *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Ziraat Odasından alınan çiftçi kayıt belgesi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.ciftciKutuguKaydi && (
                          <p className="text-sm text-primary mt-2">{formData.ciftciKutuguKaydi.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="ciftciKutuguKaydi"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Opsiyonel Belgeler (Sadece çiftçi için) */}
                {formData.userType === 'farmer' && (
                  <div className="border-t border-border-light dark:border-border-dark pt-4">
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">add_circle</span>
                      Opsiyonel Belgeler
                    </h3>

                    {/* Muvafakatname */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Muvafakatname
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Hisseli araziler için gereklidir
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.muvafakatname && (
                          <p className="text-sm text-primary mt-2">{formData.muvafakatname.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="muvafakatname"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Taahhütname */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Taahhütname
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Bakanlık matbu formu
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.taahhutname && (
                          <p className="text-sm text-primary mt-2">{formData.taahhutname.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="taahhutname"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Döner Sermaye Ücret Makbuzu */}
                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Döner Sermaye Ücret Makbuzu
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Başvuru ücreti ödeme belgesi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.donerSermayeMakbuz && (
                          <p className="text-sm text-primary mt-2">{formData.donerSermayeMakbuz.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="donerSermayeMakbuz"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* ŞİRKET İÇİN BELGELER */}
              {formData.userType === 'company' && (
                <div className="space-y-6">
                  {/* Zorunlu Belgeler */}
                  <div className="border-t border-border-light dark:border-border-dark pt-4">
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">verified</span>
                      Zorunlu Belgeler
                    </h3>

                    {/* Ticaret Sicil Gazetesi */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Ticaret Sicil Gazetesi *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Şirket kuruluş ve tescil belgesi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.ticaretSicilGazetesi && (
                          <p className="text-sm text-primary mt-2">{formData.ticaretSicilGazetesi.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="ticaretSicilGazetesi"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Vergi Levhası */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Vergi Levhası *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Şirketin vergi kaydını gösterir
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.vergiLevhasi && (
                          <p className="text-sm text-primary mt-2">{formData.vergiLevhasi.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="vergiLevhasi"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* İmza Sirküleri */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        İmza Sirküleri *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Yetkili imza örnekleri belgesi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.imzaSirkuleri && (
                          <p className="text-sm text-primary mt-2">{formData.imzaSirkuleri.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="imzaSirkuleri"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Faaliyet Belgesi */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Faaliyet Belgesi *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Ticaret veya Sanayi Odasından güncel faaliyet belgesi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.faaliyetBelgesi && (
                          <p className="text-sm text-primary mt-2">{formData.faaliyetBelgesi.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="faaliyetBelgesi"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Oda Kayıt Sicil Sureti */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Oda Kayıt Sicil Sureti *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Ticaret veya Sanayi Odasına kayıt belgesi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.odaKayitSicilSureti && (
                          <p className="text-sm text-primary mt-2">{formData.odaKayitSicilSureti.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="odaKayitSicilSureti"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Nüfus Cüzdanı Fotokopisi */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Nüfus Cüzdanı Fotokopisi *
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        İşletme sahibinin TC kimlik belgesi fotokopisi
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.nufusCuzdani && (
                          <p className="text-sm text-primary mt-2">{formData.nufusCuzdani.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="nufusCuzdani"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Opsiyonel Belgeler */}
                  <div className="border-t border-border-light dark:border-border-dark pt-4">
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">add_circle</span>
                      Opsiyonel Belgeler
                    </h3>

                    {/* Gıda İşletme Kayıt/Onay Belgesi */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Gıda İşletme Kayıt / Onay Belgesi
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Tarım Bakanlığından (Gıda işletmeleri için gerekli)
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.gidaIsletmeKayit && (
                          <p className="text-sm text-primary mt-2">{formData.gidaIsletmeKayit.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="gidaIsletmeKayit"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Sanayi Sicil Belgesi */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Sanayi Sicil Belgesi
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Üretim yapan firmalar için gereklidir
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.sanayiSicilBelgesi && (
                          <p className="text-sm text-primary mt-2">{formData.sanayiSicilBelgesi.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="sanayiSicilBelgesi"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {/* Kapasite Raporu */}
                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Kapasite Raporu
                      </label>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark mb-2">
                        Üretim yapan firmalar için gereklidir
                      </p>
                      <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">upload_file</span>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">PDF/JPG/PNG formatında yükleyin</p>
                        {formData.kapasiteRaporu && (
                          <p className="text-sm text-primary mt-2">{formData.kapasiteRaporu.name}</p>
                        )}
                        <input 
                          type="file" 
                          name="kapasiteRaporu"
                          onChange={handleInputChange}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button 
                  type="button" 
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-6 py-3 border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Geri
                </button>
                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Onay */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">Kayıt Özeti</h2>
              
              <div className="space-y-4">
                <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                  <h3 className="font-semibold text-content-light dark:text-content-dark mb-3">Hesap Bilgileri</h3>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Ad: {formData.firstName} {formData.lastName}</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">E-posta: {formData.email}</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Kullanıcı Türü: {formData.userType === 'farmer' ? 'Çiftçi' : 'Şirket'}</p>
                </div>

                {formData.userType === 'farmer' && (
                  <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                    <h3 className="font-semibold text-content-light dark:text-content-dark mb-3">Çiftlik Bilgileri</h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Çiftlik Adı: {formData.farmName}</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Telefon: {formData.phone}</p>
                    
                    {formData.wasteTypes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-content-light dark:text-content-dark mb-1">Satış Yapacağınız Atık Türleri:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.wasteTypes.map((waste) => {
                            const wasteLabels: { [key: string]: string } = {
                              'hayvansal-gubre': 'Hayvansal Gübre',
                              'bitkisel-atik': 'Bitkisel Atık',
                              'tarimsal-sanayi': 'Tarımsal Sanayi Yan Ürünü',
                              'organik-atik': 'Organik Atık',
                              'biyokutle': 'Biyokütle',
                              'diger': formData.otherWasteType ? `Diğer: ${formData.otherWasteType}` : 'Diğer Atık Türleri'
                            };
                            return (
                              <span key={waste} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                {wasteLabels[waste] || waste}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                  </div>
                )}

                {formData.userType === 'company' && (
                  <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                    <h3 className="font-semibold text-content-light dark:text-content-dark mb-3">Şirket Bilgileri</h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Şirket Adı: {formData.companyName}</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Telefon: {formData.phone}</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Vergi Numarası: {formData.taxNumber}</p>
                  </div>
                )}

                <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                  <h3 className="font-semibold text-content-light dark:text-content-dark mb-3">Yüklenen Belgeler</h3>
                  
                  {/* ÇİFTÇİ BELGELERİ */}
                  {formData.userType === 'farmer' && (
                    <>
                      {/* Zorunlu Belgeler */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1">Zorunlu Belgeler:</p>
                        {formData.tapuOrKiraDocument && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Tapu/Kira: {formData.tapuOrKiraDocument.name}
                          </p>
                        )}
                        {formData.nufusCuzdani && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Nüfus Cüzdanı: {formData.nufusCuzdani.name}
                          </p>
                        )}
                        {formData.ciftciKutuguKaydi && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Çiftçi Kütüğü: {formData.ciftciKutuguKaydi.name}
                          </p>
                        )}
                      </div>

                      {/* Opsiyonel Belgeler */}
                      {(formData.muvafakatname || formData.taahhutname || formData.donerSermayeMakbuz) && (
                        <div>
                          <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1">Opsiyonel Belgeler:</p>
                          {formData.muvafakatname && (
                            <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                              Muvafakatname: {formData.muvafakatname.name}
                            </p>
                          )}
                          {formData.taahhutname && (
                            <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                              Taahhütname: {formData.taahhutname.name}
                            </p>
                          )}
                          {formData.donerSermayeMakbuz && (
                            <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                              Döner Sermaye Makbuzu: {formData.donerSermayeMakbuz.name}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* ŞİRKET BELGELERİ */}
                  {formData.userType === 'company' && (
                    <>
                      {/* Zorunlu Belgeler */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1">Zorunlu Belgeler:</p>
                        {formData.ticaretSicilGazetesi && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Ticaret Sicil Gazetesi: {formData.ticaretSicilGazetesi.name}
                          </p>
                        )}
                        {formData.vergiLevhasi && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Vergi Levhası: {formData.vergiLevhasi.name}
                          </p>
                        )}
                        {formData.imzaSirkuleri && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            İmza Sirküleri: {formData.imzaSirkuleri.name}
                          </p>
                        )}
                        {formData.faaliyetBelgesi && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Faaliyet Belgesi: {formData.faaliyetBelgesi.name}
                          </p>
                        )}
                        {formData.odaKayitSicilSureti && (
                          <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                            Oda Kayıt Sicil Sureti: {formData.odaKayitSicilSureti.name}
                          </p>
                        )}
                      </div>

                      {/* Opsiyonel Belgeler */}
                      {(formData.gidaIsletmeKayit || formData.sanayiSicilBelgesi || formData.kapasiteRaporu) && (
                        <div>
                          <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1">Opsiyonel Belgeler:</p>
                          {formData.gidaIsletmeKayit && (
                            <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                              Gıda İşletme Kayıt: {formData.gidaIsletmeKayit.name}
                            </p>
                          )}
                          {formData.sanayiSicilBelgesi && (
                            <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                              Sanayi Sicil Belgesi: {formData.sanayiSicilBelgesi.name}
                            </p>
                          )}
                          {formData.kapasiteRaporu && (
                            <p className="text-sm text-content-light dark:text-content-dark flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                              Kapasite Raporu: {formData.kapasiteRaporu.name}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button 
                  type="button" 
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-6 py-3 border border-border-light dark:border-border-dark rounded-lg text-content-light dark:text-content-dark hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Geri
                </button>
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
          )}
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

export default Kayit;
