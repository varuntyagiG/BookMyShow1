const mongoose = require('mongoose');

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
