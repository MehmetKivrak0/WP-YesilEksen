import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Anasayfa from './pages/Anasayfa.tsx'
import Giris from './pages/auth/giris.tsx'
import Kayit from './pages/auth/kayit.tsx'
import SifremiUnuttum from './pages/auth/sifremi-unuttum.tsx'
import WasteManagementPage from './pages/admin/ziraat/waste/WasteManagementPage.tsx'
import DashboardPage from './pages/admin/ziraat/dashboard/DashboardPage.tsx'
import ProductApplicationsPage from './pages/admin/ziraat/products/ProductApplicationsPage.tsx'
import FarmApplicationsPage from './pages/admin/ziraat/farms/FarmApplicationsPage.tsx'
import FarmDetailPage from './pages/admin/ziraat/farms/FarmDetailPage.tsx'
import GeneralReportPage from './pages/admin/ziraat/reports/GeneralReportPage.tsx'
import SDGReportPage from './pages/admin/ziraat/reports/SDGReportPage.tsx'
import SanayiIdsahPage from './pages/admin/SanayiDasboard/sanayidsah.tsx'
import FirmaOnaylariPage from './pages/admin/SanayiDasboard/FirmaOnaylariPage.tsx'
import UyeSirketlerPage from './pages/admin/SanayiDasboard/UyeSirketlerPage.tsx'
import SanayiGeneralReportPage from './pages/admin/SanayiDasboard/reports/GeneralReportPage.tsx'
import SanayiSDGReportPage from './pages/admin/SanayiDasboard/reports/SDGReportPage.tsx'
import Firmalar from './pages/firma/firmalar.tsx'
import FirmaDetay from './pages/firma/firma_detay.tsx'
import FirmaSatisGecmisi from './pages/firma/firma_satis_gecmisi.tsx'
import FirmaEkle from './pages/firma/firma_ekle.tsx'
import FirmaPanel from './pages/firma/firma_panel.tsx'
import FirmaProfil from './pages/firma/firma_profil.tsx'
import Ciftlikler from './pages/ciftlik/ciftlikler.tsx'
import CiftlikDetay from './pages/ciftlik/ciftlik_detay.tsx'
import CiftciPanel from './pages/ciftlik/ciftci_panel.tsx'
import Urunlerim from './pages/ciftlik/urunlerim.tsx'
import CiftciSatisGecmisi from './pages/ciftlik/ciftci_satis_gecmisi.tsx'
import CiftlikProfil from './pages/ciftlik/ciftlik_profil.tsx'
import FarmListPage from './pages/admin/ziraat/farms/FarmListPage.tsx'
import Atiklar from './pages/atiklar.tsx'
import AtikEkle from './pages/ciftlik/atik_ekle.tsx'
import UrunDurum from './pages/ciftlik/urun_durum.tsx'
import FirmaBasvuruDurum from './pages/firma/firma_basvuru_durum.tsx'
import IamGroot from './pages/auth/iamgroot.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Anasayfa />} />
        <Route path="/giris" element={<Giris />} />
        <Route path="/kayit" element={<Kayit />} />
        <Route path="/sifremi-unuttum" element={<SifremiUnuttum />} />
        <Route path="/iamgroot" element={<IamGroot />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/admin/atik" element={<WasteManagementPage />} />
        <Route path="/admin/ziraat" element={<DashboardPage />} />
        <Route path="/admin/ziraat/urun-onay" element={<ProductApplicationsPage />} />
        <Route path="/admin/ziraat/ciftlik-onay" element={<FarmApplicationsPage />} />
        <Route path="/admin/ziraat/ciftlik-detay/:farmerId" element={<FarmDetailPage />} />
        <Route path="/admin/ziraat/raporlar/genel" element={<GeneralReportPage />} />
        <Route path="/admin/ziraat/raporlar/sdg" element={<SDGReportPage />} />
        <Route path="/admin/sanayi" element={<SanayiIdsahPage />} />
        <Route path="/admin/sanayi/firma-onaylari" element={<FirmaOnaylariPage />} />
        <Route path="/admin/sanayi/uye-sirketler" element={<UyeSirketlerPage />} />
        <Route path="/admin/sanayi/raporlar/genel" element={<SanayiGeneralReportPage />} />
        <Route path="/admin/sanayi/raporlar/sdg" element={<SanayiSDGReportPage />} />
        <Route path="/ciftlikler" element={<Ciftlikler />} />
        <Route path="/ciftlik/detay/:id" element={<CiftlikDetay />} />
        <Route path="/ciftlik/panel" element={<CiftciPanel />} />
        <Route path="/ciftlik/urunlerim" element={<Urunlerim />} />
        <Route path="/ciftlik/urun-durum" element={<UrunDurum />} />
        <Route path="/ciftlik/satis-gecmisi" element={<CiftciSatisGecmisi />} />
        <Route path="/ciftlik/profil" element={<CiftlikProfil />} />
        <Route path="/admin/ziraat/ciftlik" element={<FarmListPage />} />
        <Route path="/firmalar" element={<Firmalar />} />
        <Route path="/firma/detay/:id" element={<FirmaDetay />} />
        <Route path="/firma/satis-gecmisi" element={<FirmaSatisGecmisi />} />
        <Route path="/firma/ekle" element={<FirmaEkle />} />
        <Route path="/firma/panel" element={<FirmaPanel />} />
        <Route path="/firma/basvuru-durum" element={<FirmaBasvuruDurum />} />
        <Route path="/firma/profil" element={<FirmaProfil />} />
        <Route path="/atiklar" element={<Atiklar />} />
        <Route path="/atiklar/ekle" element={<AtikEkle />} />
      </Routes>
    </Router>
  )
}

export default App
