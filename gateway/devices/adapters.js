// KSV — adapter ផ្ទាល់ខ្លួន៖ sim (សាកល្បង), http (ឧបករណ៍ក្នុង LAN), mqtt (broker ផ្ទាល់ខ្លួន)
// គ្មាន cloud របស់ម៉ាក/អ្នកដទៃ។ ឧបករណ៍ត្រូវទទួលពាក្យបញ្ជាតាមទម្រង់ KSV ផ្ទាល់៖
//   { "command": "SET_VOLUME", "params": { "value": 40 } }
import { getState, setState } from "./store.js";

const TIMEOUT_MS = 5000;
const camel = (s) => s.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// ── sim៖ ធ្វើត្រាប់ស្ថានភាព ដើម្បីសាកល្បងដោយគ្មានឧបករណ៍ពិត ──
function applyToState(state, command, params) {
  const s = { ...state, lastCommand: command };
  switch (command) {
    case "ON": s.power = true; break;
    case "OFF": s.power = false; s.running = false; break;
    case "TOGGLE": s.power = !s.power; break;
    case "MUTE": s.muted = true; break;
    case "UNMUTE": s.muted = false; break;
    case "PLAY": s.playing = true; Object.assign(s, params); break;
    case "PAUSE": s.playing = false; s.paused = true; break;
    case "RESUME": s.paused = false; break;
    case "STOP": s.playing = false; s.running = false; break;
    case "START": s.running = true; Object.assign(s, params); break;
    case "LOCK": s.locked = true; break;
    case "UNLOCK": s.locked = false; break;
    case "START_ENGINE": s.engineOn = true; Object.assign(s, params); break;
    case "STOP_ENGINE": s.engineOn = false; break;
    default:
      if (command.startsWith("SET_")) {
        s[camel(command.slice(4))] = "value" in params ? params.value : "hex" in params ? params.hex : params;
      }
  }
  return s;
}

const sim = {
  async send(device, { command, params }) {
    const next = setState(device.id, applyToState(getState(device.id), command, params));
    return { acknowledged: true, response: { simulated: true, state: next }, receivedAt: new Date() };
  },
};

// ── http៖ ឧបករណ៍ក្នុង LAN ទទួល POST <endpoint>/command ──
const http = {
  async send(device, { command, params }) {
    const url = new URL("/command", device.endpoint);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, params }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    let response;
    try { response = await res.json(); } catch { response = undefined; }
    return { acknowledged: res.ok, response, receivedAt: new Date() };
  },
};

// ── mqtt៖ publish ទៅ <prefix>/<deviceCode>/command លើ broker ផ្ទាល់ខ្លួន ──
// ចំណាំ៖ acknowledged = broker ទទួល publish (មិនមែនឧបករណ៍បញ្ជាក់ទេ)។
// ឧបករណ៍គួរឆ្លើយតាម <prefix>/<deviceCode>/status ឬ /telemetry (khoem-now ស្តាប់ topic ទាំងនោះរួចហើយ)។
let mqttClient = null;
async function getMqtt() {
  if (mqttClient) return mqttClient;
  const url = process.env.MQTT_BROKER_URL;
  if (!url) throw new Error("MQTT_BROKER_URL មិនទាន់កំណត់");
  let mqtt;
  try {
    mqtt = (await import("mqtt")).default;
  } catch {
    throw new Error("ត្រូវដំឡើង mqtt៖ npm i mqtt (ក្នុង gateway/)");
  }
  mqttClient = mqtt.connect(url, { reconnectPeriod: 5000, connectTimeout: 10000 });
  mqttClient.on("error", (e) => console.error("[KSV mqtt]", e.message));
  return mqttClient;
}

const mqttAdapter = {
  async send(device, { command, params }) {
    const client = await getMqtt();
    const prefix = process.env.MQTT_TOPIC_PREFIX || "ksv/devices";
    const topic = `${prefix}/${device.deviceCode}/command`;
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("mqtt publish timeout")), TIMEOUT_MS);
      client.publish(topic, JSON.stringify({ command, params }), { qos: 1 }, (err) => {
        clearTimeout(t);
        err ? reject(err) : resolve();
      });
    });
    return { acknowledged: true, response: { topic, note: "broker ទទួលហើយ — មិនទាន់ជាការបញ្ជាក់ពីឧបករណ៍" }, receivedAt: new Date() };
  },
};

export const adapters = { sim, http, mqtt: mqttAdapter };
