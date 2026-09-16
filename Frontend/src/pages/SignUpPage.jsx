import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVendorAuth } from '../context/VendorAuthContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  Gift,
  Award,
  TrendingUp,
  Tv
} from 'lucide-react';
import { playPop } from '../utils/soundEffects';

export default function SignUpPage() {
  const { register: customerRegister } = useAuth();
  const { register: vendorRegister } = useVendorAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'vendor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    gstin: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleRoleChange = (role) => {
    try { playPop(); } catch (_) {}
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (selectedRole === 'vendor' && !formData.businessName?.trim()) {
      setError('Please enter your Cinema or Theatre Chain Name.');
      return;
    }

    setLoading(true);
    try {
      if (selectedRole === 'vendor') {
        const res = await vendorRegister({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone?.trim() || '',
          businessName: formData.businessName.trim(),
          gstin: formData.gstin?.trim() || ''
        });
        if (res.success) {
          navigate('/vendor/dashboard');
        } else {
          setError(res.message || 'Cinema partner registration failed.');
        }
      } else {
        const res = await customerRegister({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone?.trim() || ''
        });
        if (res.success) {
          navigate('/');
        } else {
          setError(res.message || 'Customer registration failed.');
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    try { playPop(); } catch (_) {}
    const rand = Math.floor(100 + Math.random() * 900);
    if (selectedRole === 'vendor') {
      setFormData({
        name: `Operator ${rand}`,
        email: `partner${rand}@cinemaworld.com`,
        phone: `98765${rand}21`,
        businessName: `Metro Multiplex ${rand}`,
        gstin: `07AAAAA${rand}1Z5`,
        password: 'password123',
      });
    } else {
      setFormData({
        name: `User ${rand}`,
        email: `user${rand}@example.com`,
        phone: `9876543${rand}`,
        businessName: '',
        gstin: '',
        password: 'password123',
      });
    }
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-[#F5F5FA]">
      <div className="max-w-xl w-full">
        
        {/* Main Card */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xl border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-4">
            <Link to="/" className="inline-block mb-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                book<span className="text-[#F84464]">my</span>show
              </span>
            </Link>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Create a New Account</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedRole === 'vendor'
                ? 'Join India’s premier cinema ticketing & multiplex network'
                : 'Unlock exclusive movie perks, superstar points & fast checkout'}
            </p>
          </div>

          {/* Account Role Selector Tabs */}
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'customer'
                    ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-xs ring-2 ring-blue-100'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <User className={`w-3.5 h-3.5 ${selectedRole === 'customer' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>Moviegoer</span>
                  </div>
                  {selectedRole === 'customer' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">Customer / Tickets</p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('vendor')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'vendor'
                    ? 'bg-[#F84464]/10 border-[#F84464]/60 text-[#F84464] shadow-xs ring-2 ring-red-100'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Building2 className={`w-3.5 h-3.5 ${selectedRole === 'vendor' ? 'text-[#F84464]' : 'text-gray-400'}`} />
                    <span>Cinema Partner</span>
                  </div>
                  {selectedRole === 'vendor' && (
                    <span className="w-2 h-2 rounded-full bg-[#F84464]" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">Theatre / Multiplex</p>
              </button>
            </div>
          </div>

          {/* Quick autofill demo button */}
          <div className="mb-3.5">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100/80 text-[#F84464] font-bold text-xs rounded-xl border border-red-200/80 flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-[0.99]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {selectedRole === 'vendor'
                  ? '✨ 1-Click Auto-Fill Demo Cinema Partner'
                  : '✨ 1-Click Auto-Fill Demo Customer'}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F84464]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 1: Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {selectedRole === 'vendor' ? 'Representative Name' : 'Full Name'}{' '}
                  <span className="text-[#F84464]">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={selectedRole === 'vendor' ? 'Operator / Director' : 'Enter full name'}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Cinema Name (for vendor) or Phone (for customer) */}
              {selectedRole === 'vendor' ? (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cinema Chain Name <span className="text-[#F84464]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Building2 className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. CineStar Multiplex"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
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
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Field 3: Email */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {selectedRole === 'vendor' ? 'Business Email' : 'Email Address'}{' '}
                  <span className="text-[#F84464]">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={selectedRole === 'vendor' ? 'partner@theatre.com' : 'name@example.com'}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 4: Phone (for vendor) or Password (for customer) */}
              {selectedRole === 'vendor' ? (
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
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
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
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
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
              {selectedRole === 'vendor' && (
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
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
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
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer mt-4 disabled:opacity-70 active:scale-[0.99]"
            >
              {loading
                ? 'Please wait...'
                : selectedRole === 'vendor'
                  ? 'Register as Cinema Partner'
                  : 'Create Customer Account'}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-4 text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#F84464] font-bold hover:underline">
              Sign In
            </Link>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
            By registering, you agree to BookMyShow's <span className="underline">Terms &amp; Conditions</span> and{' '}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
          {selectedRole === 'vendor' ? (
            <>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <Tv className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Screens & Shows</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <TrendingUp className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Real-time Revenue</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Verified Partner</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <Gift className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Welcome Perks</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <Award className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Superstar Rewards</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">100% Privacy</span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}


