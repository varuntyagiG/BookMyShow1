import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Store,
  Calendar,
  IndianRupee,
  X,
  ShieldCheck,
  Tv,
  ArrowRight
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  PageHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  Modal,
  EmptyState,
  SkeletonTableRows,
  CopyBadge,
  CopyButton
} from '../../components/ui';

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
      console.error('Failed to load partner details:', err);
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
      console.error('Failed to update partner status:', err);
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Cinema Partners &amp; Vendors"
        subtitle="Review commercial theatre partners, onboarding lifecycle approvals, and active multiplex footprints."
        icon={Building2}
        badge="B2B Network"
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search partner, business name, or email..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Partner Statuses' },
                { value: 'approved', label: 'Approved & Active' },
                { value: 'pending', label: 'Pending Onboarding' },
                { value: 'suspended', label: 'Suspended' }
              ]}
              wrapperClassName="w-full sm:w-56"
            />
          </div>
        </div>
      </Card>

      {/* Partners Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Partner Company</TableHead>
              <TableHead>Representative</TableHead>
              <TableHead>Cinemas</TableHead>
              <TableHead>Total Screens</TableHead>
              <TableHead>Gross Box Office</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonTableRows rows={6} cols={7} />
            ) : partners.length > 0 ? (
              partners.map((p) => {
                const isPending = p.partnerStatus === 'pending';
                const isSuspended = p.partnerStatus === 'suspended';
                const isApproved = p.partnerStatus === 'approved' || p.partnerStatus === 'active';

                return (
                  <TableRow key={p._id || p.id} className="transition-colors hover:bg-[#F84464]/5">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 font-black text-xs flex items-center justify-center shrink-0 border border-amber-100">
                          {p.businessName?.[0]?.toUpperCase() || p.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#222432] truncate">
                            {p.businessName || p.name}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{p.email}</span>
                            {p.email && (
                              <CopyButton text={p.email} size="xs" variant="ghost" title="Copy partner email" />
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-600">
                      {p.name || '—'}
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-[#222432]">{p.cinemasCount || 0}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-[#222432]">{p.screensCount || 0}</span>
                    </TableCell>

                    <TableCell className="font-black text-[#222432]">
                      ₹{(p.grossRevenue || 0).toLocaleString('en-IN')}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={isApproved ? 'approved' : isPending ? 'pending' : 'suspended'}
                        dot
                      >
                        {p.partnerStatus || 'Pending'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenDetail(p._id || p.id)}
                        >
                          Audit
                        </Button>

                        {isPending && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                partner: p,
                                nextStatus: 'approved',
                                reason: '',
                                submitting: false
                              })
                            }
                          >
                            Approve
                          </Button>
                        )}

                        {isApproved && (
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                partner: p,
                                nextStatus: 'suspended',
                                reason: '',
                                submitting: false
                              })
                            }
                          >
                            Suspend
                          </Button>
                        )}

                        {isSuspended && (
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                partner: p,
                                nextStatus: 'approved',
                                reason: '',
                                submitting: false
                              })
                            }
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow hover={false}>
                <TableCell colSpan={7} className="py-12">
                  <EmptyState
                    icon={Building2}
                    title="No Cinema Partners Found"
                    description="No partner records match your filter criteria."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Slide-Over Drawer */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedPartner(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {selectedPartner.businessName?.[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#222432]">{selectedPartner.businessName || selectedPartner.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-gray-500 font-mono">{selectedPartner.email}</span>
                    {selectedPartner.email && (
                      <CopyButton text={selectedPartner.email} size="xs" variant="ghost" title="Copy email" />
                    )}
                  </div>
                  {selectedPartner._id && (
                    <div className="mt-1">
                      <CopyBadge text={`PTR-${selectedPartner._id.slice(-6).toUpperCase()}`} size="xs" variant="neutral" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Multiplexes</div>
                  <div className="text-lg font-black text-[#222432] mt-0.5">{selectedPartner.cinemasCount || 0}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Managed Screens</div>
                  <div className="text-lg font-black text-[#222432] mt-0.5">{selectedPartner.screensCount || 0}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Venues Under Management ({partnerCinemas.length})
                </h4>

                {partnerCinemas.length > 0 ? (
                  partnerCinemas.map((c) => (
                    <div key={c._id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#222432]">{c.name}</div>
                        <div className="text-[11px] text-gray-500">{c.city} • {c.address}</div>
                      </div>
                      <Badge variant={c.status === 'active' ? 'active' : 'inactive'} size="xs">
                        {c.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No cinemas registered by this partner yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Status Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, partner: null, nextStatus: '', reason: '', submitting: false })}
        title={statusModal.nextStatus === 'approved' ? 'Approve Cinema Partner' : 'Suspend Cinema Partner'}
        subtitle={`Update operational authorization for "${statusModal.partner?.businessName || statusModal.partner?.name}"`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <Input
            label="Administrative Reason / Notes"
            placeholder="E.g. Document verification completed, commercial terms accepted."
            value={statusModal.reason}
            onChange={(e) => setStatusModal((prev) => ({ ...prev, reason: e.target.value }))}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setStatusModal({ isOpen: false, partner: null, nextStatus: '', reason: '', submitting: false })}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant={statusModal.nextStatus === 'approved' ? 'primary' : 'destructive'}
              loading={statusModal.submitting}
            >
              Confirm {statusModal.nextStatus === 'approved' ? 'Approval' : 'Suspension'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
