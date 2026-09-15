import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Film,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Layers,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

function renderFacilityPill(facility) {
  const fLower = (facility || '').toLowerCase();
  let icon = <CheckCircle size={10} className="text-gray-400" />;
  let colorStyle = 'bg-gray-100 text-gray-700 border-gray-200';

  if (fLower.includes('ticket') || fLower.includes('m-ticket')) {
    icon = <Ticket size={10} className="text-emerald-600" />;
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (fLower.includes('food') || fLower.includes('f&b') || fLower.includes('snack')) {
    icon = <Utensils size={10} className="text-amber-600" />;
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (fLower.includes('atmos') || fLower.includes('sound') || fLower.includes('dolby') || fLower.includes('audio')) {
    icon = <Volume2 size={10} className="text-indigo-600" />;
    colorStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (fLower.includes('park') || fLower.includes('valet')) {
    icon = <Car size={10} className="text-blue-600" />;
    colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (fLower.includes('wheel') || fLower.includes('access')) {
    icon = <Accessibility size={10} className="text-cyan-600" />;
    colorStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200';
  } else if (fLower.includes('recliner') || fLower.includes('vip') || fLower.includes('sofa')) {
    icon = <Armchair size={10} className="text-purple-600" />;
    colorStyle = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <span
      key={facility}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colorStyle} shadow-xs transition-all`}
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
  const [expandedCinemas, setExpandedCinemas] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dossierCinema, setDossierCinema] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const openDossierModal = (cinema) => {
    setDossierCinema(cinema);
    setIsDossierModalOpen(true);
  };

  const copyRefToClipboard = (text) => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const toggleCardExpand = (cinemaId) => {
    setExpandedCinemas(prev => ({
      ...prev,
      [cinemaId]: !prev[cinemaId]
    }));
  };

  const isCardExpanded = (cinemaId) => Boolean(expandedCinemas[cinemaId]);

  const allVisibleExpanded = cinemas.length > 0 && cinemas.every(c => expandedCinemas[c.id || c._id]);

  const toggleExpandAll = () => {
    if (allVisibleExpanded) {
      setExpandedCinemas({});
    } else {
      const allTrue = {};
      cinemas.forEach(c => {
        allTrue[c.id || c._id] = true;
      });
      setExpandedCinemas(allTrue);
    }
  };

  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  const availableCities = useMemo(() => {
    const set = new Set();
    cinemas.forEach(c => {
      if (c.city) set.add(c.city.trim());
    });
    return ['All', ...Array.from(set)];
  }, [cinemas]);

  const filteredCinemas = cinemas.filter(c => {
    if (selectedCityFilter !== 'All' && (c.city || '').trim() !== selectedCityFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.state || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.id || c._id || '').toLowerCase().includes(q)
    );
  });

  const [formData, setFormData] = useState({
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

        if (formData.autoCreateScreen && cinemaId) {
          try {
            const rows = [];
            const rCount = Math.min(Math.max(Number(formData.rowCount) || 8, 4), 12);
            const sCount = Math.min(Math.max(Number(formData.seatsPerRow) || 12, 6), 20);

            for (let i = 0; i < rCount; i++) {
              const rowLabel = ROW_LETTERS[i] || `R${i + 1}`;
              let tier = 'normal';
              let price = Number(formData.normalPrice) || 180;

              if (i === 0 && formData.includeRecliner) {
                tier = 'recliner';
                price = Number(formData.reclinerPrice) || 450;
              } else if (i <= 2 && formData.includePremium) {
                tier = 'premium';
                price = Number(formData.premiumPrice) || 280;
              }

              const seats = [];
              for (let j = 1; j <= sCount; j++) {
                seats.push({
                  number: j,
                  seatId: `${rowLabel}${j}`,
                  type: tier,
                  price: price,
                  status: 'available'
                });
              }

              rows.push({
                row: rowLabel,
                tier: tier,
                price: price,
                seats: seats
              });
            }

            await vendorApi.createScreen({
              cinemaId: cinemaId,
              name: formData.screenName ? formData.screenName.trim() : 'Screen 1',
              screenNumber: formData.screenNumber ? formData.screenNumber.trim() : 'AUDI-1',
              screenType: formData.screenType || 'Standard 2D',
              seatingLayout: {
                rows: rows
              }
            });
          } catch (screenErr) {
            console.warn('Multiplex created but initial screen generation encountered an issue:', screenErr);
          }
        }

        setIsAddModalOpen(false);
        fetchCinemas();
      } else {
        setFormError(res.message || 'Failed to create cinema.');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving cinema.');
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
      const cinemaId = selectedCinema.id || selectedCinema._id;
      const res = await vendorApi.updateCinema(cinemaId, {
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
        setSelectedCinema(null);
        fetchCinemas();
      } else {
        setFormError(res.message || 'Failed to update cinema.');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while updating cinema.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCinema = async () => {
    if (!selectedCinema) return;
    try {
      const cinemaId = selectedCinema.id || selectedCinema._id;
      const res = await vendorApi.deleteCinema(cinemaId);
      if (res.success) {
        setIsDeleteModalOpen(false);
        setSelectedCinema(null);
        fetchCinemas();
      } else {
        alert(res.message || 'Failed to delete cinema');
      }
    } catch (err) {
      alert(err.message || 'Error occurred while deleting cinema');
    }
  };

  const autoSeatsTotal = (Number(formData.rowCount) || 8) * (Number(formData.seatsPerRow) || 12);

  const totalVenuesCount = cinemas.length;
  const totalScreensCount = useMemo(() => {
    return cinemas.reduce((acc, c) => acc + (c.screensCount !== undefined ? c.screensCount : (c.screens ? c.screens.length : 0)), 0);
  }, [cinemas]);
  const totalCapacityCount = useMemo(() => {
    return cinemas.reduce((acc, c) => {
      const screens = c.screensCount !== undefined ? c.screensCount : (c.screens ? c.screens.length : 0);
      return acc + (c.totalSeatsCapacity || (screens * 120));
    }, 0);
  }, [cinemas]);
  const totalCitiesCount = useMemo(() => {
    const s = new Set(cinemas.map(c => (c.city || '').trim()).filter(Boolean));
    return s.size;
  }, [cinemas]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Global Actions (Admin Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Venue Infrastructure & Properties
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Cinemas & Venues
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your cinema properties, auditorium seating layouts, and venue facilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {cinemas.length > 0 && (
            <button
              type="button"
              onClick={toggleExpandAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition active:scale-95 cursor-pointer"
              title={allVisibleExpanded ? 'Collapse all dropped cards' : 'Drop down all cards to reveal full layouts'}
            >
              <ChevronsUpDown size={14} className="text-[#F84464]" />
              <span>{allVisibleExpanded ? 'Collapse All Cards' : 'Drop Down All Cards'}</span>
            </button>
          )}

          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 shadow-sm active:scale-95 transition bg-[#F84464] hover:bg-[#E03A58] text-white rounded-lg"
          >
            <Plus size={16} />
            <span>Add Multiplex</span>
          </Button>
        </div>
      </div>

      {/* 1.1 Executive Network Overview KPI Bar (Admin Theme) */}
      {cinemas.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3.5 hover:border-gray-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F84464] flex items-center justify-center shrink-0 border border-rose-100">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Multiplex Properties
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 leading-tight">
                  {totalVenuesCount}
                </span>
                <span className="text-xs text-emerald-600 font-bold">Venues</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3.5 hover:border-gray-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Tv size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Total Auditoriums
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 leading-tight">
                  {totalScreensCount}
                </span>
                <span className="text-xs text-indigo-600 font-bold">Screens</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3.5 hover:border-gray-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Armchair size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Seating Capacity
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 leading-tight">
                  {totalCapacityCount.toLocaleString()}
                </span>
                <span className="text-xs text-purple-600 font-bold">Seats</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3.5 hover:border-gray-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Metro Markets
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 leading-tight">
                  {totalCitiesCount}
                </span>
                <span className="text-xs text-amber-600 font-bold">Cities</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Search and Filter Command Toolbar (Admin Theme) */}
      {cinemas.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search multiplex by name, city, state, or address..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* City Filter Pills */}
            {availableCities.length > 2 && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 shrink-0">City:</span>
                {availableCities.map((cityName) => (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => setSelectedCityFilter(cityName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCityFilter === cityName
                        ? 'bg-red-50 text-[#F84464] border border-[#F84464]/40 font-bold'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium shrink-0">
            <span className="inline-flex items-center gap-1">
              <span className="font-bold text-gray-900">{filteredCinemas.length}</span>
              <span>of {cinemas.length} venues</span>
            </span>
            {(selectedCityFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCityFilter('All');
                }}
                className="text-[11px] font-bold text-[#F84464] hover:underline cursor-pointer ml-1"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-200">
          Loading your cinema venues...
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="No Cinema Venues Added"
          description="Add your first multiplex or theatre to start configuring auditoriums and scheduling movie shows for customers."
          actionText="Add Cinema Venue"
          onAction={openAddModal}
        />
      ) : filteredCinemas.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-gray-200 p-6 space-y-2">
          <p className="text-sm font-semibold text-gray-900">No cinema matches your current search or city filter.</p>
          <p className="text-xs text-gray-500">Try searching for a different theatre name, city, or reset search.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCityFilter('All');
            }}
            className="text-xs font-bold text-[#F84464] hover:underline pt-1 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {filteredCinemas.map((cinema) => {
            const cinemaId = cinema.id || cinema._id;
            const isExpanded = isCardExpanded(cinemaId);
            const screensCount = cinema.screensCount !== undefined ? cinema.screensCount : (cinema.screens ? cinema.screens.length : 0);
            const seatsCount = cinema.totalSeatsCapacity || (screensCount ? screensCount * 120 : 0);
            const facilitiesCount = (cinema.facilities || []).length;

            return (
              <motion.div
                key={cinemaId}
                layout
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`relative bg-white rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm ${
                  isExpanded
                    ? 'border-[#F84464] ring-1 ring-[#F84464]/30 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* 1. Top Header: Reference Tag, Date Added & Operational Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                          REF: #CIN-{(cinemaId || '').slice(-6).toUpperCase()}
                        </span>
                        {cinema.createdAt && (
                          <span className="text-[10px] text-gray-500 font-medium truncate hidden sm:inline">
                            Added {new Date(cinema.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          cinema.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {cinema.status === 'active' && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                        )}
                        <span>{cinema.status === 'active' ? 'Live & Operational' : 'Inactive Venue'}</span>
                      </span>
                    </div>

                    {/* 2. Multiplex Name, City/State & Registered Street Address */}
                    <div className="space-y-2 mt-3">
                      <div
                        onClick={() => openDossierModal(cinema)}
                        className="flex items-start gap-3 cursor-pointer group/title select-none"
                        title={`Click to open full executive dossier for ${cinema.name}`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center shrink-0 shadow-xs group-hover/title:bg-[#F84464] group-hover/title:text-white transition-all duration-300">
                          <Building2 size={21} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-black text-gray-900 leading-snug break-words group-hover/title:text-[#F84464] transition-colors">
                              {cinema.name}
                            </h3>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#F84464] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded opacity-80 group-hover/title:opacity-100 transition-opacity shrink-0">
                              <span>Pop-up</span>
                              <ExternalLink size={8} />
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium mt-0.5">
                            <MapPin size={13} className="text-[#F84464] shrink-0" />
                            <span className="font-bold text-gray-900">{cinema.city}</span>
                            {cinema.state && <span className="text-gray-500 font-normal">• {cinema.state}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Full Physical Address Pill */}
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-2.5 flex items-start gap-2 text-xs">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 mt-0.5">
                          Address:
                        </span>
                        <p className="text-gray-700 font-medium text-[11px] leading-relaxed break-words flex-1">
                          {cinema.address || 'Address registered on partner file.'}
                        </p>
                        {cinema.address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cinema.name}, ${cinema.address}, ${cinema.city}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#F84464] hover:underline flex items-center gap-0.5 shrink-0 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-xs hover:bg-gray-50 transition"
                            title="View on Google Maps"
                          >
                            <span>Maps</span>
                            <ExternalLink size={8} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3. Executive Consolidated Telemetry Dashboard */}
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/80 p-2 grid grid-cols-3 gap-2 text-center divide-x divide-gray-200">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1">
                          <Tv size={13} className="text-indigo-600" />
                          <span className="text-sm sm:text-base font-black text-gray-900 leading-none">
                            {screensCount}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                          Audis
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center pl-2">
                        <div className="flex items-center gap-1">
                          <Armchair size={13} className="text-purple-600" />
                          <span className="text-sm sm:text-base font-black text-gray-900 leading-none">
                            {seatsCount}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                          Total Seats
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center pl-2">
                        <div className="flex items-center gap-1">
                          <Film size={13} className="text-amber-600" />
                          <span className="text-sm sm:text-base font-black text-gray-900 leading-none">
                            {cinema.activeShowsCount !== undefined ? cinema.activeShowsCount : (screensCount > 0 ? 'Live' : 0)}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                          Active Shows
                        </span>
                      </div>
                    </div>

                    {/* 4. Quick Contact Row (Phone & Email) */}
                    {(cinema.contactPhone || cinema.contactEmail) && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                        {cinema.contactPhone && (
                          <a
                            href={`tel:${cinema.contactPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold transition shadow-xs"
                            title="Helpline"
                          >
                            <Phone size={11} className="text-[#F84464]" />
                            <span>{cinema.contactPhone}</span>
                          </a>
                        )}
                        {cinema.contactEmail && (
                          <a
                            href={`mailto:${cinema.contactEmail}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold transition shadow-xs truncate max-w-[190px]"
                            title="Official Email"
                          >
                            <Mail size={11} className="text-gray-400 shrink-0" />
                            <span className="truncate">{cinema.contactEmail}</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* 5. Screens & Amenities Preview */}
                    <div className="mt-3 space-y-2 pt-2 border-t border-gray-100">
                      {cinema.screens && cinema.screens.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                              <Tv size={11} className="text-gray-400" />
                              Auditoriums ({cinema.screens.length})
                            </span>
                            <Link
                              to={`/vendor/screens?cinemaId=${cinemaId}`}
                              className="text-[10px] font-bold text-[#F84464] hover:underline"
                            >
                              Manage Layouts →
                            </Link>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {cinema.screens.slice(0, 3).map((screen, idx) => (
                              <span
                                key={screen._id || idx}
                                className="bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span>{screen.name || `Screen ${idx + 1}`}</span>
                                <span className="text-[9px] text-gray-500 font-normal">({screen.totalCapacity || 120}s)</span>
                              </span>
                            ))}
                            {cinema.screens.length > 3 && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                +{cinema.screens.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Amenities Cloud */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-500" />
                            Amenities ({facilitiesCount})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(cinema.facilities || []).slice(0, 4).map(renderFacilityPill)}
                          {facilitiesCount > 4 && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              +{facilitiesCount - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. Tactile Drop-down Accordion Toggle Bar */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => toggleCardExpand(cinemaId)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
                        isExpanded
                          ? 'bg-red-50 border-red-200 text-[#F84464] shadow-xs'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Layers size={13} className={isExpanded ? 'text-[#F84464]' : 'text-gray-500'} />
                        <span className="font-bold">
                          {isExpanded ? 'Collapse Manifest Details' : 'Drop Down Full Details'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <span className="text-[10px] opacity-75">
                          {isExpanded ? 'Fold' : 'Drop Down'}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                          <ChevronDown size={14} className={isExpanded ? 'text-[#F84464]' : 'text-gray-500'} />
                        </motion.div>
                      </div>
                    </button>

                    {/* 7. Dropped-Down Manifest Container */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="dropped-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: 'easeInOut' }}
                          className="overflow-hidden space-y-3 pt-2"
                        >
                          {/* Section Divider Badge */}
                          <div className="flex items-center gap-2 py-0.5">
                            <span className="text-[9px] uppercase tracking-wider font-black text-[#F84464] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                              Complete Venue Manifest
                            </span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                          </div>

                          {/* Complete Physical Address & Contact Info Box */}
                          <div className="rounded-lg bg-gray-50 border border-gray-200 p-2.5 space-y-2">
                            <div className="flex items-start gap-1.5">
                              <MapPin size={12} className="text-[#F84464] shrink-0 mt-0.5" />
                              <p className="text-[11px] font-medium text-gray-700 leading-relaxed break-words flex-1">
                                {cinema.address || 'Address registered on file.'}
                              </p>
                            </div>

                            <div className="pt-1.5 border-t border-gray-200 flex flex-wrap items-center gap-1.5 text-xs">
                              {cinema.contactPhone && (
                                <a
                                  href={`tel:${cinema.contactPhone}`}
                                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 px-2 py-1 rounded-md border border-gray-200 text-gray-700 text-[11px] font-semibold transition shadow-xs"
                                  title="Direct Helpline"
                                >
                                  <Phone size={11} className="text-[#F84464] shrink-0" />
                                  <span>{cinema.contactPhone}</span>
                                </a>
                              )}

                              {cinema.contactEmail && (
                                <a
                                  href={`mailto:${cinema.contactEmail}`}
                                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 px-2 py-1 rounded-md border border-gray-200 text-gray-700 text-[11px] font-semibold transition shadow-xs break-all"
                                  title="Official Email"
                                >
                                  <Mail size={11} className="text-gray-400 shrink-0" />
                                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{cinema.contactEmail}</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Complete Auditoriums List */}
                          {cinema.screens && cinema.screens.length > 0 ? (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                  <Tv size={11} className="text-gray-400" />
                                  All Auditoriums ({cinema.screens.length})
                                </span>
                                <Link
                                  to={`/vendor/screens?cinemaId=${cinemaId}`}
                                  className="text-[10px] font-bold text-[#F84464] hover:underline"
                                >
                                  Screen Designer →
                                </Link>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {cinema.screens.map((screen, idx) => (
                                  <div
                                    key={screen._id || idx}
                                    className="bg-white border border-gray-200 rounded-md px-2 py-1 shadow-xs text-[10px] sm:text-[11px] flex items-center gap-1.5"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    <span className="font-bold text-gray-900">{screen.name || `Screen ${screen.screenNumber || idx + 1}`}</span>
                                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">
                                      {screen.screenType || 'Standard 2D'}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-medium">
                                      {screen.totalCapacity || 120}s
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle size={13} className="text-amber-600 shrink-0" />
                                <span className="font-medium text-[10px] sm:text-[11px]">No auditoriums configured yet.</span>
                              </div>
                              <Link
                                to={`/vendor/screens?cinemaId=${cinemaId}`}
                                className="shrink-0 px-2 py-0.5 bg-amber-600 text-white rounded-md text-[10px] font-bold hover:bg-amber-700 transition"
                              >
                                + Add Screen
                              </Link>
                            </div>
                          )}

                          {/* All Amenities List */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                All Amenities & Facilities
                              </span>
                              <span className="text-[10px] text-gray-500 font-semibold">
                                {facilitiesCount} Enabled
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {facilitiesCount === 0 ? (
                                <span className="text-gray-400 text-[10px] italic">Standard multiplex amenities enabled on file.</span>
                              ) : (
                                (cinema.facilities || []).map(renderFacilityPill)
                              )}
                            </div>
                          </div>

                          {/* Fold Back Button */}
                          <div className="pt-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleCardExpand(cinemaId)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-900 py-1 px-2.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                              <ChevronUp size={11} />
                              <span>Fold back to summary</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 8. Card Bottom Command Bar */}
                <div className="p-3 sm:px-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/vendor/screens?cinemaId=${cinemaId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E03A58] px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 shrink-0"
                    >
                      <Armchair size={13} className="text-white" />
                      <span>Audis ({screensCount})</span>
                    </Link>

                    <Link
                      to={`/vendor/shows?cinemaId=${cinemaId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm transition shrink-0"
                    >
                      <Film size={13} className="text-indigo-600" />
                      <span>Shows</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openDossierModal(cinema)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#F84464] bg-white hover:bg-red-50 rounded-lg border border-gray-300 transition flex items-center gap-1 shadow-sm cursor-pointer"
                      title={`Open full pop-up dossier for ${cinema.name}`}
                    >
                      <ExternalLink size={12} className="text-[#F84464]" />
                      <span>Pop-up</span>
                    </button>
                    <button
                      onClick={() => openEditModal(cinema)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Edit Venue Details"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(cinema)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-300 transition shadow-sm cursor-pointer"
                      title="Delete Venue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Cinema Modal (Admin Theme) */}
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
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
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
                    className="rounded text-[#F84464] focus:ring-[#F84464] border-gray-300"
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
                        className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-[#F84464]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-700 font-bold block mb-1">Premium (₹)</span>
                      <input
                        type="number"
                        value={formData.premiumPrice}
                        onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                        className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-700 font-bold block mb-1">Normal (₹)</span>
                      <input
                        type="number"
                        value={formData.normalPrice}
                        onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
                        className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-gray-500"
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
                    className={`text-xs px-2.5 py-2 rounded-lg border text-left font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#F84464] bg-red-50 text-[#F84464] font-bold shadow-xs'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{fac}</span>
                    {isSelected && <CheckCircle size={13} className="text-[#F84464]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="px-5 py-2 text-xs font-bold bg-[#F84464] hover:bg-[#E03A58] text-white"
            >
              {isAddModalOpen ? 'Create Venue & Save Layout' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Admin Theme) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCinema}
        title="Delete Cinema Venue"
        description={`Are you sure you want to delete '${selectedCinema?.name}'? All its screens and show layouts will be permanently removed.`}
        confirmText="Yes, Delete Venue"
        variant="destructive"
      />

      {/* Multiplex Executive Dossier Modal (Admin Theme) */}
      <Modal
        isOpen={isDossierModalOpen && Boolean(dossierCinema)}
        onClose={() => {
          setIsDossierModalOpen(false);
          setDossierCinema(null);
        }}
        maxWidth="max-w-2xl"
      >
        {dossierCinema && (
          <div className="space-y-4 p-1 sm:p-2">
            {/* Top Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F84464] to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                      {dossierCinema.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        dossierCinema.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {dossierCinema.status === 'active' && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                      )}
                      <span>{dossierCinema.status === 'active' ? 'Live & Operational' : 'Inactive Venue'}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#F84464]" />
                      <span className="font-bold text-gray-900">{dossierCinema.city}</span>
                      {dossierCinema.state && <span>• {dossierCinema.state}</span>}
                    </div>

                    <span className="text-gray-300">•</span>

                    <button
                      type="button"
                      onClick={() => copyRefToClipboard(`#CIN-${(dossierCinema.id || dossierCinema._id || '').slice(-6).toUpperCase()}`)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 border border-gray-300 transition cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copiedRef ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-gray-500" />}
                      <span>#CIN-{(dossierCinema.id || dossierCinema._id || '').slice(-6).toUpperCase()}</span>
                      {copiedRef && <span className="text-[9px] text-emerald-600 font-sans font-bold">Copied!</span>}
                    </button>

                    {dossierCinema.createdAt && (
                      <span className="text-[11px] text-gray-500">
                        Added on {new Date(dossierCinema.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Telemetry Metric KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-xl font-black text-gray-900 block leading-tight">
                  {dossierCinema.screensCount !== undefined ? dossierCinema.screensCount : (dossierCinema.screens ? dossierCinema.screens.length : 1)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Auditoriums
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
                <span className="text-xl font-black text-gray-900 block leading-tight">
                  {dossierCinema.totalSeatsCapacity || (dossierCinema.screensCount ? dossierCinema.screensCount * 120 : 120)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Total Seats
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-xl font-black text-gray-900 block leading-tight">
                  {dossierCinema.activeShowsCount !== undefined ? dossierCinema.activeShowsCount : 'Live'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Active Shows
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-sm font-black text-emerald-700 block leading-tight pt-1">
                  M-Ticket Gate
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Entry System
                </span>
              </div>
            </div>

            {/* Physical Address & Contact Box */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin size={16} className="text-[#F84464]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Registered Venue Address</span>
                    <p className="text-xs font-semibold text-gray-800 leading-relaxed break-words">
                      {dossierCinema.address || 'Address registered on file.'}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${dossierCinema.name}, ${dossierCinema.address}, ${dossierCinema.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-[11px] font-bold text-gray-700 shadow-xs transition shrink-0"
                >
                  <ExternalLink size={12} className="text-[#F84464]" />
                  <span>Google Maps</span>
                </a>
              </div>

              <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2 text-xs">
                {dossierCinema.contactPhone && (
                  <a
                    href={`tel:${dossierCinema.contactPhone}`}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold transition shadow-xs"
                  >
                    <Phone size={12} className="text-[#F84464]" />
                    <span>{dossierCinema.contactPhone}</span>
                  </a>
                )}

                {dossierCinema.contactEmail && (
                  <a
                    href={`mailto:${dossierCinema.contactEmail}`}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold transition shadow-xs"
                  >
                    <Mail size={12} className="text-gray-400" />
                    <span>{dossierCinema.contactEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Auditoriums / Screens Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Tv size={14} className="text-indigo-600" />
                  <span>Configured Auditoriums & Screen Layouts</span>
                </span>
                <Link
                  to={`/vendor/screens?cinemaId=${dossierCinema.id || dossierCinema._id}`}
                  onClick={() => setIsDossierModalOpen(false)}
                  className="text-xs font-bold text-[#F84464] hover:underline"
                >
                  Open Screen Designer →
                </Link>
              </div>

              {dossierCinema.screens && dossierCinema.screens.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dossierCinema.screens.map((screen, idx) => (
                    <div
                      key={screen._id || idx}
                      className="p-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {screen.name || `Screen ${screen.screenNumber || idx + 1}`}
                          </p>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                            {screen.screenType || 'Standard 2D'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-gray-900 block">
                          {screen.totalCapacity || 120}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Seats</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>No screens configured yet for this multiplex.</span>
                  </div>
                  <Link
                    to={`/vendor/screens?cinemaId=${dossierCinema.id || dossierCinema._id}`}
                    onClick={() => setIsDossierModalOpen(false)}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition"
                  >
                    + Add Screen
                  </Link>
                </div>
              )}
            </div>

            {/* Amenities & Facilities Pills Cloud */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Venue Amenities & Patron Facilities</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(dossierCinema.facilities || []).length === 0 ? (
                  <span className="text-gray-400 text-xs italic">Standard multiplex facilities enabled on file.</span>
                ) : (
                  (dossierCinema.facilities || []).map(renderFacilityPill)
                )}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  to={`/vendor/screens?cinemaId=${dossierCinema.id || dossierCinema._id}`}
                  onClick={() => setIsDossierModalOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E03A58] px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
                >
                  <Armchair size={14} />
                  <span>Configure Audis & Seats</span>
                </Link>

                <Link
                  to={`/vendor/shows?cinemaId=${dossierCinema.id || dossierCinema._id}`}
                  onClick={() => setIsDossierModalOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-300 transition shadow-sm"
                >
                  <Film size={14} className="text-indigo-600" />
                  <span>Manage Shows</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDossierModalOpen(false);
                    openEditModal(dossierCinema);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-300 transition shadow-sm cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit Venue</span>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDossierModalOpen(false)}
                  className="text-xs px-4 py-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
