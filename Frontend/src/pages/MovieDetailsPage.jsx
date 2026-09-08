import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentApi } from '../services/api';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Clock,
  Calendar,
  Heart,
  ChevronRight,
  Info,
  CheckCircle,
  Share2,
  Loader2,
  X
} from 'lucide-react';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('All');

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    theatre: null,
    showtime: null,
    seatsCount: 2,
    seatType: 'Prime',
    confirmed: false,
  });

  const showtimesRef = useRef(null);

  const dates = [
    { day: 'TODAY', date: '08 SEP' },
    { day: 'TOM', date: '09 SEP' },
    { day: 'WED', date: '10 SEP' },
    { day: 'THU', date: '11 SEP' },
    { day: 'FRI', date: '12 SEP' },
  ];

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await contentApi.getMovieById(id);
        if (res.success && res.movie) {
          setMovie(res.movie);
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const scrollToBooking = () => {
    if (showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowtimeClick = (theatre, showtime) => {
    setBookingModal({
      isOpen: true,
      theatre,
      showtime,
      seatsCount: 2,
      seatType: 'Prime',
      confirmed: false,
    });
  };

  const confirmBooking = () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setBookingModal((prev) => ({ ...prev, confirmed: true }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading movie details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Movie Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">The requested movie could not be loaded.</p>
        <Link
          to="/movies"
          className="bg-[#F84464] text-white text-xs font-bold px-4 py-2 rounded"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5FA] min-h-screen">
      
      {/* 1. Hero Backdrop Section */}
      <div className="relative bg-[#1A1A24] text-white overflow-hidden">
        {/* Backdrop background blur */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-sm scale-105"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A24] via-[#1A1A24]/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left Movie Poster */}
            <div className="shrink-0 w-60 sm:w-64 rounded-xl overflow-hidden shadow-2xl border border-white/10 mx-auto md:mx-0">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="bg-black/80 py-2 text-center text-xs text-gray-300 font-medium border-t border-gray-800">
                In Cinemas
              </div>
            </div>

            {/* Right Movie Details */}
            <div className="flex-1 flex flex-col justify-between self-stretch">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white my-0">
                  {movie.title}
                </h1>

                {/* Rating Card */}
                <div className="my-4 inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-[#F84464] text-[#F84464]" />
                    <span className="text-lg font-bold text-white">{movie.rating}/10</span>
                    <span className="text-xs text-gray-300">({movie.voteCount} Votes)</span>
                  </div>
                  <button
                    onClick={() => alert('Review submitted! Thank you for rating.')}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
                  >
                    Rate now
                  </button>
                </div>

                {/* Formats & Languages */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded text-xs text-gray-200">
                    <span>{movie.language}</span>
                  </div>
                  {movie.formats && (
                    <div className="flex items-center gap-1.5">
                      {movie.formats.map((fmt) => (
                        <span
                          key={fmt}
                          className="bg-[#2B3148] border border-gray-600 px-2 py-0.5 rounded text-[11px] font-semibold text-gray-200"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                  <span>{movie.duration}</span>
                  <span>•</span>
                  <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                  <span>•</span>
                  <span className="border border-gray-400 px-1 rounded text-[10px]">{movie.certificate}</span>
                  <span>•</span>
                  <span>{movie.releaseDate}</span>
                </div>
              </div>

              {/* Book Tickets CTA Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={scrollToBooking}
                  className="w-full sm:w-auto bg-[#F84464] hover:bg-[#e03a58] text-white text-sm font-bold px-10 py-3 rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  Book tickets
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 2. About & Cast Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">About the movie</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-4xl">
            {movie.synopsis || 'Experience top cinematic storytelling in theaters near you.'}
          </p>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Cast</h3>
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
                {movie.cast.map((actor) => (
                  <div key={actor.name} className="flex flex-col items-center shrink-0 w-24 text-center">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover shadow-sm mb-2 border-2 border-gray-100"
                    />
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{actor.name}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{actor.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Theatre & Showtimes Booking Section */}
        <div ref={showtimesRef} className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Theatres &amp; Showtimes in {selectedCity}
            </h2>

            {/* Date Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {dates.map((d, index) => {
                const isSelected = selectedDateIndex === index;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDateIndex(index)}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#F84464] text-white font-bold shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <span className="text-[10px] uppercase">{d.day}</span>
                    <span className="text-sm font-bold">{d.date}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showtimes List */}
          <div className="divide-y divide-gray-100">
            {movie.theatres && movie.theatres.length > 0 ? (
              movie.theatres.map((theatre) => (
                <div key={theatre.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Theatre Info */}
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer" />
                        <h3 className="text-sm font-bold text-gray-900">{theatre.name}</h3>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 ml-6">{theatre.distance}</p>
                      
                      {/* Facilities Badges */}
                      <div className="flex items-center gap-2 ml-6 mt-2">
                        {theatre.facilities?.map((f) => (
                          <span
                            key={f}
                            className="bg-green-50 text-green-700 border border-green-200 text-[10px] px-1.5 py-0.2 rounded font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showtimes Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      {theatre.showtimes.map((st, idx) => {
                        let statusColor = 'border-gray-200 text-green-600 hover:border-green-600 hover:bg-green-50';
                        if (st.status === 'filling_fast') {
                          statusColor = 'border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50';
                        } else if (st.status === 'almost_full') {
                          statusColor = 'border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleShowtimeClick(theatre, st)}
                            className={`px-3 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-center group ${statusColor}`}
                          >
                            <span className="block text-xs font-bold text-gray-900">{st.time}</span>
                            <span className="block text-[10px] text-gray-400">{st.format} • {st.price}</span>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-500">
                No active showtimes found for this movie in {selectedCity} for the selected date.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 4. Booking Confirmation Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingModal.confirmed ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Select Seats for {movie.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {bookingModal.theatre?.name} • {bookingModal.showtime?.time} ({bookingModal.showtime?.format})
                </p>

                {/* Seats Count */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-2">How many seats?</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBookingModal({ ...bookingModal, seatsCount: num })}
                        className={`w-9 h-9 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          bookingModal.seatsCount === num
                            ? 'bg-[#F84464] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seat Type */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Select Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Prime', price: bookingModal.showtime?.price || '₹450' },
                      { name: 'Recliner VIP', price: '₹750' }
                    ].map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setBookingModal({ ...bookingModal, seatType: cat.name })}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                          bookingModal.seatType === cat.name
                            ? 'border-[#F84464] bg-red-50/50 text-[#F84464] font-bold'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="block text-xs font-bold">{cat.name}</span>
                        <span className="block text-[11px] text-gray-500">{cat.price} / seat</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-3 rounded-lg mb-5 text-xs text-gray-600 flex justify-between items-center">
                  <span>Total Payable ({bookingModal.seatsCount} Seats):</span>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{parseInt(bookingModal.showtime?.price?.replace('₹', '') || '400') * bookingModal.seatsCount}
                  </span>
                </div>

                <button
                  onClick={confirmBooking}
                  className="w-full py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isAuthenticated ? 'Proceed to Pay & Confirm' : 'Sign in to Continue'}
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
                <p className="text-xs text-gray-600 mb-4">
                  {bookingModal.seatsCount} Ticket(s) booked for <strong>{movie.title}</strong>
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-left text-xs text-gray-700 space-y-1 mb-5">
                  <p><strong>Cinema:</strong> {bookingModal.theatre?.name}</p>
                  <p><strong>Showtime:</strong> {bookingModal.showtime?.time} ({bookingModal.showtime?.format})</p>
                  <p><strong>Seat Category:</strong> {bookingModal.seatType}</p>
                  <p><strong>Booking ID:</strong> BMS-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
                <button
                  onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                  className="w-full py-2 bg-[#F84464] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

