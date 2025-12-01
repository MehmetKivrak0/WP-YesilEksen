import { useEffect, useState } from 'react';
import { ziraatService } from '../../../../../../services/ziraatService';

type FarmLogModalProps = {
  applicationId?: string; // Opsiyonel: verilmezse tüm logları gösterir
  onClose: () => void;
};

type LogEntry = {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  user_name?: string;
  old_status?: string;
  new_status?: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  farm_name?: string;
};

function FarmLogModal({ applicationId, onClose }: FarmLogModalProps) {
  const [logs, setLogs] = useState<{
    activities: LogEntry[];
    detailedActivities: LogEntry[];
    changeLogs: LogEntry[];
  } | null>(null);
  const [farmName, setFarmName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [applicationId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = applicationId 
        ? await ziraatService.getFarmLogs(applicationId)
        : await ziraatService.getAllFarmLogs();
      if (response.success) {
        setLogs(response.logs);
        if ('farmName' in response && response.farmName) {
          setFarmName(response.farmName);
        }
      } else {
        setError('Loglar yüklenemedi');
      }
    } catch (err) {
      console.error('Log yükleme hatası:', err);
      setError('Loglar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const translateStatus = (status: string | undefined): string => {
    if (!status) return '';
    const statusMap: Record<string, string> = {
      'ilk_inceleme': 'İlk İnceleme',
      'onaylandi': 'Onaylandı',
      'reddedildi': 'Reddedildi',
      'belge_eksik': 'Belge Eksik',
      'evrak_bekliyor': 'Reddedildi',
      'beklemede': 'Beklemede',
      'aktif': 'Aktif',
      'pasif': 'Pasif',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const formatLogMessage = (log: LogEntry & { source?: string }) => {
    // Her log entry'sinin kendi farm_name'i varsa onu kullan, yoksa genel farmName'i kullan
    const farmNameText = log.farm_name || farmName || 'Çiftlik';
    const dateText = formatDate(log.timestamp);
    
    if (log.type === 'onay') {
      return `${farmNameText} çiftliği ${dateText} tarihinde onaylandı`;
    } else if (log.type === 'red') {
      return `${farmNameText} çiftliği ${dateText} tarihinde reddedildi`;
    } else if (log.old_status && log.new_status) {
      const oldStatusTr = translateStatus(log.old_status);
      const newStatusTr = translateStatus(log.new_status);
      return `${farmNameText} çiftliğinin durumu ${dateText} tarihinde "${oldStatusTr}" durumundan "${newStatusTr}" durumuna değiştirildi`;
    } else if (log.field_name && log.old_value !== undefined && log.new_value !== undefined) {
      const oldValueTr = log.field_name === 'durum' ? translateStatus(log.old_value) : log.old_value;
      const newValueTr = log.field_name === 'durum' ? translateStatus(log.new_value) : log.new_value;
      return `${farmNameText} çiftliğinin ${log.field_name} alanı ${dateText} tarihinde "${oldValueTr || 'Boş'}" değerinden "${newValueTr || 'Boş'}" değerine değiştirildi`;
    } else {
      return `${farmNameText} çiftliği ile ilgili işlem ${dateText} tarihinde gerçekleştirildi`;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'onay':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'red':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'durum_degisikligi':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  // Tüm logları birleştir, duplicate'leri kaldır ve tarihe göre sırala
  // Öncelik: detayli_aktiviteler > changeLogs > activities (daha detaylı olan öncelikli)
  const allLogsMap = new Map<string, LogEntry & { source?: string }>();
  
  // Önce activities ekle
  (logs?.activities || []).forEach((log) => {
    const key = `${log.type}_${log.timestamp}_${log.id}`;
    if (!allLogsMap.has(key)) {
      allLogsMap.set(key, { ...log, source: 'activity' });
    }
  });
  
  // Sonra changeLogs ekle (activities'i override edebilir)
  (logs?.changeLogs || []).forEach((log) => {
    const key = `${log.type || 'change'}_${log.timestamp}_${log.id}`;
    allLogsMap.set(key, { ...log, source: 'change' });
  });
  
  // En son detayli_aktiviteler ekle (en detaylı, diğerlerini override eder)
  (logs?.detailedActivities || []).forEach((log) => {
    // Aynı timestamp ve type'a sahip log'u bul ve override et
    const existingKey = Array.from(allLogsMap.keys()).find(k => {
      const existingLog = allLogsMap.get(k);
      if (!existingLog) return false;
      // Aynı timestamp ve type'a sahip mi kontrol et
      const timeDiff = Math.abs(new Date(existingLog.timestamp).getTime() - new Date(log.timestamp).getTime());
      return existingLog.type === log.type && timeDiff < 1000; // 1 saniye içinde
    });
    
    if (existingKey) {
      // Mevcut log'u detaylı olanla değiştir
      allLogsMap.set(existingKey, { ...log, source: 'detailed' });
    } else {
      // Yeni log ekle
      const key = `${log.type}_${log.timestamp}_${log.id}`;
      allLogsMap.set(key, { ...log, source: 'detailed' });
    }
  });
  
  const allLogs = Array.from(allLogsMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border-light bg-background-light shadow-2xl dark:border-border-dark dark:bg-background-dark">
        <button
          className="group absolute right-4 top-4 flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={onClose}
          aria-label="Kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark">İşlem Geçmişi</h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {applicationId 
                ? 'Çiftlik başvurusu ile ilgili tüm işlem kayıtları'
                : 'Tüm çiftlik işlem kayıtları'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-subtle-light dark:text-subtle-dark">Yükleniyor...</div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          ) : allLogs.length === 0 ? (
            <div className="rounded-lg border border-border-light bg-background-light/60 p-8 text-center dark:border-border-dark dark:bg-background-dark/60">
              <span className="material-symbols-outlined mb-4 text-6xl text-subtle-light dark:text-subtle-dark">
                history
              </span>
              <p className="text-subtle-light dark:text-subtle-dark">Henüz işlem kaydı bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border-light bg-background-light/60 p-4 dark:border-border-dark dark:bg-background-dark/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(log.type)}`}>
                          {log.type === 'onay' ? 'Onaylandı' : log.type === 'red' ? 'Reddedildi' : log.type || 'İşlem'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-content-light dark:text-content-dark">
                        {formatLogMessage(log)}
                      </p>

                      {log.description && log.description.trim() && (
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{log.description}</p>
                      )}


                      {log.reason && (
                        <div className="mt-2 rounded-lg border border-border-light bg-background-light p-2 dark:border-border-dark dark:bg-background-dark">
                          <p className="text-xs font-semibold text-subtle-light dark:text-subtle-dark">Sebep:</p>
                          <p className="text-sm text-content-light dark:text-content-dark">{log.reason}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-subtle-light dark:text-subtle-dark">
                        {log.user_name && (
                          <span>
                            <span className="material-symbols-outlined mr-1 align-middle text-sm">person</span>
                            {log.user_name}
                          </span>
                        )}
                        <span>
                          <span className="material-symbols-outlined mr-1 align-middle text-sm">schedule</span>
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              className="rounded-lg border border-border-light bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-border-dark dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmLogModal;

