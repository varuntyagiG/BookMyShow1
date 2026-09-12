import React, { useState } from 'react';
import { Search, X, Compass, Check, Loader2, AlertCircle, Navigation } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export default function CityModal() {
  const {
    isCityModalOpen,
    setIsCityModalOpen,
    selectedCity,
    setSelectedCity,
    popularCities,
    otherCities,
    isDetectingLocation,
    detectLocation
  } = useCity();

  const [searchQuery, setSearchQuery] = useState('');
  const [detectionFeedback, setDetectionFeedback] = useState(null);

  if (!isCityModalOpen) return null;

  const filteredOtherCities = otherCities.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (cityName) => {
    setSelectedCity(cityName);
    setIsCityModalOpen(false);
  };

  const handleAutoDetect = async () => {
    setDetectionFeedback(null);
    const result = await detectLocation();

    if (result.success && result.cityName) {
      setDetectionFeedback({
        type: 'success',
        cityName: result.cityName,
        message: result.message || `📍 Matched: ${result.cityName}`
      });
      // Allow user to see the success checkmark for 700ms before smooth dismiss
      setTimeout(() => {
        setIsCityModalOpen(false);
      }, 800);
    } else {
      setDetectionFeedback({
        type: 'error',
        message: result.message || 'Location access denied or unavailable. Please pick your city below.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">

        {/* Top Header Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-slate-50/70">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your city (e.g. Mumbai, Delhi, Bengaluru)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 shadow-2xs transition-all"
              autoFocus
            />
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">

          {/* Senior Architect Auto-Detect Live Location Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-50/90 via-rose-50/60 to-orange-50/50 border border-red-100/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#F84464] flex items-center justify-center shadow-xs shrink-0 border border-red-100">
                  {isDetectingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#F84464]" />
                  ) : (
                    <Compass className="w-5 h-5 text-[#F84464] animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Auto-Detect My Current Location
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Use browser GPS to match nearest cinema hub instantly
                  </p>
                </div>
              </div>

              <button
                onClick={handleAutoDetect}
                disabled={isDetectingLocation}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer ${
                  isDetectingLocation
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-[#F84464] hover:bg-[#E23454] text-white active:scale-95'
                }`}
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Locating GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Detect Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Detection Feedback Alert */}
            {detectionFeedback && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
                  detectionFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {detectionFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">{detectionFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Popular Cities Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase">
                Popular Cities
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                Current: <strong className="text-[#F84464]">{selectedCity}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {popularCities.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                const isDetectedTarget = detectionFeedback?.cityName?.toLowerCase() === city.name.toLowerCase();

                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city.name)}
                    className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isDetectedTarget
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black ring-4 ring-emerald-400/20 scale-102'
                        : isSelected
                        ? 'border-[#F84464] bg-red-50/70 text-[#F84464] font-black ring-2 ring-[#F84464]/20 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-[#F84464] rounded-full flex items-center justify-center text-white shadow-2xs">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform duration-200">
                      {city.icon}
                    </span>
                    <span className="text-xs text-center font-bold line-clamp-1">{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Regional Cities Section */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase mb-3">
              Other Cities ({filteredOtherCities.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
              {filteredOtherCities.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F84464] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
              {filteredOtherCities.length === 0 && (
                <div className="w-full text-center py-6">
                  <p className="text-xs text-gray-400">No cities found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs text-[#F84464] font-bold hover:underline cursor-pointer"
                  >
                    Clear search query
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
