import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CftNavbar from '../../components/cftnavbar';
import { ciftciService } from '../../services/ciftciService';

// Birim seçenekleri
const unitOptions = {
  solid: [
    { value: 'ton', label: 'Ton' },
    { value: 'kg', label: 'Kg' },
  ],
  liquid: [
    { value: 'm3', label: 'm³' },
    { value: 'litre', label: 'Litre' },
  ],
  all: [
    { value: 'ton', label: 'Ton' },
    { value: 'kg', label: 'Kg' },
    { value: 'm3', label: 'm³' },
    { value: 'litre', label: 'Litre' },
  ],
};

// Atık türleri ve özellikleri
// Kategori: 'hayvansal' | 'bitkisel' | 'endustriyel'
// Talep seviyesi: 'yuksek' | 'orta' | 'dusuk'
const wasteTypes = [
  { value: 'hayvansal-gubre', label: 'Hayvansal Gübre', icon: 'pets', category: 'hayvansal', defaultUnit: 'ton', unitType: 'solid', energyPotential: '33-78', usageAreas: ['Organik Gübre', 'Biyogaz'], marketValue: '400-600', demandLevel: 'yuksek', categoryValue: 'Yüksek' },
  { value: 'misir-sapi', label: 'Mısır Sapı', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', energyPotential: '380-460', usageAreas: ['Biyogaz', 'Hayvan Yemi'], marketValue: '250-400', demandLevel: 'yuksek', categoryValue: '85' },
  { value: 'bugday-samani', label: 'Buğday Samanı', icon: 'grass', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', energyPotential: '200-300', usageAreas: ['Biyokütle Enerji', 'Kompost'], marketValue: '200-350', demandLevel: 'orta', categoryValue: '80' },
  { value: 'aycicegi-sapi', label: 'Ayçiçeği Sapı', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', energyPotential: '594', usageAreas: ['Biyogaz'], marketValue: '180-300', demandLevel: 'orta', categoryValue: '75' },
  { value: 'pamuk-atik', label: 'Pamuk Atığı', icon: 'factory', category: 'endustriyel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Biyokütle Enerji', 'Tekstil'], marketValue: '150-250', demandLevel: 'orta', categoryValue: '70' },
  { value: 'zeytin-karasuyu', label: 'Zeytin Karasuyu', icon: 'water_drop', category: 'endustriyel', defaultUnit: 'm3', unitType: 'liquid', usageAreas: ['Biyogaz'], marketValue: '100-200', demandLevel: 'dusuk', categoryValue: '65' },
  { value: 'sebze-atiklari', label: 'Sebze Atıkları', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', energyPotential: '330-360', usageAreas: ['Kompost', 'Biyogaz'], marketValue: '120-200', demandLevel: 'yuksek', categoryValue: '90' },
  { value: 'arpa-samani', label: 'Arpa Samanı', icon: 'grass', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', energyPotential: '290-310', usageAreas: ['Hayvan Yemi', 'Biyokütle Enerji'], marketValue: '180-280', demandLevel: 'orta', categoryValue: '82' },
  { value: 'yonca-atik', label: 'Yonca Atığı', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Hayvan Yemi'], marketValue: '300-450', demandLevel: 'yuksek', categoryValue: '88' },
  { value: 'pirinc-kabugu', label: 'Pirinç Kabuğu', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Biyogaz', 'Kompost'], marketValue: '100-180', demandLevel: 'dusuk', categoryValue: '70' },
  { value: 'meyve-atiklari', label: 'Meyve Atıkları', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Biyogaz'], marketValue: '150-250', demandLevel: 'orta', categoryValue: '85' },
  { value: 'tavuk-gubresi', label: 'Tavuk Gübresi', icon: 'pets', category: 'hayvansal', defaultUnit: 'ton', unitType: 'solid', energyPotential: '78', usageAreas: ['Organik Gübre', 'Biyogaz'], marketValue: '350-500', demandLevel: 'yuksek', categoryValue: 'Yüksek' },
  { value: 'sigir-gubresi', label: 'Sığır Gübresi', icon: 'pets', category: 'hayvansal', defaultUnit: 'ton', unitType: 'solid', energyPotential: '33', usageAreas: ['Organik Gübre', 'Biyogaz'], marketValue: '400-600', demandLevel: 'yuksek', categoryValue: 'Yüksek' },
  { value: 'koyun-gubresi', label: 'Koyun Gübresi', icon: 'pets', category: 'hayvansal', defaultUnit: 'ton', unitType: 'solid', energyPotential: '58', usageAreas: ['Organik Gübre', 'Biyogaz'], marketValue: '450-650', demandLevel: 'yuksek', categoryValue: 'Yüksek' },
  { value: 'odun-talasi', label: 'Odun Talaşı', icon: 'forest', category: 'endustriyel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Kompost', 'Biyokütle Enerji'], marketValue: '200-300', demandLevel: 'orta', categoryValue: '75' },
  { value: 'findik-kabugu', label: 'Fındık Kabuğu', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Biyokütle Yakıt'], marketValue: '250-400', demandLevel: 'orta', categoryValue: '78' },
  { value: 'ceviz-kabugu', label: 'Ceviz Kabuğu', icon: 'eco', category: 'bitkisel', defaultUnit: 'ton', unitType: 'solid', usageAreas: ['Biyokütle Enerji', 'Kompost'], marketValue: '220-350', demandLevel: 'orta', categoryValue: '80' },
  { value: 'diger', label: 'Diğer (Manuel Giriş)', icon: 'category', category: 'bitkisel', defaultUnit: 'ton', unitType: 'all', usageAreas: [], marketValue: '100-300', demandLevel: 'orta', categoryValue: '70' },
];

// Dosya state interface
interface FileState {
  file: File | null;
  preview: string | null;
  name: string;
}

function AtikEkle() {
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [customWasteName, setCustomWasteName] = useState(''); // Diğer atık türü için manuel ad
  const [miktar, setMiktar] = useState('');
  const [salesUnit, setSalesUnit] = useState('ton');
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [hasGuarantee, setHasGuarantee] = useState(false);
  const [isWasteTypeModalOpen, setIsWasteTypeModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false); // Satış birimi pop-up için
  const [wasteTypeSearch, setWasteTypeSearch] = useState('');
  
  // Dosya state'leri - Her tür için sadece 1 dosya
  const [productPhoto, setProductPhoto] = useState<FileState>({ file: null, preview: null, name: '' });
  const [originDocument, setOriginDocument] = useState<FileState>({ file: null, preview: null, name: '' });
  const [analysisReport, setAnalysisReport] = useState<FileState>({ file: null, preview: null, name: '' });
  const [guaranteeDocument, setGuaranteeDocument] = useState<FileState>({ file: null, preview: null, name: '' });
  const [additionalPhoto, setAdditionalPhoto] = useState<FileState>({ file: null, preview: null, name: '' }); // Tek dosya
  const [qualityCertificate, setQualityCertificate] = useState<FileState>({ file: null, preview: null, name: '' }); // Tek dosya
  
  // Form durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Seçilen atık türünün bilgilerini al
  const selectedWaste = wasteTypes.find(w => w.value === selectedWasteType);

  // Seçilen atık türüne göre varsayılan birimi ayarla ve miktarı sıfırla
  useEffect(() => {
    if (selectedWasteType && selectedWaste) {
      // Diğer atık türü seçildiğinde birim modal'ını açma, sadece varsayılan birimi ayarla
      if (selectedWasteType !== 'diger') {
        setSalesUnit(selectedWaste.defaultUnit);
      }
      // Miktarı sıfırla (yeni atık türü için)
      setMiktar('');
      // Diğer atık türü değilse custom name'i temizle
      if (selectedWasteType !== 'diger') {
        setCustomWasteName('');
      }
    } else {
      setSalesUnit('ton');
      setMiktar('');
      setCustomWasteName('');
    }
  }, [selectedWasteType, selectedWaste]);

  // Seçilen atık türüne göre birim seçeneklerini al
  const availableUnits = selectedWaste 
    ? unitOptions[selectedWaste.unitType as keyof typeof unitOptions] || unitOptions.all
    : unitOptions.all;

  // Filtrelenmiş atık türleri
  const filteredWasteTypes = wasteTypes.filter(waste =>
    waste.label.toLowerCase().includes(wasteTypeSearch.toLowerCase())
  );

  // Atık türü seçildiğinde
  const handleWasteTypeSelect = (wasteValue: string) => {
    setSelectedWasteType(wasteValue);
    setIsWasteTypeModalOpen(false);
    setWasteTypeSearch('');
  };

  // Dosya yükleme handler'ları
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileState>>,
    isMultiple = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isMultiple) {
      // Çoklu dosya için (ek fotoğraflar, sertifikalar)
      return;
    }

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10 MB\'dan büyük olamaz!');
      return;
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setter({ file, preview, name: file.name });
  };

  const removeFile = (setter: React.Dispatch<React.SetStateAction<FileState>>, currentState?: FileState) => {
    // Preview URL'ini temizle (memory leak önleme)
    if (currentState?.preview) {
      URL.revokeObjectURL(currentState.preview);
    }
    setter({ file: null, preview: null, name: '' });
  };

  const navigate = useNavigate();

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isWasteTypeModalOpen) {
          setIsWasteTypeModalOpen(false);
          setWasteTypeSearch('');
        }
        if (isUnitModalOpen) {
          setIsUnitModalOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isWasteTypeModalOpen, isUnitModalOpen]);

  // Form submit handler
  const handleSubmit = async () => {
    // Validasyon
    if (!selectedWasteType) {
      setSubmitError('Lütfen atık türü seçin');
      return;
    }
    // Diğer atık türü için manuel ad kontrolü
    if (selectedWasteType === 'diger' && !customWasteName.trim()) {
      setSubmitError('Lütfen atık türü adını girin');
      return;
    }
    if (!miktar || parseFloat(miktar) <= 0) {
      setSubmitError('Lütfen geçerli bir miktar girin');
      return;
    }
    if (!productPhoto.file) {
      setSubmitError('Ürün fotoğrafı zorunludur');
      return;
    }
    if (!originDocument.file) {
      setSubmitError('Menşei belgesi zorunludur');
      return;
    }
    if (isAnalyzed && !analysisReport.file) {
      setSubmitError('Analizli ürün için laboratuvar analiz raporu gereklidir');
      return;
    }
    if (hasGuarantee && !guaranteeDocument.file) {
      setSubmitError('Garanti içerikli ürün için garanti belgesi gereklidir');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await ciftciService.addWasteProduct({
        atikTuru: selectedWasteType === 'diger' && customWasteName ? customWasteName : selectedWasteType,
        miktar: parseFloat(miktar),
        birim: salesUnit,
        isAnalyzed,
        hasGuarantee,
        productPhoto: productPhoto.file,
        originDocument: originDocument.file,
        analysisReport: analysisReport.file || undefined,
        guaranteeDocument: guaranteeDocument.file || undefined,
        additionalPhoto: additionalPhoto.file || undefined,
        qualityCertificate: qualityCertificate.file || undefined,
      });

      if (result.success) {
        setSubmitSuccess(true);
        // 2 saniye sonra ürünlerim sayfasına yönlendir
        setTimeout(() => {
          navigate('/ciftlik/urunlerim');
        }, 2000);
      } else {
        setSubmitError(result.message || 'Ürün eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Ürün ekleme hatası:', error);
      setSubmitError(error.response?.data?.message || 'Ürün eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
      <CftNavbar />
      <main className="flex flex-1 justify-center py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-content-light dark:text-content-dark mb-3">Atık Kayıt ve Analiz</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark max-w-2xl mx-auto">Yeni bir atık kaydı oluşturun ve potansiyelini anında analiz edin</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-content-light dark:text-content-dark mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_document</span>
                  Atık Bilgileri
                </h2>
                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                      Atık Türü
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsWasteTypeModalOpen(true)}
                      className="w-full h-12 px-4 pl-12 pr-12 text-base bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-content-light dark:text-content-dark transition-all hover:border-primary/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                          {selectedWaste?.icon || 'category'}
                        </span>
                        <span className={selectedWaste ? 'text-content-light dark:text-content-dark' : 'text-subtle-light dark:text-subtle-dark'}>
                          {selectedWasteType === 'diger' && customWasteName 
                            ? customWasteName 
                            : selectedWaste 
                            ? selectedWaste.label 
                            : 'Atık Türü Seçin'}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">expand_more</span>
                    </button>
                  </div>

                  {/* Diğer atık türü için manuel ad girişi */}
                  {selectedWasteType === 'diger' && (
                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Atık Türü Adı *
                      </label>
                      <div className="relative">
                        <input 
                          className="form-input w-full h-12 px-4 pl-12 text-base bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark transition-all hover:border-primary/50" 
                          placeholder="Örn: Ahşap Atığı, Plastik Atık vb." 
                          type="text" 
                          value={customWasteName}
                          onChange={(e) => setCustomWasteName(e.target.value)}
                          maxLength={100}
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">edit</span>
                      </div>
                      <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                        Satışa sunacağınız atık türünün adını girin
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                      Miktar ve Satış Birimi
                      {!selectedWasteType && (
                        <span className="ml-2 text-xs text-subtle-light dark:text-subtle-dark">(Önce atık türü seçin)</span>
                      )}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input 
                          className="form-input w-full h-12 px-4 pl-12 text-base bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed" 
                          placeholder="Miktar girin" 
                          type="number" 
                          value={miktar}
                          onChange={(e) => setMiktar(e.target.value)}
                          disabled={!selectedWasteType}
                          min="0"
                          step="0.01"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">scale</span>
                      </div>
                      {/* Diğer atık türü için pop-up butonu, diğerleri için normal dropdown */}
                      {selectedWasteType === 'diger' ? (
                        <div className="relative w-32">
                          <button
                            type="button"
                            onClick={() => setIsUnitModalOpen(true)}
                            disabled={!selectedWasteType}
                            className="w-full h-12 px-4 pl-4 pr-10 text-base bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-content-light dark:text-content-dark transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                          >
                            <span>
                              {salesUnit === 'ton' ? 'Ton' : salesUnit === 'kg' ? 'Kg' : salesUnit === 'm3' ? 'm³' : 'Litre'}
                            </span>
                            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">expand_more</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-32">
                          <select 
                            value={salesUnit}
                            onChange={(e) => setSalesUnit(e.target.value)}
                            disabled={!selectedWasteType}
                            className="form-select h-12 pl-4 pr-10 text-base bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-content-light dark:text-content-dark appearance-none transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {availableUnits.map((unit) => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark pointer-events-none">expand_more</span>
                        </div>
                      )}
                    </div>
                    {selectedWasteType && selectedWasteType !== 'diger' && (
                      <div className="mt-2">
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">
                          💡 {selectedWaste?.label} için uygun birimler gösteriliyor
                        </p>
                        <p className="text-xs text-primary dark:text-primary/80 mt-0.5">
                          Varsayılan birim: <strong>{selectedWaste?.defaultUnit === 'ton' ? 'Ton' : selectedWaste?.defaultUnit === 'kg' ? 'Kg' : selectedWaste?.defaultUnit === 'm3' ? 'm³' : 'Litre'}</strong>
                        </p>
                      </div>
                    )}
                    {selectedWasteType === 'diger' && (
                      <div className="mt-2">
                        <p className="text-xs text-primary dark:text-primary/80">
                          💡 Satış birimini seçmek için birim butonuna tıklayın
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-3">
                      Ürün Özellikleri
                    </label>
                    <div className="space-y-4">
                      {/* Analizli Ürün */}
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={isAnalyzed}
                            onChange={(e) => setIsAnalyzed(e.target.checked)}
                            className="w-5 h-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-content-light dark:text-content-dark">Analizli Ürün</span>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">Ürün laboratuvar analizinden geçmiştir</p>
                          </div>
                        </label>

                        {/* Analizli Ürün için Belge Yükleme */}
                        {isAnalyzed && (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-amber-500">
                            <label className="group relative flex flex-col border-2 border-dashed border-amber-500/50 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4 hover:border-amber-500 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 cursor-pointer">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-xl text-amber-600 dark:text-amber-400">lab_research</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-content-light dark:text-content-dark">Laboratuvar Analiz Raporu *</p>
                                  <p className="text-xs text-amber-700 dark:text-amber-400">Ürün içerik ve kalite analizi belgesi</p>
                                </div>
                              </div>
                              <input 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, setAnalysisReport)}
                              />
                              {analysisReport.file && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  <span>{analysisReport.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(setAnalysisReport, analysisReport)}
                                    className="ml-auto text-red-600 hover:text-red-800"
                                  >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                  </button>
                                </div>
                              )}
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Garanti İçerikli */}
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={hasGuarantee}
                            onChange={(e) => setHasGuarantee(e.target.checked)}
                            className="w-5 h-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-content-light dark:text-content-dark">Garanti İçerikli</span>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">Ürün içerik garantisi ile satılmaktadır</p>
                          </div>
                        </label>

                        {/* Garanti İçerikli için Belge Yükleme */}
                        {hasGuarantee && (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-amber-500">
                            <label className="group relative flex flex-col border-2 border-dashed border-amber-500/50 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4 hover:border-amber-500 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 cursor-pointer">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-xl text-amber-600 dark:text-amber-400">verified</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-content-light dark:text-content-dark">Garanti Belgesi / Analiz Raporu *</p>
                                  <p className="text-xs text-amber-700 dark:text-amber-400">İçerik garantisini destekleyen belge</p>
                                </div>
                              </div>
                              <input 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, setGuaranteeDocument)}
                              />
                              {guaranteeDocument.file && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  <span>{guaranteeDocument.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(setGuaranteeDocument, guaranteeDocument)}
                                    className="ml-auto text-red-600 hover:text-red-800"
                                  >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                  </button>
                                </div>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-3">
                      Belge ve Fotoğraf Yükleme
                    </label>
                    
                    {/* Zorunlu Belgeler */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-base text-red-600 dark:text-red-400">verified</span>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                          Zorunlu
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {/* Ürün Fotoğrafı */}
                        <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400">add_a_photo</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-content-light dark:text-content-dark">Ürün Fotoğrafı *</p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark">Ürününüzü katalogda gösterecek fotoğraf</p>
                            </div>
                          </div>
                          <input 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            type="file" 
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setProductPhoto)}
                          />
                          {productPhoto.preview && (
                            <div className="mt-2">
                              <img src={productPhoto.preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                              <div className="mt-2 flex items-center gap-2 text-xs text-content-light dark:text-content-dark">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>{productPhoto.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(setProductPhoto, productPhoto)}
                                  className="ml-auto text-red-600 hover:text-red-800"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </label>

                        {/* Menşei Belgesi (ÇKS) */}
                        <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400">verified_user</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-content-light dark:text-content-dark">Menşei Belgesi (ÇKS / İşletme Tescil) *</p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark">Çiftliğinizin kayıtlı olduğunu gösteren belge</p>
                            </div>
                          </div>
                          <input 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setOriginDocument)}
                          />
                          {originDocument.file && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-content-light dark:text-content-dark">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>{originDocument.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(setOriginDocument, originDocument)}
                                className="ml-auto text-red-600 hover:text-red-800"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>


                    {/* Opsiyonel Belgeler */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">add_circle</span>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                          Opsiyonel (Ürününüzü Daha Cazip Kılar)
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {/* Ek Fotoğraf */}
                        <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-xl text-blue-600 dark:text-blue-400">collections</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-content-light dark:text-content-dark">Ek Fotoğraf</p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark">Ürününüzün farklı bir açıdan fotoğrafı (isteğe bağlı)</p>
                            </div>
                          </div>
                          <input 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            type="file" 
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setAdditionalPhoto)}
                          />
                          {additionalPhoto.preview && (
                            <div className="mt-2">
                              <img src={additionalPhoto.preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                              <div className="mt-2 flex items-center gap-2 text-xs text-content-light dark:text-content-dark">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>{additionalPhoto.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(setAdditionalPhoto, additionalPhoto)}
                                  className="ml-auto text-red-600 hover:text-red-800"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                            </div>
                          )}
                          {additionalPhoto.file && !additionalPhoto.preview && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-content-light dark:text-content-dark">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>{additionalPhoto.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(setAdditionalPhoto, additionalPhoto)}
                                className="ml-auto text-red-600 hover:text-red-800"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          )}
                        </label>

                        {/* Kalite Sertifikası */}
                        <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-xl text-blue-600 dark:text-blue-400">workspace_premium</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-content-light dark:text-content-dark">Kalite Sertifikası</p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark">Organik, TSE, ISO vb. sertifika (isteğe bağlı)</p>
                            </div>
                          </div>
                          <input 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setQualityCertificate)}
                          />
                          {qualityCertificate.file && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-content-light dark:text-content-dark">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>{qualityCertificate.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(setQualityCertificate, qualityCertificate)}
                                className="ml-auto text-red-600 hover:text-red-800"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base mt-0.5">info</span>
                        <div className="flex-1">
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                            <strong>Önemli:</strong> Sevk irsaliyesi, fatura ve kantar fişi gibi belgeler satış gerçekleştikten sonra istenecektir.
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            📄 Maksimum dosya boyutu: 10 MB | Format: PDF, JPG, PNG
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 p-6 shadow-lg">
                <h3 className="text-xl font-bold text-content-light dark:text-content-dark mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  Atık Analizi
                </h3>

                <div className="bg-background-light dark:bg-background-dark p-5 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-md mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Dinamik İkon - Kategoriye göre */}
                      <div className={`flex items-center justify-center rounded-xl shrink-0 size-14 shadow-lg ${
                        selectedWasteType === 'diger'
                          ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                          : selectedWaste?.category === 'hayvansal' 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                          : selectedWaste?.category === 'bitkisel'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : selectedWaste?.category === 'endustriyel'
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                          : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      }`}>
                        <span className="material-symbols-outlined text-3xl text-white">
                          {selectedWasteType === 'diger'
                            ? 'category'
                            : selectedWaste?.category === 'hayvansal' 
                            ? 'pets'
                            : selectedWaste?.category === 'bitkisel'
                            ? 'eco'
                            : selectedWaste?.category === 'endustriyel'
                            ? 'factory'
                            : 'bolt'}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        {/* Başlık - Kategoriye göre */}
                        <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">
                          {selectedWasteType === 'diger'
                            ? 'Özel Atık Türü'
                            : selectedWaste?.category === 'hayvansal' 
                            ? 'Gübre Değeri'
                            : selectedWaste?.category === 'bitkisel'
                            ? 'Organik İçerik'
                            : selectedWaste?.category === 'endustriyel'
                            ? 'Geri Dönüşüm Oranı'
                            : 'Enerji Potansiyeli'}
                        </p>
                        {selectedWasteType === 'diger' ? (
                          <div>
                            <p className="text-lg font-medium text-subtle-light dark:text-subtle-dark">
                              {customWasteName ? `${customWasteName} için analiz edilecek` : 'Atık türü adını girin'}
                            </p>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                              Özel atık türü için detaylı analiz yapılacak
                            </p>
                          </div>
                        ) : selectedWaste ? (
                          <div>
                            {/* Kategori bazlı değer gösterimi */}
                            {selectedWaste.category === 'hayvansal' ? (
                              <div>
                                <p className="text-2xl font-bold text-primary dark:text-primary/90">
                                  {selectedWaste.categoryValue}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                  Gübre kalitesi
                                </p>
                              </div>
                            ) : selectedWaste.category === 'bitkisel' ? (
                              <div>
                                <p className="text-2xl font-bold text-primary dark:text-primary/90">
                                  %{selectedWaste.categoryValue}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                  Organik madde oranı
                                </p>
                              </div>
                            ) : selectedWaste.category === 'endustriyel' ? (
                              <div>
                                <p className="text-2xl font-bold text-primary dark:text-primary/90">
                                  %{selectedWaste.categoryValue}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                  Geri dönüşüm potansiyeli
                                </p>
                              </div>
                            ) : selectedWaste.energyPotential ? (
                              <div>
                                <p className="text-2xl font-bold text-primary dark:text-primary/90">
                                  {selectedWaste.energyPotential}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                  {selectedWaste.unitType === 'liquid' ? 'm³ biyogaz/m³' : 'm³ biyogaz/ton'}
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg font-medium text-subtle-light dark:text-subtle-dark">
                                Analiz edilecek
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-lg font-medium text-subtle-light dark:text-subtle-dark">Atık türü seçin</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pazar Değeri ve Talep Seviyesi */}
                  {(selectedWaste || selectedWasteType === 'diger') && (
                    <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Pazar Değeri - Dinamik Hesaplama */}
                        <div>
                          <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1">Pazar Değeri</p>
                          {selectedWasteType === 'diger' ? (
                            <div>
                              <p className="text-lg font-bold text-primary dark:text-primary/90">
                                Analiz edilecek
                              </p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-0.5">
                                Özel atık türü için pazar değeri belirlenecek
                              </p>
                            </div>
                          ) : selectedWaste ? (() => {
                            // Pazar değeri aralığını parse et (örn: "350-500")
                            const [minPrice, maxPrice] = selectedWaste.marketValue.split('-').map(p => parseFloat(p.trim()));
                            
                            // Miktar ve birim kontrolü
                            const quantity = parseFloat(miktar) || 0;
                            
                            // Birim dönüşüm faktörleri (ton'a göre)
                            const unitConversion: { [key: string]: number } = {
                              'ton': 1,
                              'kg': 0.001,
                              'm3': selectedWaste.unitType === 'liquid' ? 1 : 0.5, // Sıvı için 1, katı için yaklaşık 0.5
                              'litre': 0.001
                            };
                            
                            const conversionFactor = unitConversion[salesUnit] || 1;
                            const convertedQuantity = quantity * conversionFactor;
                            
                            // Toplam pazar değerini hesapla
                            const totalMin = minPrice * convertedQuantity;
                            const totalMax = maxPrice * convertedQuantity;
                            
                            // Formatla (binlik ayırıcı ile)
                            const formatPrice = (price: number) => {
                              return new Intl.NumberFormat('tr-TR', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                              }).format(price);
                            };
                            
                            return (
                              <div>
                                {quantity > 0 ? (
                                  <>
                                    <p className="text-lg font-bold text-primary dark:text-primary/90">
                                      {formatPrice(totalMin)} - {formatPrice(totalMax)} ₺
                                    </p>
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-0.5">
                                      Toplam tahmini değer ({quantity} {salesUnit === 'ton' ? 'ton' : salesUnit === 'kg' ? 'kg' : salesUnit === 'm3' ? 'm³' : 'litre'})
                                    </p>
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-0.5 opacity-75">
                                      Birim fiyat: {minPrice}-{maxPrice} ₺/ton
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-lg font-bold text-primary dark:text-primary/90">
                                      {selectedWaste.marketValue} ₺
                                    </p>
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-0.5">
                                      Ton başına tahmini
                                    </p>
                                  </>
                                )}
                              </div>
                            );
                          })() : null}
                        </div>
                        {/* Talep Seviyesi */}
                        <div>
                          <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-1">Talep Seviyesi</p>
                          {selectedWasteType === 'diger' ? (
                            <div>
                              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                Belirlenecek
                              </p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-0.5">
                                Pazar analizi sonrası
                              </p>
                            </div>
                          ) : selectedWaste ? (
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${
                                selectedWaste.demandLevel === 'yuksek'
                                  ? 'text-green-600 dark:text-green-400'
                                  : selectedWaste.demandLevel === 'orta'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {selectedWaste.demandLevel === 'yuksek' 
                                  ? 'Yüksek'
                                  : selectedWaste.demandLevel === 'orta'
                                  ? 'Orta'
                                  : 'Düşük'}
                              </span>
                              <span className={`material-symbols-outlined text-base ${
                                selectedWaste.demandLevel === 'yuksek'
                                  ? 'text-green-600 dark:text-green-400'
                                  : selectedWaste.demandLevel === 'orta'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {selectedWaste.demandLevel === 'yuksek'
                                  ? 'trending_up'
                                  : selectedWaste.demandLevel === 'orta'
                                  ? 'trending_flat'
                                  : 'trending_down'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedWasteType !== 'diger' && (
                  <div className="bg-background-light dark:bg-background-dark p-5 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shrink-0 size-14 shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-white">factory</span>
                      </div>
                      <p className="font-semibold text-lg text-content-light dark:text-content-dark">Kullanım Alanları</p>
                    </div>
                    {selectedWaste && selectedWaste.usageAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {selectedWaste.usageAreas.map((area, index) => (
                          <span 
                            key={index}
                            className="px-4 py-2 text-sm font-semibold rounded-full bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary border border-primary/30 dark:border-primary/40 shadow-sm"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">Atık türü seçildiğinde kullanım alanları gösterilecektir.</p>
                    )}
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedWasteType || !miktar || !productPhoto.file || !originDocument.file}
                className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl h-14 px-6 bg-gradient-to-r from-primary to-primary/90 text-white text-base font-bold hover:from-primary/90 hover:to-primary/80 transition-all duration-300 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">add_circle</span>
                    <span>Kayıt Oluştur ve Ürünü Ekle</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </>
                )}
              </button>
              
              {submitError && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                </div>
              )}
              
              {submitSuccess && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✅ Ürün başarıyla eklendi! Onay sürecine gönderildi.
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Kayıt Sonrası Süreç
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-content-light dark:text-content-dark mb-1">Onay Süreci</p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Ürününüz admin tarafından incelenecek ve onaylanacaktır. Bu süreç genellikle 1-3 iş günü sürer.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-content-light dark:text-content-dark mb-1">Katalogda Yayınlama</p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Onay sonrası ürününüz katalogda görünür hale gelecek ve firmalar tarafından görüntülenebilecektir.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-content-light dark:text-content-dark mb-1">Teklif Alma</p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Firmalar ürününüze teklif verebilecek ve size bildirim gönderilecektir.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-content-light dark:text-content-dark mb-1">Takip ve Yönetim</p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">Ürünlerim sayfasından tüm ürünlerinizi, teklifleri ve satışları takip edebilirsiniz.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2 text-xs text-subtle-light dark:text-subtle-dark">
                    <span className="material-symbols-outlined text-sm">notifications</span>
                    <span>Onay durumu ve teklifler hakkında bildirimler alacaksınız.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Atık Türü Seçim Modal */}
      {isWasteTypeModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsWasteTypeModalOpen(false);
              setWasteTypeSearch('');
            }
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="text-2xl font-bold text-content-light dark:text-content-dark flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">category</span>
                  Atık Türü Seçin
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                  Satışa sunacağınız atık türünü seçin
                </p>
              </div>
              <button
                onClick={() => {
                  setIsWasteTypeModalOpen(false);
                  setWasteTypeSearch('');
                }}
                className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-content-light dark:text-content-dark">close</span>
              </button>
            </div>

            {/* Arama */}
            <div className="p-6 border-b border-border-light dark:border-border-dark">
              <div className="relative">
                <input
                  type="text"
                  value={wasteTypeSearch}
                  onChange={(e) => setWasteTypeSearch(e.target.value)}
                  placeholder="Atık türü ara..."
                  className="w-full h-12 px-4 pl-12 pr-4 text-base bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark"
                  autoFocus
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
              </div>
            </div>

            {/* Atık Türleri Listesi */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredWasteTypes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWasteTypes.map((waste) => (
                    <button
                      key={waste.value}
                      type="button"
                      onClick={() => handleWasteTypeSelect(waste.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
                        selectedWasteType === waste.value
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg'
                          : 'border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selectedWasteType === waste.value
                            ? 'bg-primary/20 dark:bg-primary/30'
                            : 'bg-primary/10 dark:bg-primary/20'
                        }`}>
                          <span className={`material-symbols-outlined text-2xl ${
                            selectedWasteType === waste.value
                              ? 'text-primary'
                              : 'text-primary/70 dark:text-primary/60'
                          }`}>
                            {waste.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-content-light dark:text-content-dark mb-1">
                            {waste.label}
                          </h4>
                          {waste.usageAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {waste.usageAreas.slice(0, 2).map((area, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[10px]"
                                >
                                  {area}
                                </span>
                              ))}
                              {waste.usageAreas.length > 2 && (
                                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                                  +{waste.usageAreas.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          {waste.energyPotential && (
                            <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                              ⚡ {waste.energyPotential} {waste.defaultUnit === 'm3' ? 'm³/m³' : 'L/kg'}
                            </p>
                          )}
                        </div>
                        {selectedWasteType === waste.value && (
                          <span className="material-symbols-outlined text-primary flex-shrink-0">check_circle</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">search_off</span>
                  <p className="text-lg font-medium text-content-light dark:text-content-dark mb-2">
                    Sonuç bulunamadı
                  </p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    "{wasteTypeSearch}" için atık türü bulunamadı
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  {filteredWasteTypes.length} atık türü bulundu
                </p>
                <button
                  onClick={() => {
                    setIsWasteTypeModalOpen(false);
                    setWasteTypeSearch('');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Satış Birimi Seçim Modal - Sadece Diğer atık türü için */}
      {isUnitModalOpen && selectedWasteType === 'diger' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsUnitModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="text-2xl font-bold text-content-light dark:text-content-dark flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">scale</span>
                  Satış Birimi Seçin
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                  Atık türünüz için uygun satış birimini seçin
                </p>
              </div>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-content-light dark:text-content-dark">close</span>
              </button>
            </div>

            {/* Birim Seçenekleri */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {unitOptions.all.map((unit) => (
                  <button
                    key={unit.value}
                    type="button"
                    onClick={() => {
                      setSalesUnit(unit.value);
                      setIsUnitModalOpen(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
                      salesUnit === unit.value
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg'
                        : 'border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        salesUnit === unit.value
                          ? 'bg-primary/20 dark:bg-primary/30'
                          : 'bg-primary/10 dark:bg-primary/20'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          salesUnit === unit.value
                            ? 'text-primary'
                            : 'text-primary/70 dark:text-primary/60'
                        }`}>
                          {unit.value === 'ton' || unit.value === 'kg' ? 'scale' : 'water_drop'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-content-light dark:text-content-dark">
                          {unit.label}
                        </h4>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                          {unit.value === 'ton' ? 'Ağırlık birimi' : unit.value === 'kg' ? 'Küçük ağırlık birimi' : unit.value === 'm3' ? 'Hacim birimi' : 'Sıvı hacim birimi'}
                        </p>
                      </div>
                      {salesUnit === unit.value && (
                        <span className="material-symbols-outlined text-primary flex-shrink-0">check_circle</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  Seçilen birim: <strong>{salesUnit === 'ton' ? 'Ton' : salesUnit === 'kg' ? 'Kg' : salesUnit === 'm3' ? 'm³' : 'Litre'}</strong>
                </p>
                <button
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AtikEkle;
