import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center font-bold uppercase tracking-wider rounded-full border transition-colors select-none';

  const variants = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    filling_fast: 'bg-amber-50 text-amber-700 border-amber-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',

    inactive: 'bg-rose-50 text-rose-700 border-rose-200/80',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200/80',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    almost_full: 'bg-rose-50 text-rose-700 border-rose-200/80',

    brand: 'bg-[#FDE8EC] text-[#F84464] border-[#F84464]/20',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200/80',
    dark: 'bg-[#222432] text-white border-white/10'
  };

  const dotColors = {
    active: 'bg-emerald-500',
    approved: 'bg-emerald-500',
    confirmed: 'bg-emerald-500',
    published: 'bg-emerald-500',
    available: 'bg-emerald-500',

    pending: 'bg-amber-500',
    filling_fast: 'bg-amber-500',
    warning: 'bg-amber-500',

    inactive: 'bg-rose-500',
    suspended: 'bg-rose-500',
    cancelled: 'bg-rose-500',
    rejected: 'bg-rose-500',
    danger: 'bg-rose-500',

    brand: 'bg-[#F84464]',
    info: 'bg-sky-500',
    neutral: 'bg-gray-400',
    dark: 'bg-white'
  };

  const sizes = {
    xs: 'text-[9px] px-2 py-0.5 gap-1',
    sm: 'text-[10px] px-2.5 py-0.5 gap-1.5',
    md: 'text-[11px] px-3 py-1 gap-1.5'
  };

  const selectedVariant = variants[variant] || variants.neutral;
  const selectedDot = dotColors[variant] || dotColors.neutral;

  return (
    <span className={`${base} ${selectedVariant} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${selectedDot} shrink-0`} />}
      {children}
    </span>
  );
}
