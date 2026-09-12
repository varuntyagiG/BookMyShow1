import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { contentApi } from '../services/api';
import { autoDetectCurrentCity } from '../utils/geoLocator';
import { broadcastSync } from '../services/realtimeSync';

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

  // Live Location Detection State
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  // First-Visit Interceptor: Automatically greet new visitors with City Modal
  useEffect(() => {
    const hasChosenCity = localStorage.getItem('bms_city');
    if (!hasChosenCity) {
      const timer = setTimeout(() => {
        setIsCityModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch active cities from MongoDB (Single Source of Truth)
  useEffect(() => {
    let isMounted = true;
    async function loadCities() {
      try {
        const res = await contentApi.getCities();
        if (isMounted && res.success && Array.isArray(res.cities) && res.cities.length > 0) {
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
        if (isMounted) setLoading(false);
      }
    }

    loadCities();
    return () => {
      isMounted = false;
    };
  }, []);

  const setSelectedCity = useCallback((city) => {
    setSelectedCityState(city);
    localStorage.setItem('bms_city', city);
    setIsCityModalOpen(false);
    broadcastSync('CITY_CHANGED', { city });
  }, []);

  // Live GPS Auto-Detection Action
  const detectLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setLocationMessage('');

    try {
      const result = await autoDetectCurrentCity();
      if (result.success && result.cityName) {
        setSelectedCityState(result.cityName);
        localStorage.setItem('bms_city', result.cityName);
        setLocationMessage(result.message || `📍 Matched: ${result.cityName}`);
        broadcastSync('CITY_CHANGED', { city: result.cityName });
        return result;
      } else {
        setLocationMessage(result.message || 'Location access denied or unavailable.');
        return result;
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to detect location.';
      setLocationMessage(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  const openCityModal = useCallback(() => setIsCityModalOpen(true), []);
  const closeCityModal = useCallback(() => setIsCityModalOpen(false), []);

  const value = useMemo(() => ({
    selectedCity,
    setSelectedCity,
    isCityModalOpen,
    setIsCityModalOpen,
    openCityModal,
    closeCityModal,
    popularCities,
    otherCities,
    loadingCities: loading,
    isDetectingLocation,
    locationMessage,
    detectLocation
  }), [
    selectedCity,
    setSelectedCity,
    isCityModalOpen,
    openCityModal,
    closeCityModal,
    popularCities,
    otherCities,
    loading,
    isDetectingLocation,
    locationMessage,
    detectLocation
  ]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
