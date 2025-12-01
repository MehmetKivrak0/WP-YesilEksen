import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../../components/navbar';

const heroBackground =
  "linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpZU1R2hl79yrNUFOM4v8cNGTd1SBvYLdTai1zhDONT8p3L4B3-bTzrYEI21wd2rxeLbsOt25VC83xeRh_uFsgIthMJQwsODDBuQnA5j5wuwFSajg5cjLlr6YIBatZtOw3-Lmx3wzjGpHDTtBokoFRilUGg3vp1LDMDqFUJkRd_hJoW-1oJIVKmIN7ijoEoFwlctfBx9MvO7OtIyxS3gt9lcvh7eWwR1L0Z0krPP2_zcqFTndoml3K5H32vwHqXbJ7_ogev26hrWA')";

function FarmDetailPage() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'certificates'>('products');

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          {/* Geri Dön Butonu */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/ziraat')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Dashboard'a Dön</span>
            </button>
          </div>

          {/* Çiftlik Hero Section */}
          <div
            className="relative mb-8 overflow-hidden rounded-xl bg-cover bg-center shadow-lg"
            style={{ backgroundImage: heroBackground }}
          >
            <div className="p-8 text-white">
              <h1 className="mb-2 text-4xl font-bold">Güneş Çiftliği</h1>
              <p className="text-lg">
                {farmerId ? `Çiftlik ID: ${farmerId} • Konya, Çumra` : 'Konya, Çumra'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 flex border-b border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center justify-center border-b-2 px-4 pb-4 pt-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-subtle-light hover:border-primary/50 hover:text-primary dark:text-subtle-dark'
              }`}
            >
              <span className="text-sm font-bold">Ürünler/Atıklar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex items-center justify-center border-b-2 px-4 pb-4 pt-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-subtle-light hover:border-primary/50 hover:text-primary dark:text-subtle-dark'
              }`}
            >
              <span className="text-sm font-bold">Çiftlik Hakkında</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center justify-center border-b-2 px-4 pb-4 pt-2 transition-colors ${
                activeTab === 'certificates'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-subtle-light hover:border-primary/50 hover:text-primary dark:text-subtle-dark'
              }`}
            >
              <span className="text-sm font-bold">Belgeler/Sertifikalar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Ana İçerik */}
            <div className="lg:col-span-2">
              {/* Ürünler/Atıklar Sekmesi */}
              {activeTab === 'products' && (
                <>
                  {/* Ürün/Atık Tablosu */}
                  <div className="mb-8 rounded-lg bg-background-light p-6 shadow-md dark:bg-background-dark">
                    <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                      Ürünler ve Atıklar
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-border-light bg-background-light text-xs uppercase dark:border-border-dark dark:bg-background-dark">
                          <tr>
                            <th className="px-6 py-3 text-subtle-light dark:text-subtle-dark">Ürün/Atık Adı</th>
                            <th className="px-6 py-3 text-subtle-light dark:text-subtle-dark">Miktar</th>
                            <th className="px-6 py-3 text-subtle-light dark:text-subtle-dark">Fiyat</th>
                            <th className="px-6 py-3 text-subtle-light dark:text-subtle-dark" />
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border-light transition-colors hover:bg-primary/5 dark:border-border-dark">
                            <td className="px-6 py-4 font-medium text-content-light dark:text-content-dark">Buğday Sapı</td>
                            <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">10 Ton</td>
                            <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">₺25/Ton</td>
                            <td className="px-6 py-4 text-right">
                              <Link className="font-medium text-primary hover:underline" to="#">
                                Teklif Ver
                              </Link>
                            </td>
                          </tr>
                          <tr className="border-b border-border-light transition-colors hover:bg-primary/5 dark:border-border-dark">
                            <td className="px-6 py-4 font-medium text-content-light dark:text-content-dark">Domates Posası</td>
                            <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">500 kg</td>
                            <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">₺50/100kg</td>
                            <td className="px-6 py-4 text-right">
                              <Link className="font-medium text-primary hover:underline" to="#">
                                Teklif Ver
                              </Link>
                            </td>
                          </tr>
                          <tr className="transition-colors hover:bg-primary/5">
                            <td className="px-6 py-4 font-medium text-content-light dark:text-content-dark">Organik Elma</td>
                            <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">2 Ton</td>
                            <td className="px-6 py-4 text-subtle-light dark:text-subtle-dark">₺800/Ton</td>
                            <td className="px-6 py-4 text-right">
                              <Link className="font-medium text-primary hover:underline" to="#">
                                Teklif Ver
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Atık Yönetimi Bilgisi */}
                  <div className="mb-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4">
                    <h3 className="text-base font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined">delete</span>
                      Atık Yönetimi
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-300">
                      Bu çiftlik, sürdürülebilir atık yönetimi uygulamaları ile organik atıkları kompost haline getirerek toprağa geri kazandırmaktadır.
                    </p>
                  </div>

                  {/* Fotoğraf Galerisi */}
                  <div className="rounded-lg bg-background-light p-6 shadow-md dark:bg-background-dark">
                    <h2 className="mb-4 text-2xl font-bold text-content-light dark:text-content-dark">Fotoğraf Galerisi</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div>
                        <img
                          className="h-auto max-w-full rounded-lg"
                          alt="Sepette hasat edilmiş elmalar"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxUkWi2oHMwys6be_oXOWmX24N9dVaEMnNhQuabqdtDn7deWHnp_VRYxNiY2DrWV5wQ0jTsExZBnA170fqwm74fVdjZ2r9aFaBCWWuE2yWKME8AkJnTWTMevcALvctGAfJw3L1t-ZcTj-8a1Bqv3x4ki20KBz1WkplhcS1__10fDViwSkWR67ifiuisuua1VaPG66cEb0wJK3ZqoPJnbF2y6gIj_bhjO8QmubtRSq1cn0LJZYWCKTkRbUilhepp8IV8zjkNiK4bzA"
                        />
                      </div>
                      <div>
                        <img
                          className="h-auto max-w-full rounded-lg"
                          alt="Buğday tarlasında modern traktör"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA4LU9lEe4Dun7XdJgH2hwB2fa30NcOfffLZXAxO1BvrM7YihK7xFUFIdLMNIGsiyf-201fgeY8vqJ7dI-eFB6WmGwW8yOw8ugeGY5cjS5LkX_PxQJrVnOSumE5BN3plPNChuT76HXUx3XfjxB_-bB3wYO8w-UJ6KKpRQgd6FuUUM77nk_UtHEg3ONYQC7zgY-iI--hSQpMFmAXQLqloaOK8S8tx5TkpX0ex1MI8OZA8ot8ghnXd9HSkdHU_WBkxDeJwTeXQJHRs8"
                        />
                      </div>
                      <div>
                        <img
                          className="h-auto max-w-full rounded-lg"
                          alt="Altın buğday saplarının yakın çekimi"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYicyj4qma844qqkHz8yQScW501KbEnqdOvmgRvP1fqwJJr-AqZQ3Gyx65mcGZ97wCE86TOBaLPsNGES8JQg6bHqR3OwgQE33WzWVSaEJWXiAFuhC-f1JbUXcOHq-XBZZKnDMiYbzvhIds7N0oIY7s5Ws_5VQdZ0MDkNb9vZl2Mueq1GkHdUQAlA2KE3ot7LD1CNHwXjMftEBWYMnVkkwxnnUFSldqgVD2oUJftJM7KJETNMEEpF3TzR_j015D0tR1-uK6sIdfk3M"
                        />
                      </div>
                      <div>
                        <img
                          className="h-auto max-w-full rounded-lg"
                          alt="Ekinlere bakan çiftlik işçileri"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4bYdWDdL6DI3gFH9ElfBRKw_zgSMTRhpwZ_dFOiBE6ZkZXBZE3uli4Y2X24tqddBc9z_kYcUbhtrgvooWHWkwK3gzcGwBiYhu7ZVX0JDmuyE3YlfC8yc0lxTpqQTQprztATwZyb2xbREL5iDLTgQupdQ39Y1qUpna1Wih2QZBmDoyOxVLrHj9G5J3IthuedrKP9xNWnwtmp5VFLCrRwBp3V-kONU4ABIyhnxRFDD3mRt5GtmSFoDnCNnrXZXQWC-xvUtEx9i_QSA"
                        />
                      </div>
                      <div>
                        <img
                          className="h-auto max-w-full rounded-lg"
                          alt="Çiftlik tarlalarının havadan görünümü"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC95v9uRbcNn15j3219HMmhFeR1awbrQf2_x1z7hVS99VF1CswP65lEdE5ZvDnX_oAlaxIWHjjx5aQXMJsPb9lgcsvM5bCOEzcIqjRT52JyXDdymCEdcQBSTA08OJwNQv03_cSyrCTbE1Nuo7TpkpIBudBTXGlFqNY-HBtiDpwReFfcb-Cmzkpgn_RHOGlt04GWhyZ318mQ_Ozza6uxJos71Vl-DwhVimiPND5zrURUXUrQc1QS662_fWYrABtiEkTgLx-BgqJAwE"
                        />
                      </div>
                      <div>
                        <img
                          className="h-auto max-w-full rounded-lg"
                          alt="Taze ürün tutan çiftçi"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPkp74LEWhjJysIO8CMwAlCYSLiWxXcXcrXBXUw7hX2AgxALlFd55cwJP_-YpIyH0Ryj-7sVTj3dC7ac6YMKsXJc_9vjurpf7V8k24-lmdGm866msb3e0SVzBJ04sUzsf5S-Frg2V9wrD0uaVzn5b_rf2PkxKg7p0dJi9eg-Wvx_Bg4I178iNIkyw7ruRnxb2wCcn1dC_95_xJwD1haWYavxMnlQcMXZFuNuSYgaCZtOHMXvZPKerReYuwCLeDILrdY2u4rV-H5Vc"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Çiftlik Hakkında Sekmesi */}
              {activeTab === 'about' && (
                <div className="rounded-lg bg-background-light p-6 shadow-md dark:bg-background-dark">
                  <h2 className="mb-4 text-2xl font-bold text-content-light dark:text-content-dark">Çiftlik Hakkında</h2>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark leading-relaxed mb-6">
                    Güneş Çiftliği, Konya'nın Çumra ilçesinde yer alan, organik tarım uygulamaları ile öne çıkan bir çiftliktir. 
                    Sürdürülebilir tarım yöntemleri kullanarak, çevreye saygılı üretim gerçekleştirmektedir. 
                    Çiftliğimizde buğday, domates, elma ve diğer organik ürünler yetiştirilmektedir.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-base font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">eco</span>
                        Sürdürülebilirlik
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Çevreye saygılı üretim yöntemleri ve organik tarım uygulamaları ile doğal kaynakları korumaktayız.
                        Su tasarrufu sağlayan sulama sistemleri ve yenilenebilir enerji kaynaklarını kullanıyoruz.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">local_shipping</span>
                        Tedarik Zinciri
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Ürünlerimiz tarladan sofraya güvenilir ve şeffaf bir tedarik zinciri ile ulaştırılmaktadır.
                        Üretimden satışa kadar her aşamada kalite kontrol uygulanmaktadır.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Belgeler/Sertifikalar Sekmesi */}
              {activeTab === 'certificates' && (
                <div className="rounded-lg bg-background-light p-6 shadow-md dark:bg-background-dark">
                  <h2 className="mb-6 text-2xl font-bold text-content-light dark:text-content-dark">Belgeler ve Sertifikalar</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">verified</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-content-light dark:text-content-dark">Organik Tarım Sertifikası</h3>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                            Geçerli sertifika - Aktif
                          </p>
                        </div>
                        <Link to="#" className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors">
                          Görüntüle
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">description</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-content-light dark:text-content-dark">Toprak Analiz Raporu</h3>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                            Haziran 2024 - Toprak kalite analizi
                          </p>
                        </div>
                        <Link to="#" className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors">
                          İndir
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">policy</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-content-light dark:text-content-dark">İyi Tarım Uygulamaları Belgesi</h3>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                            Tarım ve Orman Bakanlığı onaylı
                          </p>
                        </div>
                        <Link to="#" className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors">
                          Görüntüle
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Yan Panel */}
            <div className="space-y-6">
              {/* İletişim Bilgileri */}
              <div className="rounded-lg bg-background-light p-6 shadow-md dark:bg-background-dark">
                <h3 className="mb-4 text-xl font-bold text-content-light dark:text-content-dark">
                  İletişim Bilgileri
                </h3>
                <ul className="space-y-3 text-subtle-light dark:text-subtle-dark">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">call</span>
                    <span>+90 123 456 78 90</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">mail</span>
                    <span>contact@gunesciftligi.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <span>Güneş Vadisi, Çumra, Konya, Türkiye</span>
                  </li>
                </ul>
              </div>

              {/* Hızlı İstatistikler */}
              <div className="rounded-lg bg-background-light p-6 shadow-md dark:bg-background-dark">
                <h3 className="mb-4 text-xl font-bold text-content-light dark:text-content-dark">Çiftlik İstatistikleri</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-subtle-light dark:text-subtle-dark">Toplam Ürün Çeşidi</span>
                    <span className="text-lg font-bold text-primary">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-subtle-light dark:text-subtle-dark">Aktif Atık Yönetimi</span>
                    <span className="text-lg font-bold text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-subtle-light dark:text-subtle-dark">Organik Sertifika</span>
                    <span className="text-lg font-bold text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-subtle-light dark:text-subtle-dark">Tarım Arazisi</span>
                    <span className="text-lg font-bold text-primary">250 dönüm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FarmDetailPage;
