/**
 * Standardized scientific & maritime formatting helpers
 */

/**
 * Format UTC timestamp string: "14 SEP 2026 · 12:42 UTC"
 */
export function formatUtcDateTime(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-- --- ---- · --:-- UTC';
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} · ${hours}:${minutes} UTC`;
}

/**
 * Format knots (e.g. "18.2 kn")
 */
export function formatSpeed(knots) {
  if (knots === null || knots === undefined || isNaN(knots)) return '-- kn';
  return `${Number(knots).toFixed(1)} kn`;
}

/**
 * Format ice concentration percentage (e.g. "72.4%")
 */
export function formatPercentage(val) {
  if (val === null || val === undefined || isNaN(val)) return '--%';
  return `${Number(val).toFixed(1)}%`;
}

/**
 * Format distance in km or nm according to unit settings
 */
export function formatDistance(distanceKm, unit = 'km') {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return `-- ${unit}`;
  if (unit === 'nm') {
    return `${(Number(distanceKm) * 0.539957).toFixed(1)} NM`;
  }
  return `${Number(distanceKm).toFixed(1)} km`;
}

/**
 * Format fuel volume in Liters or metric Tonnes (assuming marine gas oil density ~0.85 kg/L)
 */
export function formatFuel(liters, unit = 'L') {
  if (liters === null || liters === undefined || isNaN(liters)) return `-- ${unit}`;
  if (unit === 't') {
    return `${(Number(liters) * 0.00085).toFixed(2)} t`;
  }
  return `${Math.round(Number(liters)).toLocaleString()} L`;
}

/**
 * Format temperature in Celsius
 */
export function formatTemperature(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '-- °C';
  const prefix = celsius > 0 ? '+' : '';
  return `${prefix}${Number(celsius).toFixed(1)} °C`;
}

/**
 * Format atmospheric pressure (e.g. "984 hPa")
 */
export function formatPressure(hpa) {
  if (hpa === null || hpa === undefined || isNaN(hpa)) return '-- hPa';
  return `${Math.round(Number(hpa))} hPa`;
}

/**
 * Format wave height (e.g. "2.8 m")
 */
export function formatWaveHeight(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return '-- m';
  return `${Number(meters).toFixed(1)} m`;
}

/**
 * Format duration in hours or days
 */
export function formatDuration(hours) {
  if (hours === null || hours === undefined || isNaN(hours)) return '-- hrs';
  const h = Number(hours);
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const remHours = (h % 24).toFixed(0);
    return `${days}d ${remHours}h`;
  }
  return `${h.toFixed(1)} hrs`;
}
