import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-primary hover:text-primary/80 transition-colors mb-4 inline-block">
            ← Anasayfaya Dön
          </Link>
          <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-subtle-light dark:text-subtle-dark">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-xl p-8 border border-border-light dark:border-border-dark space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              1. Toplanan Bilgiler
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark mb-4">
              Platformumuz aşağıdaki bilgileri toplar:
            </p>
            <ul className="list-disc list-inside text-subtle-light dark:text-subtle-dark space-y-2 ml-4">
              <li>Kişisel bilgiler (ad, soyad, e-posta, telefon)</li>
              <li>İşletme bilgileri (çiftlik adı, şirket bilgileri, vergi numarası)</li>
              <li>Kullanım verileri (giriş zamanları, işlem geçmişi)</li>
              <li>Belgeler (kimlik belgeleri, ticari belgeler)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              2. Bilgilerin Kullanımı
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark mb-4">
              Toplanan bilgiler aşağıdaki amaçlarla kullanılır:
            </p>
            <ul className="list-disc list-inside text-subtle-light dark:text-subtle-dark space-y-2 ml-4">
              <li>Platform hizmetlerinin sağlanması</li>
              <li>Kullanıcı hesaplarının yönetimi</li>
              <li>Çiftlik ve firma doğrulama işlemleri</li>
              <li>Atık ticareti ve kaynak paylaşımı işlemleri</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              3. Bilgilerin Paylaşımı
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark">
              Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. 
              Sadece platform içi işlemler için gerekli bilgiler (örneğin, çiftlik-firma eşleştirmeleri) 
              ilgili taraflarla paylaşılır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              4. Veri Güvenliği
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark">
              Tüm verileriniz SSL şifreleme ile korunur ve güvenli sunucularda saklanır. 
              Düzenli güvenlik denetimleri yapılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              5. Çerezler (Cookies)
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark">
              Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanır. 
              Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              6. Kullanıcı Hakları
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark mb-4">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-subtle-light dark:text-subtle-dark space-y-2 ml-4">
              <li>Kişisel verilerinize erişim</li>
              <li>Kişisel verilerinizin düzeltilmesi</li>
              <li>Kişisel verilerinizin silinmesi</li>
              <li>İtiraz etme hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-4">
              7. İletişim
            </h2>
            <p className="text-subtle-light dark:text-subtle-dark">
              Gizlilik politikası ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

