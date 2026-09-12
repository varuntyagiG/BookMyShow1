import { io } from 'socket.io-client';

// Determine socket server endpoint based on environment
function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // In development, connect to local backend port 5000
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  // Production fallback to current host or Render backend
  return 'https://bookmytrip-backend.onrender.com';
}

let socketInstance = null;

/**
 * Get or initialize the singleton Socket.io client instance
 */
export function getSocket() {
  if (!socketInstance) {
    const socketUrl = getSocketUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem('bms_token') : null;

    socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || ''
      },
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to BookMyTrip Real-Time Engine (Socket ID:', socketInstance.id, ')');
    });

    socketInstance.on('connect_error', (error) => {
      // Graceful error logging; socket will fall back to polling
      console.warn('Socket connection retry:', error.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  return socketInstance;
}

/**
 * Update auth token after user logs in or out
 */
export function updateSocketAuth() {
  if (socketInstance) {
    const token = localStorage.getItem('bms_token') || '';
    socketInstance.auth = { token };
    if (socketInstance.connected) {
      socketInstance.disconnect().connect();
    }
  }
}

export default getSocket;
