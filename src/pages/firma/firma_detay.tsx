import { useParams, useNavigate } from 'react-router-dom';
import FrmNavbar from '../../components/frmnavbar';

function FirmaDetay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Firma verileri - gerçek uygulamada API'den gelecek
  const firms: { [key: string]: any } = {
    'bioenerji-as': {
      name: 'BioEnerji A.Ş.',
      sector: 'Enerji',
      city: 'Ankara',
      district: 'Çankaya',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4',
      address: 'Çankaya Mah. Enerji Sok. No: 123, Çankaya, Ankara, Türkiye',
      phone: '+90 312 123 45 67',
      email: 'info@bioenerji.com.tr',
      website: 'www.bioenerji.com.tr',
      verified: true,
      description: 'BioEnerji A.Ş., tarımsal atıkların ve organik maddelerin biyogaz ve biyoyakıt üretiminde kullanılması konusunda uzmanlaşmış bir enerji firmasıdır. Sürdürülebilir enerji çözümleri sunarak çevreye katkı sağlamaktadır.',
      certificates: [
        'ISO 9001 Kalite Yönetim Sistemi',
        'ISO 14001 Çevre Yönetim Sistemi',
        'OHSAS 18001 İş Sağlığı ve Güvenliği Yönetim Sistemi'
      ],
      services: 'Tarımsal atıkların geri dönüşümü, biyogaz üretimi, biyoyakıt üretimi ve enerji danışmanlık hizmetleri',
      reviews: [
        {
          name: 'Ayşe Yılmaz',
          date: '2023-01-15',
          rating: 5,
          comment: 'BioEnerji ile çalışmak çok verimli oldu. Atıklarımızı değerlendirerek hem çevreye katkı sağladık hem de ek gelir elde ettik.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeoGO2yvDVE3kZoPXTGMyDCvX2PJaJOdkLLr9Mr0oEeLDJmWoT_gsRI6TmSNZCHI0oFtpKK2Nidcg7ozVTcNntCjPIwTALvLsoMJ-hgkIBvfw5rNFfeEF8IaFwrHnP-xwWfrrMlbzJFOn0bTkKzhggFx-PCFd9AX3ao9pR09gnGgCWtnUlCz-uOPRxhIYYIe5NDQozoBbrFPGFiXfw8cuRG9R9pK4aVvzTDiEx7YDaYDF8-aCRJTFS6nrRkgjsQuNmWKwrNMQ2DIc',
          likes: 3,
          dislikes: 0
        },
        {
          name: 'Mehmet Demir',
          date: '2022-12-20',
          rating: 4,
          comment: 'Hizmetlerinden memnun kaldık. Danışmanlık hizmetleri sayesinde üretim süreçlerimizi iyileştirdik.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS-v2q4iEPq_bKTqEp_5FnpPE7MMZeDH0MeTomJxGI7j9N92K6pTrOMKO4PuW9uZliN3rQmmrRm3dLvl0_oOuSSJuO95JjarHhjDXxuxPNIVct41y8glkHk0vZCbvcthqwBeBC8i1-aCJxX4pr2tQcAX6NRwX6NJ61aQBirYg2M9SOaheuB9YY_Sx-zivKZF1ez9aSkxdekYUkuRctsh7vBhFyVDSgai7yRA0KeBPPY9cPcubbgXuWyEWBkWTJsz5CqcuS5gAUte4',
          likes: 2,
          dislikes: 1
        }
      ],
      socialMedia: {
        twitter: '#',
        facebook: '#',
        instagram: '#'
      }
    },
    'organik-gubre-sanayi': {
      name: 'Organik Gübre Sanayi',
      sector: 'Tarım',
      city: 'İzmir',
      district: 'Bornova',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4',
      address: 'Bornova Mah. Tarım Cad. No: 45, Bornova, İzmir, Türkiye',
      phone: '+90 232 234 56 78',
      email: 'info@organikgubre.com.tr',
      website: 'www.organikgubre.com.tr',
      verified: true,
      description: 'Organik Gübre Sanayi, tarımsal atıkların organik gübreye dönüştürülmesi konusunda uzmanlaşmış bir firmadır. Çevre dostu üretim yöntemleri ile kaliteli organik gübre üretmektedir.',
      certificates: [
        'ISO 9001 Kalite Yönetim Sistemi',
        'Organik Ürün Sertifikası',
        'TSE Belgesi'
      ],
      services: 'Organik gübre üretimi, tarımsal atık yönetimi, kompost üretimi ve tarımsal danışmanlık hizmetleri',
      reviews: [
        {
          name: 'Ali Kaya',
          date: '2023-03-10',
          rating: 5,
          comment: 'Organik gübrelerimiz sayesinde verimliliğimiz arttı. Çok memnunuz.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeoGO2yvDVE3kZoPXTGMyDCvX2PJaJOdkLLr9Mr0oEeLDJmWoT_gsRI6TmSNZCHI0oFtpKK2Nidcg7ozVTcNntCjPIwTALvLsoMJ-hgkIBvfw5rNFfeEF8IaFwrHnP-xwWfrrMlbzJFOn0bTkKzhggFx-PCFd9AX3ao9pR09gnGgCWtnUlCz-uOPRxhIYYIe5NDQozoBbrFPGFiXfw8cuRG9R9pK4aVvzTDiEx7YDaYDF8-aCRJTFS6nrRkgjsQuNmWKwrNMQ2DIc',
          likes: 5,
          dislikes: 0
        }
      ],
      socialMedia: {
        twitter: '#',
        facebook: '#',
        instagram: '#'
      }
    },
    'sonmez-tekstil': {
      name: 'Sönmez Tekstil',
      sector: 'Tekstil',
      city: 'Bursa',
      district: 'Osmangazi',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4',
      address: 'Osmangazi Mah. Tekstil Sok. No: 78, Osmangazi, Bursa, Türkiye',
      phone: '+90 224 345 67 89',
      email: 'info@sonmeztekstil.com.tr',
      website: 'www.sonmeztekstil.com.tr',
      verified: true,
      description: 'Sönmez Tekstil, tarımsal liflerin tekstil endüstrisinde kullanılması konusunda öncü bir firmadır. Pamuk, keten ve diğer doğal liflerin işlenmesi ve tekstil ürünlerine dönüştürülmesi konusunda uzmanlaşmıştır.',
      certificates: [
        'ISO 9001 Kalite Yönetim Sistemi',
        'Oeko-Tex Standard 100',
        'Global Organic Textile Standard (GOTS)'
      ],
      services: 'Doğal lif işleme, organik tekstil üretimi, sürdürülebilir tekstil çözümleri ve tekstil danışmanlık hizmetleri',
      reviews: [
        {
          name: 'Zeynep Arslan',
          date: '2023-02-28',
          rating: 4,
          comment: 'Kaliteli ürünler ve iyi hizmet. Organik tekstil ürünleri için tercih ediyoruz.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeoGO2yvDVE3kZoPXTGMyDCvX2PJaJOdkLLr9Mr0oEeLDJmWoT_gsRI6TmSNZCHI0oFtpKK2Nidcg7ozVTcNntCjPIwTALvLsoMJ-hgkIBvfw5rNFfeEF8IaFwrHnP-xwWfrrMlbzJFOn0bTkKzhggFx-PCFd9AX3ao9pR09gnGgCWtnUlCz-uOPRxhIYYIe5NDQozoBbrFPGFiXfw8cuRG9R9pK4aVvzTDiEx7YDaYDF8-aCRJTFS6nrRkgjsQuNmWKwrNMQ2DIc',
          likes: 4,
          dislikes: 0
        }
      ],
      socialMedia: {
        twitter: '#',
        facebook: '#',
        instagram: '#'
      }
    },
    'yesil-yakitlar-ltd': {
      name: 'Yeşil Yakıtlar Ltd.',
      sector: 'Enerji',
      city: 'Adana',
      district: 'Seyhan',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4',
      address: 'Seyhan Mah. Enerji Cad. No: 90, Seyhan, Adana, Türkiye',
      phone: '+90 322 456 78 90',
      email: 'info@yesilyakitlar.com.tr',
      website: 'www.yesilyakitlar.com.tr',
      verified: false,
      description: 'Yeşil Yakıtlar Ltd., tarımsal atıkların biyoyakıt ve biyodizel üretiminde kullanılması konusunda faaliyet göstermektedir. Yenilenebilir enerji kaynaklarının geliştirilmesi için çalışmaktadır.',
      certificates: [
        'ISO 9001 Kalite Yönetim Sistemi'
      ],
      services: 'Biyoyakıt üretimi, biyodizel üretimi, tarımsal atık yönetimi ve enerji danışmanlık hizmetleri',
      reviews: [],
      socialMedia: {
        twitter: '#',
        facebook: '#',
        instagram: '#'
      }
    },
    'doga-tarim-urunleri': {
      name: 'Doğa Tarım Ürünleri',
      sector: 'Tarım',
      city: 'Antalya',
      district: 'Muratpaşa',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4',
      address: 'Muratpaşa Mah. Tarım Sok. No: 12, Muratpaşa, Antalya, Türkiye',
      phone: '+90 242 567 89 01',
      email: 'info@dogatarim.com.tr',
      website: 'www.dogatarim.com.tr',
      verified: true,
      description: 'Doğa Tarım Ürünleri, organik tarım ürünlerinin işlenmesi ve pazarlanması konusunda uzmanlaşmış bir firmadır. Sürdürülebilir tarım uygulamalarını desteklemektedir.',
      certificates: [
        'ISO 9001 Kalite Yönetim Sistemi',
        'Organik Ürün Sertifikası',
        'İyi Tarım Uygulamaları (İTU) Sertifikası'
      ],
      services: 'Organik tarım ürünleri işleme, paketleme, pazarlama ve tarımsal danışmanlık hizmetleri',
      reviews: [
        {
          name: 'Fatma Öz',
          date: '2023-04-05',
          rating: 5,
          comment: 'Organik ürünlerin kalitesi çok yüksek. Müşteri hizmetleri de çok iyi.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeoGO2yvDVE3kZoPXTGMyDCvX2PJaJOdkLLr9Mr0oEeLDJmWoT_gsRI6TmSNZCHI0oFtpKK2Nidcg7ozVTcNntCjPIwTALvLsoMJ-hgkIBvfw5rNFfeEF8IaFwrHnP-xwWfrrMlbzJFOn0bTkKzhggFx-PCFd9AX3ao9pR09gnGgCWtnUlCz-uOPRxhIYYIe5NDQozoBbrFPGFiXfw8cuRG9R9pK4aVvzTDiEx7YDaYDF8-aCRJTFS6nrRkgjsQuNmWKwrNMQ2DIc',
          likes: 6,
          dislikes: 0
        },
        {
          name: 'Can Yıldız',
          date: '2023-03-20',
          rating: 4,
          comment: 'Ürün çeşitliliği ve kalite açısından beklentilerimizi karşıladı.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS-v2q4iEPq_bKTqEp_5FnpPE7MMZeDH0MeTomJxGI7j9N92K6pTrOMKO4PuW9uZliN3rQmmrRm3dLvl0_oOuSSJuO95JjarHhjDXxuxPNIVct41y8glkHk0vZCbvcthqwBeBC8i1-aCJxX4pr2tQcAX6NRwX6NJ61aQBirYg2M9SOaheuB9YY_Sx-zivKZF1ez9aSkxdekYUkuRctsh7vBhFyVDSgai7yRA0KeBPPY9cPcubbgXuWyEWBkWTJsz5CqcuS5gAUte4',
          likes: 3,
          dislikes: 1
        }
      ],
      socialMedia: {
        twitter: '#',
        facebook: '#',
        instagram: '#'
      }
    }
  };

  // Varsayılan firma verisi
  const defaultFirm = {
    name: 'BioEnerji A.Ş.',
    sector: 'Enerji',
    city: 'Ankara',
    district: 'Çankaya',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJux5fXj_K4jD4vHtF0CU64CB5vu_kgDjGtl0pUPIU_AoVAWPbJQiUnQYB-txIuUTOoe2T9fA7hbkVLnW3FCTu4nUbgTyu_MWt5hyK3M73qSU3hCtHCZ6JfeChWD-RLs0dPMfOLUbR5kbZAK0llRVuAdy37Qq6nw5e9adueks-w8Ayo_woBikptdX9bSwFY7YmzLz0IttwY6-ENN1Zwxzh2lge0u9ZEghHvUAPEM5IdNCqeF9vaagr6zMxwOZFXQ5IUlXWNfmEou4',
    address: 'Çankaya Mah. Enerji Sok. No: 123, Çankaya, Ankara, Türkiye',
    phone: '+90 312 123 45 67',
    email: 'info@bioenerji.com.tr',
    website: 'www.bioenerji.com.tr',
    verified: true,
    description: 'Tarımsal atıkların ve ürünlerin verimli değerlendirilmesi için doğrulanmış çiftlikler ve firmaları bir araya getiren platform.',
    certificates: [
      'ISO 9001 Kalite Yönetim Sistemi',
      'ISO 14001 Çevre Yönetim Sistemi'
    ],
    services: 'Tarımsal atıkların geri dönüşümü, organik gübre üretimi, biyogaz üretimi ve tarımsal danışmanlık hizmetleri',
    reviews: [
      {
        name: 'Ayşe Yılmaz',
        date: '2023-01-15',
        rating: 5,
        comment: 'AgriConnect ile çalışmak çok verimli oldu. Atıklarımızı değerlendirerek hem çevreye katkı sağladık hem de ek gelir elde ettik.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeoGO2yvDVE3kZoPXTGMyDCvX2PJaJOdkLLr9Mr0oEeLDJmWoT_gsRI6TmSNZCHI0oFtpKK2Nidcg7ozVTcNntCjPIwTALvLsoMJ-hgkIBvfw5rNFfeEF8IaFwrHnP-xwWfrrMlbzJFOn0bTkKzhggFx-PCFd9AX3ao9pR09gnGgCWtnUlCz-uOPRxhIYYIe5NDQozoBbrFPGFiXfw8cuRG9R9pK4aVvzTDiEx7YDaYDF8-aCRJTFS6nrRkgjsQuNmWKwrNMQ2DIc',
        likes: 3,
        dislikes: 0
      },
      {
        name: 'Mehmet Demir',
        date: '2022-12-20',
        rating: 4,
        comment: 'Hizmetlerinden memnun kaldık. Danışmanlık hizmetleri sayesinde üretim süreçlerimizi iyileştirdik.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS-v2q4iEPq_bKTqEp_5FnpPE7MMZeDH0MeTomJxGI7j9N92K6pTrOMKO4PuW9uZliN3rQmmrRm3dLvl0_oOuSSJuO95JjarHhjDXxuxPNIVct41y8glkHk0vZCbvcthqwBeBC8i1-aCJxX4pr2tQcAX6NRwX6NJ61aQBirYg2M9SOaheuB9YY_Sx-zivKZF1ez9aSkxdekYUkuRctsh7vBhFyVDSgai7yRA0KeBPPY9cPcubbgXuWyEWBkWTJsz5CqcuS5gAUte4',
        likes: 2,
        dislikes: 1
      }
    ],
    socialMedia: {
      twitter: '#',
      facebook: '#',
      instagram: '#'
    }
  };

  const firm = id ? firms[id] || defaultFirm : defaultFirm;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Geri Dön Butonu */}
        <button
          onClick={() => navigate('/firmalar')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Firmalara Dön</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            {/* Firma Kartı */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
                    style={{backgroundImage: `url("${firm.image}")`}}
                  ></div>
                  {firm.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5">
                      <span className="material-symbols-outlined !text-base">verified</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{firm.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{firm.sector}</p>
                {firm.verified && (
                  <p className="text-sm font-medium text-primary mt-1">Doğrulanmış Firma</p>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                  <span className="material-symbols-outlined">chat_bubble</span> İletişime Geç
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-white shadow-sm hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                  <span className="material-symbols-outlined">shopping_cart</span> Ürünleri Gör
                </button>
              </div>
            </div>
            {/* Firma Bilgileri */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Firma Bilgileri</h2>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Adres</p>
                    <p className="text-gray-800 dark:text-gray-200">{firm.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">call</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">İletişim</p>
                    <p className="text-gray-800 dark:text-gray-200">{firm.phone}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">email</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">E-posta</p>
                    <p className="text-gray-800 dark:text-gray-200">{firm.email}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">language</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Web Sitesi</p>
                    <a className="text-primary hover:underline" href={`https://${firm.website}`} target="_blank" rel="noopener noreferrer">{firm.website}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">group</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Sosyal Medya</p>
                    <div className="flex gap-2 mt-1">
                      <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href={firm.socialMedia.twitter}>Twitter</a>
                      <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href={firm.socialMedia.facebook}>Facebook</a>
                      <a className="text-gray-500 dark:text-gray-400 hover:text-primary" href={firm.socialMedia.instagram}>Instagram</a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="md:col-span-2 space-y-8">
            {/* Ürünler ve Hizmetler */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ürünler ve Hizmetler</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {firm.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Hizmetler:</strong> {firm.services}
              </p>
            </div>
            {/* Sertifikalar */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sertifikalar</h2>
              <ul className="space-y-3">
                {firm.certificates.map((cert: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 size-10">
                      <span className="material-symbols-outlined text-primary">workspace_premium</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{cert}</p>
                  </li>
                ))}
              </ul>
            </div>
            {/* Referanslar */}
            {firm.reviews && firm.reviews.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Referanslar ({firm.reviews.length})</h2>
                <div className="space-y-8">
                  {firm.reviews.map((review: any, idx: number) => (
                    <div key={idx}>
                      {idx > 0 && <div className="border-t border-gray-200 dark:border-gray-800 mb-8"></div>}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{backgroundImage: `url("${review.avatar}")`}}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-0.5 text-primary">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <span 
                                  key={i} 
                                  className="material-symbols-outlined !text-base" 
                                  style={{fontVariationSettings: i < review.rating ? "'FILL' 1" : undefined}}
                                >
                                  star
                                </span>
                              ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">"{review.comment}"</p>
                        <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                          <button className="flex items-center gap-1.5 text-xs hover:text-primary">
                            <span className="material-symbols-outlined !text-base">thumb_up</span>
                            <span>{review.likes}</span>
                          </button>
                          {review.dislikes > 0 && (
                            <button className="flex items-center gap-1.5 text-xs hover:text-primary">
                              <span className="material-symbols-outlined !text-base">thumb_down</span>
                              <span>{review.dislikes}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default FirmaDetay;
