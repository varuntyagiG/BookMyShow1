import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121216] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-sm text-gray-400">Verifying Super Admin Authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#121216] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied: Super Admin Required</h1>
        <p className="text-gray-400 max-w-md text-sm mb-6">
          You are currently signed in as <span className="text-white font-semibold">{user?.email}</span> (Role: <span className="capitalize">{user?.role}</span>). This area is strictly restricted to platform administrators.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer Store
          </Link>
          <Link
            to="/admin/login"
            className="px-5 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-sm font-semibold transition shadow-lg shadow-[#F84464]/20"
          >
            Switch to Admin Account
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
