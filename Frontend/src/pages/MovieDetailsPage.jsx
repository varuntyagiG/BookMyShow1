import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentApi, bookingApi } from '../services/api';
import { useRealtimeRefresh } from '../services/realtimeSync';
import { getSocket } from '../services/socketClient';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Clock,
  Calendar,
  Heart,
  CheckCircle,
  Share2,
  Loader2,
  X,
  MapPin,
  Ticket,
  Popcorn,
  QrCode,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const generateBookingId = () => 'BMS-' + Date.now().toString().slice(-6);

export default function MovieDetailsPage() {
  const { id } = useParams();
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All');
  const [favoriteTheatres, setFavoriteTheatres] = useState({});
  const [copiedShare, setCopiedShare] = useState(false);

  // User Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRatingScore, setUserRatingScore] = useState(8);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Seat Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    theatre: null,
    showtime: null,
    seatsCount: 2,
    selectedSeats: ['B5', 'B6'],
    includeSnacks: false,
    confirmed: false,
    bookingId: null,
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const showtimesRef = useRef(null);

  const dates = React.useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const list = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayLabel = i === 0 ? 'TODAY' : i === 1 ? 'TOM' : days[d.getDay()];
      const dateLabel = `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`;
      const isoDate = d.toISOString().split('T')[0];
      list.push({ day: dayLabel, date: dateLabel, isoDate });
    }
    return list;
  }, []);

  const transportIcons = [
    { count: 1, name: 'Bicycle', emoji: '🚲' },
    { count: 2, name: 'Scooter', emoji: '🛵' },
    { count: 3, name: 'Auto', emoji: '🛺' },
    { count: 4, name: 'Car', emoji: '🚗' },
    { count: 5, name: 'SUV', emoji: '🚙' },
    { count: 6, name: 'Van', emoji: '🚐' },
    { count: 7, name: 'Minibus', emoji: '🚌' },
    { count: 8, name: 'Bus', emoji: '🚍' },
  ];

  // Dynamic layout derived from partner screen or fallback
  const activeSeatLayout = React.useMemo(() => {
    const screenLayout = bookingModal.showtime?.seatingLayout;
    const booked = bookingModal.occupiedSeats || [];
    if (screenLayout && Array.isArray(screenLayout) && screenLayout.length > 0) {
      return screenLayout.map((r) => {
        const count = r.seatsCount || 12;
        const seats = Array.from({ length: count }, (_, i) => i + 1);
        const disabled = r.disabledSeats || [];
        const rowOccupied = [...new Set([...booked.filter((s) => s.startsWith(r.row)), ...disabled])];
        return {
          row: r.row,
          tier: r.tier || 'Classic',
          price: r.basePrice || bookingModal.showtime?.basePrice || 250,
          seats,
          occupied: rowOccupied,
        };
      });
    }
    return [
      { row: 'A', tier: 'Recliner VIP', price: 750, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('A')) },
      { row: 'B', tier: 'Prime Plus', price: 450, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('B')) },
      { row: 'C', tier: 'Prime Plus', price: 450, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('C')) },
      { row: 'D', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('D')) },
      { row: 'E', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('E')) },
      { row: 'F', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('F')) },
      { row: 'G', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('G')) },
      { row: 'H', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('H')) },
      { row: 'J', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('J')) },
      { row: 'K', tier: 'Classic', price: 280, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], occupied: booked.filter((s) => s.startsWith('K')) },
    ];
  }, [bookingModal.showtime, bookingModal.occupiedSeats]);

  const fetchMovieDetails = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await contentApi.getMovieById(id);
      if (res.success && res.movie) {
        setMovie(res.movie);
      }
    } catch (err) {
      console.error('Failed to load movie details:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails, selectedCity]);

  // Real-time movie and showtime schedule updates across tabs & portals
  useRealtimeRefresh(['MOVIE_MUTATION', 'SHOW_MUTATION'], () => {
    fetchMovieDetails(true);
  });

  // Real-time seat occupancy updates when seat selection modal is open
  useRealtimeRefresh(['BOOKING_MUTATION'], async () => {
    if (bookingModal.isOpen && !bookingModal.confirmed && bookingModal.showtime) {
      try {
        const rawShowId = bookingModal.showtime.showId || bookingModal.showtime.id || bookingModal.showtime._id;
        const seatRes = await bookingApi.getShowSeats({
          showId: rawShowId,
          theatreName: bookingModal.theatre?.name,
          showtime: bookingModal.showtime?.time,
          showDate: bookingModal.showtime?.showDate || dates[selectedDateIndex]?.date || 'Today',
          movieId: movie?._id || movie?.customId,
          movieTitle: movie?.title
        });
        if (seatRes.success && Array.isArray(seatRes.bookedSeats)) {
          setBookingModal((prev) => {
            const freshOccupied = Array.from(new Set([...(prev.occupiedSeats || []), ...seatRes.bookedSeats]));
            const remainingSelected = (prev.selectedSeats || []).filter((s) => !freshOccupied.includes(s));
            return {
              ...prev,
              occupiedSeats: freshOccupied,
              selectedSeats: remainingSelected,
            };
          });
        }
      } catch (_e) {}
    }
  });

  // Instantaneous WebSocket Show Room subscription for real-time seat locks
  useEffect(() => {
    if (!bookingModal.isOpen || bookingModal.confirmed || !bookingModal.showtime) return;

    const rawShowId = bookingModal.showtime.showId || bookingModal.showtime.id || bookingModal.showtime._id;
    const socket = getSocket();

    if (rawShowId) {
      socket.emit('join_show', { showId: String(rawShowId) });
    }

    const handleLiveSeatsLocked = (data) => {
      if (data && Array.isArray(data.seats) && (!data.showId || data.showId === String(rawShowId))) {
        setBookingModal((prev) => {
          const newlyLocked = data.seats;
          const freshOccupied = Array.from(new Set([...(prev.occupiedSeats || []), ...newlyLocked]));
          const conflictedSeats = (prev.selectedSeats || []).filter((s) => newlyLocked.includes(s));
          const remainingSelected = (prev.selectedSeats || []).filter((s) => !newlyLocked.includes(s));

          if (conflictedSeats.length > 0) {
            setBookingError(`⚠️ Seat(s) ${conflictedSeats.join(', ')} were just secured by another customer.`);
          }

          return {
            ...prev,
            occupiedSeats: freshOccupied,
            selectedSeats: remainingSelected
          };
        });
      }
    };

    socket.on('SEATS_LOCKED', handleLiveSeatsLocked);

    return () => {
      if (rawShowId) {
        socket.emit('leave_show', { showId: String(rawShowId) });
      }
      socket.off('SEATS_LOCKED', handleLiveSeatsLocked);
    };
  }, [bookingModal.isOpen, bookingModal.confirmed, bookingModal.showtime?.showId, bookingModal.showtime?.id, bookingModal.showtime?._id]);

  const scrollToBooking = () => {
    if (showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const toggleFavoriteTheatre = (theatreId) => {
    setFavoriteTheatres((prev) => ({ ...prev, [theatreId]: !prev[theatreId] }));
  };

  const handleShowtimeClick = async (theatre, showtime) => {
    const basePrice = parseInt(showtime.price?.toString().replace('₹', '') || '450', 10);
    setBookingError('');
    let occupied = Array.isArray(showtime.bookedSeats) ? [...showtime.bookedSeats] : [];

    const rawShowId = showtime.showId || showtime.id || showtime._id;
    try {
      const seatRes = await bookingApi.getShowSeats({
        showId: rawShowId,
        theatreName: theatre?.name,
        showtime: showtime.time,
        showDate: showtime.showDate || dates[selectedDateIndex]?.date || 'Today',
        movieId: movie?._id || movie?.customId,
        movieTitle: movie?.title
      });
      if (seatRes.success && Array.isArray(seatRes.bookedSeats)) {
        occupied = Array.from(new Set([...occupied, ...seatRes.bookedSeats]));
      }
    } catch (e) {
      console.warn('Could not fetch real-time seats from backend, using cached showtime seats', e);
    }

    // Automatically pick the first 2 genuinely available seats that are NOT occupied
    const rowPrefixes = ['B', 'C', 'D', 'E', 'A', 'F', 'G', 'H', 'J', 'K'];
    let initialSeats = [];
    for (const r of rowPrefixes) {
      for (let i = 1; i <= 12; i++) {
        const seatId = `${r}${i}`;
        if (!occupied.includes(seatId)) {
          initialSeats.push(seatId);
          if (initialSeats.length >= 2) break;
        }
      }
      if (initialSeats.length >= 2) break;
    }

    setBookingModal({
      isOpen: true,
      theatre,
      showtime: { ...showtime, basePrice },
      occupiedSeats: occupied,
      seatsCount: initialSeats.length || 2,
      selectedSeats: initialSeats,
      includeSnacks: false,
      confirmed: false,
      bookingId: generateBookingId(),
      bookingData: null,
    });
  };

  const handleSeatsCountChange = (count) => {
    setBookingError('');
    const occupied = bookingModal.occupiedSeats || [];
    const availableSeats = [];
    const rowPrefixes = ['B', 'C', 'D', 'E', 'A', 'F', 'G', 'H', 'J', 'K'];
    for (const r of rowPrefixes) {
      for (let i = 1; i <= 12; i++) {
        const seatId = `${r}${i}`;
        if (!occupied.includes(seatId)) {
          availableSeats.push(seatId);
          if (availableSeats.length >= count) break;
        }
      }
      if (availableSeats.length >= count) break;
    }

    setBookingModal((prev) => ({
      ...prev,
      seatsCount: count,
      selectedSeats: availableSeats.length > 0 ? availableSeats : prev.selectedSeats,
    }));
  };

  const handleSeatClick = (seatId, isOccupied) => {
    if (isOccupied) return;
    setBookingError('');

    setBookingModal((prev) => {
      const isSelected = prev.selectedSeats.includes(seatId);
      let nextSeats = [];

      if (isSelected) {
        nextSeats = prev.selectedSeats.filter((s) => s !== seatId);
      } else {
        if (prev.selectedSeats.length >= prev.seatsCount) {
          nextSeats = [...prev.selectedSeats.slice(1), seatId];
        } else {
          nextSeats = [...prev.selectedSeats, seatId];
        }
      }

      return {
        ...prev,
        selectedSeats: nextSeats,
      };
    });
  };

  const confirmBooking = async () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }

    if (!bookingModal.selectedSeats || bookingModal.selectedSeats.length === 0) {
      setBookingError('Please select at least one seat.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const selectedDate = dates[selectedDateIndex]?.date || 'Today';
      const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
      const rawCinemaId = bookingModal.showtime?.cinemaId || bookingModal.theatre?.cinemaId || bookingModal.theatre?.id;
      const rawScreenId = bookingModal.showtime?.screenId;
      const rawShowId = bookingModal.showtime?.showId;

      const res = await bookingApi.createBooking({
        movieId: movie ? (movie._id || movie.customId || movie.id) : id,
        movieTitle: movie ? movie.title : 'Movie',
        theatreName: bookingModal.theatre?.name || 'PVR Cinemas',
        showtime: bookingModal.showtime?.time || '10:00 AM',
        showDate: selectedDate,
        seats: bookingModal.selectedSeats,
        includeSnacks: bookingModal.includeSnacks,
        showId: isObjectId(rawShowId) ? rawShowId : undefined,
        screenId: isObjectId(rawScreenId) ? rawScreenId : undefined,
        cinemaId: isObjectId(rawCinemaId) ? rawCinemaId : undefined,
      });

      if (res.success && res.booking) {
        // Trigger celebratory confetti cannon on booking success
        try {
          confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#F84464', '#10B981', '#FFD700', '#3B82F6', '#EC4899']
          });
        } catch (_confettiErr) {
          // Fallback gracefully if canvas context is restricted
        }

        setBookingModal((prev) => ({
          ...prev,
          confirmed: true,
          bookingId: res.booking.bookingId,
          bookingData: res.booking,
          occupiedSeats: [...(prev.occupiedSeats || []), ...prev.selectedSeats],
        }));
      } else {
        setBookingError(res.message || 'Unable to confirm booking. Please try again.');
      }
    } catch (err) {
      // Refresh latest booked seats immediately so occupied seats turn red and conflict clears
      try {
        const seatRes = await bookingApi.getShowSeats({
          showId: isObjectId(rawShowId) ? rawShowId : undefined,
          theatreName: bookingModal.theatre?.name,
          showtime: bookingModal.showtime?.time,
          showDate: selectedDate
        });
        if (seatRes.success && Array.isArray(seatRes.bookedSeats)) {
          setBookingModal((prev) => {
            const freshOccupied = Array.from(new Set([...(prev.occupiedSeats || []), ...seatRes.bookedSeats]));
            const remainingSelected = (prev.selectedSeats || []).filter((s) => !freshOccupied.includes(s));
            return {
              ...prev,
              occupiedSeats: freshOccupied,
              selectedSeats: remainingSelected,
            };
          });
        }
      } catch (_refreshErr) {
        // Ignore background refresh errors
      }
      setBookingError(err.message || 'Seat conflict: One or more selected seats were already booked. Please choose other available seats.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading movie details &amp; showtimes...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#222432] mb-2">Movie Not Found</h2>
        <p className="text-xs text-gray-500 mb-5">The requested movie could not be loaded.</p>
        <Link
          to="/movies"
          className="bg-[#F84464] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-[0_6px_18px_-6px_rgba(248,68,100,0.5)] hover:bg-[#E03A58] active:scale-[0.97] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  // Calculate pricing
  const ticketBasePrice = bookingModal.showtime?.basePrice || 450;
  const ticketsSubtotal = ticketBasePrice * (bookingModal.selectedSeats.length || bookingModal.seatsCount);
  const convenienceFee = Math.round(35.4 * (bookingModal.selectedSeats.length || bookingModal.seatsCount));
  const snacksTotal = bookingModal.includeSnacks ? 250 : 0;
  const grandTotal = ticketsSubtotal + convenienceFee + snacksTotal;

  // Filter theatres client side
  const filteredTheatres = (movie.theatres || []).map((th) => {
    let showtimes = th.showtimes || [];

    // Filter by format
    if (selectedFormatFilter !== 'All') {
      showtimes = showtimes.filter((st) => st.format.toLowerCase() === selectedFormatFilter.toLowerCase());
    }

    // Filter by time of day
    if (selectedTimeFilter !== 'All') {
      showtimes = showtimes.filter((st) => {
        const hour = parseInt(st.time.split(':')[0], 10);
        const isPM = st.time.includes('PM');
        const military = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
        if (selectedTimeFilter === 'Morning') return military < 12;
        if (selectedTimeFilter === 'Afternoon') return military >= 12 && military < 16;
        if (selectedTimeFilter === 'Evening') return military >= 16 && military < 19;
        if (selectedTimeFilter === 'Night') return military >= 19;
        return true;
      });
    }

    return { ...th, showtimes };
  }).filter((th) => th.showtimes.length > 0);

  return (
    <div className="bg-[#F5F5FA] min-h-screen">

      {/* 1. Hero Backdrop Section */}
      <div className="relative bg-[#121216] text-white overflow-hidden">
        {/* Atmospheric Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-105"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121216] via-[#121216]/90 to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-[#F84464]/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">

            {/* Left Movie Poster */}
            <div className="shrink-0 w-60 sm:w-68 rounded-2xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] border border-white/10 mx-auto md:mx-0 group relative">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="bg-black/90 py-2.5 text-center text-xs text-white font-bold tracking-wider uppercase border-t border-gray-800 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Cinemas</span>
              </div>
            </div>

            {/* Right Movie Details */}
            <div className="flex-1 flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white my-0 leading-[1.08]">
                    {movie.title}
                  </h1>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] shrink-0"
                    title="Share movie"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-gray-300" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Rating Card */}
                <div className="my-5 inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#F84464]/20 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-[#F84464] text-[#F84464]" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">{movie.rating}</span>
                        <span className="text-xs text-gray-300">/ 10</span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-medium">{movie.voteCount} Votes</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-white/20" />

                  <button
                    onClick={() => setRatingModalOpen(true)}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    Rate now
                  </button>
                </div>

                {/* Formats & Languages */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-white/15 px-3 py-1.5 rounded-md text-xs text-gray-200 font-medium">
                    <span>{movie.language}</span>
                  </div>
                  {movie.formats && (
                    <div className="flex items-center gap-1.5">
                      {movie.formats.map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => {
                            setSelectedFormatFilter(fmt);
                            scrollToBooking();
                          }}
                          className={`border px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${selectedFormatFilter === fmt
                              ? 'bg-[#F84464] border-[#F84464] text-white shadow-[0_3px_10px_-3px_rgba(248,68,100,0.5)]'
                              : 'bg-white/10 border-white/20 text-gray-200 hover:border-white/40 hover:bg-white/15'
                            }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {movie.duration}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                  <span className="text-gray-500">•</span>
                  <span className="border border-gray-500 bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-200">
                    {movie.certificate}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {movie.releaseDate}
                  </span>
                </div>
              </div>

              {/* Book Tickets CTA Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={scrollToBooking}
                  className="w-full sm:w-auto bg-[#F84464] hover:bg-[#E03A58] text-white text-sm font-extrabold px-10 py-3.5 rounded-xl shadow-[0_10px_30px_-8px_rgba(248,68,100,0.5)] transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book tickets</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 2. About & Cast Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#222432] mb-3 tracking-tight">
            About the movie
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-4xl">
            {movie.synopsis || 'Experience top cinematic storytelling in theaters near you.'}
          </p>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#222432] mb-4 uppercase tracking-wider">
                Cast &amp; Crew
              </h3>
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-3">
                {movie.cast.map((actor) => (
                  <div key={actor.name} className="flex flex-col items-center shrink-0 w-24 sm:w-28 text-center group cursor-default">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm mb-2.5 border-2 border-gray-100 group-hover:border-[#F84464] transition-colors duration-200"
                    />
                    <p className="text-xs font-bold text-[#222432] line-clamp-1 group-hover:text-[#F84464] transition-colors">
                      {actor.name}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{actor.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Theatre & Showtimes Booking Section */}
        <div ref={showtimesRef} className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">

          {/* Section Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#222432] tracking-tight my-0">
                  Theatres &amp; Showtimes in {selectedCity}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Select your preferred date, auditorium and showtime</p>
              </div>

              {/* Show Time Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All', 'Morning', 'Afternoon', 'Evening', 'Night'].map((timeSlot) => (
                  <button
                    key={timeSlot}
                    onClick={() => setSelectedTimeFilter(timeSlot)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${selectedTimeFilter === timeSlot
                        ? 'bg-[#333545] text-white shadow-[0_3px_10px_-3px_rgba(0,0,0,0.3)]'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selector Tabs */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {dates.map((d, index) => {
                const isSelected = selectedDateIndex === index;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDateIndex(index)}
                    className={`flex flex-col items-center px-5 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${isSelected
                        ? 'bg-[#F84464] text-white font-bold shadow-[0_6px_16px_-4px_rgba(248,68,100,0.45)] scale-[1.02]'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{d.day}</span>
                    <span className="text-sm font-extrabold">{d.date}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showtimes List */}
          <div className="divide-y divide-gray-100">
            {filteredTheatres.length > 0 ? (
              filteredTheatres.map((theatre) => (
                <div key={theatre.id} className="p-6 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                    {/* Theatre Info */}
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavoriteTheatre(theatre.id)}
                          className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] rounded-full"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors duration-150 ${favoriteTheatres[theatre.id]
                                ? 'text-[#F84464] fill-[#F84464]'
                                : 'text-gray-300 hover:text-[#F84464]/60'
                              }`}
                          />
                        </button>
                        <h3 className="text-sm font-bold text-[#222432] hover:text-[#F84464] transition-colors cursor-pointer">
                          {theatre.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1.5 ml-6">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{theatre.distance}</span>
                      </div>

                      {/* Facilities Badges */}
                      <div className="flex items-center gap-2 ml-6 mt-2.5 flex-wrap">
                        {theatre.facilities?.map((f) => (
                          <span
                            key={f}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showtimes Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      {theatre.showtimes.map((st, idx) => {
                        let statusColor = 'border-gray-200 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50';
                        if (st.status === 'filling_fast') {
                          statusColor = 'border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50';
                        } else if (st.status === 'almost_full') {
                          statusColor = 'border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleShowtimeClick(theatre, st)}
                            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer text-center group ${statusColor} hover:scale-[1.04] active:scale-95 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]`}
                          >
                            <span className="block text-xs font-extrabold text-[#222432]">{st.time}</span>
                            <span className="block text-[10px] text-gray-500 font-medium mt-0.5">
                              {st.format} • {st.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-xs text-gray-500">
                <p className="font-semibold text-gray-700 text-sm">No active showtimes found</p>
                <p className="mt-1">Try resetting the format or timing filters above to view other shows.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 4. Interactive Seat-Selection & Booking Engine Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">

            {/* Modal Header */}
            <div className="bg-[#333545] text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#F84464] tracking-wider block">
                  Select Seats
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {movie.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  {bookingModal.theatre?.name} • <span className="text-[#F84464] font-semibold">{bookingModal.showtime?.time}</span> ({bookingModal.showtime?.format})
                </p>
              </div>
              <button
                onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!bookingModal.confirmed ? (
              <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">

                {/* How Many Seats? Vehicle Selector */}
                <div className="mb-6 pb-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      How many seats?
                    </label>
                    <span className="text-xs font-semibold text-[#F84464]">
                      {bookingModal.seatsCount} {bookingModal.seatsCount === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {transportIcons.map((t) => (
                      <button
                        key={t.count}
                        onClick={() => handleSeatsCountChange(t.count)}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${bookingModal.seatsCount === t.count
                            ? 'bg-[#F84464] text-white shadow-[0_6px_16px_-4px_rgba(248,68,100,0.45)] scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <span className="text-base leading-none mb-1">{t.emoji}</span>
                        <span className="text-[11px]">{t.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cinema Curved Screen Indicator */}
                <div className="my-6 text-center">
                  <div className="cinema-screen-curve" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    All eyes this way please (Screen)
                  </p>
                </div>

                {/* Interactive Seat Matrix */}
                <div className="mb-6 space-y-4">
                  {activeSeatLayout.map((rowItem) => (
                    <div key={rowItem.row} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-2">
                        <span>{rowItem.tier} - ₹{rowItem.price}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Row letter */}
                        <span className="w-5 text-[11px] font-bold text-gray-400 text-center">
                          {rowItem.row}
                        </span>

                        {/* Seat buttons */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {rowItem.seats.map((num) => {
                            const seatId = `${rowItem.row}${num}`;
                            const isOccupied = rowItem.occupied.includes(seatId);
                            const isSelected = bookingModal.selectedSeats.includes(seatId);
                            const isAisle = num === 6;

                            return (
                              <React.Fragment key={num}>
                                <motion.button
                                  type="button"
                                  disabled={isOccupied}
                                  onClick={() => handleSeatClick(seatId, isOccupied)}
                                  whileTap={!isOccupied ? { scale: 0.8 } : undefined}
                                  animate={isSelected ? { scale: [1, 1.22, 1] } : { scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-[10px] font-bold transition-colors duration-150 cursor-pointer flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${isOccupied
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                                      : isSelected
                                        ? 'bg-[#F84464] text-white shadow-sm border border-[#F84464]'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#F84464] hover:text-[#F84464]'
                                    }`}
                                  title={`${seatId} (${rowItem.tier}) - ₹${rowItem.price}`}
                                >
                                  {num}
                                </motion.button>
                                {/* Center aisle gap */}
                                {isAisle && <div className="w-3 sm:w-5" />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Seat Legend */}
                  <div className="flex items-center justify-center gap-6 pt-4 text-xs font-medium text-gray-500 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-white" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#F84464]" />
                      <span className="text-[#F84464] font-bold">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-gray-200 border border-gray-200" />
                      <span>Sold</span>
                    </div>
                  </div>
                </div>

                {/* Snack / F&B Add-on Section */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <Popcorn className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Add Cinema Snack Combo</p>
                      <p className="text-[11px] text-gray-500">1 Large Popcorn + 2 Pepsis for only ₹250</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="snacks"
                    checked={bookingModal.includeSnacks}
                    onChange={(e) => setBookingModal({ ...bookingModal, includeSnacks: e.target.checked })}
                    className="w-4 h-4 text-[#F84464] rounded focus:ring-[#F84464] cursor-pointer shrink-0"
                  />
                </div>

                {/* Detailed Order Breakdown */}
                <div className="bg-gray-50 p-4 rounded-xl mb-5 text-xs text-gray-600 space-y-2.5 border border-gray-100">
                  <div className="flex justify-between items-center text-gray-800">
                    <span>
                      Seats: <strong className="text-gray-900">{bookingModal.selectedSeats.join(', ') || 'None selected'}</strong>
                    </span>
                    <span className="font-bold">₹{ticketsSubtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-[11px]">
                    <span>Convenience Fees &amp; GST:</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  {bookingModal.includeSnacks && (
                    <div className="flex justify-between items-center text-amber-700 text-[11px]">
                      <span>Popcorn &amp; Pepsi Combo:</span>
                      <span>+₹250</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-gray-200 flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-900">Total Amount Payable:</span>
                    <span className="text-base font-black text-[#F84464]">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Booking Error Banner */}
                {bookingError && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold text-center animate-in fade-in">
                    {bookingError}
                  </div>
                )}

                {/* Checkout CTA */}
                <button
                  onClick={confirmBooking}
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-[#F84464] hover:bg-[#E03A58] disabled:opacity-70 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-[0_10px_30px_-8px_rgba(248,68,100,0.5)] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming your seats...</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>
                        {isAuthenticated ? `Pay ₹${grandTotal} & Confirm Booking` : 'Sign In to Complete Booking'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Digital M-Ticket Confirmation View */
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-[#222432] mb-1.5">
                  Booking Confirmed!
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  Your electronic M-Ticket has been generated and confirmed.
                </p>

                {/* Digital Ticket Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="bg-gradient-to-b from-[#222432] to-[#121216] text-white rounded-2xl p-5 text-left text-xs mb-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden"
                >
                  <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-[#F84464]/15 rounded-full blur-3xl" />
                  <div className="relative flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#F84464] tracking-widest">
                        Official Cinema M-Ticket
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-gray-300">
                        {movie.language} • {bookingModal.showtime?.format}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-400 block">Booking ID</span>
                      <span className="text-xs font-mono font-bold text-[#F84464]">
                        {bookingModal.bookingId}
                      </span>
                    </div>
                  </div>

                  <div className="relative py-4 grid grid-cols-2 gap-3 text-xs border-b border-white/10">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Cinema</span>
                      <span className="font-semibold text-gray-100">{bookingModal.theatre?.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Time &amp; Date</span>
                      <span className="font-semibold text-gray-100">
                        {bookingModal.showtime?.time} • {dates[selectedDateIndex].date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Seats ({bookingModal.selectedSeats.length})</span>
                      <span className="font-black text-[#F84464] text-sm">
                        {bookingModal.selectedSeats.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Total Paid</span>
                      <span className="font-bold text-white">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* QR Code Validation Box */}
                  <div className="relative pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center text-gray-900 shadow-sm shrink-0">
                        <QrCode className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">Scan at Cinema Entrance</p>
                        <p className="text-[10px] text-gray-400">Audi 2 • Gate 3</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded shrink-0">
                      PAID &amp; ACTIVE
                    </span>
                  </div>
                </motion.div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/my-bookings"
                    onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]"
                  >
                    <Ticket className="w-4 h-4 text-[#F84464]" />
                    <span>View in My Bookings</span>
                  </Link>
                  <button
                    onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                    className="flex-1 py-3 bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. Rating Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setRatingModalOpen(false);
                setRatingSubmitted(false);
              }}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]"
            >
              <X className="w-5 h-5" />
            </button>

            {!ratingSubmitted ? (
              <div>
                <div className="w-12 h-12 rounded-full bg-[#F84464]/10 flex items-center justify-center text-[#F84464] mx-auto mb-4">
                  <Star className="w-6 h-6 fill-[#F84464]" />
                </div>
                <h3 className="text-lg font-bold text-[#222432] mb-1.5">Rate {movie.title}</h3>
                <p className="text-xs text-gray-500 mb-5">How was your movie experience?</p>

                {/* 10 Star Rating Selector */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setUserRatingScore(num)}
                      className="cursor-pointer transition-transform duration-150 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] rounded"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${num <= userRatingScore
                            ? 'fill-[#F84464] text-[#F84464]'
                            : 'text-gray-300'
                          }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-base font-black text-[#F84464] mb-6">
                  {userRatingScore} / 10
                </div>

                <button
                  onClick={() => setRatingSubmitted(true)}
                  className="w-full py-3 bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.98] text-white text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 shadow-[0_6px_18px_-6px_rgba(248,68,100,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
                >
                  Submit Rating
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-[#222432] mb-1.5">Thank You!</h3>
                <p className="text-xs text-gray-500 mb-5">Your rating of {userRatingScore}/10 has been recorded.</p>
                <button
                  onClick={() => {
                    setRatingModalOpen(false);
                    setRatingSubmitted(false);
                  }}
                  className="w-full py-2.5 bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.98] text-white text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}