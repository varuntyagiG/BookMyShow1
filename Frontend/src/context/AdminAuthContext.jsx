import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '../services/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('bms_admin_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('bms_admin_token');
    setToken(null);
    setAdmin(null);
  }, []);

  const refreshAdmin = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await adminApi.getMe();
      if (res.success && res.user) {
        setAdmin(res.user);
      } else {
        logout();
      }
    } catch (_err) {
      console.warn('Platform Admin token expired or invalid');
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  const login = useCallback(async (email, password) => {
    const res = await adminApi.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('bms_admin_token', res.token);
      setToken(res.token);
      setAdmin(res.user);
      return { success: true, admin: res.user };
    }
    return { success: false, message: res.message || 'Admin authentication failed' };
  }, []);

  const value = useMemo(() => ({
    admin,
    token,
    loading,
    isAuthenticated: !!admin && !!token,
    login,
    logout,
    refreshAdmin,
  }), [
    admin,
    token,
    loading,
    login,
    logout,
    refreshAdmin,
  ]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;
