// src/utils/geolocation.ts
/**
 * FEEDO 20 KM Geographical Service Availability & GPS Coordinate Utility
 * Implements exact Haversine geographical distance calculations and GPS coordinate capture.
 */

export const SERVICE_RADIUS_KM = 20.0;

/**
 * Validates geographical coordinates (latitude [-90, 90] and longitude [-180, 180]).
 */
export function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Computes exact geographical distance between two points using the Haversine formula.
 * Returns distance in kilometers (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return Infinity;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifies whether a distance falls strictly within the FEEDO 20 KM service radius.
 * - Distance <= 20.0 KM: Eligible (including exactly 20.0 KM)
 * - Distance > 20.0 KM: Not eligible
 */
export function isWithinServiceRadius(distanceKm: number): boolean {
  return distanceKm <= SERVICE_RADIUS_KM;
}

/**
 * Captures real device GPS coordinates with error handling for permissions and timeouts.
 */
export function getCurrentDeviceGpsCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser/device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
      },
      (error) => {
        let msg = 'Unable to detect device GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access or enter your coordinates manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable from your device GPS.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Device location request timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Broadcasts restaurant updates across browser tabs and apps (Customer App + Partner App)
 * to maintain strict real-time 20 KM synchronization.
 */
export function broadcastRestaurantUpdate(restaurantData: any) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('feedo_partner_restaurant', JSON.stringify(restaurantData));
      localStorage.setItem('feedo_partner_restaurant_updated_at', Date.now().toString());
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('feedo_sync_channel');
        channel.postMessage({ type: 'RESTAURANT_UPDATED', payload: restaurantData });
        channel.close();
      }
    }
  } catch (e) {
    console.warn('Failed to broadcast restaurant update:', e);
  }
}

