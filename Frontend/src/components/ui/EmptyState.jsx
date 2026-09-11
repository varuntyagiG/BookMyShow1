import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items matching your criteria at this time.',
  actionLabel,
  onAction,
  actionIcon,
  className = ''
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#EEEEF2] p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#F84464] border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <Icon className="w-7 h-7" />
        </div>
      )}

      <h3 className="text-sm sm:text-base font-black text-[#222432] tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          icon={actionIcon}
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
