import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  Loader2,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function CinemaPartnerProfilePage() {
  const toast = useCinemaToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    partnerPhone: '',
    businessAddress: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await cinemaPartnerApi.getProfile();
        if (res.success && res.profile) {
          setProfile(res.profile);
          setFormData({
            name: res.profile.name || '',
            email: res.profile.email || '',
            phone: res.profile.phone || '',
            businessName: res.profile.businessName || '',
            partnerPhone: res.profile.partnerPhone || '',
            businessAddress: res.profile.businessAddress || ''
          });
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await cinemaPartnerApi.updateProfile(formData);
      if (res.success) {
        toast.success('Profile Saved', 'Business operator profile updated successfully.');
      }
    } catch (err) {
      toast.error('Update Failed', err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Partner Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2.5">
          <UserCheck className="w-6 h-6 text-[#F84464]" />
          <span>Cinema Partner Business Credentials</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Authorized multiplex business entity, verified partner credentials, and operating company information
        </p>
      </div>

      {/* Account Info Cards */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Banner */}
          <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#4ABD5D]/20 flex items-center justify-center text-[#4ABD5D] shrink-0 border border-[#4ABD5D]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-[#222432]">Verified BookMyShow Cinema Operator</div>
                <div className="text-xs text-[#4ABD5D] font-bold mt-0.5">Account status: Active Multiplex Network</div>
              </div>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <span className="text-[9px] text-gray-400 block uppercase font-black tracking-wider">Managed Venues</span>
              <span className="text-base font-black text-[#222432]">{profile?.cinemasCount || 0} Cinema Locations</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Primary Operator Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Account Email (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Business / Entity Legal Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. INOX Cinecorp Multiplexes Ltd."
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Operator Direct Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Headquarters Phone / Support
              </label>
              <input
                type="text"
                value={formData.partnerPhone}
                onChange={(e) => setFormData({ ...formData, partnerPhone: e.target.value })}
                placeholder="011-45678900"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Registered Corporate Address
              </label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                placeholder="Cyber City, Gurugram"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-linear-to-r from-[#F84464] to-[#e03a58] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-[#F84464]/25 flex items-center gap-2 cursor-pointer transition disabled:opacity-50 active:scale-98"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
