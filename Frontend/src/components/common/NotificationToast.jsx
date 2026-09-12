import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Ticket, X, Bell, Film, IndianRupee, Sparkles } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export function NotificationToastContainer() {
  const { activeToast, dismissToast } = useNotification();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const isVendorSale = activeToast.type === 'VENDOR_SALE';

  return (
    <div className="fixed top-5 right-4 sm:right-6 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 sm:p-5 relative overflow-hidden">
        {/* Top Accent Gradient Ribbon */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isVendorSale ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-emerald-400 via-teal-400 to-blue-500'
          }`}
        />

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isVendorSale
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isVendorSale ? <Sparkles size={18} /> : <Ticket size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Real-Time Alert
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {activeToast.title}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close Notification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-3 text-xs text-slate-300 space-y-2">
          {activeToast.movieTitle && (
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
              <Film size={14} className="text-[#F84464] shrink-0" />
              <span className="truncate">{activeToast.movieTitle}</span>
            </div>
          )}

          {activeToast.theatreName && (
            <p className="text-slate-400 text-[11px] truncate">
              {activeToast.theatreName} {activeToast.screenName ? `• ${activeToast.screenName}` : ''}
            </p>
          )}

          {/* Badges / Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeToast.seats && activeToast.seats.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-300 font-mono font-bold text-[11px]">
                Seats: {activeToast.seats.join(', ')}
              </span>
            )}
            {activeToast.showtime && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px]">
                {activeToast.showtime}
              </span>
            )}
            {activeToast.totalAmount && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-0.5">
                <IndianRupee size={11} />
                {activeToast.totalAmount}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {!isVendorSale && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[10px] text-slate-500">M-Ticket ready</span>
            <button
              onClick={() => {
                dismissToast();
                navigate('/my-bookings');
              }}
              className="bg-[#F84464] hover:bg-[#E23454] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <span>View M-Ticket</span>
              <Ticket size={13} />
            </button>
          </div>
        )}

        {/* Animated Timer Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
          <div className="h-full bg-emerald-400 animate-[progress_7s_linear_forwards] origin-left" />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide-out Notification Drawer (triggered from Bell icon in Navbar)
 */
export function NotificationDrawer() {
  const { notifications, isOpenDrawer, setIsOpenDrawer, markAllAsRead, clearAll } = useNotification();
  const navigate = useNavigate();

  if (!isOpenDrawer) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpenDrawer(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F84464] flex items-center justify-center font-bold">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-[11px] text-slate-500">Live ticket & booking updates</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenDrawer(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
            <button
              onClick={markAllAsRead}
              className="hover:text-indigo-600 transition"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="hover:text-rose-600 transition"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notification Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">No Notifications Yet</p>
              <p className="text-[11px] text-slate-400">
                Book a show or movie to receive instant real-time updates and ticket receipts here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl transition ${
                  notif.read ? 'bg-transparent' : 'bg-rose-50/40 border border-rose-100/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <h5 className="text-xs font-bold text-slate-900">{notif.title}</h5>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                {notif.seats && notif.seats.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Seats: {notif.seats.join(', ')}
                    </span>
                    {notif.bookingId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        #{notif.bookingId}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setIsOpenDrawer(false);
              navigate('/my-bookings');
            }}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>Go to My Bookings</span>
            <Ticket size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationToastContainer;
