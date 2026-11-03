/**
 * Generates the device-control user guide (Khmer) from the device catalog, so the
 * guide can never drift from what the system really accepts.
 *
 *   npm run guide:devices
 *
 * Writes:
 *   public/ksv-device-guide.html        (open at /ksv-device-guide.html, or link/iframe it from any UI)
 *   DOCUMENTATION/device-control-guide.md
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { DEVICE_CATALOG, TYPE_ALIASES, type ParamSpec } from "../src/core/devices/device.catalog.ts";

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const esc = (s: unknown) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------- shared data ----------
function sample(name: string, s: ParamSpec): unknown {
  if (s.type === "int") {
    if (name === "durationMinutes") return Math.min(30, s.max);
    return Math.round((s.min + s.max) / 2);
  }
  if (s.type === "enum") return s.values[0];
  return "#ff8800";
}

function describeParam(s: ParamSpec): string {
  if (s.type === "int") return `ចំនួនគត់ ${s.min} ដល់ ${s.max}${s.unit ? " " + s.unit : ""}`;
  if (s.type === "enum") return `ជ្រើសមួយ៖ ${s.values.join(" | ")}`;
  return "ពណ៌ HEX ដូច #ff8800";
}

// Safety Engine: appliance-class devices need payload.confirmed = true for these commands
const APPLIANCE_TYPES = new Set(["cooker", "heater", "dishwasher", "washer"]);
const CONFIRM_CMDS = new Set(["ON", "START", "SET_TEMPERATURE", "SET_POWER"]);
const needsConfirm = (type: string, command: string) => APPLIANCE_TYPES.has(type) && CONFIRM_CMDS.has(command);

function example(type: string, command: string, params?: Record<string, ParamSpec>): string {
  const payload: Record<string, unknown> = {};
  for (const [k, s] of Object.entries(params ?? {})) if (!s.optional) payload[k] = sample(k, s);
  if (needsConfirm(type, command)) payload.confirmed = true;
  return JSON.stringify(Object.keys(payload).length ? { commandType: command, payload } : { commandType: command });
}

const aliasesOf = (type: string) =>
  Object.entries(TYPE_ALIASES).filter(([, v]) => v === type).map(([k]) => k);

const types = Object.entries(DEVICE_CATALOG);
const totalCommands = types.reduce((n, [, t]) => n + Object.keys(t.commands).length, 0);

const INTRO_STEPS = [
  "ចូលប្រព័ន្ធ (ត្រូវមានសិទ្ធិ device:command)។",
  "ជ្រើសឧបករណ៍ ហើយផ្ញើ POST /api/devices/:id/commands ដោយមាន commandType និង payload (ប្រសិនបើពាក្យបញ្ជាត្រូវការ)។",
  "Safety Engine និង Emergency Stop ត្រួតពិនិត្យមុនគេ។ ពាក្យបញ្ជាត្រូវបានផ្ញើទៅឧបករណ៍ តាម Wi-Fi/HTTP (PROTO_WIFI) ឬ MQTT (PROTO_MQTT)។",
  "ពាក្យបញ្ជាជោគជ័យ តែពេលឧបករណ៍ពិតបញ្ជាក់ថាបានទទួលប៉ុណ្ណោះ។",
];

const SAFETY = [
  "ឧបករណ៍ប្រភេទ appliance (ឧបករណ៍កម្ដៅ/ចម្អិន) និង energy ត្រូវការ \"confirmed\": true ក្នុង payload សម្រាប់ ON, START, SET_TEMPERATURE, SET_POWER។ បើគ្មាន ប្រព័ន្ធឆ្លើយ 403 SAFETY_BLOCKED។",
  "ឧបករណ៍កម្ដៅ (ឆ្នាំង ឧបករណ៍កម្ដៅ) ត្រូវមាន durationMinutes ជានិច្ច ដើម្បីបិទស្វ័យប្រវត្តិ។",
  "ពេល Emergency Stop សកម្ម គ្រប់ពាក្យបញ្ជាត្រូវបានរារាំង (423 EMERGENCY_STOP_ACTIVE)។",
  "កាតាឡុកនេះគ្រាន់តែពណ៌នា និងត្រួតពិនិត្យទម្រង់ពាក្យបញ្ជា។ ការអនុញ្ញាត ឬរារាំង ជាការសម្រេចរបស់ Safety Engine ជានិច្ច។",
];

const RESPONSES: [string, string][] = [
  ["200", "ជោគជ័យ — ឧបករណ៍បានបញ្ជាក់ទទួល"],
  ["400 CATALOG_INVALID", "ទម្រង់ពាក្យបញ្ជាខុស (តែក្នុងរបៀប strict)"],
  ["403 SAFETY_BLOCKED", "Safety Engine រារាំង (ឧ. ខ្វះ confirmed)"],
  ["404 DEVICE_NOT_FOUND", "រកឧបករណ៍មិនឃើញ"],
  ["423 EMERGENCY_STOP_ACTIVE", "Emergency Stop កំពុងសកម្ម"],
];

const MODES: [string, string][] = [
  ["off (លំនាំដើម)", "មិនត្រួតពិនិត្យ — ដំណើរការដូចមុន"],
  ["warn", "សរសេរភាពខុសគ្នាក្នុង log ([CATALOG]) ប៉ុន្តែពាក្យបញ្ជានៅតែដើរ"],
  ["strict", "បដិសេធពាក្យបញ្ជាខុសទម្រង់ដោយ HTTP 400"],
];

// ---------- HTML ----------
const TITLE = "សៀវភៅណែនាំ៖ បញ្ជាឧបករណ៍ទូទៅ (KSV)";

function htmlType(key: string, t: (typeof types)[number][1]): string {
  const al = aliasesOf(key);
  const cmds = Object.entries(t.commands)
    .map(([cmd, def]) => {
      const params = Object.entries(def.params ?? {});
      const plist = params.length
        ? `<ul class="params">${params
            .map(([k, s]) => `<li><code>${esc(k)}</code> — ${esc(describeParam(s))}${s.optional ? ' <em>(ជម្រើស)</em>' : ""}</li>`)
            .join("")}</ul>`
        : "";
      return `<article class="cmd"><h4><code>${esc(cmd)}</code> <span>${esc(def.km)}</span>${def.readOnly ? ' <b class="ro">អានតែប៉ុណ្ណោះ</b>' : ""}${needsConfirm(key, cmd) ? ' <b class="ro">ត្រូវ confirmed</b>' : ""}</h4>${plist}<pre>${esc(example(key, cmd, def.params))}</pre></article>`;
    })
    .join("\n");
  return `<section class="type" id="${esc(key)}">
<h3>${esc(t.km)} <small><code>${esc(key)}</code></small></h3>
${al.length ? `<p class="alias">ឈ្មោះដែលស្គាល់ដូចគ្នា៖ ${al.map((a) => `<code>${esc(a)}</code>`).join(" ")}</p>` : ""}
${cmds}
</section>`;
}

const html = `<!doctype html>
<html lang="km">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<style>
:root{color-scheme:dark light;--bg:#0b0f14;--card:#121923;--line:#223044;--text:#e6edf5;--muted:#8fa3b8;--accent:#4cc2ff;--code:#0a0e13}
@media (prefers-color-scheme:light){:root{--bg:#f6f8fb;--card:#fff;--line:#d9e1ea;--text:#16202b;--muted:#566779;--accent:#0b6cb8;--code:#eef3f8}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 "Noto Sans Khmer","Khmer OS System",system-ui,sans-serif}
main{max-width:860px;margin:0 auto;padding:16px 14px 64px}
h1{font-size:1.45rem;margin:.6em 0 .2em}h2{font-size:1.2rem;margin:1.6em 0 .4em;color:var(--accent)}
h3{font-size:1.1rem;margin:0 0 .3em}h3 small{color:var(--muted);font-weight:400}h4{margin:0 0 .3em;font-size:1rem}h4 span{color:var(--muted);font-weight:400}
p,li{color:var(--text)}.sub{color:var(--muted);margin:0 0 1em}
code,pre{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.88rem}
code{background:var(--code);padding:1px 6px;border-radius:6px}
pre{background:var(--code);border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin:.4em 0 0;overflow-x:auto;white-space:pre}
.card,.type,.cmd{background:var(--card);border:1px solid var(--line);border-radius:12px}
.card{padding:10px 14px}.type{padding:14px;margin:14px 0}.cmd{padding:10px 12px;margin:10px 0;background:transparent}
.alias{color:var(--muted);margin:.2em 0 .6em}.params{margin:.2em 0 .2em;padding-left:1.2em;color:var(--muted)}
.ro{font-size:.72rem;font-weight:400;border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--muted)}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.toc a{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:4px 12px;text-decoration:none;color:var(--text);font-size:.92rem}
#q{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--text);font:inherit;margin:8px 0}
table{width:100%;border-collapse:collapse}td{border-top:1px solid var(--line);padding:6px 4px;vertical-align:top}td:first-child{white-space:nowrap;padding-right:12px}
.hidden{display:none}footer{color:var(--muted);font-size:.85rem;margin-top:32px}
</style>
</head>
<body>
<main>
<h1>${esc(TITLE)}</h1>
<p class="sub">${types.length} ប្រភេទឧបករណ៍ · ${totalCommands} ពាក្យបញ្ជា · បង្កើតស្វ័យប្រវត្តិពីកាតាឡុកពិតរបស់ប្រព័ន្ធ</p>

<h2>១. របៀបបញ្ជា</h2>
<div class="card"><ol>${INTRO_STEPS.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
<p>ឧទាហរណ៍ បើកអំពូល៖</p><pre>${esc('POST /api/devices/<id>/commands\n{"commandType":"ON"}')}</pre>
<p>កែកម្រិតពន្លឺ៖</p><pre>${esc('{"commandType":"SET_BRIGHTNESS","payload":{"value":60}}')}</pre></div>

<h2>២. សុវត្ថិភាព</h2>
<div class="card"><ul>${SAFETY.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>

<h2>៣. ប្រភេទឧបករណ៍</h2>
<input id="q" type="search" placeholder="ស្វែងរក៖ អំពូល, ឡាន, SET_VOLUME ..." aria-label="ស្វែងរក">
<nav class="toc">${types.map(([k, t]) => `<a href="#${esc(k)}">${esc(t.km)}</a>`).join("")}</nav>
${types.map(([k, t]) => htmlType(k, t)).join("\n")}

<h2>៤. លទ្ធផលដែលអាចទទួលបាន</h2>
<div class="card"><table>${RESPONSES.map(([a, b]) => `<tr><td><code>${esc(a)}</code></td><td>${esc(b)}</td></tr>`).join("")}</table></div>

<h2>៥. ការត្រួតពិនិត្យទម្រង់ពាក្យបញ្ជា</h2>
<div class="card"><p>កំណត់ក្នុង <code>.env</code> ដោយ <code>KSV_DEVICE_CATALOG</code>៖</p>
<table>${MODES.map(([a, b]) => `<tr><td><code>${esc(a)}</code></td><td>${esc(b)}</td></tr>`).join("")}</table>
<p>UI អាចអានកាតាឡុកផ្ទាល់ពី <code>GET /api/device-catalog</code> និង <code>GET /api/device-catalog/:type</code>។</p></div>

<footer>បង្កើតដោយ <code>npm run guide:devices</code> — កុំកែឯកសារនេះដោយដៃ ត្រូវកែកាតាឡុក (<code>device.catalog.ts</code>) ហើយបង្កើតឡើងវិញ។</footer>
</main>
<script>
(function(){var q=document.getElementById('q');if(!q)return;var s=[].slice.call(document.querySelectorAll('.type'));
q.addEventListener('input',function(){var v=q.value.trim().toLowerCase();s.forEach(function(e){e.classList.toggle('hidden',v!==''&&e.textContent.toLowerCase().indexOf(v)===-1)})})})();
</script>
</body>
</html>
`;

// ---------- Markdown ----------
const md = [
  `# ${TITLE}`,
  "",
  `${types.length} ប្រភេទឧបករណ៍ · ${totalCommands} ពាក្យបញ្ជា · បង្កើតស្វ័យប្រវត្តិពីកាតាឡុកពិតរបស់ប្រព័ន្ធ (\`npm run guide:devices\`)។`,
  "",
  "## ១. របៀបបញ្ជា",
  "",
  ...INTRO_STEPS.map((s, i) => `${i + 1}. ${s}`),
  "",
  "```json",
  "POST /api/devices/<id>/commands",
  '{"commandType":"SET_BRIGHTNESS","payload":{"value":60}}',
  "```",
  "",
  "## ២. សុវត្ថិភាព",
  "",
  ...SAFETY.map((s) => `- ${s}`),
  "",
  "## ៣. ប្រភេទឧបករណ៍",
  "",
  ...types.flatMap(([key, t]) => {
    const al = aliasesOf(key);
    return [
      `### ${t.km} (\`${key}\`)`,
      "",
      ...(al.length ? [`ឈ្មោះដែលស្គាល់ដូចគ្នា៖ ${al.map((a) => `\`${a}\``).join(", ")}`, ""] : []),
      ...Object.entries(t.commands).flatMap(([cmd, def]) => {
        const params = Object.entries(def.params ?? {});
        return [
          `- **\`${cmd}\`** — ${def.km}${def.readOnly ? " (អានតែប៉ុណ្ណោះ)" : ""}${needsConfirm(key, cmd) ? " (ត្រូវ confirmed)" : ""}`,
          ...params.map(([k, s]) => `  - \`${k}\`: ${describeParam(s)}${s.optional ? " (ជម្រើស)" : ""}`),
          `  - ឧទាហរណ៍: \`${example(key, cmd, def.params)}\``,
        ];
      }),
      "",
    ];
  }),
  "## ៤. លទ្ធផលដែលអាចទទួលបាន",
  "",
  ...RESPONSES.map(([a, b]) => `- \`${a}\` — ${b}`),
  "",
  "## ៥. ការត្រួតពិនិត្យទម្រង់ពាក្យបញ្ជា",
  "",
  "កំណត់ក្នុង `.env` ដោយ `KSV_DEVICE_CATALOG`៖",
  "",
  ...MODES.map(([a, b]) => `- \`${a}\` — ${b}`),
  "",
  "UI អាចអានកាតាឡុកពី `GET /api/device-catalog` និង `GET /api/device-catalog/:type`។",
  "",
].join("\n");

fs.mkdirSync(root("public"), { recursive: true });
fs.mkdirSync(root("DOCUMENTATION"), { recursive: true });
fs.writeFileSync(root("public/ksv-device-guide.html"), html);
fs.writeFileSync(root("DOCUMENTATION/device-control-guide.md"), md);
console.log(`✔ public/ksv-device-guide.html  (${types.length} types, ${totalCommands} commands)`);
console.log("✔ DOCUMENTATION/device-control-guide.md");
