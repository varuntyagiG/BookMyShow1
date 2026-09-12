let Server = null;
try {
  Server = require('socket.io').Server;
} catch (_err) {
  // Optional in serverless environments like Vercel
}
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initialize Socket.io on the HTTP server instance
 * @param {import('http').Server} httpServer
 * @param {object} options
 */
function initSocket(httpServer, options = {}) {
  if (!Server) {
    return null;
  }
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://bookmytrip-seven.vercel.app',
    ...(process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
      : [])
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/staging to avoid socket blocks
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Socket Connection Handshake & Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');
      if (token) {
        const secret = process.env.JWT_SECRET || 'bookmyshow_super_secret_jwt_key_2024';
        const decoded = jwt.verify(token, secret);
        socket.user = decoded;
      }
    } catch (_err) {
      // Allow unauthenticated connection for guest seat viewing
      socket.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    const userRole = socket.user?.role;

    // Auto-join authenticated user private room
    if (userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);

      // If partner / vendor, join vendor-specific room
      if (userRole === 'partner' || userRole === 'vendor' || userRole === 'cinema_owner') {
        socket.join(`vendor:${userId}`);
      }

      // If admin, join admin channel
      if (userRole === 'admin') {
        socket.join('admin_room');
      }
    }

    // Client requests to watch a specific showtime seat map
    socket.on('join_show', (data) => {
      const showId = typeof data === 'string' ? data : data?.showId;
      if (showId) {
        const room = `show:${showId}`;
        socket.join(room);
        socket.emit('joined_show_ack', { showId, room });
      }
    });

    // Client leaves seat map
    socket.on('leave_show', (data) => {
      const showId = typeof data === 'string' ? data : data?.showId;
      if (showId) {
        socket.leave(`show:${showId}`);
      }
    });

    // Explicit partner room join (for vendor dashboards)
    socket.on('join_vendor', (data) => {
      const partnerId = typeof data === 'string' ? data : data?.partnerId;
      if (partnerId) {
        socket.join(`vendor:${partnerId}`);
      }
    });

    socket.on('disconnect', (_reason) => {
      // Client disconnected cleanly
    });
  });

  console.log('⚡ Socket.io real-time engine initialized successfully.');
  return io;
}

/**
 * Access the active Socket.io instance
 */
function getIO() {
  if (!io) {
    console.warn('⚠️ Warning: Socket.io has not been initialized yet.');
  }
  return io;
}

/**
 * Broadcast newly reserved seats to all clients actively viewing this show
 * @param {string} showId
 * @param {string[]} seats
 */
function broadcastSeatsLocked(showId, seats = []) {
  if (!io || !showId || !seats.length) return;
  const room = `show:${showId}`;
  io.to(room).emit('SEATS_LOCKED', {
    showId: String(showId),
    seats,
    timestamp: Date.now(),
    message: `${seats.join(', ')} just booked by another customer.`
  });
}

/**
 * Emit celebratory booking confirmation to the booking user's private channel
 * @param {string} userId
 * @param {object} booking
 */
function notifyBookingSuccess(userId, booking) {
  if (!io || !userId || !booking) return;
  const userRoom = `user:${userId}`;
  io.to(userRoom).emit('BOOKING_CONFIRMED', {
    bookingId: booking.bookingId,
    movieTitle: booking.movieTitle,
    theatreName: booking.theatreName,
    showtime: booking.showtime,
    showDate: booking.showDate || 'Today',
    seats: booking.seats || [],
    seatsCount: booking.seatsCount || (booking.seats?.length || 1),
    totalAmount: booking.totalAmount,
    categoryType: booking.categoryType || 'movie',
    timestamp: Date.now(),
    message: `🎉 Booking Confirmed! Ticket #${booking.bookingId} for ${booking.movieTitle}`
  });
}

/**
 * Emit live ticket sale alert to the cinema vendor's portal
 * @param {string} partnerId
 * @param {object} saleData
 */
function notifyVendorSale(partnerId, saleData) {
  if (!io || !partnerId) return;
  const vendorRoom = `vendor:${partnerId}`;
  io.to(vendorRoom).emit('NEW_TICKET_SALE', {
    ...saleData,
    timestamp: Date.now(),
    message: `🎟️ New Ticket Sale: ${saleData.seatsCount || 1} seats booked at ${saleData.theatreName || 'your venue'} (+₹${saleData.totalAmount || 0})`
  });
}

/**
 * Emit transaction metric to Platform Admin dashboard
 * @param {object} txData
 */
function notifyAdminSale(txData) {
  if (!io) return;
  io.to('admin_room').emit('PLATFORM_TRANSACTION', {
    ...txData,
    timestamp: Date.now()
  });
}

module.exports = {
  initSocket,
  getIO,
  broadcastSeatsLocked,
  notifyBookingSuccess,
  notifyVendorSale,
  notifyAdminSale
};
