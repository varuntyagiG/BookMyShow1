import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Tv,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Users,
  Grid,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2
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
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function CinemaPartnerScreensPage() {
  const toast = useCinemaToast();
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewScreen, setPreviewScreen] = useState(null);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    cinemaId: '',
    screenNumber: 'Screen 1',
    name: 'Audi 1',
    screenType: 'Standard 2D',
    status: 'active',
    seatingLayout: [
      { row: 'A', tier: 'Recliner', basePrice: 400, seatsCount: 10 },
      { row: 'B', tier: 'Premium', basePrice: 250, seatsCount: 12 },
      { row: 'C', tier: 'Premium', basePrice: 250, seatsCount: 12 },
      { row: 'D', tier: 'Normal', basePrice: 180, seatsCount: 14 },
      { row: 'E', tier: 'Normal', basePrice: 180, seatsCount: 14 },
      { row: 'F', tier: 'Normal', basePrice: 180, seatsCount: 14 }
    ]
  });

  const screenTypes = [
    { value: 'Standard 2D', label: 'Standard 2D' },
    { value: '3D', label: '3D Digital' },
    { value: 'IMAX 2D', label: 'IMAX 2D' },
    { value: 'IMAX 3D', label: 'IMAX 3D Laser' },
    { value: '4DX', label: '4DX Dynamic' },
    { value: 'Gold Class', label: 'Gold Class Luxury' }
  ];

  const tierOptions = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Premium', label: 'Premium' },
    { value: 'Recliner', label: 'Recliner' }
  ];

  const fetchData = async () => {
    try {
      const cinemaRes = await cinemaPartnerApi.getCinemas();
      if (cinemaRes.success && cinemaRes.cinemas) {
        setCinemas(cinemaRes.cinemas);
        if (cinemaRes.cinemas.length > 0 && !selectedCinemaId) {
          setSelectedCinemaId(cinemaRes.cinemas[0]._id);
        }
      }

      const screensRes = await cinemaPartnerApi.getScreens();
      if (screensRes.success && screensRes.screens) {
        setScreens(screensRes.screens);
      }
    } catch (err) {
      toast.error('Load Error', err.message || 'Failed to fetch screens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredScreens = selectedCinemaId
    ? screens.filter((s) => (s.cinema?._id || s.cinema) === selectedCinemaId)
    : screens;

  const handleOpenAdd = () => {
    setEditingScreen(null);
    setFormData({
      cinemaId: selectedCinemaId || (cinemas[0]?._id || ''),
      screenNumber: `Screen ${filteredScreens.length + 1}`,
      name: `Audi ${filteredScreens.length + 1}`,
      screenType: 'Standard 2D',
      status: 'active',
      seatingLayout: [
        { row: 'A', tier: 'Recliner', basePrice: 400, seatsCount: 10 },
        { row: 'B', tier: 'Premium', basePrice: 250, seatsCount: 12 },
        { row: 'C', tier: 'Premium', basePrice: 250, seatsCount: 12 },
        { row: 'D', tier: 'Normal', basePrice: 180, seatsCount: 14 },
        { row: 'E', tier: 'Normal', basePrice: 180, seatsCount: 14 }
      ]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (screen) => {
    setEditingScreen(screen);
    setFormData({
      cinemaId: screen.cinema?._id || screen.cinema,
      screenNumber: screen.screenNumber,
      name: screen.name,
      screenType: screen.screenType,
      status: screen.status,
      seatingLayout: screen.seatingLayout || []
    });
    setModalOpen(true);
  };

  const handleAddRow = () => {
    const nextCharCode = 65 + formData.seatingLayout.length;
    const nextRowLetter = String.fromCharCode(nextCharCode);
    setFormData((prev) => ({
      ...prev,
      seatingLayout: [
        ...prev.seatingLayout,
        { row: nextRowLetter, tier: 'Normal', basePrice: 180, seatsCount: 12 }
      ]
    }));
  };

  const handleRemoveRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      seatingLayout: prev.seatingLayout.filter((_, idx) => idx !== index)
    }));
  };

  const handleRowChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.seatingLayout];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, seatingLayout: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingScreen) {
        const res = await cinemaPartnerApi.updateScreen(editingScreen._id, formData);
        if (res.success) {
          toast.success('Screen Updated', `"${formData.name}" configuration saved.`);
          fetchData();
          setModalOpen(false);
        }
      } else {
        const res = await cinemaPartnerApi.createScreen(formData);
        if (res.success) {
          toast.success('Screen Created', `"${formData.name}" added to cinema.`);
          fetchData();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error('Save Failed', err.message || 'Unable to save screen.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (screen) => {
    setScreenToDelete(screen);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteScreen = async () => {
    if (!screenToDelete) return;
    setDeleting(true);
    try {
      const res = await cinemaPartnerApi.deleteScreen(screenToDelete._id);
      if (res.success) {
        toast.success('Screen Deleted', `"${screenToDelete.name}" removed.`);
        setScreens((prev) => prev.filter((s) => s._id !== screenToDelete._id));
        setDeleteConfirmOpen(false);
        setScreenToDelete(null);
      }
    } catch (err) {
      toast.error('Deletion Blocked', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Screens & Tiered Seating Architecture"
        subtitle="Configure auditorium screen formats, total capacities, and tiered seat pricing layouts."
        icon={Tv}
        badge="Auditorium Engineering"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <Select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                options={[
                  { value: '', label: `All Cinemas (${cinemas.length})` },
                  ...cinemas.map((c) => ({ value: c._id, label: c.name }))
                ]}
              />
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Add Screen
            </Button>
          </div>
        }
      />

      {/* Screens Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : filteredScreens.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Tv}
            title="No Screens Configured"
            description="Add an auditorium hall to configure its seat tiers (Normal, Premium, Recliner) and start scheduling movie shows."
            actionLabel="Add Screen"
            onAction={handleOpenAdd}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((s) => {
            const cinemaName = s.cinema?.name || 'Cinema';
            const totalSeats = s.totalCapacity || (s.seatingLayout || []).reduce((sum, r) => sum + (r.seatsCount || 12), 0);

            return (
              <Card
                key={s._id}
                className="flex flex-col justify-between hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#F84464] tracking-wider block">
                        {s.screenNumber}
                      </span>
                      <h3 className="text-base font-bold text-[#222432] group-hover:text-[#F84464] transition-colors mt-0.5">
                        {s.name}
                      </h3>
                    </div>
                    <Badge variant="info" pill>
                      {s.screenType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{cinemaName}</span>
                  </div>

                  {/* Seat Stats Pill Card */}
                  <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Total Capacity</div>
                      <div className="text-base font-black text-[#222432]">{totalSeats} Seats</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Tiers &amp; Rows</div>
                      <div className="text-base font-black text-[#F84464]">
                        {s.seatingLayout?.length || 0} Rows
                      </div>
                    </div>
                  </div>

                  {/* Tier Row Summary */}
                  <div className="space-y-1.5 text-xs">
                    {(s.seatingLayout || []).slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">Row {r.row} ({r.tier})</span>
                        <span className="text-[#222432] font-mono font-bold">{r.seatsCount} seats @ ₹{r.basePrice}</span>
                      </div>
                    ))}
                    {(s.seatingLayout?.length || 0) > 3 && (
                      <div className="text-[10px] text-gray-400 text-center pt-1 font-semibold">
                        + {s.seatingLayout.length - 3} more seating rows
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 mt-4 border-t border-[#EEEEF2] bg-gray-50/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => setPreviewScreen(s)}
                    className="text-[#F84464] hover:bg-[#F84464]/10 font-bold"
                  >
                    View Layout
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenEdit(s)}
                      title="Edit Screen Configuration"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => openDeleteConfirm(s)}
                      className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Screen"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Screen Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingScreen ? `Edit ${editingScreen.name}` : 'Configure New Screen & Seat Layout'}
        description="Define auditorium dimensions, display formats, and tiered seat pricing."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={saving}
            >
              {editingScreen ? 'Update Screen' : 'Create Screen'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cinema Venue *"
              value={formData.cinemaId}
              onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
              options={cinemas.map((c) => ({ value: c._id, label: c.name }))}
            />

            <Input
              label="Screen Identifier *"
              value={formData.screenNumber}
              onChange={(e) => setFormData({ ...formData, screenNumber: e.target.value })}
              placeholder="e.g. Screen 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Auditorium Display Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Audi 1 (Dolby Atmos)"
              required
            />

            <Select
              label="Screen Technology / Format"
              value={formData.screenType}
              onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
              options={screenTypes}
            />
          </div>

          {/* Seating Layout Row Configurator */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Auditorium Seating Grid ({formData.seatingLayout.reduce((s, r) => s + (Number(r.seatsCount) || 0), 0)} Total Seats)
              </label>
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={handleAddRow}
                type="button"
                className="text-[#F84464]"
              >
                Add Row
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formData.seatingLayout.map((rowItem, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 text-xs"
                >
                  <span className="w-6 font-bold text-[#222432] text-center">{rowItem.row}</span>

                  <div className="flex-1">
                    <Select
                      value={rowItem.tier}
                      onChange={(e) => handleRowChange(idx, 'tier', e.target.value)}
                      options={tierOptions}
                    />
                  </div>

                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      max="40"
                      value={rowItem.seatsCount}
                      onChange={(e) => handleRowChange(idx, 'seatsCount', parseInt(e.target.value, 10) || 0)}
                      placeholder="Seats"
                      className="text-center"
                    />
                  </div>

                  <div className="w-24">
                    <Input
                      type="number"
                      min="50"
                      value={rowItem.basePrice}
                      onChange={(e) => handleRowChange(idx, 'basePrice', parseInt(e.target.value, 10) || 0)}
                      placeholder="₹ Price"
                      className="text-center"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleRemoveRow(idx)}
                    type="button"
                    className="text-rose-500 hover:text-rose-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Visual Interactive Seating Map Modal */}
      {previewScreen && (
        <Modal
          isOpen={Boolean(previewScreen)}
          onClose={() => setPreviewScreen(null)}
          title={`${previewScreen.name} — Interactive Seating Layout`}
          description={`Total Capacity: ${previewScreen.totalCapacity} seats across ${previewScreen.seatingLayout?.length || 0} rows`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full text-xs font-medium text-gray-600">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border border-gray-300 bg-white" />
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-[#F84464]/10 border border-[#F84464]/30" />
                  <span className="text-[#F84464] font-semibold">Premium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-amber-50 border border-amber-300" />
                  <span className="text-amber-800 font-semibold">Recliner</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPreviewScreen(null)}>
                Close Preview
              </Button>
            </div>
          }
        >
          <div className="py-2">
            {/* Curved Screen Banner */}
            <div className="my-3 text-center">
              <div className="cinema-screen-curve" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-2">
                All eyes this way please (Screen)
              </p>
            </div>

            {/* Seating Grid */}
            <div className="py-4 space-y-3 max-h-80 overflow-y-auto">
              {(previewScreen.seatingLayout || []).map((row) => (
                <div key={row.row} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-6">
                    <span>{row.tier} - ₹{row.basePrice}</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-5 text-[11px] font-bold text-gray-400 text-center">
                      {row.row}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {Array.from({ length: row.seatsCount || 12 }).map((_, sIdx) => {
                        const seatNumber = sIdx + 1;
                        const isAisle = seatNumber === 6;
                        const isRecliner = row.tier === 'Recliner';
                        const isPremium = row.tier === 'Premium';

                        return (
                          <React.Fragment key={sIdx}>
                            <div
                              className={`w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center border shadow-xs transition select-none ${
                                isRecliner
                                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                                  : isPremium
                                  ? 'bg-[#F84464]/10 border-[#F84464]/30 text-[#F84464]'
                                  : 'bg-white border-gray-300 text-gray-700'
                              }`}
                              title={`${row.row}${seatNumber} (${row.tier}) - ₹${row.basePrice}`}
                            >
                              {seatNumber}
                            </div>
                            {isAisle && <div className="w-3 sm:w-5" />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteScreen}
        title="Delete Auditorium Screen?"
        message={`Are you sure you want to permanently delete screen "${screenToDelete?.name}"? All future scheduled shows without ticket bookings will also be removed.`}
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
