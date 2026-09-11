import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load data. Please verify your connection or try again.',
  onRetry,
  className = ''
}) {
  return (
    <div
      className={`bg-rose-50/70 border border-rose-200/80 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto text-rose-700 shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-black tracking-tight mb-1 text-rose-900">
        {title}
      </h3>

      <p className="text-xs text-rose-700/80 mb-5 leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
