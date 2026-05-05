import { useState, useEffect, useMemo } from 'react';
import { useSunTimes, getCurrentPhase } from '../hooks/useSunTimes';

const PHASE_LABEL = {
  daylight:     'Daylight',
  civil:        'Civil Twilight',
  nautical:     'Nautical Twilight',
  astronomical: 'Astronomical Twilight',
  night:        'Night',
};

// 30 min of visual breathing room between Daylight and the nearest twilight tick.
// This keeps the first/last labels from crowding the bar edge.
const DAYLIGHT_BUFFER = 30 * 60 * 1000;

// ── Bar geometry helpers ──────────────────────────────────────────────────

/**
 * EVENING bar  (used when local hour ≥ 12, i.e. PM side of the day)
 * Reads left → right: Daylight → Sunset → Civil → Nautical → Astronomical
 * Time flows left→right; NOW drifts rightward as it gets darker.
 *
 *   t0 = sunset − 30 min  →  0%  (Daylight anchor)
 *   t1 = astroEnd          → 100% (Astronomical anchor)
 *   pct(t) = (t − t0) / (t1 − t0)
 */
function eveningBar(phases, now) {
  const t0   = phases.sunset.getTime() - DAYLIGHT_BUFFER;
  const t1   = phases.astroEnd.getTime();
  const span = t1 - t0;
  const pct  = (ms) => Math.max(0, Math.min(100, ((ms - t0) / span) * 100));

  const phase      = getCurrentPhase(phases, now);
  const isDaylight = phase === 'daylight';

  return {
    phase,
    nowPct: pct(now.getTime()),   // clamped: 0% while daylight, 100% after astroEnd
    ticks: [
      { key: 'daylight', label: 'Day Light',   time: isDaylight ? now : null, pct: 0   },
      { key: 'sunset',   label: 'Sunset',      time: phases.sunset,           pct: pct(phases.sunset.getTime()) },
      { key: 'civil',    label: 'Civil',        time: phases.civilEnd,         pct: pct(phases.civilEnd.getTime()) },
      { key: 'nautical', label: 'Nautical',     time: phases.nauticalEnd,      pct: pct(phases.nauticalEnd.getTime()) },
      { key: 'astro',    label: 'Astronomical', time: phases.astroEnd,         pct: 100 },
    ],
  };
}

/**
 * MORNING bar  (used when local hour < 12, i.e. AM side of the day)
 * Reads left → right: Astronomical → Nautical → Civil → Sunrise → Daylight
 * Time flows left→right; NOW drifts rightward as dawn approaches.
 *
 *   t0 = astroBegin          →  0%  (Astronomical anchor)
 *   t1 = sunrise + 30 min   → 100% (Daylight anchor)
 *   pct(t) = (t − t0) / (t1 − t0)
 */
function morningBar(phases, now) {
  const t0   = phases.astroBegin.getTime();
  const t1   = phases.sunrise.getTime() + DAYLIGHT_BUFFER;
  const span = t1 - t0;
  const pct  = (ms) => Math.max(0, Math.min(100, ((ms - t0) / span) * 100));

  const phase      = getCurrentPhase(phases, now);
  const isDaylight = phase === 'daylight';

  return {
    phase,
    nowPct: pct(now.getTime()),   // clamped: 0% before astroBegin, 100% past sunrise
    ticks: [
      { key: 'astro',    label: 'Astronomical', time: phases.astroBegin,    pct: 0   },
      { key: 'nautical', label: 'Nautical',     time: phases.nauticalBegin, pct: pct(phases.nauticalBegin.getTime()) },
      { key: 'civil',    label: 'Civil',        time: phases.civilBegin,    pct: pct(phases.civilBegin.getTime()) },
      { key: 'sunrise',  label: 'Sunrise',      time: phases.sunrise,       pct: pct(phases.sunrise.getTime()) },
      { key: 'daylight', label: 'Day Light',    time: isDaylight ? now : null, pct: 100 },
    ],
  };
}

// ── Static fallback ticks (no location data) ─────────────────────────────

const STATIC_EVENING = [
  { key: 'daylight', label: 'Day Light',   pct: 0   },
  { key: 'sunset',   label: 'Sunset',      pct: 25  },
  { key: 'civil',    label: 'Civil',        pct: 50  },
  { key: 'nautical', label: 'Nautical',     pct: 75  },
  { key: 'astro',    label: 'Astronomical', pct: 100 },
];

const STATIC_MORNING = [
  { key: 'astro',    label: 'Astronomical', pct: 0   },
  { key: 'nautical', label: 'Nautical',     pct: 25  },
  { key: 'civil',    label: 'Civil',        pct: 50  },
  { key: 'sunrise',  label: 'Sunrise',      pct: 75  },
  { key: 'daylight', label: 'Day Light',    pct: 100 },
];

// ── Edge-aware transform for left/right anchor labels ────────────────────

function edgeTransform(pct) {
  if (pct === 0)   return 'translateX(0)';
  if (pct === 100) return 'translateX(-100%)';
  return 'translateX(-50%)';
}

function fmtTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ── Component ─────────────────────────────────────────────────────────────

export default function SunTimeBar() {
  const { phases, loading, error } = useSunTimes();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // PM (≥ noon) → evening bar; AM (< noon) → morning bar
  const isMorning = now.getHours() < 12;

  const bar = useMemo(() => {
    if (!phases) return null;
    return isMorning ? morningBar(phases, now) : eveningBar(phases, now);
  }, [phases, now, isMorning]);

  const ticks  = bar ? bar.ticks  : (isMorning ? STATIC_MORNING : STATIC_EVENING);
  const nowPct = bar ? bar.nowPct : null;
  const phase  = bar ? bar.phase  : null;
  const hasNow = nowPct !== null;

  return (
    <div
      className="sun-bar"
      aria-label={phase ? `Current light level: ${PHASE_LABEL[phase]}` : 'Light level — location unavailable'}
    >
      {/* ── Desktop: full timeline ───────────────────────────────────── */}
      <div className="sun-bar__desktop">
        <div className="sun-bar__body">

          {/* Track */}
          <div className="sun-bar__track">
            {hasNow && (
              <div className="sun-bar__fill" style={{ width: `${nowPct}%` }} />
            )}

            {ticks.map((t) => (
              <div
                key={t.key}
                className="sun-bar__tick-mark"
                style={{ left: `${t.pct}%`, transform: edgeTransform(t.pct) }}
              />
            ))}

            {hasNow && (
              <div className="sun-bar__now" style={{ left: `${nowPct}%` }}>
                <span className="sun-bar__now-text">NOW</span>
                <span className="sun-bar__now-pip" />
              </div>
            )}
          </div>

          {/* Phase labels + times */}
          <div className="sun-bar__labels">
            {ticks.map((t) => (
              <div
                key={t.key}
                className="sun-bar__phase-item"
                style={{ left: `${t.pct}%`, transform: edgeTransform(t.pct) }}
              >
                <span className="sun-bar__phase-name">{t.label}</span>
                {t.time && (
                  <span className="sun-bar__phase-time">{fmtTime(t.time)}</span>
                )}
              </div>
            ))}
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
