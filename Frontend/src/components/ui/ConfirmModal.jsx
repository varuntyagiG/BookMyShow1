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
  loading = false
}) {
  const icons = {
    destructive: <AlertCircle className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    primary: <HelpCircle className="w-6 h-6 text-[#F84464]" />
  };

  const bgTints = {
    destructive: 'bg-rose-50 border-rose-200',
    warning: 'bg-amber-50 border-amber-200',
    primary: 'bg-red-50 border-red-200'
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} maxWidth="max-w-md" showClose={!loading}>
      <div className="text-center space-y-4 pt-2">
        <div
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-xs ${
            bgTints[variant] || bgTints.primary
          }`}
        >
          {icons[variant] || icons.primary}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-[#222432] tracking-tight">{title}</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
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
