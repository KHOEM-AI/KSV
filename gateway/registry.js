// API ខាងក្រៅ (របស់អ្នកដទៃ) — បិទជាលំនាំដើម។ បើកដោយ ALLOW_EXTERNAL=1 ក្នុង gateway/.env
// qr ត្រូវបានជំនួសដោយ /api/qr ផ្ទាល់ខ្លួន (server.js) — លែងហៅ api.qrserver.com
// nominatim/osrm ត្រូវការទិន្នន័យផែនទី៖ ចង់ផ្ទាល់ខ្លួនពេញលេញ ត្រូវ self-host Nominatim/OSRM
//   ហើយប្តូរ target ខាងក្រោមទៅ http://127.0.0.1:<port>/ ទើបដក external:true ចេញ
export const registry = {
  nominatim: { target: "https://nominatim.openstreetmap.org/search", keyEnv: null, external: true, extraHeaders: { "User-Agent": "KHOEM-AI-gateway/1.0 (personal project)" } },
  osrm:      { target: "https://router.project-osrm.org/route/v1/driving/", keyEnv: null, external: true },
};
// API ផ្ទាល់ខ្លួនរបស់បង៖ បញ្ជូនបន្តទាំង path ដែលនៅក្រោម
export const local = {
  ai:    "http://127.0.0.1:8787",
  khoem: "http://127.0.0.1:8790",
};
