import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 select-none ${className}`}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#F84464] flex items-center justify-center shrink-0 shadow-2xs border border-red-100">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight">
            {title}
          </h1>

          {badge && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20">
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
}
