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
  Loader2,
  CheckCircle2,
  X,
  Layers,
  AlertCircle
} from 'lucide-react';

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

  const screenTypes = ['Standard 2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Gold Class'];
  const tierOptions = ['Normal', 'Premium', 'Recliner'];

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
    const nextCharCode = 65 + formData.seatingLayout.length; // 'A', 'B', 'C'...
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

  const handleDeleteScreen = async (screenId, screenName) => {
    if (!window.confirm(`Delete screen "${screenName}"?`)) return;
    try {
      const res = await cinemaPartnerApi.deleteScreen(screenId);
      if (res.success) {
        toast.success('Screen Deleted', `"${screenName}" removed.`);
        setScreens((prev) => prev.filter((s) => s._id !== screenId));
      }
    } catch (err) {
      toast.error('Deletion Blocked', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Screens &amp; Seating Architecture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <Tv className="w-6 h-6 text-[#F84464]" />
            <span>Screens &amp; Seating Layouts</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure screen capacities, auditorium sound types, and tiered seating grids
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cinema Filter Dropdown */}
          <select
            value={selectedCinemaId}
            onChange={(e) => setSelectedCinemaId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] focus:outline-none focus:border-[#F84464] shadow-xs"
          >
            <option value="">All Cinemas ({cinemas.length})</option>
            {cinemas.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Screen</span>
          </button>
        </div>
      </div>

      {/* Screens Grid */}
      {filteredScreens.length === 0 ? (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center mx-auto mb-3">
            <Tv className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#222432] mb-1">No Screens Configured</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Add a screen to configure its capacity and tiered seating layout (Normal, Premium, Recliner).
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F84464]/25 cursor-pointer transition"
          >
            Add Screen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((s) => {
            const cinemaName = s.cinema?.name || 'Cinema';
            const totalSeats = s.totalCapacity || (s.seatingLayout || []).reduce((sum, r) => sum + (r.seatsCount || 12), 0);

            return (
              <div
                key={s._id}
                className="bg-white border border-[#EEEEF2] rounded-3xl p-6 flex flex-col justify-between hover:border-[#F84464]/40 hover:shadow-lg transition group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#F84464] tracking-wider">
                        {s.screenNumber}
                      </span>
                      <h3 className="text-base font-bold text-[#222432] group-hover:text-[#F84464] transition-colors mt-0.5">
                        {s.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                      {s.screenType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{cinemaName}</span>
                  </div>

                  {/* Seat Stats */}
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

                  {/* Mini Tier Summary */}
                  <div className="space-y-1.5 text-xs">
                    {(s.seatingLayout || []).slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">Row {r.row} ({r.tier})</span>
                        <span className="text-[#222432] font-mono font-bold">{r.seatsCount} seats @ ₹{r.basePrice}</span>
                      </div>
                    ))}
                    {(s.seatingLayout?.length || 0) > 3 && (
                      <div className="text-[10px] text-gray-400 text-center pt-1 font-semibold">
                        + {s.seatingLayout.length - 3} more rows
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => setPreviewScreen(s)}
                    className="text-xs font-bold text-[#F84464] hover:text-[#E03A58] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>View Seating Layout</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                      title="Edit Screen"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteScreen(s._id, s.name)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                      title="Delete Screen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Screen Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#333545] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#F84464]" />
                <h3 className="text-sm font-bold">
                  {editingScreen ? `Edit ${editingScreen.name}` : 'Configure New Screen & Seat Layout'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cinema Venue
                  </label>
                  <select
                    value={formData.cinemaId}
                    onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Screen Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.screenNumber}
                    onChange={(e) => setFormData({ ...formData, screenNumber: e.target.value })}
                    placeholder="e.g. Screen 1"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Auditorium Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Audi 1 (IMAX)"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Screen Technology / Format
                  </label>
                  <select
                    value={formData.screenType}
                    onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    {screenTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seating Layout Row Configurator */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Auditorium Seating Grid ({formData.seatingLayout.reduce((s, r) => s + (Number(r.seatsCount) || 0), 0)} Total Seats)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="text-xs font-bold text-[#F84464] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formData.seatingLayout.map((rowItem, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 text-xs"
                    >
                      <span className="w-6 font-bold text-[#222432] text-center">{rowItem.row}</span>

                      <div className="flex-1">
                        <select
                          value={rowItem.tier}
                          onChange={(e) => handleRowChange(idx, 'tier', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-[#222432] focus:outline-none focus:border-[#F84464]"
                        >
                          {tierOptions.map((tier) => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={rowItem.seatsCount}
                          onChange={(e) => handleRowChange(idx, 'seatsCount', parseInt(e.target.value, 10) || 0)}
                          placeholder="Seats"
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-[#222432] text-center focus:outline-none focus:border-[#F84464]"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="50"
                          value={rowItem.basePrice}
                          onChange={(e) => handleRowChange(idx, 'basePrice', parseInt(e.target.value, 10) || 0)}
                          placeholder="₹ Price"
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-[#222432] text-center focus:outline-none focus:border-[#F84464]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
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
                  {saving ? 'Saving...' : editingScreen ? 'Update Screen' : 'Create Screen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Seating Map Modal matching Customer Seat Selection */}
      {previewScreen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#333545] px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-bold">{previewScreen.name} — Interactive Seating Map</h3>
                <p className="text-[11px] text-gray-300">Total Capacity: {previewScreen.totalCapacity} seats</p>
              </div>
              <button
                onClick={() => setPreviewScreen(null)}
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Authentic BookMyShow Cinema Curved Screen Indicator */}
              <div className="my-4 text-center">
                <div className="cinema-screen-curve" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  All eyes this way please (Screen)
                </p>
              </div>

              {/* Seating Grid Display with exact Customer Seat Buttons */}
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

              {/* Tier Legend matching Customer Panel */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100 text-xs font-medium text-gray-600">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
