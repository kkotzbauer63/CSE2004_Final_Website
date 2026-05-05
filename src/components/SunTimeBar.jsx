import { useState, useEffect, useMemo } from 'react';
import { useSunTimes, getCurrentPhase } from '../hooks/useSunTimes';

const PHASE_LABEL = {
  daylight:     'Daylight',
  civil:        'Civil Twilight',
  nautical:     'Nautical Twilight',
  astronomical: 'Astronomical Twilight',
  night:        'Night',
};

// Fallback tick positions (%) used when location/API data is unavailable.
// Spaced to suggest typical twilight durations relative to daylight.
const STATIC_TICKS = [
  { key: 'sunset',   label: 'Sunset',      pct: 22 },
  { key: 'civil',    label: 'Civil',        pct: 44 },
  { key: 'nautical', label: 'Nautical',     pct: 66 },
  { key: 'astro',    label: 'Astronomical', pct: 84 },
];

function fmtTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function SunTimeBar() {
  const { phases, loading, error } = useSunTimes();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Compute bar geometry when we have real phase data
  const bar = useMemo(() => {
    if (!phases) return null;

    const MARGIN = 30 * 60 * 1000;
    const t0 = phases.sunset.getTime() - MARGIN;
    const t1 = phases.astroEnd.getTime() + MARGIN;
    const span = t1 - t0;
    const pct = (ms) => Math.max(0, Math.min(100, ((ms - t0) / span) * 100));

    return {
      phase:  getCurrentPhase(phases, now),
      nowPct: pct(now.getTime()),
      ticks: [
        { key: 'sunset',   label: 'Sunset',      time: phases.sunset,      pct: pct(phases.sunset.getTime()) },
        { key: 'civil',    label: 'Civil',        time: phases.civilEnd,    pct: pct(phases.civilEnd.getTime()) },
        { key: 'nautical', label: 'Nautical',     time: phases.nauticalEnd, pct: pct(phases.nauticalEnd.getTime()) },
        { key: 'astro',    label: 'Astronomical', time: phases.astroEnd,    pct: pct(phases.astroEnd.getTime()) },
      ],
    };
  }, [phases, now]);

  // Use real data when available, static positions otherwise
  const ticks   = bar ? bar.ticks  : STATIC_TICKS;
  const nowPct  = bar ? bar.nowPct : null;
  const phase   = bar ? bar.phase  : null;
  const hasNow  = nowPct !== null;

  return (
    <div
      className="sun-bar"
      aria-label={phase ? `Current light level: ${PHASE_LABEL[phase]}` : 'Light level unavailable'}
    >
      {/* ── Desktop: full timeline ───────────────────────────────────── */}
      <div className="sun-bar__desktop">
        <span className="sun-bar__day-label">Day Light</span>

        <div className="sun-bar__body">

          {/* Track */}
          <div className="sun-bar__track">
            {/* Amber fill up to NOW — only when we know where NOW is */}
            {hasNow && (
              <div className="sun-bar__fill" style={{ width: `${nowPct}%` }} />
            )}

            {ticks.map((t) => (
              <div
                key={t.key}
                className="sun-bar__tick-mark"
                style={{ left: `${t.pct}%` }}
              />
            ))}

            {/* NOW pip + label — only when location is known */}
            {hasNow && (
              <div className="sun-bar__now" style={{ left: `${nowPct}%` }}>
                <span className="sun-bar__now-text">NOW</span>
                <span className="sun-bar__now-pip" />
              </div>
            )}
          </div>

          {/* Labels: phase names, times (if available), You are here */}
          <div className="sun-bar__labels">
            {ticks.map((t) => (
              <div
                key={t.key}
                className="sun-bar__phase-item"
                style={{ left: `${t.pct}%` }}
              >
                <span className="sun-bar__phase-name">{t.label}</span>
                {t.time && (
                  <span className="sun-bar__phase-time">{fmtTime(t.time)}</span>
                )}
              </div>
            ))}

            {hasNow && (
              <div className="sun-bar__here" style={{ left: `${nowPct}%` }}>
                ↑ You are here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile: compact label ────────────────────────────────────── */}
      <div className="sun-bar__mobile">
        {phase ? (
          <>
            <span className="sun-bar__mobile-dot" />
            <span className="sun-bar__mobile-label">{PHASE_LABEL[phase]}</span>
          </>
        ) : (
          <span className="sun-bar__mobile-label sun-bar__mobile-label--dim">
            {loading ? 'Locating…' : 'Light level unavailable'}
          </span>
        )}
      </div>
    </div>
  );
}
