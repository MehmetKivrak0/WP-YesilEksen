import { useToast } from '../context/ToastContext';
import Toast from './Toast';
import type { ToastType } from './Toast';

/**
 * ToastContainer - Birden fazla toast'ı yöneten ve gösteren container bileşeni
 * ToastContext'ten toast listesini alır ve her birini gösterir
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-in"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type as ToastType}
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;

