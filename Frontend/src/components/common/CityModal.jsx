import React, { useState } from 'react';
import { Search, X, Compass, Check } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export default function CityModal() {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, setSelectedCity, popularCities, otherCities } = useCity();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isCityModalOpen) return null;

  const filteredOtherCities = otherCities.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (cityName) => {
    setSelectedCity(cityName);
    setIsCityModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your city (e.g. Mumbai, Delhi, Bengaluru)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 focus:bg-white transition-all"
              autoFocus
            />
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {/* Detect My Location */}
          <div className="mb-6 pb-4 border-b border-gray-100">
            <button
              onClick={() => handleSelect('Mumbai')}
              className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F84464] font-bold hover:opacity-85 cursor-pointer transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#F84464] animate-pulse" />
              </div>
              <span>Auto-Detect My Current Location (Mumbai)</span>
            </button>
          </div>

          {/* Popular Cities */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase">
                Popular Cities
              </h3>
              <span className="text-[11px] text-gray-400">Selected: <strong className="text-[#F84464]">{selectedCity}</strong></span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {popularCities.map((city) => {
                const isSelected = selectedCity === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city.name)}
                    className={`flex flex-col items-center p-3 sm:p-4 rounded-xl border transition-all cursor-pointer relative group ${isSelected
                        ? 'border-[#F84464] bg-red-50/60 text-[#F84464] font-black ring-2 ring-[#F84464]/20 shadow-xs'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/80 text-gray-700'
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#F84464] rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                      {city.icon}
                    </span>
                    <span className="text-xs text-center font-bold line-clamp-1">{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Cities */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase mb-3.5">
              Other Cities
            </h3>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {filteredOtherCities.map((city) => {
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isSelected
                        ? 'bg-[#F84464] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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

