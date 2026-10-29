// KSV — កាតាឡុកឧបករណ៍ទូទៅ (របស់ខ្លួនឯង)
// ប្រភេទឧបករណ៍ និងពាក្យបញ្ជាទាំងអស់កំណត់នៅទីនេះ — មិនពឹង SDK ឬ cloud របស់ម៉ាក/អ្នកដទៃទេ។
//
// ទម្រង់ command៖
//   km        ឈ្មោះខ្មែរ
//   params    { ឈ្មោះ: spec }  (spec ទាំងអស់ត្រូវការ លើកលែង optional:true)
//   confirm   true = ត្រូវមាន confirmed:true ទើបអនុញ្ញាត
//   confirmIf (params) => សារ | null  — ត្រូវបញ្ជាក់តែករណីខ្លះ (ឧ. សំឡេងខ្លាំង)
//   guard     "stationary" = ត្រូវដឹងថាឡានឈប់ (state.speedKmh === 0)
//   readOnly  true = គ្រាន់តែអានស្ថានភាព
//
// safetyClass ត្រូវនឹង deviceType ក្នុង khoem-now/src/core/safety/safety.engine.ts
// (appliance | vehicle | hvac | ...) ដើម្បីភ្ជាប់ Safety Engine នៅពេលក្រោយ។

const int = (min, max, unit) => ({ type: "int", min, max, unit });
const oneOf = (...values) => ({ type: "enum", values });
const hex = () => ({ type: "hex" });
const opt = (spec) => ({ ...spec, optional: true });
const value = (spec) => ({ value: spec });

const ON_OFF = {
  ON: { km: "បើក" },
  OFF: { km: "បិទ" },
};

const VOLUME_CONFIRM_ABOVE = 85;

export const DEVICE_TYPES = {
  // ───────── អំពូល ─────────
  light: {
    km: "អំពូល",
    safetyClass: "light",
    commands: {
      ...ON_OFF,
      TOGGLE: { km: "ប្តូរបើក/បិទ" },
      SET_BRIGHTNESS: { km: "កម្រិតពន្លឺ", params: value(int(0, 100, "%")) },
      SET_COLOR: { km: "ពណ៌", params: { hex: hex() } },
      SET_COLOR_TEMP: { km: "សីតុណ្ហភាពពណ៌", params: value(int(2000, 6500, "K")) },
      SET_SCENE: { km: "ទិដ្ឋភាព", params: value(oneOf("relax", "reading", "party", "night", "focus")) },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ភ្លេង / ឧបករណ៍សំឡេង ─────────
  speaker: {
    km: "ឧបករណ៍ភ្លេង",
    safetyClass: "media",
    commands: {
      ...ON_OFF,
      PLAY: { km: "ចាក់", params: { source: opt(oneOf("bluetooth", "aux", "wifi", "usb")) } },
      PAUSE: { km: "ផ្អាក" },
      STOP: { km: "ឈប់" },
      NEXT: { km: "បន្ទាប់" },
      PREVIOUS: { km: "ត្រឡប់ក្រោយ" },
      SET_VOLUME: {
        km: "កម្រិតសំឡេង",
        params: value(int(0, 100, "%")),
        confirmIf: (p) => (p.value > VOLUME_CONFIRM_ABOVE ? `សំឡេងលើស ${VOLUME_CONFIRM_ABOVE}% ត្រូវបញ្ជាក់` : null),
      },
      MUTE: { km: "បិទសំឡេង" },
      UNMUTE: { km: "បើកសំឡេង" },
      SET_SOURCE: { km: "ប្រភពសំឡេង", params: value(oneOf("bluetooth", "aux", "wifi", "usb")) },
      SET_EQ: { km: "សមតុល្យសំឡេង", params: value(oneOf("flat", "bass_boost", "vocal", "treble_boost")) },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ធុងបាស ─────────
  subwoofer: {
    km: "ធុងបាស",
    safetyClass: "media",
    commands: {
      ...ON_OFF,
      SET_VOLUME: {
        km: "កម្រិតសំឡេង",
        params: value(int(0, 100, "%")),
        confirmIf: (p) => (p.value > 80 ? "បាសលើស 80% ត្រូវបញ្ជាក់ (ប៉ះពាល់ត្រចៀក/អ្នកជិតខាង)" : null),
      },
      SET_BASS_LEVEL: { km: "កម្រិតបាស", params: value(int(-10, 10, "dB")) },
      SET_CROSSOVER: { km: "Crossover", params: value(int(40, 200, "Hz")) },
      SET_PHASE: { km: "Phase", params: value(oneOf(0, 180)) },
      MUTE: { km: "បិទសំឡេង" },
      UNMUTE: { km: "បើកសំឡេង" },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ម៉ាស៊ីនត្រជាក់ ─────────
  ac: {
    km: "ម៉ាស៊ីនត្រជាក់",
    safetyClass: "hvac",
    commands: {
      ...ON_OFF,
      SET_TEMPERATURE: { km: "សីតុណ្ហភាព", params: value(int(16, 30, "°C")) },
      SET_MODE: { km: "របៀប", params: value(oneOf("cool", "heat", "dry", "fan", "auto")) },
      SET_FAN_SPEED: { km: "ល្បឿនកង្ហារ", params: value(oneOf("auto", "low", "medium", "high")) },
      SET_SWING: { km: "ផ្លុំបក់", params: value(oneOf("off", "vertical", "horizontal", "both")) },
      SET_TIMER: { km: "កំណត់ម៉ោងបិទ", params: value(int(1, 720, "min")) },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ទូទឹកកក ─────────
  // មិនឱ្យបិទដោយចៃដន្យ — អាហារអាចខូច
  fridge: {
    km: "ទូទឹកកក",
    safetyClass: "cold_storage",
    commands: {
      ON: { km: "បើក" },
      OFF: { km: "បិទ", confirm: true },
      SET_TEMPERATURE: { km: "សីតុណ្ហភាពទូទឹកកក", params: value(int(1, 8, "°C")) },
      SET_FREEZER_TEMPERATURE: { km: "សីតុណ្ហភាពកន្លែងកកកំណក", params: value(int(-24, -14, "°C")) },
      SET_MODE: { km: "របៀប", params: value(oneOf("normal", "eco", "turbo_cool", "vacation")) },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ឆ្នាំង (ឆ្នាំងដាំបាយ/ចង្ក្រានអគ្គិសនី) ─────────
  // ឧបករណ៍កម្ដៅ៖ START ត្រូវមាន durationMinutes ជានិច្ច (បិទស្វ័យប្រវត្តិ) និងត្រូវបញ្ជាក់
  cooker: {
    km: "ឆ្នាំង",
    safetyClass: "appliance",
    commands: {
      START: {
        km: "ចាប់ផ្តើមចម្អិន",
        confirm: true,
        params: {
          mode: oneOf("rice", "soup", "steam", "boil", "keep_warm", "fry"),
          durationMinutes: int(1, 480, "min"),
          temperature: opt(int(40, 250, "°C")),
        },
      },
      STOP: { km: "ឈប់ចម្អិន" },
      OFF: { km: "បិទ" },
      SET_TEMPERATURE: { km: "សីតុណ្ហភាព", confirm: true, params: value(int(40, 250, "°C")) },
      SET_POWER: { km: "កម្រិតកម្ដៅ", confirm: true, params: value(int(1, 10, "level")) },
      SET_TIMER: { km: "កំណត់ម៉ោងបិទ", params: value(int(1, 480, "min")) },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ម៉ាស៊ីនលាងចាន ─────────
  dishwasher: {
    km: "ម៉ាស៊ីនលាងចាន",
    safetyClass: "appliance",
    commands: {
      START: {
        km: "ចាប់ផ្តើមលាង",
        confirm: true,
        params: {
          program: oneOf("eco", "normal", "intensive", "quick"),
          delayHours: opt(int(0, 24, "h")),
        },
      },
      PAUSE: { km: "ផ្អាក" },
      RESUME: { km: "បន្ត" },
      STOP: { km: "ឈប់" },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },

  // ───────── ឡាន ─────────
  // ពាក្យបញ្ជាគ្រោះថ្នាក់ (UNLOCK / START_ENGINE / STOP_ENGINE) ត្រូវតែដឹងថាឡានឈប់ជាក់ច្បាស់
  car: {
    km: "ឡាន",
    safetyClass: "vehicle",
    commands: {
      LOCK: { km: "ចាក់សោ" },
      UNLOCK: { km: "ដោះសោ", confirm: true, guard: "stationary" },
      HORN: { km: "ផ្លុំកញ្ចែ", params: { durationSeconds: opt(int(1, 5, "s")) } },
      FLASH_LIGHTS: { km: "បញ្ចេញភ្លើង" },
      START_ENGINE: {
        km: "បញ្ឆេះម៉ាស៊ីន",
        confirm: true,
        guard: "stationary",
        params: { durationMinutes: int(1, 15, "min") },
      },
      STOP_ENGINE: { km: "ពន្លត់ម៉ាស៊ីន", confirm: true, guard: "stationary" },
      SET_CABIN_TEMPERATURE: { km: "សីតុណ្ហភាពក្នុងឡាន", params: value(int(16, 30, "°C")) },
      GET_LOCATION: { km: "ទីតាំង", readOnly: true },
      GET_STATUS: { km: "ស្ថានភាព", readOnly: true },
    },
  },
};

// សង្ខេបសម្រាប់បង្ហាញក្នុង API (មិនបញ្ចូល function)
export function describeType(name) {
  const t = DEVICE_TYPES[name];
  if (!t) return null;
  const commands = Object.entries(t.commands).map(([cmd, def]) => ({
    command: cmd,
    km: def.km,
    readOnly: !!def.readOnly,
    needsConfirmation: !!def.confirm || !!def.confirmIf,
    guard: def.guard || null,
    params: Object.fromEntries(
      Object.entries(def.params || {}).map(([k, s]) => [k, { ...s, required: !s.optional }]),
    ),
  }));
  return { type: name, km: t.km, safetyClass: t.safetyClass, commands };
}

export const listTypes = () => Object.keys(DEVICE_TYPES).map((k) => ({ type: k, km: DEVICE_TYPES[k].km }));
