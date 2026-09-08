import React, { useState } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export default function CityModal() {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, setSelectedCity, popularCities, otherCities } = useCity();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isCityModalOpen) return null;

  const filteredOtherCities = otherCities.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:bg-white transition-colors"
              autoFocus
            />
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="absolute right-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Detect My Location */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedCity('Mumbai')}
              className="flex items-center gap-2 text-sm text-[#F84464] font-medium hover:underline"
            >
              <MapPin className="w-4 h-4" />
              <span>Detect my location (Auto)</span>
            </button>
          </div>

          {/* Popular Cities */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4 text-center">
              Popular Cities
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {popularCities.map((city) => {
                const isSelected = selectedCity === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#F84464] bg-red-50/50 text-[#F84464] font-semibold'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-3xl mb-1.5">{city.icon}</span>
                    <span className="text-xs text-center line-clamp-1">{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Cities */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 text-center">
              Other Cities
            </h3>
            <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-1">
              {filteredOtherCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    selectedCity === city
                      ? 'bg-[#F84464] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {city}
                </button>
              ))}
              {filteredOtherCities.length === 0 && (
                <p className="text-xs text-gray-400 py-4">No cities found matching "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

