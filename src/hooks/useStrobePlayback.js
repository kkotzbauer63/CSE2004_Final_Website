import { useEffect, useState } from "react";

const STROBE_STATES = new Set([
  "PARTY_STROBE",
  "TACTICAL_STROBE",
  "POLICE_STROBE",
  "LIGHTNING",
  "CANDLE",
  "BIKE_FLASHER",
]);

const BLINKY_PLAYBACK_STATES = new Set(["BEACON", "SOS"]);

const MAX_LEVEL = 150;
const STROBE_OFF_LEVEL = 0;
const STROBE_BRIGHTNESS = 150;
const PARTY_STROBE_BRIGHTNESS = 90;
const CANDLE_AMPLITUDE = 45;
const CANDLE_TICK_MS = 50;
const FRAME_MS = 16;
const BEACON_ON_MS = 100;
const DIT_LENGTH_MS = 200;

function clampLevel(level) {
  return Math.max(1, Math.min(MAX_LEVEL, Math.round(level || 75)));
}

function speedDelayFromLevel(level) {
  const clamped = clampLevel(level);
  return Math.round(120 - ((clamped - 1) / 149) * 96);
}

function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

function randomPowerOfTwo(maxExponentExclusive) {
  return 1 << randomInt(maxExponentExclusive);
}

function triangleWave(value) {
  const phase = value & 255;
  return phase < 128 ? phase * 2 : (255 - phase) * 2;
}

function auxDisplay(colorName) {
  const color = colorName === "red" ? "#ff3333" : "#3388ff";
  return { pattern: "high", colorName, color };
}

export function useStrobePlayback(currentState, level, { beaconSeconds = 10 } = {}) {
  const [playback, setPlayback] = useState({ level: null, auxDisplay: null });

  useEffect(() => {
    if (!STROBE_STATES.has(currentState) && !BLINKY_PLAYBACK_STATES.has(currentState)) {
      return;
    }

    let cancelled = false;
    let timer = null;

    const wait = (ms) => new Promise((resolve) => {
      timer = setTimeout(resolve, Math.max(0, ms));
    });

    const setIfActive = (nextLevel, nextAuxDisplay = null) => {
      if (!cancelled) setPlayback({ level: nextLevel, auxDisplay: nextAuxDisplay });
    };

    async function partyStrobe() {
      const delay = speedDelayFromLevel(level);
      while (!cancelled) {
        setIfActive(PARTY_STROBE_BRIGHTNESS);
        await wait(delay < 42 ? FRAME_MS : Math.max(FRAME_MS, 1));
        setIfActive(STROBE_OFF_LEVEL);
        await wait(delay);
      }
    }

    async function tacticalStrobe() {
      const delay = speedDelayFromLevel(level);
      while (!cancelled) {
        setIfActive(STROBE_BRIGHTNESS);
        await wait(Math.max(FRAME_MS, delay >> 1));
        setIfActive(STROBE_OFF_LEVEL);
        await wait(delay);
      }
    }

    async function policeStrobe() {
      const delay = 66;
      while (!cancelled) {
        for (let i = 0; i < 10 && !cancelled; i += 1) {
          setIfActive(STROBE_OFF_LEVEL, auxDisplay(i < 5 ? "red" : "blue"));
          await wait(delay >> 1);
          setIfActive(STROBE_OFF_LEVEL, { pattern: "off", colorName: null, color: null });
          await wait(delay);
        }
      }
    }

    async function lightningStorm() {
      while (!cancelled) {
        let randTime = randomInt(64);
        let brightness = 1 << randomInt(7);
        brightness += 1 << randomInt(5);
        brightness += randomInt(Math.max(1, brightness));
        brightness = Math.min(MAX_LEVEL, brightness);

        setIfActive(brightness);
        await wait(Math.max(FRAME_MS, randTime));

        const stepdown = Math.max(1, brightness >> 3);
        while (brightness > 1 && !cancelled) {
          await wait(Math.max(FRAME_MS, randTime));
          brightness = Math.max(0, brightness - stepdown);
          setIfActive(brightness);

          if (randomInt(4) === 0) {
            await wait(Math.max(FRAME_MS, randTime));
            setIfActive(brightness >> 1);
          }
        }

        randTime = randomPowerOfTwo(13);
        randTime += randomInt(randTime);
        setIfActive(STROBE_OFF_LEVEL);
        await wait(randTime);
      }
    }

    async function candleMode() {
      const maxCandleLevel = MAX_LEVEL - CANDLE_AMPLITUDE - 15;
      const base = Math.max(1, Math.min(maxCandleLevel, clampLevel(level)));
      const wave1Depth = Math.floor(30 * CANDLE_AMPLITUDE / 100);
      let wave2Depth = Math.floor(45 * CANDLE_AMPLITUDE / 100);
      let wave3Depth = Math.floor(25 * CANDLE_AMPLITUDE / 100);
      let wave1 = randomInt(256);
      let wave2 = randomInt(256);
      let wave3 = randomInt(256);
      let wave2Speed = randomInt(13);
      let tick = 0;

      while (!cancelled) {
        const add =
          ((triangleWave(wave1) * wave1Depth) >> 8) +
          ((triangleWave(wave2) * wave2Depth) >> 8) +
          ((triangleWave(wave3) * wave3Depth) >> 8);

        setIfActive(Math.min(MAX_LEVEL, base + add));

        if ((tick & 1) === 0) wave1 = (wave1 + (randomInt(2))) & 255;
        wave2 = (wave2 + wave2Speed) & 255;
        wave3 = (wave3 + randomInt(37)) & 255;

        if (randomInt(64) === 0) wave2Speed = randomInt(13);
        if (wave2Depth > 0 && randomInt(64) === 0) wave2Depth -= 1;
        if (randomInt(256) === 0) {
          wave2Depth = randomInt(Math.max(1, Math.floor(45 * CANDLE_AMPLITUDE / 100)));
          wave2 = 0;
        }
        if (wave3Depth > 2 && randomInt(32) === 0) wave3Depth -= 1;
        if (randomInt(128) === 0) {
          wave3Depth = randomInt(Math.max(1, Math.floor(25 * CANDLE_AMPLITUDE / 100)));
        }

        tick += 1;
        await wait(CANDLE_TICK_MS);
      }
    }

    async function bikeFlasher() {
      const base = clampLevel(level);
      const burst = Math.min(MAX_LEVEL, base << 1);
      while (!cancelled) {
        for (let i = 0; i < 4 && !cancelled; i += 1) {
          setIfActive(burst);
          await wait(FRAME_MS);
          setIfActive(base);
          await wait(65);
        }
        await wait(720);
        setIfActive(STROBE_OFF_LEVEL);
      }
    }

    async function beaconMode() {
      const base = clampLevel(level);
      const offMs = Math.max(0, Math.round(beaconSeconds * 1000) - BEACON_ON_MS);
      while (!cancelled) {
        setIfActive(base);
        await wait(BEACON_ON_MS);
        setIfActive(STROBE_OFF_LEVEL);
        await wait(offMs);
      }
    }

    async function sosMode() {
      const base = clampLevel(level);

      const sosBlink = async (count, isDah) => {
        for (let i = 0; i < count && !cancelled; i += 1) {
          setIfActive(base);
          await wait(isDah ? DIT_LENGTH_MS * 3 : DIT_LENGTH_MS);
          setIfActive(STROBE_OFF_LEVEL);
          await wait(DIT_LENGTH_MS);
        }
      };

      while (!cancelled) {
        await sosBlink(3, false);
        await sosBlink(3, true);
        await sosBlink(3, false);
        await wait(2000);
      }
    }

    const runners = {
      PARTY_STROBE: partyStrobe,
      TACTICAL_STROBE: tacticalStrobe,
      POLICE_STROBE: policeStrobe,
      LIGHTNING: lightningStorm,
      CANDLE: candleMode,
      BIKE_FLASHER: bikeFlasher,
      BEACON: beaconMode,
      SOS: sosMode,
    };

    runners[currentState]?.();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setPlayback({ level: null, auxDisplay: null });
    };
  }, [beaconSeconds, currentState, level]);

  return playback;
}
