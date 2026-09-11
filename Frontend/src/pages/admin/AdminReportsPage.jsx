import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Loader2,
  FileText,
  Table,
  CheckCircle,
  Sparkles
} from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#F84464]" />
            <span>Compliance, Distributor &amp; Tax Audits</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate official reporting ledgers and export CSV files for distributor settlements, accounting, and tax filing.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!records.length}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-sm disabled:opacity-40 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Audit File ({records.length})</span>
        </button>
      </div>

      {/* Report Controls Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Report Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'bookings', label: 'Ticket Bookings' },
            { id: 'partners', label: 'Cinema Partners' },
            { id: 'cinemas', label: 'Multiplex Properties' },
            { id: 'movies', label: 'Movie Catalog' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                reportType === t.id
                  ? 'bg-[#F84464] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Date From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-[#222432] px-2.5 py-1.5 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] text-xs"
          />
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-[#222432] px-2.5 py-1.5 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] text-xs"
          />
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#EEEEF2] flex items-center justify-between text-xs">
          <span className="font-bold text-[#222432] uppercase tracking-wider">
            Audit Records Preview ({records.length} items)
          </span>
          <span className="text-gray-400 font-mono">Real-time DB query</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs text-[#222432]">
            <thead className="bg-[#F9F9FB] text-gray-400 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10 border-b border-[#EEEEF2]">
              {reportType === 'bookings' && (
                <tr>
                  <th className="px-4 py-3">Booking Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Movie &amp; Venue</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              )}
              {reportType === 'partners' && (
                <tr>
                  <th className="px-4 py-3">Circuit Organization</th>
                  <th className="px-4 py-3">Operator Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-center">Lifecycle Status</th>
                </tr>
              )}
              {reportType === 'cinemas' && (
                <tr>
                  <th className="px-4 py-3">Multiplex Venue</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              )}
              {reportType === 'movies' && (
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Cert</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[#EEEEF2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#F84464] animate-spin mx-auto mb-2" />
                    <span>Compiling audit report...</span>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition">
                    {reportType === 'bookings' && (
                      <>
                        <td className="px-4 py-3 font-mono text-[#F84464] font-bold">{r.bookingId}</td>
                        <td className="px-4 py-3 text-[#222432] font-semibold">{r.user?.name || 'Customer'}</td>
                        <td className="px-4 py-3 truncate max-w-xs text-gray-600">{r.movieTitle} • {r.theatreName}</td>
                        <td className="px-4 py-3 font-mono">{Array.isArray(r.seats) ? r.seats.join(', ') : r.seats}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#222432]">₹{r.totalAmount}</td>
                        <td className="px-4 py-3 text-center capitalize">{r.bookingStatus}</td>
                        <td className="px-4 py-3 text-gray-400 text-[10px]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      </>
                    )}
                    {reportType === 'partners' && (
                      <>
                        <td className="px-4 py-3 font-bold text-[#222432]">{r.businessName || '—'}</td>
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{r.email}</td>
                        <td className="px-4 py-3 font-mono">{r.phone || '—'}</td>
                        <td className="px-4 py-3 text-center uppercase text-[10px] font-bold text-amber-600">{r.partnerStatus || 'active'}</td>
                      </>
                    )}
                    {reportType === 'cinemas' && (
                      <>
                        <td className="px-4 py-3 font-bold text-[#222432]">{r.name}</td>
                        <td className="px-4 py-3 text-[#F84464] font-semibold">{r.city}</td>
                        <td className="px-4 py-3 text-gray-500">{r.state || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{r.address}</td>
                        <td className="px-4 py-3 text-center uppercase text-[10px] font-bold text-emerald-600">{r.status}</td>
                      </>
                    )}
                    {reportType === 'movies' && (
                      <>
                        <td className="px-4 py-3 font-bold text-[#222432]">{r.title}</td>
                        <td className="px-4 py-3">{r.language}</td>
                        <td className="px-4 py-3">{r.certificate}</td>
                        <td className="px-4 py-3 font-mono">{r.duration}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">{r.rating}/10</td>
                        <td className="px-4 py-3 text-center uppercase text-[10px] font-bold text-[#F84464]">{r.status}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    No records found for the chosen date range and criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
