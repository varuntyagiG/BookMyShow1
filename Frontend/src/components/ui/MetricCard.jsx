import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // e.g. "+12.4%"
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  badge,
  variant = 'default', // 'default' | 'brand' | 'dark'
  className = ''
}) {
  const isDark = variant === 'dark';
  const isBrand = variant === 'brand';

  const cardBg = isDark
    ? 'bg-[#222432] text-white border-white/5 shadow-md'
    : isBrand
    ? 'bg-linear-to-br from-[#F84464] to-[#E03A58] text-white shadow-md shadow-[#F84464]/20 border-transparent'
    : 'bg-white text-[#222432] border-[#EEEEF2] shadow-xs hover:shadow-sm transition-all';

  const iconBg = isDark
    ? 'bg-white/10 text-[#F84464]'
    : isBrand
    ? 'bg-white/20 text-white'
    : 'bg-red-50 text-[#F84464]';

  const subtitleColor = isDark
    ? 'text-gray-400'
    : isBrand
    ? 'text-white/80'
    : 'text-gray-500';

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${cardBg} ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`text-[11px] font-black uppercase tracking-wider ${isBrand || isDark ? 'text-white/70' : 'text-gray-500'}`}>
          {title}
        </span>

        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-black tracking-tight">{value}</span>

        {trend && (
          <span
            className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              trendDirection === 'up'
                ? isBrand || isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                : isBrand || isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trendDirection === 'up' ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {trend}
          </span>
        )}

        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10 ml-auto">
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>}
    </div>
  );
}
