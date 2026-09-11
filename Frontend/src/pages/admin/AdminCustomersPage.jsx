import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  X,
  Ticket,
  IndianRupee,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  PageHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Input,
  Select,
  ConfirmModal,
  EmptyState,
  SkeletonTableRows,
  CopyBadge,
  CopyButton
} from '../../components/ui';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Slide-over detail drawer state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Status toggle confirmation modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    customer: null,
    loading: false
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        search,
        status: statusFilter,
        page,
        limit: 15
      });
      if (res.success) {
        setCustomers(res.customers || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, page]);

  const handleOpenDetail = async (customerId) => {
    setDrawerLoading(true);
    try {
      const res = await adminApi.getCustomerById(customerId);
      if (res.success) {
        setSelectedCustomer(res.customer);
        setCustomerBookings(res.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer profile:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleConfirmStatusToggle = async () => {
    const customer = statusModal.customer;
    if (!customer) return;

    const isDeactivating = !customer.isDeactivated;
    setStatusModal((prev) => ({ ...prev, loading: true }));

    try {
      const res = await adminApi.updateCustomerStatus(customer._id || customer.id, {
        isDeactivated: isDeactivating,
        reason: isDeactivating ? 'Administrative account deactivation' : 'Account restored by platform admin'
      });

      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            (c._id === customer._id || c.id === customer.id)
              ? { ...c, isDeactivated: isDeactivating }
              : c
          )
        );
        if (selectedCustomer && (selectedCustomer._id === customer._id || selectedCustomer.id === customer.id)) {
          setSelectedCustomer((prev) => ({ ...prev, isDeactivated: isDeactivating }));
        }
        setStatusModal({ isOpen: false, customer: null, loading: false });
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Customer Governance"
        subtitle="Oversight of consumer profiles, active bookings, ticket spends, and security account statuses."
        icon={Users}
        badge="Accounts"
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by customer name, email, or phone..."
              icon={Search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Customer Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'deactivated', label: 'Deactivated Only' }
              ]}
              wrapperClassName="w-full sm:w-56"
            />
          </div>
        </div>
      </Card>

      {/* Main Customers Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Phone</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Lifetime Spend</TableHead>
              <TableHead>Registered Date</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonTableRows rows={8} cols={7} />
            ) : customers.length > 0 ? (
              customers.map((c) => (
                <TableRow key={c._id || c.id} className="transition-colors hover:bg-[#F84464]/5">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#F84464] font-black text-xs flex items-center justify-center shrink-0 border border-red-100">
                        {c.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#222432] truncate">{c.name}</div>
                        <div className="text-[11px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{c.email}</span>
                          {c.email && (
                            <CopyButton text={c.email} size="xs" variant="ghost" title="Copy email" />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{c.phone || '—'}</span>
                      {c.phone && (
                        <CopyButton text={c.phone} size="xs" variant="ghost" title="Copy phone" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-[#222432]">{c.bookingsCount || 0}</span>
                  </TableCell>
                  <TableCell className="font-black text-[#222432]">
                    ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-[11px]">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isDeactivated ? 'inactive' : 'active'} dot>
                      {c.isDeactivated ? 'Deactivated' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenDetail(c._id || c.id)}
                      >
                        Profile
                      </Button>

                      <Button
                        variant={c.isDeactivated ? 'secondary' : 'destructive'}
                        size="xs"
                        onClick={() => setStatusModal({ isOpen: true, customer: c, loading: false })}
                      >
                        {c.isDeactivated ? 'Activate' : 'Deactivate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow hover={false}>
                <TableCell colSpan={7} className="py-12">
                  <EmptyState
                    icon={Users}
                    title="No Customers Found"
                    description="No customer records match your filter criteria."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          onPageChange={setPage}
        />
      </Card>

      {/* Slide-over Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#F84464] to-[#E03A58] text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {selectedCustomer.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#222432]">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-gray-500 font-mono">{selectedCustomer.email}</span>
                    {selectedCustomer.email && (
                      <CopyButton text={selectedCustomer.email} size="xs" variant="ghost" title="Copy email" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Quick Profile Overview Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Bookings</div>
                  <div className="text-lg font-black text-[#222432] mt-0.5">{selectedCustomer.bookingsCount || 0}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lifetime Spend</div>
                  <div className="text-lg font-black text-[#222432] mt-0.5">₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedCustomer.isDeactivated ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div>
                  <div className="text-xs font-bold">
                    Account Status: {selectedCustomer.isDeactivated ? 'Deactivated' : 'Active & Verified'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {selectedCustomer.isDeactivated ? 'Login and ticket purchases restricted' : 'Customer has full portal access'}
                  </div>
                </div>

                <Button
                  variant={selectedCustomer.isDeactivated ? 'primary' : 'destructive'}
                  size="xs"
                  onClick={() => setStatusModal({ isOpen: true, customer: selectedCustomer, loading: false })}
                >
                  {selectedCustomer.isDeactivated ? 'Activate' : 'Deactivate'}
                </Button>
              </div>

              {/* Recent Bookings History */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Transaction Ledger ({customerBookings.length})
                </h4>

                {customerBookings.length > 0 ? (
                  customerBookings.map((b) => (
                    <div key={b._id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5 hover:bg-white transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#222432]">{b.movieTitle || 'Movie Ticket'}</span>
                        <span className="font-black text-xs text-[#222432]">₹{(b.totalAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{b.theatreName || 'Multiplex Venue'}</span>
                        <div className="flex items-center gap-2">
                          {b.bookingId && (
                            <CopyBadge text={b.bookingId} size="xs" />
                          )}
                          <Badge variant={b.bookingStatus === 'confirmed' ? 'active' : 'cancelled'} size="xs">
                            {b.bookingStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No previous bookings found for this customer.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, customer: null, loading: false })}
        onConfirm={handleConfirmStatusToggle}
        title={statusModal.customer?.isDeactivated ? 'Reactivate Customer Account' : 'Deactivate Customer Account'}
        description={
          statusModal.customer?.isDeactivated
            ? `Reactivate account for "${statusModal.customer?.name}"? They will regain full access to book tickets and sign in.`
            : `Are you sure you want to deactivate "${statusModal.customer?.name}"? Their session will be revoked and they cannot book tickets.`
        }
        confirmText={statusModal.customer?.isDeactivated ? 'Reactivate' : 'Deactivate Account'}
        variant={statusModal.customer?.isDeactivated ? 'primary' : 'destructive'}
        loading={statusModal.loading}
      />
    </div>
  );
}
