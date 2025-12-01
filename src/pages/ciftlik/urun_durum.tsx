import { useState } from 'react';
import CftNavbar from '../../components/cftnavbar';

type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';

type ProductApplication = {
  id: string;
  product: string;
  category: string;
  status: 'Onaylandı' | 'İncelemede' | 'Revizyon' | 'Reddedildi';
  submittedAt: string;
  lastUpdate: string;
  adminNotes: string;
  documents: Array<{
    name: string;
    status: DocumentStatus;
    url?: string;
    adminNote?: string;
  }>;
};

// Örnek veri - gerçek uygulamada API'den gelecek
const myProductApplications: ProductApplication[] = [
  {
    id: 'P-001',
    product: 'Organik Kompost',
    category: 'Toprak İyileştirici',
    status: 'İncelemede',
    submittedAt: '2024-02-12',
    lastUpdate: '2 saat önce',
    adminNotes: 'Analiz raporu bekleniyor. Laboratuvar sonuçlarını sisteme yükleyin.',
    documents: [
      { name: 'Ürün Fotoğrafı', status: 'Onaylandı', url: '/docs/kompost-foto.jpg' },
      { name: 'Menşei Belgesi (ÇKS / İşletme Tescil)', status: 'Onaylandı', url: '/docs/cks-belgesi.pdf' },
      { name: 'Laboratuvar Analiz Raporu', status: 'Beklemede', adminNote: 'Garanti İçerikli ürün - Laboratuvar sonuçları bekleniyor' },
    ],
  },
  {
    id: 'P-002',
    product: 'Saman Balyası',
    category: 'Hayvan Yemi',
    status: 'Onaylandı',
    submittedAt: '2024-02-08',
    lastUpdate: 'Dün',
    adminNotes: 'Tüm belgeler onaylandı. Ürününüz katalogda yayında.',
    documents: [
      { name: 'Ürün Fotoğrafı', status: 'Onaylandı', url: '/docs/saman-foto.jpg' },
      { name: 'Menşei Belgesi (ÇKS / İşletme Tescil)', status: 'Onaylandı', url: '/docs/cks-belgesi.pdf' },
    ],
  },
  {
    id: 'P-003',
    product: 'Hayvansal Gübre',
    category: 'Organik Gübre',
    status: 'Revizyon',
    submittedAt: '2024-02-05',
    lastUpdate: '3 gün önce',
    adminNotes: 'Analiz raporu güncellenmeli.',
    documents: [
      { name: 'Ürün Fotoğrafı', status: 'Onaylandı', url: '/docs/gubre-foto.jpg' },
      { name: 'Menşei Belgesi (ÇKS / İşletme Tescil)', status: 'Onaylandı', url: '/docs/cks-belgesi.pdf' },
      { name: 'Laboratuvar Analiz Raporu', status: 'Reddedildi', adminNote: 'Belgede yer alan içerik değerleri güncel değil. 2024 tarihli analiz sonuçlarını yükleyiniz.' },
    ],
  },
];

const statusConfig = {
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle' },
  'İncelemede': { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: 'hourglass_top' },
  'Revizyon': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'edit_note' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel' },
};

const documentStatusConfig = {
  'Onaylandı': { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: 'check_circle' },
  'Beklemede': { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', icon: 'pending' },
  'Eksik': { color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200', icon: 'warning' },
  'Reddedildi': { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', icon: 'cancel' },
};

function UrunDurum() {
  const [selectedApplication, setSelectedApplication] = useState<ProductApplication | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [updateMessage, setUpdateMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  return (
    <div className="font-display min-h-screen w-full bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark flex flex-col">
      <CftNavbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-2">Ürün Başvuru Durumlarım</h1>
            <p className="text-lg text-subtle-light dark:text-subtle-dark">
              Eklediğiniz ürünlerin onay durumlarını ve admin notlarını takip edin
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Toplam Ürün</p>
              <p className="text-3xl font-bold text-content-light dark:text-content-dark">{myProductApplications.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Onaylanan</p>
              <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                {myProductApplications.filter(p => p.status === 'Onaylandı').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">İncelemede</p>
              <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                {myProductApplications.filter(p => p.status === 'İncelemede').length}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">Revizyon</p>
              <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                {myProductApplications.filter(p => p.status === 'Revizyon').length}
              </p>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {myProductApplications.map((application) => {
              const config = statusConfig[application.status];
              return (
                <div
                  key={application.id}
                  className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">{application.product}</h2>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                          <span className="material-symbols-outlined text-base">{config.icon}</span>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        Kategori: {application.category} • Başvuru: {application.submittedAt} • Son Güncelleme: {application.lastUpdate}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      Detayları Gör
                    </button>
                  </div>

                  {/* Admin Notes */}
                  {application.adminNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Admin Notu:</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{application.adminNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents Quick View */}
                  <div>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark mb-2">Belgeler:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.documents.map((doc, idx) => {
                        const docConfig = documentStatusConfig[doc.status];
                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${docConfig.color}`}
                          >
                            <span className="material-symbols-outlined text-sm">{docConfig.icon}</span>
                            {doc.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">{selectedApplication.product}</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Başvuru No: {selectedApplication.id}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="group p-2 rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
              {/* Status and Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                  <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-2">Başvuru Bilgileri</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Kategori:</span> {selectedApplication.category}</p>
                    <p><span className="font-medium">Başvuru Tarihi:</span> {selectedApplication.submittedAt}</p>
                    <p><span className="font-medium">Son Güncelleme:</span> {selectedApplication.lastUpdate}</p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Durum:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedApplication.status].color}`}>
                        <span className="material-symbols-outlined text-sm">{statusConfig[selectedApplication.status].icon}</span>
                        {selectedApplication.status}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedApplication.adminNotes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">Admin Notu</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{selectedApplication.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Documents Detail */}
              <div>
                <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">Belgeler ve Durumları</h3>
                <div className="space-y-3">
                  {selectedApplication.documents.map((doc, idx) => {
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
                              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                          }`}>
                            <p className={`text-xs font-medium mb-1 ${
                              doc.status === 'Reddedildi' 
                                ? 'text-red-800 dark:text-red-200' 
                                : 'text-amber-800 dark:text-amber-200'
                            }`}>
                              {doc.status === 'Reddedildi' ? 'Reddetme Nedeni:' : 'Admin Notu:'}
                            </p>
                            <p className={`text-sm ${
                              doc.status === 'Reddedildi' 
                                ? 'text-red-700 dark:text-red-300' 
                                : 'text-amber-700 dark:text-amber-300'
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
              {(selectedApplication.status === 'Revizyon' || selectedApplication.status === 'İncelemede') && (
                <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border-2 border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
              >
                Kapat
              </button>
                  <button 
                    onClick={() => {
                      setShowUpdateModal(true);
                      setSelectedApplication(null);
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
              {/* Ürün Seçimi */}
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

              {/* Belge Yükleme Alanları */}
              {myProductApplications
                .filter(app => app.status === 'Revizyon' || app.status === 'İncelemede')
                .map((application) => {
                  const problemDocs = application.documents.filter(
                    doc => doc.status === 'Reddedildi' || doc.status === 'Eksik' || doc.status === 'Beklemede'
                  );

                  if (problemDocs.length === 0) return null;

                  return (
                    <div key={application.id} className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                      <h3 className="font-semibold text-content-light dark:text-content-dark mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                        {application.product}
                      </h3>
                      <div className="space-y-4">
                        {problemDocs.map((doc, idx) => {
                          const docKey = `${application.id}-${doc.name}`;
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
                                </label>
                                {uploadedFiles[docKey] && (
                                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Seçildi
                                  </span>
                                )}
                              </div>
                              {doc.adminNote && (
                                <div className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
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
                  );
                })}

              {/* Mesaj Alanı */}
              <div>
                <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
                  Admin'e Mesaj (Opsiyonel)
                </label>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Güncelleme hakkında admin'e iletmek istediğiniz bir mesaj varsa yazabilirsiniz..."
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
                Gönder ve Admin'e Bildir
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
                  Belgeleriniz admin'e iletildi. İnceleme sonucunu bu sayfadan takip edebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="group p-1.5 rounded-lg border border-green-200 dark:border-green-700 bg-green-100/70 dark:bg-green-900/40 transition-colors hover:border-green-500 hover:bg-green-200 dark:hover:bg-green-800/70"
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

export default UrunDurum;

