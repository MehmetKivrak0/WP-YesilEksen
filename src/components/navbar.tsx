
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2 text-xl font-bold text-content-light dark:text-content-dark" to="/">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
              </svg>
              Yeşil-Eksen
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" to="/">Ana Sayfa</Link>
              <Link className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" to="/ciftlikler">Çiftlikler</Link>
              <Link className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" to="/firmalar">Firmalar</Link>
              <Link className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" to="/atiklar">Ürünler</Link>
              <Link className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" to="/ciftlik/panel">Çiftçi Paneli</Link>
              <Link className="text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" to="/firma/panel">Firma Paneli</Link>
              <div
                className="relative"
                onMouseEnter={() => setIsAdminMenuOpen(true)}
                onMouseLeave={() => setIsAdminMenuOpen(false)}
              >
                <button
                  className="flex items-center gap-1 text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                >
                  Yönetim
                  <span className="material-symbols-outlined text-base leading-none">
                    expand_more
                  </span>
                </button>
                {isAdminMenuOpen && (
                  <div className="absolute left-0 top-full z-20 w-56 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-lg py-2">
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors"
                      to="/admin/atik"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Atık Kataloğu
                    </Link>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors"
                      to="/admin/ziraat"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Ziraat Odası Paneli
                    </Link>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors"
                      to="/admin/ziraat/urun-onay"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Ürün Onayları
                    </Link>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors"
                      to="/admin/ziraat/ciftlik-onay"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Çiftlik Onayları
                    </Link>
                    <Link
                      className="block px-4 py-2 text-sm text-subtle-light dark:text-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors"
                      to="/admin/sanayi"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Sanayi Paneli
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
              <input className="w-full max-w-xs pl-10 pr-4 py-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-subtle-light dark:placeholder:text-subtle-dark" placeholder="Ara..." type="text" />
            </div>
            <button className="p-2 rounded-full bg-white/20 dark:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-subtle-light light:text-subtle-dark">notifications</span>
            </button>
            <Link to="/giris" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors">
              <span className="material-symbols-outlined">login</span>
              Giriş
            </Link>
            <Link to="/kayit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;