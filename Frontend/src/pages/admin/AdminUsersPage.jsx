import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAdminToast } from '../../components/admin/AdminToastContext';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import {
  Users,
  Search,
  ShieldCheck,
  User,
  Ticket,
  AlertCircle,
  Loader2,
  Calendar,
  KeyRound
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useAdminToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    onConfirm: null,
    loading: false
  });

  const loadUsers = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');
    try {
      const res = await adminApi.getUsers();
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users.');
      showToast('error', err.message || 'Failed to load users.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);
  }, []);

  const handleRoleTogglePrompt = (targetUser) => {
    const isSelf = targetUser._id === currentAdmin?.id || targetUser._id === currentAdmin?._id;
    if (isSelf) {
      showToast('error', 'Security Protection: You cannot revoke your own Super Admin access.');
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const isDemote = newRole === 'user';

    setConfirmModal({
      isOpen: true,
      title: isDemote ? 'Demote to Customer?' : 'Promote to Super Admin?',
      message: isDemote
        ? `Are you sure you want to revoke Super Admin privileges from "${targetUser.name}" (${targetUser.email})? They will lose access to the Admin Console.`
        : `Are you sure you want to grant Super Admin privileges to "${targetUser.name}" (${targetUser.email})? They will gain full administrative rights to movies, bookings, and revenue metrics.`,
      confirmText: isDemote ? 'Yes, Demote Account' : 'Yes, Grant Super Admin',
      isDestructive: isDemote,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        setActionLoadingId(targetUser._id);
        try {
          const res = await adminApi.updateUserRole(targetUser._id, newRole);
          if (res.success) {
            // Local state update — NO full table wipe / refetch
            setUsers(prev =>
              prev.map(u => (u._id === targetUser._id ? { ...u, role: newRole } : u))
            );
            showToast('success', res.message || `Updated role for ${targetUser.name}.`);
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
          } else {
            showToast('error', res.message || 'Failed to update user role.');
            setConfirmModal(prev => ({ ...prev, loading: false }));
          }
        } catch (err) {
          showToast('error', err.message || 'Failed to update user role.');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        } finally {
          setActionLoadingId(null);
        }
      }
    });
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.includes(term)
    );
  }, [users, searchTerm]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        badgeIcon={Users}
        badgeText="Enterprise Directory"
        title="Users &amp; Roles"
        description="Oversee registered audience accounts, booking engagement, and Super Admin access privileges"
      />

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
          />
        </div>
        <div className="text-xs text-gray-400 font-bold">
          Total Registered: <span className="text-[#222432] font-black">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100">
        {loading ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
            <span className="text-xs font-semibold text-gray-500">
              Retrieving user accounts from MongoDB Atlas...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="No Users Found"
            description={
              searchTerm
                ? `No accounts match your search query "${searchTerm}".`
                : 'No users registered in the database yet.'
            }
            actionText={searchTerm ? 'Reset Search' : undefined}
            onAction={searchTerm ? () => setSearchTerm('') : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Platform Role</th>
                    <th className="py-3 px-4">Bookings Placed</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((u) => {
                    const isAdmin = u.role === 'admin';
                    const isCurrent = u._id === currentAdmin?.id || u._id === currentAdmin?._id;

                    return (
                      <tr key={u._id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                              isAdmin
                                ? 'bg-[#F84464] text-white'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-black text-[#222432] text-sm leading-snug flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {u.phone || 'No phone provided'}
                        </td>
                        <td className="py-3.5 px-4">
                          <AdminStatusBadge status={u.role} size="xs" />
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80">
                            <Ticket className="w-3.5 h-3.5" />
                            <span>{u.bookingCount || 0} Orders</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px] font-medium">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isCurrent ? (
                            <span className="text-gray-400 italic text-[11px]">Current Admin</span>
                          ) : (
                            <button
                              disabled={actionLoadingId === u._id}
                              onClick={() => handleRoleTogglePrompt(u)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer disabled:opacity-50 ${
                                isAdmin
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-[#F84464]/10 hover:bg-[#F84464]/20 text-[#F84464] border-[#F84464]/30'
                              }`}
                            >
                              {actionLoadingId === u._id
                                ? 'Updating...'
                                : isAdmin
                                ? 'Demote to Customer'
                                : 'Make Super Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <AdminPagination
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        loading={confirmModal.loading}
      />
    </div>
  );
}
