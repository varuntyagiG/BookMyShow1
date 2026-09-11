import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Ticket,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  IndianRupee,
  X,
  ShieldCheck,
  RotateCcw,
  QrCode
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  PageHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Input,
  Select,
  Modal,
  EmptyState,
  SkeletonTableRows,
  CopyBadge,
  CopyButton
} from '../../components/ui';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Detail Drawer State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Cancel & Refund Modal State
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    booking: null,
    reason: 'Customer requested refund',
    submitting: false
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({
        search,
        status: statusFilter,
        page,
        limit: 15
      });
      if (res.success) {
        setBookings(res.bookings || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter, page]);

  const handleOpenDetail = async (bookingId) => {
    setDrawerLoading(true);
    try {
      const res = await adminApi.getBookingById(bookingId);
      if (res.success) {
        setSelectedBooking(res.booking);
      }
    } catch (err) {
      console.error('Failed to retrieve booking:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleConfirmRefund = async (e) => {
    e.preventDefault();
    if (!refundModal.booking) return;

    setRefundModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await adminApi.cancelBooking(refundModal.booking._id, refundModal.reason);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === refundModal.booking._id
              ? { ...b, bookingStatus: 'cancelled', paymentStatus: 'refunded' }
              : b
          )
        );
        if (selectedBooking && selectedBooking._id === refundModal.booking._id) {
          setSelectedBooking((prev) => ({
            ...prev,
            bookingStatus: 'cancelled',
            paymentStatus: 'refunded'
          }));
        }
        setRefundModal({ isOpen: false, booking: null, reason: '', submitting: false });
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setRefundModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Global Bookings Ledger"
        subtitle="Auditable platform ledger tracking ticket reservations, seat locks, customer admissions, and refunds."
        icon={Ticket}
        badge="Ledger"
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by booking ID, movie, or cinema..."
              icon={Search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Booking Statuses' },
                { value: 'confirmed', label: 'Confirmed Only' },
                { value: 'cancelled', label: 'Cancelled & Refunded' }
              ]}
              wrapperClassName="w-full sm:w-56"
            />
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Booking ID</TableHead>
              <TableHead>Movie Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Venue Multiplex</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonTableRows rows={8} cols={8} />
            ) : bookings.length > 0 ? (
              bookings.map((b) => (
                <TableRow key={b._id} className="transition-colors hover:bg-[#F84464]/5">
                  <TableCell className="whitespace-nowrap">
                    <CopyBadge text={b.bookingId || b._id?.substring(0, 8)} size="xs" />
                  </TableCell>

                  <TableCell className="font-bold text-[#222432] max-w-[160px] truncate">
                    {b.movieTitle || b.movie?.title || 'Film'}
                  </TableCell>

                  <TableCell>
                    <div className="font-bold text-[#222432] truncate">
                      {b.user?.name || 'Customer'}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                      <span>{b.user?.email || 'N/A'}</span>
                      {b.user?.email && (
                        <CopyButton text={b.user.email} size="xs" variant="ghost" title="Copy email" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-gray-500 max-w-[150px] truncate">
                    {b.theatreName || b.cinema?.name || 'Cinema'}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-700">
                        {Array.isArray(b.seats) ? b.seats.join(', ') : '1 Seat'}
                      </span>
                      {Array.isArray(b.seats) && b.seats.length > 0 && (
                        <CopyButton text={b.seats.join(', ')} size="xs" variant="ghost" title="Copy seats" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-black text-[#222432]">
                    ₹{(b.totalAmount || 0).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <Badge variant={b.bookingStatus === 'confirmed' ? 'active' : 'cancelled'} dot>
                      {b.bookingStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenDetail(b._id)}
                      >
                        Receipt
                      </Button>

                      {b.bookingStatus === 'confirmed' && (
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => setRefundModal({
                            isOpen: true,
                            booking: b,
                            reason: 'Customer requested cancellation',
                            submitting: false
                          })}
                        >
                          Refund
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow hover={false}>
                <TableCell colSpan={8} className="py-12">
                  <EmptyState
                    icon={Ticket}
                    title="No Bookings Recorded"
                    description="No transaction records match your query."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          onPageChange={setPage}
        />
      </Card>

      {/* Booking Detail Slide-over */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedBooking(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#F84464]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#222432]">Receipt</span>
                    <CopyBadge text={selectedBooking.bookingId} size="xs" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">M-Ticket Digital Confirmation</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Ticket Card Style matching Customer M-Ticket */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div>
                  <div className="text-base font-black text-[#222432]">
                    {selectedBooking.movieTitle}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {selectedBooking.theatreName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Date &amp; Time</div>
                    <div className="font-bold text-[#222432]">{selectedBooking.showDate} • {selectedBooking.showTime}</div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Seats</div>
                    <div className="font-bold text-[#F84464] flex items-center gap-1.5 mt-0.5">
                      <span>{Array.isArray(selectedBooking.seats) ? selectedBooking.seats.join(', ') : '1 Seat'}</span>
                      {Array.isArray(selectedBooking.seats) && selectedBooking.seats.length > 0 && (
                        <CopyButton text={selectedBooking.seats.join(', ')} size="xs" variant="ghost" title="Copy seats" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Total Price Paid</span>
                  <span className="text-base font-black text-[#222432]">₹{(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="p-4 rounded-xl border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#222432]">Admission Status</div>
                  <div className="text-[11px] text-gray-400">Payment: {selectedBooking.paymentStatus || 'Paid'}</div>
                </div>
                <Badge variant={selectedBooking.bookingStatus === 'confirmed' ? 'active' : 'cancelled'}>
                  {selectedBooking.bookingStatus}
                </Badge>
              </div>

              {selectedBooking.bookingStatus === 'confirmed' && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setRefundModal({
                    isOpen: true,
                    booking: selectedBooking,
                    reason: 'Administrative refund',
                    submitting: false
                  })}
                >
                  Cancel Booking &amp; Issue Full Refund
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      <Modal
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, booking: null, reason: '', submitting: false })}
        title="Cancel Booking &amp; Issue Refund"
        subtitle={`Cancel booking #${refundModal.booking?.bookingId} for ₹${refundModal.booking?.totalAmount}?`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmRefund} className="space-y-4">
          <Input
            label="Cancellation &amp; Refund Reason"
            placeholder="Reason for audit log..."
            value={refundModal.reason}
            onChange={(e) => setRefundModal((prev) => ({ ...prev, reason: e.target.value }))}
            required
          />

          <p className="text-[11px] text-gray-500">
            Cancelling this booking will immediately free up seats{' '}
            <span className="font-bold text-[#222432]">
              {Array.isArray(refundModal.booking?.seats) ? refundModal.booking.seats.join(', ') : ''}
            </span>{' '}
            on the auditorium show schedule.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setRefundModal({ isOpen: false, booking: null, reason: '', submitting: false })}
            >
              Back
            </Button>

            <Button type="submit" variant="destructive" loading={refundModal.submitting}>
              Confirm Refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
