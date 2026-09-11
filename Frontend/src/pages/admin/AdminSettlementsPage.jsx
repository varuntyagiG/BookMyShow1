import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Landmark,
  Building2,
  DollarSign,
  Percent,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  X,
  CreditCard,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disbursingPartner, setDisbursingPartner] = useState(null);
  const [utrInput, setUtrInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettlements();
      if (res.success && res.data) {
        setSettlements(res.data);
      }
    } catch (err) {
      console.error('Failed to load settlements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const handleOpenDisburse = (s) => {
    setDisbursingPartner(s);
    setUtrInput(`UTR-BMS-${Date.now().toString().slice(-6)}-${s.partnerId.slice(-4).toUpperCase()}`);
  };

  const handleDisburseSubmit = async (e) => {
    e.preventDefault();
    if (!disbursingPartner) return;
    setSubmitting(true);
    try {
      const res = await adminApi.disburseSettlement(disbursingPartner.partnerId, {
        utrNumber: utrInput,
        amount: disbursingPartner.netDisbursable
      });
      if (res.success) {
        setToastMessage(`Disbursed ₹${Number(disbursingPartner.netDisbursable).toLocaleString('en-IN')} under ${utrInput}`);
        setDisbursingPartner(null);
        setTimeout(() => setToastMessage(null), 4000);
        fetchSettlements();
      }
    } catch (err) {
      alert(err.message || 'Failed to authorize disbursement');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregates
  const totalGross = settlements.reduce((acc, s) => acc + (s.grossRevenue || 0), 0);
  const totalPlatformCut = settlements.reduce((acc, s) => acc + (s.platformFee || 0), 0);
  const totalNetPayable = settlements.reduce((acc, s) => acc + (s.netDisbursable || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Nodal Bank Escrow & Disbursal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Financial Settlements & Wire Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Automated gross ticket reconciliation, 10% platform fee deduction & direct RTGS/NEFT theatre payouts
          </p>
        </div>

        <button
          onClick={() => fetchSettlements()}
          className="self-start sm:self-auto p-2 bg-[#181D2D] hover:bg-[#22293E] text-gray-300 hover:text-white rounded-xl border border-[#2B344D] transition"
          title="Refresh List"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
        </button>
      </div>

      {/* Nodal Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Total Gateway Inflow
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{loading ? '---' : totalGross.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Gross admissions across partner theatres</p>
        </div>

        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Platform Retained Fee (10%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{loading ? '---' : totalPlatformCut.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">BookMyTrip convenience earnings</p>
        </div>

        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            Net Disbursable to Partners
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            ₹{loading ? '---' : totalNetPayable.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Scheduled for Tuesday bank wire</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-[#121622] border border-[#23293C] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Reconciling Nodal Escrow Ledgers...</p>
          </div>
        ) : settlements.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Landmark size={36} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No partner settlements on file</p>
            <p className="text-xs text-gray-500 mt-1">Partners will appear here as bookings are generated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181D2D] text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-[#23293C]">
                <tr>
                  <th className="px-4 py-3.5">Theatre Partner</th>
                  <th className="px-4 py-3.5">Bookings</th>
                  <th className="px-4 py-3.5">Gross Ticket Sales</th>
                  <th className="px-4 py-3.5">Platform Cut (10%)</th>
                  <th className="px-4 py-3.5">Gateway Fee (2%)</th>
                  <th className="px-4 py-3.5">Net Disbursable</th>
                  <th className="px-4 py-3.5">Settlement Cycle</th>
                  <th className="px-4 py-3.5 text-right">Wire Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20273C]">
                {settlements.map((s) => (
                  <tr key={s.partnerId} className="hover:bg-[#181D2D]/60 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm">{s.partnerName}</div>
                      <div className="text-[11px] text-gray-500">{s.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-200">
                      {s.totalBookingsCount}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white">
                      ₹{s.grossRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-emerald-400 font-bold">
                      -₹{s.platformFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-rose-400">
                      -₹{s.gatewayFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-black text-blue-400 text-sm">
                      ₹{s.netDisbursable.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[11px] text-gray-300">{s.settlementCycle}</div>
                      <span className="text-[9px] font-mono text-gray-500">{s.utrNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {s.netDisbursable > 0 ? (
                        <button
                          onClick={() => handleOpenDisburse(s)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl shadow-md shadow-blue-600/20 transition"
                        >
                          <Landmark size={13} />
                          <span>Authorize Wire</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">No Activity</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disburse Wire Modal */}
      {disbursingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121622] border border-[#23293C] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#23293C]">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Landmark size={18} className="text-blue-400" />
                <span>Authorize Nodal Bank Wire</span>
              </h2>
              <button
                onClick={() => setDisbursingPartner(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisburseSubmit} className="mt-4 space-y-4">
              <div className="p-3.5 bg-[#181D2D] rounded-xl border border-[#2B344D] text-xs text-gray-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient Partner:</span>
                  <span className="font-bold text-white">{disbursingPartner.partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Net Payable Amount:</span>
                  <span className="font-black text-blue-400 text-sm">
                    ₹{disbursingPartner.netDisbursable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Routing Protocol:</span>
                  <span>RBI Escrow RTGS / NEFT</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Unique Transaction Reference (UTR) Number *
                </label>
                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisbursingPartner(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-[#181D2D] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Executing...' : 'Disburse Wire Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
