interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background-light dark:bg-background-dark rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">Kullanım Şartları</h2>
          <button onClick={onClose} className="text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="text-sm text-subtle-light dark:text-subtle-dark space-y-4">
          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">1. Hizmet Şartları</h3>
          <p>Yeşil-Eksen platformunu kullanarak, aşağıdaki şartları kabul etmiş sayılırsınız:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Platform üzerinde paylaştığınız bilgilerin doğruluğundan siz sorumlusunuz.</li>
            <li>Başka kullanıcıların haklarını ihlal edecek içerik paylaşamazsınız.</li>
            <li>Ticari işlemlerinizde dürüst ve şeffaf olmayı taahhüt edersiniz.</li>
            <li>Platform kurallarına uygun davranmayı kabul edersiniz.</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">2. Kullanıcı Sorumlulukları</h3>
          <p>Kullanıcılar olarak:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Hesap güvenliğinizden siz sorumlusunuz.</li>
            <li>Yasa dışı faaliyetlerde bulunamazsınız.</li>
            <li>Platform üzerinden yapılan işlemlerin sorumluluğu size aittir.</li>
            <li>Tüm belgelerin güncel ve geçerli olmasını sağlamalısınız.</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">3. Hizmet Kullanımı</h3>
          <p>Platform hizmetleri:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>7/24 erişim sağlamayı hedefler ancak garanti verilmez.</li>
            <li>Önceden haber vermeksizin değiştirilebilir veya sonlandırılabilir.</li>
            <li>Kullanım sırasında oluşabilecek kayıplardan platform sorumlu değildir.</li>
          </ul>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">4. Fikri Mülkiyet</h3>
          <p>Platform üzerindeki tüm içerik, tasarım ve kodlar Yeşil-Eksen'e aittir. İzinsiz kullanılamaz, kopyalanamaz veya dağıtılamaz.</p>

          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">5. Değişiklikler</h3>
          <p>Bu kullanım şartları herhangi bir zamanda güncellenebilir. Değişiklikler platform üzerinde yayınlandığı anda yürürlüğe girer.</p>

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

export default TermsModal;

