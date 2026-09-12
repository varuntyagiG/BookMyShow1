import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vendorApi } from '../../services/vendorApi';
import {
  Button,
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState
} from '../../components/ui';
import {
  MapPin,
  Plus,
  Tv,
  Phone,
  Mail,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Armchair,
  Building2,
  Car,
  Utensils,
  Volume2,
  Accessibility,
  Ticket,
  ChevronRight
} from 'lucide-react';

function renderFacilityPill(facility) {
  const fLower = (facility || '').toLowerCase();
  let icon = <CheckCircle size={11} className="text-slate-500" />;
  let colorStyle = 'bg-slate-50 text-slate-700 border-slate-200/80';

  if (fLower.includes('ticket') || fLower.includes('m-ticket')) {
    icon = <Ticket size={11} className="text-emerald-600" />;
    colorStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
  } else if (fLower.includes('food') || fLower.includes('f&b') || fLower.includes('snack')) {
    icon = <Utensils size={11} className="text-amber-600" />;
    colorStyle = 'bg-amber-50 text-amber-800 border-amber-200/70';
  } else if (fLower.includes('atmos') || fLower.includes('sound') || fLower.includes('dolby') || fLower.includes('audio')) {
    icon = <Volume2 size={11} className="text-indigo-600" />;
    colorStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200/70';
  } else if (fLower.includes('park') || fLower.includes('valet')) {
    icon = <Car size={11} className="text-blue-600" />;
    colorStyle = 'bg-blue-50 text-blue-800 border-blue-200/70';
  } else if (fLower.includes('wheel') || fLower.includes('access')) {
    icon = <Accessibility size={11} className="text-cyan-600" />;
    colorStyle = 'bg-cyan-50 text-cyan-800 border-cyan-200/70';
  } else if (fLower.includes('recliner') || fLower.includes('vip') || fLower.includes('sofa')) {
    icon = <Armchair size={11} className="text-purple-600" />;
    colorStyle = 'bg-purple-50 text-purple-800 border-purple-200/70';
  }

  return (
    <span
      key={facility}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${colorStyle} shadow-2xs transition-all`}
    >
      {icon}
      <span>{facility}</span>
    </span>
  );
}

const POPULAR_CITIES = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Chandigarh',
  'Jaipur'
];

const AVAILABLE_FACILITIES = [
  'M-Ticket',
  'F&B',
  'Recliner',
  'IMAX Laser',
  'Dolby Atmos',
  'Valet Parking',
  'Wheelchair Access',
  'Food Court'
];

const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function VendorCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Bengaluru',
    state: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    facilities: ['M-Ticket', 'F&B', 'Recliner'],
    // Integrated Screen & Seat Layout setup
    autoCreateScreen: true,
    screenName: 'Screen 1 (Dolby Atmos)',
    screenNumber: 'AUDI-1',
    screenType: 'Standard 2D',
    rowCount: 8,
    seatsPerRow: 12,
    includeRecliner: true,
    includePremium: true,
    reclinerPrice: 450,
    premiumPrice: 280,
    normalPrice: 180
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCinemas = async () => {
    try {
      const res = await vendorApi.getCinemas();
      if (res.success && res.data) {
        setCinemas(res.data);
      }
    } catch (err) {
      console.error('Failed to load cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      city: 'Bengaluru',
      state: '',
      address: '',
      contactPhone: '',
      contactEmail: '',
      facilities: ['M-Ticket', 'F&B', 'Recliner'],
      autoCreateScreen: true,
      screenName: 'Screen 1 (Dolby Atmos)',
      screenNumber: 'AUDI-1',
      screenType: 'Standard 2D',
      rowCount: 8,
      seatsPerRow: 12,
      includeRecliner: true,
      includePremium: true,
      reclinerPrice: 450,
      premiumPrice: 280,
      normalPrice: 180
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (cinema) => {
    setSelectedCinema(cinema);
    setFormData({
      name: cinema.name,
      city: cinema.city,
      state: cinema.state || '',
      address: cinema.address,
      contactPhone: cinema.contactPhone || '',
      contactEmail: cinema.contactEmail || '',
      facilities: cinema.facilities || [],
      autoCreateScreen: false
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cinema) => {
    setSelectedCinema(cinema);
    setIsDeleteModalOpen(true);
  };

  const toggleFacility = (facility) => {
    setFormData(prev => {
      const current = prev.facilities || [];
      if (current.includes(facility)) {
        return { ...prev, facilities: current.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...current, facility] };
      }
    });
  };

  const handleCreateCinema = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.address) {
      setFormError('Cinema name, city, and address are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      // 1. Create Cinema
      const res = await vendorApi.createCinema({
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state ? formData.state.trim() : '',
        address: formData.address.trim(),
        contactPhone: formData.contactPhone ? formData.contactPhone.trim() : '',
        contactEmail: formData.contactEmail ? formData.contactEmail.trim() : '',
        facilities: formData.facilities
      });

      if (res.success && res.data) {
        const cinemaId = res.data.id || res.data._id;

        // 2. Automatically configure initial Screen and Seating layout if enabled
        if (formData.autoCreateScreen) {
          const rows = ROW_LETTERS.slice(0, Number(formData.rowCount) || 8);
          const layout = rows.map((letter, idx) => {
            let tier = 'Normal';
            let basePrice = Number(formData.normalPrice) || 180;
            let seatsCount = Number(formData.seatsPerRow) || 12;

            if (idx === 0 && formData.includeRecliner) {
              tier = 'Recliner';
              basePrice = Number(formData.reclinerPrice) || 450;
              seatsCount = Math.max(6, seatsCount - 4);
            } else if (idx < 4 && formData.includePremium) {
              tier = 'Premium';
              basePrice = Number(formData.premiumPrice) || 280;
            }

            return {
              row: letter,
              tier,
              basePrice,
              seatsCount,
              disabledSeats: []
            };
          });

          await vendorApi.createScreen({
            cinemaId,
            screenNumber: formData.screenNumber || 'AUDI-1',
            name: formData.screenName || 'Screen 1',
            screenType: formData.screenType || 'Standard 2D',
            seatingLayout: layout,
            totalCapacity: layout.reduce((sum, r) => sum + r.seatsCount, 0)
          });
        }

        setIsAddModalOpen(false);
        await fetchCinemas();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create cinema.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCinema = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.address) {
      setFormError('Cinema name, city, and address are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const res = await vendorApi.updateCinema(selectedCinema.id || selectedCinema._id, {
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state ? formData.state.trim() : '',
        address: formData.address.trim(),
        contactPhone: formData.contactPhone ? formData.contactPhone.trim() : '',
        contactEmail: formData.contactEmail ? formData.contactEmail.trim() : '',
        facilities: formData.facilities
      });
      if (res.success) {
        setIsEditModalOpen(false);
        await fetchCinemas();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update cinema.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCinema = async () => {
    if (!selectedCinema) return;
    try {
      const res = await vendorApi.deleteCinema(selectedCinema.id || selectedCinema._id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        await fetchCinemas();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete cinema');
    }
  };

  const autoSeatsTotal = (Number(formData.rowCount) || 8) * (Number(formData.seatsPerRow) || 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MapPin className="text-[#F84464]" size={24} />
            <span>Cinemas & Multiplexes</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your cinema properties, auditorium seating layouts, and venue facilities.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 shadow-sm"
        >
          <Plus size={16} />
          <span>Add Multiplex</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading your cinema venues...
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="No Cinema Venues Added"
          description="Add your first multiplex or theatre to start configuring auditoriums and scheduling movie shows for customers."
          actionText="Add Cinema Venue"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((cinema) => (
            <motion.div
              key={cinema.id || cinema._id}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-2xl border border-slate-100/90 hover:border-slate-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_-8px_rgba(0,0,0,0.09)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* 1. Header: Cinema Icon, Name, City, Operational Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(0,0,0,0.18)] group-hover:scale-105 group-hover:from-[#F84464] group-hover:to-[#e03a58] transition-all duration-300">
                      <Building2 size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate group-hover:text-[#F84464] transition-colors"
                        title={cinema.name}
                      >
                        {cinema.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin size={13} className="text-[#F84464] shrink-0" />
                        <span className="font-semibold text-slate-700">{cinema.city}</span>
                        {cinema.state && <span className="text-slate-400">• {cinema.state}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${
                      cinema.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {cinema.status === 'active' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    <span>{cinema.status === 'active' ? 'Operational' : 'Inactive'}</span>
                  </span>
                </div>

                {/* 2. Address & Contact Information (Clean, readable, natural) */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <p className="text-slate-600 leading-relaxed line-clamp-2">
                    <span className="font-semibold text-slate-700">Address: </span>
                    <span>{cinema.address || 'Address registered on-file.'}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Phone size={12} className="text-[#F84464] shrink-0" />
                      <span className="font-medium text-slate-700">{cinema.contactPhone || 'Helpline on-file'}</span>
                    </div>
                    {cinema.contactEmail && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 truncate max-w-[180px]">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{cinema.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Operational Screen Summary Ribbon (BookMyShow Style) */}
                <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border border-slate-200/80 p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                      <Tv size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Screens</span>
                      <span className="text-xs font-bold text-slate-900">
                        {cinema.screensCount || 0} Auditorium{(cinema.screensCount || 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-200/80" />

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                      <Ticket size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ticketing</span>
                      <span className="text-xs font-bold text-slate-900">
                        M-Ticket Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alert if 0 screens configured */}
                {(cinema.screensCount || 0) === 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2 shadow-2xs">
                    <AlertCircle size={14} className="text-amber-700 shrink-0" />
                    <span className="font-medium">No auditoriums added yet. Configure screens below.</span>
                  </div>
                )}

                {/* 4. Amenities & Sound Badges */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Amenities & Facilities
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {(cinema.facilities || []).length} enabled
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(cinema.facilities || []).length === 0 ? (
                      <span className="text-slate-400 text-xs italic">Standard multiplex amenities</span>
                    ) : (
                      (cinema.facilities || []).map(renderFacilityPill)
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Card Footer: Action Area with BookMyShow Crimson CTA */}
              <div className="p-4 px-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                <Link
                  to={`/vendor/screens?cinemaId=${cinema.id || cinema._id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#F84464] hover:bg-[#e03a58] px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(248,68,100,0.3)] hover:shadow-[0_6px_20px_rgba(248,68,100,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group/btn"
                >
                  <Armchair size={15} className="text-rose-100 group-hover/btn:text-white transition-colors" />
                  <span>Configure Screens ({cinema.screensCount || 0})</span>
                  <ChevronRight size={13} className="text-rose-200 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cinema)}
                    className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200/80 transition flex items-center gap-1 shadow-2xs cursor-pointer hover:border-slate-300"
                    title="Edit Venue Details"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(cinema)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/80 hover:border-rose-200 transition shadow-2xs cursor-pointer"
                    title="Delete Venue"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Cinema Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add Cinema Venue & Configure Seats' : 'Edit Cinema Venue'}
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={isAddModalOpen ? handleCreateCinema : handleUpdateCinema} className="space-y-4">
          <Input
            label="Cinema / Multiplex Name"
            required
            placeholder="e.g. CineWorld: Grand Galleria Mall"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              options={POPULAR_CITIES.map(c => ({ value: c, label: c }))}
            />
            <Input
              label="State / Province"
              placeholder="e.g. Karnataka"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <Input
            label="Full Physical Address"
            required
            placeholder="e.g. Level 4, Grand Galleria, MG Road, Bengaluru"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              placeholder="e.g. 9820198201"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              placeholder="manager@theatre.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>

          {/* Integrated Initial Screen & Seating Layout Setup */}
          {isAddModalOpen && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoCreateScreen}
                    onChange={(e) => setFormData({ ...formData, autoCreateScreen: e.target.checked })}
                    className="rounded text-[#F84464] focus:ring-[#F84464]"
                  />
                  <span>Configure First Auditorium Screen & Seats Now</span>
                </label>
                {formData.autoCreateScreen && (
                  <span className="text-[11px] font-bold text-[#F84464]">
                    ~{autoSeatsTotal} Seats
                  </span>
                )}
              </div>

              {formData.autoCreateScreen && (
                <div className="space-y-3 pt-2 border-t border-gray-200 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Screen Name"
                      placeholder="Audi 1 (Dolby Atmos)"
                      value={formData.screenName}
                      onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                    />
                    <Input
                      label="Screen Identifier"
                      placeholder="AUDI-1"
                      value={formData.screenNumber}
                      onChange={(e) => setFormData({ ...formData, screenNumber: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Number of Rows (e.g. 8)"
                      type="number"
                      min={4}
                      max={12}
                      value={formData.rowCount}
                      onChange={(e) => setFormData({ ...formData, rowCount: e.target.value })}
                    />
                    <Input
                      label="Seats Per Row (e.g. 12)"
                      type="number"
                      min={6}
                      max={20}
                      value={formData.seatsPerRow}
                      onChange={(e) => setFormData({ ...formData, seatsPerRow: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-rose-700 font-bold block mb-1">Recliner (₹)</span>
                      <input
                        type="number"
                        value={formData.reclinerPrice}
                        onChange={(e) => setFormData({ ...formData, reclinerPrice: e.target.value })}
                        className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-700 font-bold block mb-1">Premium (₹)</span>
                      <input
                        type="number"
                        value={formData.premiumPrice}
                        onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                        className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-700 font-bold block mb-1">Normal (₹)</span>
                      <input
                        type="number"
                        value={formData.normalPrice}
                        onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
                        className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Venue Amenities & Facilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_FACILITIES.map((fac) => {
                const isSelected = (formData.facilities || []).includes(fac);
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleFacility(fac)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border text-left font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#F84464] bg-rose-50 text-[#F84464]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{fac}</span>
                    {isSelected && <CheckCircle size={13} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
            >
              {isAddModalOpen ? 'Create Venue & Save Layout' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCinema}
        title="Delete Cinema Venue"
        message={`Are you sure you want to delete '${selectedCinema?.name}'? All its screens and show layouts will be permanently removed.`}
        confirmText="Yes, Delete Venue"
        type="danger"
      />
    </div>
  );
}
