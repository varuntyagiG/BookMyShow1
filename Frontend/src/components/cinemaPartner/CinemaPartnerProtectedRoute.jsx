import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export default function CinemaPartnerProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F15] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-400 font-medium">Verifying Cinema Partner Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cinema-partner/login" replace />;
  }

  if (user?.role !== 'cinema_partner') {
    return (
      <div className="min-h-screen bg-[#0D0F15] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2">Access Denied: Cinema Partner Role Required</h1>
        <p className="text-gray-400 max-w-md text-xs mb-6 leading-relaxed">
          You are signed in as <span className="text-white font-semibold">{user?.email}</span> (Role: <span className="capitalize">{user?.role}</span>). 
          This portal is strictly dedicated to verified Cinema &amp; Theatre business operators.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer Store
          </Link>
          <Link
            to="/cinema-partner/login"
            className="px-5 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-lg shadow-[#F84464]/20"
          >
            Switch to Partner Account
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
