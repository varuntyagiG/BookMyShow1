import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
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
  Sparkles
} from 'lucide-react';

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
            <Card
              key={cinema.id || cinema._id}
              interactive={true}
              accent="primary"
              className="flex flex-col justify-between border-slate-200/90 group"
            >
              <div>
                <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#F84464]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Multiplex Venue
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg text-slate-900 leading-snug line-clamp-1 group-hover:text-[#F84464] transition-colors">
                        {cinema.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin size={13} className="text-[#F84464] shrink-0" />
                        <span className="truncate font-medium">{cinema.city}{cinema.state ? `, ${cinema.state}` : ''}</span>
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
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                      )}
                      <span>{cinema.status === 'active' ? 'Operational' : 'Inactive'}</span>
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3.5 text-xs text-slate-600 pt-4">
                  {/* Address */}
                  <p className="line-clamp-2 text-slate-500 leading-relaxed">
                    {cinema.address}
                  </p>

                  {/* Highlights Stat Strip */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Tv size={15} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Screens</div>
                        <div className="font-bold text-slate-900 text-xs">
                          {cinema.screensCount || 0} Auditorium{(cinema.screensCount || 0) === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F84464] flex items-center justify-center shrink-0">
                        <Phone size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Helpline</div>
                        <div className="font-medium text-slate-800 text-xs truncate">
                          {cinema.contactPhone || 'On-file'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* If 0 screens, display quick configure alert */}
                  {(cinema.screensCount || 0) === 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2.5 shadow-2xs">
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Armchair size={14} />
                      </div>
                      <span className="font-medium">No screens configured yet. Set up auditoriums below.</span>
                    </div>
                  )}

                  {/* Facilities Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Venue Amenities & Tech
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {(cinema.facilities || []).length} active
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(cinema.facilities || []).length === 0 ? (
                        <span className="text-slate-400 text-[11px]">Standard amenities</span>
                      ) : (
                        (cinema.facilities || []).map((f) => (
                          <span
                            key={f}
                            className="bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs group-hover:border-slate-300 transition-colors"
                          >
                            {f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 pb-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <Link
                  to={`/vendor/screens?cinemaId=${cinema.id || cinema._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 px-3.5 py-2 rounded-xl transition shadow-2xs group/btn"
                >
                  <Armchair size={14} className="text-indigo-600 group-hover/btn:scale-110 transition-transform" />
                  <span>Configure Audi & Seats</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cinema)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition shadow-2xs"
                    title="Edit Venue Details"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(cinema)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition shadow-2xs"
                    title="Delete Venue"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardFooter>
            </Card>
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
