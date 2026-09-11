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
  AlertCircle
} from 'lucide-react';

const SCREEN_TYPES = [
  'Standard 2D',
  '3D',
  'IMAX 2D',
  'IMAX 3D',
  '4DX',
  'Gold Class'
];

export default function VendorScreensPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cinemaIdParam = searchParams.get('cinemaId') || '';

  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState(cinemaIdParam);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);

  const [formData, setFormData] = useState({
    cinemaId: '',
    screenNumber: 'AUDI-1',
    name: 'Screen 1 (Standard)',
    screenType: 'Standard 2D',
    includeRecliner: true,
    includePremium: true,
    totalCapacity: 120
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
        if (!selectedCinemaId && cinemasRes.data.length > 0) {
          // Keep all or keep current
        }
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

  const openAddModal = () => {
    const defaultCinemaId = selectedCinemaId || (cinemas[0]?.id || cinemas[0]?._id || '');
    setFormData({
      cinemaId: defaultCinemaId,
      screenNumber: `AUDI-${screens.length + 1}`,
      name: `Screen ${screens.length + 1}`,
      screenType: 'Standard 2D',
      includeRecliner: true,
      includePremium: true,
      totalCapacity: 110
    });
    setFormError('');
    setIsAddModalOpen(true);
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

    // Generate standard seating layout based on tiers
    const layout = [];
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    rowLetters.forEach((letter, index) => {
      let tier = 'Normal';
      let basePrice = 180;
      let seatsCount = 14;

      if (index === 0 && formData.includeRecliner) {
        tier = 'Recliner';
        basePrice = 450;
        seatsCount = 8;
      } else if (index < 4 && formData.includePremium) {
        tier = 'Premium';
        basePrice = 280;
        seatsCount = 12;
      }

      layout.push({
        row: letter,
        tier,
        basePrice,
        seatsCount,
        disabledSeats: []
      });
    });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Auditorium Screens & Seating Layouts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure auditorium capacity, screen formats, and tiered seating (Recliner, Premium, Normal).
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          className="inline-flex items-center gap-2"
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
                      <span>Auditorium Tiers</span>
                      <span className="text-emerald-600">
                        {(screen.seatingLayout || []).length} Rows Configured
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
                <span className="text-[11px] text-gray-500">
                  Ready for live show scheduling
                </span>
                <Badge variant="success" className="text-[10px]">
                  Ready
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
        title="Add Auditorium Screen"
        maxWidth="max-w-md"
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
              label="Screen Number"
              required
              placeholder="e.g. AUDI-1"
              value={formData.screenNumber}
              onChange={(e) => setFormData({ ...formData, screenNumber: e.target.value })}
            />
            <Select
              label="Format / Type"
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

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Seating Layout Configuration</p>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeRecliner}
                onChange={(e) => setFormData({ ...formData, includeRecliner: e.target.checked })}
                className="rounded text-[#F84464] focus:ring-[#F84464]"
              />
              <span>Include Recliner Luxury Tier (Row A • ₹450)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includePremium}
                onChange={(e) => setFormData({ ...formData, includePremium: e.target.checked })}
                className="rounded text-[#F84464] focus:ring-[#F84464]"
              />
              <span>Include Premium Tier (Rows B-D • ₹280)</span>
            </label>
            <p className="text-[11px] text-gray-400 mt-1">
              Standard tier (Rows E-I • ₹180) is included by default for optimal auditorium capacity.
            </p>
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
