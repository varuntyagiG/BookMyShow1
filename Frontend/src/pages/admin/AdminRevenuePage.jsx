import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  TrendingUp,
  IndianRupee,
  Building2,
  CheckCircle,
  Loader2,
  Download,
  Percent,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState(null);
  const [partnerSettlements, setPartnerSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      setLoading(true);
      try {
        const res = await adminApi.getRevenueOverview();
        if (res.success) {
          setRevenueData(res.revenue);
          setPartnerSettlements(res.partnerSettlements || []);
        }
      } catch (err) {
        console.error('Error fetching revenue:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, []);

  const handleExportCSV = () => {
    if (!partnerSettlements.length) return;
    const headers = ['Partner Organization', 'Email', 'Gross Revenue (INR)', 'Platform Fee (INR)', 'Net Payable (INR)', 'Total Bookings'];
    const rows = partnerSettlements.map((p) => [
      `"${p.partnerName}"`,
      `"${p.partnerEmail}"`,
      p.grossRevenue,
      p.convenienceFee,
      p.netPayable,
      p.bookingsCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bms_settlements_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <TrendingUp className="w-6 h-6 text-[#F84464]" />
            <span>Commercial Revenue &amp; Partner Settlements</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Platform convenience fee earnings, box office revenue splits, and cinema partner payout reconciliations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#222432] text-xs font-bold transition border border-[#EEEEF2] shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#F84464]" />
          <span>Export Settlements CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mx-auto mb-2" />
          <p className="text-xs">Computing platform financial statements...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Gross Collections */}
            <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
              <div className="w-full h-1.5 bg-slate-400 absolute top-0 left-0" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                Gross Booking Value (GBV)
              </span>
              <div className="text-3xl font-black text-[#222432] tracking-tight font-mono">
                ₹{(revenueData?.totalGross || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Accumulated across {revenueData?.totalBookings || 0} confirmed ticket bookings
              </p>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
              <div className="w-full h-1.5 bg-[#F84464] absolute top-0 left-0" />
              <span className="text-[10px] font-black text-[#F84464] uppercase tracking-wider block mb-1">
                Platform Revenue (Convenience Fees)
              </span>
              <div className="text-3xl font-black text-[#F84464] tracking-tight font-mono">
                ₹{(revenueData?.platformFee || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Platform service margin retained from booking transactions
              </p>
            </div>

            {/* Partner Box Office Share */}
            <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
              <div className="w-full h-1.5 bg-[#4ABD5D] absolute top-0 left-0" />
              <span className="text-[10px] font-black text-[#4ABD5D] uppercase tracking-wider block mb-1">
                Partner Box Office Share
              </span>
              <div className="text-3xl font-black text-[#4ABD5D] tracking-tight font-mono">
                ₹{(revenueData?.partnerShare || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Accredited box office earnings due to multiplex operators
              </p>
            </div>
          </div>

          {/* Partner Settlement Ledger */}
          <div className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EEEEF2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#222432] uppercase tracking-wider">
                  Partner Settlement &amp; Payout Audit Ledger
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Calculated net remittances owed to cinema operators</p>
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {partnerSettlements.length} Cinema Partners
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#222432]">
                <thead className="bg-[#F9F9FB] text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-[#EEEEF2]">
                  <tr>
                    <th className="px-5 py-3.5">Cinema Operator Circuit</th>
                    <th className="px-5 py-3.5">Billing Email</th>
                    <th className="px-5 py-3.5 text-center">Transactions</th>
                    <th className="px-5 py-3.5 text-right">Gross Collections</th>
                    <th className="px-5 py-3.5 text-right">Platform Fee Share</th>
                    <th className="px-5 py-3.5 text-right font-black text-[#4ABD5D]">Net Payable</th>
                    <th className="px-5 py-3.5 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF2] font-medium">
                  {partnerSettlements.length > 0 ? (
                    partnerSettlements.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-[#222432] flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{p.partnerName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                          {p.partnerEmail || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono">
                          {p.bookingsCount}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-[#222432]">
                          ₹{p.grossRevenue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-[#F84464] font-semibold">
                          ₹{p.convenienceFee.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-black text-[#4ABD5D] text-sm">
                          ₹{p.netPayable.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Reconciled
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-gray-400">
                        No partner settlements recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
