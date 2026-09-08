import React, { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext(null);

export const POPULAR_CITIES = [
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

export const OTHER_CITIES = [
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
    popularCities: POPULAR_CITIES,
    otherCities: OTHER_CITIES,
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

