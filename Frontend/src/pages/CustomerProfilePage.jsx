import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  ShieldCheck,
  Edit3,
  Check,
  Save,
  Loader2,
  LogOut,
  Sparkles,
  ArrowRight,
  Gift,
  AlertCircle
} from 'lucide-react';

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser, openAuthModal } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingsCount, setBookingsCount] = useState(user?.totalBookings || 0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchStats() {
      try {
        const res = await bookingApi.getMyBookings();
        if (res.success && Array.isArray(res.bookings)) {
          setBookingsCount(res.bookings.length);
        }
      } catch (err) {
        console.warn('Unable to load bookings count for profile', err);
      }
    }
    fetchStats();
  }, [isAuthenticated]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await authApi.updateMe({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile details updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F5FA] min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-[#F84464] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">My Profile</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Please sign in to manage your BookMyTrip account details and preferences.
          </p>
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full py-3 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-500/20 cursor-pointer"
          >
            Sign In to Profile
          </button>
        </div>
      </div>
    );
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '2026';

  return (
    <div className="bg-[#F5F5FA] min-h-screen pb-16 text-[#222432]">
      {/* Header Banner */}
      <div className="bg-[#222432] text-white py-10 border-b border-gray-800 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-[#F84464]/15 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F84464] to-rose-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-red-500/25 shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight my-0">
                  {user?.name || 'Customer Account'}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Member</span>
                </span>
              </div>
              <p className="text-xs text-gray-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user?.email}</span>
                <span className="text-gray-500">•</span>
                <span>Member since {joinDate}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Feedback alerts */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-[#F84464] rounded-xl flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Bookings</span>
              <span className="text-xl font-black text-[#222432]">{bookingsCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Loyalty Tier</span>
              <span className="text-sm font-black text-[#222432]">Superstar Silver</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Available Offers</span>
              <span className="text-sm font-black text-[#222432]">Active Discounts</span>
            </div>
          </div>
        </div>

        {/* Profile Details Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <h2 className="text-base font-black text-[#222432] tracking-tight my-0">
                Personal Information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your contact details for ticket notifications and SMS alerts.
              </p>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user?.name || '', phone: user?.phone || '' });
                }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F84464] disabled:text-gray-600 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address (Primary)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Email cannot be changed once verified.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F84464] disabled:text-gray-600 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role / Account Status
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value="Active Consumer (Customer)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Quick Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/my-bookings"
            className="p-5 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#F84464] flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#222432] group-hover:text-[#F84464] transition-colors my-0">
                  Manage My Bookings
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">View your tickets, download passes, and cancel</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-[#F84464] transition-all" />
          </Link>

          <Link
            to="/offers"
            className="p-5 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#222432] group-hover:text-amber-600 transition-colors my-0">
                  Bank Offers &amp; Promo Codes
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Unlock Buy 1 Get 1 Free and cashback deals</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
