import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] flex flex-col items-center justify-center text-[#222432]">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Verifying Platform Administrator Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F5F5FA] text-[#222432] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5 shadow-sm">
          <ShieldAlert className="w-8 h-8 text-[#F84464]" />
        </div>
        <h1 className="text-2xl font-black mb-2 text-[#222432]">Access Denied: Platform Administrator Role Required</h1>
        <p className="text-gray-500 max-w-md text-xs mb-6 leading-relaxed">
          You are currently signed in as <span className="text-[#222432] font-semibold">{user?.email}</span> (Role: <span className="capitalize">{user?.role}</span>).
          This portal is strictly restricted to verified platform executives and system administrators.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#222432] border border-[#EEEEF2] text-xs font-semibold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            Customer Store
          </Link>
          <Link
            to="/cinema-partner"
            className="px-5 py-2.5 rounded-xl bg-[#333545] hover:bg-[#222432] text-white text-xs font-semibold transition shadow-sm"
          >
            Cinema Partner Portal
          </Link>
          <Link
            to="/admin/login"
            className="px-5 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-sm"
          >
            Sign in as Admin
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
