/**
 * Coordinate utility functions for polar navigation
 */

/**
 * Convert decimal latitude to formatted DMS string (e.g. 64°32.4'S)
 */
export function formatLatitude(lat) {
  if (lat === null || lat === undefined || isNaN(lat)) return '--°--.-';
  const dir = lat >= 0 ? 'N' : 'S';
  const abs = Math.abs(lat);
  const degrees = Math.floor(abs);
  const minutes = ((abs - degrees) * 60).toFixed(1);
  return `${degrees.toString().padStart(2, '0')}°${minutes.padStart(4, '0')}'${dir}`;
}

/**
 * Convert decimal longitude to formatted DMS string (e.g. 042°18.7'E)
 */
export function formatLongitude(lon) {
  if (lon === null || lon === undefined || isNaN(lon)) return '---°--.-';
  const dir = lon >= 0 ? 'E' : 'W';
  const abs = Math.abs(lon);
  const degrees = Math.floor(abs);
  const minutes = ((abs - degrees) * 60).toFixed(1);
  return `${degrees.toString().padStart(3, '0')}°${minutes.padStart(4, '0')}'${dir}`;
}

/**
 * Format coordinate pair according to format preference ('dms' or 'decimal')
 */
export function formatCoordinates(lat, lon, format = 'dms') {
  if (format === 'decimal') {
    return `${Number(lat).toFixed(4)}°, ${Number(lon).toFixed(4)}°`;
  }
  return `${formatLatitude(lat)}  ${formatLongitude(lon)}`;
}

/**
 * Calculate great-circle distance between two points in km (Haversine)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert kilometers to Nautical Miles
 */
export function kmToNauticalMiles(km) {
  return km * 0.539957;
}

/**
 * Calculate initial bearing (heading) between two coordinates in degrees (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Convert bearing degrees to cardinal direction (e.g. 135° -> 'SE')
 */
export function bearingToCardinal(degrees) {
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return cardinals[index];
}
