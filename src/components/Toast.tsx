
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type = 'success', isVisible, onClose, duration }: ToastProps) {
  // Not: Otomatik kapanma Context tarafından yönetiliyor, burada sadece görsel bileşeniz
  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400'
  };

  const icon = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  return (
    <div className={`${bgColor[type]} border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px] transition-all duration-300`}>
      <span className="material-symbols-outlined">{icon[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-subtle-light dark:text-subtle-dark hover:text-content-light dark:hover:text-content-dark transition-colors p-1 rounded hover:bg-background-light dark:hover:bg-background-dark/50"
        aria-label="Kapat"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

export default Toast;

