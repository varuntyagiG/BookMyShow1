import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  MapPin,
  Plus,
  Store,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    icon: '🏙️',
    isPopular: false
  });

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCities();
      if (res.success) {
        setCities(res.cities || []);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCreateCity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminApi.createCity(formData);
      if (res.success) {
        fetchCities();
        setModalOpen(false);
        setFormData({ name: '', state: '', icon: '🏙️', isPopular: false });
      }
    } catch (err) {
      alert(err.message || 'Failed to add city.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (city) => {
    const newStatus = city.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminApi.updateCity(city._id, { status: newStatus });
      if (res.success) {
        setCities((prev) =>
          prev.map((c) => (c._id === city._id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update city status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#F84464]" />
            <span>Operational Cities &amp; Coverage Zones</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage regions where BookMyTrip services and cinema partner ticketing operations are active.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Operational City</span>
        </button>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading operational territories...</p>
        </div>
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <div
              key={city._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between shadow-sm relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{city.icon || '🏙️'}</span>
                  {city.isPopular && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Tier 1 Metro
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#222432] mb-0.5">{city.name}</h3>
                <p className="text-xs text-gray-500">{city.state || 'India'}</p>

                <div className="mt-4 pt-3 border-t border-[#EEEEF2] flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-gray-400" />
                    <span>Venues:</span>
                  </span>
                  <strong className="text-[#F84464] font-mono font-bold">
                    {city.cinemasCount || 0} Multiplexes
                  </strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EEEEF2] flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">Status</span>
                <button
                  onClick={() => handleToggleStatus(city)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase transition cursor-pointer ${
                    city.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}
                >
                  {city.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-12 text-center text-gray-400 shadow-sm">
          No operational cities registered.
        </div>
      )}

      {/* Add City Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-2xl text-[#222432]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEEEF2] mb-4">
              <h3 className="text-base font-black text-[#222432]">Add Operational City</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCity} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">City Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Hyderabad"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g. Telangana"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">City Emoji Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="🏰"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] text-center focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#F84464] focus:ring-[#F84464]"
                  />
                  <label htmlFor="isPopular" className="text-gray-700 font-bold">
                    Tier 1 Metro
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#EEEEF2]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
