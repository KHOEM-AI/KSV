/**
 * KSV — Device catalog (own definitions, no third-party SDK or cloud)
 *
 * Which commands each kind of general device understands, with the valid
 * parameter ranges and Khmer names. The Safety Engine, Emergency Stop and RBAC
 * stay the only places that decide ALLOWED / BLOCKED — this file only describes
 * and validates the shape of a command.
 */

export type ParamSpec =
  | { type: "int"; min: number; max: number; unit?: string; optional?: boolean }
  | { type: "enum"; values: readonly (string | number)[]; optional?: boolean }
  | { type: "hex"; optional?: boolean };

export type CommandDef = { km: string; params?: Record<string, ParamSpec>; readOnly?: boolean };
export type DeviceTypeDef = { km: string; commands: Record<string, CommandDef> };

const int = (min: number, max: number, unit?: string): ParamSpec => ({ type: "int", min, max, unit });
const oneOf = (...values: (string | number)[]): ParamSpec => ({ type: "enum", values });
const hex = (): ParamSpec => ({ type: "hex" });
const opt = (s: ParamSpec): ParamSpec => ({ ...s, optional: true });
const value = (s: ParamSpec): Record<string, ParamSpec> => ({ value: s });

const ON_OFF: Record<string, CommandDef> = { ON: { km: "បើក" }, OFF: { km: "បិទ" } };
const STATUS: CommandDef = { km: "ស្ថានភាព", readOnly: true };
const SENSOR_METRICS = ["temperature", "humidity", "motion", "smoke", "gas", "water_leak", "door_contact", "light_level"];

export const DEVICE_CATALOG: Record<string, DeviceTypeDef> = {
  light: {
    km: "អំពូល",
    commands: {
      ...ON_OFF,
      TOGGLE: { km: "ប្តូរបើក/បិទ" },
      SET_BRIGHTNESS: { km: "កម្រិតពន្លឺ", params: value(int(0, 100, "%")) },
      SET_COLOR: { km: "ពណ៌", params: { hex: hex() } },
      SET_COLOR_TEMP: { km: "សីតុណ្ហភាពពណ៌", params: value(int(2000, 6500, "K")) },
      SET_SCENE: { km: "ទិដ្ឋភាព", params: value(oneOf("relax", "reading", "party", "night", "focus")) },
      GET_STATUS: STATUS,
    },
  },
  speaker: {
    km: "ឧបករណ៍ភ្លេង",
    commands: {
      ...ON_OFF,
      PLAY: { km: "ចាក់", params: { source: opt(oneOf("bluetooth", "aux", "wifi", "usb")) } },
      PAUSE: { km: "ផ្អាក" },
      STOP: { km: "ឈប់" },
      NEXT: { km: "បន្ទាប់" },
      PREVIOUS: { km: "ត្រឡប់ក្រោយ" },
      SET_VOLUME: { km: "កម្រិតសំឡេង", params: value(int(0, 100, "%")) },
      MUTE: { km: "បិទសំឡេង" },
      UNMUTE: { km: "បើកសំឡេង" },
      SET_SOURCE: { km: "ប្រភពសំឡេង", params: value(oneOf("bluetooth", "aux", "wifi", "usb")) },
      SET_EQ: { km: "សមតុល្យសំឡេង", params: value(oneOf("flat", "bass_boost", "vocal", "treble_boost")) },
      GET_STATUS: STATUS,
    },
  },
  subwoofer: {
    km: "ធុងបាស",
    commands: {
      ...ON_OFF,
      SET_VOLUME: { km: "កម្រិតសំឡេង", params: value(int(0, 100, "%")) },
      SET_BASS_LEVEL: { km: "កម្រិតបាស", params: value(int(-10, 10, "dB")) },
      SET_CROSSOVER: { km: "Crossover", params: value(int(40, 200, "Hz")) },
      SET_PHASE: { km: "Phase", params: value(oneOf(0, 180)) },
      MUTE: { km: "បិទសំឡេង" },
      UNMUTE: { km: "បើកសំឡេង" },
      GET_STATUS: STATUS,
    },
  },
  ac: {
    km: "ម៉ាស៊ីនត្រជាក់",
    commands: {
      ...ON_OFF,
      SET_TEMPERATURE: { km: "សីតុណ្ហភាព", params: value(int(16, 30, "°C")) },
      SET_MODE: { km: "របៀប", params: value(oneOf("cool", "heat", "dry", "fan", "auto")) },
      SET_FAN_SPEED: { km: "ល្បឿនកង្ហារ", params: value(oneOf("auto", "low", "medium", "high")) },
      SET_SWING: { km: "ផ្លុំបក់", params: value(oneOf("off", "vertical", "horizontal", "both")) },
      SET_TIMER: { km: "កំណត់ម៉ោងបិទ", params: value(int(1, 720, "min")) },
      GET_STATUS: STATUS,
    },
  },
  fridge: {
    km: "ទូទឹកកក",
    commands: {
      ...ON_OFF,
      SET_TEMPERATURE: { km: "សីតុណ្ហភាពទូទឹកកក", params: value(int(1, 8, "°C")) },
      SET_FREEZER_TEMPERATURE: { km: "សីតុណ្ហភាពកន្លែងកកកំណក", params: value(int(-24, -14, "°C")) },
      SET_MODE: { km: "របៀប", params: value(oneOf("normal", "eco", "turbo_cool", "vacation")) },
      GET_STATUS: STATUS,
    },
  },
  cooker: {
    km: "ឆ្នាំង",
    commands: {
      START: {
        km: "ចាប់ផ្តើមចម្អិន",
        params: {
          mode: oneOf("rice", "soup", "steam", "boil", "keep_warm", "fry"),
          durationMinutes: int(1, 480, "min"),
          temperature: opt(int(40, 250, "°C")),
        },
      },
      STOP: { km: "ឈប់ចម្អិន" },
      OFF: { km: "បិទ" },
      SET_TEMPERATURE: { km: "សីតុណ្ហភាព", params: value(int(40, 250, "°C")) },
      SET_POWER: { km: "កម្រិតកម្ដៅ", params: value(int(1, 10, "level")) },
      SET_TIMER: { km: "កំណត់ម៉ោងបិទ", params: value(int(1, 480, "min")) },
      GET_STATUS: STATUS,
    },
  },
  dishwasher: {
    km: "ម៉ាស៊ីនលាងចាន",
    commands: {
      START: {
        km: "ចាប់ផ្តើមលាង",
        params: { program: oneOf("eco", "normal", "intensive", "quick"), delayHours: opt(int(0, 24, "h")) },
      },
      PAUSE: { km: "ផ្អាក" },
      RESUME: { km: "បន្ត" },
      STOP: { km: "ឈប់" },
      GET_STATUS: STATUS,
    },
  },
  car: {
    km: "ឡាន",
    commands: {
      LOCK: { km: "ចាក់សោ" },
      UNLOCK: { km: "ដោះសោ" },
      HORN: { km: "ផ្លុំកញ្ចែ", params: { durationSeconds: opt(int(1, 5, "s")) } },
      FLASH_LIGHTS: { km: "បញ្ចេញភ្លើង" },
      START_ENGINE: { km: "បញ្ឆេះម៉ាស៊ីន", params: { durationMinutes: int(1, 15, "min") } },
      STOP_ENGINE: { km: "ពន្លត់ម៉ាស៊ីន" },
      SET_CABIN_TEMPERATURE: { km: "សីតុណ្ហភាពក្នុងឡាន", params: value(int(16, 30, "°C")) },
      GET_LOCATION: { km: "ទីតាំង", readOnly: true },
      GET_STATUS: STATUS,
    },
  },
  sensor: {
    km: "សិនស័រ",
    commands: {
      READ: { km: "អានតម្លៃ", readOnly: true, params: { metric: opt(oneOf(...SENSOR_METRICS)) } },
      GET_STATUS: STATUS,
      SET_INTERVAL: { km: "រយៈពេលរាយការណ៍", params: value(int(1, 3600, "s")) },
      SET_THRESHOLD: { km: "កម្រិតជូនដំណឹង", params: { metric: oneOf(...SENSOR_METRICS), value: int(-100, 10000) } },
    },
  },
  robot: {
    km: "មនុស្សយន្ត",
    commands: {
      EMERGENCY_STOP: { km: "ឈប់បន្ទាន់" },
      RESET_ESTOP: { km: "លុបស្ថានភាពឈប់បន្ទាន់" },
      START: { km: "ចាប់ផ្តើមដំណើរការ" },
      STOP: { km: "ឈប់" },
      RESUME: { km: "បន្ត" },
      MOVE: {
        km: "ធ្វើចលនា",
        params: {
          direction: oneOf("forward", "backward", "left", "right"),
          distanceCm: int(1, 500, "cm"),
          speedPercent: int(1, 100, "%"),
        },
      },
      SET_SPEED: { km: "ល្បឿន", params: value(int(1, 100, "%")) },
      GO_HOME: { km: "ត្រឡប់ទៅទីតាំងដើម" },
      GET_STATUS: STATUS,
    },
  },
};

// khoem-now device.type values that are the same kind of device as a catalog entry
const TYPE_ALIASES: Record<string, string> = { hvac: "ac", vehicle: "car" };

export function resolveCatalogType(deviceType: string): string | null {
  const key = String(deviceType ?? "").toLowerCase();
  const resolved = TYPE_ALIASES[key] ?? key;
  return Object.prototype.hasOwnProperty.call(DEVICE_CATALOG, resolved) ? resolved : null;
}

export function describeCatalog(typeKey?: string) {
  const one = (key: string) => ({
    type: key,
    km: DEVICE_CATALOG[key].km,
    commands: Object.entries(DEVICE_CATALOG[key].commands).map(([command, def]) => ({
      command,
      km: def.km,
      readOnly: !!def.readOnly,
      params: Object.fromEntries(
        Object.entries(def.params ?? {}).map(([name, s]) => [name, { ...s, required: !s.optional }]),
      ),
    })),
  });
  if (typeKey) return Object.prototype.hasOwnProperty.call(DEVICE_CATALOG, typeKey) ? one(typeKey) : null;
  return Object.keys(DEVICE_CATALOG).map(one);
}
