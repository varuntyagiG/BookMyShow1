import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Tv,
  Plus,
  Trash2,
  Edit2,
  Armchair,
  Layers,
  MapPin,
  AlertCircle,
  Sliders,
  CheckCircle,
  Eye
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

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
        setCinemas(cinemasRes.data);
      }
      if (screensRes.success) {
        setScreens(screensRes.data);
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
    const currentRows = screen.seatingLayout || [];
    const hasRecliner = currentRows.some(r => r.tier === 'Recliner');
    const hasPremium = currentRows.some(r => r.tier === 'Premium');
    const recPrice = currentRows.find(r => r.tier === 'Recliner')?.basePrice || 450;
    const premPrice = currentRows.find(r => r.tier === 'Premium')?.basePrice || 280;
    const normPrice = currentRows.find(r => r.tier === 'Normal')?.basePrice || 180;
    const seatCount = currentRows[1]?.seatsCount || currentRows[0]?.seatsCount || 12;

    setEditLayoutData({
      screenName: screen.name,
      screenType: screen.screenType || 'Standard 2D',
      rowCount: currentRows.length || 8,
      seatsPerRow: seatCount,
      includeRecliner: hasRecliner,
      includePremium: hasPremium,
      reclinerPrice: recPrice,
      premiumPrice: premPrice,
      normalPrice: normPrice
    });
    setFormError('');
    setIsEditLayoutModalOpen(true);
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
      setFormError(err.message || 'Failed to create screen.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveEditedLayout = async (e) => {
    e.preventDefault();
    if (!selectedScreen) return;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tv className="text-indigo-600" size={24} />
            <span>Auditorium Screens & Seating Layouts</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure auditorium capacity, screen formats, and tiered seating (Recliner, Premium, Normal).
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 shadow-sm"
          disabled={cinemas.length === 0}
        >
          <Plus size={16} />
          <span>Add Auditorium</span>
        </Button>
      </div>

      {/* Cinema Filter Bar */}
      {cinemas.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => handleCinemaFilterChange('')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              !selectedCinemaId
                ? 'bg-[#333545] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#F84464] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <MapPin size={12} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading auditorium layouts...
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="Add a Cinema Venue First"
          description="You need to add at least one cinema venue before adding auditorium screens and seating layouts."
          actionText="Add Cinema Venue"
          onAction={() => window.location.href = '/vendor/cinemas'}
        />
      ) : screens.length === 0 ? (
        <EmptyState
          title="No Auditorium Screens Configured"
          description="Add your auditorium screen (e.g. Audi 1, Audi 2 IMAX) with custom tiered seating layouts."
          actionText="Add Screen"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <Card key={screen.id || screen._id} className="shadow-sm border-gray-200 flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                          {screen.screenNumber}
                        </span>
                        <Badge variant="info" className="text-[10px]">
                          {screen.screenType}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-gray-900 mt-1">
                        {screen.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {screen.cinema?.name || 'Cinema Venue'}
                      </p>
                    </div>

                    <button
                      onClick={() => openDeleteModal(screen)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md transition"
                      title="Delete Screen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Armchair size={16} className="text-[#F84464]" />
                      <span className="font-medium">Total Seating Capacity</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900">
                      {screen.totalCapacity} Seats
                    </span>
                  </div>

                  {/* Visual Layout Representation */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase mb-2">
                      <span>Configured Seating Rows</span>
                      <span className="text-emerald-600">
                        {(screen.seatingLayout || []).length} Rows
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(screen.seatingLayout || []).map((row) => (
                        <div
                          key={row.row}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-gray-200 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-gray-100 font-mono font-bold flex items-center justify-center text-gray-700 text-[11px]">
                              {row.row}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                row.tier === 'Recliner'
                                  ? 'bg-rose-100 text-[#F84464]'
                                  : row.tier === 'Premium'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {row.tier}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-[11px]">
                              {row.seatsCount} seats
                            </span>
                            <span className="font-semibold text-gray-800 text-[11px]">
                              ₹{row.basePrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditLayoutModal(screen)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                >
                  <Sliders size={13} />
                  <span>Configure Seats & Prices</span>
                </button>

                <Badge variant="success" className="text-[10px]">
                  Operational
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Screen Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Auditorium Screen & Seating Layout"
        maxWidth="max-w-lg"
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
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
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

              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
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

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
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
            >
              Build & Save Screen
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit / Customize Seating Layout Modal */}
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
              <span className="bg-[#333545] text-white text-xs font-bold px-2.5 py-1 rounded-full">
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
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.reclinerPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, reclinerPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-700 mb-1">
                  Premium (B-D)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.premiumPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, premiumPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Normal Tier
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={editLayoutData.normalPrice}
                    onChange={(e) => setEditLayoutData({ ...editLayoutData, normalPrice: Number(e.target.value) })}
                    className="w-full text-xs font-semibold pl-6 pr-2 py-2 border border-gray-300 rounded-lg bg-white"
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
              <span className="text-[11px] text-gray-400">
                Auditorium floor plan preview
              </span>
            </div>

            {/* Screen Banner */}
            <div className="text-center mb-4">
              <div className="w-2/3 mx-auto h-2 bg-gradient-to-b from-indigo-400 to-transparent rounded-t-full shadow" />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Screen This Way</p>
            </div>

            {/* Seat Rows Matrix */}
            <div className="p-4 bg-[#1e202e] rounded-xl overflow-x-auto space-y-2 max-h-64 shadow-inner">
              {previewEditLayout.map((row) => (
                <div key={row.row} className="flex items-center gap-2 justify-center min-w-max">
                  <span className="w-5 text-center font-mono font-bold text-xs text-gray-400">
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
                            : 'bg-gray-200 text-gray-800'
                        }`}
                        title={`${row.row}-${idx + 1} (${row.tier} • ₹${row.basePrice})`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 ml-2 w-14">
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
                <span className="w-3.5 h-3.5 rounded bg-indigo-500" />
                <span>Premium (₹{editLayoutData.premiumPrice})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-gray-300" />
                <span>Normal (₹{editLayoutData.normalPrice})</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
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
              className="px-6"
            >
              Save Seating Layout
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteScreen}
        title="Delete Auditorium Screen"
        message={`Are you sure you want to delete '${selectedScreen?.name}'?`}
        confirmText="Yes, Delete Screen"
        type="danger"
      />
    </div>
  );
}
