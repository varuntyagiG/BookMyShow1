import React from 'react';

/**
 * Enterprise Design System Card Component
 * Features:
 * - Ultra-smooth hover elevation and micro-transforms for interactive cards
 * - Multi-layer subtle shadows and refined borders
 * - Top accent highlight line options (primary, indigo, emerald, amber)
 * - Cohesive slots: CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardBadge
 */
export function Card({
  children,
  className = '',
  hover = false,
  interactive = false,
  accent, // 'primary' | 'indigo' | 'emerald' | 'amber' | 'dark'
  variant = 'default', // 'default' | 'flat' | 'gradient' | 'glass' | 'elevated' | 'dark'
  ...props
}) {
  const isInteractive = interactive || hover;

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]',
    flat: 'bg-white border border-slate-200 shadow-none',
    elevated: 'bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)]',
    gradient: 'bg-gradient-to-br from-white via-white to-rose-50/40 border border-rose-100 shadow-[0_4px_20px_-2px_rgba(248,68,100,0.07)]',
    glass: 'bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
    dark: 'bg-[#222432] text-white border border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
  };

  const hoverStyles = isInteractive
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.09),0_4px_12px_-2px_rgba(248,68,100,0.05)] hover:border-slate-300 transition-all duration-300 ease-out'
    : 'transition-all duration-200';

  const accentBars = {
    primary: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#F84464] before:to-rose-400 before:z-10',
    indigo: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-indigo-600 before:to-violet-500 before:z-10',
    emerald: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-400 before:z-10',
    amber: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-orange-400 before:z-10',
    dark: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#333545] before:to-slate-700 before:z-10',
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden relative ${variantStyles[variant] || variantStyles.default} ${hoverStyles} ${accent ? accentBars[accent] || '' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', border = true, ...props }) {
  return (
    <div
      className={`p-5 sm:p-6 ${border ? 'border-b border-slate-100/90' : ''} flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`p-4 sm:p-5 bg-slate-50/60 border-t border-slate-100/90 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBadge({ children, variant = 'default', className = '', ...props }) {
  const badgeVariants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-rose-50 text-[#F84464] border-rose-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dark: 'bg-[#333545] text-white border-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs ${badgeVariants[variant] || badgeVariants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Card;
