import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function CinemaPartnerToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type: 'info', duration: 4000, ...toast };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className="pointer-events-auto p-4 rounded-2xl shadow-[0_12px_30px_-6px_rgba(0,0,0,0.15)] bg-white border border-[#EEEEF2] flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 text-[#222432]"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#4ABD5D]" />}
                {isError && <XCircle className="w-5 h-5 text-[#F84464]" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-500" />}
              </div>
              <div className="flex-1 min-w-0">
                {t.title && <h4 className="text-xs font-bold leading-tight text-gray-900">{t.title}</h4>}
                {t.message && <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-700 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useCinemaToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useCinemaToast must be used within a CinemaPartnerToastProvider');
  }
  return context.toast;
}
