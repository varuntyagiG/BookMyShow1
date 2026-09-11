import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VendorAuthProvider } from './context/VendorAuthContext';
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
import CinemasPage from './pages/CinemasPage';
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

// Cinema Partner (Vendor) Subsystem
import VendorProtectedRoute from './components/vendor/VendorProtectedRoute';
import VendorLayout from './components/vendor/VendorLayout';
import VendorLoginPage from './pages/vendor/VendorLoginPage';
import VendorSignUpPage from './pages/vendor/VendorSignUpPage';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorCinemasPage from './pages/vendor/VendorCinemasPage';
import VendorScreensPage from './pages/vendor/VendorScreensPage';
import VendorMoviesPage from './pages/vendor/VendorMoviesPage';
import VendorShowsPage from './pages/vendor/VendorShowsPage';
import VendorScannerPage from './pages/vendor/VendorScannerPage';
import VendorBookingsPage from './pages/vendor/VendorBookingsPage';
import VendorRevenuePage from './pages/vendor/VendorRevenuePage';

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
          CINEMA PARTNER (VENDOR) PORTAL
      ========================================= */}
      <Route path="/vendor/login" element={<VendorLoginPage />} />
      <Route path="/vendor/signup" element={<VendorSignUpPage />} />

      <Route
        path="/vendor"
        element={
          <VendorProtectedRoute>
            <VendorLayout />
          </VendorProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="cinemas" element={<VendorCinemasPage />} />
        <Route path="screens" element={<VendorScreensPage />} />
        <Route path="movies" element={<VendorMoviesPage />} />
        <Route path="shows" element={<VendorShowsPage />} />
        <Route path="scanner" element={<VendorScannerPage />} />
        <Route path="bookings" element={<VendorBookingsPage />} />
        <Route path="revenue" element={<VendorRevenuePage />} />
      </Route>

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
        <Route path="/cinemas" element={<CinemasPage />} />
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

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VendorAuthProvider>
          <CityProvider>
            <AppRoutes />
          </CityProvider>
        </VendorAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
