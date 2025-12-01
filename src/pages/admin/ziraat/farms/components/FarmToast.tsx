import { useEffect } from 'react';

type FarmToastProps = {
  toast: { message: string; tone: 'success' | 'error' };
  onClose?: () => void;
};

function FarmToast({ toast, onClose }: FarmToastProps) {
  const isError = toast.tone === 'error';
  const isSuccess = toast.tone === 'success';

  const toneStyles = isError
    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 shadow-red-500/20'
    : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 shadow-emerald-500/20';

  const iconStyles = isError
    ? 'text-red-600 dark:text-red-400'
    : 'text-emerald-600 dark:text-emerald-400';

  // Auto-close after 6 seconds for errors, 4 seconds for success
  useEffect(() => {
    if (toast && onClose) {
      const timeout = setTimeout(() => {
        onClose();
      }, isError ? 6000 : 4000);
      return () => clearTimeout(timeout);
    }
  }, [toast, onClose, isError]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-8 pointer-events-none">
      <div
        className={`pointer-events-auto animate-slide-down flex items-start gap-4 rounded-2xl border-2 ${toneStyles} shadow-2xl max-w-2xl w-full p-5 backdrop-blur-sm`}
        role="alert"
      >
        <div className={`flex-shrink-0 mt-0.5 ${iconStyles}`}>
          <span className="material-symbols-outlined text-3xl">
            {isError ? 'error' : 'check_circle'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold leading-relaxed break-words">
            {toast.message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10 ${
              isError
                ? 'text-red-600 dark:text-red-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FarmToast;
