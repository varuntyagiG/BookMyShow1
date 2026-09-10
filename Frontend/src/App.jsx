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

// Super Admin Components & Pages
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

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
          SUPER ADMIN PORTAL (ISOLATED LAYOUT)
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
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="shows" element={<AdminShowsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
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
