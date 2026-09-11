import React, { createContext, useContext, useState, useEffect } from 'react';
import { vendorApi } from '../services/vendorApi';

const VendorAuthContext = createContext(null);

export function VendorAuthProvider({ children }) {
  const [partner, setPartner] = useState(null);
  const [partnerStats, setPartnerStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('bms_vendor_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('bms_vendor_token');
    setToken(null);
    setPartner(null);
    setPartnerStats(null);
  };

  const refreshPartner = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await vendorApi.getProfile();
      if (res.success && res.data) {
        setPartner(res.data.partner);
        setPartnerStats(res.data.stats);
      } else {
        logout();
      }
    } catch (_err) {
      console.warn('Cinema Partner token expired or invalid');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPartner();
  }, [token]);

  const login = async (email, password) => {
    const res = await vendorApi.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('bms_vendor_token', res.token);
      setToken(res.token);
      setPartner(res.user);
      await refreshPartner();
      return { success: true, partner: res.user };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (partnerData) => {
    const res = await vendorApi.register(partnerData);
    if (res.success && res.token) {
      localStorage.setItem('bms_vendor_token', res.token);
      setToken(res.token);
      setPartner(res.user);
      await refreshPartner();
      return { success: true, partner: res.user };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const updateProfile = async (updateData) => {
    const res = await vendorApi.updateProfile(updateData);
    if (res.success && res.data) {
      setPartner(prev => ({ ...prev, ...res.data }));
      return { success: true, partner: res.data };
    }
    return { success: false, message: res.message || 'Update failed' };
  };

  const value = {
    partner,
    partnerStats,
    token,
    loading,
    isAuthenticated: !!partner && !!token,
    login,
    register,
    logout,
    updateProfile,
    refreshPartner,
  };

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>;
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
}

export default VendorAuthContext;
