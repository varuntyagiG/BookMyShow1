import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary:
      'bg-[#F84464] hover:bg-[#E03A58] text-white shadow-sm shadow-[#F84464]/25 border border-transparent',
    secondary:
      'bg-white hover:bg-gray-50 text-[#222432] border border-gray-200 shadow-xs hover:border-gray-300',
    outline:
      'bg-transparent border border-[#F84464] text-[#F84464] hover:bg-[#F84464]/5',
    destructive:
      'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
    ghost:
      'bg-transparent hover:bg-gray-100 text-[#222432] border border-transparent',
    dark:
      'bg-[#222432] hover:bg-[#333545] text-white shadow-sm border border-white/10'
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1.5 gap-1.5 rounded-lg',
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5 rounded-2xl'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
