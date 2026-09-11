import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  error,
  options = [],
  children,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          className={`w-full appearance-none pl-3.5 pr-9 py-2.5 bg-gray-50 border rounded-xl text-xs text-[#222432] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200'
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3 text-gray-400 pointer-events-none flex items-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
