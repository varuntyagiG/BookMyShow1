import React from 'react';
import { CheckCircle, XCircle, ShieldCheck, User, Eye, EyeOff, Archive } from 'lucide-react';

export default function AdminStatusBadge({ status, type = 'status', size = 'sm' }) {
  const normalized = (status || '').toLowerCase().trim();

  // Badge configurations
  const configs = {
    // Movie publication status
    published: {
      label: 'Live / Published',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500 animate-pulse',
      icon: Eye
    },
    draft: {
      label: 'Draft',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
      icon: EyeOff
    },
    archived: {
      label: 'Archived',
      bg: 'bg-gray-100 text-gray-700 border-gray-200/80',
      dot: 'bg-gray-400',
      icon: Archive
    },

    // Booking status
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      icon: XCircle
    },

    // User Roles
    admin: {
      label: 'Super Admin',
      bg: 'bg-[#F84464]/10 text-[#F84464] border-[#F84464]/30 font-black',
      dot: 'bg-[#F84464]',
      icon: ShieldCheck
    },
    user: {
      label: 'Customer',
      bg: 'bg-gray-100 text-gray-700 border-gray-200',
      dot: 'bg-gray-400',
      icon: User
    }
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    icon: null
  };

  const Icon = config.icon;
  const sizeClasses = size === 'xs'
    ? 'text-[9px] px-2 py-0.5'
    : 'text-[10px] px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border shadow-2xs transition-colors ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
