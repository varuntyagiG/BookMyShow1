import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change, // alias or supplementary change label
  isPositive,
  trend, // e.g. "+12.4%"
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon,
  badge,
  variant = 'default', // 'default' | 'brand' | 'dark' | 'emerald' | 'indigo' | 'amber'
  loading = false,
  className = ''
}) {
  const isDark = variant === 'dark';
  const isBrand = variant === 'brand';
  const isEmerald = variant === 'emerald';
  const isIndigo = variant === 'indigo';
  const isAmber = variant === 'amber';

  const effectiveTrendDirection = isPositive !== undefined
    ? (isPositive ? 'up' : 'down')
    : trendDirection;

  const cardBg = isBrand
    ? 'bg-gradient-to-br from-[#F84464] via-[#E23454] to-[#C92A46] text-white shadow-[0_8px_24px_-4px_rgba(248,68,100,0.3)] border-transparent'
    : isDark
    ? 'bg-gradient-to-br from-[#222432] via-[#262838] to-[#1c1e2a] text-white border-slate-700/60 shadow-[0_8px_24px_rgba(0,0,0,0.14)]'
    : isEmerald
    ? 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-[0_8px_24px_-4px_rgba(16,185,129,0.28)] border-transparent'
    : isIndigo
    ? 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-[0_8px_24px_-4px_rgba(99,102,241,0.28)] border-transparent'
    : isAmber
    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-[0_8px_24px_-4px_rgba(245,158,11,0.28)] border-transparent'
    : 'bg-white text-slate-900 border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)]';

  const isLightText = isBrand || isDark || isEmerald || isIndigo || isAmber;

  const iconBg = isLightText
    ? 'bg-white/15 text-white border border-white/20 shadow-xs'
    : 'bg-rose-50/80 text-[#F84464] border border-rose-100/90 shadow-2xs';

  const subtitleColor = isLightText ? 'text-white/80' : 'text-slate-500';

  if (loading) {
    return (
      <div className={`rounded-2xl border p-5 sm:p-6 bg-white border-slate-200/80 animate-pulse ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-8 w-32 bg-slate-200 rounded mb-3"></div>
        <div className="h-3 w-40 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group ${cardBg} ${className}`}
    >
      {/* Decorative ambient subtle circle glow */}
      {isLightText && (
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      )}

      {/* Top Row: Title & Icon */}
      <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
        <span
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isLightText ? 'text-white/80' : 'text-slate-500'
          }`}
        >
          {title}
        </span>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300 ${iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Main Value & Trend Badge */}
      <div className="flex items-baseline gap-2.5 mb-2 flex-wrap relative z-10">
        <span className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
              effectiveTrendDirection === 'up'
                ? isLightText
                  ? 'bg-white/20 text-emerald-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                : isLightText
                ? 'bg-black/20 text-rose-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200/70'
            }`}
          >
            {effectiveTrendDirection === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}

        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 ml-auto">
            {badge}
          </span>
        )}
      </div>

      {/* Subtitle or Change information */}
      {(subtitle || change) && (
        <div className={`flex items-center gap-1.5 text-xs font-medium leading-relaxed relative z-10 ${subtitleColor}`}>
          {isPositive !== undefined && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPositive
                  ? isLightText ? 'bg-emerald-300' : 'bg-emerald-500'
                  : isLightText ? 'bg-rose-300' : 'bg-rose-500'
              }`}
            />
          )}
          <span>{subtitle || change}</span>
        </div>
      )}
    </div>
  );
}
