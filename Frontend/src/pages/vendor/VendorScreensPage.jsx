import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  X,
  Ticket,
  Volume2,
  CheckCircle
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

function renderScreenFeaturePill(feature) {
  const fLower = (feature || '').toLowerCase();
  let icon = <CheckCircle size={11} className="text-gray-400" />;
  let colorStyle = 'bg-gray-100 text-gray-700 border-gray-200';

  if (fLower.includes('ticket') || fLower.includes('m-ticket')) {
    icon = <Ticket size={11} className="text-emerald-600" />;
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (fLower.includes('atmos') || fLower.includes('sound') || fLower.includes('audio')) {
    icon = <Volume2 size={11} className="text-indigo-600" />;
    colorStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (fLower.includes('recliner') || fLower.includes('vip') || fLower.includes('seat')) {
    icon = <Armchair size={11} className="text-purple-600" />;
    colorStyle = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (fLower.includes('imax') || fLower.includes('laser') || fLower.includes('4dx')) {
    icon = <Sparkles size={11} className="text-violet-600" />;
    colorStyle = 'bg-violet-50 text-violet-700 border-violet-200';
  } else if (fLower.includes('2d') || fLower.includes('3d') || fLower.includes('screen')) {
    icon = <Tv size={11} className="text-cyan-600" />;
    colorStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }

  return (
    <span
      key={feature}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${colorStyle} shadow-2xs transition-all`}
    >
      {icon}
      <span>{feature}</span>
    </span>
  );
}

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
  const [isPreviewMatrixModalOpen, setIsPreviewMatrixModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    cinemaId: '',
    name: '',
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

  const [editLayoutData, setEditLayoutData] = useState({
    screenName: '',
    screenType: 'Standard 2D',
    rowCount: 8,
    seatsPerRow: 12,
    reclinerPrice: 450,
    premiumPrice: 280,
    normalPrice: 180
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Close venue dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (venueDropdownRef.current && !venueDropdownRef.current.contains(event.target)) {
        setIsVenueDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cinemasRes, screensRes] = await Promise.all([
        vendorApi.getCinemas(),
        vendorApi.getScreens(selectedCinemaId || '')
      ]);

      if (cinemasRes.success && cinemasRes.data) {
        setCinemas(cinemasRes.data);
        if (!selectedCinemaId && cinemaIdParam) {
          setSelectedCinemaId(cinemaIdParam);
        } else if (!selectedCinemaId && cinemasRes.data.length > 0 && !cinemaIdParam) {
          // Keep all view by default
        }
      }

      if (screensRes.success && screensRes.data) {
        setScreens(screensRes.data);
      }
    } catch (err) {
      console.error('Failed to load screen inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCinemaId]);

  // Real-time refresh
  useRealtimeRefresh(['SCREEN_MUTATION', 'CINEMA_MUTATION'], () => {
    fetchData();
  });

  const handleCinemaFilterChange = (cinemaId) => {
    setSelectedCinemaId(cinemaId);
    if (cinemaId) {
      setSearchParams({ cinemaId });
    } else {
      setSearchParams({});
    }
  };

  const activeCinema = useMemo(() => {
    return cinemas.find(c => (c.id || c._id) === selectedCinemaId);
  }, [cinemas, selectedCinemaId]);

  // Modals Openers
  const openAddModal = () => {
    setFormData({
      cinemaId: selectedCinemaId || (cinemas[0]?.id || cinemas[0]?._id || ''),
      name: 'Screen 1 (Dolby Atmos)',
      screenNumber: `AUDI-${screens.length + 1}`,
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
    const rCount = layout.length || 8;
    const sCount = layout[0]?.seatsCount || 12;

    const reclinerRow = layout.find(r => r.tier === 'Recliner');
    const premiumRow = layout.find(r => r.tier === 'Premium');
    const normalRow = layout.find(r => r.tier === 'Normal');

    setEditLayoutData({
      screenName: screen.name || '',
      screenType: screen.screenType || 'Standard 2D',
      rowCount: rCount,
      seatsPerRow: sCount,
      reclinerPrice: reclinerRow?.basePrice || 450,
      premiumPrice: premiumRow?.basePrice || 280,
      normalPrice: normalRow?.basePrice || 180
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

  // Create Screen
  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!formData.cinemaId || !formData.name || !formData.screenNumber) {
      setFormError('Cinema venue, screen name, and screen number are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const rows = [];
      const rCount = Math.min(Math.max(Number(formData.rowCount) || 8, 4), 14);
      const sCount = Math.min(Math.max(Number(formData.seatsPerRow) || 12, 6), 24);

      for (let i = 0; i < rCount; i++) {
        const rowLabel = ROW_LETTERS[i] || `R${i + 1}`;
        let tier = 'normal';
        let price = Number(formData.normalPrice) || 180;

        if (i === 0 && formData.includeRecliner) {
          tier = 'recliner';
          price = Number(formData.reclinerPrice) || 450;
        } else if (i <= 3 && formData.includePremium) {
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

      const res = await vendorApi.createScreen({
        cinemaId: formData.cinemaId,
        name: formData.name.trim(),
        screenNumber: formData.screenNumber.trim(),
        screenType: formData.screenType,
        seatingLayout: {
          rows: rows
        }
      });

      if (res.success) {
        setIsAddModalOpen(false);
        if (formData.cinemaId && selectedCinemaId && formData.cinemaId !== selectedCinemaId) {
          handleCinemaFilterChange(formData.cinemaId);
        } else {
          fetchData();
        }
      } else {
        setFormError(res.message || 'Failed to create screen.');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving screen.');
    } finally {
      setFormLoading(false);
    }
  };

  // Update Seating Layout
  const handleSaveEditedLayout = async (e) => {
    e.preventDefault();
    if (!selectedScreen) return;

    setFormLoading(true);
    setFormError('');

    try {
      const rows = [];
      const rCount = Math.min(Math.max(Number(editLayoutData.rowCount) || 8, 4), 14);
      const sCount = Math.min(Math.max(Number(editLayoutData.seatsPerRow) || 12, 6), 24);

      for (let i = 0; i < rCount; i++) {
        const rowLabel = ROW_LETTERS[i] || `R${i + 1}`;
        let tier = 'normal';
        let price = Number(editLayoutData.normalPrice) || 180;

        if (i === 0) {
          tier = 'recliner';
          price = Number(editLayoutData.reclinerPrice) || 450;
        } else if (i <= 3) {
          tier = 'premium';
          price = Number(editLayoutData.premiumPrice) || 280;
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

      const screenId = selectedScreen.id || selectedScreen._id;
      const res = await vendorApi.updateScreenLayout(screenId, {
        name: editLayoutData.screenName.trim() || selectedScreen.name,
        screenType: editLayoutData.screenType,
        seatingLayout: {
          rows: rows
        }
      });

      if (res.success) {
        setIsEditLayoutModalOpen(false);
        setSelectedScreen(null);
        fetchData();
      } else {
        setFormError(res.message || 'Failed to update screen layout.');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving layout.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Screen
  const handleDeleteScreen = async () => {
    if (!selectedScreen) return;
    try {
      const screenId = selectedScreen.id || selectedScreen._id;
      const res = await vendorApi.deleteScreen(screenId);
      if (res.success) {
        setIsDeleteModalOpen(false);
        setSelectedScreen(null);
        fetchData();
      } else {
        alert(res.message || 'Failed to delete screen');
      }
    } catch (err) {
      alert(err.message || 'Error occurred while deleting screen');
    }
  };

  // Layout preview generator
  const previewEditLayout = useMemo(() => {
    const rows = [];
    const rCount = Math.min(Math.max(Number(editLayoutData.rowCount) || 8, 4), 14);
    const sCount = Math.min(Math.max(Number(editLayoutData.seatsPerRow) || 12, 6), 24);

    for (let i = 0; i < rCount; i++) {
      const rowLabel = ROW_LETTERS[i] || `R${i + 1}`;
      let tier = 'Normal';
      let price = Number(editLayoutData.normalPrice) || 180;

      if (i === 0) {
        tier = 'Recliner';
        price = Number(editLayoutData.reclinerPrice) || 450;
      } else if (i <= 3) {
        tier = 'Premium';
        price = Number(editLayoutData.premiumPrice) || 280;
      }

      rows.push({
        row: rowLabel,
        tier: tier,
        basePrice: price,
        seatsCount: sCount
      });
    }
    return rows;
  }, [editLayoutData]);

  const previewTotalCapacity = useMemo(() => {
    return previewEditLayout.reduce((sum, r) => sum + r.seatsCount, 0);
  }, [previewEditLayout]);

  // Filtered Screens
  const filteredScreens = useMemo(() => {
    return screens.filter(screen => {
      // 1. Format Filter
      if (selectedFormat !== 'all') {
        const type = (screen.screenType || '').toLowerCase();
        if (selectedFormat === 'imax' && !type.includes('imax')) return false;
        if (selectedFormat === '4dx' && !type.includes('4dx')) return false;
        if (selectedFormat === 'standard' && (type.includes('imax') || type.includes('4dx'))) return false;
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

  // KPI Summary Bar
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
        ribbon: 'from-violet-500 to-indigo-600',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
        icon: Sparkles
      };
    }
    if (f.includes('4dx')) {
      return {
        ribbon: 'from-amber-500 to-red-500',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: TrendingUp
      };
    }
    if (f.includes('gold')) {
      return {
        ribbon: 'from-amber-400 to-yellow-500',
        badgeBg: 'bg-yellow-50 text-amber-800 border-yellow-200',
        icon: Armchair
      };
    }
    return {
      ribbon: 'from-indigo-500 to-blue-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Tv
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header (Admin Theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Auditorium Infrastructure & Seating Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Auditorium Screens & Seating Layouts
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Configure hall dimensions, projection formats, and tiered seating layouts (Recliner, Premium, Classic) across your multiplex properties.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          disabled={cinemas.length === 0}
          className="inline-flex items-center gap-2 shadow-sm font-bold bg-[#F84464] hover:bg-[#E03A58] px-4 py-2.5 rounded-lg text-white transition shrink-0"
        >
          <Plus size={18} />
          <span>Add Auditorium Screen</span>
        </Button>
      </div>

      {/* KPI Summary Bar (Admin Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Auditoriums */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Infrastructure
                </p>
                <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                  Auditoriums
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {metrics.totalScreens}
              </span>
              <span className="text-xs font-semibold text-gray-500">screens</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Halls
            </span>
            <span className="text-gray-500 font-medium text-[11px]">
              {cinemas.length} {cinemas.length === 1 ? 'Venue' : 'Venues'}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Seats */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Auditorium Capacity
                </p>
                <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                  Total Seats
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F84464] border border-rose-100 flex items-center justify-center shrink-0">
                <Armchair size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {metrics.totalCapacity.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-gray-500">chairs</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-[#F84464] border border-rose-200">
              <Armchair size={12} />
              {metrics.totalRecliners} Recliners
            </span>
            <span className="text-gray-500 font-medium text-[11px]">
              Total Capacity
            </span>
          </div>
        </div>

        {/* Metric 3: Premium Halls */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Format Hierarchy
                </p>
                <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                  Premium Halls
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {metrics.premiumScreens}
              </span>
              <span className="text-xs font-semibold text-gray-500">halls</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
              <Sparkles size={12} />
              IMAX / 4DX
            </span>
            <span className="text-gray-500 font-medium text-[11px]">
              Special Formats
            </span>
          </div>
        </div>

        {/* Metric 4: Max Potential / Show */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Full Hall Yield
                </p>
                <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                  Max Potential / Show
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                ₹{metrics.maxCycleGross.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={12} />
              100% Full House
            </span>
            <span className="text-gray-500 font-medium text-[11px]">
              Per Showtime
            </span>
          </div>
        </div>
      </div>

      {/* Multiplex Dropdown & Search Toolbar (Admin Theme) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 relative z-20">
        {/* Left: Multiplex Selector Dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative" ref={venueDropdownRef}>
            <button
              type="button"
              onClick={() => setIsVenueDropdownOpen(prev => !prev)}
              className={`w-full sm:w-auto min-w-[260px] sm:min-w-[300px] max-w-[380px] px-3.5 py-2 rounded-lg border text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer shadow-xs ${
                selectedCinemaId
                  ? 'bg-red-50 border-[#F84464] text-gray-900'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                  selectedCinemaId
                    ? 'bg-[#F84464] text-white border-[#F84464]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                  {selectedCinemaId ? <MapPin size={15} /> : <Building2 size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block leading-none mb-1">
                    Select Multiplex
                  </span>
                  <span className="text-xs font-bold text-gray-900 truncate block leading-tight">
                    {activeCinema ? activeCinema.name : `All Multiplexes (${screens.length} Screens)`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                {selectedCinemaId ? (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-[#F84464] border border-red-200">
                    {activeCinema?.screensCount || 1} Audis
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 border border-gray-300">
                    {cinemas.length} Venues
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isVenueDropdownOpen ? 'rotate-180 text-gray-700' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu Panel */}
            {isVenueDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-[350px] bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Multiplex Properties</span>
                  <span className="font-semibold text-gray-500">{cinemas.length} Venues Active</span>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleCinemaFilterChange('');
                      setIsVenueDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition text-xs cursor-pointer ${
                      !selectedCinemaId
                        ? 'bg-red-50 text-[#F84464] font-bold'
                        : 'hover:bg-gray-50 text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        !selectedCinemaId ? 'bg-[#F84464] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Building2 size={14} />
                      </div>
                      <div>
                        <p className="font-bold">All Multiplexes</p>
                        <p className="text-[10px] text-gray-500">All venues directory combined</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                        {screens.length} Screens
                      </span>
                      {!selectedCinemaId && <Check size={14} className="text-[#F84464]" />}
                    </div>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

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
                            ? 'bg-red-50 text-[#F84464] font-bold'
                            : 'hover:bg-gray-50 text-gray-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#F84464] text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <MapPin size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate text-gray-900" title={c.name}>{c.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {c.city}{c.state ? `, ${c.state}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-red-100 text-[#F84464]' : 'bg-gray-100 text-gray-600'
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
              className="px-2.5 py-2 text-xs font-semibold text-gray-500 hover:text-[#F84464] hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Clear selected venue filter"
            >
              <X size={13} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Right: Search Box & Format Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search screen name, audi number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Format Filter Tabs */}
          <div className="inline-flex p-1 bg-gray-100 border border-gray-200 rounded-lg text-xs">
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
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  selectedFormat === f.id
                    ? 'bg-white text-[#F84464] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
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
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-900">Loading Auditorium Infrastructure...</p>
          <p className="text-xs text-gray-500">Rendering multi-tier seating layouts & base fares</p>
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="Add a Cinema Venue First"
          description="You need to add at least one cinema multiplex venue before configuring auditoriums and seating layouts."
          actionText="Add Cinema Venue"
          onAction={() => window.location.href = '/vendor/cinemas'}
        />
      ) : filteredScreens.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 text-[#F84464] flex items-center justify-center mx-auto">
            <Tv size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              No Auditorium Screens Found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No screens match "${searchQuery}". Try clearing search or format filters.`
                : 'Configure your first auditorium screen (e.g. Audi 1 Dolby Atmos, IMAX Laser) with tiered seat configurations.'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#E03A58] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
          >
            <Plus size={15} />
            <span>Add Auditorium Screen</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

            const total = screen.totalCapacity || 1;
            const reclinerPct = Math.round((reclinerCount / total) * 100);
            const premiumPct = Math.round((premiumCount / total) * 100);
            const normalPct = Math.max(0, 100 - reclinerPct - premiumPct);

            const featuresList = [
              screen.screenType || 'Standard 2D',
              `Tiered Layout (${rowCount} Rows A-${lastRowLetter})`,
              'M-Ticket Instant Entry',
              'Dolby Atmos 7.1 Certified',
              'Interactive Matrix Ready'
            ];

            return (
              <motion.div
                key={screen.id || screen._id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
              >
                {/* Top Accent Line */}
                <div className={`h-[2px] w-full bg-gradient-to-r ${formatStyle.ribbon} opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className="p-6 space-y-5">
                  {/* 1. Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#F84464] group-hover:text-white transition-all duration-300">
                        <Tv size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 font-mono">
                            HALL: #{screen.screenNumber || 'AUDI-1'}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${formatStyle.badgeBg}`}>
                            {screen.screenType || 'Standard 2D'}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-gray-900 leading-snug break-words group-hover:text-[#F84464] transition-colors">
                          {screen.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin size={13} className="text-[#F84464] shrink-0" />
                          <span className="font-bold text-gray-800">{screen.cinema?.name || 'Multiplex Venue'}</span>
                          {screen.cinema?.city && <span className="text-gray-500">• {screen.cinema.city}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          screen.status !== 'inactive'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {screen.status !== 'inactive' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                        <span>{screen.status !== 'inactive' ? 'Active & Programmed' : 'Offline'}</span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Full Location & Multiplex */}
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5 text-[#F84464]">
                        <Building2 size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
                          Host Cinema Multiplex & Location
                        </span>
                        <p className="text-xs font-medium text-gray-700 leading-relaxed break-words">
                          {screen.cinema?.address || `${screen.cinema?.name || 'Cinema Multiplex'}, ${screen.cinema?.city || ''}`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2.5 text-xs">
                      <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 shadow-xs">
                        <FormatIcon size={12} className="text-[#F84464] shrink-0" />
                        <span className="font-semibold text-[11px]">{screen.screenType || 'Standard 2D'}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 shadow-xs">
                        <Layers size={12} className="text-indigo-600 shrink-0" />
                        <span className="font-semibold text-[11px]">{rowCount} Rows ({screen.totalCapacity} Seats)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openPreviewMatrixModal(screen)}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 shadow-xs transition cursor-pointer"
                        title="Interactive Seat Layout Preview"
                      >
                        <Eye size={12} className="text-gray-500 shrink-0" />
                        <span className="font-semibold text-[11px]">Seat Matrix Preview →</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Multiplex Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Capacity</span>
                        <Tv size={14} className="text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-900 leading-none">
                          {screen.totalCapacity || 120}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                          Total Seats
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Layout</span>
                        <Armchair size={14} className="text-purple-600" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-900 leading-none">
                          {rowCount} Rows
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                          A to {lastRowLetter}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Full House</span>
                        <TrendingUp size={14} className="text-amber-600" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-900 leading-none truncate">
                          ₹{maxScreenGross.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                          Max Yield / Show
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ticketing</span>
                        <Ticket size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-emerald-700 leading-none block">
                          M-Ticket
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                          Paperless Entry
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Tier Breakdown */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <Sliders size={12} className="text-gray-400" />
                        Auditorium Seating Tiers ({reclinerCount > 0 ? '3 Tiers' : '2 Tiers'})
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditLayoutModal(screen)}
                        className="text-[11px] font-bold text-[#F84464] hover:underline cursor-pointer"
                      >
                        Configure Layout →
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-200">
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
                          className="bg-gray-400 h-full transition-all duration-300"
                          title={`Normal Classic: ${normalCount} seats (${normalPct}%)`}
                        />
                      )}
                    </div>

                    {/* Tier Pills */}
                    <div className="flex flex-wrap gap-2">
                      {reclinerCount > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-[#F84464] shrink-0"></span>
                          <span className="font-bold text-gray-800">Recliner VIP</span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ₹{reclinerPrice}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">{reclinerCount} seats</span>
                        </div>
                      )}
                      <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                        <span className="font-bold text-gray-800">Premium Tier</span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          ₹{premiumPrice}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">{premiumCount} seats</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="font-bold text-gray-800">Classic Normal</span>
                        <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          ₹{normalPrice}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">{normalCount} seats</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Features */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Auditorium Features & Display Specifications
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        {featuresList.length} Enabled
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {featuresList.map(renderScreenFeaturePill)}
                    </div>
                  </div>
                </div>

                {/* 6. Card Footer Actions */}
                <div className="p-4 sm:px-6 border-t border-gray-100 bg-gray-50/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditLayoutModal(screen)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E03A58] px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      <Sliders size={14} className="text-white" />
                      <span>Configure Layout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPreviewMatrixModal(screen)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-300 shadow-sm transition cursor-pointer"
                    >
                      <Eye size={14} className="text-gray-400" />
                      <span>Inspect Grid</span>
                    </button>

                    <Link
                      to="/vendor/shows"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-300 shadow-sm transition"
                    >
                      <Calendar size={14} className="text-indigo-600" />
                      <span>Schedule Shows</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openDeleteModal(screen)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-300 transition shadow-sm cursor-pointer"
                      title="Delete Screen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ADD SCREEN SLIDE-OVER DRAWER (Admin Theme) */}
      <SlideOverDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Auditorium Screen & Seating Layout"
        subtitle="Configure auditorium format, dimensions, and tier pricing"
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
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
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
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

            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeRecliner}
                    onChange={(e) => setFormData({ ...formData, includeRecliner: e.target.checked })}
                    className="rounded text-[#F84464] focus:ring-[#F84464] border-gray-300"
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

              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includePremium}
                    onChange={(e) => setFormData({ ...formData, includePremium: e.target.checked })}
                    className="rounded text-[#F84464] focus:ring-[#F84464] border-gray-300"
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

              <div className="flex items-center justify-between text-xs text-gray-700 pt-1">
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

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="bg-[#F84464] hover:bg-[#E03A58] text-white font-bold shadow-sm"
            >
              Build & Save Screen
            </Button>
          </div>
        </form>
      </SlideOverDrawer>

      {/* EDIT / CUSTOMIZE SEATING LAYOUT MODAL (Admin Theme) */}
      <Modal
        isOpen={isEditLayoutModalOpen}
        onClose={() => setIsEditLayoutModalOpen(false)}
        title={`Configure Seating Layout • ${selectedScreen?.name || 'Auditorium'}`}
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
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
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sliders size={16} className="text-[#F84464]" />
                <span>Auditorium Matrix Dimensions</span>
              </span>
              <span className="bg-white text-[#F84464] border border-gray-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                Total Capacity: {previewTotalCapacity} Seats
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
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
            <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Recliner (Row A)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.reclinerPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, reclinerPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-700 mb-1">
                  Premium (B-D)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.premiumPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, premiumPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Normal Tier
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.normalPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, normalPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Visual Seat Grid Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Live Interactive Layout Matrix
              </span>
              <span className="text-[11px] text-gray-500">
                Auditorium floor plan preview
              </span>
            </div>

            {/* Screen Banner */}
            <div className="text-center mb-3">
              <div className="w-2/3 mx-auto h-2 bg-gradient-to-b from-indigo-500 via-indigo-300 to-transparent rounded-t-full shadow-xs" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Screen This Way</p>
            </div>

            {/* Seat Rows Matrix */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto space-y-2 max-h-64 shadow-inner">
              {previewEditLayout.map((row) => (
                <div key={row.row} className="flex items-center gap-2 justify-center min-w-max">
                  <span className="w-5 text-center font-mono font-bold text-xs text-gray-500">
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
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        title={`${row.row}-${idx + 1} (${row.tier} • ₹${row.basePrice})`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 ml-2 w-14">
                    ₹{row.basePrice}
                  </span>
                </div>
              ))}
            </div>

            {/* Color Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#F84464]" />
                <span>Recliner (₹{editLayoutData.reclinerPrice})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600" />
                <span>Premium (₹{editLayoutData.premiumPrice})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-white border border-gray-300 text-gray-700" />
                <span>Normal (₹{editLayoutData.normalPrice})</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditLayoutModalOpen(false)}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="bg-[#F84464] hover:bg-[#E03A58] text-white font-bold px-6 shadow-sm"
            >
              Save Seating Layout
            </Button>
          </div>
        </form>
      </Modal>

      {/* INTERACTIVE SEATING GRID PREVIEW MODAL (Admin Theme) */}
      <Modal
        isOpen={isPreviewMatrixModalOpen}
        onClose={() => setIsPreviewMatrixModalOpen(false)}
        title={`Full Seating Matrix • ${selectedScreen?.name || 'Auditorium'}`}
        maxWidth="max-w-2xl"
      >
        {selectedScreen && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <div>
                <span className="font-bold text-gray-900 text-sm">{selectedScreen.name}</span>
                <span className="text-gray-500"> • {selectedScreen.cinema?.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {selectedScreen.totalCapacity} Total Seats
                </span>
                <span className="text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                  {(selectedScreen.seatingLayout || []).length} Rows
                </span>
              </div>
            </div>

            {/* Screen Banner */}
            <div className="text-center py-2">
              <div className="w-3/4 mx-auto h-2 bg-gradient-to-b from-indigo-500 via-indigo-300 to-transparent rounded-t-full shadow-xs" />
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 font-mono">
                Curved Cinema Projection Screen
              </p>
            </div>

            {/* Seating Grid */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto space-y-2.5 max-h-80 shadow-inner">
              {(selectedScreen.seatingLayout || []).map((row) => (
                <div key={row.row} className="flex items-center gap-2 justify-center min-w-max">
                  <span className="w-5 text-center font-mono font-bold text-xs text-gray-500">
                    {row.row}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: row.seatsCount || 12 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded text-[9px] font-mono flex items-center justify-center font-bold shadow-xs transition ${
                          row.tier === 'Recliner'
                            ? 'bg-[#F84464] text-white'
                            : row.tier === 'Premium'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        title={`${row.row}-${idx + 1} (${row.tier} • Base: ₹${row.basePrice})`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 ml-2 w-16 text-right">
                    ₹{row.basePrice}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#F84464]" />
                <span>Recliner VIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600" />
                <span>Premium Tier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-white border border-gray-300" />
                <span>Normal Classic</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL (Admin Theme) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteScreen}
        title="Delete Auditorium Screen"
        description={`Are you sure you want to delete '${selectedScreen?.name}'? This will permanently remove its tiered seating layout.`}
        confirmText="Yes, Delete Screen"
        variant="destructive"
      />
    </div>
  );
}
