import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/api';
import { useAdminToast } from '../../components/admin/AdminToastContext';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import {
  Ticket,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  IndianRupee
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { showToast } = useAdminToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    onConfirm: null,
    loading: false
  });

  const loadBookings = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');
    try {
      const res = await adminApi.getBookings({
        search: searchTerm,
        status: statusFilter,
        limit: 200
      });
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
      showToast('error', err.message || 'Failed to load bookings.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(true);
    setCurrentPage(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBookings(false);
    setCurrentPage(1);
  };

  const handleStatusChangePrompt = (booking, newStatus) => {
    const isCancel = newStatus === 'cancelled';
    setConfirmModal({
      isOpen: true,
      title: isCancel ? 'Cancel & Refund Booking?' : 'Re-confirm Booking?',
      message: isCancel
        ? `Are you sure you want to cancel booking "${booking.bookingId}" for ${booking.user?.name || 'Customer'}? The seats will be released and payment marked refunded.`
        : `Are you sure you want to re-confirm booking "${booking.bookingId}"?`,
      confirmText: isCancel ? 'Yes, Cancel & Refund' : 'Yes, Confirm',
      isDestructive: isCancel,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        setActionLoadingId(booking.bookingId);
        try {
          const res = await adminApi.updateBookingStatus(booking.bookingId, newStatus);
          if (res.success) {
            // Local state update — NO full table wipe / refetch
            setBookings(prev =>
              prev.map(b => (b.bookingId === booking.bookingId || b._id === booking.bookingId ? { ...b, bookingStatus: newStatus } : b))
            );
            showToast('success', `Booking ${booking.bookingId} marked as ${newStatus}.`);
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
          } else {
            showToast('error', res.message || 'Failed to update booking status.');
            setConfirmModal(prev => ({ ...prev, loading: false }));
          }
        } catch (err) {
          showToast('error', err.message || 'Failed to update booking status.');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        } finally {
          setActionLoadingId(null);
        }
      }
    });
  };

  // Filtered list
  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    const term = searchTerm.toLowerCase();
    return bookings.filter(b =>
      b.bookingId?.toLowerCase().includes(term) ||
      b.movieTitle?.toLowerCase().includes(term) ||
      b.theatreName?.toLowerCase().includes(term) ||
      b.user?.name?.toLowerCase().includes(term) ||
      b.user?.email?.toLowerCase().includes(term)
    );
  }, [bookings, searchTerm]);

  // Paginated slice
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        badgeIcon={Ticket}
        badgeText="Box Office Feed"
        title="Customer Bookings"
        description="Real-time customer ticket orders, seat allocations, and payment settlement records"
      >
        <button
          onClick={() => loadBookings(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 hover:text-[#222432] border border-gray-200 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#F84464] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </AdminPageHeader>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Booking ID, Movie, Customer, Theatre..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-[#222432] font-bold focus:bg-white focus:outline-none focus:border-[#F84464] cursor-pointer"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 font-bold">
            Total: <span className="text-[#222432]">{filteredBookings.length}</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100">
        {loading ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
            <span className="text-xs font-semibold text-gray-500">
              Fetching customer transactions from Atlas...
            </span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <AdminEmptyState
            icon={Ticket}
            title="No Bookings Found"
            description={
              searchTerm
                ? `No booking records match "${searchTerm}".`
                : 'No customer orders have been placed in this status category.'
            }
            actionText={searchTerm ? 'Reset Search' : undefined}
            onAction={searchTerm ? () => setSearchTerm('') : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Show &amp; Venue</th>
                    <th className="py-3 px-4">Seats Allocated</th>
                    <th className="py-3 px-4">Gross Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-[#F84464]">
                        {b.bookingId}
                        <span className="block text-[10px] font-normal text-gray-400 font-sans mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 border border-gray-200">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-black text-[#222432]">{b.user?.name || 'Customer'}</p>
                            <p className="text-[10px] text-gray-400">{b.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-black text-[#222432] text-sm leading-snug">{b.movieTitle}</p>
                        <p className="text-[11px] text-gray-600 font-medium">{b.theatreName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {b.showtime} &bull; {b.showDate}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-mono text-[11px] font-black text-gray-800 border border-gray-200/80">
                          {b.seats?.join(', ') || `${b.seatsCount} pass(es)`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#222432] text-sm">
                        ₹{b.totalAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        <AdminStatusBadge status={b.bookingStatus} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {b.bookingStatus === 'confirmed' ? (
                          <button
                            disabled={actionLoadingId === b.bookingId}
                            onClick={() => handleStatusChangePrompt(b, 'cancelled')}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === b.bookingId ? 'Processing...' : 'Cancel / Refund'}
                          </button>
                        ) : (
                          <button
                            disabled={actionLoadingId === b.bookingId}
                            onClick={() => handleStatusChangePrompt(b, 'confirmed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === b.bookingId ? 'Processing...' : 'Re-confirm'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <AdminPagination
              totalItems={filteredBookings.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        loading={confirmModal.loading}
      />
    </div>
  );
}
