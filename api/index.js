const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../Backend/.env') });

// Set default fallback credentials for cloud deployment
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb+srv://varuncuraj77_db_user:KwsQK0ioCITipm3C@cluster0.64rakqf.mongodb.net/bookmytrip?appName=Cluster0';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'bookmyshow_super_secret_jwt_key_2024';
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('../Backend/src/routes/authRoutes');
const movieRoutes = require('../Backend/src/routes/movieRoutes');
const bookingRoutes = require('../Backend/src/routes/bookingRoutes');
const vendorRoutes = require('../Backend/src/routes/vendorRoutes');
const adminRoutes = require('../Backend/src/routes/adminRoutes');
const { connectDB } = require('../Backend/src/config/db');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serverless DB connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB Connection error:', err.message);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BookMyTrip Serverless API on Vercel',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/bookings', bookingRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Export for Vercel Serverless Function
module.exports = app;
