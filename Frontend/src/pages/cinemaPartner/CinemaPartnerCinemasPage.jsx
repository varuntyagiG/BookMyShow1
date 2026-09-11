import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  X,
  Tv,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function CinemaPartnerCinemasPage() {
  const toast = useCinemaToast();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Delhi-NCR',
    state: 'Delhi',
    address: '',
    contactPhone: '',
    contactEmail: '',
    facilities: ['M-Ticket', 'F&B', 'Parking'],
    status: 'active'
  });

  const availableFacilities = ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Wheelchair Access', 'Dolby Atmos'];

  const fetchCinemas = async () => {
    try {
      const res = await cinemaPartnerApi.getCinemas();
      if (res.success && res.cinemas) {
        setCinemas(res.cinemas);
      }
    } catch (err) {
      toast.error('Load Error', err.message || 'Failed to fetch cinemas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleOpenAdd = () => {
    setEditingCinema(null);
    setFormData({
      name: '',
      city: 'Delhi-NCR',
      state: 'Delhi',
      address: '',
      contactPhone: '',
      contactEmail: '',
      facilities: ['M-Ticket', 'F&B', 'Parking'],
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cinema) => {
    setEditingCinema(cinema);
    setFormData({
      name: cinema.name,
      city: cinema.city,
      state: cinema.state || '',
      address: cinema.address,
      contactPhone: cinema.contactPhone || '',
      contactEmail: cinema.contactEmail || '',
      facilities: cinema.facilities || ['M-Ticket', 'F&B'],
      status: cinema.status || 'active'
    });
    setModalOpen(true);
  };

  const handleFacilityToggle = (fac) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(fac);
      return {
        ...prev,
        facilities: exists ? prev.facilities.filter((f) => f !== fac) : [...prev.facilities, fac]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCinema) {
        const res = await cinemaPartnerApi.updateCinema(editingCinema._id, formData);
        if (res.success) {
          toast.success('Cinema Updated', `${formData.name} updated successfully.`);
          setModalOpen(false);
          fetchCinemas();
        } else {
          toast.error('Update Failed', res.message);
        }
      } else {
        const res = await cinemaPartnerApi.createCinema(formData);
        if (res.success) {
          toast.success('Cinema Registered', `${formData.name} is now live.`);
          setModalOpen(false);
          fetchCinemas();
        } else {
          toast.error('Creation Failed', res.message);
        }
      }
    } catch (err) {
      toast.error('Submission Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cinema) => {
    try {
      const res = await cinemaPartnerApi.deleteCinema(cinema._id);
      if (res.success) {
        toast.success('Cinema Deleted', `${cinema.name} removed from your network.`);
        setDeleteConfirm(null);
        fetchCinemas();
      } else {
        toast.error('Delete Failed', res.message);
      }
    } catch (err) {
      toast.error('Delete Error', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Cinema Properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#F84464]" />
            <span>My Cinemas &amp; Venues</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your cinema properties, venue addresses, and guest amenities
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cinema</span>
        </button>
      </div>

      {/* Cinema Cards Grid */}
      {cinemas.length === 0 ? (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#222432] mb-1">No Cinemas Registered</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Add your first cinema hall or theatre venue to start configuring screens and scheduling shows.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F84464]/25 cursor-pointer transition"
          >
            Add Cinema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((c) => (
            <div
              key={c._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl p-6 flex flex-col justify-between hover:border-[#F84464]/40 hover:shadow-lg transition group relative overflow-hidden"
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <h3 className="text-base font-bold text-[#222432] group-hover:text-[#F84464] transition-colors line-clamp-1">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                      <span className="truncate">{c.address}, {c.city}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      c.status === 'active'
                        ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Capacity & Screens Indicators */}
                <div className="grid grid-cols-2 gap-2.5 my-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center shrink-0">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Auditoriums</div>
                      <div className="text-xs font-bold text-[#222432]">{c.screensCount || 0} Screens</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Scheduled</div>
                      <div className="text-xs font-bold text-[#222432]">{c.activeShowsCount || 0} Shows</div>
                    </div>
                  </div>
                </div>

                {/* Facilities Tags matching BookMyShow venue badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(c.facilities || []).map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-gray-100/90 text-gray-700 text-[10px] font-medium border border-gray-200/70"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Operation Links & Action Buttons */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/cinema-partner/screens`}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold transition"
                  >
                    Screens
                  </Link>
                  <Link
                    to={`/cinema-partner/shows`}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold transition"
                  >
                    Shows
                  </Link>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                    title="Edit Cinema"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(c)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                    title="Delete Cinema"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header matching Customer Panel style */}
            <div className="bg-[#333545] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F84464]" />
                <h3 className="text-sm font-bold">
                  {editingCinema ? 'Edit Cinema Property' : 'Register New Cinema'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Cinema Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. PVR: Vegas Mall, Dwarka"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    {['Delhi-NCR', 'Mumbai', 'Bengaluru', 'Jaipur', 'Chandigarh', 'Pune', 'Hyderabad', 'Kolkata'].map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Street Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Sector 14, Vegas Mall, Dwarka, New Delhi"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="011-28034567"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="operations@cinema.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>
              </div>

              {/* Facilities Checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Guest Facilities &amp; Amenities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFacilities.map((fac) => {
                    const selected = formData.facilities.includes(fac);
                    return (
                      <button
                        type="button"
                        key={fac}
                        onClick={() => handleFacilityToggle(fac)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                          selected
                            ? 'bg-[#F84464]/10 border-[#F84464] text-[#F84464]'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span>{fac}</span>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F84464]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-xs font-bold text-white shadow-md shadow-[#F84464]/25 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCinema ? 'Update Cinema' : 'Create Cinema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-100 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#222432] mb-1">Delete Cinema?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete <strong className="text-gray-900 font-semibold">"{deleteConfirm.name}"</strong>? All associated screens and shows without active bookings will be removed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
