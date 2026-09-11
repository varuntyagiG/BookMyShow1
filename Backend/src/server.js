const path = require('path');
// Load .env from Backend root regardless of which directory the command was run from
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cinemaPartnerRoutes = require('./routes/cinemaPartnerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { connectDB, isDBConnected, closeDB } = require('./config/db');

// 1. Environment Variable Validation
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`\n❌ Fatal Error: Missing required environment variable(s): ${missingVars.join(', ')}`);
  console.error('💡 Please verify your .env configuration file.\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 2. Production-ready CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://bookmytrip-seven.vercel.app',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, '')) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or tools without origin header (e.g. curl, postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow if FRONTEND_URL is '*' or in development mode
    if (allowedOrigins.includes('*') || process.env.FRONTEND_URL === '*' || NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Allow explicitly matched origins or any *.vercel.app domain
    try {
      const parsedUrl = new URL(origin);
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(parsedUrl.hostname)) {
        return callback(null, true);
      }
    } catch {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging for development
if (NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// 3. Health check endpoints (safe for production monitoring)
const healthHandler = (req, res) => {
  const dbStatus = isDBConnected() ? 'connected' : 'disconnected';
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    service: 'BookMyTrip API',
    database: {
      status: dbStatus,
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cinema-partner', cinemaPartnerRoutes);
app.use('/api/admin', adminRoutes);

// Fallback 404 route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 5. Connect to Database then start Express Server
async function startServer() {
  try {
    // Connect to MongoDB before accepting HTTP traffic
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 BookMyTrip Backend server is LIVE on port ${PORT} [${NODE_ENV}]`);
      console.log(`📋 Health Check: http://localhost:${PORT}/api/health\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${PORT} is already in use by another running process!`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });

    // Graceful Shutdown Handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('🔒 HTTP server closed.');
        try {
          await closeDB();
        } catch (dbErr) {
          console.error('Error during DB disconnect:', dbErr.message);
        }
        process.exit(0);
      });

      // Force shutdown if taking longer than 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forcefully terminating after timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return server;
  } catch (error) {
    console.error('\n❌ Server failed to start due to database connection error:', error.message);
    process.exit(1);
  }
}

// Start execution
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
