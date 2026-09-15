import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  AlertCircle,
  Building2,
  ShieldCheck,
  ArrowRight,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { playPop } from '../../utils/soundEffects';

export default function AuthModal() {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    quickDemoLogin,
  } = useAuth();
  const { login: vendorLogin, register: vendorRegister } = useVendorAuth();
  const { login: adminLogin } = useAdminAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    gstin: '',
  });

  const [selectedLoginRole, setSelectedLoginRole] = useState('customer'); // 'customer' | 'vendor' | 'admin'
  const [selectedSignUpRole, setSelectedSignUpRole] = useState('customer'); // 'customer' | 'vendor'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSignUp = authModalMode === 'signup';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all required fields.');
          setSubmitting(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }

        if (selectedSignUpRole === 'vendor') {
          if (!formData.businessName?.trim()) {
            setError('Please enter your Cinema or Theatre Chain Name.');
            setSubmitting(false);
            return;
          }
          const res = await vendorRegister({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            phone: formData.phone?.trim() || '',
            businessName: formData.businessName.trim(),
            gstin: formData.gstin?.trim() || ''
          });
          if (!res.success) {
            setError(res.message || 'Cinema partner registration failed.');
          } else {
            closeAuthModal();
            navigate('/vendor/dashboard');
          }
        } else {
          // Customer Registration
          const res = await register(formData);
          if (!res.success) {
            setError(res.message || 'Registration failed');
          } else {
            closeAuthModal();
          }
        }
      } else {
        if (!formData.email || !formData.password) {
          setError('Please provide both email and password.');
          setSubmitting(false);
          return;
        }

        const emailLower = formData.email.trim().toLowerCase();

        // 1. Admin login routing
        if (selectedLoginRole === 'admin' || emailLower === 'admin@bookmyshow.com' || emailLower === 'admin@bookmytrip.com') {
          const res = await adminLogin(formData.email, formData.password);
          if (res.success) {
            closeAuthModal();
            navigate('/admin/dashboard');
            return;
          } else {
            setError(res.message || 'Admin authentication failed');
            setSubmitting(false);
            return;
          }
        }

        // 2. Cinema Partner login routing
        if (selectedLoginRole === 'vendor' || emailLower === 'partner@bookmyshow.com' || emailLower === 'partner@cinemaworld.com') {
          const res = await vendorLogin(formData.email, formData.password);
          if (res.success) {
            closeAuthModal();
            navigate('/vendor/dashboard');
            return;
          } else {
            setError(res.message || 'Cinema partner login failed');
            setSubmitting(false);
            return;
          }
        }

        // 3. Customer login with smart fallbacks
        const res = await login(formData.email, formData.password);
        if (res.success) {
          closeAuthModal();
        } else {
          // Check if it's a partner trying to log in directly
          try {
            const vRes = await vendorLogin(formData.email, formData.password);
            if (vRes.success) {
              closeAuthModal();
              navigate('/vendor/dashboard');
              return;
            }
          } catch (_) {}

          // Check if it's an admin trying to log in directly
          try {
            const aRes = await adminLogin(formData.email, formData.password);
            if (aRes.success) {
              closeAuthModal();
              navigate('/admin/dashboard');
              return;
            }
          } catch (_) {}

          setError(res.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      setError(err.message || 'Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChipSelect = (role) => {
    try { playPop(); } catch (_) {}
    setSelectedLoginRole(role);
    setError('');

    if (role === 'customer') {
      setFormData((prev) => ({
        ...prev,
        email: 'demo@bookmyshow.com',
        password: 'password123'
      }));
    } else if (role === 'vendor') {
      setFormData((prev) => ({
        ...prev,
        email: 'partner@bookmyshow.com',
        password: 'password123'
      }));
    } else if (role === 'admin') {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@bookmyshow.com',
        password: 'password123'
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className={`relative w-full ${isSignUp ? 'max-w-lg' : 'max-w-md'} max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100`}>
        {/* Top 3D Neon Projection Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#F84464] to-transparent shadow-[0_0_12px_rgba(248,68,100,0.8)] shrink-0" />

        {/* Top Header */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1">
              <span>book<span className="text-[#F84464]">my</span>show</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isSignUp
                ? 'Sign up to unlock rewards and movie tickets'
                : 'Sign in to access your bookings and profile'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setError('');
              setAuthModalMode('signin');
            }}
            className={`flex-1 py-2 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${!isSignUp
                ? 'bg-white text-[#F84464] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setAuthModalMode('signup');
            }}
            className={`flex-1 py-2 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${isSignUp
                ? 'bg-white text-[#F84464] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body - scrollable on small screens */}
        <div className="p-5 overflow-y-auto max-h-[calc(92vh-110px)]">
          {/* Quick Role Demo Chips (Customer, Cinema Partner, Super Admin) */}
          {!isSignUp && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Choose Account Role</span>
                </span>
                <span className="text-[9px] text-gray-400 font-semibold">Pre-fills Credentials</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRoleChipSelect('customer')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLoginRole === 'customer'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                      : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-black truncate">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Customer</span>
                  </div>
                  <div className="text-[9px] text-gray-400 truncate mt-0.5">Tickets & Seats</div>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRoleChipSelect('vendor')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLoginRole === 'vendor'
                      ? 'bg-[#F84464]/10 border-[#F84464]/50 text-[#F84464] shadow-xs'
                      : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-black truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                    <span className="truncate">Partner</span>
                  </div>
                  <div className="text-[9px] text-gray-400 truncate mt-0.5">Multiplex Desk</div>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRoleChipSelect('admin')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLoginRole === 'admin'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                      : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-black truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Admin</span>
                  </div>
                  <div className="text-[9px] text-gray-400 truncate mt-0.5">GMV & KYC</div>
                </button>
              </div>
            </div>
          )}

          {/* Sign Up Role Selection (Customer vs Cinema Partner) */}
          {isSignUp && (
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Select Account Type
                </span>
                <span className={`text-[9px] font-bold ${selectedSignUpRole === 'vendor' ? 'text-[#F84464]' : 'text-blue-600'}`}>
                  {selectedSignUpRole === 'vendor' ? 'Cinema Partner Portal' : 'Moviegoer Booking Account'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try { playPop(); } catch (_) {}
                    setSelectedSignUpRole('customer');
                    setError('');
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSignUpRole === 'customer'
                      ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-xs'
                      : 'bg-gray-50/80 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <User className={`w-3.5 h-3.5 ${selectedSignUpRole === 'customer' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>Moviegoer</span>
                    </div>
                    {selectedSignUpRole === 'customer' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">Book tickets & snacks</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { playPop(); } catch (_) {}
                    setSelectedSignUpRole('vendor');
                    setError('');
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSignUpRole === 'vendor'
                      ? 'bg-[#F84464]/10 border-[#F84464]/50 text-[#F84464] shadow-xs'
                      : 'bg-gray-50/80 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Building2 className={`w-3.5 h-3.5 ${selectedSignUpRole === 'vendor' ? 'text-[#F84464]' : 'text-gray-400'}`} />
                      <span>Cinema Partner</span>
                    </div>
                    {selectedSignUpRole === 'vendor' && (
                      <span className="w-2 h-2 rounded-full bg-[#F84464] ring-2 ring-red-200" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">List screens & theatres</p>
                </button>
              </div>
            </div>
          )}

          {/* Social Google button */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => {
                alert('Social Google Login: Logging in with test Google profile.');
                quickDemoLogin();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-2.5 text-[9px] uppercase tracking-wider text-gray-400 font-bold absolute">
              or with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F84464]" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className={isSignUp ? 'space-y-2.5' : 'space-y-3'}>
            {isSignUp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Field 1: Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {selectedSignUpRole === 'vendor' ? 'Representative Name' : 'Full Name'}{' '}
                    <span className="text-[#F84464]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={selectedSignUpRole === 'vendor' ? 'Operator / Director' : 'Enter full name'}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Cinema Name (for vendor) or Phone (for customer) */}
                {selectedSignUpRole === 'vendor' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Cinema Chain Name <span className="text-[#F84464]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g. CineStar Multiplex"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Field 3: Email */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {selectedSignUpRole === 'vendor' ? 'Business Email' : 'Email Address'}{' '}
                    <span className="text-[#F84464]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={selectedSignUpRole === 'vendor' ? 'partner@theatre.com' : 'name@example.com'}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field 4: Phone (for vendor) or Password (for customer) */}
                {selectedSignUpRole === 'vendor' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Password <span className="text-[#F84464]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* For Vendor: Row 3 (GSTIN & Password) */}
                {selectedSignUpRole === 'vendor' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        GSTIN / Tax ID <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative flex items-center">
                        <ShieldCheck className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          name="gstin"
                          value={formData.gstin}
                          onChange={handleChange}
                          placeholder="e.g. 07AAAAA0000A1Z5"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Password <span className="text-[#F84464]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Min 6 characters"
                          className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Sign In: Standard 1-column */
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-[#F84464]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Password <span className="text-[#F84464]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 sm:py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-black rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer mt-2 disabled:opacity-70 active:scale-[0.99]"
            >
              {submitting
                ? 'Please wait...'
                : isSignUp
                  ? (selectedSignUpRole === 'vendor' ? 'Register as Cinema Partner' : 'Create Customer Account')
                  : selectedLoginRole === 'vendor'
                    ? 'Sign In as Cinema Partner'
                    : selectedLoginRole === 'admin'
                      ? 'Sign In as Platform Admin'
                      : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-3.5 text-center">
            <p className="text-xs text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthModalMode(isSignUp ? 'signin' : 'signup');
                }}
                className="text-[#F84464] font-bold hover:underline cursor-pointer ml-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Role Switching Helper Bar in Sign Up */}
          {isSignUp && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              {selectedSignUpRole === 'customer' ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-[#F84464]/10 text-[#F84464]">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold text-[11px]">Cinema Operator?</div>
                      <div className="text-gray-500 text-[10px]">Register your multiplexes</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try { playPop(); } catch (_) {}
                      setSelectedSignUpRole('vendor');
                      setError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[#F84464] font-black text-[11px] hover:bg-red-50 hover:border-[#F84464]/30 transition-all flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                  >
                    <span>Partner Sign Up</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold text-[11px]">Moviegoer?</div>
                      <div className="text-gray-500 text-[10px]">Customer ticket booking</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try { playPop(); } catch (_) {}
                      setSelectedSignUpRole('customer');
                      setError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-blue-600 font-black text-[11px] hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                  >
                    <span>Customer Sign Up</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
            I agree to the <span className="underline">Terms &amp; Conditions</span> &amp;{' '}
            <span className="underline">Privacy Policy</span>
          </p>
        </div>

      </div>
    </div>
  );
}

