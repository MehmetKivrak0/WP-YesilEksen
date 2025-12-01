import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

type NavLinkItem = {
  to: string;
  label: string;
  icon: string;
  hash?: string;
};

const navLinks: NavLinkItem[] = [
  { to: "/admin/sanayi", label: "Genel Bakış", icon: "dashboard", hash: "#overview" },
  { to: "/admin/sanayi/firma-onaylari", label: "Firma Onayları", icon: "assignment_turned_in" },
  { to: "/admin/sanayi/uye-sirketler", label: "Şirketler", icon: "groups" },
];

const reportLinks = [
  { to: "/admin/sanayi/raporlar/genel", label: "Genel Raporlar" },
  { to: "/admin/sanayi/raporlar/sdg", label: "SDG Raporu" },
];

const desktopLinkClasses = (isActive: boolean) =>
  [
    "group relative inline-flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-200",
    isActive
      ? "border-[#2E7D32] bg-[#2E7D32] text-white shadow-md"
      : "border-[#E8F5E9] bg-[#E8F5E9] text-[#2E7D32] hover:border-[#2E7D32]",
  ].join(" ");

const mobileLinkClasses = (isActive: boolean) =>
  [
    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-base font-semibold transition-all duration-200",
    isActive
      ? "border-[#2E7D32] bg-[#2E7D32] text-white shadow-md"
      : "border-[#E8F5E9] bg-[#E8F5E9] text-[#2E7D32] hover:border-[#2E7D32]",
  ].join(" ");

const SanayiNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (hash: string) => {
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const handleNavClick = (link: NavLinkItem) => {
    setIsMobileOpen(false);
    // If it's a route-based link (no hash), NavLink will handle navigation
    if (!link.hash) {
      return;
    }
    // For hash-based links, scroll to section
    if (link.hash) {
      scrollToSection(link.hash);
    }
  };

  const isLinkActive = (link: NavLinkItem) => {
    // For route-based links (no hash), check pathname
    if (!link.hash) {
      return location.pathname === link.to;
    }
    // For hash-based links, check both pathname and hash
    if (location.pathname === link.to) {
      return location.hash === link.hash || (location.hash === "" && link.hash === "#overview");
    }
    return false;
  };

  useEffect(() => {
    if (location.hash) {
      scrollToSection(location.hash);
    } else if (location.pathname === "/admin/sanayi" && !location.hash) {
      // Default to overview if on the page without hash
      scrollToSection("#overview");
    }
  }, [location.hash, location.pathname]);

  const closeMobile = () => {
    setIsMobileOpen(false);
    setIsReportsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="mx-auto flex max-w-full items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E8F5E9] text-[#2E7D32] transition hover:border-[#2E7D32] hover:bg-[#E8F5E9] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] md:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Menüyü aç/kapat"
          >
            <span className="material-symbols-outlined text-xl">
              {isMobileOpen ? "close" : "menu"}
            </span>
          </button>

          <Link
            className="flex items-center gap-3 rounded-2xl bg-[#E8F5E9] px-4 py-3"
            to="/admin/sanayi"
            onClick={() => {
              setIsMobileOpen(false);
              scrollToSection("#overview");
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E7D32]">
              <span className="material-symbols-outlined text-2xl text-white">
                eco
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#2E7D32]">Sanayi Odası</span>
              <span className="text-lg font-bold text-[#424242]">Yönetim Paneli</span>
            </div>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link);
            return (
              <NavLink
                key={link.to + (link.hash || "")}
                to={link.hash ? `${link.to}${link.hash}` : link.to}
                className={desktopLinkClasses(isActive)}
                onClick={() => handleNavClick(link)}
              >
                <span className="material-symbols-outlined text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            );
          })}
          <div className="relative">
            <button
              className={[
                "inline-flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-200",
                isReportsDropdownOpen || location.pathname.startsWith("/admin/sanayi/raporlar")
                  ? "border-[#2E7D32] bg-[#2E7D32] text-white shadow-md"
                  : "border-[#E8F5E9] bg-[#E8F5E9] text-[#2E7D32] hover:border-[#2E7D32]",
              ].join(" ")}
              type="button"
              onClick={() => setIsReportsDropdownOpen((prev) => !prev)}
            >
              <span className="material-symbols-outlined text-base">bar_chart</span>
              Raporlar
              <span className="material-symbols-outlined text-base">
                {isReportsDropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {isReportsDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-60 rounded-2xl border border-[#E8F5E9] bg-white p-3 shadow-2xl">
                {reportLinks.map((report) => (
                  <Link
                    key={report.label}
                    to={report.to}
                    className="block rounded-xl px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:bg-[#E8F5E9]"
                    onClick={() => {
                      setIsReportsDropdownOpen(false);
                    }}
                  >
                    {report.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/giris"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#2E7D32] bg-[#2E7D32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B5E20]"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Oturumu Kapat
          </Link>
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <NavLink
                  key={link.to + (link.hash || "")}
                  to={link.hash ? `${link.to}${link.hash}` : link.to}
                  className={mobileLinkClasses(isActive)}
                  onClick={() => handleNavClick(link)}
                >
                  <span className="material-symbols-outlined text-base">{link.icon}</span>
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-3 rounded-2xl border border-[#E8F5E9] p-3">
            <button
              className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold text-[#2E7D32] transition hover:bg-[#E8F5E9]"
              type="button"
              onClick={() => setIsReportsDropdownOpen((prev) => !prev)}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">bar_chart</span>
                Raporlar
              </span>
              <span className="material-symbols-outlined text-base">
                {isReportsDropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {isReportsDropdownOpen && (
              <div className="mt-2 flex flex-col gap-1">
                {reportLinks.map((report) => (
                  <Link
                    key={report.label}
                    to={report.to}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-[#2E7D32] transition hover:bg-[#E8F5E9]"
                    onClick={closeMobile}
                  >
                    {report.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#E8F5E9] px-4 py-3 text-sm">
            <span className="text-[#616161]">Sanayi Odası yönetim panelindesiniz.</span>
            <Link
              to="/giris"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#E8F5E9] px-3 py-1 text-xs font-semibold text-[#2E7D32] transition hover:border-[#2E7D32] hover:bg-[#E8F5E9]"
              onClick={closeMobile}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Çıkış Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default SanayiNavbar;

