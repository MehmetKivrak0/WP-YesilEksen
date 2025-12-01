import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SanayiNavbar from "./components/SanayiNavbar";

const MATERIAL_SYMBOLS_STYLES = `
  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
`;

const MATERIAL_SYMBOLS_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";

const MATERIAL_SYMBOLS_FONT_ID = "sanayi-firma-onay-font-link";
const STYLE_ELEMENT_ID = "sanayi-firma-onay-inline-style";

const FirmaOnaylariPage = () => {
  useEffect(() => {
    document.title = "Firma Onayları - Sanayi Odası";

    let fontLink = document.getElementById(
      MATERIAL_SYMBOLS_FONT_ID,
    ) as HTMLLinkElement | null;

    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = MATERIAL_SYMBOLS_FONT_ID;
      fontLink.rel = "stylesheet";
      fontLink.href = MATERIAL_SYMBOLS_FONT_URL;
      document.head.appendChild(fontLink);
    }

    let styleElement = document.getElementById(STYLE_ELEMENT_ID);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ELEMENT_ID;
      styleElement.textContent = MATERIAL_SYMBOLS_STYLES;
      document.head.appendChild(styleElement);
    }

    return () => {
      const activeFontLink = document.getElementById(
        MATERIAL_SYMBOLS_FONT_ID,
      ) as HTMLLinkElement | null;
      if (activeFontLink?.parentElement === document.head) {
        document.head.removeChild(activeFontLink);
      }

      const activeStyleElement = document.getElementById(STYLE_ELEMENT_ID);
      if (activeStyleElement?.parentElement === document.head) {
        document.head.removeChild(activeStyleElement);
      }
    };
  }, []);

  const statusBadgeVariants: Record<string, string> = {
    Beklemede:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    İncelemede:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    "Eksik Evrak":
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    Aktif:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Reddedildi:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const initialPendingCompanies = [
    {
      id: "P-1024",
      name: "Eko Enerji A.Ş.",
      applicant: "Anadolu Tarım Kooperatifi",
      sector: "Yenilenebilir Enerji",
      submittedAt: "2024-02-12",
      timeAgo: "2 saat önce",
      description: "Laboratuvar sonuçları bekleniyor.",
      status: "İncelemede",
      statusClass: "text-blue-600 dark:text-blue-300",
      email: "info@ekoenerji.com",
      phone: "+90 212 555 0101",
      address: "Maslak Mahallesi, Büyükdere Cad. No:123, Sarıyer/İstanbul",
      taxNumber: "1234567890",
      employeeCount: "50-100",
      establishedYear: "2015",
      website: "www.ekoenerji.com",
      documents: ["Ticaret Sicil Gazetesi", "Vergi Levhası", "İmza Sirküleri", "Faaliyet Belgesi", "Oda Kayıt Sicil Sureti"],
    },
    {
      id: "P-1025",
      name: "Anadolu Kimya Ltd.",
      applicant: "Çukurova Ziraat",
      sector: "Kimya",
      submittedAt: "2024-02-11",
      timeAgo: "1 gün önce",
      description: "Evrak kontrolü tamamlandı.",
      status: "Beklemede",
      statusClass: "text-amber-600 dark:text-amber-300",
      email: "iletisim@anadolukimya.com",
      phone: "+90 312 555 0202",
      address: "Kızılay Mahallesi, Atatürk Bulvarı No:45, Çankaya/Ankara",
      taxNumber: "2345678901",
      employeeCount: "100-250",
      establishedYear: "2010",
      website: "www.anadolukimya.com",
      documents: ["Vergi Levhası", "İmza Sirküleri"],
    },
    {
      id: "P-1026",
      name: "BioTarımsal Çözümler",
      applicant: "Bereket Gıda",
      sector: "Biyoteknoloji",
      submittedAt: "2024-02-10",
      timeAgo: "2 gün önce",
      description: "Eksik belgeler gönderildi.",
      status: "Eksik Evrak",
      statusClass: "text-rose-600 dark:text-rose-300",
      email: "destek@biotarim.com",
      phone: "+90 232 555 0303",
      address: "Konak Mahallesi, Cumhuriyet Bulvarı No:78, Konak/İzmir",
      taxNumber: "3456789012",
      employeeCount: "25-50",
      establishedYear: "2018",
      website: "www.biotarim.com",
      documents: ["Vergi Levhası"],
    },
    {
      id: "P-1027",
      name: "Yeşil Teknoloji A.Ş.",
      applicant: "Marmara Tarım",
      sector: "Çevre Teknolojileri",
      submittedAt: "2024-02-09",
      timeAgo: "3 gün önce",
      description: "İnceleme süreci devam ediyor.",
      status: "İncelemede",
      statusClass: "text-blue-600 dark:text-blue-300",
      email: "info@yesiltech.com",
      phone: "+90 216 555 0404",
      address: "Ataşehir Mahallesi, Barbaros Bulvarı No:234, Ataşehir/İstanbul",
      taxNumber: "4567890123",
      employeeCount: "250-500",
      establishedYear: "2012",
      website: "www.yesiltech.com",
      documents: ["Ticaret Sicil Gazetesi", "Vergi Levhası", "İmza Sirküleri", "Oda Kayıt Sicil Sureti"],
    },
    {
      id: "P-1028",
      name: "Sürdürülebilir Enerji Ltd.",
      applicant: "Ege Organik",
      sector: "Enerji",
      submittedAt: "2024-02-08",
      timeAgo: "4 gün önce",
      description: "Onay bekleniyor.",
      status: "Beklemede",
      statusClass: "text-amber-600 dark:text-amber-300",
      email: "iletisim@surenerji.com",
      phone: "+90 242 555 0505",
      address: "Konyaaltı Mahallesi, Atatürk Cad. No:567, Konyaaltı/Antalya",
      taxNumber: "5678901234",
      employeeCount: "10-25",
      establishedYear: "2020",
      website: "www.surenerji.com",
      documents: ["Ticaret Sicil Gazetesi", "Vergi Levhası", "İmza Sirküleri", "Faaliyet Belgesi", "Oda Kayıt Sicil Sureti"],
    },
  ];

  const [pendingCompanies, setPendingCompanies] = useState(initialPendingCompanies);
  const [selectedCompany, setSelectedCompany] = useState<typeof initialPendingCompanies[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [companyToReject, setCompanyToReject] = useState<typeof initialPendingCompanies[0] | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionToShow, setDescriptionToShow] = useState<{ companyName: string; fullMessage: string } | null>(null);
  const [fullRejectionMessages, setFullRejectionMessages] = useState<Map<string, string>>(new Map());
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; title: string; message: string } | null>(null);
  const [activityLogs, setActivityLogs] = useState<Array<{
    id: string;
    companyId: string;
    companyName: string;
    action: string;
    details: string;
    timestamp: string;
    user: string;
    fullMessage?: string;
  }>>([
    {
      id: "L-001",
      companyId: "P-1024",
      companyName: "Eko Enerji A.Ş.",
      action: "Reddetme",
      details: "Başvuru reddedildi",
      timestamp: new Date().toISOString(),
      user: "Admin",
      fullMessage: "Sayın Eko Enerji A.Ş. Yetkilileri,\n\nBaşvuru numaranız: P-1024\n\n12 Kasım 2024 tarihinde yapmış olduğunuz üyelik başvurunuz incelenmiş olup, aşağıdaki nedenlerden dolayı maalesef kabul edilememiştir:\n\n• Eksik belgeler\n\nBaşvurunuzla ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.\n\nSaygılarımızla,\nSanayi Odası Yönetimi",
    },
  ]);
  const [isLogDetailModalOpen, setIsLogDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof activityLogs[0] | null>(null);

  const handleInceleClick = (company: typeof initialPendingCompanies[0]) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const generateRejectionTemplate = (company: typeof initialPendingCompanies[0]) => {
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `Sayın ${company.name} Yetkilileri,

Başvuru numaranız: ${company.id}

${currentDate} tarihinde yapmış olduğunuz üyelik başvurunuz incelenmiş olup, aşağıdaki nedenlerden dolayı maalesef kabul edilememiştir:

• [Reddetme sebebini buraya yazın]

Başvurunuzla ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.

Saygılarımızla,
Sanayi Odası Yönetimi`;
  };

  const getShortDescription = (fullMessage: string, maxLength: number = 100) => {
    if (fullMessage.length <= maxLength) {
      return fullMessage;
    }
    // İlk satırı veya ilk maxLength karakteri al
    const firstLine = fullMessage.split('\n')[0];
    if (firstLine.length <= maxLength) {
      return firstLine;
    }
    return fullMessage.substring(0, maxLength) + "...";
  };

  const handleReddetClick = (company: typeof initialPendingCompanies[0]) => {
    setCompanyToReject(company);
    const template = generateRejectionTemplate(company);
    setRejectReason(template);
    setIsRejectModalOpen(true);
    // Eğer detay modalı açıksa kapat
    if (isModalOpen) {
      closeModal();
    }
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setCompanyToReject(null);
    setRejectReason("");
  };

  const handleDescriptionClick = (company: typeof initialPendingCompanies[0]) => {
    // Eğer reddetme mesajı varsa onu göster, yoksa normal açıklamayı göster
    const fullMessage = fullRejectionMessages.get(company.id) || company.description;
    setDescriptionToShow({
      companyName: company.name,
      fullMessage: fullMessage,
    });
    setIsDescriptionModalOpen(true);
  };

  const closeDescriptionModal = () => {
    setIsDescriptionModalOpen(false);
    setDescriptionToShow(null);
  };

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => prev ? { ...prev, show: false } : null);
      setTimeout(() => setToast(null), 300); // Animasyon için bekle
    }, 5000); // 5 saniye sonra otomatik kapanır
  };

  const closeToast = () => {
    setToast((prev) => prev ? { ...prev, show: false } : null);
    setTimeout(() => setToast(null), 300); // Animasyon için bekle
  };

  const handleLogClick = (log: typeof activityLogs[0]) => {
    setSelectedLog(log);
    setIsLogDetailModalOpen(true);
  };

  const closeLogDetailModal = () => {
    setIsLogDetailModalOpen(false);
    setSelectedLog(null);
  };

  const generateApprovalMessage = (company: typeof initialPendingCompanies[0]) => {
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `Sayın ${company.name} Yetkilileri,

Başvuru numaranız: ${company.id}

${currentDate} tarihinde yapmış olduğunuz üyelik başvurunuz incelenmiş olup, başvurunuz onaylanmıştır.

Üyeliğiniz aktif edilmiştir. Üyelik haklarınızdan yararlanabilirsiniz.

Herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.

Saygılarımızla,
Sanayi Odası Yönetimi`;
  };

  const handleApproveClick = async (company: typeof initialPendingCompanies[0]) => {
    try {
      const approvalMessage = generateApprovalMessage(company);

      // TODO: API çağrısı yapılacak
      // await sendApprovalMessage(company.email, approvalMessage);
      // await updateCompanyStatus(company.id, "Aktif");

      console.log("Onaylama mesajı gönderiliyor:", {
        companyId: company.id,
        companyName: company.name,
        companyEmail: company.email,
        message: approvalMessage,
      });

      // Log kaydı ekle
      const newLog = {
        id: `L-${Date.now()}`,
        companyId: company.id,
        companyName: company.name,
        action: "Onaylama",
        details: "Başvuru onaylandı",
        timestamp: new Date().toISOString(),
        user: "Admin", // TODO: Gerçek kullanıcı bilgisi
        fullMessage: approvalMessage,
      };
      setActivityLogs((prevLogs) => [newLog, ...prevLogs]);

      // Firma bilgilerini güncelle
      setPendingCompanies((prevCompanies) =>
        prevCompanies.map((c) =>
          c.id === company.id
            ? {
                ...c,
                status: "Aktif",
                description: "Başvuru onaylandı ve üyelik aktif edildi.",
                timeAgo: "Az önce",
              }
            : c
        )
      );

      showToast(
        "success",
        "Onaylama Başarılı",
        `${company.name} firmasının başvurusu onaylandı ve firma yetkilisine mesaj gönderildi.`
      );
    } catch (error) {
      console.error("Onaylama sırasında hata oluştu:", error);
      showToast("error", "Hata", "Onaylama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!companyToReject || !rejectReason.trim()) {
      showToast("error", "Eksik Bilgi", "Lütfen reddetme sebebini belirtin.");
      return;
    }

    try {
      // TODO: API çağrısı yapılacak
      // await sendRejectionMessage(companyToReject.id, rejectReason);
      
      // Şimdilik console.log ile gösteriyoruz
      console.log("Reddetme mesajı gönderiliyor:", {
        companyId: companyToReject.id,
        companyName: companyToReject.name,
        companyEmail: companyToReject.email,
        reason: rejectReason,
      });

      // Mesaj gönderme simülasyonu - Toast göster
      showToast(
        "success",
        "Mesaj Gönderildi",
        `Reddetme mesajı ${companyToReject.name} firmasına başarıyla gönderildi.`
      );

      // Açıklama alanını güncelle - kısa versiyonu göster
      const shortDescription = getShortDescription(rejectReason, 100);
      
      // Tam reddetme mesajını Map'e kaydet
      setFullRejectionMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(companyToReject.id, rejectReason);
        return newMap;
      });

      // Log kaydı ekle
      const newLog = {
        id: `L-${Date.now()}`,
        companyId: companyToReject.id,
        companyName: companyToReject.name,
        action: "Reddetme",
        details: `Başvuru reddedildi: ${getShortDescription(rejectReason, 50)}`,
        timestamp: new Date().toISOString(),
        user: "Admin", // TODO: Gerçek kullanıcı bilgisi
        fullMessage: rejectReason,
      };
      setActivityLogs((prevLogs) => [newLog, ...prevLogs]);
      
      // Firma bilgilerini güncelle
      setPendingCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === companyToReject.id
            ? {
                ...company,
                description: shortDescription,
                status: "Reddedildi",
                statusClass: "text-red-600 dark:text-red-300",
                timeAgo: "Az önce",
              }
            : company
        )
      );

      // Eğer seçili firma güncelleniyorsa, onu da güncelle
      if (selectedCompany?.id === companyToReject.id) {
        setSelectedCompany((prev) =>
          prev
            ? {
                ...prev,
                description: shortDescription,
                status: "Reddedildi",
                statusClass: "text-red-600 dark:text-red-300",
                timeAgo: "Az önce",
              }
            : null
        );
      }

      // Başarılı gönderimden sonra modalı kapat
      closeRejectModal();
      
      // TODO: Başvuru durumunu güncelle (API çağrısı)
      // await updateCompanyStatus(companyToReject.id, "Reddedildi");
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
      showToast("error", "Hata", "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-content-light dark:bg-background-dark dark:text-content-dark">
      <SanayiNavbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                to="/admin/sanayi"
                className="mb-4 inline-flex items-center gap-2 text-sm text-subtle-light transition-colors hover:text-primary dark:text-subtle-dark"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Geri Dön
              </Link>
              <h1 className="mb-2 text-4xl font-bold text-content-light dark:text-content-dark">
                Firma Onayları
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Bekleyen firma başvurularını inceleyin, onaylayın veya reddedin
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-full border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Tümünü Onayla
              </button>
              <button className="flex items-center gap-2 rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20">
                <span className="material-symbols-outlined text-base">filter_list</span>
                Filtrele
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Toplam Başvuru</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {pendingCompanies.length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Bekleyen</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {pendingCompanies.filter((c) => c.status === "Beklemede").length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">İncelemede</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {pendingCompanies.filter((c) => c.status === "İncelemede").length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Eksik Evrak</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {pendingCompanies.filter((c) => c.status === "Eksik Evrak").length}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-light/80 bg-background-light/80 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80">
            <table className="w-full table-auto border-separate border-spacing-0">
              <thead className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                  <th className="px-4 py-3 first:rounded-tl-2xl">Firma Adı</th>
                  <th className="px-4 py-3">Başvuru Sahibi</th>
                  <th className="px-4 py-3">Sektör</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Son Güncelleme</th>
                  <th className="px-4 py-3">Açıklama</th>
                  <th className="px-4 py-3 text-right last:rounded-tr-2xl">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-background-light/70 text-sm text-subtle-light dark:bg-background-dark/70 dark:text-subtle-dark">
                {pendingCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="group transition-all hover:bg-primary/5 dark:hover:bg-primary/10"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-content-light dark:text-content-dark">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.applicant}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.sector}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeVariants[company.status] ?? statusBadgeVariants.Aktif}`}
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.submittedAt}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="leading-tight">{company.timeAgo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleDescriptionClick(company)}
                          className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-3 py-2 text-left text-sm leading-tight text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
                          title="Açıklamayı görmek için tıklayın"
                        >
                          {company.description}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInceleClick(company)}
                          className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-3 py-1.5 text-xs font-medium text-[#2E7D32] transition-colors hover:bg-[#C8E6C9]"
                        >
                          İncele
                        </button>
                        <button
                          onClick={() => handleApproveClick(company)}
                          className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20]"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleReddetClick(company)}
                          className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                        >
                          Reddet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aktivite Logları */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Aktivite Logları
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Firma başvuruları üzerinde yapılan tüm işlemlerin geçmişi
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20">
                <span className="material-symbols-outlined text-base">download</span>
                Dışa Aktar
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border-light/80 bg-background-light/80 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full table-auto border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      <th className="px-4 py-3 first:rounded-tl-2xl">Tarih/Saat</th>
                      <th className="px-4 py-3">Kullanıcı</th>
                      <th className="px-4 py-3">İşlem</th>
                      <th className="px-4 py-3">Şirket</th>
                      <th className="px-4 py-3 last:rounded-tr-2xl">Detay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background-light/70 text-sm text-subtle-light dark:bg-background-dark/70 dark:text-subtle-dark">
                    {activityLogs.length > 0 ? (
                      activityLogs.map((log) => {
                        const logDate = new Date(log.timestamp);
                        const formattedDate = logDate.toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        });
                        const formattedTime = logDate.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr
                            key={log.id}
                            onClick={() => handleLogClick(log)}
                            className="group cursor-pointer transition-all hover:bg-primary/5 dark:hover:bg-primary/10"
                          >
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-content-light dark:text-content-dark">
                                  {formattedDate}
                                </span>
                                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                                  {formattedTime}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-primary">
                                  person
                                </span>
                                <span className="text-sm">{log.user}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                  log.action === "Reddetme"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    : log.action === "Onaylama"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {log.action === "Reddetme"
                                    ? "cancel"
                                    : log.action === "Onaylama"
                                    ? "check_circle"
                                    : "edit"}
                                </span>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-content-light dark:text-content-dark">
                                {log.companyName}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">
                                {log.details}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-subtle-light dark:text-subtle-dark">
                          Henüz aktivite logu bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Firma Detay Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-background-light px-6 py-4 dark:border-border-dark dark:bg-background-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  {selectedCompany.name}
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Başvuru No: {selectedCompany.id}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${statusBadgeVariants[selectedCompany.status] ?? statusBadgeVariants.Aktif}`}
                >
                  {selectedCompany.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Sol Kolon */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Genel Bilgiler
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Firma Adı</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Başvuru Sahibi</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.applicant}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Sektör</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.sector}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Kuruluş Yılı</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.establishedYear}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Çalışan Sayısı</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.employeeCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      İletişim Bilgileri
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">E-posta</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Telefon</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Adres</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Web Sitesi</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.website}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Başvuru Bilgileri
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Başvuru Tarihi</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.submittedAt}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Son Güncelleme</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.timeAgo}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Vergi Numarası</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.taxNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">Açıklama</p>
                        <p className="text-sm font-medium text-content-light dark:text-content-dark">
                          {selectedCompany.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                      Yüklenen Belgeler
                    </h3>
                    <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      {/* Zorunlu Belgeler */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">verified</span>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                            Zorunlu Belgeler
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {selectedCompany.documents
                            .filter((doc) => 
                              doc === "Ticaret Sicil Gazetesi" || 
                              doc === "Vergi Levhası" || 
                              doc === "İmza Sirküleri" || 
                              doc === "Faaliyet Belgesi" || 
                              doc === "Oda Kayıt Sicil Sureti"
                            )
                            .map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-3 py-2 dark:border-border-dark dark:bg-background-dark"
                              >
                                <span className="material-symbols-outlined text-base text-primary">description</span>
                                <span className="text-sm text-content-light dark:text-content-dark">{doc}</span>
                                <span className="ml-auto mr-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  Onaylandı
                                </span>
                                <button className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]">
                                  İndir
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Opsiyonel Belgeler */}
                      {selectedCompany.documents.some((doc) => 
                        doc === "Gıda İşletme Kayıt" || 
                        doc === "Gıda İşletme Kayıt / Onay Belgesi" ||
                        doc === "Sanayi Sicil Belgesi" || 
                        doc === "Kapasite Raporu" ||
                        doc === "Sertifikalar"
                      ) && (
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">add_circle</span>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                              Opsiyonel Belgeler
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {selectedCompany.documents
                              .filter((doc) => 
                                doc === "Gıda İşletme Kayıt" || 
                                doc === "Gıda İşletme Kayıt / Onay Belgesi" ||
                                doc === "Sanayi Sicil Belgesi" || 
                                doc === "Kapasite Raporu" ||
                                doc === "Sertifikalar"
                              )
                              .map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 rounded-lg border border-border-light bg-background-light px-3 py-2 dark:border-border-dark dark:bg-background-dark"
                                >
                                  <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">description</span>
                                  <span className="text-sm text-content-light dark:text-content-dark">{doc}</span>
                                  <span className="ml-auto mr-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    Onaylandı
                                  </span>
                                  <button className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]">
                                    İndir
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Eğer hiçbir belge yoksa */}
                      {selectedCompany.documents.length === 0 && (
                        <div className="py-8 text-center">
                          <span className="material-symbols-outlined mb-2 text-4xl text-subtle-light dark:text-subtle-dark">folder_open</span>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">Henüz belge yüklenmemiş</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border-light bg-background-light px-6 py-4 dark:border-border-dark dark:bg-background-dark">
              <button
                onClick={closeModal}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                Kapat
              </button>
              <button
                onClick={() => handleReddetClick(selectedCompany)}
                className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Reddet
              </button>
              <button
                onClick={() => {
                  if (selectedCompany) {
                    handleApproveClick(selectedCompany);
                    closeModal();
                  }
                }}
                className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20]"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reddet Modal */}
      {isRejectModalOpen && companyToReject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeRejectModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Başvuruyu Reddet
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {companyToReject.name} - Başvuru No: {companyToReject.id}
                </p>
              </div>
              <button
                onClick={closeRejectModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="mb-2 text-sm text-content-light dark:text-content-dark">
                  Lütfen başvurunun reddedilme sebebini belirtin. Bu mesaj firma yetkilisine gönderilecektir.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="reject-reason"
                  className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
                >
                  Reddetme Sebebi <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setRejectReason(e.target.value);
                    }
                  }}
                  placeholder="Örn: Eksik belgeler, uygun olmayan sektör, yetersiz bilgiler vb..."
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm text-content-light placeholder:text-subtle-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:placeholder:text-subtle-dark"
                  rows={6}
                  maxLength={500}
                  required
                />
                <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                  {rejectReason.length} / 500 karakter
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                    warning
                  </span>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Dikkat
                    </p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      Bu işlem geri alınamaz. Reddetme mesajı {companyToReject.email} adresine gönderilecektir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeRejectModal}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim()}
                className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reddet ve Mesaj Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[100] w-full max-w-md transform transition-all duration-300 ${
            toast.show
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div
            className={`rounded-xl border shadow-2xl backdrop-blur-sm ${
              toast.type === "success"
                ? "border-emerald-500/50 bg-emerald-50/95 dark:border-emerald-400/50 dark:bg-emerald-900/95"
                : toast.type === "error"
                ? "border-red-500/50 bg-red-50/95 dark:border-red-400/50 dark:bg-red-900/95"
                : "border-blue-500/50 bg-blue-50/95 dark:border-blue-400/50 dark:bg-blue-900/95"
            }`}
          >
            <div className="flex items-start gap-4 p-4">
              <div
                className={`flex-shrink-0 rounded-full p-2 ${
                  toast.type === "success"
                    ? "bg-emerald-100 dark:bg-emerald-800"
                    : toast.type === "error"
                    ? "bg-red-100 dark:bg-red-800"
                    : "bg-blue-100 dark:bg-blue-800"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    toast.type === "success"
                      ? "text-emerald-600 dark:text-emerald-300"
                      : toast.type === "error"
                      ? "text-red-600 dark:text-red-300"
                      : "text-blue-600 dark:text-blue-300"
                  }`}
                >
                  {toast.type === "success"
                    ? "check_circle"
                    : toast.type === "error"
                    ? "error"
                    : "info"}
                </span>
              </div>
              <div className="flex-1">
                <h3
                  className={`mb-1 text-sm font-semibold ${
                    toast.type === "success"
                      ? "text-emerald-900 dark:text-emerald-100"
                      : toast.type === "error"
                      ? "text-red-900 dark:text-red-100"
                      : "text-blue-900 dark:text-blue-100"
                  }`}
                >
                  {toast.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    toast.type === "success"
                      ? "text-emerald-800 dark:text-emerald-200"
                      : toast.type === "error"
                      ? "text-red-800 dark:text-red-200"
                      : "text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                onClick={closeToast}
                className={`flex-shrink-0 rounded-full p-1 transition-colors hover:bg-[#E8F5E9]/50 dark:hover:bg-[#2E7D32]/20 ${
                  toast.type === "success"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : toast.type === "error"
                    ? "text-red-600 dark:text-red-300"
                    : "text-blue-600 dark:text-blue-300"
                }`}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Açıklama Popup Modal */}
      {isDescriptionModalOpen && descriptionToShow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDescriptionModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Açıklama
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {descriptionToShow.companyName}
                </p>
              </div>
              <button
                onClick={closeDescriptionModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-content-light dark:text-content-dark">
                  {descriptionToShow.fullMessage}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeDescriptionModal}
                className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Detay Modal */}
      {isLogDetailModalOpen && selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeLogDetailModal}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Log Detayı
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {selectedLog.companyName} - {selectedLog.action}
                </p>
              </div>
              <button
                onClick={closeLogDetailModal}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Log Bilgileri */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">Tarih/Saat</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {new Date(selectedLog.timestamp).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                      {new Date(selectedLog.timestamp).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">Kullanıcı</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {selectedLog.user}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">İşlem</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        selectedLog.action === "Reddetme"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : selectedLog.action === "Onaylama"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {selectedLog.action === "Reddetme"
                          ? "cancel"
                          : selectedLog.action === "Onaylama"
                          ? "check_circle"
                          : "edit"}
                      </span>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="mb-1 text-xs text-subtle-light dark:text-subtle-dark">Şirket</p>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">
                      {selectedLog.companyName}
                    </p>
                  </div>
                </div>

                {/* Detay Bilgisi */}
                <div>
                  <p className="mb-2 text-sm font-medium text-content-light dark:text-content-dark">
                    Detay
                  </p>
                  <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                    <p className="text-sm text-content-light dark:text-content-dark">
                      {selectedLog.details}
                    </p>
                  </div>
                </div>

                {/* Tam Mesaj */}
                {selectedLog.fullMessage && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-content-light dark:text-content-dark">
                      Firma Yetkilisine Gönderilen Mesaj
                    </p>
                    <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-content-light dark:text-content-dark">
                          {selectedLog.fullMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedLog.fullMessage && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Bu log kaydı için mesaj bilgisi bulunmamaktadır.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeLogDetailModal}
                className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirmaOnaylariPage;

