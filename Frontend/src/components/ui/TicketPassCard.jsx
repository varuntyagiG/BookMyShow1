import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Armchair,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TicketPassCard({
  booking,
  onViewTicket,
  onCancel
}) {
  if (!booking) return null;

  const isCancelled = booking.status === 'cancelled';
  const isValidated = Boolean(booking.ticketValidated);
  const seatCount = Array.isArray(booking.seats) ? booking.seats.length : (booking.seats ? 1 : 1);
  const seatsDisplay = Array.isArray(booking.seats) ? booking.seats.join(', ') : (booking.seats || 'Assigned');
  const formattedDate = booking.showDate || (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : 'Upcoming');
  const showtime = booking.showtime || '10:00 AM';
  const theatreName = booking.theatreName || (booking.cinema ? booking.cinema.name : 'Cinema Multiplex');
  const movieTitle = booking.movieTitle || 'Movie Experience';
  const bookingId = booking.bookingId || `BMT-${(booking._id || '').slice(-6).toUpperCase()}`;
  const totalAmount = booking.totalPrice || booking.amount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between group ${
        isCancelled
          ? 'border-gray-200 bg-gray-50/50 opacity-80'
          : 'border-slate-200/90 hover:border-red-300'
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full ${
          isCancelled
            ? 'bg-gray-300'
            : isValidated
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-[#F84464] to-rose-600'
        }`}
      />

      {/* Main Pass Header & Information */}
      <div className="p-5">
        {/* Row 1: ID, Status, and Price */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded tracking-wider border border-slate-200/70">
              {bookingId}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                isCancelled
                  ? 'bg-gray-200 text-gray-700'
                  : isValidated
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isCancelled ? (
                <>
                  <AlertCircle className="w-3 h-3 text-gray-500" />
                  <span>Cancelled</span>
                </>
              ) : isValidated ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Checked In</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Confirmed</span>
                </>
              )}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
              Total
            </span>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              ₹{Number(totalAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Movie Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-[#F84464] transition-colors">
          {movieTitle}
        </h3>

        {/* Venue Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{theatreName}</span>
        </div>

        {/* Showtime & Schedule Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#F84464]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Date</span>
              <span className="font-bold text-slate-800 text-[11px] truncate block">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#F84464]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Time</span>
              <span className="font-bold text-slate-800 text-[11px] truncate block">{showtime}</span>
            </div>
          </div>
        </div>

        {/* Seats Pill Bar */}
        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <Armchair className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">
              {seatCount} {seatCount === 1 ? 'Seat' : 'Seats'}:
            </span>
            <span className="font-mono font-bold text-[#F84464] text-xs">
              {seatsDisplay}
            </span>
          </div>

          {booking.includeSnacks && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              <span>F&B Combo</span>
            </span>
          )}
        </div>
      </div>

      {/* Perforated Stub Divider with Side Half-Circles */}
      <div className="relative flex items-center justify-between w-full h-4 bg-transparent overflow-hidden my-1">
        {/* Left Cutout Circle */}
        <div className="w-4 h-4 rounded-full bg-[#F5F5FA] -ml-2 border-r border-slate-200/80 shadow-inner shrink-0" />

        {/* Dashed Line */}
        <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />

        {/* Right Cutout Circle */}
        <div className="w-4 h-4 rounded-full bg-[#F5F5FA] -mr-2 border-l border-slate-200/80 shadow-inner shrink-0" />
      </div>

      {/* Ticket Stub / Actions Section */}
      <div className="p-4 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Barcode Simulated Graphics */}
        <div
          onClick={() => onViewTicket?.(booking)}
          className="flex items-center gap-3 cursor-pointer group/barcode"
          title="Click to view full digital pass"
        >
          <div className="flex items-center gap-0.5 h-7 px-2 py-1 bg-white rounded border border-slate-200 shadow-2xs">
            {/* Monospace Barcode pattern bars */}
            <div className="w-0.5 h-full bg-slate-900" />
            <div className="w-1 h-full bg-slate-900" />
            <div className="w-0.5 h-full bg-transparent" />
            <div className="w-1.5 h-full bg-slate-900" />
            <div className="w-0.5 h-full bg-slate-900" />
            <div className="w-1 h-full bg-transparent" />
            <div className="w-1 h-full bg-slate-900" />
            <div className="w-0.5 h-full bg-slate-900" />
            <div className="w-1.5 h-full bg-slate-900" />
            <div className="w-0.5 h-full bg-transparent" />
            <div className="w-1 h-full bg-slate-900" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Gate Pass
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-700 tracking-wider">
              {bookingId}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          {!isCancelled && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer px-2.5 py-1.5"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewTicket?.(booking)}
            className="px-3.5 py-1.5 bg-[#222432] hover:bg-[#161822] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-[#F84464]" />
            <span>M-Ticket</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
