import { useState } from 'react';
import { Link } from 'react-router-dom';
import ZrtnNavbar from '../../../../components/zrtnavbar';
import { SDGRadarChart, SDGBarChart, SDGTrendChart } from './components/Charts';

type SDGGoal = {
  id: number;
  title: string;
  description: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  recommendations: string[];
  indicators: {
    name: string;
    value: number;
    unit: string;
    target: number;
  }[];
};

function SDGReportPage() {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  // SDG Goals data - gerçek uygulamada API'den gelecek
  const sdgGoals: SDGGoal[] = [
    {
      id: 2,
      title: 'Açlığa Son',
      description: 'Sürdürülebilir tarım, gıda güvenliği ve beslenme',
      score: 7.8,
      trend: 'up',
      recommendations: [
        'Organik tarım uygulamalarını %30 artırın',
        'Gıda israfını azaltmak için atık yönetimi sistemlerini güçlendirin',
        'Küçük çiftçilere finansal destek sağlayın',
      ],
      indicators: [
        { name: 'Organik Ürün Üretimi', value: 1250, unit: 'ton', target: 2000 },
        { name: 'Gıda Güvenliği Skoru', value: 8.2, unit: '/10', target: 9.0 },
        { name: 'Çiftçi Geliri Artışı', value: 15, unit: '%', target: 25 },
      ],
    },
    {
      id: 6,
      title: 'Temiz Su ve Sanitasyon',
      description: 'Su kalitesi, su kullanımı ve atık su yönetimi',
      score: 6.5,
      trend: 'stable',
      recommendations: [
        'Su tasarrufu teknolojilerini yaygınlaştırın',
        'Atık su arıtma tesislerini modernize edin',
        'Su kalitesi izleme sistemlerini güçlendirin',
      ],
      indicators: [
        { name: 'Su Kullanım Verimliliği', value: 72, unit: '%', target: 85 },
        { name: 'Arıtılmış Su Oranı', value: 68, unit: '%', target: 90 },
        { name: 'Su Kalitesi İndeksi', value: 7.1, unit: '/10', target: 8.5 },
      ],
    },
    {
      id: 7,
      title: 'Erişilebilir ve Temiz Enerji',
      description: 'Yenilenebilir enerji kullanımı ve enerji verimliliği',
      score: 8.1,
      trend: 'up',
      recommendations: [
        'Güneş enerjisi sistemlerini çiftliklere yaygınlaştırın',
        'Biyogaz üretim tesislerini artırın',
        'Enerji verimli ekipman kullanımını teşvik edin',
      ],
      indicators: [
        { name: 'Yenilenebilir Enerji Payı', value: 45, unit: '%', target: 60 },
        { name: 'Biyogaz Üretimi', value: 320, unit: 'm³/gün', target: 500 },
        { name: 'Enerji Verimliliği', value: 78, unit: '%', target: 90 },
      ],
    },
    {
      id: 12,
      title: 'Sorumlu Üretim ve Tüketim',
      description: 'Sürdürülebilir kaynak kullanımı ve atık azaltma',
      score: 7.2,
      trend: 'up',
      recommendations: [
        'Döngüsel ekonomi modellerini uygulayın',
        'Atık geri dönüşüm oranını artırın',
        'Sürdürülebilir ambalajlama kullanın',
      ],
      indicators: [
        { name: 'Atık Geri Dönüşüm Oranı', value: 65, unit: '%', target: 80 },
        { name: 'Kompost Üretimi', value: 890, unit: 'ton/ay', target: 1200 },
        { name: 'Kaynak Verimliliği', value: 71, unit: '%', target: 85 },
      ],
    },
    {
      id: 13,
      title: 'İklim Eylemi',
      description: 'İklim değişikliği ile mücadele ve uyum',
      score: 6.9,
      trend: 'stable',
      recommendations: [
        'Karbon ayak izini azaltmak için organik gübre kullanımını artırın',
        'Ağaçlandırma projelerini genişletin',
        'İklim dirençli tarım tekniklerini yaygınlaştırın',
      ],
      indicators: [
        { name: 'Karbon Emisyon Azaltma', value: 18, unit: '%', target: 30 },
        { name: 'Ağaçlandırma Alanı', value: 1250, unit: 'hektar', target: 2000 },
        { name: 'İklim Direnç Skoru', value: 6.8, unit: '/10', target: 8.0 },
      ],
    },
    {
      id: 15,
      title: 'Karasal Yaşam',
      description: 'Toprak sağlığı, biyolojik çeşitlilik ve ekosistem koruma',
      score: 7.5,
      trend: 'up',
      recommendations: [
        'Biyolojik çeşitliliği koruyan tarım uygulamalarını destekleyin',
        'Toprak sağlığı izleme sistemlerini kurun',
        'Doğal habitatları koruma programlarını genişletin',
      ],
      indicators: [
        { name: 'Organik Toprak Oranı', value: 4.2, unit: '%', target: 6.0 },
        { name: 'Biyolojik Çeşitlilik İndeksi', value: 7.3, unit: '/10', target: 8.5 },
        { name: 'Korunan Alan Oranı', value: 22, unit: '%', target: 30 },
      ],
    },
  ];

  const overallSDGScore = sdgGoals.reduce((sum, goal) => sum + goal.score, 0) / sdgGoals.length;
  const aiRecommendations = [
    'SDG 2 için organik tarım uygulamalarını %30 artırarak gıda güvenliğini iyileştirebilirsiniz.',
    'SDG 6 hedefi için su tasarrufu teknolojilerine yatırım yaparak su verimliliğini %15 artırabilirsiniz.',
    'SDG 12 kapsamında atık geri dönüşüm oranını artırarak döngüsel ekonomi modeline geçiş yapabilirsiniz.',
    'SDG 13 için karbon emisyonlarını azaltmak adına biyogaz üretim tesislerini genişletebilirsiniz.',
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleAnalyzeWithAI = () => {
    setShowAIRecommendations(true);
    // Gerçek uygulamada burada AI servisi çağrılacak
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <ZrtnNavbar />

      <main className="flex-grow">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
                SDG (Sürdürülebilir Kalkınma Hedefleri) Raporu
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Ziraat odası faaliyetlerinin sürdürülebilir kalkınma hedeflerine katkısı
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-base">psychology</span>
                AI ile Analiz Et
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-4 py-2 text-sm font-medium text-content-light transition-colors hover:bg-primary/5 dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Raporu İndir
              </button>
            </div>
          </header>

          {/* Overall SDG Score */}
          <section className="rounded-xl border border-border-light bg-gradient-to-br from-primary/10 to-primary/5 p-8 dark:border-border-dark">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-content-light dark:text-content-dark">
                  Genel SDG Uyum Skoru
                </h2>
                <p className="text-subtle-light dark:text-subtle-dark">
                  {sdgGoals.length} hedef bazında ortalama performans
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className={`text-6xl font-bold ${getScoreColor(overallSDGScore)}`}>
                  {overallSDGScore.toFixed(1)}
                </div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">/ 10.0</p>
              </div>
            </div>
          </section>

          {/* AI Recommendations Banner */}
          {showAIRecommendations && (
            <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 dark:border-primary/50 dark:bg-primary/10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-content-light dark:text-content-dark">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  AI Destekli Öneriler
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAIRecommendations(false)}
                  className="text-subtle-light hover:text-content-light dark:text-subtle-dark dark:hover:text-content-dark"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div className="space-y-3">
                {aiRecommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark"
                  >
                    <p className="text-sm text-content-light dark:text-content-dark">{recommendation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SDG Goals Grid */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sdgGoals.map((goal) => (
              <div
                key={goal.id}
                className={`cursor-pointer rounded-xl border p-6 transition-all hover:shadow-lg ${
                  selectedGoal === goal.id
                    ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                    : 'border-border-light bg-background-light dark:border-border-dark dark:bg-background-dark'
                }`}
                onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">SDG {goal.id}</span>
                      <span
                        className={`material-symbols-outlined text-base ${getTrendColor(goal.trend)}`}
                      >
                        {getTrendIcon(goal.trend)}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-content-light dark:text-content-dark">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">{goal.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-content-light dark:text-content-dark">Uyum Skoru</span>
                    <span className={`text-2xl font-bold ${getScoreColor(goal.score)}`}>{goal.score.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        goal.score >= 8
                          ? 'bg-green-500'
                          : goal.score >= 6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${(goal.score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {selectedGoal === goal.id && (
                  <div className="mt-4 space-y-4 border-t border-border-light pt-4 dark:border-border-dark">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-content-light dark:text-content-dark">
                        Göstergeler
                      </h4>
                      <div className="space-y-2">
                        {goal.indicators.map((indicator, idx) => {
                          const progress = (indicator.value / indicator.target) * 100;
                          return (
                            <div key={idx} className="rounded-lg border border-border-light p-3 dark:border-border-dark">
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="font-medium text-content-light dark:text-content-dark">
                                  {indicator.name}
                                </span>
                                <span className="text-subtle-light dark:text-subtle-dark">
                                  {indicator.value} {indicator.unit}
                                </span>
                              </div>
                              <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                Hedef: {indicator.target} {indicator.unit}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-content-light dark:text-content-dark">
                        Öneriler
                      </h4>
                      <ul className="space-y-2">
                        {goal.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-subtle-light dark:text-subtle-dark">
                            <span className="material-symbols-outlined mt-0.5 text-base text-primary">check_circle</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* SDG Visualizations */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                SDG Skorları Karşılaştırması
              </h2>
              <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
                Tüm SDG hedeflerinin performans karşılaştırması
              </p>
              <SDGBarChart data={sdgGoals} />
            </div>

            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
                SDG Radar Analizi
              </h2>
              <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
                SDG hedeflerinin görsel karşılaştırması
              </p>
              <SDGRadarChart data={sdgGoals} />
            </div>
          </section>

          {/* SDG Trend Chart */}
          <section className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
            <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
              SDG Trend Analizi
            </h2>
            <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
              SDG hedeflerinin skor dağılımı ve hedef çizgisi
            </p>
            <SDGTrendChart data={sdgGoals} />
          </section>

          {/* SDG Cards Grid */}
          <section className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
            <h2 className="mb-4 text-xl font-semibold text-content-light dark:text-content-dark">
              SDG Detay Kartları
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sdgGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg border border-border-light p-4 dark:border-border-dark"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-content-light dark:text-content-dark">
                      SDG {goal.id}
                    </span>
                    <span className={`material-symbols-outlined text-base ${getTrendColor(goal.trend)}`}>
                      {getTrendIcon(goal.trend)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(goal.score)}`}>
                      {goal.score.toFixed(1)}
                    </span>
                    <span className="text-sm text-subtle-light dark:text-subtle-dark">/ 10.0</span>
                  </div>
                  <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">{goal.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Back to Dashboard */}
          <div className="flex justify-center">
            <Link
              to="/admin/ziraat"
              className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-6 py-3 text-sm font-medium text-content-light transition-colors hover:bg-primary/5 dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Dashboard'a Dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SDGReportPage;

