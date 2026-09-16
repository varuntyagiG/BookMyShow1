import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { contentApi, bookingApi } from '../services/api';
import { useRealtimeRefresh, broadcastSync } from '../services/realtimeSync';
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
  Check,
  ChevronLeft,
  Plus,
  Minus,
  Sparkles,
  Download,
  PlayCircle,
  RefreshCw,
  ThumbsUp,
  ExternalLink,
  Navigation,
  Sun,
  Award,
  MessageSquare,
  ShieldCheck,
  Printer,
  Tv,
  Armchair,
  Zap,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { playSeatClick, playPop, playFlip, playChime } from '../utils/soundEffects';
import { FNB_CATALOG } from '../components/common/FnbConcessionsModal';
import PaymentGatewayModal from '../components/common/PaymentGatewayModal';
import { generateTicketPDF } from '../utils/ticketPdfGenerator';

const generateBookingId = () => 'BMS-' + Date.now().toString().slice(-6);

const formatDistance = (rawDistance) => {
  if (!rawDistance) return '2.40 km away';
  if (typeof rawDistance === 'number') {
    return `${rawDistance.toFixed(2)} km away`;
  }
  const match = String(rawDistance).match(/([\d.]+)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) {
      return `${val.toFixed(2)} km away`;
    }
  }
  return String(rawDistance);
};

export default function MovieDetailsPage() {
  const { id } = useParams();
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All');
  const [favoriteTheatres, setFavoriteTheatres] = useState({});
  const [copiedShare, setCopiedShare] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // User Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRatingScore, setUserRatingScore] = useState(8);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Audience Reviews Tab & Interactive Likes
  const [reviewsTab, setReviewsTab] = useState('top');
  const [helpfulVotes, setHelpfulVotes] = useState({
    r1: { count: 142, userVoted: false },
    r2: { count: 89, userVoted: false },
    r3: { count: 64, userVoted: false },
    r4: { count: 37, userVoted: false },
  });
  const [isTurnstileBright, setIsTurnstileBright] = useState(false);

  const toggleHelpful = (reviewId) => {
    setHelpfulVotes((prev) => {
      const current = prev[reviewId] || { count: 0, userVoted: false };
      return {
        ...prev,
        [reviewId]: {
          count: current.userVoted ? current.count - 1 : current.count + 1,
          userVoted: !current.userVoted,
        },
      };
    });
  };

  const handleAddToCalendar = () => {
    const title = `${movie?.title || 'Movie'} - BookMyShow`;
    const details = `Booking ID: ${bookingModal.bookingId || 'BMS-TICKET'}\nTheatre: ${bookingModal.theatre?.name || 'Multiplex'}\nShowtime: ${bookingModal.showtime?.time || '10:00 AM'}\nDate: ${dates[selectedDateIndex]?.date || 'Today'}\nSeats: ${(bookingModal.selectedSeats || []).join(', ')}\nCity: ${selectedCity}`;
    const locationStr = `${bookingModal.theatre?.name || 'Multiplex'}, ${selectedCity}`;
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(locationStr)}`;
    window.open(calUrl, '_blank');
  };

  const handleGetDirections = (theatreName = bookingModal.theatre?.name) => {
    const query = `${theatreName || 'Cinema'} ${selectedCity}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank');
  };

  // Scroll listener for floating booking bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Adaptive movie color palette based on movie theme/genre
  const movieTheme = React.useMemo(() => {
    if (!movie) return { primary: '#F84464', glow: 'rgba(248, 68, 100, 0.32)', secondary: '#ff6b85', badge: 'BMS CORAL' };
    const title = (movie.title || '').toLowerCase();
    const genreStr = Array.isArray(movie.genre) ? movie.genre.join(' ').toLowerCase() : (movie.genre || '').toLowerCase();

    if (title.includes('dune') || title.includes('kalki') || genreStr.includes('sci-fi') || genreStr.includes('adventure')) {
      return { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)', secondary: '#D97706', badge: 'AMBER NEBULA' };
    }
    if (title.includes('deadpool') || genreStr.includes('action')) {
      return { primary: '#F84464', glow: 'rgba(248, 68, 100, 0.35)', secondary: '#E03A58', badge: 'CRIMSON BLOCKBUSTER' };
    }
    if (title.includes('stree') || genreStr.includes('horror') || genreStr.includes('thriller')) {
      return { primary: '#A855F7', glow: 'rgba(168, 85, 247, 0.32)', secondary: '#9333EA', badge: 'VIOLET MOONLIGHT' };
    }
    if (genreStr.includes('comedy') || genreStr.includes('drama')) {
      return { primary: '#06B6D4', glow: 'rgba(6, 182, 212, 0.30)', secondary: '#0891B2', badge: 'CYAN OCEAN' };
    }
    return { primary: '#F84464', glow: 'rgba(248, 68, 100, 0.30)', secondary: '#E03A58', badge: 'BMS CORAL' };
  }, [movie]);

  // HD Trailer preview link
  const trailerEmbedUrl = React.useMemo(() => {
    if (!movie) return 'https://www.youtube.com/embed/Way9Dexny3w?autoplay=1';
    const title = (movie.title || '').toLowerCase();
    if (title.includes('dune')) return 'https://www.youtube.com/embed/Way9Dexny3w?autoplay=1';
    if (title.includes('kalki')) return 'https://www.youtube.com/embed/kQDd1AhGIHk?autoplay=1';
    if (title.includes('deadpool')) return 'https://www.youtube.com/embed/73_1biulkYk?autoplay=1';
    if (title.includes('stree')) return 'https://www.youtube.com/embed/KVnheCN7vjY?autoplay=1';
    return 'https://www.youtube.com/embed/Way9Dexny3w?autoplay=1';
  }, [movie]);

  // Seat Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    theatre: null,
    showtime: null,
    seatsCount: 2,
    selectedSeats: ['B5', 'B6'],
    includeSnacks: false,
    snacksList: [],
    deliveryPreference: 'seat_delivery',
    snacksTotal: 0,
    confirmed: false,
    bookingId: null,
  });

  const [activeSnackCategory, setActiveSnackCategory] = useState('all');

  const [isTicketFlipped, setIsTicketFlipped] = useState(false);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const showtimesRef = useRef(null);

  // Curated Cast & Crew ensuring every movie has an authentic production profile
  const enrichedCast = React.useMemo(() => {
    if (movie?.cast && movie.cast.length >= 3) return movie.cast;
    const title = (movie?.title || '').toLowerCase();
    const genreStr = Array.isArray(movie?.genre) ? movie.genre.join(' ').toLowerCase() : (movie?.genre || '').toLowerCase();

    if (title.includes('kalki') || genreStr.includes('sci-fi')) {
      return [
        { name: 'Prabhas', role: 'Bhairava / Karna', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
        { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
        { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
        { name: 'Kamal Haasan', role: 'Supreme Yaskin', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
        { name: 'Disha Patani', role: 'Roxie', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
        { name: 'Nag Ashwin', role: 'Director', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
      ];
    }
    if (title.includes('deadpool') || genreStr.includes('action')) {
      return [
        { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
        { name: 'Hugh Jackman', role: 'Logan / Wolverine', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
        { name: 'Emma Corrin', role: 'Cassandra Nova', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
        { name: 'Morena Baccarin', role: 'Vanessa', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
        { name: 'Shawn Levy', role: 'Director', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
        { name: 'Rob Simonsen', role: 'Music Composer', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
      ];
    }
    if (title.includes('stree') || genreStr.includes('horror') || genreStr.includes('comedy')) {
      return [
        { name: 'Shraddha Kapoor', role: 'The Mystery Woman', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
        { name: 'Rajkummar Rao', role: 'Vicky', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
        { name: 'Pankaj Tripathi', role: 'Rudra Bhaiya', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
        { name: 'Aparshakti Khurana', role: 'Bittu', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
        { name: 'Amar Kaushik', role: 'Director', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
        { name: 'Sachin-Jigar', role: 'Music Directors', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
      ];
    }
    return [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
      { name: 'Javier Bardem', role: 'Stilgar', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
      { name: 'Denis Villeneuve', role: 'Director', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
      { name: 'Hans Zimmer', role: 'Music Composer', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
    ];
  }, [movie]);

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

    setIsTicketFlipped(false);
    setBookingModal({
      isOpen: true,
      step: 'vehicle',
      theatre,
      showtime: { ...showtime, basePrice },
      occupiedSeats: occupied,
      seatsCount: initialSeats.length || 2,
      selectedSeats: initialSeats,
      includeSnacks: false,
      snacksList: [],
      deliveryPreference: 'seat_delivery',
      snacksTotal: 0,
      confirmed: false,
      bookingId: generateBookingId(),
      bookingData: null,
    });
  };

  // Fast Quick-Book auto launch from ?book=true query parameter
  useEffect(() => {
    if (!loading && movie && movie.theatres && movie.theatres.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('book') === 'true' && !bookingModal.isOpen) {
        const firstTheatre = movie.theatres[0];
        if (firstTheatre?.showtimes?.length > 0) {
          handleShowtimeClick(firstTheatre, firstTheatre.showtimes[0]);
        }
      }
    }
  }, [location.search, loading, movie]);

  const handleSeatsCountChange = (count) => {
    playPop();
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
    playSeatClick();
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

      // Broadcast real-time seat selection so vendor heat map updates live
      const rawShowId = prev.showtime?.showId;
      try {
        broadcastSync('SEAT_SELECTION_UPDATED', {
          showId: rawShowId,
          theatreName: prev.theatre?.name,
          showtime: prev.showtime?.time,
          seats: nextSeats
        });
        const socket = getSocket();
        if (socket && rawShowId) {
          socket.emit('seat_selecting', { showId: rawShowId, seats: nextSeats });
        }
      } catch (_syncErr) {}

      return {
        ...prev,
        selectedSeats: nextSeats,
      };
    });
  };

  const handleAddSnack = (snackItem) => {
    playSeatClick();
    setBookingModal((prev) => {
      const existing = [...(prev.snacksList || [])];
      const idx = existing.findIndex((s) => s.snackId === snackItem.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], quantity: existing[idx].quantity + 1 };
      } else {
        existing.push({
          snackId: snackItem.id,
          name: snackItem.name,
          category: snackItem.category,
          price: snackItem.price,
          quantity: 1,
          emoji: snackItem.emoji,
        });
      }
      const newTotal = existing.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        ...prev,
        includeSnacks: true,
        snacksList: existing,
        snacksTotal: newTotal,
      };
    });
  };

  const handleRemoveSnack = (snackId) => {
    playPop();
    setBookingModal((prev) => {
      let existing = [...(prev.snacksList || [])];
      const idx = existing.findIndex((s) => s.snackId === snackId);
      if (idx >= 0) {
        if (existing[idx].quantity <= 1) {
          existing.splice(idx, 1);
        } else {
          existing[idx] = { ...existing[idx], quantity: existing[idx].quantity - 1 };
        }
      }
      const newTotal = existing.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        ...prev,
        includeSnacks: existing.length > 0,
        snacksList: existing,
        snacksTotal: newTotal,
      };
    });
  };

  const confirmBooking = async (paymentDetails = {}) => {
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
        snacksList: bookingModal.snacksList || [],
        deliveryPreference: bookingModal.deliveryPreference || 'seat_delivery',
        snacksFee: bookingModal.snacksTotal || 0,
        showId: isObjectId(rawShowId) ? rawShowId : undefined,
        screenId: isObjectId(rawScreenId) ? rawScreenId : undefined,
        cinemaId: isObjectId(rawCinemaId) ? rawCinemaId : undefined,
        paymentMethod: paymentDetails?.paymentMethod || 'upi_phonepe',
        transactionId: paymentDetails?.transactionId,
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

        // Broadcast booking creation across all tabs & vendor portal
        try {
          broadcastSync('BOOKING_MUTATION', {
            action: 'create',
            showId: isObjectId(rawShowId) ? rawShowId : undefined,
            theatreName: bookingModal.theatre?.name,
            showtime: bookingModal.showtime?.time,
            seats: bookingModal.selectedSeats
          });
          const socket = getSocket();
          if (socket && rawShowId) {
            socket.emit('seat_selecting', { showId: rawShowId, seats: [] });
          }
        } catch (_syncErr) {}

        // Golden Victory Chime & Confetti Celebration
        playChime();
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F84464', '#FFD700', '#FFA500', '#FFFFFF', '#06B6D4']
          });
        } catch (_) {}

        setBookingModal((prev) => ({
          ...prev,
          confirmed: true,
          bookingId: res.booking.bookingId,
          bookingData: res.booking,
          paymentMethod: res.booking.paymentMethod || paymentDetails?.paymentMethod || 'upi_phonepe',
          transactionId: res.booking.transactionId || paymentDetails?.transactionId,
          occupiedSeats: [...(prev.occupiedSeats || []), ...prev.selectedSeats],
        }));

        // Automatically compile & download the official PDF ticket pass for the customer
        try {
          const rawBasePrice = bookingModal.showtime?.basePrice || 450;
          const sCount = bookingModal.selectedSeats?.length || 1;
          const tSubtotal = rawBasePrice * sCount;
          const cFee = Math.round(35.4 * sCount);
          const sTotal = bookingModal.includeSnacks ? (bookingModal.snacksTotal || 0) : 0;
          generateTicketPDF({
            ...res.booking,
            movieTitle: movie?.title || res.booking.movieTitle,
            theatreName: bookingModal.theatre?.name || res.booking.theatreName,
            showtime: bookingModal.showtime?.time || res.booking.showtime,
            showDate: selectedDate,
            seats: bookingModal.selectedSeats,
            paymentMethod: res.booking.paymentMethod || paymentDetails?.paymentMethod || 'upi_phonepe',
            transactionId: res.booking.transactionId || paymentDetails?.transactionId,
            snacksList: bookingModal.snacksList || [],
            deliveryPreference: bookingModal.deliveryPreference,
            ticketPrice: tSubtotal,
            convenienceFee: cFee,
            snacksFee: sTotal,
            totalAmount: tSubtotal + cFee + sTotal
          }, { autoSave: true });
        } catch (_pdfErr) {
          console.warn('Auto PDF download error:', _pdfErr);
        }
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

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const selectedDate = dates[selectedDateIndex]?.date || 'Today';
      await generateTicketPDF({
        ...(bookingModal.bookingData || {}),
        bookingId: bookingModal.bookingId || bookingModal.bookingData?.bookingId,
        movieTitle: movie?.title || bookingModal.bookingData?.movieTitle,
        theatreName: bookingModal.theatre?.name || bookingModal.bookingData?.theatreName,
        showtime: bookingModal.showtime?.time || bookingModal.bookingData?.showtime,
        showDate: selectedDate,
        seats: bookingModal.selectedSeats,
        paymentMethod: bookingModal.paymentMethod || bookingModal.bookingData?.paymentMethod || 'upi_phonepe',
        transactionId: bookingModal.transactionId || bookingModal.bookingData?.transactionId,
        snacksList: bookingModal.snacksList || bookingModal.bookingData?.snacksList || [],
        deliveryPreference: bookingModal.deliveryPreference,
        ticketPrice: ticketsSubtotal,
        convenienceFee: convenienceFee,
        snacksFee: bookingModal.snacksTotal || 0,
        totalAmount: grandTotal
      }, { autoSave: true });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
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
  const snacksTotal = bookingModal.includeSnacks ? (bookingModal.snacksTotal || 250) : 0;
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

      {/* Floating Sticky Booking Bar on Scroll */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-[#1e202d]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 transform ${
          showStickyBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-9 h-12 object-cover rounded-lg shadow-sm border border-white/15 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate m-0">{movie.title}</h4>
              <div className="flex items-center gap-2 text-[11px] text-gray-300 font-medium">
                <span className="flex items-center gap-1 text-[#F84464] font-bold">
                  <Star className="w-3 h-3 fill-[#F84464]" /> {movie.rating}
                </span>
                <span>•</span>
                <span className="truncate">{movie.language}</span>
                <span>•</span>
                <span>{selectedCity}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#F84464]" />
              <span>Trailer</span>
            </button>

            <button
              type="button"
              onClick={scrollToBooking}
              className="px-6 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold shadow-[0_4px_16px_rgba(248,68,100,0.5)] transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Hero Backdrop Section with Adaptive Movie Aura */}
      <div className="relative bg-[#121216] text-white overflow-hidden">
        {/* Atmospheric Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-105"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121216] via-[#121216]/90 to-transparent" />

        {/* Adaptive Dynamic Movie Glow Auroras */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[550px] h-[550px] rounded-full blur-3xl opacity-40 transition-all duration-700"
          style={{ background: movieTheme.glow }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 w-[450px] h-[450px] rounded-full blur-3xl opacity-25 transition-all duration-700"
          style={{ background: movieTheme.secondary }}
        />

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
                  <h1 className="text-[32px] sm:text-[44px] lg:text-[54px] font-extrabold tracking-tight text-white my-0 leading-[1.08]">
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
                        <span className="text-xl font-extrabold text-white">{movie.rating}</span>
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

              {/* Book Tickets & Watch Trailer CTAs */}
              <div className="mt-8 pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToBooking}
                  className="w-full sm:w-auto bg-[#F84464] hover:bg-[#E03A58] text-white text-sm sm:text-base font-bold px-10 py-3.5 rounded-2xl shadow-[0_10px_30px_-8px_rgba(248,68,100,0.5)] transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book tickets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-7 py-3.5 rounded-2xl backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4 text-[#F84464]" />
                  <span>Watch Trailer</span>
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

          {/* Enriched Cast & Crew */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#222432] uppercase tracking-wider my-0">
                Cast &amp; Crew
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">
                {enrichedCast.length} Leading Artists &amp; Directors
              </span>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-3">
              {enrichedCast.map((person) => (
                <div key={person.name} className="flex flex-col items-center shrink-0 w-24 sm:w-28 text-center group cursor-default">
                  <div className="relative mb-2.5">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm border-2 border-gray-100 group-hover:border-[#F84464] transition-colors duration-200"
                    />
                    {person.role.toLowerCase().includes('director') && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#222432] text-white text-[9px] font-bold rounded-full shadow-xs whitespace-nowrap">
                        DIRECTOR
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#222432] line-clamp-1 group-hover:text-[#F84464] transition-colors">
                    {person.name}
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{person.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2.5. Audience Reviews & Sentiment Breakdown */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#F84464] border border-red-200">
                  Audience Pulse
                </span>
                <span className="text-xs text-gray-500 font-medium">Verified BookMyShow Audiences</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#222432] tracking-tight my-0">
                User Reviews &amp; Sentiment
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setRatingModalOpen(true)}
              className="self-start md:self-auto px-5 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(248,68,100,0.35)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Rate &amp; Write Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Left: Score & Sentiment Breakdown (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/70 p-5 rounded-2xl border border-gray-200/70">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#F84464] text-white flex flex-col items-center justify-center font-bold shadow-md shadow-red-500/25">
                    <span className="text-lg leading-none">{movie.rating || '8.8'}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">/ 10</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[#F84464] mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-[#F84464]" />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      {movie.voteCount || '48.2K'} Verified Ratings
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      91% of viewers recommended this movie
                    </p>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-1.5 pt-3 border-t border-gray-200 text-[11px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-bold text-gray-700">9-10 ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#F84464] h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                    <span className="w-7 text-right font-semibold">78%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-bold text-gray-700">7-8 ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '15%' }} />
                    </div>
                    <span className="w-7 text-right font-semibold">15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-bold text-gray-700">&lt; 6 ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gray-400 h-full rounded-full" style={{ width: '7%' }} />
                    </div>
                    <span className="w-7 text-right font-semibold">7%</span>
                  </div>
                </div>
              </div>

              {/* Sentiment Tags */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2.5">
                  Audience Sentiment Hashtags
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '#CinematicMasterpiece', count: '94%' },
                    { tag: '#MindBlowingVFX', count: '91%' },
                    { tag: '#GrippingStoryline', count: '88%' },
                    { tag: '#MustWatchInIMAX', count: '96%' },
                    { tag: '#GreatSoundtrack', count: '85%' },
                  ].map((item) => (
                    <span
                      key={item.tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-bold text-gray-700 border border-gray-200 shadow-xs"
                    >
                      <span className="text-[#F84464]">{item.tag}</span>
                      <span className="text-[10px] font-semibold text-gray-400">({item.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Review Cards with Helpful Counter (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Filter tabs */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
                {[
                  { id: 'top', label: 'Top Reviews' },
                  { id: 'verified', label: 'Verified Ticket Buyers' },
                  { id: 'critics', label: 'Critic Highlights' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setReviewsTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reviewsTab === t.id
                        ? 'bg-[#222432] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Review Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'r1',
                    name: 'Rohit Sharma',
                    city: 'Mumbai',
                    badge: 'Verified Buyer',
                    rating: 10,
                    time: 'Yesterday',
                    headline: 'An absolute visual and sonic milestone!',
                    text: 'Watched it on IMAX 3D laser. The sound engineering and world building are unparalleled. A theatrical masterpiece that demands the biggest screen possible.',
                    hashtag: '#MustWatchInIMAX'
                  },
                  {
                    id: 'r2',
                    name: 'Priya Mukherjee',
                    city: 'Bengaluru',
                    badge: 'Verified Buyer',
                    rating: 9,
                    time: '2 days ago',
                    headline: 'Gripping from start to finish',
                    text: 'The background score kept me on the edge of my seat throughout the second half. Stellar performances from the lead ensemble!',
                    hashtag: '#CinematicMasterpiece'
                  },
                  {
                    id: 'r3',
                    name: 'Anand Kulkarni',
                    city: 'Pune',
                    badge: 'Verified Buyer',
                    rating: 9,
                    time: '3 days ago',
                    headline: 'World-class visual effects',
                    text: 'VFX quality is truly international standard. The direction and screenplay weave mythology and futuristic tech seamlessly.',
                    hashtag: '#MindBlowingVFX'
                  },
                  {
                    id: 'r4',
                    name: 'Meera Nambiar',
                    city: 'Delhi-NCR',
                    badge: 'Verified Buyer',
                    rating: 10,
                    time: '4 days ago',
                    headline: 'Pure adrenaline rush in theaters',
                    text: 'Booked prime recliner seats with snack combo. Best weekend multiplex experience in a long time. Will definitely rewatch!',
                    hashtag: '#GrippingStoryline'
                  },
                ].map((rev) => {
                  const helpful = helpfulVotes[rev.id] || { count: 35, userVoted: false };
                  return (
                    <div
                      key={rev.id}
                      className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: User + Rating */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F84464] to-[#f76d85] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {rev.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 leading-tight m-0">{rev.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" /> {rev.badge}
                                </span>
                                <span>•</span>
                                <span>{rev.city}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-red-50 text-[#F84464] px-2 py-0.5 rounded-md text-xs font-bold border border-red-200 shrink-0">
                            <Star className="w-3 h-3 fill-[#F84464]" />
                            <span>{rev.rating}/10</span>
                          </div>
                        </div>

                        {/* Headline & Body */}
                        <h4 className="text-xs font-bold text-gray-900 mb-1 leading-snug">
                          "{rev.headline}"
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-2">
                          {rev.text}
                        </p>
                      </div>

                      {/* Footer: Hashtag & Helpful Button */}
                      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <span className="text-[#F84464] font-bold text-[10px]">
                          {rev.hashtag}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleHelpful(rev.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                            helpful.userVoted
                              ? 'bg-red-50 text-[#F84464] font-bold'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${helpful.userVoted ? 'fill-[#F84464]' : ''}`} />
                          <span>Helpful ({helpful.count})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
              {/* Smart "This Weekend" Quick Shortcut */}
              {(() => {
                const satIdx = dates.findIndex(d => d.day === 'SAT');
                const sunIdx = dates.findIndex(d => d.day === 'SUN');
                const targetIdx = satIdx !== -1 ? satIdx : sunIdx;
                if (targetIdx !== -1 && targetIdx > 1) {
                  const isWkndActive = selectedDateIndex === targetIdx;
                  return (
                    <button
                      type="button"
                      onClick={() => setSelectedDateIndex(targetIdx)}
                      className={`flex flex-col items-center px-4 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer shrink-0 border ${
                        isWkndActive
                          ? 'bg-amber-500 border-amber-500 text-white font-bold shadow-md scale-[1.02]'
                          : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100 font-bold'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" /> WEEKEND
                      </span>
                      <span className="text-xs font-bold">{dates[targetIdx].date}</span>
                    </button>
                  );
                }
                return null;
              })()}

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

                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1.5 ml-6 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#F84464]" />
                          <span>{formatDistance(theatre.distance)}</span>
                        </span>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleGetDirections(theatre.name)}
                          className="inline-flex items-center gap-1 text-[#F84464] hover:text-[#d4324f] hover:underline font-bold cursor-pointer"
                          title="Get Directions in Google Maps"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Directions</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      </div>

                      {/* Facilities Badges */}
                      <div className="flex items-center gap-1.5 ml-6 mt-2.5 flex-wrap">
                        {(theatre.facilities && theatre.facilities.length > 0
                          ? theatre.facilities
                          : ['Free Parking', 'Wheelchair Friendly', 'F&B In-Seat', 'Dolby Atmos 7.1', 'Contactless M-Ticket']
                        ).map((f) => (
                          <span
                            key={f}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1"
                          >
                            <span>✓</span>
                            <span>{f}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          {!bookingModal.confirmed ? (
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 border border-gray-100">

              {/* Modal Header */}
              <div className="bg-[#333545] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#2b2d3c]">
                <div className="flex items-center gap-2.5">
                  {bookingModal.step === 'seats' && (
                    <button
                      onClick={() => setBookingModal((prev) => ({ ...prev, step: 'vehicle' }))}
                      className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Change Seat Count"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  {bookingModal.step === 'snacks' && (
                    <button
                      onClick={() => setBookingModal((prev) => ({ ...prev, step: 'seats' }))}
                      className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Back to Seats"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#F84464] tracking-widest block">
                      {bookingModal.step === 'vehicle' ? 'Step 1 of 3 • Seat Count' : bookingModal.step === 'snacks' ? 'Step 3 of 3 • Concessions' : 'Step 2 of 3 • Select Seats'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-gray-300 mt-0.5 font-medium">
                      {bookingModal.theatre?.name} • <span className="text-[#F84464] font-bold">{bookingModal.showtime?.time}</span> ({bookingModal.showtime?.format})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 max-h-[82vh] overflow-y-auto">

                {/* ========================================================
                    STEP 1: THE ICONIC BOOKMYSHOW VEHICLE SEAT SELECTOR
                ======================================================== */}
                {bookingModal.step === 'vehicle' && (
                  <div className="py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#F84464] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-3 h-3" /> BookMyShow Classic
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#222432] tracking-tight">
                        How Many Seats?
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select party size to auto-assign best adjacent multiplex seats
                      </p>
                    </div>

                    {/* Vehicle Cards Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5 mb-5">
                      {transportIcons.map((t) => {
                        const isSelected = bookingModal.seatsCount === t.count;
                        return (
                          <motion.button
                            key={t.count}
                            type="button"
                            onPointerDown={() => handleSeatsCountChange(t.count)}
                            onClick={() => handleSeatsCountChange(t.count)}
                            whileTap={{ scale: 0.9 }}
                            animate={isSelected ? { scale: [1, 1.15, 1.05] } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F84464] border-[#F84464] text-white shadow-sm'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                            }`}
                          >
                            <span className="text-xl sm:text-2xl mb-0.5 filter drop-shadow-xs">{t.emoji}</span>
                            <span className="text-xs font-bold">{t.count}</span>
                            <span className={`text-[8px] font-semibold truncate max-w-full ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                              {t.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Price Tiers for this Cinema */}
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Auditorium Tiers &amp; Pricing
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">RECLINER VIP</span>
                            <span className="text-[9px] text-emerald-600 font-bold">Plush Luxury</span>
                          </div>
                          <span className="text-xs font-bold text-[#F84464]">₹450</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">PRIME PLUS</span>
                            <span className="text-[9px] text-amber-600 font-bold">Filling Fast</span>
                          </div>
                          <span className="text-xs font-bold text-[#F84464]">₹280</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">CLASSIC</span>
                            <span className="text-[9px] text-emerald-600 font-bold">Available</span>
                          </div>
                          <span className="text-xs font-bold text-[#F84464]">₹180</span>
                        </div>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      type="button"
                      onClick={() => setBookingModal((prev) => ({ ...prev, step: 'seats' }))}
                      className="w-full py-3 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Select {bookingModal.seatsCount} {bookingModal.seatsCount === 1 ? 'Seat' : 'Seats'}</span>
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                )}

                {/* ========================================================
                    STEP 2: COMPACT 3D THEATRICAL SCREEN & SEATING MAP
                ======================================================== */}
                {bookingModal.step === 'seats' && (
                  <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                    {/* Authentic 3D Cinema Curved Projection Screen */}
                    <div className="pt-0.5 pb-2 text-center select-none">
                      <div className="cinema-screen-3d-wrapper">
                        <div className="cinema-screen-3d-curve" />
                        <div className="cinema-screen-3d-light" />
                      </div>

                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider border border-slate-200/80 shadow-2xs">
                          <Tv className="w-2.5 h-2.5 text-cyan-600" />
                          <span>SCREEN THIS WAY</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[9px] font-bold uppercase tracking-wider border border-cyan-200/60 shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                          <span>{bookingModal.theatre?.name ? `${bookingModal.theatre.name} • Audi 2` : 'Audi 2 • Dolby Atmos 7.1'}</span>
                        </span>
                      </div>

                      <p className="text-[9px] uppercase font-bold tracking-[0.22em] text-slate-400 mt-1">
                        All eyes this way please ▾
                      </p>
                    </div>

                    {/* Compact Inline Seat Legend */}
                    <div className="flex items-center justify-center gap-4 text-[10px] sm:text-[11px] font-semibold text-gray-500 py-1.5 mb-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded border border-gray-300 bg-white" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#F84464]" />
                        <span className="text-[#F84464] font-bold">Selected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-gray-200 border border-gray-200" />
                        <span>Sold</span>
                      </div>
                    </div>

                    {/* Compact Auditorium Seating Matrix */}
                    <div className="mb-2 overflow-x-auto no-scrollbar py-1 px-1" style={{ perspective: '850px' }}>
                      <div 
                        className="space-y-1 origin-top transition-transform duration-300"
                        style={{
                          transform: 'rotateX(8deg)',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {activeSeatLayout.map((rowItem, idx) => {
                          const prevRow = activeSeatLayout[idx - 1];
                          const isNewTier = !prevRow || prevRow.tier !== rowItem.tier || prevRow.price !== rowItem.price;

                          return (
                            <div key={rowItem.row} className="space-y-1">
                              {/* Group Tier Header: Only shown once per tier section */}
                              {isNewTier && (
                                <div className="flex items-center justify-between pt-1.5 pb-0.5 px-2 border-b border-gray-100 mb-0.5">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600">
                                    {rowItem.tier}
                                  </span>
                                  <span className="text-[10px] font-bold text-[#F84464]">
                                    ₹{rowItem.price}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                                {/* Row letter */}
                                <span className="w-4 text-[10px] font-bold text-gray-400 text-center shrink-0">
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
                                          onPointerDown={() => handleSeatClick(seatId, isOccupied)}
                                          onClick={() => handleSeatClick(seatId, isOccupied)}
                                          whileTap={!isOccupied ? { scale: 0.85 } : undefined}
                                          animate={isSelected ? { scale: [1, 1.2, 1.05] } : { scale: 1 }}
                                          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                          className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center ${
                                            isOccupied
                                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                                              : isSelected
                                              ? 'bg-[#F84464] text-white shadow-xs border border-[#F84464]'
                                              : 'bg-white border border-gray-300 text-gray-700 hover:border-[#F84464] hover:text-[#F84464]'
                                          }`}
                                          title={`${seatId} (${rowItem.tier}) - ₹${rowItem.price}`}
                                        >
                                          {num}
                                        </motion.button>
                                        {/* Center aisle gap */}
                                        {isAisle && <div className="w-2.5 sm:w-4" />}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Compact Unified Bottom Action Ribbon */}
                    <div className="mt-2 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-gray-500">Seats:</span>
                          <span className="text-xs font-bold text-gray-900 truncate max-w-[140px] sm:max-w-[200px]">
                            {bookingModal.selectedSeats.join(', ') || 'None selected'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#F84464] mt-0.5">
                          ₹{ticketsSubtotal} <span className="text-[10px] text-gray-400 font-normal">subtotal</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBookingModal((prev) => ({ ...prev, step: 'snacks' }))}
                        disabled={bookingModal.selectedSeats.length === 0}
                        className="py-2.5 px-4 bg-[#F84464] hover:bg-[#E03A58] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Popcorn className="w-3.5 h-3.5" />
                        <span>Proceed to Snacks ➔</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    STEP 3: MULTIPLEX F&B CONCESSIONS ("GRAB A BITE!")
                ======================================================== */}
                {bookingModal.step === 'snacks' && (
                  <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="text-center mb-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                        🍿 Multiplex Fresh Concessions
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#222432] tracking-tight">
                        Grab a Bite!
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pre-book fresh popcorn &amp; beverages and save up to 20% compared to counter prices
                      </p>
                    </div>

                    {/* Delivery Preference Selector Strip */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-3.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                        Delivery Preference:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playPop();
                            setBookingModal((prev) => ({ ...prev, deliveryPreference: 'seat_delivery' }));
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            (bookingModal.deliveryPreference || 'seat_delivery') === 'seat_delivery'
                              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            (bookingModal.deliveryPreference || 'seat_delivery') === 'seat_delivery' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Armchair className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-900">In-Seat Delivery</span>
                              {(bookingModal.deliveryPreference || 'seat_delivery') === 'seat_delivery' && (
                                <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Delivered at Intermission to Seats <span className="font-bold text-slate-700">{bookingModal.selectedSeats.join(', ')}</span>
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playPop();
                            setBookingModal((prev) => ({ ...prev, deliveryPreference: 'counter_pickup' }));
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            bookingModal.deliveryPreference === 'counter_pickup'
                              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            bookingModal.deliveryPreference === 'counter_pickup' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-900">Express Counter</span>
                              {bookingModal.deliveryPreference === 'counter_pickup' && (
                                <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Show ticket barcode at Refreshment Counter #3
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2.5">
                      {[
                        { id: 'all', label: 'All Items', emoji: '🍿' },
                        { id: 'combos', label: 'Saver Combos', emoji: '🌟' },
                        { id: 'popcorn', label: 'Popcorn', emoji: '🌽' },
                        { id: 'snacks', label: 'Nachos & Bites', emoji: '🌮' },
                        { id: 'beverages', label: 'Beverages', emoji: '🥤' },
                        { id: 'desserts', label: 'Desserts', emoji: '🍫' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            playPop();
                            setActiveSnackCategory(cat.id);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                            activeSnackCategory === cat.id
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Snack Combos Cards */}
                    <div className="space-y-2 mb-4 max-h-[280px] overflow-y-auto pr-1">
                      {FNB_CATALOG.filter(
                        (item) => activeSnackCategory === 'all' || item.category === activeSnackCategory
                      ).map((snack) => {
                        const inCart = (bookingModal.snacksList || []).find((s) => s.snackId === snack.id);
                        const qty = inCart ? inCart.quantity : 0;
                        return (
                          <div
                            key={snack.id}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              qty > 0
                                ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/30'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-2xl filter drop-shadow-xs shrink-0">{snack.emoji}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Veg / Non-Veg badge */}
                                  <span
                                    className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                      snack.isVeg ? 'border-emerald-500' : 'border-rose-600'
                                    }`}
                                  >
                                    <span className={`w-1 h-1 rounded-full ${snack.isVeg ? 'bg-emerald-500' : 'bg-rose-600'}`} />
                                  </span>
                                  <span className="text-xs font-bold text-gray-900 truncate">{snack.name}</span>
                                  {snack.badge && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 uppercase">
                                      {snack.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{snack.desc}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs font-bold text-gray-900">₹{snack.price}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">• {snack.calories}</span>
                                </div>
                              </div>
                            </div>

                            {/* Add / Stepper Controls */}
                            <div className="shrink-0">
                              {qty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddSnack(snack)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer flex items-center gap-1 hover:text-gray-900 active:scale-95"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-amber-500 text-white rounded-lg p-1 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSnack(snack.id)}
                                    className="w-5 h-5 rounded-md bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-2.5 h-2.5 text-white" />
                                  </button>
                                  <span className="text-xs font-bold px-1 min-w-[14px] text-center">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddSnack(snack)}
                                    className="w-5 h-5 rounded-md bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-2.5 h-2.5 text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final Order Breakdown */}
                    <div className="bg-gray-50 p-3 rounded-xl mb-4 text-xs text-gray-600 space-y-1.5 border border-gray-100">
                      <div className="flex justify-between items-center text-gray-800">
                        <span>Seats ({bookingModal.selectedSeats.join(', ')}):</span>
                        <span className="font-bold">₹{ticketsSubtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 text-[11px]">
                        <span>Convenience Fees &amp; GST:</span>
                        <span>₹{convenienceFee}</span>
                      </div>
                      {bookingModal.includeSnacks && (bookingModal.snacksTotal || 0) > 0 && (
                        <div className="pt-1 border-t border-gray-200/80 space-y-1">
                          <div className="flex justify-between items-center text-amber-800 font-bold text-[11px]">
                            <span>
                              Cinema Concessions ({bookingModal.deliveryPreference === 'counter_pickup' ? 'Counter Pickup' : 'In-Seat Delivery'}):
                            </span>
                            <span>+₹{bookingModal.snacksTotal}</span>
                          </div>
                          {Array.isArray(bookingModal.snacksList) && bookingModal.snacksList.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] text-amber-700 pl-2">
                              <span>{s.emoji} {s.name} × {s.quantity}</span>
                              <span>₹{s.price * s.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <span className="text-base font-bold text-[#F84464]">₹{grandTotal}</span>
                      </div>
                    </div>

                    {/* Booking Error Banner */}
                    {bookingError && (
                      <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold text-center animate-in fade-in">
                        {bookingError}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingModal((prev) => ({ ...prev, includeSnacks: false, snacksList: [], snacksTotal: 0 }));
                          if (!isAuthenticated) {
                            openAuthModal('signin');
                            return;
                          }
                          setIsPaymentModalOpen(true);
                        }}
                        disabled={bookingLoading}
                        className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Skip Snacks
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            openAuthModal('signin');
                            return;
                          }
                          setIsPaymentModalOpen(true);
                        }}
                        disabled={bookingLoading}
                        className="w-2/3 py-2.5 bg-[#F84464] hover:bg-[#E03A58] disabled:opacity-70 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming seats...</span>
                          </>
                        ) : (
                          <>
                            <Ticket className="w-4 h-4" />
                            <span>
                              {isAuthenticated ? `Pay ₹${grandTotal} & Book` : 'Sign In & Book'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* ========================================================
                STEP 4: AUTHENTIC CUSTOMER-MATCHED LUXURY DIGITAL M-TICKET PASS
            ======================================================== */
            <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 my-4">
              {/* Top Accent Gradient Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#F84464] via-rose-500 to-amber-400" />

              {/* Digital Pass Header Strip */}
              <div className="bg-gradient-to-br from-[#222432] via-[#2b2e40] to-[#1a1c27] text-white p-5 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-[#F84464]/25 rounded-full blur-2xl" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 text-[#F84464] text-[9px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Official M-Pass</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Confirmed</span>
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#F84464] shrink-0" />
                      <span className="truncate">{bookingModal.theatre?.name}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                    className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                    title="Close Pass"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Perforated Ticket Divider with Side Half-Circles */}
              <div className="relative flex items-center justify-between w-full h-4 bg-white overflow-hidden -my-2 z-10">
                <div className="w-4 h-4 rounded-full bg-black/80 -ml-2 border-r border-slate-200 shadow-inner shrink-0" />
                <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />
                <div className="w-4 h-4 rounded-full bg-black/80 -mr-2 border-l border-slate-200 shadow-inner shrink-0" />
              </div>

              {/* Ticket Body */}
              <div className="p-4 sm:p-5 bg-white">
                {/* QR Code & Optical Turnstile Stub */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center mb-3.5 relative">
                  <div className={`w-28 h-28 bg-white rounded-2xl shadow-inner border border-slate-200 p-2.5 mx-auto flex items-center justify-center mb-2.5 transition-transform ${isTurnstileBright ? 'scale-105 ring-4 ring-amber-300' : ''}`}>
                    <QRCodeSVG
                      value={typeof window !== 'undefined' ? `${window.location.origin}/vendor/scanner?bookingId=${bookingModal.bookingId || 'BMS-DEMO'}` : `BMS-${bookingModal.bookingId}`}
                      size={96}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 tracking-widest">
                    {bookingModal.bookingId}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mt-2 w-fit mx-auto shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Paid via {(bookingModal.paymentMethod || 'UPI / PhonePe').replace('upi_', '').replace('_', ' ').toUpperCase()}</span>
                    {bookingModal.transactionId && (
                      <span className="font-mono text-[9px] text-slate-500 font-semibold">• {bookingModal.transactionId}</span>
                    )}
                  </div>
                </div>

                {/* Show Details Grid (Customer Theme) */}
                <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3.5">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Cinema &amp; Audi</span>
                    <span className="font-bold text-slate-900 text-xs block truncate">{bookingModal.theatre?.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Audi 2 • Gate 3</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Date &amp; Showtime</span>
                    <span className="font-bold text-slate-900 text-xs block">
                      {dates[selectedDateIndex]?.date || 'Today'}
                    </span>
                    <span className="text-[10px] text-[#F84464] font-bold">
                      {bookingModal.showtime?.time} ({bookingModal.showtime?.format})
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Reserved Seats ({bookingModal.selectedSeats.length})</span>
                    <span className="font-mono font-bold text-[#F84464] text-xs sm:text-sm">
                      {bookingModal.selectedSeats.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Paid</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {/* Snack Voucher Pill if included */}
                {bookingModal.includeSnacks && (
                  <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🍿</span>
                        <div>
                          <span className="text-xs font-bold text-amber-950 block">
                            Cinema Concessions Voucher
                          </span>
                          <span className="text-[10px] text-amber-800 font-semibold">
                            {bookingModal.deliveryPreference === 'counter_pickup'
                              ? '⚡ Express Counter: Refreshment Counter #3'
                              : `🛋️ In-Seat Delivery: Seats ${bookingModal.selectedSeats.join(', ')}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
                        PAID ₹{snacksTotal}
                      </span>
                    </div>

                    {/* Itemized Snacks List */}
                    {Array.isArray(bookingModal.snacksList) && bookingModal.snacksList.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        {bookingModal.snacksList.map((snack, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between text-[11px] text-amber-900">
                            <span>{snack.emoji || '🍿'} {snack.name} <span className="font-bold text-amber-950">× {snack.quantity || 1}</span></span>
                            <span className="font-semibold">₹{(snack.price || 0) * (snack.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-amber-700 font-medium mb-1.5">
                        Standard Multiplex Snack Combo
                      </p>
                    )}

                    <div className="pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Kitchen Status: Preparing
                      </span>
                      <span>Intermission Delivery</span>
                    </div>
                  </div>
                )}

                {/* Utilities Ribbon */}
                <div className="flex items-center gap-1.5 mb-3.5">
                  <button
                    type="button"
                    onClick={handleAddToCalendar}
                    className="flex-1 py-2 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Add to Google Calendar"
                  >
                    <Calendar className="w-3 h-3 text-[#F84464]" />
                    <span>Calendar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGetDirections()}
                    className="flex-1 py-2 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Open Maps Directions"
                  >
                    <Navigation className="w-3 h-3 text-cyan-600" />
                    <span>Directions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const msg = `🎟️ My BookMyShow Ticket: ${movie.title} at ${bookingModal.theatre?.name}, ${dates[selectedDateIndex]?.date} ${bookingModal.showtime?.time}. Seats: ${bookingModal.selectedSeats.join(', ')}. Booking ID: ${bookingModal.bookingId}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Share on WhatsApp"
                  >
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* 1-Click Official PDF Ticket Download */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#222538] via-[#2a2d42] to-[#1c1e2d] hover:from-[#2a2d42] hover:to-[#222538] text-white text-xs font-bold rounded-xl shadow-md border border-slate-700/80 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-[#F84464] animate-spin" />
                        <span>Compiling High-Res PDF Pass...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-md bg-[#F84464] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Download className="w-3 h-3" />
                        </div>
                        <span>Download Official PDF Ticket (with QR &amp; Invoice)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/my-bookings"
                    onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#F84464]" />
                    <span>My Bookings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                    className="flex-1 py-3 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-red-500/25"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
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

                <div className="text-base font-bold text-[#F84464] mb-6">
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

      {/* 6. Theater Mode HD Trailer Modal */}
      {trailerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-gray-900 via-gray-900 to-black border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F84464] animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {movie.title} <span className="text-gray-400 font-normal ml-1">— Official Trailer</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrailerOpen(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video container 16:9 */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={trailerEmbedUrl}
                title={`${movie.title} Trailer`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Modern Day UPI & Card Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={(paymentDetails) => {
          setIsPaymentModalOpen(false);
          confirmBooking(paymentDetails);
        }}
        amount={grandTotal}
        itemDetails={{
          title: movie?.title || 'Movie Tickets',
          seats: bookingModal.selectedSeats,
          theatre: bookingModal.theatre?.name,
          showtime: bookingModal.showtime?.time,
          includeSnacks: bookingModal.includeSnacks,
        }}
        isProcessing={bookingLoading}
      />

    </div>
  );
}