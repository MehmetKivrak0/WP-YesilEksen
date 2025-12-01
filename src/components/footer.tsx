import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded"></div>
              <span className="text-lg font-bold">Yeşil-Eksen</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Sürdürülebilir tarım ve atık yönetimi için tarımı sanayi ile buluşturuyor.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/ciftlikler" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Çiftlik Yönetimi</Link>
              <Link to="/atiklar" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Atık Yönetimi</Link>
              <Link to="/firmalar" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Firma Portalı</Link>
              <Link to="/atiklar" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Yönetici Paneli</Link>
            </div>
          </div>

          {/* Kaynaklar */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Kaynaklar</h4>
            <div className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Dokümantasyon</a>
              <a href="#" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">API Referansı</a>
              <a href="#" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Destek</a>
              <a href="#" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200">Topluluk</a>
            </div>
          </div>

          {/* İletişim */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">İletişim</h4>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-300">info@agriconnect.com</span>
              <span className="text-sm text-gray-300">+90 212 123 45 67</span>
              <span className="text-sm text-gray-300">İstanbul, Türkiye</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">&copy; 2024 AgriConnect. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
