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
    const pid = String(s.partnerId || s._id || s.id || '');
    setUtrInput(`UTR-BMS-${Date.now().toString().slice(-6)}-${pid.slice(-4).toUpperCase()}`);
  };

  const handleDisburseSubmit = async (e) => {
    e.preventDefault();
    if (!disbursingPartner) return;
    setSubmitting(true);
    try {
      const pid = disbursingPartner.partnerId || disbursingPartner._id || disbursingPartner.id;
      const res = await adminApi.disburseSettlement(pid, {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Nodal Bank Escrow & Disbursal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Financial Settlements & Wire Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Automated gross ticket reconciliation, 10% platform fee deduction & direct RTGS/NEFT theatre payouts
          </p>
        </div>

        <button
          onClick={() => fetchSettlements()}
          className="self-start sm:self-auto p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-300 shadow-sm transition"
          title="Refresh List"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
        </button>
      </div>

      {/* Nodal Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Total Gateway Inflow
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            ₹{loading ? '---' : totalGross.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Gross admissions across partner theatres</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            Platform Retained Fee (10%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            ₹{loading ? '---' : totalPlatformCut.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">BookMyTrip convenience earnings</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Net Disbursable to Partners
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            ₹{loading ? '---' : totalNetPayable.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Scheduled for weekly bank wire</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Reconciling Nodal Escrow Ledgers...</p>
          </div>
        ) : settlements.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Landmark size={36} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No partner settlements on file</p>
            <p className="text-xs text-gray-500 mt-1">Partners will appear here as bookings are generated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-100">
                {settlements.map((s) => (
                  <tr key={s.partnerId || s._id || s.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 text-sm">{s.partnerName}</div>
                      <div className="text-[11px] text-gray-500">{s.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {s.totalBookingsCount}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      ₹{s.grossRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">
                      -₹{s.platformFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-rose-600">
                      -₹{s.gatewayFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-black text-blue-700 text-sm">
                      ₹{s.netDisbursable.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[11px] text-gray-800">{s.settlementCycle}</div>
                      <span className="text-[9px] font-mono text-gray-500">{s.utrNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {s.netDisbursable > 0 ? (
                        <button
                          onClick={() => handleOpenDisburse(s)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <Landmark size={13} />
                          <span>Authorize Wire</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No Activity</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Landmark size={18} className="text-blue-600" />
                <span>Authorize Nodal Bank Wire</span>
              </h2>
              <button
                onClick={() => setDisbursingPartner(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisburseSubmit} className="mt-4 space-y-4">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient Partner:</span>
                  <span className="font-bold text-gray-900">{disbursingPartner.partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Net Payable Amount:</span>
                  <span className="font-black text-blue-700 text-sm">
                    ₹{disbursingPartner.netDisbursable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Routing Protocol:</span>
                  <span>RBI Escrow RTGS / NEFT</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Unique Transaction Reference (UTR) Number *
                </label>
                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-xl text-xs outline-none focus:border-blue-600 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisbursingPartner(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
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
