import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Ticket,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  User,
  Phone,
  Mail,
  Building2,
  Tv,
  Film,
  Sparkles,
  QrCode
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Modal,
  Input,
  Select,
  EmptyState,
  Skeleton,
  CopyButton,
  CopyBadge
} from '../../components/ui';

export default function CinemaPartnerBookingsPage() {
  const toast = useCinemaToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await cinemaPartnerApi.getBookings({
        search,
        status: statusFilter,
        date: dateFilter,
        limit: 100
      });
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      toast.error('Load Error', err.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <PageHeader
        title="Cinema Admissions & Ticket Manifest"
        subtitle="Real-time guest reservations, seat inventories, and turnstile check-in verification records."
        icon={Ticket}
        badge="Auditorium Admissions"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="w-56">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, movie..."
                icon={Search}
              />
            </form>

            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
          </div>
        }
      />

      {/* Bookings Table */}
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admissions Register</CardTitle>
            <CardDescription>Confirmed ticket holders across your circuit</CardDescription>
          </div>
          <Badge variant="neutral" pill>
            {bookings.length} Bookings
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Ticket}
                title="No Customer Bookings Found"
                description="No reservations match the selected search or filter criteria."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Movie &amp; Show</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Gate Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => {
                  const customerName = b.user?.name || 'Customer';
                  const isValidated = b.ticketValidated;

                  return (
                    <TableRow key={b._id} hover className="transition-colors hover:bg-[#F84464]/5">
                      <TableCell className="whitespace-nowrap">
                        <CopyBadge text={b.bookingId} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="font-semibold text-[#222432]">{customerName}</div>
                        <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{b.user?.email || b.user?.phone || 'Guest'}</span>
                          {(b.user?.email || b.user?.phone) && (
                            <CopyButton
                              text={b.user?.email || b.user?.phone}
                              size="xs"
                              variant="ghost"
                              title="Copy contact details"
                            />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-[#222432] line-clamp-1">{b.movieTitle}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {b.theatreName} • {b.showtime} ({b.showDate})
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-[#222432] bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            {b.seats?.join(', ')}
                          </span>
                          {b.seats?.length > 0 && (
                            <CopyButton
                              text={b.seats.join(', ')}
                              size="xs"
                              variant="ghost"
                              title="Copy seat numbers"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">({b.seatsCount || b.seats?.length} seats)</span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-[#4ABD5D] whitespace-nowrap">
                        ₹{b.totalAmount}
                      </TableCell>

                      <TableCell className="text-center whitespace-nowrap">
                        {isValidated ? (
                          <Badge variant="approved" dot>
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="warning" dot>
                            Gate Pending
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedBooking(b)}
                          title="View Digital Ticket Manifest"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Digital M-Ticket Inspection Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title="Digital M-Ticket Inspection"
          description={
            <span className="inline-flex items-center gap-2 mt-1">
              <span>Order Reference:</span>
              <CopyBadge text={selectedBooking.bookingId} size="xs" />
            </span>
          }
          size="md"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close Manifest
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Movie Info Card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <div className="text-sm font-bold text-[#222432]">{selectedBooking.movieTitle}</div>
              <div className="text-xs text-gray-600">
                {selectedBooking.theatreName} • {selectedBooking.screenName || 'Screen 1'}
              </div>
              <div className="text-xs text-[#F84464] font-bold pt-1">
                {selectedBooking.showDate} at {selectedBooking.showtime}
              </div>
            </div>

            {/* Customer Contact */}
            <div className="text-xs space-y-2 pt-1 border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> Customer</span>
                <span className="font-bold text-[#222432]">{selectedBooking.user?.name || 'Customer'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> Email</span>
                <div className="flex items-center gap-1">
                  <span className="text-[#222432] font-mono">{selectedBooking.user?.email || 'N/A'}</span>
                  {selectedBooking.user?.email && (
                    <CopyButton text={selectedBooking.user.email} size="xs" variant="ghost" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> Phone</span>
                <div className="flex items-center gap-1">
                  <span className="text-[#222432] font-mono">{selectedBooking.user?.phone || 'N/A'}</span>
                  {selectedBooking.user?.phone && (
                    <CopyButton text={selectedBooking.user.phone} size="xs" variant="ghost" />
                  )}
                </div>
              </div>
            </div>

            {/* Seats & Financial Breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Assigned Seats</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#F84464] bg-[#F84464]/10 px-2 py-0.5 rounded">
                    {selectedBooking.seats?.join(', ')}
                  </span>
                  {selectedBooking.seats?.length > 0 && (
                    <CopyButton text={selectedBooking.seats.join(', ')} size="xs" variant="ghost" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Base Tickets</span>
                <span className="font-semibold text-[#222432]">₹{selectedBooking.ticketPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Convenience Fee</span>
                <span className="text-[#222432]">₹{selectedBooking.convenienceFee || 0}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 font-bold">
                <span className="text-[#222432]">Total Paid</span>
                <span className="text-[#4ABD5D] text-base font-mono">₹{selectedBooking.totalAmount}</span>
              </div>
            </div>

            {/* Validation Audit */}
            <div className="text-xs pt-1">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1.5">Turnstile Verification Status</div>
              {selectedBooking.ticketValidated ? (
                <div className="p-3 rounded-xl bg-[#4ABD5D]/10 border border-[#4ABD5D]/30 text-[#4ABD5D] text-xs flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Admitted at Gate
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {selectedBooking.validatedAt ? new Date(selectedBooking.validatedAt).toLocaleTimeString() : ''}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Awaiting Turnstile Check-In
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
