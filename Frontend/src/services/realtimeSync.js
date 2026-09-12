import { useEffect, useRef } from 'react';

// Channel name for cross-tab and cross-window broadcast
const SYNC_CHANNEL_NAME = 'bookmytrip_omniverse_sync';
const STORAGE_EVENT_KEY = 'bms_realtime_sync_event';

// Browser-safe BroadcastChannel initialization
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization failed, falling back to localStorage events', e);
  }
}

// In-memory local subscribers for same-tab reactive updates
const localListeners = new Set();

/**
 * Broadcast a real-time event across all tabs, windows, and same-tab components
 * @param {string} type - 'MOVIE_MUTATION' | 'SHOW_MUTATION' | 'BOOKING_MUTATION' | 'SCREEN_MUTATION' | 'OFFER_MUTATION' | 'VENDOR_STATUS_MUTATION'
 * @param {object} payload - arbitrary metadata (action, id, etc.)
 */
export function broadcastSync(type, payload = {}) {
  const event = {
    type,
    payload,
    timestamp: Date.now(),
    sourceId: typeof window !== 'undefined'
      ? (window.__bmsTabId || (window.__bmsTabId = Math.random().toString(36).substring(2)))
      : 'server'
  };

  // 1. Notify same-tab components instantly
  localListeners.forEach(listener => {
    try {
      listener(event);
    } catch (e) {
      console.error('Error in local sync listener:', e);
    }
  });

  // 2. Broadcast to other open tabs via native BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event);
    } catch (e) {
      console.warn('BroadcastChannel postMessage failed:', e);
    }
  }

  // 3. Fallback to localStorage event for cross-tab notification
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(event));
    } catch (_e) {}
  }
}

/**
 * Hook to automatically re-fetch data when matching real-time sync events fire,
 * OR when the user switches back to this browser tab (SWR auto-revalidation).
 *
 * @param {string | string[]} eventTypes - Event type or array of types (e.g. ['MOVIE_MUTATION', 'SHOW_MUTATION'])
 * @param {function} onRefreshCallback - Callback function to reload fresh data
 * @param {object} options - { enableWindowFocus?: boolean, minInterval?: number }
 */
export function useRealtimeRefresh(eventTypes, onRefreshCallback, options = {}) {
  const { enableWindowFocus = true, minInterval = 800 } = options;
  const lastRefreshRef = useRef(Date.now());
  const callbackRef = useRef(onRefreshCallback);
  callbackRef.current = onRefreshCallback;

  const typesArray = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

  useEffect(() => {
    const handleTrigger = (event) => {
      const now = Date.now();
      if (now - lastRefreshRef.current < minInterval) return; // debounce rapid triggers

      if (event && event.type) {
        if (!typesArray.includes(event.type) && !typesArray.includes('*')) {
          return;
        }
      }

      lastRefreshRef.current = now;
      if (typeof callbackRef.current === 'function') {
        callbackRef.current();
      }
    };

    // 1. Listen to same-tab local broadcast
    localListeners.add(handleTrigger);

    // 2. Listen to other tabs via BroadcastChannel
    const handleBroadcastMessage = (e) => {
      if (e.data) {
        handleTrigger(e.data);
      }
    };
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    // 3. Listen to localStorage storage events
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_EVENT_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleTrigger(parsed);
        } catch (_e) {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 4. SWR Pattern: Auto-revalidate on Window Focus & Visibility Change
    const handleFocus = () => {
      if (enableWindowFocus) {
        handleTrigger({ type: '*' });
      }
    };
    const handleVisibility = () => {
      if (enableWindowFocus && document.visibilityState === 'visible') {
        handleTrigger({ type: '*' });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      localListeners.delete(handleTrigger);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [typesArray.join(','), enableWindowFocus, minInterval]);
}
