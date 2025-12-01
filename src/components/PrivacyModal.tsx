interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">Gizlilik Politikası</h2>
          <button onClick={onClose} className="text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="text-sm text-subtle-light dark:text-subtle-dark space-y-4">
          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">1. Toplanan Bilgiler</h3>
          <p>Platformumuz aşağıdaki bilgileri toplar:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Kişisel Bilgiler:</strong> Ad, soyad, e-posta, telefon numarası</li>
            <li><strong>İşletme Bilgileri:</strong> Çiftlik/Şirket adı, adres, vergi numarası</li>
            <li><strong>Belgeler:</strong> Yüklediğiniz resmi belgeler ve dokümanlar</li>
            <li><strong>Kullanım Verileri:</strong> Platform kullanım istatistikleri, IP adresi, tarayıcı bilgisi</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">2. Bilgilerin Kullanımı</h3>
          <p>Topladığımız bilgiler şu amaçlarla kullanılır:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Hesap oluşturma ve kimlik doğrulama</li>
            <li>Platform hizmetlerinin sağlanması</li>
            <li>Kullanıcılar arasında ticari iletişimin kolaylaştırılması</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Platform iyileştirmeleri ve analitik</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">3. Bilgi Paylaşımı</h3>
          <p>Bilgileriniz aşağıdaki durumlarda paylaşılabilir:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>İş Ortakları:</strong> Platformda ticaret yapmak için diğer kullanıcılarla</li>
            <li><strong>Yasal Zorunluluk:</strong> Mahkeme kararı veya resmi talep durumunda</li>
            <li><strong>Hizmet Sağlayıcılar:</strong> Altyapı ve teknik hizmet sağlayıcılar</li>
          </ul>
          <p className="mt-2">Bilgileriniz asla üçüncü şahıslara satılmaz veya pazarlama amaçlı paylaşılmaz.</p>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">4. Veri Güvenliği</h3>
          <p>Bilgilerinizin güvenliği için:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>SSL/TLS şifreleme kullanılır</li>
            <li>Düzenli güvenlik güncellemeleri yapılır</li>
            <li>Erişim kontrolleri ve yetkilendirme sistemleri mevcuttur</li>
            <li>Veri yedekleme ve kurtarma sistemleri bulunur</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">5. Çerezler (Cookies)</h3>
          <p>Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Çerez ayarlarınızı tarayıcınızdan yönetebilirsiniz.</p>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">6. Haklarınız</h3>
          <p>KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Verilerinize erişim talep edebilirsiniz</li>
            <li>Hatalı verilerin düzeltilmesini isteyebilirsiniz</li>
            <li>Verilerin silinmesini talep edebilirsiniz</li>
            <li>Veri işlemeye itiraz edebilirsiniz</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">7. İletişim</h3>
          <p>Gizlilik ile ilgili sorularınız için: <a href="mailto:gizlilik@yesileksen.com" className="text-primary hover:underline">gizlilik@yesileksen.com</a></p>

          <p className="mt-6 text-xs text-subtle-light dark:text-subtle-dark">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;

