import { useState, useEffect, useMemo } from 'react';
import { fetchSunTimes } from '../services/sunTimeService';

function parsePhases(results) {
  return {
    sunrise:    new Date(results.sunrise),
    sunset:     new Date(results.sunset),
    civilEnd:   new Date(results.civil_twilight_end),
    nauticalEnd: new Date(results.nautical_twilight_end),
    astroEnd:   new Date(results.astronomical_twilight_end),
    civilBegin:    new Date(results.civil_twilight_begin),
    nauticalBegin: new Date(results.nautical_twilight_begin),
    astroBegin:    new Date(results.astronomical_twilight_begin),
  };
}

/**
 * Determine which Anduril-relevant light phase the current moment falls in.
 * Returns one of: 'daylight' | 'civil' | 'nautical' | 'astronomical' | 'night'
 */
export function getCurrentPhase(phases, now = new Date()) {
  const t = now.getTime();
  const { sunrise, sunset, civilEnd, nauticalEnd, astroEnd,
          civilBegin, nauticalBegin, astroBegin } = phases;

  // Daytime
  if (t >= sunrise.getTime() && t <= sunset.getTime()) return 'daylight';

  // Evening twilight phases
  if (t > sunset.getTime()   && t <= civilEnd.getTime())    return 'civil';
  if (t > civilEnd.getTime() && t <= nauticalEnd.getTime()) return 'nautical';
  if (t > nauticalEnd.getTime() && t <= astroEnd.getTime()) return 'astronomical';

  // Morning twilight phases
  if (t >= astroBegin.getTime()    && t < nauticalBegin.getTime()) return 'astronomical';
  if (t >= nauticalBegin.getTime() && t < civilBegin.getTime())    return 'nautical';
  if (t >= civilBegin.getTime()    && t < sunrise.getTime())       return 'civil';

  return 'night';
}

/**
 * Fetches today's sun phase times using the browser's Geolocation API
 * and the sunrise-sunset.org REST API.
 *
 * Returns { phases, loading, error }
 *   phases – parsed Date objects for all key transitions, or null while loading
 *   loading – true until either data arrives or an error occurs
 *   error   – one of: 'no_geolocation' | 'location_denied' | 'api_error' | 'fetch_error' | null
 */
export function useSunTimes() {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('no_geolocation');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fetchSunTimes(latitude, longitude, tzid)
          .then((results) => {
            setRawData(results);
            setLoading(false);
          })
          .catch(() => {
            setError('fetch_error');
            setLoading(false);
          });
      },
      () => {
        setError('location_denied');
        setLoading(false);
      },
      { timeout: 10_000 }
    );
  }, []);

  const phases = useMemo(() => (rawData ? parsePhases(rawData) : null), [rawData]);

  return { phases, loading, error };
}
