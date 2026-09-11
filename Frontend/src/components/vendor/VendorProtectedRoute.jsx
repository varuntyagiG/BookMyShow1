import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';

export default function VendorProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useVendorAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#666666] font-medium text-sm">Loading Partner Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" state={{ from: location }} replace />;
  }

  return children;
}
