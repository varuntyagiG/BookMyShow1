import React, { createContext, useContext, useState, useEffect } from 'react';
import { contentApi } from '../services/api';

const CityContext = createContext(null);

const DEFAULT_POPULAR_CITIES = [
  { name: 'Mumbai', icon: '🏙️' },
  { name: 'Delhi-NCR', icon: '🏛️' },
  { name: 'Bengaluru', icon: '💻' },
  { name: 'Hyderabad', icon: '🏰' },
  { name: 'Chandigarh', icon: '🌳' },
  { name: 'Ahmedabad', icon: '🪁' },
  { name: 'Chennai', icon: '🏖️' },
  { name: 'Pune', icon: '🎓' },
  { name: 'Kolkata', icon: '🚊' },
  { name: 'Kochi', icon: '🌴' },
];

const DEFAULT_OTHER_CITIES = [
  'Agra', 'Ajmer', 'Amritsar', 'Bhopal', 'Bhubaneswar', 'Coimbatore', 'Dehradun',
  'Goa', 'Guwahati', 'Indore', 'Jaipur', 'Jalandhar', 'Kanpur', 'Lucknow',
  'Ludhiana', 'Madurai', 'Mangaluru', 'Nagpur', 'Nashik', 'Patna', 'Raipur',
  'Ranchi', 'Surat', 'Thiruvananthapuram', 'Vadodara', 'Varanasi', 'Visakhapatnam'
];

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem('bms_city') || 'Mumbai';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [popularCities, setPopularCities] = useState(DEFAULT_POPULAR_CITIES);
  const [otherCities, setOtherCities] = useState(DEFAULT_OTHER_CITIES);
  const [loading, setLoading] = useState(true);

  // Fetch active cities from MongoDB (Single Source of Truth)
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await contentApi.getCities();
        if (res.success && Array.isArray(res.cities) && res.cities.length > 0) {
          const popular = [];
          const other = [];

          res.cities.forEach((c) => {
            if (c.isPopular) {
              popular.push({ name: c.name, icon: c.icon || '🏙️' });
            } else {
              other.push(c.name);
            }
          });

          if (popular.length > 0) setPopularCities(popular);
          if (other.length > 0) setOtherCities(other);
        }
      } catch (err) {
        console.warn('Could not fetch operational cities from DB, using defaults:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCities();
  }, []);

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    localStorage.setItem('bms_city', city);
    setIsCityModalOpen(false);
  };

  const value = {
    selectedCity,
    setSelectedCity,
    isCityModalOpen,
    setIsCityModalOpen,
    popularCities,
    otherCities,
    loadingCities: loading,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
