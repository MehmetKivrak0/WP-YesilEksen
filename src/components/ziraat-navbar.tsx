import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/admin/ziraat', label: 'Genel Bakış', icon: 'dashboard' },
  { to: '/admin/ziraat/ciftlik', label: 'Çiftlik Yönetimi', icon: 'agriculture' },
  { to: '/admin/ziraat/urun-onay', label: 'Ürün Onayları', icon: 'verified' },
  { to: '/admin/ziraat/ciftlik-onay', label: 'Çiftlik Onayları', icon: 'assignment' },
];

function ZiraatNavbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/80 backdrop-blur dark:border-border-dark dark:bg-background-dark/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            className="inline-flex items-center justify-center rounded-full border border-border-light bg-background-light p-2 text-primary shadow-sm hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:hover:bg-primary/10"
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined text-2xl">{isMobileOpen ? 'close' : 'menu'}</span>
          </button>
          <Link className="flex items-center gap-2 text-lg font-semibold text-content-light dark:text-content-dark" to="/admin/ziraat">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </span>
            Ziraat Odası Paneli
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border-light bg-background-light text-subtle-light hover:border-primary hover:text-primary dark:border-border-dark dark:bg-background-dark dark:text-subtle-dark dark:hover:border-primary',
                ].join(' ')
              }
              onClick={handleLinkClick}
            >
              <span className="material-symbols-outlined text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            Ziraat Odası
          </span>
          <Link
            to="/giris"
            className="inline-flex items-center gap-2 rounded-full border border-border-light px-4 py-2 text-sm font-medium text-subtle-light transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-subtle-dark"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Oturumu Kapat
          </Link>
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-t border-border-light bg-background-light px-4 py-4 dark:border-border-dark dark:bg-background-dark md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-border-light bg-background-light text-subtle-light hover:border-primary hover:text-primary dark:border-border-dark dark:bg-background-dark dark:text-subtle-dark',
                  ].join(' ')
                }
                onClick={handleLinkClick}
              >
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border-light bg-background-light px-4 py-3 text-sm dark:border-border-dark dark:bg-background-dark">
            <span className="font-medium text-content-light dark:text-content-dark">Mevcut Oturum</span>
            <Link
              to="/giris"
              className="inline-flex items-center gap-2 rounded-full border border-border-light px-3 py-1 text-xs font-semibold text-subtle-light transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-subtle-dark"
              onClick={handleLinkClick}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Çıkış Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default ZiraatNavbar;

