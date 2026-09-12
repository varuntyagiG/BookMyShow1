import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socketClient';
import { broadcastSync } from '../services/realtimeSync';

const NotificationContext = createContext(null);

/**
 * Native Web Audio API Chime Synthesizer
 * Produces a clear, pleasing two-tone confirmation chime without external audio assets.
 */
function playPositiveChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone rising major third: 523.25Hz (C5) -> 659.25Hz (E5) -> 783.99Hz (G5)
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.62);
  } catch (_e) {
    // AudioContext blocked by browser autoplay policy before user interaction
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('bms_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeToast, setActiveToast] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  // Sync notifications array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bms_notifications', JSON.stringify(notifications.slice(0, 30)));
    } catch {}
  }, [notifications]);

  const addNotification = useCallback((item) => {
    const newNotification = {
      id: item.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      read: false,
      ...item
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 30));
    setActiveToast(newNotification);
    playPositiveChime();

    // Auto-dismiss floating toast after 7 seconds
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotification.id ? null : current));
    }, 7000);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('bms_notifications');
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Connect socket listeners on mount
  useEffect(() => {
    const socket = getSocket();

    const handleBookingConfirmed = (data) => {
      console.log('🎉 Real-time booking confirmation received via WebSocket:', data);
      addNotification({
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed!',
        movieTitle: data.movieTitle,
        theatreName: data.theatreName,
        showtime: data.showtime,
        showDate: data.showDate,
        seats: data.seats,
        seatsCount: data.seatsCount,
        totalAmount: data.totalAmount,
        bookingId: data.bookingId,
        message: data.message || `Your tickets for ${data.movieTitle} are confirmed!`
      });

      // Synchronize across tabs and storage
      broadcastSync('BOOKING_MUTATION', { bookingId: data.bookingId });
    };

    const handleNewVendorSale = (data) => {
      console.log('🎟️ Real-time vendor sale alert received:', data);
      addNotification({
        type: 'VENDOR_SALE',
        title: 'New Box Office Sale!',
        theatreName: data.theatreName,
        screenName: data.screenName,
        movieTitle: data.movieTitle,
        seatsCount: data.seatsCount,
        totalAmount: data.totalAmount,
        bookingId: data.bookingId,
        message: `+₹${data.totalAmount} — ${data.seatsCount} seats booked for ${data.movieTitle || 'Show'}`
      });

      broadcastSync('SHOW_MUTATION', { bookingId: data.bookingId });
    };

    socket.on('BOOKING_CONFIRMED', handleBookingConfirmed);
    socket.on('NEW_TICKET_SALE', handleNewVendorSale);

    return () => {
      socket.off('BOOKING_CONFIRMED', handleBookingConfirmed);
      socket.off('NEW_TICKET_SALE', handleNewVendorSale);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        isOpenDrawer,
        setIsOpenDrawer,
        addNotification,
        markAllAsRead,
        clearAll,
        dismissToast,
        playPositiveChime
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
