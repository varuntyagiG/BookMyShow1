import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  footer = null,
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div
          className={`w-screen ${maxWidth} ${
            isDark
              ? 'bg-[#121524]/95 backdrop-blur-2xl text-white border-l border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]'
              : 'bg-white shadow-2xl border-l border-slate-200 text-slate-900'
          } flex flex-col justify-between animate-in slide-in-from-right duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`px-6 py-5 border-b flex items-center justify-between gap-4 sticky top-0 z-10 ${
              isDark
                ? 'bg-[#121524]/95 border-white/[0.08]'
                : 'bg-white border-slate-100'
            }`}
          >
            <div>
              {title && (
                <h3
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Main Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Optional Sticky Footer */}
          {footer && (
            <div
              className={`px-6 py-4 border-t sticky bottom-0 z-10 ${
                isDark
                  ? 'bg-[#0e111d]/90 border-white/[0.08]'
                  : 'bg-slate-50/80 border-slate-100'
              }`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
