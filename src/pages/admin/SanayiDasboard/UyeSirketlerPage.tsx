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

const MATERIAL_SYMBOLS_FONT_ID = "sanayi-uye-sirket-font-link";
const STYLE_ELEMENT_ID = "sanayi-uye-sirket-inline-style";

const UyeSirketlerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const initialMemberCompanies = [
    {
      id: "C-001",
      name: "Teknoloji A.Ş.",
      sector: "Bilgi Teknolojileri",
      joinedAt: "2024-01-15",
      lastActivity: "1 saat önce",
      description: "Aktif üyelik devam ediyor.",
      status: "Aktif",
      email: "info@teknoloji.com",
    },
    {
      id: "C-002",
      name: "Gıda Sanayi Ltd.",
      sector: "Gıda İşleme",
      joinedAt: "2024-01-10",
      lastActivity: "3 saat önce",
      description: "Üyelik yenileme bekleniyor.",
      status: "Beklemede",
      email: "iletisim@gidasanayi.com",
    },
    {
      id: "C-003",
      name: "Tarım Teknolojileri A.Ş.",
      sector: "Tarım Teknolojisi",
      joinedAt: "2024-01-05",
      lastActivity: "5 saat önce",
      description: "Aktif üyelik devam ediyor.",
      status: "Aktif",
      email: "info@tarimtech.com",
    },
    {
      id: "C-004",
      name: "Eko Enerji A.Ş.",
      sector: "Yenilenebilir Enerji",
      joinedAt: "2023-12-20",
      lastActivity: "1 gün önce",
      description: "Aktif üyelik devam ediyor.",
      status: "Aktif",
      email: "info@ekoenerji.com",
    },
    {
      id: "C-005",
      name: "Sürdürülebilir Çözümler Ltd.",
      sector: "Çevre Teknolojileri",
      joinedAt: "2023-12-15",
      lastActivity: "2 gün önce",
      description: "Aktif üyelik devam ediyor.",
      status: "Aktif",
      email: "info@surdurulebilir.com",
    },
    {
      id: "C-006",
      name: "Organik Tarım Kooperatifi",
      sector: "Tarım",
      joinedAt: "2023-12-10",
      lastActivity: "3 gün önce",
      description: "Üyelik yenileme bekleniyor.",
      status: "Beklemede",
      email: "info@organiktarim.com",
    },
  ];

  const [memberCompanies, setMemberCompanies] = useState(initialMemberCompanies);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<typeof initialMemberCompanies[0] | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<typeof initialMemberCompanies[0] | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"Pasif" | "Silindi">("Pasif");
  const [editedStatus, setEditedStatus] = useState("");
  const [editedSector, setEditedSector] = useState("");
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
      companyId: "C-001",
      companyName: "Teknoloji A.Ş.",
      action: "Güncelleme",
      details: "Durum: Aktif → Beklemede",
      timestamp: new Date().toISOString(),
      user: "Admin",
      fullMessage: "Sayın Teknoloji A.Ş. Yetkilileri,\n\n12 Kasım 2024 tarihinde şirket bilgilerinizde aşağıdaki değişiklikler yapılmıştır:\n\n• Durum: Aktif → Beklemede\n\nBu değişikliklerle ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.\n\nSaygılarımızla,\nSanayi Odası Yönetimi",
    },
    {
      id: "L-002",
      companyId: "C-002",
      companyName: "Gıda Sanayi Ltd.",
      action: "Güncelleme",
      details: "Sektör: Gıda İşleme → Tarım",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: "Admin",
      fullMessage: "Sayın Gıda Sanayi Ltd. Yetkilileri,\n\n12 Kasım 2024 tarihinde şirket bilgilerinizde aşağıdaki değişiklikler yapılmıştır:\n\n• Sektör: Gıda İşleme → Tarım\n\nBu değişikliklerle ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.\n\nSaygılarımızla,\nSanayi Odası Yönetimi",
    },
  ]);
  const [isLogDetailModalOpen, setIsLogDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof activityLogs[0] | null>(null);

  useEffect(() => {
    document.title = "Üye Şirketler - Sanayi Odası";

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
    Pasif:
      "bg-[#E8F5E9] text-[#2E7D32] dark:bg-[#2E7D32]/20 dark:text-[#4CAF50]",
    Silindi:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const sectorOptions = [
    "Bilgi Teknolojileri",
    "Gıda İşleme",
    "Tarım Teknolojisi",
    "Yenilenebilir Enerji",
    "Çevre Teknolojileri",
    "Tarım",
    "Kimya",
    "Biyoteknoloji",
    "Enerji",
    "İnşaat",
    "Otomotiv",
    "Tekstil",
  ];

  const statusOptions = ["Aktif", "Beklemede", "İncelemede", "Eksik Evrak", "Pasif"];

  const filteredCompanies = memberCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (company: typeof initialMemberCompanies[0]) => {
    setSelectedCompany(company);
    setEditedStatus(company.status);
    setEditedSector(company.sector);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCompany(null);
    setEditedStatus("");
    setEditedSector("");
  };

  const handleDeleteClick = (company: typeof initialMemberCompanies[0]) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCompanyToDelete(null);
    setDeleteReason("");
    setDeleteStatus("Pasif");
  };

  const generateDeleteMessage = (companyName: string, reason: string, status: "Pasif" | "Silindi") => {
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const statusText = status === "Silindi" 
      ? "sonlandırılmıştır" 
      : "pasif duruma alınmıştır";
    
    const actionText = status === "Silindi"
      ? "Bu kararla ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz."
      : "Şirketiniz pasif durumda olup, ileride tekrar aktif edilebilir. Bu durumla ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.";

    return `Sayın ${companyName} Yetkilileri,

${currentDate} tarihinde şirketinizin üyelik durumu aşağıdaki nedenlerden dolayı ${statusText}:

• ${reason}

${actionText}

Saygılarımızla,
Sanayi Odası Yönetimi`;
  };

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => prev ? { ...prev, show: false } : null);
      setTimeout(() => setToast(null), 300);
    }, 5000);
  };

  const closeToast = () => {
    setToast((prev) => prev ? { ...prev, show: false } : null);
    setTimeout(() => setToast(null), 300);
  };

  const handleLogClick = (log: typeof activityLogs[0]) => {
    setSelectedLog(log);
    setIsLogDetailModalOpen(true);
  };

  const closeLogDetailModal = () => {
    setIsLogDetailModalOpen(false);
    setSelectedLog(null);
  };

  const generateUpdateMessage = (
    companyName: string,
    oldStatus: string,
    newStatus: string,
    oldSector: string,
    newSector: string
  ) => {
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let changes = [];
    if (oldStatus !== newStatus) {
      changes.push(`Durum: ${oldStatus} → ${newStatus}`);
    }
    if (oldSector !== newSector) {
      changes.push(`Sektör: ${oldSector} → ${newSector}`);
    }

    return `Sayın ${companyName} Yetkilileri,

${currentDate} tarihinde şirket bilgilerinizde aşağıdaki değişiklikler yapılmıştır:

${changes.map((change) => `• ${change}`).join("\n")}

Bu değişikliklerle ilgili herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.

Saygılarımızla,
Sanayi Odası Yönetimi`;
  };

  const handleEditSubmit = async () => {
    if (!selectedCompany) return;

    const hasChanges = selectedCompany.status !== editedStatus || selectedCompany.sector !== editedSector;

    if (!hasChanges) {
      showToast("info", "Bilgi", "Herhangi bir değişiklik yapılmadı.");
      closeEditModal();
      return;
    }

    try {
      // Mesaj oluştur
      const updateMessage = generateUpdateMessage(
        selectedCompany.name,
        selectedCompany.status,
        editedStatus,
        selectedCompany.sector,
        editedSector
      );

      // TODO: API çağrısı yapılacak
      // await sendUpdateMessage(selectedCompany.email, updateMessage);
      // await updateCompany(selectedCompany.id, { status: editedStatus, sector: editedSector });

      console.log("Güncelleme mesajı gönderiliyor:", {
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        companyEmail: selectedCompany.email,
        message: updateMessage,
      });

      // Açıklama mesajını oluştur
      const descriptionMessage = `Durum: ${selectedCompany.status} → ${editedStatus}${selectedCompany.sector !== editedSector ? `, Sektör: ${selectedCompany.sector} → ${editedSector}` : ""} - ${new Date().toLocaleDateString("tr-TR")}`;

      // Log detaylarını oluştur
      const logDetails = [
        selectedCompany.status !== editedStatus ? `Durum: ${selectedCompany.status} → ${editedStatus}` : null,
        selectedCompany.sector !== editedSector ? `Sektör: ${selectedCompany.sector} → ${editedSector}` : null,
      ].filter(Boolean).join(", ");

      // Log kaydı ekle
      const newLog = {
        id: `L-${Date.now()}`,
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        action: "Güncelleme",
        details: logDetails,
        timestamp: new Date().toISOString(),
        user: "Admin", // TODO: Gerçek kullanıcı bilgisi
        fullMessage: updateMessage,
      };
      setActivityLogs((prevLogs) => [newLog, ...prevLogs]);

      // Şirket bilgilerini güncelle
      setMemberCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                status: editedStatus,
                sector: editedSector,
                description: descriptionMessage,
                lastActivity: "Az önce",
              }
            : company
        )
      );

      // Başarı mesajı göster
      showToast(
        "success",
        "Güncelleme Başarılı",
        `${selectedCompany.name} şirketinin bilgileri güncellendi ve firma yetkilisine mesaj gönderildi.`
      );

      // Modalı kapat
      closeEditModal();
    } catch (error) {
      console.error("Güncelleme sırasında hata oluştu:", error);
      showToast("error", "Hata", "Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!companyToDelete || !deleteReason.trim()) {
      showToast("error", "Eksik Bilgi", "Lütfen silme sebebini belirtin.");
      return;
    }

    try {
      // Mesaj oluştur
      const deleteMessage = generateDeleteMessage(companyToDelete.name, deleteReason, deleteStatus);

      // TODO: API çağrısı yapılacak
      // await sendDeleteMessage(companyToDelete.email, deleteMessage);
      // await deleteCompany(companyToDelete.id);

      console.log("Silme mesajı gönderiliyor:", {
        companyId: companyToDelete.id,
        companyName: companyToDelete.name,
        companyEmail: companyToDelete.email,
        message: deleteMessage,
      });

      // Açıklama mesajını oluştur
      const statusText = deleteStatus === "Silindi" ? "silindi" : "pasif yapıldı";
      const descriptionMessage = `Üyelik ${statusText}: ${deleteReason} - ${new Date().toLocaleDateString("tr-TR")}`;

      // Log kaydı ekle
      const newLog = {
        id: `L-${Date.now()}`,
        companyId: companyToDelete.id,
        companyName: companyToDelete.name,
        action: "Silme",
        details: `Durum: ${deleteStatus}, Sebep: ${deleteReason}`,
        timestamp: new Date().toISOString(),
        user: "Admin", // TODO: Gerçek kullanıcı bilgisi
        fullMessage: deleteMessage,
      };
      setActivityLogs((prevLogs) => [newLog, ...prevLogs]);

      // Şirket bilgilerini güncelle - açıklama kısmına mesaj yaz
      setMemberCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === companyToDelete.id
            ? {
                ...company,
                description: descriptionMessage,
                status: deleteStatus,
                lastActivity: "Az önce",
              }
            : company
        )
      );

      // Başarı mesajı göster
      const successMessage = deleteStatus === "Silindi"
        ? `${companyToDelete.name} şirketi silindi ve firma yetkilisine mesaj gönderildi.`
        : `${companyToDelete.name} şirketi pasif duruma alındı ve firma yetkilisine mesaj gönderildi.`;
      
      showToast(
        "success",
        deleteStatus === "Silindi" ? "Silme İşlemi Başarılı" : "Pasife Alma İşlemi Başarılı",
        successMessage
      );

      // Modalı kapat
      closeDeleteModal();
    } catch (error) {
      console.error("Silme işlemi sırasında hata oluştu:", error);
      showToast("error", "Hata", "Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
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
                Üye Şirketler
              </h1>
              <p className="text-lg text-subtle-light dark:text-subtle-dark">
                Kayıtlı üye şirketleri görüntüleyin ve yönetin
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20">
                <span className="material-symbols-outlined text-base">download</span>
                Dışa Aktar
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Toplam Üye</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">
                {memberCompanies.length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Aktif</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {memberCompanies.filter((c) => c.status === "Aktif").length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Beklemede</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {memberCompanies.filter((c) => c.status === "Beklemede").length}
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
              <p className="mb-2 text-sm text-subtle-light dark:text-subtle-dark">Bu Ay Eklenen</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {memberCompanies.filter((c) => new Date(c.joinedAt) >= new Date("2024-01-01")).length}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <input
                className="w-full rounded-full border border-border-light bg-background-light px-12 py-2 text-sm text-content-light placeholder:text-subtle-light focus:border-primary focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:placeholder:text-subtle-dark"
                placeholder="Şirket ara..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                search
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20">
                <span className="material-symbols-outlined text-base">filter_list</span>
              </button>
              <button className="rounded-full border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20">
                <span className="material-symbols-outlined text-base">sort</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-light/80 bg-background-light/80 shadow-sm backdrop-blur-sm dark:border-border-dark/60 dark:bg-background-dark/80">
            <table className="w-full table-auto border-separate border-spacing-0">
              <thead className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-subtle-light dark:text-subtle-dark">
                  <th className="px-4 py-3 first:rounded-tl-2xl">ŞİRKET ADI</th>
                  <th className="px-4 py-3">SEKTÖR</th>
                  <th className="px-4 py-3">ÜYELİK TARİHİ</th>
                  <th className="px-4 py-3">DURUM</th>
                  <th className="px-4 py-3">SON AKTİVİTE</th>
                  <th className="px-4 py-3">AÇIKLAMA</th>
                  <th className="px-4 py-3 text-right last:rounded-tr-2xl">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody className="bg-background-light/70 text-sm text-subtle-light dark:bg-background-dark/70 dark:text-subtle-dark">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company, index) => (
                    <tr
                      key={company.name}
                      className={`group transition-all hover:bg-primary/5 dark:hover:bg-primary/10 ${
                        index % 2 === 0 
                          ? "bg-white dark:bg-background-dark" 
                          : "bg-emerald-50 dark:bg-emerald-900/20"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-content-light dark:text-content-dark">
                        <div className="flex flex-col">
                          <span className="leading-tight">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="leading-tight">{company.sector}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="leading-tight">{company.joinedAt}</span>
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
                          <span className="leading-tight">{company.lastActivity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="leading-tight text-subtle-light dark:text-subtle-dark">{company.description}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(company)}
                            className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20]"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteClick(company)}
                            className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-subtle-light dark:text-subtle-dark">
                      Arama kriterlerinize uygun şirket bulunamadı.
                    </td>
                  </tr>
                )}
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
                  Şirketler üzerinde yapılan tüm işlemlerin geçmişi
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
                                  log.action === "Silme"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {log.action === "Silme" ? "delete" : "edit"}
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

      {/* Düzenleme Modal */}
      {isEditModalOpen && selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Şirket Bilgilerini Düzenle
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {selectedCompany.name}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8F5E9] bg-[#E8F5E9] text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Durum Seçimi */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
                  >
                    Durum <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="status"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sektör Seçimi */}
                <div>
                  <label
                    htmlFor="sector"
                    className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
                  >
                    Sektör <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="sector"
                    value={editedSector}
                    onChange={(e) => setEditedSector(e.target.value)}
                    className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                  >
                    {sectorOptions.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pasife Alma Bölümü */}
                {editedStatus === "Pasif" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                        warning
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Pasife Alma İşlemi
                        </p>
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                          Şirket durumu "Pasif" olarak işaretlenecek. Bu işlem firma yetkilisine bildirilecektir.
                        </p>
                        <div className="mt-3 rounded-lg border border-amber-300 bg-white/50 p-3 dark:border-amber-700 dark:bg-amber-900/30">
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                            Pasife Alma Nedeni:
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Şirket durumu pasif olarak güncellenmiştir. Üyelik hakları askıya alınmıştır.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Değişiklik Özeti */}
                {(selectedCompany.status !== editedStatus || selectedCompany.sector !== editedSector) && (
                  <>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                          info
                        </span>
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Yapılacak Değişiklikler
                          </p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-400">
                            {selectedCompany.status !== editedStatus && (
                              <li>• Durum: {selectedCompany.status} → {editedStatus}</li>
                            )}
                            {selectedCompany.sector !== editedSector && (
                              <li>• Sektör: {selectedCompany.sector} → {editedSector}</li>
                            )}
                          </ul>
                          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                            Bu değişiklikler firma yetkilisine mesaj olarak gönderilecektir.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Firma Yetkilisine Gönderilecek Mesaj */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark">
                        Firma Yetkilisine Gönderilecek Mesaj
                      </label>
                      <div className="rounded-lg border border-border-light bg-background-light/50 p-4 dark:border-border-dark dark:bg-background-dark/50">
                        <div className="max-h-[300px] overflow-y-auto">
                          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-content-light dark:text-content-dark">
                            {generateUpdateMessage(
                              selectedCompany.name,
                              selectedCompany.status,
                              editedStatus,
                              selectedCompany.sector,
                              editedSector
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-subtle-light dark:text-subtle-dark">
                        Bu mesaj {selectedCompany.email} adresine gönderilecektir.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeEditModal}
                className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
              >
                İptal
              </button>
              <button
                onClick={handleEditSubmit}
                className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20]"
              >
                Kaydet ve Mesaj Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Modal */}
      {isDeleteModalOpen && companyToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
              <div>
                <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
                  Üyeliği Sonlandır
                </h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {companyToDelete.name} - {companyToDelete.sector}
                </p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8F5E9] bg-[#E8F5E9] text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="mb-2 text-sm text-content-light dark:text-content-dark">
                  Lütfen üyeliğin sonlandırılma sebebini belirtin. Bu mesaj firma yetkilisine gönderilecektir.
                </p>
              </div>

              {/* Durum Seçimi */}
              <div className="mb-4">
                <label
                  htmlFor="delete-status"
                  className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
                >
                  Durum <span className="text-red-600">*</span>
                </label>
                <select
                  id="delete-status"
                  value={deleteStatus}
                  onChange={(e) => setDeleteStatus(e.target.value as "Pasif" | "Silindi")}
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm text-content-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
                >
                  <option value="Pasif">Pasif</option>
                  <option value="Silindi">Silindi</option>
                </select>
                <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                  {deleteStatus === "Pasif"
                    ? "Şirket pasif duruma alınacak, ileride tekrar aktif edilebilir."
                    : "Şirket silinecek, bu işlem geri alınamaz."}
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="delete-reason"
                  className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
                >
                  {deleteStatus === "Silindi" ? "Silme" : "Pasife Alma"} Sebebi <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setDeleteReason(e.target.value);
                    }
                  }}
                  placeholder="Örn: Üyelik şartlarını karşılamama, ödeme yapılmaması, ihlal durumu vb..."
                  className="w-full rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm text-content-light placeholder:text-subtle-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:placeholder:text-subtle-dark"
                  rows={6}
                  maxLength={500}
                  required
                />
                <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                  {deleteReason.length} / 500 karakter
                </p>
              </div>

              <div className={`rounded-lg border p-4 ${
                deleteStatus === "Silindi"
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
              }`}>
                <div className="flex items-start gap-2">
                  <span className={`material-symbols-outlined ${
                    deleteStatus === "Silindi"
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}>
                    warning
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${
                      deleteStatus === "Silindi"
                        ? "text-red-800 dark:text-red-300"
                        : "text-amber-800 dark:text-amber-300"
                    }`}>
                      Dikkat
                    </p>
                    <p className={`mt-1 text-xs ${
                      deleteStatus === "Silindi"
                        ? "text-red-700 dark:text-red-400"
                        : "text-amber-700 dark:text-amber-400"
                    }`}>
                      {deleteStatus === "Silindi"
                        ? `Bu işlem geri alınamaz. Silme mesajı ${companyToDelete.email} adresine gönderilecek ve açıklama kısmına yazılacaktır.`
                        : `Şirket pasif duruma alınacak. Pasife alma mesajı ${companyToDelete.email} adresine gönderilecek ve açıklama kısmına yazılacaktır.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-4 dark:border-border-dark">
              <button
                onClick={closeDeleteModal}
                className="rounded-lg border border-[#E8F5E9] bg-[#E8F5E9] px-4 py-2 text-sm font-medium text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={!deleteReason.trim()}
                className={`rounded-lg border px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  deleteStatus === "Silindi"
                    ? "border-red-600 bg-red-600 hover:bg-red-700"
                    : "border-amber-600 bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {deleteStatus === "Silindi" ? "Sil ve Mesaj Gönder" : "Pasif Yap ve Mesaj Gönder"}
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8F5E9] bg-[#E8F5E9] text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#E8F5E9]/80 dark:border-[#2E7D32]/30 dark:bg-[#2E7D32]/10 dark:text-[#4CAF50] dark:hover:border-[#4CAF50] dark:hover:bg-[#2E7D32]/20"
              >
                <span className="material-symbols-outlined text-xl">close</span>
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
                        selectedLog.action === "Silme"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {selectedLog.action === "Silme" ? "delete" : "edit"}
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
                className="rounded-lg border border-[#2E7D32] bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20] dark:border-[#4CAF50] dark:bg-[#4CAF50] dark:hover:bg-[#2E7D32]"
              >
                Kapat
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
    </div>
  );
};

export default UyeSirketlerPage;

