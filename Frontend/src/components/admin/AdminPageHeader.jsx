import React from 'react';

export default function AdminPageHeader({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  description,
  children
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F84464]/10 text-[#F84464] text-[10px] font-black uppercase tracking-wider mb-1.5 border border-[#F84464]/20">
            {BadgeIcon && <BadgeIcon className="w-3 h-3 text-[#F84464]" />}
            <span>{badgeText}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#222432]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {children}
        </div>
      )}
    </div>
  );
}
