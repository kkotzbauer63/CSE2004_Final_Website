/**
 * useReadout — React hook that plays back a flash sequence and exposes the
 * current brightness level for the simulator to display.
 *
 * Usage:
 *   import { encodeVoltage } from "../utils/readoutEncoder.js";
 *   import { useReadout } from "./useReadout.js";
 *
 *   const sequence = encodeVoltage(4.16);
 *   const { readoutLevel, isPlaying, stop } = useReadout(sequence, { loop: true });
 *
 * readoutLevel  — current Anduril brightness level (0 when off, or READOUT_LEVEL values)
 * isPlaying     — true while the sequence is actively running
 * stop()        — cancel playback immediately and reset level to 0
 *
 * The sequence restarts from the beginning whenever the `sequence` reference
 * changes, so callers can swap sequences by passing a new array object.
 * Passing null or an empty array stops playback.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { READOUT_LEVEL } from "../utils/readoutEncoder.js";

/**
 * @param {Array<{level: number, duration: number}>|null} sequence
 * @param {{ loop?: boolean, onComplete?: () => void }} [options]
 */
export function useReadout(sequence, { loop = false, onComplete } = {}) {
  const [readoutLevel, setReadoutLevel] = useState(READOUT_LEVEL.OFF);
  const [isPlaying,    setIsPlaying]    = useState(false);

  // Keep mutable refs so the scheduler callback always sees current values
  // without needing to be re-created on every render.
  const timerRef      = useRef(null);
  const activeRef     = useRef(false);   // guards against stale callbacks after cleanup
  const loopRef       = useRef(loop);
  const completeRef   = useRef(onComplete);

  loopRef.current   = loop;
  completeRef.current = onComplete;

  /** Cancel the current playback and reset to off immediately. */
  const stop = useCallback(() => {
    activeRef.current = false;
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setReadoutLevel(READOUT_LEVEL.OFF);
  }, []);

  useEffect(() => {
    // No sequence → stop any in-progress playback
    if (!sequence || sequence.length === 0) {
      stop();
      return;
    }

    // Mark this run as active; cleanup will flip it back to false
    activeRef.current = true;
    setIsPlaying(true);

    let index = 0;

    /**
     * Advance to the next frame.  Each call applies one frame's level,
     * then schedules itself after frame.duration ms.
     */
    function advance() {
      if (!activeRef.current) return;

      // End of sequence
      if (index >= sequence.length) {
        if (loopRef.current) {
          index = 0; // restart from the top
        } else {
          // Finished — clean up and notify caller
          activeRef.current = false;
          setIsPlaying(false);
          setReadoutLevel(READOUT_LEVEL.OFF);
          completeRef.current?.();
          return;
        }
      }

      const frame = sequence[index];
      setReadoutLevel(frame.level);
      index++;
      timerRef.current = setTimeout(advance, frame.duration);
    }

    advance();

    // Cleanup: stop the timer and flag the callback as stale
    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, [sequence, stop]);
  // Note: `loop` and `onComplete` are intentionally read via refs above so that
  // updating them does not restart the sequence mid-playback.

  return { readoutLevel, isPlaying, stop };
}
