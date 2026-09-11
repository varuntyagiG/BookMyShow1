import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../services/vendorApi';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  MetricCard,
  Badge,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '../../components/ui';
import {
  IndianRupee,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Building2,
  PieChart,
  ShieldCheck
} from 'lucide-react';

export default function VendorRevenuePage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const res = await vendorApi.getAnalytics();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load revenue analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRevenue();
  }, []);

  const totalRevenue = analytics?.summary?.totalRevenue || 0;
  const platformFee = Math.round(totalRevenue * 0.10); // 10% platform fee
  const netPayable = totalRevenue - platformFee;
  const moviePerformance = analytics?.moviePerformance || [];

  const mockSettlements = [
    {
      id: 'SETTL-8921',
      period: '1 Sep - 7 Sep 2026',
      gross: Math.round(totalRevenue * 0.4),
      fee: Math.round(totalRevenue * 0.04),
      net: Math.round(totalRevenue * 0.36),
      status: 'Settled',
      date: '8 Sep 2026'
    },
    {
      id: 'SETTL-8922',
      period: '8 Sep - 14 Sep 2026 (Current)',
      gross: Math.round(totalRevenue * 0.6),
      fee: Math.round(totalRevenue * 0.06),
      net: Math.round(totalRevenue * 0.54),
      status: 'Processing',
      date: '15 Sep 2026'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Revenue & Partner Settlements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial reconciliation, ticket sales gross volume, and weekly partner payouts.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
        >
          <Download size={14} />
          <span>Export Financial Statement</span>
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Gross Box Office Collection"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          change="Customer ticket sales"
          isPositive={true}
          icon={IndianRupee}
          loading={loading}
        />

        <MetricCard
          title="Platform & Gateway Fee (10%)"
          value={`₹${platformFee.toLocaleString('en-IN')}`}
          change="Transparent 10% rate"
          isPositive={false}
          icon={TrendingUp}
          loading={loading}
        />

        <MetricCard
          title="Net Partner Payout"
          value={`₹${netPayable.toLocaleString('en-IN')}`}
          change="Direct bank deposit"
          isPositive={true}
          icon={ShieldCheck}
          loading={loading}
        />
      </div>

      {/* Revenue By Movie Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart size={18} className="text-[#F84464]" />
              <span>Movie Box Office Performance</span>
            </CardTitle>
            <CardDescription>
              Earnings breakdown grouped by movie title.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {moviePerformance.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No movie revenue recorded yet.
              </p>
            ) : (
              moviePerformance.map((movie) => (
                <div key={movie.movieTitle} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-900">{movie.movieTitle}</span>
                    <span className="font-bold text-gray-900">
                      ₹{movie.revenue.toLocaleString('en-IN')}{' '}
                      <span className="text-gray-400 font-normal">({movie.sharePercentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F84464] rounded-full transition-all duration-300"
                      style={{ width: `${movie.sharePercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payout Banking Information */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 size={18} className="text-indigo-600" />
              <span>Direct Deposit Bank Details</span>
            </CardTitle>
            <CardDescription>
              Weekly settlement schedule: Every Tuesday.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Beneficiary Name:</span>
                <span className="font-semibold text-gray-900">CineWorld Multiplexes Ltd.</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Bank Account:</span>
                <span className="font-mono font-semibold text-gray-900">•••• •••• 9821</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">IFSC Code:</span>
                <span className="font-mono font-semibold text-gray-900">HDFC0001234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payout Status:</span>
                <Badge variant="success" className="text-[10px]">Active & Verified</Badge>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Payments are automatically credited to your verified nodal bank account via NEFT/RTGS.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settlement History Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="py-3.5 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-gray-900">
            Recent Settlement Statements
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Settlement ID</TableHead>
                <TableHead>Cycle Period</TableHead>
                <TableHead>Gross Sales</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Net Transferred</TableHead>
                <TableHead>Payout Status</TableHead>
                <TableHead>Settlement Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSettlements.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs font-bold text-gray-900">
                    {s.id}
                  </TableCell>
                  <TableCell className="text-xs text-gray-800">
                    {s.period}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-gray-900">
                    ₹{s.gross.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    ₹{s.fee.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-emerald-700">
                    ₹{s.net.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'Settled' ? 'success' : 'warning'} className="text-[10px]">
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {s.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
