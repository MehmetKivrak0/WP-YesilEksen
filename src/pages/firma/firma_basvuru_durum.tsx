import { useState } from 'react';
import FrmNavbar from '../../components/frmnavbar';

type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';

type CompanyApplicationDocument = {
  name: string;
  status: DocumentStatus;
  url?: string;
  adminNote?: string;
};

type CompanyApplication = {
  id: string;
  companyName: string;
  sector: string;
  status: 'Beklemede' | 'İncelemede' | 'Onaylandı' | 'Reddedildi' | 'Eksik Evrak';
  submittedAt: string;
  lastUpdate: string;
  adminNotes: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  documents: CompanyApplicationDocument[];
};

// Örnek veri - gerçek uygulamada API'den gelecek
const myApplication: CompanyApplication = {
  id: 'C-2024-001',
  companyName: 'Eko Enerji A.Ş.',
  sector: 'Yenilenebilir Enerji',
  status: 'İncelemede',
  submittedAt: '2024-02-12',
  lastUpdate: '2 saat önce',
  adminNotes: 'Belgeleriniz inceleme aşamasındadır. Faaliyet Belgesi güncel değil, lütfen 2024 yılına ait güncel belgeyi yükleyin.',
  contact: {
    name: 'Ahmet Yılmaz',
    phone: '+90 532 123 45 67',
    email: 'ahmet.yilmaz@ekoenerji.com',
  },
  documents: [
    { name: 'Ticaret Sicil Gazetesi', status: 'Onaylandı', url: '/docs/ticaret-sicil.pdf' },
    { name: 'Vergi Levhası', status: 'Onaylandı', url: '/docs/vergi-levhasi.pdf' },
    { name: 'İmza Sirküleri', status: 'Onaylandı', url: '/docs/imza-sirkuleri.pdf' },
    { name: 'Faaliyet Belgesi', status: 'Reddedildi', adminNote: 'Belge 2023 yılına ait. Lütfen 2024 yılına ait güncel Faaliyet Belgesi yükleyiniz.' },
    { name: 'Oda Kayıt Sicil Sureti', status: 'Beklemede', url: '/docs/oda-kayit.pdf', adminNote: 'Belge inceleme aşamasında.' },
  ],
};

const statusConfig = {
  'Beklemede': { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: 'schedule', bgColor: 'bg-gray-50 dark:bg-gray-900/20', borderColor: 'border-gray-200 dark:border-gray-800' },
  'İncelemede': { color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200', icon: 'manage_search', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
  'Eksik Evrak': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'warning', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800' },
};

const documentStatusConfig = {
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle' },
  'Beklemede': { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: 'pending' },
  'Eksik': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'warning' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel' },
};

function FirmaBasvuruDurum() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [updateMessage, setUpdateMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const config = statusConfig[myApplication.status];

  const approvedDocs = myApplication.documents.filter(d => d.status === 'Onaylandı').length;
  const totalDocs = myApplication.documents.length;
  const progress = (approvedDocs / totalDocs) * 100;

  return (
    <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
      <FrmNavbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Başvuru Durumum</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">
              Sanayi Odası üyelik başvurunuzun durumunu ve admin notlarını takip edin
            </p>
          </div>

          {/* Main Status Card */}
          <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-8 mb-8`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${config.color}`}>
                    <span className="material-symbols-outlined text-2xl">{config.icon}</span>
                    {myApplication.status}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-content-light dark:text-content-dark mb-2">{myApplication.companyName}</h2>
                <p className="text-subtle-light dark:text-subtle-dark mb-4">
                  Başvuru No: {myApplication.id} • Sektör: {myApplication.sector}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-medium">Başvuru Tarihi:</span> {myApplication.submittedAt}</p>
                  <p><span className="font-medium">Son Güncelleme:</span> {myApplication.lastUpdate}</p>
                  <p><span className="font-medium">Yetkili Kişi:</span> {myApplication.contact.name}</p>
                  <p><span className="font-medium">İletişim:</span> {myApplication.contact.phone}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-border-light dark:text-border-dark"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-content-light dark:text-content-dark">{approvedDocs}/{totalDocs}</span>
                    <span className="text-xs text-subtle-light dark:text-subtle-dark">Belge</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined">visibility</span>
                  Detaylı İncele
                </button>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {myApplication.adminNotes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">campaign</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Sanayi Odası Mesajı</h3>
                  <p className="text-blue-800 dark:text-blue-200">{myApplication.adminNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents Overview */}
          <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6">
            <h3 className="text-xl font-semibold text-content-light dark:text-content-dark mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Belgeler ve Durumları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myApplication.documents.map((doc, idx) => {
                const docConfig = documentStatusConfig[doc.status];
                return (
                  <div
                    key={idx}
                    className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="material-symbols-outlined text-2xl text-subtle-light dark:text-subtle-dark">description</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${docConfig.color}`}>
                        <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                        {doc.status}
                      </span>
                    </div>
                    <p className="font-medium text-content-light dark:text-content-dark text-sm mb-2">{doc.name}</p>
                    {doc.url && doc.status === 'Onaylandı' && (
                      <a
                        href={doc.url}
                        download
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        İndir
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">Başvuru Detayları</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Başvuru No: {myApplication.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
              {/* Company Info */}
              <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                <h3 className="font-semibold text-content-light dark:text-content-dark mb-3">Firma Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-medium">Firma Adı:</span> {myApplication.companyName}</p>
                  <p><span className="font-medium">Sektör:</span> {myApplication.sector}</p>
                  <p><span className="font-medium">Yetkili:</span> {myApplication.contact.name}</p>
                  <p><span className="font-medium">Telefon:</span> {myApplication.contact.phone}</p>
                  <p><span className="font-medium">E-posta:</span> {myApplication.contact.email}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Durum:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <span className="material-symbols-outlined text-sm">{config.icon}</span>
                      {myApplication.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Documents Detail */}
              <div>
                <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">Belgeler ve Durumları</h3>
                <div className="space-y-3">
                  {myApplication.documents.map((doc, idx) => {
                    const docConfig = documentStatusConfig[doc.status];
                    return (
                      <div
                        key={idx}
                        className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-content-light dark:text-content-dark mb-1">{doc.name}</p>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${docConfig.color}`}>
                              <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                              {doc.status}
                            </span>
                          </div>
                          {doc.url && doc.status === 'Onaylandı' && (
                            <a
                              href={doc.url}
                              download
                              className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                            >
                              <span className="material-symbols-outlined text-base">download</span>
                              İndir
                            </a>
                          )}
                        </div>
                        {doc.adminNote && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            doc.status === 'Reddedildi' 
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          }`}>
                            <p className={`text-xs font-medium mb-1 ${
                              doc.status === 'Reddedildi' 
                                ? 'text-red-800 dark:text-red-200' 
                                : 'text-blue-800 dark:text-blue-200'
                            }`}>
                              {doc.status === 'Reddedildi' ? 'Reddetme Nedeni:' : 'Sanayi Odası Notu:'}
                            </p>
                            <p className={`text-sm ${
                              doc.status === 'Reddedildi' 
                                ? 'text-red-700 dark:text-red-300' 
                                : 'text-blue-700 dark:text-blue-300'
                            }`}>
                              {doc.adminNote}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              {(myApplication.status === 'Eksik Evrak' || myApplication.status === 'İncelemede') && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border-2 border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
                  >
                    Kapat
                  </button>
                  <button 
                    onClick={() => {
                      setShowUpdateModal(true);
                      setShowDetailModal(false);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Belgeleri Güncelle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Documents Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">Belgeleri Güncelle</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Reddedilen veya eksik belgeleri yükleyin</p>
              </div>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUploadedFiles({});
                  setUpdateMessage('');
                }}
                className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-4">
              {/* Bilgilendirme */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Bilgilendirme</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Sadece reddedilen veya eksik belgelerinizi güncelleyin. Onaylanmış belgeler değiştirilemez.
                    </p>
                  </div>
                </div>
              </div>

              {/* Firma Bilgisi */}
              <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                <h3 className="font-semibold text-content-light dark:text-content-dark mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">business</span>
                  {myApplication.companyName}
                </h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                  Başvuru No: {myApplication.id}
                </p>

                {/* Belge Yükleme Alanları */}
                <div className="space-y-4">
                  {myApplication.documents
                    .filter(doc => doc.status === 'Reddedildi' || doc.status === 'Eksik' || doc.status === 'Beklemede')
                    .map((doc, idx) => {
                      const docKey = doc.name;
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-content-light dark:text-content-dark flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-subtle-light dark:text-subtle-dark">description</span>
                              {doc.name}
                              {doc.status === 'Reddedildi' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
                                  Reddedildi
                                </span>
                              )}
                              {doc.status === 'Beklemede' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200">
                                  İncelemede
                                </span>
                              )}
                            </label>
                            {uploadedFiles[docKey] && (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Seçildi
                              </span>
                            )}
                          </div>
                          {doc.adminNote && (
                            <div className={`text-xs p-2 rounded ${
                              doc.status === 'Reddedildi'
                                ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            }`}>
                              <span className="font-medium">Not: </span>{doc.adminNote}
                            </div>
                          )}
                          <label className="group relative flex flex-col border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary bg-background-light dark:bg-background-dark rounded-lg p-4 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-xl text-primary">upload_file</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-content-light dark:text-content-dark">
                                  {uploadedFiles[docKey]?.name || 'Belge yüklemek için tıklayın'}
                                </p>
                                <p className="text-xs text-subtle-light dark:text-subtle-dark">PDF, JPG, PNG (Max 10MB)</p>
                              </div>
                            </div>
                            <input
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setUploadedFiles(prev => ({ ...prev, [docKey]: file }));
                              }}
                            />
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Mesaj Alanı */}
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Sanayi Odası'na Mesaj (Opsiyonel)
                </label>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Güncelleme hakkında Sanayi Odası'na iletmek istediğiniz bir mesaj varsa yazabilirsiniz..."
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUploadedFiles({});
                  setUpdateMessage('');
                }}
                className="px-4 py-2 border-2 border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  // Gerçek uygulamada API çağrısı yapılacak
                  console.log('Yüklenen dosyalar:', uploadedFiles);
                  console.log('Mesaj:', updateMessage);
                  
                  // Başarı mesajını göster
                  setShowUpdateModal(false);
                  setShowSuccessMessage(true);
                  setUploadedFiles({});
                  setUpdateMessage('');
                  
                  // 3 saniye sonra mesajı gizle
                  setTimeout(() => {
                    setShowSuccessMessage(false);
                  }, 3000);
                }}
                disabled={Object.keys(uploadedFiles).length === 0}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">send</span>
                Gönder ve Sanayi Odası'na Bildir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-4 z-[60] animate-slide-in-right">
          <div className="bg-green-50 dark:bg-green-900/90 border-2 border-green-500 dark:border-green-400 rounded-xl p-4 shadow-xl min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-300">check_circle</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Belgeler Başarıyla Gönderildi!</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Belgeleriniz Sanayi Odası'na iletildi. İnceleme sonucunu bu sayfadan takip edebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="group p-1 rounded-lg border border-green-200 dark:border-green-700 bg-green-100/70 dark:bg-green-900/40 transition-colors hover:border-green-500 hover:bg-green-200 dark:hover:bg-green-800/70"
              >
                <span className="material-symbols-outlined text-green-700 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FirmaBasvuruDurum;

