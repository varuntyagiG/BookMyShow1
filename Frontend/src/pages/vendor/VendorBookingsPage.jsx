import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { vendorApi } from '../../services/vendorApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
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
  Modal,
  EmptyState,
  CopyButton
} from '../../components/ui';
import {
  Ticket,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  MapPin,
  Calendar,
  Eye,
  Phone,
  Mail,
  User,
  Film,
  Tv,
  IndianRupee,
  ScanLine,
  QrCode,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected booking for detailed ticket pass inspection modal
  const [inspectedBooking, setInspectedBooking] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getBookings({
        search: search.trim(),
        showDate: selectedDate,
        page,
        limit: 25
      });
      if (res.success) {
        setBookings(res.data || []);
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
  }, [search, selectedDate, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['BOOKING_MUTATION'], () => {
    fetchBookings();
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleQuickCheckIn = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      const res = await vendorApi.scanTicket({ bookingId });
      if (res.success) {
        if (inspectedBooking && (inspectedBooking.bookingId === bookingId || inspectedBooking.id === bookingId)) {
          setInspectedBooking(prev => ({ ...prev, ticketValidated: true, validatedAt: new Date() }));
        }
        await fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Check-in validation failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Client-side gate status filter (All, Checked In, Pending Gate)
  const filteredBookings = useMemo(() => {
    if (selectedStatus === 'CheckedIn') {
      return bookings.filter(b => b.ticketValidated);
    }
    if (selectedStatus === 'Pending') {
      return bookings.filter(b => !b.ticketValidated);
    }
    return bookings;
  }, [bookings, selectedStatus]);

  // Aggregate manifest metrics from current records
  const metrics = useMemo(() => {
    const totalAdmissions = bookings.reduce((sum, b) => {
      const count = b.seatsCount || (Array.isArray(b.seats) ? b.seats.length : 1);
      return sum + count;
    }, 0);

    const checkedInCount = bookings.filter(b => b.ticketValidated).reduce((sum, b) => {
      const count = b.seatsCount || (Array.isArray(b.seats) ? b.seats.length : 1);
      return sum + count;
    }, 0);

    const pendingCount = Math.max(0, totalAdmissions - checkedInCount);
    const grossRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const validationPercentage = totalAdmissions > 0 ? Math.round((checkedInCount / totalAdmissions) * 100) : 0;

    return {
      totalAdmissions,
      checkedInCount,
      pendingCount,
      grossRevenue,
      validationPercentage
    };
  }, [bookings]);

  // Export filtered manifest to CSV
  const handleExportCSV = () => {
    if (!bookings.length) {
      alert('No reservations available to export.');
      return;
    }

    const headers = ['Booking ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Movie', 'Theatre', 'Screen', 'Show Date', 'Showtime', 'Seats', 'Seats Count', 'Total Amount', 'Gate Status', 'Validated At'];
    const rows = bookings.map(b => [
      b.bookingId || '',
      b.user?.name || 'Customer',
      b.user?.email || '',
      b.user?.phone || '',
      `"${(b.movieTitle || '').replace(/"/g, '""')}"`,
      `"${(b.theatreName || '').replace(/"/g, '""')}"`,
      `"${(b.screenName || 'Screen 1').replace(/"/g, '""')}"`,
      b.showDate || '',
      b.showtime || '',
      `"${(b.seats || []).join(', ')}"`,
      b.seatsCount || (b.seats ? b.seats.length : 1),
      b.totalAmount || 0,
      b.ticketValidated ? 'Checked In' : 'Pending Gate',
      b.validatedAt ? new Date(b.validatedAt).toISOString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `box-office-manifest-${selectedDate.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* 1. Header & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 font-mono">
              Live Box Office Manifest
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Ticket className="text-[#F84464]" size={28} />
            <span>Confirmed Admissions Manifest</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time gate admissions, seat inventory manifest, patron records, and check-in audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 border-slate-300 shadow-2xs hover:bg-slate-50"
            title="Download CSV Manifest"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 border-slate-300 shadow-2xs hover:bg-slate-50"
            title="Print Gate Manifest Sheet"
          >
            <Printer size={14} className="text-slate-500" />
            <span>Print Sheet</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => window.location.href = '/vendor/scanner'}
            className="inline-flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <ScanLine size={14} />
            <span>Gate Scanner</span>
          </Button>
        </div>
      </div>

      {/* 2. Senior Executive Telemetry KPI Bar (4 Key Indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5 print:hidden">
        {/* Metric 1: Total Admissions */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(248,68,100,0.1)] hover:border-rose-200 transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#F84464] before:to-rose-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Booked</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#F84464] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              {metrics.totalAdmissions}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Tickets</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {totalCount} confirmed orders
          </div>
        </motion.div>

        {/* Metric 2: Checked In at Gate */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(16,185,129,0.12)] hover:border-emerald-200 transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Gate Admitted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              {metrics.checkedInCount}
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {metrics.validationPercentage}% Admitted
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Verified with Gate QR scan
          </div>
        </motion.div>

        {/* Metric 3: Pending Arrival */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(245,158,11,0.12)] hover:border-amber-200 transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-orange-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Gate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              {metrics.pendingCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Expected</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Awaiting admission at gate
          </div>
        </motion.div>

        {/* Metric 4: Gross Manifest Collection */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(99,102,241,0.12)] hover:border-indigo-200 transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-indigo-600 before:to-violet-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Box Office Gross</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              ₹{metrics.grossRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Current filtered manifest value
          </div>
        </motion.div>
      </div>

      {/* 3. Search & Filter Command Toolbar */}
      <Card className="shadow-none border-slate-200/90 overflow-hidden print:hidden">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Booking ID, Patron Name, Mobile, Movie title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F84464] focus:border-[#F84464] shadow-2xs transition placeholder:text-slate-400"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary" className="text-xs px-4 rounded-xl font-bold">
                Filter
              </Button>
            </form>

            {/* Filter Pills Groups */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                  {['All', 'Today', 'Tomorrow'].map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDate(d); setPage(1); }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedDate === d
                          ? 'bg-[#F84464] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gate Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                  {[
                    { key: 'All', label: 'All' },
                    { key: 'Pending', label: 'Pending' },
                    { key: 'CheckedIn', label: 'Admitted' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedStatus(key)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedStatus === key
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchBookings}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                title="Refresh Live Data"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-[#F84464]' : ''} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Main Admissions Manifest Data Grid */}
      <Card className="shadow-none border-slate-200/90 overflow-hidden print:border-none print:shadow-none">
        <CardHeader className="py-3.5 px-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Admissions Roster</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {filteredBookings.length} {filteredBookings.length === 1 ? 'Booking' : 'Bookings'}
              </span>
            </CardTitle>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Page <span className="font-bold text-slate-700">{page}</span> of {totalPages}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-500">
              <RefreshCw size={24} className="animate-spin text-[#F84464] mx-auto mb-3 opacity-80" />
              <span>Fetching live admissions manifest...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              title="No Admissions Found"
              description={search ? `No tickets match "${search}". Try clearing search or adjusting date/status filters.` : 'No customer reservations recorded for the selected filter.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <TableHead className="py-3 px-4">Booking Ref</TableHead>
                    <TableHead className="py-3 px-4">Patron (Customer)</TableHead>
                    <TableHead className="py-3 px-4">Movie & Experience</TableHead>
                    <TableHead className="py-3 px-4">Multiplex & Audi</TableHead>
                    <TableHead className="py-3 px-4">Show Schedule</TableHead>
                    <TableHead className="py-3 px-4">Allocated Seats</TableHead>
                    <TableHead className="py-3 px-4">Amount</TableHead>
                    <TableHead className="py-3 px-4">Gate Status</TableHead>
                    <TableHead className="py-3 px-4 text-right print:hidden">Audit & Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((b) => {
                    const isValidated = Boolean(b.ticketValidated);
                    const seatList = Array.isArray(b.seats) ? b.seats : (b.seats ? [b.seats] : []);
                    const customerName = b.user?.name || 'Customer';
                    const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P';

                    return (
                      <TableRow
                        key={b.id || b.bookingId}
                        className="hover:bg-slate-50/70 transition-colors duration-150 border-b border-slate-100/90 text-xs"
                      >
                        {/* 1. Booking Reference */}
                        <TableCell className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80">
                              {b.bookingId}
                            </span>
                            <div className="print:hidden">
                              <CopyButton textToCopy={b.bookingId} size={11} />
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Patron (Customer Identity & Contacts) */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                                {customerName}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                {b.user?.phone ? (
                                  <a href={`tel:${b.user.phone}`} className="hover:text-[#F84464] flex items-center gap-1">
                                    <Phone size={10} />
                                    <span>{b.user.phone}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">No phone on file</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* 3. Movie & Experience */}
                        <TableCell className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs leading-snug">
                            {b.movieTitle}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                              {b.format || 'Standard 2D'}
                            </span>
                          </div>
                        </TableCell>

                        {/* 4. Multiplex & Audi */}
                        <TableCell className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium text-xs leading-snug truncate max-w-[150px]">
                            {b.theatreName}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                            <Tv size={11} className="text-slate-400" />
                            <span>{b.screenName || 'Screen 1'}</span>
                          </div>
                        </TableCell>

                        {/* 5. Schedule */}
                        <TableCell className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            {b.showtime}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} className="text-slate-400" />
                            <span>{b.showDate}</span>
                          </div>
                        </TableCell>

                        {/* 6. Allocated Seats */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {seatList.map((seat) => {
                              const sStr = String(seat || '');
                              const isRecliner = sStr.startsWith('A') || sStr.startsWith('B');
                              const isPremium = sStr.startsWith('C') || sStr.startsWith('D');
                              const chipStyle = isRecliner
                                ? 'bg-purple-50 text-purple-800 border-purple-200/80'
                                : isPremium
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                                : 'bg-slate-100 text-slate-700 border-slate-200/80';

                              return (
                                <span
                                  key={sStr}
                                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border shadow-2xs ${chipStyle}`}
                                >
                                  {sStr}
                                </span>
                              );
                            })}
                          </div>
                        </TableCell>

                        {/* 7. Amount */}
                        <TableCell className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-xs font-sans">
                            ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                            Verified Paid
                          </span>
                        </TableCell>

                        {/* 8. Gate Status */}
                        <TableCell className="py-3.5 px-4">
                          {isValidated ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                                <CheckCircle2 size={11} />
                                <span>Checked In</span>
                              </span>
                              {b.validatedAt && (
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                                  <Clock size={10} />
                                  <span>{new Date(b.validatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                              </span>
                              <span>Pending Gate</span>
                            </span>
                          )}
                        </TableCell>

                        {/* 9. Action Buttons */}
                        <TableCell className="py-3.5 px-4 text-right print:hidden">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isValidated && (
                              <button
                                onClick={() => handleQuickCheckIn(b.bookingId)}
                                disabled={actionLoadingId === b.bookingId}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-2.5 py-1.5 rounded-lg border border-emerald-200/70 transition shadow-2xs cursor-pointer disabled:opacity-50"
                                title="Admit and check in customer at gate"
                              >
                                {actionLoadingId === b.bookingId ? (
                                  <RefreshCw size={11} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={12} />
                                )}
                                <span>Admit</span>
                              </button>
                            )}

                            <button
                              onClick={() => setInspectedBooking(b)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
                              title="Inspect Ticket Pass"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 print:hidden">
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Ticket Pass & Gate Audit Modal */}
      <Modal
        isOpen={Boolean(inspectedBooking)}
        onClose={() => setInspectedBooking(null)}
        title="Gate Admission Ticket Pass"
        maxWidth="max-w-md"
      >
        {inspectedBooking && (
          <div className="space-y-4">
            {/* Digital Pass Card */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Header Strip */}
              <div className={`h-2 w-full ${inspectedBooking.ticketValidated ? 'bg-emerald-500' : 'bg-[#F84464]'}`} />

              <div className="p-5 space-y-4">
                {/* Title & Reference */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      REF: #{inspectedBooking.bookingId}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {inspectedBooking.movieTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {inspectedBooking.theatreName} • {inspectedBooking.screenName || 'Screen 1'}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      inspectedBooking.ticketValidated
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {inspectedBooking.ticketValidated ? 'Verified & Admitted' : 'Pending Gate'}
                  </span>
                </div>

                {/* Showtime & Schedule Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Show Date</span>
                    <span className="font-bold text-slate-800">{inspectedBooking.showDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
                    <span className="font-bold text-slate-800">{inspectedBooking.showtime}</span>
                  </div>
                </div>

                {/* Seat Allocation Details */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Assigned Auditoriums Seats ({(inspectedBooking.seats || []).length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(inspectedBooking.seats || []).map(seat => (
                      <span
                        key={seat}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono font-bold text-xs"
                      >
                        Seat {seat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Patron & Financial Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Patron Name</span>
                    <span className="font-bold text-slate-900">{inspectedBooking.user?.name || 'Customer'}</span>
                  </div>
                  {inspectedBooking.user?.phone && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phone Number</span>
                      <span className="font-mono text-slate-800">{inspectedBooking.user.phone}</span>
                    </div>
                  )}
                  {inspectedBooking.user?.email && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Email</span>
                      <span className="font-mono text-slate-800 truncate max-w-[180px]">{inspectedBooking.user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                    <span className="font-bold">Total Collection</span>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{Number(inspectedBooking.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Simulated Digital Barcode */}
                <div className="pt-2 text-center">
                  <div className="h-10 bg-[repeating-linear-gradient(90deg,#1e293b,#1e293b_2px,transparent_2px,transparent_4px,#0f172a_4px,#0f172a_7px,transparent_7px,transparent_9px)] rounded opacity-80" />
                  <span className="font-mono text-[9px] text-slate-400 tracking-widest mt-1 block">
                    *{inspectedBooking.bookingId}*
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectedBooking(null)}
                className="text-xs"
              >
                Close
              </Button>

              {!inspectedBooking.ticketValidated && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleQuickCheckIn(inspectedBooking.bookingId)}
                  isLoading={actionLoadingId === inspectedBooking.bookingId}
                  className="inline-flex items-center gap-1.5 text-xs font-bold"
                >
                  <CheckCircle2 size={14} />
                  <span>Admit & Validate Ticket</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

