import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { vendorApi } from '../../services/vendorApi';
import {
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
  ShieldCheck,
  CreditCard,
  Clock,
  Printer
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
      {/* 1. Header Card (Admin Theme) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F84464] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#F84464] font-mono">
              Live Settlement Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#333545] tracking-tight">
            Revenue & Partner Settlements
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Financial reconciliation, ticket sales gross volume, automated nodal clearance, and weekly partner payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-gray-700 border-gray-300 shadow-2xs hover:bg-gray-50"
          >
            <Printer size={14} className="text-gray-500" />
            <span>Print Report</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#F84464] hover:bg-[#E03A58] text-white shadow-sm"
          >
            <Download size={14} />
            <span>Export Statement</span>
          </Button>
        </div>
      </div>

      {/* 2. Senior Executive Telemetry KPI Cards (4 Cards Admin Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Gross Box Office */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#F84464] before:to-rose-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gross Box Office</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#F84464] flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-sans">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span>
            <span>Customer ticket volume</span>
          </div>
        </motion.div>

        {/* Metric 2: Platform Fee */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-indigo-500 before:to-violet-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Platform & Gateway Fee</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-sans">
              ₹{platformFee.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              10%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Transparent technology & gateway fee
          </div>
        </motion.div>

        {/* Metric 3: Net Partner Payout */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Net Partner Payout</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight font-sans">
              ₹{netPayable.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Direct nodal bank disbursement
          </div>
        </motion.div>

        {/* Metric 4: Active Cycle */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-orange-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Settlement Schedule</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900 tracking-tight font-sans">
              Weekly T+2
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Next clearing on Tuesday
          </div>
        </motion.div>
      </div>

      {/* 3. Revenue By Movie Breakdown & Bank Settlement Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box Office Performance Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#333545] flex items-center gap-2">
                <PieChart size={18} className="text-[#F84464]" />
                <span>Movie Box Office Performance</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Earnings distribution grouped by movie title.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400 font-mono">
              {moviePerformance.length} Titles
            </span>
          </div>

          <div className="space-y-4 pt-4">
            {moviePerformance.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center font-medium">
                No movie revenue recorded yet.
              </p>
            ) : (
              moviePerformance.map((movie) => (
                <div key={movie.movieTitle} className="space-y-2 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#333545]">{movie.movieTitle}</span>
                    <span className="font-mono font-bold text-gray-900">
                      ₹{movie.revenue.toLocaleString('en-IN')}{' '}
                      <span className="text-gray-400 font-sans font-normal text-[11px]">({movie.sharePercentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#F84464] to-rose-400 rounded-full transition-all duration-500"
                      style={{ width: `${movie.sharePercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payout Banking Information Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#333545] flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-600" />
                  <span>Direct Deposit Bank Details</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified nodal account for weekly bank transfers.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active & Verified
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="p-4 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Beneficiary Name:</span>
                  <span className="font-bold text-gray-900">CineWorld Multiplexes Ltd.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Bank Account:</span>
                  <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">•••• •••• 9821</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">IFSC Code:</span>
                  <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">HDFC0001234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Transfer Mode:</span>
                  <span className="font-bold text-gray-800">NEFT / RTGS Direct Clearing</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-indigo-900 text-xs">
                <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Payments are automatically credited to your verified nodal bank account via Reserve Bank automated clearing on scheduled settlement days.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Settlement Cycle: Every Tuesday</span>
            <span className="font-mono text-[11px] text-gray-400">T+2 Settlement Rule</span>
          </div>
        </div>
      </div>

      {/* 4. Settlement History Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="py-4 px-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#333545]">Recent Settlement Statements</h3>
            <p className="text-xs text-gray-500 mt-0.5">Historical breakdown of previous payout disbursement batches.</p>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
            {mockSettlements.length} Statements
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <TableHead className="py-3 px-4">Settlement ID</TableHead>
                <TableHead className="py-3 px-4">Cycle Period</TableHead>
                <TableHead className="py-3 px-4">Gross Sales</TableHead>
                <TableHead className="py-3 px-4">Platform Fee (10%)</TableHead>
                <TableHead className="py-3 px-4">Net Transferred</TableHead>
                <TableHead className="py-3 px-4">Payout Status</TableHead>
                <TableHead className="py-3 px-4">Settlement Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSettlements.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50/70 border-b border-gray-100 text-xs">
                  <TableCell className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                      {s.id}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-gray-800 font-medium">
                    {s.period}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 font-semibold text-gray-900">
                    ₹{s.gross.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-gray-500">
                    ₹{s.fee.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 font-bold text-emerald-700">
                    ₹{s.net.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        s.status === 'Settled'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {s.status === 'Settled' && <CheckCircle2 size={10} />}
                      <span>{s.status}</span>
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                    {s.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
