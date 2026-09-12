import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  Button,
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState,
  SlideOverDrawer
} from '../../components/ui';
import {
  Tv,
  Plus,
  Trash2,
  Armchair,
  MapPin,
  AlertCircle,
  Sliders,
  Calendar,
  Sparkles,
  Eye,
  TrendingUp,
  Search,
  DollarSign,
  Layers,
  ChevronRight,
  Building2,
  ChevronDown,
  Check,
  X
} from 'lucide-react';

const SCREEN_TYPES = [
  'Standard 2D',
  '3D',
  'IMAX 2D',
  'IMAX 3D',
  '4DX',
  'Gold Class'
];

const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

export default function VendorScreensPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cinemaIdParam = searchParams.get('cinemaId') || '';

  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState(cinemaIdParam);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const venueDropdownRef = useRef(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewMatrixModalOpen, setIsPreviewMatrixModalOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);

  // Add Screen Form Data
  const [formData, setFormData] = useState({
    cinemaId: '',
    screenNumber: 'AUDI-1',
    name: 'Screen 1 (Dolby Atmos)',
    screenType: 'Standard 2D',
    rowCount: 8,
    seatsPerRow: 12,
    includeRecliner: true,
    includePremium: true,
    reclinerPrice: 450,
    premiumPrice: 280,
    normalPrice: 180
  });

  // Edit Layout Form Data
  const [editLayoutData, setEditLayoutData] = useState({
    screenName: '',
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

  const loadData = async () => {
    try {
      const [cinemasRes, screensRes] = await Promise.all([
        vendorApi.getCinemas(),
        vendorApi.getScreens(selectedCinemaId)
      ]);

      if (cinemasRes.success) {
        setCinemas(cinemasRes.data || []);
      }
      if (screensRes.success) {
        setScreens(screensRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load screens data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCinemaId]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['SCREEN_MUTATION'], () => {
    loadData();
  });

  const handleCinemaFilterChange = (cinemaId) => {
    setSelectedCinemaId(cinemaId);
    if (cinemaId) setSearchParams({ cinemaId });
    else setSearchParams({});
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (venueDropdownRef.current && !venueDropdownRef.current.contains(event.target)) {
        setIsVenueDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCinema = useMemo(() => {
    return cinemas.find(c => (c.id || c._id) === selectedCinemaId);
  }, [cinemas, selectedCinemaId]);

  // Helper to build array of rows given config
  const buildSeatingLayout = (rowCount, seatsPerRow, includeRecliner, includePremium, recPrice, premPrice, normPrice) => {
    const count = Math.min(Math.max(4, Number(rowCount) || 8), ROW_LETTERS.length);
    const seats = Math.min(Math.max(6, Number(seatsPerRow) || 12), 24);
    const letters = ROW_LETTERS.slice(0, count);

    return letters.map((letter, index) => {
      let tier = 'Normal';
      let basePrice = Number(normPrice) || 180;
      let seatsCount = seats;

      if (index === 0 && includeRecliner) {
        tier = 'Recliner';
        basePrice = Number(recPrice) || 450;
        seatsCount = Math.max(6, seats - 4); // Recliner seats are wider
      } else if (index < 4 && includePremium) {
        tier = 'Premium';
        basePrice = Number(premPrice) || 280;
        seatsCount = seats;
      }

      return {
        row: letter,
        tier,
        basePrice,
        seatsCount,
        disabledSeats: []
      };
    });
  };

  const openAddModal = () => {
    const defaultCinemaId = selectedCinemaId || (cinemas[0]?.id || cinemas[0]?._id || '');
    setFormData({
      cinemaId: defaultCinemaId,
      screenNumber: `AUDI-${screens.length + 1}`,
      name: `Screen ${screens.length + 1} (Dolby Atmos)`,
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

  const openEditLayoutModal = (screen) => {
    setSelectedScreen(screen);

    const layout = screen.seatingLayout || [];
    const rowCount = layout.length || 8;
    const seatsPerRow = layout[0]?.seatsCount || 12;

    const hasRecliner = layout.some(r => r.tier === 'Recliner');
    const hasPremium = layout.some(r => r.tier === 'Premium');

    const reclinerRow = layout.find(r => r.tier === 'Recliner');
    const premiumRow = layout.find(r => r.tier === 'Premium');
    const normalRow = layout.find(r => r.tier === 'Normal') || layout[layout.length - 1];

    setEditLayoutData({
      screenName: screen.name,
      screenType: screen.screenType || 'Standard 2D',
      rowCount,
      seatsPerRow,
      includeRecliner: hasRecliner,
      includePremium: hasPremium,
      reclinerPrice: reclinerRow ? reclinerRow.basePrice : 450,
      premiumPrice: premiumRow ? premiumRow.basePrice : 280,
      normalPrice: normalRow ? normalRow.basePrice : 180
    });

    setFormError('');
    setIsEditLayoutModalOpen(true);
  };

  const openPreviewMatrixModal = (screen) => {
    setSelectedScreen(screen);
    setIsPreviewMatrixModalOpen(true);
  };

  const openDeleteModal = (screen) => {
    setSelectedScreen(screen);
    setIsDeleteModalOpen(true);
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!formData.cinemaId || !formData.screenNumber || !formData.name) {
      setFormError('Cinema, screen identifier, and screen name are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const layout = buildSeatingLayout(
      formData.rowCount,
      formData.seatsPerRow,
      formData.includeRecliner,
      formData.includePremium,
      formData.reclinerPrice,
      formData.premiumPrice,
      formData.normalPrice
    );

    const calculatedCapacity = layout.reduce((acc, r) => acc + r.seatsCount, 0);

    try {
      const res = await vendorApi.createScreen({
        cinemaId: formData.cinemaId,
        screenNumber: formData.screenNumber.trim(),
        name: formData.name.trim(),
        screenType: formData.screenType,
        seatingLayout: layout,
        totalCapacity: calculatedCapacity
      });

      if (res.success) {
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create auditorium screen.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveEditedLayout = async (e) => {
    e.preventDefault();
    if (!selectedScreen) return;
    if (!editLayoutData.screenName) {
      setFormError('Auditorium name is required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const layout = buildSeatingLayout(
      editLayoutData.rowCount,
      editLayoutData.seatsPerRow,
      editLayoutData.includeRecliner,
      editLayoutData.includePremium,
      editLayoutData.reclinerPrice,
      editLayoutData.premiumPrice,
      editLayoutData.normalPrice
    );

    const calculatedCapacity = layout.reduce((acc, r) => acc + r.seatsCount, 0);

    try {
      const res = await vendorApi.updateScreen(selectedScreen.id || selectedScreen._id, {
        name: editLayoutData.screenName.trim(),
        screenType: editLayoutData.screenType,
        seatingLayout: layout,
        totalCapacity: calculatedCapacity
      });

      if (res.success) {
        setIsEditLayoutModalOpen(false);
        await loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update screen layout.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteScreen = async () => {
    if (!selectedScreen) return;
    try {
      const res = await vendorApi.deleteScreen(selectedScreen.id || selectedScreen._id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete screen');
    }
  };

  // Compute live preview layout for edit modal
  const previewEditLayout = buildSeatingLayout(
    editLayoutData.rowCount,
    editLayoutData.seatsPerRow,
    editLayoutData.includeRecliner,
    editLayoutData.includePremium,
    editLayoutData.reclinerPrice,
    editLayoutData.premiumPrice,
    editLayoutData.normalPrice
  );
  const previewTotalCapacity = previewEditLayout.reduce((acc, r) => acc + r.seatsCount, 0);

  // ----------------------------------------------------
  // Senior Software Engineer Architectural Computations
  // ----------------------------------------------------
  const filteredScreens = useMemo(() => {
    return screens.filter(screen => {
      // 1. Format Filter
      if (selectedFormat !== 'all') {
        const type = (screen.screenType || '').toLowerCase();
        if (selectedFormat === 'imax' && !type.includes('imax')) return false;
        if (selectedFormat === '4dx' && !type.includes('4dx')) return false;
        if (selectedFormat === 'gold' && !type.includes('gold')) return false;
        if (selectedFormat === 'standard' && (type.includes('imax') || type.includes('4dx') || type.includes('gold'))) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = (screen.name || '').toLowerCase().includes(query);
        const numberMatch = (screen.screenNumber || '').toLowerCase().includes(query);
        const typeMatch = (screen.screenType || '').toLowerCase().includes(query);
        const cinemaMatch = (screen.cinema?.name || '').toLowerCase().includes(query);
        if (!nameMatch && !numberMatch && !typeMatch && !cinemaMatch) return false;
      }

      return true;
    });
  }, [screens, selectedFormat, searchQuery]);

  // Executive KPI Summary Bar
  const metrics = useMemo(() => {
    const totalScreens = screens.length;
    const totalCapacity = screens.reduce((acc, s) => acc + (s.totalCapacity || 0), 0);
    const premiumScreens = screens.filter(s => {
      const t = (s.screenType || '').toLowerCase();
      return t.includes('imax') || t.includes('4dx') || t.includes('gold');
    }).length;

    const totalRecliners = screens.reduce((acc, s) => {
      return acc + (s.seatingLayout || [])
        .filter(r => r.tier === 'Recliner')
        .reduce((sum, r) => sum + r.seatsCount, 0);
    }, 0);

    const maxCycleGross = screens.reduce((acc, s) => {
      return acc + (s.seatingLayout || []).reduce((sum, r) => sum + (r.seatsCount * (r.basePrice || 180)), 0);
    }, 0);

    return {
      totalScreens,
      totalCapacity,
      premiumScreens,
      totalRecliners,
      maxCycleGross
    };
  }, [screens]);

  // Format Helper for Dynamic Accents
  const getFormatBadgeStyle = (formatStr = '') => {
    const f = formatStr.toLowerCase();
    if (f.includes('imax')) {
      return {
        ribbon: 'from-violet-600 via-indigo-600 to-purple-700',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
        icon: Sparkles
      };
    }
    if (f.includes('4dx')) {
      return {
        ribbon: 'from-amber-500 via-orange-500 to-red-600',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        icon: TrendingUp
      };
    }
    if (f.includes('gold')) {
      return {
        ribbon: 'from-amber-400 via-yellow-500 to-amber-600',
        badgeBg: 'bg-yellow-50 text-amber-900 border-amber-300',
        icon: Armchair
      };
    }
    return {
      ribbon: 'from-indigo-600 via-blue-600 to-cyan-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Tv
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Tv size={12} />
              Auditorium Infrastructure & Physical Inventory
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Multi-Tier Seating Engines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Auditorium Screens & Seating Layouts
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Configure hall dimensions, projection formats, and tiered seating layouts (Recliner, Premium, Classic) across your multiplex properties.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          disabled={cinemas.length === 0}
          className="inline-flex items-center gap-2 shadow-sm font-bold bg-[#F84464] hover:bg-[#E23454] px-4 py-2.5 rounded-xl text-white transition shrink-0"
        >
          <Plus size={18} />
          <span>Add Auditorium Screen</span>
        </Button>
      </div>

      {/* Senior Executive KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Auditoriums */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Infrastructure
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Auditoriums
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {metrics.totalScreens}
              </span>
              <span className="text-xs font-semibold text-slate-400">screens</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Halls
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              {cinemas.length} {cinemas.length === 1 ? 'Venue' : 'Venues'}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Seats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Auditorium Capacity
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Total Seats
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F84464] border border-rose-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Armchair size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {metrics.totalCapacity.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-slate-400">chairs</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-[#F84464] border border-rose-200/60">
              <Armchair size={12} />
              {metrics.totalRecliners} Recliners
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Total Capacity
            </span>
          </div>
        </div>

        {/* Metric 3: Premium Halls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Format Hierarchy
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Premium Halls
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {metrics.premiumScreens}
              </span>
              <span className="text-xs font-semibold text-slate-400">halls</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200/60">
              <Sparkles size={12} />
              IMAX / 4DX
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Special Formats
            </span>
          </div>
        </div>

        {/* Metric 4: Max Potential / Show */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Hall Yield
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Max Potential / Show
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ₹{metrics.maxCycleGross.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <TrendingUp size={12} />
              100% Full House
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Per Showtime
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          BOOKMYSHOW MULTIPLEX DROPDOWN & SEARCH TOOLBAR
          ======================================================== */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 relative z-20">
        {/* Left: Custom BookMyShow Multiplex Selector Dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative" ref={venueDropdownRef}>
            <button
              type="button"
              onClick={() => setIsVenueDropdownOpen(prev => !prev)}
              className={`w-full sm:w-auto min-w-[260px] sm:min-w-[300px] max-w-[380px] px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${
                selectedCinemaId
                  ? 'bg-rose-50/50 border-[#F84464] ring-2 ring-[#F84464]/15'
                  : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                  selectedCinemaId
                    ? 'bg-[#F84464] text-white border-[#F84464]'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}>
                  {selectedCinemaId ? <MapPin size={15} /> : <Building2 size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block leading-none mb-1">
                    Select Multiplex
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate block leading-tight">
                    {activeCinema ? activeCinema.name : `All Multiplexes (${screens.length} Screens)`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                {selectedCinemaId ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#F84464] border border-rose-200 shadow-2xs">
                    {activeCinema?.screensCount || 1} Audis
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    {cinemas.length} Venues
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isVenueDropdownOpen ? 'rotate-180 text-slate-800' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu Panel */}
            {isVenueDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-[350px] bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Multiplex Properties</span>
                  <span className="font-semibold text-slate-500">{cinemas.length} Venues Active</span>
                </div>

                {/* Options List */}
                <div className="max-h-72 overflow-y-auto py-1">
                  {/* Option: All Multiplexes */}
                  <button
                    type="button"
                    onClick={() => {
                      handleCinemaFilterChange('');
                      setIsVenueDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition text-xs cursor-pointer ${
                      !selectedCinemaId
                        ? 'bg-rose-50 text-[#F84464] font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        !selectedCinemaId ? 'bg-[#F84464] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Building2 size={14} />
                      </div>
                      <div>
                        <p className="font-bold">All Multiplexes</p>
                        <p className="text-[10px] text-slate-400">All venues directory combined</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {screens.length} Screens
                      </span>
                      {!selectedCinemaId && <Check size={14} className="text-[#F84464]" />}
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {/* Option: Each Cinema (Varun-Solutions, PVR The Mall Shimla, Hari Om, CineWorld: Grand Mall IMAX, etc.) */}
                  {cinemas.map((c) => {
                    const id = c.id || c._id;
                    const isSelected = selectedCinemaId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          handleCinemaFilterChange(id);
                          setIsVenueDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-[#F84464] font-bold'
                            : 'hover:bg-slate-50 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#F84464] text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <MapPin size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate" title={c.name}>{c.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {c.city}{c.state ? `, ${c.state}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-rose-100 text-[#F84464]' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {c.screensCount || 1} {c.screensCount === 1 ? 'Audi' : 'Audis'}
                          </span>
                          {isSelected && <Check size={14} className="text-[#F84464]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedCinemaId && (
            <button
              type="button"
              onClick={() => handleCinemaFilterChange('')}
              className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-[#F84464] hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
              title="Clear selected venue filter"
            >
              <X size={13} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Right: Search Box & Format Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search screen name, audi number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Format Filter Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'imax', label: 'IMAX' },
              { id: '4dx', label: '4DX' },
              { id: 'standard', label: 'Standard 2D' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormat(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  selectedFormat === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading Auditorium Infrastructure...</p>
          <p className="text-xs text-slate-400">Rendering multi-tier seating layouts & base fares</p>
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="Add a Cinema Venue First"
          description="You need to add at least one cinema multiplex venue before configuring auditoriums and seating layouts."
          actionText="Add Cinema Venue"
          onAction={() => window.location.href = '/vendor/cinemas'}
        />
      ) : filteredScreens.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <Tv size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No Auditorium Screens Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No screens match "${searchQuery}". Try clearing search or format filters.`
                : 'Configure your first auditorium screen (e.g. Audi 1 Dolby Atmos, IMAX Laser) with tiered seat configurations.'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#E23454] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <Plus size={15} />
            <span>Add Auditorium Screen</span>
          </Button>
        </div>
      ) : (
        /* ========================================================
           SENIOR SOFTWARE ENGINEER MULTI-TIER SCREEN CARDS
           ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredScreens.map((screen) => {
            const formatStyle = getFormatBadgeStyle(screen.screenType);
            const FormatIcon = formatStyle.icon;

            const layout = screen.seatingLayout || [];
            const rowCount = layout.length;
            const lastRowLetter = layout[layout.length - 1]?.row || 'H';

            // Counts per tier
            const reclinerRows = layout.filter(r => r.tier === 'Recliner');
            const premiumRows = layout.filter(r => r.tier === 'Premium');
            const normalRows = layout.filter(r => r.tier === 'Normal');

            const reclinerCount = reclinerRows.reduce((sum, r) => sum + r.seatsCount, 0);
            const premiumCount = premiumRows.reduce((sum, r) => sum + r.seatsCount, 0);
            const normalCount = normalRows.reduce((sum, r) => sum + r.seatsCount, 0);

            const reclinerPrice = reclinerRows[0]?.basePrice || 450;
            const premiumPrice = premiumRows[0]?.basePrice || 280;
            const normalPrice = normalRows[0]?.basePrice || 180;

            const maxScreenGross = layout.reduce((sum, r) => sum + (r.seatsCount * (r.basePrice || 180)), 0);

            // Proportions for visual progress bar
            const total = screen.totalCapacity || 1;
            const reclinerPct = Math.round((reclinerCount / total) * 100);
            const premiumPct = Math.round((premiumCount / total) * 100);
            const normalPct = Math.max(0, 100 - reclinerPct - premiumPct);

            return (
              <div
                key={screen.id || screen._id}
                className="bg-white rounded-3xl border border-slate-100/90 hover:border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-5.5 space-y-3.5">
                  {/* 1. Header: Screen Number, Full Name, Venue & Format Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="font-mono font-black text-xs uppercase px-2.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-2xs shrink-0 tracking-wider">
                        {screen.screenNumber || 'AUDI'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-base font-extrabold text-slate-900 leading-snug break-words group-hover:text-[#F84464] transition-colors"
                        >
                          {screen.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium break-words">
                          <MapPin size={12} className="text-[#F84464] shrink-0" />
                          <span className="font-semibold text-slate-700">{screen.cinema?.name || 'Multiplex Venue'}</span>
                          {screen.cinema?.city && (
                            <span className="text-slate-400">• {screen.cinema.city}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${formatStyle.badgeBg}`}>
                      <FormatIcon size={11} />
                      <span>{screen.screenType || 'Standard 2D'}</span>
                    </span>
                  </div>

                  {/* 2. Key Metrics Strip (Capacity • Rows • Max Yield) */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-2.5 rounded-2xl border border-slate-100 text-center">
                    <div className="border-r border-slate-200/60 pr-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Capacity</span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">{screen.totalCapacity || 120}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total Seats</span>
                    </div>
                    <div className="border-r border-slate-200/60 px-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Layout</span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">{rowCount} Rows</span>
                      <span className="text-[10px] text-slate-500 font-medium">A to {lastRowLetter}</span>
                    </div>
                    <div className="pl-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Max Gross</span>
                      <span className="text-sm font-black text-emerald-700 block mt-0.5 truncate">₹{maxScreenGross.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Full House</span>
                    </div>
                  </div>

                  {/* 3. Seating Tiers & Base Fares Breakdown (All Content Visible) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        Tier Inventory & Base Fares
                      </span>
                      <span className="font-bold text-slate-600 font-mono text-[10px]">
                        {reclinerCount > 0 ? '3 Tiers Active' : '2 Tiers Active'}
                      </span>
                    </div>

                    {/* Slim Segmented Color Ratio Bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden flex shadow-2xs bg-slate-100">
                      {reclinerCount > 0 && (
                        <div
                          style={{ width: `${reclinerPct}%` }}
                          className="bg-[#F84464] h-full transition-all duration-300"
                          title={`Recliner VIP: ${reclinerCount} seats (${reclinerPct}%)`}
                        />
                      )}
                      {premiumCount > 0 && (
                        <div
                          style={{ width: `${premiumPct}%` }}
                          className="bg-indigo-600 h-full transition-all duration-300"
                          title={`Premium: ${premiumCount} seats (${premiumPct}%)`}
                        />
                      )}
                      {normalCount > 0 && (
                        <div
                          style={{ width: `${normalPct}%` }}
                          className="bg-slate-400 h-full transition-all duration-300"
                          title={`Normal Classic: ${normalCount} seats (${normalPct}%)`}
                        />
                      )}
                    </div>

                    {/* Detailed Pricing & Seat Count Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                      {reclinerCount > 0 ? (
                        <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-1.5 text-center">
                          <span className="text-[10px] font-bold text-rose-700 block">Recliner VIP</span>
                          <span className="font-black text-slate-900 text-xs">₹{reclinerPrice}</span>
                          <span className="text-[10px] text-slate-500 block">{reclinerCount} seats</span>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5 text-center opacity-60">
                          <span className="text-[10px] font-semibold text-slate-400 block">Recliner</span>
                          <span className="font-semibold text-slate-400 text-xs">—</span>
                          <span className="text-[10px] text-slate-400 block">None</span>
                        </div>
                      )}

                      <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-1.5 text-center">
                        <span className="text-[10px] font-bold text-indigo-700 block">Premium</span>
                        <span className="font-black text-slate-900 text-xs">₹{premiumPrice}</span>
                        <span className="text-[10px] text-slate-500 block">{premiumCount} seats</span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 text-center">
                        <span className="text-[10px] font-bold text-slate-700 block">Classic</span>
                        <span className="font-black text-slate-900 text-xs">₹{normalPrice}</span>
                        <span className="text-[10px] text-slate-500 block">{normalCount} seats</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Compact Interactive Seating Matrix Bar */}
                  <div className="rounded-2xl bg-slate-900 text-white p-2.5 px-3.5 flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-2.5 text-xs min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-cyan-400">
                        <Armchair size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-cyan-300 font-bold block uppercase tracking-wider">
                          Seat Map Matrix
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium truncate block">
                          Curved screen with {rowCount} tiers configured
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openPreviewMatrixModal(screen)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 border border-white/10"
                      title="Inspect full seat layout matrix"
                    >
                      <Eye size={12} />
                      <span>Inspect Grid</span>
                    </button>
                  </div>
                </div>

                {/* 5. Card Footer Actions: Compact Command Bar */}
                <div className="p-3.5 sm:px-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditLayoutModal(screen)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#e03a58] px-3.5 py-2 rounded-xl shadow-[0_4px_12px_rgba(248,68,100,0.3)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                    >
                      <Sliders size={13} className="text-rose-100" />
                      <span>Configure Layout</span>
                    </button>

                    <Link
                      to="/vendor/shows"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl transition shadow-2xs"
                      title="Schedule shows on this auditorium"
                    >
                      <Calendar size={13} className="text-indigo-600" />
                      <span>Schedule</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openDeleteModal(screen)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/80 hover:border-rose-200 transition shadow-2xs cursor-pointer"
                      title="Delete Screen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          ADD SCREEN SLIDE-OVER DRAWER
          ======================================================== */}
      <SlideOverDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Auditorium Screen & Seating Layout"
        subtitle="Configure auditorium format, dimensions, and tier pricing"
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateScreen} className="space-y-4">
          <Select
            label="Cinema Multiplex"
            required
            value={formData.cinemaId}
            onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
            options={cinemas.map(c => ({ value: c.id || c._id, label: `${c.name} (${c.city})` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Screen Identifier"
              required
              placeholder="e.g. AUDI-1"
              value={formData.screenNumber}
              onChange={(e) => setFormData({ ...formData, screenNumber: e.target.value })}
            />
            <Select
              label="Screen Format"
              value={formData.screenType}
              onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
              options={SCREEN_TYPES.map(t => ({ value: t, label: t }))}
            />
          </div>

          <Input
            label="Auditorium Display Name"
            required
            placeholder="e.g. Audi 1 (Dolby Atmos)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* Seat Layout Customizer */}
          <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Armchair size={15} className="text-[#F84464]" />
                <span>Auditorium Layout Dimensions</span>
              </span>
              <span className="text-xs font-bold text-[#F84464]">
                Total: {(Number(formData.rowCount) || 8) * (Number(formData.seatsPerRow) || 12)} Seats
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Number of Rows (A to ...)"
                type="number"
                min={4}
                max={14}
                value={formData.rowCount}
                onChange={(e) => setFormData({ ...formData, rowCount: e.target.value })}
              />
              <Input
                label="Seats Per Row"
                type="number"
                min={6}
                max={24}
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: e.target.value })}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeRecliner}
                    onChange={(e) => setFormData({ ...formData, includeRecliner: e.target.checked })}
                    className="rounded text-[#F84464] focus:ring-[#F84464]"
                  />
                  <span>Recliner Luxury Tier (Row A)</span>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={formData.reclinerPrice}
                    onChange={(e) => setFormData({ ...formData, reclinerPrice: e.target.value })}
                    disabled={!formData.includeRecliner}
                  />
                </div>
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includePremium}
                    onChange={(e) => setFormData({ ...formData, includePremium: e.target.checked })}
                    className="rounded text-[#F84464] focus:ring-[#F84464]"
                  />
                  <span>Premium Tier (Rows B-D)</span>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={formData.premiumPrice}
                    onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                    disabled={!formData.includePremium}
                  />
                </div>
              </label>

              <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                <span>Normal Tier (Remaining Rows)</span>
                <div className="w-24">
                  <Input
                    type="number"
                    value={formData.normalPrice}
                    onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="bg-[#F84464] hover:bg-[#E23454] text-white font-bold"
            >
              Build & Save Screen
            </Button>
          </div>
        </form>
      </SlideOverDrawer>

      {/* ========================================================
          EDIT / CUSTOMIZE SEATING LAYOUT MODAL
          ======================================================== */}
      <Modal
        isOpen={isEditLayoutModalOpen}
        onClose={() => setIsEditLayoutModalOpen(false)}
        title={`Configure Seating Layout • ${selectedScreen?.name || 'Auditorium'}`}
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEditedLayout} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Auditorium Name"
              required
              value={editLayoutData.screenName}
              onChange={(e) => setEditLayoutData({ ...editLayoutData, screenName: e.target.value })}
            />
            <Select
              label="Format / Projection"
              value={editLayoutData.screenType}
              onChange={(e) => setEditLayoutData({ ...editLayoutData, screenType: e.target.value })}
              options={SCREEN_TYPES.map(t => ({ value: t, label: t }))}
            />
          </div>

          {/* Sliders & Tier Settings */}
          <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders size={16} className="text-[#F84464]" />
                <span>Auditorium Matrix Dimensions</span>
              </span>
              <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Total Capacity: {previewTotalCapacity} Seats
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rows: {editLayoutData.rowCount} (A to {ROW_LETTERS[Math.min(editLayoutData.rowCount - 1, ROW_LETTERS.length - 1)]})
                </label>
                <input
                  type="range"
                  min={4}
                  max={14}
                  value={editLayoutData.rowCount}
                  onChange={(e) => setEditLayoutData({ ...editLayoutData, rowCount: Number(e.target.value) })}
                  className="w-full accent-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seats per Row: {editLayoutData.seatsPerRow}
                </label>
                <input
                  type="range"
                  min={6}
                  max={20}
                  value={editLayoutData.seatsPerRow}
                  onChange={(e) => setEditLayoutData({ ...editLayoutData, seatsPerRow: Number(e.target.value) })}
                  className="w-full accent-[#F84464]"
                />
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Recliner (Row A)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.reclinerPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, reclinerPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-700 mb-1">
                  Premium (B-D)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.premiumPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, premiumPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Normal Tier
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.normalPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, normalPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Visual Seat Grid Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Live Interactive Layout Matrix
              </span>
              <span className="text-[11px] text-slate-400">
                Auditorium floor plan preview
              </span>
            </div>

            {/* Screen Banner */}
            <div className="text-center mb-3">
              <div className="w-2/3 mx-auto h-2 bg-gradient-to-b from-indigo-400 to-transparent rounded-t-full shadow-xs" />
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Screen This Way</p>
            </div>

            {/* Seat Rows Matrix */}
            <div className="p-4 bg-[#1e202e] rounded-xl overflow-x-auto space-y-2 max-h-64 shadow-inner">
              {previewEditLayout.map((row) => (
                <div key={row.row} className="flex items-center gap-2 justify-center min-w-max">
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                    {row.row}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: row.seatsCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-5 h-5 rounded text-[8px] font-mono flex items-center justify-center font-bold shadow-xs transition ${
                          row.tier === 'Recliner'
                            ? 'bg-[#F84464] text-white'
                            : row.tier === 'Premium'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                        title={`${row.row}-${idx + 1} (${row.tier} • ₹${row.basePrice})`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 ml-2 w-14">
                    ₹{row.basePrice}
                  </span>
                </div>
              ))}
            </div>

            {/* Color Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#F84464]" />
                <span>Recliner (₹{editLayoutData.reclinerPrice})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-500" />
                <span>Premium (₹{editLayoutData.premiumPrice})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-300" />
                <span>Normal (₹{editLayoutData.normalPrice})</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditLayoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="bg-[#F84464] hover:bg-[#E23454] text-white font-bold px-6"
            >
              Save Seating Layout
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          INTERACTIVE SEATING GRID PREVIEW MODAL
          ======================================================== */}
      <Modal
        isOpen={isPreviewMatrixModalOpen}
        onClose={() => setIsPreviewMatrixModalOpen(false)}
        title={`Full Seating Matrix • ${selectedScreen?.name || 'Auditorium'}`}
        maxWidth="max-w-2xl"
      >
        {selectedScreen && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">{selectedScreen.name}</span>
                <span className="text-slate-500"> • {selectedScreen.cinema?.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {selectedScreen.totalCapacity} Total Seats
                </span>
                <span className="text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {(selectedScreen.seatingLayout || []).length} Rows
                </span>
              </div>
            </div>

            {/* Screen Banner */}
            <div className="text-center py-2">
              <div className="w-3/4 mx-auto h-2 bg-gradient-to-b from-indigo-400 via-indigo-300 to-transparent rounded-t-full shadow-xs" />
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
                Curved Cinema Projection Screen
              </p>
            </div>

            {/* Seating Grid */}
            <div className="p-4 bg-[#1a1c29] rounded-xl overflow-x-auto space-y-2.5 max-h-80 shadow-inner">
              {(selectedScreen.seatingLayout || []).map((row) => (
                <div key={row.row} className="flex items-center gap-2 justify-center min-w-max">
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                    {row.row}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: row.seatsCount || 12 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded text-[9px] font-mono flex items-center justify-center font-bold shadow-xs transition ${
                          row.tier === 'Recliner'
                            ? 'bg-[#F84464] text-white shadow-rose-900/40'
                            : row.tier === 'Premium'
                            ? 'bg-indigo-500 text-white shadow-indigo-900/40'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                        title={`${row.row}-${idx + 1} (${row.tier} • Base: ₹${row.basePrice})`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 ml-2 w-16 text-right">
                    ₹{row.basePrice}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#F84464]" />
                <span>Recliner VIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-500" />
                <span>Premium Tier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-300" />
                <span>Normal Classic</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteScreen}
        title="Delete Auditorium Screen"
        message={`Are you sure you want to delete '${selectedScreen?.name}'? This will permanently remove its tiered seating layout.`}
        confirmText="Yes, Delete Screen"
        type="danger"
      />
    </div>
  );
}
