import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import {
  Button,
  Card,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState
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
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronRight,
  Info
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
  const navigate = useNavigate();

  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState(cinemaIdParam);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');

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

  const handleCinemaFilterChange = (cinemaId) => {
    setSelectedCinemaId(cinemaId);
    if (cinemaId) setSearchParams({ cinemaId });
    else setSearchParams({});
  };

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Screens */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Auditoriums
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {metrics.totalScreens}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Active Halls
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Seating Capacity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#F84464] border border-rose-100 flex items-center justify-center shrink-0">
            <Armchair size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Seats
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {metrics.totalCapacity}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Capacity
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Premium & Format Mix */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Premium Halls
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {metrics.premiumScreens}
              </span>
              <span className="text-[11px] font-bold text-violet-700">
                IMAX / 4DX
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Max Potential Box Office Per Cycle */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Max Potential / Show
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{metrics.maxCycleGross.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Full Hall
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Cinema Venue Pills */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <button
            onClick={() => handleCinemaFilterChange('')}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 ${
              !selectedCinemaId
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Multiplexes ({screens.length})
          </button>

          {cinemas.map((c) => {
            const id = c.id || c._id;
            const isSelected = selectedCinemaId === id;
            return (
              <button
                key={id}
                onClick={() => handleCinemaFilterChange(id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#F84464] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin size={12} className={isSelected ? 'text-white' : 'text-[#F84464]'} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search & Format Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search screen or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] transition"
            />
          </div>

          {/* Format Tabs */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'imax', label: 'IMAX' },
              { id: '4dx', label: '4DX' },
              { id: 'standard', label: 'Standard 2D' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFormat(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group relative"
              >
                {/* Format Top Gradient Accent Ribbon */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${formatStyle.ribbon}`} />

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Screen Header & Format Tags */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Audi Identifier */}
                        <span className="font-mono font-black text-xs uppercase px-2.5 py-0.5 rounded-md bg-slate-900 text-white shadow-2xs">
                          {screen.screenNumber}
                        </span>

                        {/* Screen Format Badge */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${formatStyle.badgeBg}`}>
                          <FormatIcon size={12} />
                          <span>{screen.screenType || 'Standard 2D'}</span>
                        </span>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditLayoutModal(screen)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Configure Seating Layout"
                        >
                          <Sliders size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(screen)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Screen"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Screen Full Title (Zero Truncation) */}
                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors break-words">
                      {screen.name}
                    </h3>

                    {/* Cinema Venue Location */}
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium break-words">
                      <MapPin size={13} className="text-[#F84464] shrink-0" />
                      <span>{screen.cinema?.name || 'Cinema Multiplex'}</span>
                      {screen.cinema?.city && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{screen.cinema.city}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Operational Metrics Triad */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 text-center">
                    <div className="border-r border-slate-200/70 pr-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Capacity
                      </p>
                      <p className="text-base font-mono font-black text-slate-900 mt-0.5">
                        {screen.totalCapacity}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Seats</p>
                    </div>

                    <div className="border-r border-slate-200/70 px-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Rows
                      </p>
                      <p className="text-base font-mono font-black text-slate-900 mt-0.5">
                        {rowCount}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">A to {lastRowLetter}</p>
                    </div>

                    <div className="pl-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Max Gross
                      </p>
                      <p className="text-base font-mono font-black text-emerald-700 mt-0.5">
                        ₹{maxScreenGross.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Per Show</p>
                    </div>
                  </div>

                  {/* Tiered Seating Proportional Spectrum Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Seating Tier Proportions
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-700">
                        {reclinerCount > 0 ? '3 Tiers' : '2 Tiers'} Configured
                      </span>
                    </div>

                    {/* Segmented Color Spectrum Bar */}
                    <div className="w-full h-3 rounded-full overflow-hidden flex shadow-inner bg-slate-100">
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

                    {/* Legend Chips with Base Fares (No Cut-Offs) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                      {reclinerCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-[#F84464] border border-rose-100/90 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F84464]" />
                          <span>Recliner ({reclinerCount}): <strong>₹{reclinerPrice}</strong></span>
                        </span>
                      )}
                      {premiumCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100/90 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          <span>Premium ({premiumCount}): <strong>₹{premiumPrice}</strong></span>
                        </span>
                      )}
                      {normalCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Normal ({normalCount}): <strong>₹{normalPrice}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini Floor Plan Preview with Screen Curve */}
                  <div className="bg-slate-900 rounded-xl p-3 text-white space-y-2 relative overflow-hidden">
                    {/* Curved Screen Banner */}
                    <div className="text-center pt-1 pb-1">
                      <div className="w-3/4 mx-auto h-1.5 bg-gradient-to-b from-indigo-400 via-indigo-300 to-transparent rounded-t-full shadow-sm" />
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5 font-mono">
                        Auditorium Screen Direction
                      </p>
                    </div>

                    {/* Miniature Row Distribution */}
                    <div className="space-y-1 py-1 max-h-28 overflow-y-auto pr-1">
                      {layout.map((row) => (
                        <div key={row.row} className="flex items-center justify-between text-[10px] font-mono text-slate-300 px-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 font-bold text-slate-400">{row.row}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                row.tier === 'Recliner'
                                  ? 'bg-[#F84464]'
                                  : row.tier === 'Premium'
                                  ? 'bg-indigo-400'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span className="text-slate-300 text-[10px]">{row.tier}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{row.seatsCount} Seats</span>
                            <span className="text-emerald-400 font-bold">₹{row.basePrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditLayoutModal(screen)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 px-3 py-2 rounded-xl transition shadow-2xs"
                    >
                      <Sliders size={14} className="text-indigo-600" />
                      <span>Configure Seats</span>
                    </button>

                    <button
                      onClick={() => openPreviewMatrixModal(screen)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition shadow-2xs"
                      title="Inspect Full Seat Matrix"
                    >
                      <Eye size={14} className="text-slate-500" />
                      <span>View Grid</span>
                    </button>
                  </div>

                  <Link
                    to={`/vendor/shows`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F84464] hover:text-white hover:bg-[#F84464] bg-rose-50/80 border border-rose-200/70 px-3 py-2 rounded-xl transition"
                    title="Program movie showtimes on this screen"
                  >
                    <Calendar size={13} />
                    <span>Schedule</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          ADD SCREEN MODAL
          ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Auditorium Screen & Seating Layout"
        maxWidth="max-w-lg"
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
      </Modal>

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
