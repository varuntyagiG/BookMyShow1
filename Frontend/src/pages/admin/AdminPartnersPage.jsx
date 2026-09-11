import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Tv,
  Store,
  Calendar,
  IndianRupee,
  X,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Drawer State
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerCinemas, setPartnerCinemas] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Status Action Modal State
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    partner: null,
    nextStatus: '',
    reason: '',
    submitting: false
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPartners({ search, status: statusFilter });
      if (res.success) {
        setPartners(res.partners || []);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [search, statusFilter]);

  const handleOpenDetail = async (partnerId) => {
    setDrawerLoading(true);
    try {
      const res = await adminApi.getPartnerById(partnerId);
      if (res.success) {
        setSelectedPartner(res.partner);
        setPartnerCinemas(res.cinemas || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to load partner details.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModal.partner || !statusModal.nextStatus) return;

    setStatusModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await adminApi.updatePartnerStatus(
        statusModal.partner._id || statusModal.partner.id,
        {
          partnerStatus: statusModal.nextStatus,
          reason: statusModal.reason || 'Administrative decision'
        }
      );

      if (res.success) {
        setPartners((prev) =>
          prev.map((p) =>
            (p._id === statusModal.partner._id || p.id === statusModal.partner.id)
              ? { ...p, partnerStatus: statusModal.nextStatus }
              : p
          )
        );
        if (selectedPartner && (selectedPartner._id === statusModal.partner._id)) {
          setSelectedPartner((prev) => ({ ...prev, partnerStatus: statusModal.nextStatus }));
        }
        setStatusModal({ isOpen: false, partner: null, nextStatus: '', reason: '', submitting: false });
      }
    } catch (err) {
      alert(err.message || 'Failed to update partner status.');
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            <span>Cinema Partners &amp; Multiplex Operators</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review operator applications, enforce partner suspension policies, and audit multiplex circuits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#222432] bg-white px-3.5 py-2 rounded-xl border border-[#EEEEF2] shadow-xs">
            Total Partners: {partners.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500">Lifecycle:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
          >
            <option value="all">All Lifecycle States</option>
            <option value="active">Active Operators</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended Operators</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#222432]">
            <thead className="bg-[#F9F9FB] border-b border-[#EEEEF2] text-gray-400 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cinema Operator / Circuit</th>
                <th className="px-5 py-3.5">Official Contact</th>
                <th className="px-5 py-3.5 text-center">Cinemas</th>
                <th className="px-5 py-3.5 text-center">Screens</th>
                <th className="px-5 py-3.5 text-right">Gross Box Office</th>
                <th className="px-5 py-3.5 text-center">Lifecycle Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEF2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#F84464] animate-spin mx-auto mb-2" />
                    <span>Loading cinema partner network...</span>
                  </td>
                </tr>
              ) : partners.length > 0 ? (
                partners.map((partner) => {
                  const status = partner.partnerStatus || 'active';
                  return (
                    <tr key={partner._id} className="hover:bg-gray-50/80 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#222432] flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs border border-amber-200">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[#222432] leading-tight">
                              {partner.businessName || partner.name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-normal">{partner.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[#222432] font-medium">{partner.email}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{partner.phone || partner.partnerPhone || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-bold text-[#222432] bg-gray-100 px-2.5 py-0.5 rounded-md">
                          {partner.cinemasCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md">
                          {partner.screensCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-[#222432]">
                        ₹{(partner.grossRevenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            status === 'active' || status === 'approved'
                              ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                              : status === 'suspended'
                              ? 'bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDetail(partner._id)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#222432] rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Properties
                        </button>
                        {status === 'suspended' ? (
                          <button
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                partner,
                                nextStatus: 'active',
                                reason: 'Restoration of operations',
                                submitting: false
                              })
                            }
                            className="px-2.5 py-1 bg-[#4ABD5D]/10 hover:bg-[#4ABD5D] text-[#4ABD5D] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                partner,
                                nextStatus: 'suspended',
                                reason: '',
                                submitting: false
                              })
                            }
                            className="px-2.5 py-1 bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    No cinema partners found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Inspection Slide-Over */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border-l border-[#EEEEF2] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-base font-black text-[#222432]">Partner Multiplex Portfolio</h3>
                  <p className="text-xs text-gray-400">{selectedPartner.businessName}</p>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-1.5 text-gray-400 hover:text-[#222432] hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Partner Summary Card */}
              <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2] mb-6 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Account Owner:</span>
                  <strong className="text-[#222432]">{selectedPartner.name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-mono text-[#222432]">{selectedPartner.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Business Address:</span>
                  <span className="text-right text-gray-600 max-w-xs">{selectedPartner.businessAddress || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/70">
                  <span className="text-gray-500">Gross Collections:</span>
                  <span className="font-mono font-black text-[#4ABD5D] text-sm">
                    ₹{(selectedPartner.grossRevenue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Managed Venues */}
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                Managed Cinema Multiplexes ({partnerCinemas.length})
              </h4>

              <div className="space-y-3">
                {partnerCinemas.length > 0 ? (
                  partnerCinemas.map((c) => (
                    <div key={c._id} className="p-4 rounded-2xl bg-white border border-[#EEEEF2] text-xs shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#222432] text-sm">{c.name}</span>
                        <span className="text-[10px] font-bold text-[#F84464] bg-[#F84464]/10 px-2 py-0.5 rounded">
                          {c.city}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{c.address}</p>
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                        <span>Facilities: {c.facilities?.join(', ') || 'Standard'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center">No cinemas added yet by this partner.</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedPartner(null)}
                className="w-full py-2.5 bg-[#333545] hover:bg-[#222432] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Portfolio Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Status Modification Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-black text-[#222432] mb-1">
              Confirm Partner Lifecycle Transition
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Setting partner status to <strong className="text-[#F84464] uppercase">{statusModal.nextStatus}</strong> for{' '}
              <span className="text-[#222432] font-bold">{statusModal.partner?.businessName}</span>.
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Administrative Reason / Compliance Notes
                </label>
                <textarea
                  rows="3"
                  value={statusModal.reason}
                  onChange={(e) => setStatusModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Provide audit reason (e.g. routine audit passed, policy violation, maintenance)..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModal({ isOpen: false, partner: null, nextStatus: '', reason: '', submitting: false })}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#222432] rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusModal.submitting}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition text-white shadow-lg cursor-pointer ${
                    statusModal.nextStatus === 'suspended'
                      ? 'bg-[#F84464] hover:bg-[#E03A58] shadow-[#F84464]/30'
                      : 'bg-[#4ABD5D] hover:bg-[#3ea14f] shadow-[#4ABD5D]/30'
                  }`}
                >
                  {statusModal.submitting ? 'Applying...' : 'Confirm Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

