import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  BarChart3,
  Film,
  Building2,
  Ticket,
  IndianRupee,
  Download,
  Calendar,
  Receipt,
  Sparkles
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
  MetricCard,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function CinemaPartnerReportsPage() {
  const toast = useCinemaToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await cinemaPartnerApi.getReports();
        if (res.success && res.reports) {
          setData(res.reports);
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch operational reports.');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const rep = data || {};
  const moviePerf = rep.moviePerformance || [];
  const cinemaPerf = rep.cinemaPerformance || [];

  const handleExport = () => {
    if (!moviePerf.length && !cinemaPerf.length) return;
    const headers = ['Category', 'Name', 'Bookings Count', 'Tickets Sold', 'Revenue (INR)'];
    const movieRows = moviePerf.map((m) => ['Movie', `"${m.movie}"`, m.bookingsCount, m.tickets, m.revenue]);
    const cinemaRows = cinemaPerf.map((c) => ['Cinema', `"${c.cinema}"`, c.bookingsCount, c.tickets, c.revenue]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...movieRows.map((r) => r.join(',')), ...cinemaRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bms_circuit_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report Exported', 'Downloaded audit report CSV.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <PageHeader
        title="Operational Performance & Sales Audits"
        subtitle="Aggregated box office performance metrics across movie titles, auditoriums, and ticket throughput."
        icon={BarChart3}
        badge="Performance Analytics"
        actions={
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExport}
            disabled={!moviePerf.length && !cinemaPerf.length}
          >
            Export CSV Audit
          </Button>
        }
      />

      {/* Financial KPIs */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <MetricCard
            title="Gross Sales Realization"
            value={`₹${(rep.grossSales || 0).toLocaleString('en-IN')}`}
            subtitle="Total box office collections"
            icon={IndianRupee}
            variant="success"
          />

          <MetricCard
            title="Confirmed Admissions"
            value={rep.totalConfirmed || 0}
            subtitle="Audience tickets issued"
            icon={Ticket}
            variant="brand"
          />

          <MetricCard
            title="Transactions Processed"
            value={rep.totalTransactions || 0}
            subtitle="Customer reservations completed"
            icon={Receipt}
            variant="default"
          />
        </div>
      )}

      {/* Movie Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#F84464]" />
              <span>Theatrical Release Throughput Audit</span>
            </CardTitle>
            <CardDescription>Admissions and gross collections by movie title</CardDescription>
          </div>
          <Badge variant="brand" pill>
            {moviePerf.length} Titles
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : moviePerf.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={Film}
                title="No Movie Records Found"
                description="Movie performance metrics will appear here once ticket orders are logged."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Theatrical Release</TableHead>
                  <TableHead className="text-center">Bookings Processed</TableHead>
                  <TableHead className="text-center">Tickets Sold</TableHead>
                  <TableHead className="text-right">Gross Realization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moviePerf.map((m, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell className="font-bold text-[#222432]">{m.movie}</TableCell>
                    <TableCell className="text-center font-mono text-gray-600">{m.bookingsCount}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-[#F84464]">{m.tickets}</TableCell>
                    <TableCell className="text-right font-mono font-black text-[#4ABD5D]">₹{(m.revenue || 0).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cinema Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Multiplex Property Box Office Audit</span>
            </CardTitle>
            <CardDescription>Auditorium throughput and ticket sales by venue</CardDescription>
          </div>
          <Badge variant="info" pill>
            {cinemaPerf.length} Venues
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : cinemaPerf.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={Building2}
                title="No Venue Records Found"
                description="Cinema property sales will appear here once orders are confirmed."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Multiplex Property</TableHead>
                  <TableHead className="text-center">Bookings Processed</TableHead>
                  <TableHead className="text-center">Tickets Sold</TableHead>
                  <TableHead className="text-right">Gross Box Office</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cinemaPerf.map((c, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell className="font-bold text-[#222432]">{c.cinema}</TableCell>
                    <TableCell className="text-center font-mono text-gray-600">{c.bookingsCount}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-sky-600">{c.tickets}</TableCell>
                    <TableCell className="text-right font-mono font-black text-[#4ABD5D]">₹{(c.revenue || 0).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
