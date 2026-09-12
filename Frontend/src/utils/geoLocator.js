/**
 * BookMyTrip Geolocation & Spatial Distance Engine
 * Computes great-circle distance (Haversine formula) to match GPS coordinates
 * to supported cinema hubs with sub-millisecond execution.
 */

export const SUPPORTED_CITIES_COORDINATES = [
  // Primary Metro Hubs
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, aliases: ['Thane', 'Navi Mumbai', 'Kalyan'] },
  { name: 'Delhi-NCR', lat: 28.6139, lon: 77.209, aliases: ['New Delhi', 'Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Ghaziabad', 'Faridabad'] },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, aliases: ['Bangalore', 'Whitefield', 'Electronic City'] },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867, aliases: ['Secunderabad', 'Cyberabad'] },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, aliases: ['Mohali', 'Panchkula'] },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, aliases: ['Gandhinagar'] },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, aliases: ['Madras'] },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, aliases: ['Pimpri-Chinchwad'] },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, aliases: ['Calcutta', 'Howrah'] },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673, aliases: ['Cochin', 'Ernakulam'] },

  // Key Regional Hubs
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { name: 'Goa', lat: 15.2993, lon: 74.124, aliases: ['Panaji', 'Vasco'] },
  { name: 'Indore', lat: 22.7196, lon: 75.8577 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { name: 'Surat', lat: 21.1702, lon: 72.8311 },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
  { name: 'Patna', lat: 25.5941, lon: 85.1376 },
  { name: 'Dehradun', lat: 30.3165, lon: 78.0322 },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, aliases: ['Vizag'] },
  { name: 'Amritsar', lat: 31.634, lon: 74.8723 },
  { name: 'Agra', lat: 27.1767, lon: 78.0081 },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739 },
  { name: 'Vadodara', lat: 22.3072, lon: 73.1812 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, aliases: ['Trivandrum'] },
];

/**
 * Calculate Great-Circle Distance between two coordinates using the Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Request device coordinates from the browser Geolocation API
 * @param {object} options
 * @returns {Promise<{success: boolean, coords?: {latitude: number, longitude: number}, error?: string, code?: number}>}
 */
export function getDeviceCoordinates(options = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return resolve({
        success: false,
        error: 'Geolocation is not supported by your browser.',
        code: 0
      });
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: options.timeout || 8000,
      maximumAge: options.maximumAge || 300000 // Cache for 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy)
          }
        });
      },
      (error) => {
        let message = 'Could not determine location.';
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            message = 'Location permission was denied. Please select your city manually below.';
            break;
          case 2: // POSITION_UNAVAILABLE
            message = 'Location signal is unavailable. Please select your city manually.';
            break;
          case 3: // TIMEOUT
            message = 'Location request timed out. Please select your city manually.';
            break;
          default:
            message = error.message || 'Unable to retrieve location.';
        }
        resolve({
          success: false,
          error: message,
          code: error.code
        });
      },
      geoOptions
    );
  });
}

/**
 * Match coordinates to the nearest supported city
 * @param {number} userLat
 * @param {number} userLon
 * @returns {{ city: string, distanceKm: number, isCloseMatch: boolean }}
 */
export function resolveNearestCity(userLat, userLon) {
  let closest = SUPPORTED_CITIES_COORDINATES[0];
  let minDistance = Infinity;

  for (const city of SUPPORTED_CITIES_COORDINATES) {
    const distance = calculateHaversineDistance(userLat, userLon, city.lat, city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      closest = city;
    }
  }

  return {
    city: closest.name,
    distanceKm: minDistance,
    isCloseMatch: minDistance <= 80 // Within 80km radius of the metro hub
  };
}

/**
 * Complete Auto-Detection Pipeline:
 * Queries GPS -> computes nearest supported hub -> falls back to client-side reverse geocode
 * @returns {Promise<{ success: boolean, cityName: string, distanceKm?: number, message?: string }>}
 */
export async function autoDetectCurrentCity() {
  const result = await getDeviceCoordinates();

  if (!result.success) {
    return {
      success: false,
      cityName: 'Mumbai',
      message: result.error
    };
  }

  const { latitude, longitude } = result.coords;
  const match = resolveNearestCity(latitude, longitude);

  // Optional zero-auth reverse geocode check to refine localized name
  try {
    const reverseRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: AbortSignal.timeout(3500) }
    );
    if (reverseRes.ok) {
      const geoData = await reverseRes.json();
      const detectedName = geoData.city || geoData.locality;

      if (detectedName) {
        // Check if detectedName matches any alias in our database
        for (const city of SUPPORTED_CITIES_COORDINATES) {
          if (
            city.name.toLowerCase() === detectedName.toLowerCase() ||
            city.aliases?.some((a) => a.toLowerCase() === detectedName.toLowerCase())
          ) {
            return {
              success: true,
              cityName: city.name,
              distanceKm: match.distanceKm,
              message: `Detected: ${detectedName} (aligned to ${city.name})`
            };
          }
        }
      }
    }
  } catch {
    // Network/timeout on reverse geocode, silently fallback to Haversine closest match
  }

  return {
    success: true,
    cityName: match.city,
    distanceKm: match.distanceKm,
    message: `Nearest cinema hub: ${match.city} (~${match.distanceKm} km away)`
  };
}
