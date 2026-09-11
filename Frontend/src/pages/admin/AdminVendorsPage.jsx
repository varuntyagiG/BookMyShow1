import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Partner Governance & KYC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cinema Partner Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Review theatre owner onboarding licenses, verify bank details & enforce compliance
          </p>
        </div>

        <button
          onClick={() => fetchVendors()}
          className="self-start sm:self-auto p-2 bg-[#181D2D] hover:bg-[#22293E] text-gray-300 hover:text-white rounded-xl border border-[#2B344D] transition"
          title="Refresh List"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Partner name, Business name, Email or Phone..."
            className="w-full bg-[#121622] border border-[#23293C] focus:border-[#F84464] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'approved', 'pending', 'suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                statusFilter === tab
                  ? 'bg-[#F84464] text-white shadow-md shadow-[#F84464]/20'
                  : 'bg-[#121622] text-gray-400 hover:text-white border border-[#23293C]'
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
          <p className="text-xs text-gray-400">Loading Cinema Partners Catalog...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-12 text-center text-gray-400">
          <Building2 size={36} className="mx-auto text-gray-600 mb-3" />
          <p className="text-sm font-semibold text-gray-300">No cinema partners found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vendors.map((v) => {
            const isPending = v.verificationStatus === 'pending';
            const isApproved = v.verificationStatus === 'approved';
            const isSuspended = v.verificationStatus === 'suspended' || v.isDeactivated;

            return (
              <div
                key={v._id}
                className="bg-[#121622] border border-[#23293C] hover:border-[#2F3750] rounded-2xl p-5 shadow-lg transition flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              >
                {/* Partner Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A1F2E] to-[#252D40] border border-[#2F3750] flex items-center justify-center text-[#F84464] shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-white">
                        {v.businessName || v.name || 'Cinema Partner'}
                      </h3>
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isApproved && <CheckCircle2 size={10} />}
                        {isPending && <Clock size={10} />}
                        {isSuspended && <ShieldAlert size={10} />}
                        <span>{v.verificationStatus || (v.isDeactivated ? 'Suspended' : 'Approved')}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Operator: <span className="text-gray-300 font-semibold">{v.name}</span>
                    </p>

                    {/* Contact Pills */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-400">
                      <span className="flex items-center gap-1.5 bg-[#181D2D] px-2.5 py-1 rounded-lg border border-[#242C3E]">
                        <Mail size={12} className="text-gray-500" />
                        <span>{v.email}</span>
                      </span>
                      {v.phone && (
                        <span className="flex items-center gap-1.5 bg-[#181D2D] px-2.5 py-1 rounded-lg border border-[#242C3E]">
                          <Phone size={12} className="text-gray-500" />
                          <span>{v.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aggregate Infrastructure Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-[#20273C] lg:px-6">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-black text-white">{v.cinemaCount || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500">Venues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-black text-white">{v.screenCount || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500">Screens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-black text-white">{v.showCount || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500">Shows</div>
                  </div>
                </div>

                {/* Operations & KYC Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {!isApproved && (
                    <button
                      onClick={() => handleUpdateStatus(v._id, 'approved')}
                      disabled={actionLoading === v._id}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve KYC</span>
                    </button>
                  )}

                  {!isSuspended && (
                    <button
                      onClick={() => handleUpdateStatus(v._id, 'suspended')}
                      disabled={actionLoading === v._id}
                      className="inline-flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition disabled:opacity-50"
                    >
                      <ShieldAlert size={14} />
                      <span>Suspend</span>
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => handleUpdateStatus(v._id, 'approved')}
                      disabled={actionLoading === v._id}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      <span>Reinstate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
