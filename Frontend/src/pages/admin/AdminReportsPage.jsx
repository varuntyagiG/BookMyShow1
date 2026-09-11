import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  CheckCircle,
  Sparkles,
  Ticket,
  Building2,
  Clapperboard,
  Users
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
  Input,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('bookings');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReportData(reportType, { startDate, endDate });
      if (res.success) {
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const handleExportCSV = () => {
    if (!records.length) return;

    let headers = [];
    let rows = [];

    if (reportType === 'bookings') {
      headers = ['Booking ID', 'Customer Name', 'Customer Email', 'Movie Title', 'Venue', 'Seats', 'Gross Amount (INR)', 'Gate Validated', 'Status', 'Booking Date'];
      rows = records.map((b) => [
        `"${b.bookingId}"`,
        `"${b.user?.name || ''}"`,
        `"${b.user?.email || ''}"`,
        `"${b.movieTitle || ''}"`,
        `"${b.theatreName || ''}"`,
        `"${Array.isArray(b.seats) ? b.seats.join(';') : b.seats}"`,
        b.totalAmount || 0,
        b.ticketValidated ? 'YES' : 'NO',
        b.bookingStatus,
        `"${new Date(b.createdAt).toISOString()}"`
      ]);
    } else if (reportType === 'partners') {
      headers = ['Organization', 'Operator Name', 'Email', 'Phone', 'Lifecycle Status', 'Created Date'];
      rows = records.map((p) => [
        `"${p.businessName || ''}"`,
        `"${p.name || ''}"`,
        `"${p.email || ''}"`,
        `"${p.phone || ''}"`,
        p.partnerStatus || 'active',
        `"${new Date(p.createdAt).toISOString()}"`
      ]);
    } else if (reportType === 'cinemas') {
      headers = ['Cinema Name', 'City', 'State', 'Address', 'Status', 'Screens Count'];
      rows = records.map((c) => [
        `"${c.name}"`,
        `"${c.city}"`,
        `"${c.state || ''}"`,
        `"${c.address}"`,
        c.status,
        c.screensCount || 1
      ]);
    } else if (reportType === 'movies') {
      headers = ['Title', 'Language', 'Certificate', 'Duration', 'Release Date', 'Rating', 'Status'];
      rows = records.map((m) => [
        `"${m.title}"`,
        `"${m.language}"`,
        m.certificate,
        `"${m.duration}"`,
        `"${m.releaseDate}"`,
        m.rating,
        m.status
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bms_report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTabs = [
    { id: 'bookings', label: 'Ticket Bookings', icon: Ticket },
    { id: 'partners', label: 'Cinema Partners', icon: Users },
    { id: 'cinemas', label: 'Multiplex Venues', icon: Building2 },
    { id: 'movies', label: 'Movie Catalog', icon: Clapperboard }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Distributor Settlement, Compliance & Tax Audits"
        subtitle="Generate official reporting ledgers and export CSV files for distributor settlements, accounting, and tax filing."
        icon={BarChart3}
        badge="Audit Engine"
        actions={
          <Button
            variant="primary"
            icon={Download}
            onClick={handleExportCSV}
            disabled={!records.length}
          >
            Export CSV Audit File ({records.length})
          </Button>
        }
      />

      {/* Filter & Selector Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segment Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = reportType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F84464] text-white shadow-sm shadow-[#F84464]/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-600">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-[#222432] px-3 py-1.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#F84464] font-medium"
            />
            <span className="font-semibold text-gray-600">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-[#222432] px-3 py-1.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#F84464] font-medium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Report Records Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle>Audit Records Preview</CardTitle>
            <CardDescription>
              Showing {records.length} real-time verified records from MongoDB Atlas
            </CardDescription>
          </div>
          <Badge variant="neutral" pill>
            Live Query
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : records.length > 0 ? (
            <Table>
              <TableHeader>
                {reportType === 'bookings' && (
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Movie &amp; Venue</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                )}
                {reportType === 'partners' && (
                  <TableRow>
                    <TableHead>Circuit Organization</TableHead>
                    <TableHead>Operator Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                )}
                {reportType === 'cinemas' && (
                  <TableRow>
                    <TableHead>Multiplex Venue</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                )}
                {reportType === 'movies' && (
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Cert</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {records.map((r, idx) => (
                  <TableRow key={idx} hover>
                    {reportType === 'bookings' && (
                      <>
                        <TableCell className="font-mono text-[#F84464] font-bold">
                          {r.bookingId}
                        </TableCell>
                        <TableCell className="font-bold text-[#222432]">
                          {r.user?.name || 'Customer'}
                        </TableCell>
                        <TableCell className="truncate max-w-xs text-gray-600">
                          {r.movieTitle} • {r.theatreName}
                        </TableCell>
                        <TableCell className="font-mono">
                          {Array.isArray(r.seats) ? r.seats.join(', ') : r.seats}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#222432]">
                          ₹{r.totalAmount}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={r.bookingStatus === 'confirmed' ? 'approved' : 'cancelled'}>
                            {r.bookingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-[11px] font-mono">
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </TableCell>
                      </>
                    )}
                    {reportType === 'partners' && (
                      <>
                        <TableCell className="font-bold text-[#222432]">
                          {r.businessName || '—'}
                        </TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell className="font-mono text-gray-500">{r.email}</TableCell>
                        <TableCell className="font-mono">{r.phone || '—'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={r.partnerStatus === 'active' ? 'approved' : 'pending'}>
                            {r.partnerStatus || 'active'}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    {reportType === 'cinemas' && (
                      <>
                        <TableCell className="font-bold text-[#222432]">{r.name}</TableCell>
                        <TableCell className="text-[#F84464] font-semibold">{r.city}</TableCell>
                        <TableCell className="text-gray-500">{r.state || '—'}</TableCell>
                        <TableCell className="text-gray-500 truncate max-w-xs">{r.address}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={r.status === 'active' ? 'approved' : 'neutral'}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    {reportType === 'movies' && (
                      <>
                        <TableCell className="font-bold text-[#222432]">{r.title}</TableCell>
                        <TableCell>{r.language}</TableCell>
                        <TableCell className="font-mono">{r.certificate}</TableCell>
                        <TableCell className="font-mono">{r.duration}</TableCell>
                        <TableCell className="font-bold text-[#4ABD5D]">★ {r.rating}/10</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={r.status === 'released' ? 'approved' : 'neutral'}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={BarChart3}
                title="No Audit Records Found"
                description="Try adjusting your date range filter or select another report category."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
