import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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

// B2B Cinema Partner Components & Pages
import CinemaPartnerProtectedRoute from './components/cinemaPartner/CinemaPartnerProtectedRoute';
import CinemaPartnerLayout from './components/cinemaPartner/CinemaPartnerLayout';
import CinemaPartnerLoginPage from './pages/cinemaPartner/CinemaPartnerLoginPage';
import CinemaPartnerDashboardPage from './pages/cinemaPartner/CinemaPartnerDashboardPage';
import CinemaPartnerCinemasPage from './pages/cinemaPartner/CinemaPartnerCinemasPage';
import CinemaPartnerScreensPage from './pages/cinemaPartner/CinemaPartnerScreensPage';
import CinemaPartnerMoviesPage from './pages/cinemaPartner/CinemaPartnerMoviesPage';
import CinemaPartnerShowsPage from './pages/cinemaPartner/CinemaPartnerShowsPage';
import CinemaPartnerBookingsPage from './pages/cinemaPartner/CinemaPartnerBookingsPage';
import CinemaPartnerTicketsPage from './pages/cinemaPartner/CinemaPartnerTicketsPage';
import CinemaPartnerScannerPage from './pages/cinemaPartner/CinemaPartnerScannerPage';
import CinemaPartnerRevenuePage from './pages/cinemaPartner/CinemaPartnerRevenuePage';
import CinemaPartnerReportsPage from './pages/cinemaPartner/CinemaPartnerReportsPage';
import CinemaPartnerProfilePage from './pages/cinemaPartner/CinemaPartnerProfilePage';

// Platform Admin Components & Pages
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminPartnersPage from './pages/admin/AdminPartnersPage';
import AdminCinemasPage from './pages/admin/AdminCinemasPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminCitiesPage from './pages/admin/AdminCitiesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

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
          PLATFORM ADMIN PORTAL (ISOLATED LAYOUT)
      ========================================= */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="cinemas" element={<AdminCinemasPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="shows" element={<AdminShowsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="revenue" element={<AdminRevenuePage />} />
        <Route path="offers" element={<AdminOffersPage />} />
        <Route path="cities" element={<AdminCitiesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* =========================================
          B2B CINEMA PARTNER PORTAL (ISOLATED LAYOUT)
      ========================================= */}
      <Route path="/cinema-partner/login" element={<CinemaPartnerLoginPage />} />
      <Route
        path="/cinema-partner"
        element={
          <CinemaPartnerProtectedRoute>
            <CinemaPartnerLayout />
          </CinemaPartnerProtectedRoute>
        }
      >
        <Route index element={<CinemaPartnerDashboardPage />} />
        <Route path="cinemas" element={<CinemaPartnerCinemasPage />} />
        <Route path="screens" element={<CinemaPartnerScreensPage />} />
        <Route path="movies" element={<CinemaPartnerMoviesPage />} />
        <Route path="shows" element={<CinemaPartnerShowsPage />} />
        <Route path="bookings" element={<CinemaPartnerBookingsPage />} />
        <Route path="tickets" element={<CinemaPartnerTicketsPage />} />
        <Route path="scanner" element={<CinemaPartnerScannerPage />} />
        <Route path="revenue" element={<CinemaPartnerRevenuePage />} />
        <Route path="reports" element={<CinemaPartnerReportsPage />} />
        <Route path="profile" element={<CinemaPartnerProfilePage />} />
      </Route>

      {/* =========================================
          CUSTOMER PORTAL (STANDARD LAYOUT)
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
        <Route path="/stream" element={<StreamPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/sports" element={<CategoryPage />} />
        <Route path="/plays" element={<CategoryPage />} />
        <Route path="/activities" element={<CategoryPage />} />
        <Route path="/giftcards" element={<GiftCardsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/my-bookings" element={<CustomerBookingsPage />} />
        <Route path="/profile" element={<CustomerProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
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
