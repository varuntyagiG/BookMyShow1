const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers on local Windows to avoid querySrv EBADRESP errors
if (process.platform === 'win32' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    // Ignore in environments where setting DNS servers is restricted
  }
}

let isConnected = false;

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables. Please check your .env file.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    const isCloud = mongoUri.startsWith('mongodb+srv://') || !conn.connection.host.includes('127.0.0.1');
    const targetLabel = isCloud ? 'MongoDB Atlas Cloud' : 'Local MongoDB';

    console.log(`\n✅ ${targetLabel} Connected: Database "${conn.connection.name}" on host ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:', error.message);
    isConnected = false;
    throw error;
  }
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('🔌 MongoDB connection closed gracefully.');
  }
}

module.exports = { connectDB, isDBConnected, closeDB };
