import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  Film,
  Tv,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getVendors({ search, status: statusFilter });
      if (res.success && res.data) {
        setVendors(res.data);
      }
    } catch (err) {
      console.error('Failed to load cinema partners:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['VENDOR_STATUS_MUTATION'], () => {
    fetchVendors();
  });

  const handleUpdateStatus = async (vendorId, newStatus) => {
    try {
      setActionLoading(vendorId);
      const res = await adminApi.updateVendorStatus(vendorId, {
        status: newStatus,
        verificationRemarks: `Updated by Platform Super Admin on ${new Date().toLocaleDateString()}`
      });
      if (res.success) {
        setToastMessage(`Partner status updated to ${newStatus.toUpperCase()}`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchVendors();
      }
    } catch (err) {
      alert(err.message || 'Failed to update partner verification status');
    } finally {
      setActionLoading(null);
    }
  };

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
            <Building2 size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Partner Governance & KYC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Cinema Partner Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Review theatre owner onboarding licenses, verify bank details & enforce compliance
          </p>
        </div>

        <button
          onClick={() => fetchVendors()}
          className="self-start sm:self-auto p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-300 shadow-sm transition"
          title="Refresh List"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Partner name, Business name, Email or Phone..."
            className="w-full bg-white border border-gray-300 focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-400 outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'approved', 'pending', 'suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                statusFilter === tab
                  ? 'bg-[#F84464] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading Cinema Partners Catalog...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
          <Building2 size={36} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No cinema partners found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vendors.map((v) => {
            const isPending = v.verificationStatus === 'pending';
            const isApproved = v.verificationStatus === 'approved';
            const isSuspended = v.verificationStatus === 'suspended' || v.isDeactivated;

            return (
              <motion.div
                key={v._id || v.id}
                whileHover={{ y: -3, scale: 1.008 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              >
                {/* Partner Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/80 border border-rose-200/80 flex items-center justify-center text-[#F84464] shrink-0 shadow-xs">
                    <Building2 size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {v.businessName || v.name || 'Cinema Partner'}
                      </h3>
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : 'bg-rose-50 text-rose-700 border-rose-200/80'
                        }`}
                      >
                        {isApproved && <CheckCircle2 size={11} />}
                        {isPending && <Clock size={11} />}
                        {isSuspended && <ShieldAlert size={11} />}
                        <span>{v.verificationStatus || (v.isDeactivated ? 'Suspended' : 'Approved')}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Primary Operator: <span className="text-slate-800 font-bold">{v.name}</span>
                    </p>

                    {/* Contact Pills */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/80 font-medium">
                        <Mail size={12} className="text-slate-400" />
                        <span>{v.email}</span>
                      </span>
                      {v.phone && (
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/80 font-medium">
                          <Phone size={12} className="text-slate-400" />
                          <span>{v.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aggregate Infrastructure Stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 py-3 lg:py-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 px-6">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-black text-slate-900">{v.cinemaCount || v.cinemasCount || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Venues</div>
                  </div>
                  <div className="text-center border-x border-slate-200/80 px-4">
                    <div className="text-base sm:text-lg font-black text-slate-900">{v.screenCount || v.screensCount || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Screens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-black text-slate-900">{v.showCount || v.activeShowsCount || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shows</div>
                  </div>
                </div>

                {/* Operations & KYC Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {!isApproved && (
                    <button
                      onClick={() => handleUpdateStatus(v._id || v.id, 'approved')}
                      disabled={actionLoading === (v._id || v.id)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve KYC</span>
                    </button>
                  )}

                  {!isSuspended && (
                    <button
                      onClick={() => handleUpdateStatus(v._id || v.id, 'suspended')}
                      disabled={actionLoading === (v._id || v.id)}
                      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldAlert size={14} />
                      <span>Suspend</span>
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => handleUpdateStatus(v._id || v.id, 'approved')}
                      disabled={actionLoading === (v._id || v.id)}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Reinstate</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
