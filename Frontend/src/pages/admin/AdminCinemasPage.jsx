import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Store,
  Search,
  MapPin,
  Building2,
  Tv,
  Loader2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCinemas({
        search,
        city: cityFilter,
        status: statusFilter
      });
      if (res.success) {
        setCinemas(res.cinemas || []);
      }
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, [search, cityFilter, statusFilter]);

  const handleToggleStatus = async (cinema) => {
    const newStatus = cinema.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Change status of "${cinema.name}" to ${newStatus}?`)) return;

    setActionLoading(true);
    try {
      const res = await adminApi.updateCinemaStatus(cinema._id, { status: newStatus });
      if (res.success) {
        setCinemas((prev) =>
          prev.map((c) => (c._id === cinema._id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update cinema status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Distinct cities list for filter
  const distinctCities = Array.from(new Set(cinemas.map((c) => c.city).filter(Boolean)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-[#F84464]" />
            <span>Global Cinema Multiplexes Registry</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Centrally monitor every physical multiplex venue, auditorium capacity, and city distribution.
          </p>
        </div>

        <span className="font-bold text-[#222432] bg-white px-3.5 py-2 rounded-xl border border-[#EEEEF2] shadow-xs text-xs">
          Total Venues: {cinemas.length}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search multiplex name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <span>City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
            >
              <option value="all">All Cities</option>
              {distinctCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cinema Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading multiplex directory...</p>
        </div>
      ) : cinemas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cinemas.map((cinema) => (
            <div
              key={cinema._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between shadow-sm relative overflow-hidden group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-[#222432] leading-snug">{cinema.name}</h3>
                  <span
                    className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      cinema.status === 'active'
                        ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                        : 'bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20'
                    }`}
                  >
                    {cinema.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                  <span className="truncate">{cinema.city} • {cinema.address}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-[#F9F9FB] p-2.5 rounded-xl border border-[#EEEEF2] mb-3">
                  <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">
                    Partner: <strong className="text-[#222432]">{cinema.partner?.businessName || cinema.partner?.name || 'Assigned Operator'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Screens</span>
                    <strong className="text-[#222432] font-mono">{cinema.activeScreensCount || 0}</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Active Shows</span>
                    <strong className="text-[#F84464] font-mono">{cinema.activeShowsCount || 0}</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Capacity</span>
                    <strong className="text-[#4ABD5D] font-mono">{cinema.managedCapacity || 120}</strong>
                  </div>
                </div>

                {cinema.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cinema.facilities.slice(0, 4).map((f, i) => (
                      <span key={i} className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">Property Status</span>
                <button
                  onClick={() => handleToggleStatus(cinema)}
                  disabled={actionLoading}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    cinema.status === 'active'
                      ? 'bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white'
                      : 'bg-[#4ABD5D]/10 hover:bg-[#4ABD5D] text-[#4ABD5D] hover:text-white'
                  }`}
                >
                  {cinema.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-12 text-center text-gray-400 shadow-sm">
          No multiplex venues found.
        </div>
      )}
    </div>
  );
}

