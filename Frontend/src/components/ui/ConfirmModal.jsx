import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive', // 'destructive' | 'primary' | 'warning'
  loading = false,
  theme = 'light'
}) {
  const icons = {
    destructive: <AlertCircle className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    primary: <HelpCircle className="w-6 h-6 text-[#F84464]" />
  };

  const isDark = theme === 'dark';

  const bgTints = {
    destructive: isDark ? 'bg-rose-500/20 border-rose-500/30' : 'bg-rose-50 border-rose-200',
    warning: isDark ? 'bg-amber-500/20 border-amber-500/30' : 'bg-amber-50 border-amber-200',
    primary: isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} maxWidth="max-w-md" showClose={!loading} theme={theme}>
      <div className="text-center space-y-4 pt-2">
        <div
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-xs ${
            bgTints[variant] || bgTints.primary
          }`}
        >
          {icons[variant] || icons.primary}
        </div>

        <div className="space-y-1.5">
          <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#222432]'}`}>
            {title}
          </h3>
          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>

        <div className={`flex items-center justify-center gap-3 pt-4 border-t ${isDark ? 'border-white/[0.08]' : 'border-gray-100'}`}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-xs"
          >
            {cancelText}
          </Button>

          <Button
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1 py-2.5 text-xs"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
