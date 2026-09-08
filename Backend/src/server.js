const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', movieRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'BookMyShow Backend API is running smoothly' });
});

// Fallback 404 route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 BookMyShow Backend server is LIVE and running on: http://localhost:${PORT}`);
  console.log(`📋 API Health Check: http://localhost:${PORT}/api/health\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another running process!`);
    console.error(`💡 The backend is already running on http://localhost:${PORT}.`);
    console.error(`   If you want to free port ${PORT}, run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
