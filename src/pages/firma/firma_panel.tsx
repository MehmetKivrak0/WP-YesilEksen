import { useState } from 'react';
import { Link } from 'react-router-dom';
import FrmNavbar from '../../components/frmnavbar';

function FirmaPanel() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hafta' | 'ay' | 'yil'>('ay');

  // Örnek veriler - gerçek uygulamada API'den gelecek
  const stats = {
    toplamSatinAlma: 24,
    bekleyenTeklif: 5,
    aktifSiparis: 3,
    toplamHarcama: '45.500',
  };

  const sonIslemler = [
    {
      id: 1,
      urun: 'Mısır Sapı',
      miktar: '10 Ton',
      fiyat: '2.800 ₺',
      tarih: '2 saat önce',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      satici: 'Çukurova Çiftliği',
    },
    {
      id: 2,
      urun: 'Buğday Samanı',
      miktar: '20 Ton',
      fiyat: '6.400 ₺',
      tarih: '1 gün önce',
      durum: 'Tamamlandı',
      durumClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      satici: 'İç Anadolu Çiftliği',
    },
    {
      id: 3,
      urun: 'Ayçiçeği Sapı',
      miktar: '5 Ton',
      fiyat: '1.900 ₺',
      tarih: '2 gün önce',
      durum: 'Kargoda',
      durumClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      satici: 'Marmara Çiftliği',
    },
    {
      id: 4,
      urun: 'Organik Kompost',
      miktar: '8 Ton',
      fiyat: '4.400 ₺',
      tarih: '3 gün önce',
      durum: 'Hazırlanıyor',
      durumClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      satici: 'Ege Çiftliği',
    },
  ];

  const bekleyenTeklifler = [
    {
      id: 1,
      urun: 'Hayvansal Gübre',
      miktar: '15 Ton',
      teklifFiyat: '6.750 ₺',
      birimFiyat: '450 ₺ / ton',
      satici: 'Toros Çiftliği',
      tarih: '5 saat önce',
      sure: '2 gün kaldı',
    },
    {
      id: 2,
      urun: 'Pamuk Atığı',
      miktar: '12 Ton',
      teklifFiyat: '5.040 ₺',
      birimFiyat: '420 ₺ / ton',
      satici: 'Güneydoğu Çiftliği',
      tarih: '1 gün önce',
      sure: '3 gün kaldı',
    },
    {
      id: 3,
      urun: 'Zeytin Karasuyu',
      miktar: '5 m³',
      teklifFiyat: '3.400 ₺',
      birimFiyat: '680 ₺ / m³',
      satici: 'Akdeniz Çiftliği',
      tarih: '2 gün önce',
      sure: '4 gün kaldı',
    },
  ];

  const hizliErisim = [
    {
      title: 'Ürünleri Keşfet',
      description: 'Mevcut atık ve ürünleri görüntüle',
      icon: 'inventory_2',
      link: '/atiklar',
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Satın Alma Geçmişi',
      description: 'Geçmiş siparişlerinizi görüntüleyin',
      icon: 'history',
      link: '/firma/satis-gecmisi',
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Firma Profili',
      description: 'Firma bilgilerinizi düzenleyin',
      icon: 'business',
      link: '/firma/profil',
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Çiftlikler',
      description: 'Kayıtlı çiftlikleri görüntüleyin',
      icon: 'agriculture',
      link: '/ciftlikler',
      color: 'bg-orange-100 dark:bg-orange-900',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Başlık */}
          <header className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">
                  Firma Paneli
                </h1>
                <p className="text-lg text-subtle-light dark:text-subtle-dark">
                  Satın alma işlemlerinizi ve tekliflerinizi yönetin
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTimeRange('hafta')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === 'hafta'
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10'
                  }`}
                >
                  Hafta
                </button>
                <button
                  onClick={() => setSelectedTimeRange('ay')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === 'ay'
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10'
                  }`}
                >
                  Ay
                </button>
                <button
                  onClick={() => setSelectedTimeRange('yil')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === 'yil'
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-content-light dark:text-content-dark hover:bg-primary/10'
                  }`}
                >
                  Yıl
                </button>
              </div>
            </div>
          </header>

          {/* İstatistik Kartları */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">
                    shopping_cart
                  </span>
                </div>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Toplam Satın Alma</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{stats.toplamSatinAlma}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Bu {selectedTimeRange === 'hafta' ? 'hafta' : selectedTimeRange === 'ay' ? 'ay' : 'yıl'}</p>
            </div>

            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-yellow-600 dark:text-yellow-400">
                    pending_actions
                  </span>
                </div>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Bekleyen Teklif</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{stats.bekleyenTeklif}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Aktif teklifler</p>
            </div>

            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">
                    local_shipping
                  </span>
                </div>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Aktif Sipariş</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{stats.aktifSiparis}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Devam eden siparişler</p>
            </div>

            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">
                    payments
                  </span>
                </div>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Toplam Harcama</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{stats.toplamHarcama} ₺</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-2">Bu {selectedTimeRange === 'hafta' ? 'hafta' : selectedTimeRange === 'ay' ? 'ay' : 'yıl'}</p>
            </div>
          </section>

          {/* Ana İçerik Grid */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            {/* Son İşlemler */}
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Son İşlemler</h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">En son satın alma işlemleriniz</p>
                </div>
                <Link
                  to="/firma/satis-gecmisi"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Tümünü Gör
                  <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                </Link>
              </div>
              <div className="space-y-3">
                {sonIslemler.map((islem) => (
                  <div
                    key={islem.id}
                    className="rounded-lg border border-border-light dark:border-border-dark p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-content-light dark:text-content-dark mb-1">{islem.urun}</h3>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">{islem.satici}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${islem.durumClass}`}>
                        {islem.durum}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-subtle-light dark:text-subtle-dark">{islem.miktar}</span>
                        <span className="font-semibold text-content-light dark:text-content-dark">{islem.fiyat}</span>
                      </div>
                      <span className="text-xs text-subtle-light dark:text-subtle-dark">{islem.tarih}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bekleyen Teklifler */}
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Bekleyen Teklifler</h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Onay bekleyen teklifleriniz</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {bekleyenTeklifler.length} bekliyor
                </span>
              </div>
              <div className="space-y-3">
                {bekleyenTeklifler.map((teklif) => (
                  <div
                    key={teklif.id}
                    className="rounded-lg border border-border-light dark:border-border-dark p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-content-light dark:text-content-dark mb-1">{teklif.urun}</h3>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">{teklif.satici}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-subtle-light dark:text-subtle-dark">Miktar:</span>
                        <span className="font-medium text-content-light dark:text-content-dark">{teklif.miktar}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-subtle-light dark:text-subtle-dark">Teklif:</span>
                        <span className="font-semibold text-primary">{teklif.teklifFiyat}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-subtle-light dark:text-subtle-dark">{teklif.tarih}</span>
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">{teklif.sure}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Hızlı Erişim */}
          <section className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Hızlı Erişim</h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Sık kullanılan sayfalara hızlı erişim</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hizliErisim.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="group flex items-center gap-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-4 transition-all hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.color}`}>
                    <span className={`material-symbols-outlined text-2xl ${item.iconColor}`}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-sm font-semibold text-content-light dark:text-content-dark">
                      {item.title}
                    </h3>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-content-light transition-transform group-hover:translate-x-1 dark:text-content-dark">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default FirmaPanel;

