import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../services/vendorApi';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Input,
  Select,
  EmptyState,
  CopyButton
} from '../../components/ui';
import {
  Ticket,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getBookings({
        search: search.trim(),
        showDate: selectedDate,
        page,
        limit: 25
      });
      if (res.success) {
        setBookings(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.totalCount || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load bookings manifest:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickCheckIn = async (bookingId) => {
    try {
      const res = await vendorApi.scanTicket({ bookingId });
      if (res.success) {
        await fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Box Office Manifest & Admissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete gate manifest for customer reservations, seat allocations, and check-in audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Printer size={14} />
            <span>Print Gate Sheet</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => window.location.href = '/vendor/scanner'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <CheckCircle2 size={14} />
            <span>Gate Scanner</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Booking ID, Customer, Movie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary" className="text-xs">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-gray-500 font-medium">Date Filter:</span>
              {['All', 'Today', 'Tomorrow'].map((d) => (
                <button
                  key={d}
                  onClick={() => { setSelectedDate(d); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedDate === d
                      ? 'bg-[#333545] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}

              <button
                onClick={fetchBookings}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition ml-2"
                title="Refresh Manifest"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manifest Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="py-3.5 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-gray-800">
            Confirmed Admissions Manifest ({totalCount})
          </CardTitle>
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading admissions manifest...
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No Reservations Found"
              description={search ? `No bookings matched "${search}".` : 'No customer reservations recorded for the selected filter.'}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead>Venue & Screen</TableHead>
                  <TableHead>Showtime</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gate Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id || b.bookingId}>
                    <TableCell className="font-mono text-xs font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{b.bookingId}</span>
                        <CopyButton textToCopy={b.bookingId} size={11} />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-gray-900">
                        {b.user?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {b.user?.phone || b.user?.email || 'N/A'}
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-gray-900">
                      {b.movieTitle}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-gray-900">{b.theatreName}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">
                        {b.screenName || 'Screen 1'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-gray-800">{b.showtime}</div>
                      <div className="text-[11px] text-gray-500">{b.showDate}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[130px]">
                        {(b.seats || []).map((s) => (
                          <span
                            key={s}
                            className="bg-gray-100 font-mono text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-xs text-gray-900">
                      ₹{b.totalAmount}
                    </TableCell>

                    <TableCell>
                      {b.ticketValidated ? (
                        <div>
                          <Badge variant="success" className="text-[10px] font-bold">
                            Checked In
                          </Badge>
                          {b.validatedAt && (
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(b.validatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          Pending Gate
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {!b.ticketValidated && (
                        <button
                          onClick={() => handleQuickCheckIn(b.bookingId)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition"
                        >
                          Check In
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
