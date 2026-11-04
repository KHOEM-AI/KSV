# KHOEM-AI · ការបញ្ជាឧបករណ៍ទូទៅ (ម៉ាស៊ីនត្រជាក់ និងកង្ហារ)

## សង្ខេប

ក្នុង KSV UI (`khoem-now`, ច្រក 5173) ទំព័រ **ផ្ទាំងគ្រប់គ្រង** បង្ហាញក្រឡាឧបករណ៍ ៤៨ ក្នុង ៨ ក្រុម។
ក្រឡាដែលមានស៊ុមបៃតងអាចចុចបាន ហើយបើកផ្ទាំងបញ្ជា៖

| ក្រឡា | id | type | ពាក្យបញ្ជាដែលមានក្នុងផ្ទាំង |
|---|---|---|---|
| Air Conditioner | `ac-1` | `ac` | ON, OFF, SET_TEMPERATURE (16–30 °C), SET_MODE (cool heat dry fan auto) |
| Smart Fan | `fan-1` | `fan` | ON, OFF, SET_SPEED (1–3), SET_OSCILLATION (on/off) |
| Smart Light | `light-1` | `light` | ON, OFF, SET_BRIGHTNESS (25 50 75 100), SET_COLOR_TEMP (2700 4000 6500) |
| Smart Plug | `plug-1` | `generic` | ON, OFF |
| Smart TV | `tv-1` | `tv` | ON, OFF, SET_VOLUME (0–85 ក្នុងផ្ទាំង), MUTE/UNMUTE, SET_CHANNEL, SET_INPUT (antenna hdmi1 hdmi2) |
| Refrigerator | `fridge-1` | `fridge` | ON, OFF* (ត្រូវបញ្ជាក់), SET_TEMPERATURE (1–8), SET_FREEZER_TEMPERATURE (-24 ដល់ -14), SET_MODE |
| Washing Machine | `washer-1` | `washer` | START* (ត្រូវបញ្ជាក់), PAUSE, RESUME, STOP |
| Projector | `projector-1` | `generic` | ON, OFF |
| Printer | `printer-1` | `generic` | ON, OFF |

ក្រឡាផ្សេងទៀតបង្ហាញតែរូប និងឈ្មោះ មិនទាន់ភ្ជាប់ការបញ្ជាទេ។
`fan` ក៏មាន SET_TIMER (1–720 នាទី) ក្នុង gateway ប៉ុន្តែមិនទាន់មានប៊ូតុងក្នុងផ្ទាំង។

## របៀបដំណើរការ

    ផ្ទាំងបញ្ជា (browser)
      -> /ksv-api/...                      (Vite proxy ក្នុង khoem-now/vite.config.ts)
      -> http://127.0.0.1:4000/api/ksv/... (gateway, ដាក់ header x-gateway-token)
      -> adapter: sim | http | mqtt

- gateway ត្រូវការ `x-gateway-token` ហើយមិនអនុញ្ញាត browser ហៅផ្ទាល់ទេ។
- Vite proxy អានសោ `GATEWAY_TOKEN` ពី `gateway/.env` នៅខាង server ពេលចាប់ផ្តើម
  ហើយដាក់ចូល header ដោយខ្លួនឯង។ សោមិនទៅដល់ browser ទេ។
- ត្រូវចាប់ផ្តើម `ai` ឡើងវិញ បើប្តូរ `gateway/.env`។
- ពេលបើកផ្ទាំងលើកដំបូង UI ចុះឈ្មោះឧបករណ៍ដោយស្វ័យប្រវត្តិ (`ac-1`, `fan-1`) ជាមួយ adapter `sim`។

## ស្ថានភាពបច្ចុប្បន្ន៖ simulation

adapter `sim` ធ្វើត្រាប់ស្ថានភាពក្នុង gateway ប៉ុណ្ណោះ (ឧ. `power`, `temperature`, `mode`, `speed`)។
**មិនទាន់បញ្ជាឧបករណ៍ពិតទេ។** ផ្ទាំងបង្ហាញសារ "របៀបសាកល្បង (simulation)" ពេលប្រើ adapter នេះ។

## សាកល្បងដោយ curl (Termux)

    curl -s http://localhost:5173/ksv-api/types/fan
    curl -s http://localhost:5173/ksv-api/devices
    curl -s -X POST http://localhost:5173/ksv-api/devices/fan-1/command \
      -H 'content-type: application/json' -d '{"command":"ON"}'

proxy `/ksv-api` មានតែពេលរត់ Vite dev server (ច្រក 5173)។

## បន្ថែមឧបករណ៍ប្រភេទថ្មី

1. `gateway/devices/catalog.js` ៖ បន្ថែមប្រភេទក្នុង `DEVICE_TYPES` (ដូច `fan`) ហើយបន្ថែមជួរក្នុង `gateway/devices/README.md`។
2. `khoem-now/src/components/` ៖ ចម្លង `FanPanel.tsx` ទៅឈ្មោះថ្មី ប្តូរ `ID` ប្រភេទ និងប៊ូតុង។
3. `khoem-now/src/components/DeviceCategoryGrid.tsx` ៖ បន្ថែមឈ្មោះក្រឡាក្នុង `panelKey`
   បន្ថែមបន្ទាត់ `{open === '...' && <Panel .../>}` និង import។
4. ចាប់ផ្តើម `ai` ឡើងវិញ ហើយសាកល្បងដោយ `curl .../ksv-api/types/<type>`។

## ភ្ជាប់ឧបករណ៍ពិត

ប្តូរ adapter ពី `sim` ទៅ `http` ដោយចុះឈ្មោះឧបករណ៍ក្នុង LAN៖

    {"id":"fan-1","name":"កង្ហារ","type":"fan","adapter":"http","endpoint":"http://192.168.1.50"}

ឧបករណ៍ត្រូវទទួល `POST <endpoint>/command` ជា `{"command":"ON","params":{}}` ហើយឆ្លើយ HTTP 200។
endpoint ត្រូវជា LAN/localhost ប៉ុណ្ណោះ។ ជម្រើសសាមញ្ញ៖ ESP32 និង relay module។

## សុវត្ថិភាព

- ចរន្តភ្លើងផ្ទះ 220V គ្រោះថ្នាក់។ សាកល្បងដំបូងជាមួយកង្ហារ USB 5V ឬអំពូល LED។
  កុំភ្ជាប់ខ្សែភ្លើងផ្ទះដោយខ្លួនឯង បើមិនមានបទពិសោធន៍។
- proxy ប្រើសោ gateway ជំនួសអ្នកប្រើ។ កុំបើកច្រក 5173 ទៅបណ្តាញសាធារណៈ។
- ឯកសារ `gateway/.env` (មាន `GATEWAY_TOKEN`) មិនត្រូវ commit ទៅ GitHub។
- ពាក្យបញ្ជាដែលត្រូវការ `confirmed:true` (ឧ. `cooker START`) មិនទាន់មានក្នុងផ្ទាំង។ `fridge OFF` និង `washer START` មានក្នុងផ្ទាំង ហើយសួរបញ្ជាក់មុន។
- គ្រប់ពាក្យបញ្ជាកត់ក្នុង `gateway/data/command-log.jsonl`។

## ដោះស្រាយបញ្ហា

| រោគសញ្ញា | មូលហេតុ / ដំណោះស្រាយ |
|---|---|
| `curl .../ksv-api/types` ឆ្លើយ `unauthorized` | `gateway/.env` គ្មាន `GATEWAY_TOKEN` ឬមិនទាន់ចាប់ផ្តើម `ai` ឡើងវិញ |
| `curl` មិនឆ្លើយ / connection refused | gateway (4000) ឬ Vite (5173) មិនរត់ |
| ផ្ទាំងបង្ហាញ `404` ឬ `unknown type` | gateway មិនទាន់ restart បន្ទាប់ពីកែ `catalog.js` |
| ផ្ទាំងបង្ហាញកំហុសក្រហម | អានលេខកូដ (ឧ. `400 INVALID_PARAMS`) ហើយមើល `GET /api/ksv/types/<type>` |
