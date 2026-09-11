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
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Skeleton,
  CopyButton,
  CopyBadge
} from '../../components/ui';

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#222432]">
      {/* Header */}
      <PageHeader
        title="Multiplex Partner Business Identity"
        subtitle="Authorized multiplex business entity, verified partner credentials, and operating company information."
        icon={UserCheck}
        badge="Enterprise Profile"
      />

      {loading ? (
        <Card className="p-8 space-y-6">
          <Skeleton className="h-20 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Banner */}
            <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#4ABD5D]/20 flex items-center justify-center text-[#4ABD5D] shrink-0 border border-[#4ABD5D]/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#222432]">Verified BookMyTrip Cinema Operator</div>
                  <div className="text-xs text-[#4ABD5D] font-semibold mt-0.5">Account Status: Active Multiplex Circuit Network</div>
                  {profile?._id && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">Partner Ref:</span>
                      <CopyBadge text={`PTR-${profile._id.slice(-6).toUpperCase()}`} size="xs" variant="brand" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Managed Venues</span>
                <span className="text-base font-bold text-[#222432]">{profile?.cinemasCount || 0} Cinema Properties</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Input
                label="Primary Operator Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={UserCheck}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">Account Email (Read-Only)</span>
                  {formData.email && (
                    <CopyButton text={formData.email} size="xs" variant="ghost" title="Copy account email" />
                  )}
                </div>
                <Input
                  type="email"
                  disabled
                  value={formData.email}
                  icon={Mail}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Input
                label="Business / Legal Entity Name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. INOX Cinecorp Multiplexes Ltd."
                icon={Building2}
              />

              <Input
                label="Operator Direct Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                icon={Phone}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Input
                label="Headquarters Desk / Support Phone"
                value={formData.partnerPhone}
                onChange={(e) => setFormData({ ...formData, partnerPhone: e.target.value })}
                placeholder="011-45678900"
                icon={Phone}
              />

              <Input
                label="Registered Corporate Address"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                placeholder="Cyber City, Gurugram, Haryana"
                icon={MapPin}
              />
            </div>

            <div className="pt-4 border-t border-[#EEEEF2] flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Save}
                loading={saving}
                className="shadow-md shadow-[#F84464]/25"
              >
                Save Business Profile
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
