import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  rightElement,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          className={`w-full py-2.5 bg-gray-50 border rounded-xl text-xs text-[#222432] placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200'
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">{rightElement}</div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
