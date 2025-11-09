import React, { useEffect } from 'react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`relative flex items-start w-full max-w-sm p-4 my-2 rounded-xl shadow-lg animate-fade-in-up border ${
        isSuccess ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-200' : 'bg-rose-900/80 border-rose-500/50 text-rose-200'
      } backdrop-blur-md`}
      role="alert"
    >
      <div className={`flex-shrink-0 mr-3 text-2xl`}>
        {isSuccess ? '🎁' : '⚠️'}
      </div>
      <div className="flex-grow text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 -mr-1 -mt-1 p-1 rounded-full hover:bg-white/10"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};


interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 right-0 z-50 p-4 max-w-md w-full">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;