import { useState, useEffect, useRef } from 'react';
import FrmNavbar from '../components/frmnavbar';

const products = [
  {
    title: 'Hayvansal Gübre',
    producer: 'Toros Çiftliği',
    region: 'Akdeniz',
    price: '450 ₺ / ton',
    desc: 'Organik sertifikalı, kompostlanmış hayvansal gübre. Yüksek azot içeriği ile toprak verimliliğini artırır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Mısır Sapı',
    producer: 'Çukurova Çiftliği',
    region: 'Akdeniz',
    price: '280 ₺ / ton',
    desc: 'Temiz, kuru mısır sapı. Biyogaz üretimi ve hayvan yemi olarak kullanılabilir.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Buğday Samanı',
    producer: 'İç Anadolu Çiftliği',
    region: 'İç Anadolu',
    price: '320 ₺ / ton',
    desc: 'Kaliteli buğday samanı. Biyokütle enerji üretimi ve kompost için uygundur.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Ayçiçeği Sapı',
    producer: 'Marmara Çiftliği',
    region: 'Marmara',
    price: '380 ₺ / ton',
    desc: 'Kurutulmuş ayçiçeği sapı. Yüksek enerji potansiyeli ile biyogaz üretimine uygundur.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Organik Kompost',
    producer: 'Ege Çiftliği',
    region: 'Ege',
    price: '550 ₺ / ton',
    desc: 'Tamamen organik, olgunlaştırılmış kompost. Toprak düzenleyici ve gübre olarak kullanılır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Kompost',
  },
  {
    title: 'Pamuk Atığı',
    producer: 'Güneydoğu Çiftliği',
    region: 'Güneydoğu Anadolu',
    price: '420 ₺ / ton',
    desc: 'Pamuk üretiminden elde edilen temiz atık. Tekstil ve biyokütle enerji sektöründe kullanılır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Zeytin Karasuyu',
    producer: 'Akdeniz Çiftliği',
    region: 'Akdeniz',
    price: '680 ₺ / m³',
    desc: 'Zeytin işleme atığı. Yüksek organik madde içeriği ile biyogaz üretimine uygundur.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Sebze Atıkları',
    producer: 'Marmara Bahçeleri',
    region: 'Marmara',
    price: '250 ₺ / ton',
    desc: 'Temiz, organik sebze atıkları. Kompost ve biyogaz üretimi için idealdir.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Arpa Samanı',
    producer: 'Karadeniz Çiftliği',
    region: 'Karadeniz',
    price: '300 ₺ / ton',
    desc: 'Kaliteli arpa samanı. Hayvan yemi ve biyokütle enerji üretimi için uygundur.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Yonca Atığı',
    producer: 'Doğu Anadolu Çiftliği',
    region: 'Doğu Anadolu',
    price: '350 ₺ / ton',
    desc: 'Kurutulmuş yonca atığı. Yüksek protein içeriği ile hayvan yemi olarak değerlidir.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Pirinç Kabuğu',
    producer: 'Marmara Çiftliği',
    region: 'Marmara',
    price: '400 ₺ / ton',
    desc: 'Temiz pirinç kabuğu. Biyogaz ve kompost üretimi için uygun organik materyal.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Meyve Atıkları',
    producer: 'Akdeniz Çiftliği',
    region: 'Akdeniz',
    price: '270 ₺ / ton',
    desc: 'Organik meyve atıkları. Yüksek şeker içeriği ile biyogaz üretimine idealdir.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
  },
  {
    title: 'Tavuk Gübresi',
    producer: 'İç Anadolu Çiftliği',
    region: 'İç Anadolu',
    price: '500 ₺ / ton',
    desc: 'Kompostlanmış tavuk gübresi. Yüksek azot ve fosfor içeriği ile toprak için değerli.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Organik Gübre',
  },
  {
    title: 'Sığır Gübresi',
    producer: 'Toros Çiftliği',
    region: 'Akdeniz',
    price: '480 ₺ / ton',
    desc: 'Fermente edilmiş sığır gübresi. Organik tarım için ideal, toprak verimliliğini artırır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Organik Gübre',
  },
  {
    title: 'Koyun Gübresi',
    producer: 'Doğu Anadolu Çiftliği',
    region: 'Doğu Anadolu',
    price: '520 ₺ / ton',
    desc: 'Kurutulmuş koyun gübresi. Yüksek besin değeri ile organik gübre olarak kullanılır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Organik Gübre',
  },
  {
    title: 'Odun Talaşı',
    producer: 'Karadeniz Çiftliği',
    region: 'Karadeniz',
    price: '200 ₺ / ton',
    desc: 'Temiz odun talaşı. Kompost ve biyokütle enerji üretimi için uygun materyal.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Biyokütle',
  },
  {
    title: 'Fındık Kabuğu',
    producer: 'Karadeniz Çiftliği',
    region: 'Karadeniz',
    price: '380 ₺ / ton',
    desc: 'Kurutulmuş fındık kabuğu. Yüksek kalorifik değer ile biyokütle yakıt olarak kullanılır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Biyokütle',
  },
  {
    title: 'Ceviz Kabuğu',
    producer: 'Marmara Çiftliği',
    region: 'Marmara',
    price: '450 ₺ / ton',
    desc: 'Temiz ceviz kabuğu. Biyokütle enerji ve kompost üretimi için değerli materyal.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Biyokütle',
  },
];

type Product = {
  title: string;
  producer: string;
  region: string;
  price: string;
  desc: string;
  img: string;
  category: string;
};

function Atiklar() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedProducers, setSelectedProducers] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [regionSearch, setRegionSearch] = useState<string>('');
  const [producerSearch, setProducerSearch] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isProducerOpen, setIsProducerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeklifModalOpen, setIsTeklifModalOpen] = useState(false);
  const [teklifForm, setTeklifForm] = useState({
    miktar: '',
    birim: 'ton',
    birimFiyat: '',
    toplamFiyat: '',
    notlar: '',
  });
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 8;

  // Ref'ler dropdown'lar için
  const categoryRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const producerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const teklifModalRef = useRef<HTMLDivElement>(null);

  // Modal açma/kapama fonksiyonları
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Scroll'u engelle
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    document.body.style.overflow = 'unset'; // Scroll'u geri aç
  };

  const openTeklifModal = (product: Product) => {
    setSelectedProduct(product);
    setIsTeklifModalOpen(true);
    document.body.style.overflow = 'hidden';
    // Ürün fiyatından birim fiyat tahmini (örnek: "450 ₺ / ton" -> "450")
    const priceMatch = product.price.match(/(\d+)/);
    if (priceMatch) {
      setTeklifForm(prev => ({
        ...prev,
        birimFiyat: priceMatch[1],
      }));
    }
  };

  const closeTeklifModal = () => {
    setIsTeklifModalOpen(false);
    setSelectedProduct(null);
    setTeklifForm({
      miktar: '',
      birim: 'ton',
      birimFiyat: '',
      toplamFiyat: '',
      notlar: '',
    });
    document.body.style.overflow = 'unset';
  };

  const handleTeklifFormChange = (field: string, value: string) => {
    setTeklifForm(prev => {
      const updated = { ...prev, [field]: value };
      // Miktar ve birim fiyat değiştiğinde toplam fiyatı hesapla
      if ((field === 'miktar' || field === 'birimFiyat') && updated.miktar && updated.birimFiyat) {
        const miktar = parseFloat(updated.miktar) || 0;
        const birimFiyat = parseFloat(updated.birimFiyat) || 0;
        updated.toplamFiyat = (miktar * birimFiyat).toFixed(2);
      }
      return updated;
    });
  };

  const handleTeklifVer = (e: React.FormEvent) => {
    e.preventDefault();
    // Gerçek uygulamada API çağrısı yapılacak
    console.log('Teklif veriliyor:', {
      product: selectedProduct,
      teklif: teklifForm,
    });
    alert('Teklifiniz başarıyla gönderildi!');
    closeTeklifModal();
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
      }
      if (producerRef.current && !producerRef.current.contains(event.target as Node)) {
        setIsProducerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modal click outside handler
  useEffect(() => {
    const handleModalClickOutside = (event: MouseEvent) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
      if (isTeklifModalOpen && teklifModalRef.current && !teklifModalRef.current.contains(event.target as Node)) {
        closeTeklifModal();
      }
    };

    if (isModalOpen || isTeklifModalOpen) {
      document.addEventListener('mousedown', handleModalClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleModalClickOutside);
    };
  }, [isModalOpen, isTeklifModalOpen]);

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) {
          closeModal();
        }
        if (isTeklifModalOpen) {
          closeTeklifModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen, isTeklifModalOpen]);

  // Benzersiz kategorileri, bölgeleri ve çiftlikleri al
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
  const uniqueRegions = Array.from(new Set(products.map((p) => p.region))).sort();
  const uniqueProducers = Array.from(new Set(products.map((p) => p.producer))).sort();

  // Her kategori/bölge/çiftlik için ürün sayısını hesapla
  const getCategoryCount = (category: string) => {
    return products.filter((p) => p.category === category).length;
  };

  const getRegionCount = (region: string) => {
    return products.filter((p) => p.region === region).length;
  };

  const getProducerCount = (producer: string) => {
    return products.filter((p) => p.producer === producer).length;
  };

  // Arama terimine göre filtrelenmiş listeler
  const filteredCategories = uniqueCategories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredRegions = uniqueRegions.filter((region) =>
    region.toLowerCase().includes(regionSearch.toLowerCase())
  );
  const filteredProducers = uniqueProducers.filter((producer) =>
    producer.toLowerCase().includes(producerSearch.toLowerCase())
  );

  // Filtreleme mantığı (multi-select)
  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(product.region);
    const producerMatch = selectedProducers.length === 0 || selectedProducers.includes(product.producer);
    return categoryMatch && regionMatch && producerMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Filtre değiştiğinde sayfayı sıfırla
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
    setCurrentPage(1);
  };

  const handleProducerToggle = (producer: string) => {
    setSelectedProducers((prev) =>
      prev.includes(producer) ? prev.filter((p) => p !== producer) : [...prev, producer]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedProducers([]);
    setCategorySearch('');
    setRegionSearch('');
    setProducerSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedRegions.length > 0 || selectedProducers.length > 0;

  // Sayfalama mantığı: Hangi sayfa numaralarını göstereceğimizi hesapla
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      // 5 veya daha az sayfa varsa hepsini göster
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // İlk sayfa her zaman göster
    pages.push(1);

    // Mevcut sayfanın etrafındaki sayfaları hesapla
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Eğer başlangıç sayfası 1'den uzaksa, "..." ekle
    if (startPage > 2) {
      pages.push('...');
    }

    // Mevcut sayfa ve etrafındaki sayfaları ekle
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Eğer bitiş sayfası son sayfadan uzaksa, "..." ekle
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Son sayfa her zaman göster (1'den farklıysa)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex flex-col gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-content-light dark:text-content-dark">Atık ve Ürünler</h1>
              <p className="mt-2 text-lg text-subtle-light dark:text-subtle-dark">
                Çiftlik atıkları ve sürdürülebilir ürünleri keşfedin. Biyogaz, kompost ve organik gübre üretimi için uygun materyalleri bulun.
              </p>
            </div>
          </div>

          {/* Filtreler - Tab Mantığı */}
          <div className="mb-8">
            {/* Tab Butonları */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Kategori Butonu */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsRegionOpen(false);
                    setIsProducerOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isCategoryOpen
                      ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border-light dark:border-border-dark text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:text-primary hover:border-primary'
                  }`}
                >
                  Kategori
                  <span className={`material-symbols-outlined text-base transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 z-20 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-lg">
                    <div className="p-4">
                      <div className="relative mb-3">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Filtrele"
                          className="w-full px-4 py-2 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-base">
                          search
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredCategories.map((category) => {
                          const count = getCategoryCount(category);
                          const isSelected = selectedCategories.includes(category);
                          return (
                            <label
                              key={category}
                              className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded px-2 py-1.5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCategoryToggle(category)}
                                className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                              />
                              <span className="flex-1 text-sm text-content-light dark:text-content-dark">{category}</span>
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">({count})</span>
                            </label>
                          );
                        })}
                        {filteredCategories.length === 0 && categorySearch && (
                          <p className="text-sm text-subtle-light dark:text-subtle-dark py-2">Sonuç bulunamadı</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bölge Butonu */}
              <div className="relative" ref={regionRef}>
                <button
                  onClick={() => {
                    setIsRegionOpen(!isRegionOpen);
                    setIsCategoryOpen(false);
                    setIsProducerOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isRegionOpen
                      ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border-light dark:border-border-dark text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:text-primary hover:border-primary'
                  }`}
                >
                  Bölge
                  <span className={`material-symbols-outlined text-base transition-transform ${isRegionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isRegionOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 z-20 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-lg">
                    <div className="p-4">
                      <div className="relative mb-3">
                        <input
                          type="text"
                          value={regionSearch}
                          onChange={(e) => setRegionSearch(e.target.value)}
                          placeholder="Filtrele"
                          className="w-full px-4 py-2 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-base">
                          search
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredRegions.map((region) => {
                          const count = getRegionCount(region);
                          const isSelected = selectedRegions.includes(region);
                          return (
                            <label
                              key={region}
                              className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded px-2 py-1.5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleRegionToggle(region)}
                                className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                              />
                              <span className="flex-1 text-sm text-content-light dark:text-content-dark">{region}</span>
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">({count})</span>
                            </label>
                          );
                        })}
                        {filteredRegions.length === 0 && regionSearch && (
                          <p className="text-sm text-subtle-light dark:text-subtle-dark py-2">Sonuç bulunamadı</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Çiftlik Butonu */}
              <div className="relative" ref={producerRef}>
                <button
                  onClick={() => {
                    setIsProducerOpen(!isProducerOpen);
                    setIsCategoryOpen(false);
                    setIsRegionOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isProducerOpen
                      ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border-light dark:border-border-dark text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:text-primary hover:border-primary'
                  }`}
                >
                  Çiftlik
                  <span className={`material-symbols-outlined text-base transition-transform ${isProducerOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isProducerOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 z-20 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-lg">
                    <div className="p-4">
                      <div className="relative mb-3">
                        <input
                          type="text"
                          value={producerSearch}
                          onChange={(e) => setProducerSearch(e.target.value)}
                          placeholder="Filtrele"
                          className="w-full px-4 py-2 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-base">
                          search
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredProducers.map((producer) => {
                          const count = getProducerCount(producer);
                          const isSelected = selectedProducers.includes(producer);
                          return (
                            <label
                              key={producer}
                              className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded px-2 py-1.5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleProducerToggle(producer)}
                                className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                              />
                              <span className="flex-1 text-sm text-content-light dark:text-content-dark">{producer}</span>
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">({count})</span>
                            </label>
                          );
                        })}
                        {filteredProducers.length === 0 && producerSearch && (
                          <p className="text-sm text-subtle-light dark:text-subtle-dark py-2">Sonuç bulunamadı</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aktif Filtreler ve Temizle */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-6 pt-4 border-t border-border-light dark:border-border-dark">
              <span className="text-sm font-medium text-content-light dark:text-content-dark">Aktif Filtreler:</span>
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm"
                >
                  {category}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="hover:text-primary/80 rounded bg-content-light dark:bg-content-dark p-0.5 flex items-center justify-center ml-1"
                  >
                    <span className="material-symbols-outlined text-xs text-primary">close</span>
            </button>
                </span>
              ))}
              {selectedRegions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm"
                >
                  {region}
                  <button
                    onClick={() => handleRegionToggle(region)}
                    className="hover:text-primary/80 rounded-full bg-background-dark dark:bg-background-light p-0.5 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xs text-primary">close</span>
            </button>
                </span>
              ))}
              {selectedProducers.map((producer) => (
                <span
                  key={producer}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm"
                >
                  {producer}
                  <button
                    onClick={() => handleProducerToggle(producer)}
                    className="hover:text-primary/80 rounded-full bg-background-dark dark:bg-background-light p-0.5 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xs text-primary">close</span>
            </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:text-primary hover:border-primary transition-colors"
              >
                Tümünü Temizle
            </button>
          </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
            {currentProducts.map((item, idx) => (
              <div
                key={idx}
                className="group flex flex-col overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-left shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                <a className="block flex flex-col h-full" href="#">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={item.img}
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 flex-grow">
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">{item.title}</h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">{item.producer}</p>
                    <p className="text-sm font-medium text-primary">{item.price}</p>
                    <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark line-clamp-3 flex-grow">{item.desc}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-border-light dark:border-border-dark">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          openModal(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">info</span>
                        Detayı Gör
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          openTeklifModal(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        Teklif Ver
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mt-8">
              {/* Önceki Sayfa Butonu */}
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>

              {/* Sayfa Numaraları */}
              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-subtle-light dark:text-subtle-dark">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Sonraki Sayfa Butonu */}
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Ürün Detay Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-2xl"
          >
            {/* Kapat Butonu */}
            <button
              onClick={closeModal}
              className="group absolute top-4 right-4 z-10 p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
            </button>

            {/* Modal İçeriği */}
            <div className="flex flex-col">
              {/* Ürün Resmi */}
              <div className="relative w-full h-64 sm:h-80 overflow-hidden">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Ürün Bilgileri */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-2">
                    {selectedProduct.title}
                  </h2>
                  <p className="text-lg font-medium text-primary">{selectedProduct.price}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                  <div>
                    <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">Çiftlik</p>
                    <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">agriculture</span>
                      {selectedProduct.producer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">Bölge</p>
                    <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      {selectedProduct.region}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">Açıklama</p>
                  <p className="text-base text-content-light dark:text-content-dark leading-relaxed">
                    {selectedProduct.desc}
                  </p>
                </div>

                {/* Çiftlik Hakkında Kısa Bilgi */}
                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">Çiftlik Hakkında</p>
                  <p className="text-sm text-content-light dark:text-content-dark leading-relaxed">
                    {selectedProduct.producer}, {selectedProduct.region} bölgesinde faaliyet gösteren, sürdürülebilir tarım ve organik üretim konusunda deneyimli bir çiftliktir. Yüksek kaliteli ürünler sunarak çevre dostu uygulamaları desteklemektedir.
                  </p>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openTeklifModal(selectedProduct);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    Teklif Ver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teklif Verme Modal */}
      {isTeklifModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            ref={teklifModalRef}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-2xl"
          >
            {/* Kapat Butonu */}
            <button
              onClick={closeTeklifModal}
              className="group absolute top-4 right-4 z-10 p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
            </button>

            {/* Modal İçeriği */}
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-content-light dark:text-content-dark mb-2">
                  Teklif Ver
                </h2>
                <p className="text-lg text-subtle-light dark:text-subtle-dark">
                  {selectedProduct.title} için teklif verin
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ürün Bilgileri */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-border-light dark:border-border-dark p-4 bg-primary/5 dark:bg-primary/10">
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
                      Ürün Bilgileri
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Ürün Adı</p>
                        <p className="text-base font-medium text-content-light dark:text-content-dark">
                          {selectedProduct.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Çiftlik</p>
                        <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">agriculture</span>
                          {selectedProduct.producer}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Bölge</p>
                        <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">location_on</span>
                          {selectedProduct.region}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Kategori</p>
                        <p className="text-base text-content-light dark:text-content-dark">
                          {selectedProduct.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Mevcut Fiyat</p>
                        <p className="text-lg font-semibold text-primary">{selectedProduct.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teklif Formu */}
                <div className="space-y-4">
                  <form onSubmit={handleTeklifVer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Miktar
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={teklifForm.miktar}
                          onChange={(e) => handleTeklifFormChange('miktar', e.target.value)}
                          placeholder="Miktar girin"
                          required
                          className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <select
                          value={teklifForm.birim}
                          onChange={(e) => handleTeklifFormChange('birim', e.target.value)}
                          className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="ton">Ton</option>
                          <option value="m³">m³</option>
                          <option value="kg">kg</option>
                          <option value="litre">Litre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Birim Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={teklifForm.birimFiyat}
                        onChange={(e) => handleTeklifFormChange('birimFiyat', e.target.value)}
                        placeholder="Birim fiyat girin"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Toplam Fiyat (₺)
                      </label>
                      <input
                        type="text"
                        value={teklifForm.toplamFiyat ? `${teklifForm.toplamFiyat} ₺` : ''}
                        readOnly
                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-content-light dark:text-content-dark font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                        Notlar (Opsiyonel)
                      </label>
                      <textarea
                        value={teklifForm.notlar}
                        onChange={(e) => handleTeklifFormChange('notlar', e.target.value)}
                        placeholder="Teklifiniz hakkında ek bilgiler..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeTeklifModal}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        Teklif Gönder
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Atiklar;
