import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';

// Customer Components
import Navbar from './components/common/Navbar';
import SubNav from './components/common/SubNav';
import Footer from './components/common/Footer';
import CityModal from './components/common/CityModal';
import AuthModal from './components/auth/AuthModal';

// Customer Pages
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
import CustomerBookingsPage from './pages/CustomerBookingsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

function CustomerLayout({ searchQuery, onSearch }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5FA]">
      {/* Top Navbar */}
      <Navbar onSearch={onSearch} />

      {/* Category Sub Navigation */}
      <SubNav />

      {/* Routed Customer Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* BookMyShow Footer */}
      <Footer />

      {/* Global Modals */}
      <CityModal />
      <AuthModal />
    </div>
  );
}

function AppRoutes() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Routes>
      {/* =========================================
          BOOKMYTRIP CUSTOMER PLATFORM
      ========================================= */}
      <Route
        element={
          <CustomerLayout
            searchQuery={searchQuery}
            onSearch={(q) => setSearchQuery(q)}
          />
        }
      >
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/stream" element={<StreamPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/sports" element={<CategoryPage />} />
        <Route path="/plays" element={<CategoryPage />} />
        <Route path="/activities" element={<CategoryPage />} />
        <Route path="/giftcards" element={<GiftCardsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/my-bookings" element={<CustomerBookingsPage />} />
        <Route path="/tickets" element={<Navigate to="/my-bookings" replace />} />
        <Route path="/profile" element={<CustomerProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Catch-all route safely redirects any disabled/legacy admin or vendor routes to Customer Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <AppRoutes />
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

