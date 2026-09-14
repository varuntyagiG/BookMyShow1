import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
  theme = 'light'
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={`relative w-full ${maxWidth} ${
          isDark
            ? 'bg-[#121524]/95 backdrop-blur-2xl border border-white/10 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]'
            : 'bg-white rounded-2xl shadow-2xl border border-gray-100'
        } rounded-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            className={`px-6 py-5 border-b flex items-center justify-between gap-4 sticky top-0 z-10 ${
              isDark
                ? 'bg-[#121524]/95 backdrop-blur-md border-white/[0.08] text-white'
                : 'border-gray-100 bg-white'
            }`}
          >
            <div>
              {title && (
                <h3
                  className={`text-base font-black tracking-tight flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-[#222432]'
                  }`}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
