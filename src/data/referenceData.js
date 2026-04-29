// referenceData.js — index file that assembles all reference entries in display order
// Each entry lives in its own file under src/data/ref/

import turnOnOff        from "./ref/turn-on-off.js";
import adjustBrightness from "./ref/adjust-brightness.js";
import ceilingTurbo     from "./ref/ceiling-turbo.js";
import floorMoon        from "./ref/floor-moon.js";
import saveMemory       from "./ref/save-memory.js";
import smoothVsStepped  from "./ref/smooth-vs-stepped.js";
import lock             from "./ref/lock.js";
import unlock           from "./ref/unlock.js";
import switchToAdvanced from "./ref/switch-to-advanced.js";
import switchToSimple   from "./ref/switch-to-simple.js";
import configMenuHowTo  from "./ref/config-menu-how-to.js";
import rampConfig       from "./ref/ramp-config.js";
import rampExtrasConfig from "./ref/ramp-extras-config.js";
import simpleUiConfig   from "./ref/simple-ui-config.js";
import voltageConfig    from "./ref/voltage-config.js";
import thermalConfig    from "./ref/thermal-config.js";
import autolockConfig   from "./ref/autolock-config.js";
import tacticalConfig   from "./ref/tactical-config.js";
import miscConfig       from "./ref/misc-config.js";
import auxLedPattern    from "./ref/aux-led-pattern.js";
import auxLedColor      from "./ref/aux-led-color.js";
import postOffVoltage   from "./ref/post-off-voltage.js";
import batteryCheck     from "./ref/battery-check.js";
import strobeModes      from "./ref/strobe-modes.js";
import sunsetTimer      from "./ref/sunset-timer.js";
import momentaryMode    from "./ref/momentary-mode.js";
import tacticalMode     from "./ref/tactical-mode.js";
import beaconSos        from "./ref/beacon-sos.js";
import factoryReset     from "./ref/factory-reset.js";
import versionCheck     from "./ref/version-check.js";

export const referenceData = [
  // Basic operation
  turnOnOff,
  adjustBrightness,
  ceilingTurbo,
  floorMoon,
  saveMemory,
  smoothVsStepped,
  // Locking
  lock,
  unlock,
  // UI mode
  switchToAdvanced,
  switchToSimple,
  // Config menus
  configMenuHowTo,
  rampConfig,
  rampExtrasConfig,
  simpleUiConfig,
  voltageConfig,
  thermalConfig,
  autolockConfig,
  tacticalConfig,
  miscConfig,
  // Aux LEDs
  auxLedPattern,
  auxLedColor,
  postOffVoltage,
  // Special modes
  batteryCheck,
  strobeModes,
  sunsetTimer,
  momentaryMode,
  tacticalMode,
  beaconSos,
  // Factory reset / version
  factoryReset,
  versionCheck,
];
