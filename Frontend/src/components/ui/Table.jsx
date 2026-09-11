import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Table({ children, className = '', ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#EEEEF2] bg-white shadow-xs">
      <table className={`w-full text-left border-collapse text-xs ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead
      className={`bg-gray-50/80 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-500 select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th className={`px-4 sm:px-6 py-3.5 font-bold ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={`divide-y divide-gray-100 font-medium text-[#222432] ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', hover = true, ...props }) {
  return (
    <tr
      className={`transition-colors ${
        hover ? 'hover:bg-gray-50/75' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 sm:px-6 py-4 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TablePagination({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-500 ${className}`}
    >
      <div className="font-semibold">
        Showing Page <span className="font-black text-[#222432]">{page}</span> of{' '}
        <span className="font-black text-[#222432]">{totalPages || 1}</span>{' '}
        {totalItems > 0 && <span>({totalItems} total records)</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-bold text-[#222432]">{page}</span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Table;
