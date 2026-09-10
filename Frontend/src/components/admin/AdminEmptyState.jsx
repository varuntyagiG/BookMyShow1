import React from 'react';
import { Plus } from 'lucide-react';

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon = Plus
}) {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
      {Icon && (
        <div className="w-16 h-16 rounded-3xl bg-gray-100/80 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
          <Icon className="w-8 h-8 text-gray-400 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#222432]">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/20 cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
