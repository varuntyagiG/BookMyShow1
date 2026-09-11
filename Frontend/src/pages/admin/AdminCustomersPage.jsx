import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  Ticket,
  IndianRupee,
  X,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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

  // Status toggle confirmation
  const [actionLoading, setActionLoading] = useState(false);

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
      alert(err.message || 'Failed to fetch customer profile.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    const isDeactivating = !customer.isDeactivated;
    const confirmMsg = isDeactivating
      ? `Are you sure you want to deactivate customer "${customer.name}"? They will not be able to log in or book tickets.`
      : `Reactivate customer "${customer.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await adminApi.updateCustomerStatus(customer._id || customer.id, {
        isDeactivated: isDeactivating,
        reason: isDeactivating ? 'Administrative deactivation' : 'Account restored'
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
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#F84464]" />
            <span>Customer Directory &amp; Governance</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Search, inspect transaction histories, and manage consumer account access across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-bold text-[#222432] font-mono bg-white px-3.5 py-2 rounded-xl border border-[#EEEEF2] shadow-xs">
            Total Customers: {pagination.total}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Accounts</option>
            <option value="deactivated">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#222432]">
            <thead className="bg-[#F9F9FB] border-b border-[#EEEEF2] text-gray-400 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer Name &amp; Email</th>
                <th className="px-5 py-3.5">Mobile Phone</th>
                <th className="px-5 py-3.5 text-center">Bookings</th>
                <th className="px-5 py-3.5 text-right">Lifetime Spend</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEF2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#F84464] animate-spin mx-auto mb-2" />
                    <span>Loading customer records...</span>
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#222432] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#F84464] to-[#c72c47] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          {customer.name ? customer.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div>{customer.name}</div>
                          <div className="text-[10px] text-gray-500 font-normal">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                      {customer.phone || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-full font-mono text-xs text-[#222432] font-bold">
                        {customer.bookingsCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-[#222432]">
                      ₹{(customer.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {customer.isDeactivated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20">
                          Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetail(customer._id)}
                        className="px-3 py-1 bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        disabled={actionLoading}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          customer.isDeactivated
                            ? 'text-[#4ABD5D] hover:bg-[#4ABD5D]/10'
                            : 'text-[#F84464] hover:bg-[#F84464]/10'
                        }`}
                        title={customer.isDeactivated ? 'Reactivate Customer' : 'Deactivate Customer'}
                      >
                        {customer.isDeactivated ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-[#EEEEF2] flex items-center justify-between text-xs text-gray-500 bg-white">
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40 hover:bg-gray-100 cursor-pointer text-[#222432]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40 hover:bg-gray-100 cursor-pointer text-[#222432]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Slide-Over Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border-l border-[#EEEEF2] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-base font-black text-[#222432]">Customer Account Profile</h3>
                  <p className="text-xs text-gray-400">ID: {selectedCustomer._id}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-gray-400 hover:text-[#222432] hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Card */}
              <div className="bg-[#F9F9FB] p-5 rounded-2xl border border-[#EEEEF2] mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center font-black text-lg border border-[#F84464]/20">
                    {selectedCustomer.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#222432]">{selectedCustomer.name}</h4>
                    <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedCustomer.phone || 'No phone'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200/70 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black">Total Bookings</span>
                    <p className="text-sm font-bold text-[#222432] mt-0.5">{selectedCustomer.bookingsCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black">Total Spending</span>
                    <p className="text-sm font-bold text-[#4ABD5D] mt-0.5">
                      ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                Ticket &amp; Reservation History ({customerBookings.length})
              </h4>

              <div className="space-y-3">
                {customerBookings.length > 0 ? (
                  customerBookings.map((b) => (
                    <div key={b._id} className="p-3.5 rounded-xl bg-white border border-[#EEEEF2] text-xs shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-[#F84464]">{b.bookingId}</span>
                        <span className="font-mono font-bold text-[#222432]">₹{b.totalAmount}</span>
                      </div>
                      <div className="text-[#222432] font-semibold truncate">{b.movieTitle}</div>
                      <div className="text-gray-500 text-[11px] truncate">{b.theatreName}</div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                        <span>Seats: {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}</span>
                        <span className="capitalize text-[#4ABD5D] font-bold">{b.bookingStatus}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center">No bookings found for this customer.</p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(selectedCustomer)}
                disabled={actionLoading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedCustomer.isDeactivated
                    ? 'bg-[#4ABD5D] hover:bg-[#3ea14f] text-white shadow-md'
                    : 'bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white border border-[#F84464]/20'
                }`}
              >
                {selectedCustomer.isDeactivated ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Reactivate Customer Account</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Deactivate Customer Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

