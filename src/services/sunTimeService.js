/**
 * Fetches sun phase times from the sunrise-sunset.org API.
 * Returns ISO 8601 UTC timestamps for all twilight phases.
 * @param {number} lat  - Latitude
 * @param {number} lng  - Longitude
 * @param {string} tzid - IANA timezone ID (e.g. "America/Chicago")
 * @returns {Promise<object>} Raw results object from the API
 */
export async function fetchSunTimes(lat, lng, tzid) {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&tzid=${encodeURIComponent(tzid)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 'OK') throw new Error(`API status: ${data.status}`);
  return data.results;
}
