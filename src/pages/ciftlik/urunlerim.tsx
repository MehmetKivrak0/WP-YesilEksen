import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CftNavbar from '../../components/cftnavbar';

type Product = {
  id: number;
  title: string;
  miktar: string;
  price: string;
  desc: string;
  img: string;
  category: string;
  durum: 'Aktif' | 'Onay Bekliyor' | 'Satıldı' | 'Pasif';
  eklenmeTarihi: string;
  goruntulenme: number;
  teklifSayisi: number;
};

// Örnek veriler - gerçek uygulamada API'den gelecek
const myProducts: Product[] = [
  {
    id: 1,
    title: 'Mısır Sapı',
    miktar: '25 Ton',
    price: '280 ₺ / ton',
    desc: 'Temiz, kuru mısır sapı. Biyogaz üretimi ve hayvan yemi olarak kullanılabilir.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
    durum: 'Aktif',
    eklenmeTarihi: '2024-01-15',
    goruntulenme: 145,
    teklifSayisi: 3,
  },
  {
    id: 2,
    title: 'Buğday Samanı',
    miktar: '30 Ton',
    price: '320 ₺ / ton',
    desc: 'Kaliteli buğday samanı. Biyokütle enerji üretimi ve kompost için uygundur.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
    durum: 'Aktif',
    eklenmeTarihi: '2024-01-20',
    goruntulenme: 98,
    teklifSayisi: 2,
  },
  {
    id: 3,
    title: 'Hayvansal Gübre',
    miktar: '20 Ton',
    price: '450 ₺ / ton',
    desc: 'Organik sertifikalı, kompostlanmış hayvansal gübre. Yüksek azot içeriği ile toprak verimliliğini artırır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Organik Gübre',
    durum: 'Onay Bekliyor',
    eklenmeTarihi: '2024-02-01',
    goruntulenme: 0,
    teklifSayisi: 0,
  },
  {
    id: 4,
    title: 'Ayçiçeği Sapı',
    miktar: '15 Ton',
    price: '380 ₺ / ton',
    desc: 'Kurutulmuş ayçiçeği sapı. Yüksek enerji potansiyeli ile biyogaz üretimine uygundur.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
    durum: 'Satıldı',
    eklenmeTarihi: '2023-12-10',
    goruntulenme: 234,
    teklifSayisi: 5,
  },
  {
    id: 5,
    title: 'Organik Kompost',
    miktar: '18 Ton',
    price: '550 ₺ / ton',
    desc: 'Tamamen organik, olgunlaştırılmış kompost. Toprak düzenleyici ve gübre olarak kullanılır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Kompost',
    durum: 'Aktif',
    eklenmeTarihi: '2024-01-25',
    goruntulenme: 167,
    teklifSayisi: 4,
  },
  {
    id: 6,
    title: 'Pamuk Atığı',
    miktar: '12 Ton',
    price: '420 ₺ / ton',
    desc: 'Pamuk üretiminden elde edilen temiz atık. Tekstil ve biyokütle enerji sektöründe kullanılır.',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    category: 'Çiftlik Atıkları',
    durum: 'Pasif',
    eklenmeTarihi: '2023-11-15',
    goruntulenme: 89,
    teklifSayisi: 1,
  },
];

function Urunlerim() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(myProducts);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 6;

  // Ref'ler dropdown'lar için
  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Modal açma/kapama fonksiyonları
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modal click outside handler
  useEffect(() => {
    if (!isModalOpen) return;

    const handleModalClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleModalClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleModalClickOutside);
    };
  }, [isModalOpen]);

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  // Silme işlemi
  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      // Gerçek uygulamada API çağrısı yapılacak
      // API'ye silme isteği gönder ve yöneticiye bildirim gönder
      console.log('Ürün siliniyor:', productToDelete);
      console.log('Yöneticiye bildirim gönderiliyor: Ürün silme talebi -', productToDelete.title);
      
      // Ürünü listeden kaldır
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      // Başarı mesajı göster
      setSuccessMessage(`${productToDelete.title} ürünü silme talebi yöneticiye iletildi.`);
      setShowSuccessMessage(true);
      
      // Modal'ları kapat
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      
      // 3 saniye sonra mesajı gizle
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  // Düzenleme işlemi
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  const handleSaveEdit = (editedProduct: Product) => {
    // Gerçek uygulamada API çağrısı yapılacak
    console.log('Ürün düzenleniyor:', editedProduct);
    console.log('Yöneticiye bildirim gönderiliyor: Ürün düzenleme talebi -', editedProduct.title);
    
    // Ürünü güncelle ve durumu "Onay Bekliyor" yap
    setProducts(prev => prev.map(p => 
      p.id === editedProduct.id 
        ? { ...editedProduct, durum: 'Onay Bekliyor' as const }
        : p
    ));
    
    // Başarı mesajı göster
    setSuccessMessage(`${editedProduct.title} ürünü düzenlendi ve onay için yöneticiye iletildi.`);
    setShowSuccessMessage(true);
    
    // Modal'ı kapat
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Benzersiz kategorileri ve durumları al
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
  const uniqueStatus = ['Aktif', 'Onay Bekliyor', 'Satıldı', 'Pasif'] as const;

  // Filtreleme mantığı
  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(product.durum);
    const searchMatch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
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

  const handleStatusToggle = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatus([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedStatus.length > 0 || searchTerm !== '';

  // Durum renkleri
  const getStatusClass = (durum: string) => {
    switch (durum) {
      case 'Aktif':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Onay Bekliyor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Satıldı':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pasif':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Sayfalama mantığı
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark min-h-screen flex flex-col">
      <CftNavbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-content-light dark:text-content-dark">Ürünlerim</h1>
                <p className="mt-2 text-lg text-subtle-light dark:text-subtle-dark">
                  Kendi ürünlerinizi yönetin ve satışlarınızı takip edin
                </p>
              </div>
              <Link
                to="/atiklar/ekle"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Yeni Ürün Ekle
              </Link>
            </div>
          </div>

          {/* Arama ve Filtreler */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Arama */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Ürün ara..."
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>

              {/* Kategori Filtresi */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsStatusOpen(false);
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
                  <div className="absolute top-full left-0 mt-2 w-64 z-20 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-lg">
                    <div className="p-4">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {uniqueCategories.map((category) => {
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
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Durum Filtresi */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => {
                    setIsStatusOpen(!isStatusOpen);
                    setIsCategoryOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isStatusOpen
                      ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border-light dark:border-border-dark text-content-light dark:text-content-dark bg-background-light dark:bg-background-dark hover:text-primary hover:border-primary'
                  }`}
                >
                  Durum
                  <span className={`material-symbols-outlined text-base transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 z-20 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-lg">
                    <div className="p-4">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {uniqueStatus.map((status) => {
                          const isSelected = selectedStatus.includes(status);
                          return (
                            <label
                              key={status}
                              className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded px-2 py-1.5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleStatusToggle(status)}
                                className="w-4 h-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                              />
                              <span className="flex-1 text-sm text-content-light dark:text-content-dark">{status}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aktif Filtreler */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border-light dark:border-border-dark">
                <span className="text-sm font-medium text-content-light dark:text-content-dark">Aktif Filtreler:</span>
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm"
                  >
                    {category}
                    <button
                      onClick={() => handleCategoryToggle(category)}
                      className="hover:text-primary/80 rounded-full p-0.5 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-xs text-primary">close</span>
                    </button>
                  </span>
                ))}
                {selectedStatus.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm"
                  >
                    {status}
                    <button
                      onClick={() => handleStatusToggle(status)}
                      className="hover:text-primary/80 rounded-full p-0.5 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-xs text-primary">close</span>
                    </button>
                  </span>
                ))}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm">
                    Arama: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:text-primary/80 rounded-full p-0.5 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-xs text-primary">close</span>
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:text-primary hover:border-primary transition-colors"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>

          {/* Ürün Listesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-left shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={product.img}
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {product.category}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(product.durum)}`}>
                      {product.durum}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">{product.miktar}</p>
                    <p className="text-sm font-medium text-primary">{product.price}</p>
                  </div>
                  <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark line-clamp-2 flex-grow">{product.desc}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-subtle-light dark:text-subtle-dark">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      {product.goruntulenme}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">request_quote</span>
                      {product.teklifSayisi} teklif
                    </span>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-border-light dark:border-border-dark">
                    <button
                      onClick={() => openModal(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">info</span>
                      Detay
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                      title="Sil"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Boş Durum */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 block">inventory_2</span>
              <p className="text-lg font-medium text-content-light dark:text-content-dark mb-2">Ürün bulunamadı</p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                {hasActiveFilters ? 'Filtreleri temizleyerek tekrar deneyin' : 'Henüz ürün eklemediniz'}
              </p>
              {!hasActiveFilters && (
                <Link
                  to="/atiklar/ekle"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  İlk Ürününüzü Ekleyin
                </Link>
              )}
            </div>
          )}

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mt-8">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>

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
            <button
              onClick={closeModal}
              className="group absolute top-4 right-4 z-10 p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
            </button>

            <div className="flex flex-col">
              <div className="relative w-full h-64 sm:h-80 overflow-hidden">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className="rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {selectedProduct.category}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(selectedProduct.durum)}`}>
                    {selectedProduct.durum}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-2">
                    {selectedProduct.title}
                  </h2>
                  <p className="text-lg font-medium text-primary">{selectedProduct.price}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                  <div>
                    <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">Miktar</p>
                    <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">scale</span>
                      {selectedProduct.miktar}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">Durum</p>
                    <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(selectedProduct.durum)}`}>
                        {selectedProduct.durum}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">Görüntülenme</p>
                    <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      {selectedProduct.goruntulenme}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">Teklif Sayısı</p>
                    <p className="text-base text-content-light dark:text-content-dark flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">request_quote</span>
                      {selectedProduct.teklifSayisi}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                  <p className="text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">Açıklama</p>
                  <p className="text-base text-content-light dark:text-content-dark leading-relaxed">
                    {selectedProduct.desc}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  >
                    Kapat
                  </button>
                  <button 
                    onClick={() => handleEdit(selectedProduct)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modal */}
      {isDeleteConfirmOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">warning</span>
                </div>
                <h3 className="text-xl font-semibold text-content-light dark:text-content-dark">Ürünü Sil</h3>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-2">
                <strong className="text-content-light dark:text-content-dark">{productToDelete.title}</strong> ürününü silmek istediğinizden emin misiniz?
              </p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mb-6">
                Bu işlem yöneticiye bildirilecek ve onay sonrası ürün kalıcı olarak silinecektir.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modal */}
      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Başarı Mesajı */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-4 z-[60] animate-slide-in-right">
          <div className="bg-green-50 dark:bg-green-900/90 border-2 border-green-500 dark:border-green-400 rounded-xl p-4 shadow-xl min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-300">check_circle</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">İşlem Başarılı!</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="group p-1 rounded-lg border border-green-200 dark:border-green-700 bg-green-100/70 dark:bg-green-900/40 transition-colors hover:border-green-500 hover:bg-green-200 dark:hover:bg-green-800/70"
              >
                <span className="material-symbols-outlined text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors">close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Düzenleme Modal Komponenti
function EditProductModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (product: Product) => void }) {
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark shadow-2xl"
      >
        <div className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">Ürünü Düzenle</h2>
          <button
            onClick={onClose}
            className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bilgilendirme */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">info</span>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Önemli Bilgi</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Ürünü düzenledikten sonra durum "Onay Bekliyor" olarak değişecek ve yönetici onayı gerekecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Ürün Adı */}
          <div>
            <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Ürün Adı *
            </label>
            <input
              type="text"
              value={editedProduct.title}
              onChange={(e) => setEditedProduct({ ...editedProduct, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Miktar ve Fiyat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Miktar *
              </label>
              <input
                type="text"
                value={editedProduct.miktar}
                onChange={(e) => setEditedProduct({ ...editedProduct, miktar: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Örn: 25 Ton"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                Fiyat *
              </label>
              <input
                type="text"
                value={editedProduct.price}
                onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Örn: 280 ₺ / ton"
                required
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Kategori *
            </label>
            <input
              type="text"
              value={editedProduct.category}
              onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Açıklama *
            </label>
            <textarea
              value={editedProduct.desc}
              onChange={(e) => setEditedProduct({ ...editedProduct, desc: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
              rows={4}
              required
            />
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Kaydet ve Onay İste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Urunlerim;

