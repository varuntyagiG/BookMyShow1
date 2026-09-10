import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import Navbar from './components/common/Navbar';
import SubNav from './components/common/SubNav';
import Footer from './components/common/Footer';
import CityModal from './components/common/CityModal';
import AuthModal from './components/auth/AuthModal';

import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import StreamPage from './pages/StreamPage';
import EventsPage from './pages/EventsPage';
import CategoryPage from './pages/CategoryPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import GiftCardsPage from './pages/GiftCardsPage';
import OffersPage from './pages/OffersPage';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5FA]">
      {/* Top Navbar */}
      <Navbar onSearch={(query) => setSearchQuery(query)} />

      {/* Category Sub Navigation */}
      <SubNav />

      {/* Main Routed Content */}
      <Routes>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />
        <Route path="/stream" element={<StreamPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/sports" element={<CategoryPage />} />
        <Route path="/plays" element={<CategoryPage />} />
        <Route path="/activities" element={<CategoryPage />} />
        <Route path="/giftcards" element={<GiftCardsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>

      {/* BookMyShow Footer */}
      <Footer />

      {/* Global Modals */}
      <CityModal />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <AppContent />
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
