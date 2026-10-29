# KSV · ឧបករណ៍អេឡិចត្រូនិចទូទៅ (`/api/ksv`)

ពាក្យបញ្ជាសម្រាប់ឧបករណ៍ទូទៅ — **ផ្ទាល់ខ្លួនទាំងអស់**៖ កាតាឡុក ការពិនិត្យ និង adapter សរសេរដោយខ្លួនឯង
គ្មានពឹង cloud/SDK របស់ម៉ាកណាមួយទេ។ ត្រូវការ header `x-gateway-token` ដូច gateway ដទៃ។

## ប្រភេទឧបករណ៍

| type | ខ្មែរ | ពាក្យបញ្ជាសំខាន់ |
|---|---|---|
| `light` | អំពូល | ON OFF TOGGLE SET_BRIGHTNESS SET_COLOR SET_COLOR_TEMP SET_SCENE |
| `speaker` | ឧបករណ៍ភ្លេង | ON OFF PLAY PAUSE STOP NEXT PREVIOUS SET_VOLUME MUTE SET_SOURCE SET_EQ |
| `subwoofer` | ធុងបាស | ON OFF SET_VOLUME SET_BASS_LEVEL SET_CROSSOVER SET_PHASE MUTE |
| `ac` | ម៉ាស៊ីនត្រជាក់ | ON OFF SET_TEMPERATURE SET_MODE SET_FAN_SPEED SET_SWING SET_TIMER |
| `fridge` | ទូទឹកកក | SET_TEMPERATURE SET_FREEZER_TEMPERATURE SET_MODE OFF* |
| `cooker` | ឆ្នាំង | START* STOP OFF SET_TEMPERATURE* SET_POWER* SET_TIMER |
| `dishwasher` | ម៉ាស៊ីនលាងចាន | START* PAUSE RESUME STOP |
| `car` | ឡាន | LOCK UNLOCK* HORN FLASH_LIGHTS START_ENGINE* STOP_ENGINE* SET_CABIN_TEMPERATURE |

`*` = ត្រូវការ `"confirmed": true`។ មើលលម្អិតពេញលេញ៖ `GET /api/ksv/types/<type>`។

## ច្បាប់សុវត្ថិភាព

- ឧបករណ៍កម្ដៅ (`cooker`, `dishwasher`) ត្រូវបញ្ជាក់ជានិច្ច ហើយ `cooker START` ត្រូវមាន `durationMinutes` (បិទស្វ័យប្រវត្តិ)។
- `fridge OFF` ត្រូវបញ្ជាក់ (អាហារអាចខូច)។ សំឡេង `speaker` >85% / `subwoofer` >80% ត្រូវបញ្ជាក់។
- `car` UNLOCK / START_ENGINE / STOP_ENGINE ត្រូវដឹងថាឡានឈប់ (`speedKmh = 0`) — មិនដឹង ឬកំពុងរត់ = ហាម។
  ឧបករណ៍/ស្ពានត្រូវរាយការណ៍ស្ថានភាពតាម `POST /devices/:id/state`។
- param ត្រូវនៅក្នុង range ហើយ param ដែលមិនស្គាល់ត្រូវបដិសេធ។ គ្រប់ពាក្យបញ្ជាកត់ក្នុង `data/command-log.jsonl`។
- adapter `http` អនុញ្ញាតតែ LAN/localhost។

## Adapter

| adapter | ប្រើពេល |
|---|---|
| `sim` | សាកល្បង — ធ្វើត្រាប់ស្ថានភាព គ្មានឧបករណ៍ពិត |
| `http` | ឧបករណ៍ក្នុង LAN ទទួល `POST <endpoint>/command` ទម្រង់ `{"command","params"}` |
| `mqtt` | broker ផ្ទាល់ខ្លួន (`MQTT_BROKER_URL`) publish ទៅ `ksv/devices/<deviceCode>/command` |

## ឧទាហរណ៍ (Termux)

```bash
cd ~/KSV/gateway
set -a; . ./.env; set +a
H="x-gateway-token: $GATEWAY_TOKEN"; B=http://127.0.0.1:4000/api/ksv

# ចុះឈ្មោះឧបករណ៍ (sim)
curl -s -H "$H" -H 'content-type: application/json' $B/devices \
  -d '{"id":"bass-1","name":"ធុងបាសបន្ទប់ទទួលភ្ញៀវ","type":"subwoofer","adapter":"sim"}'

# កម្រិតបាស
curl -s -H "$H" -H 'content-type: application/json' $B/devices/bass-1/command \
  -d '{"command":"SET_BASS_LEVEL","params":{"value":4}}'

# ឆ្នាំងដាំបាយ ៣០ នាទី (ត្រូវ confirmed)
curl -s -H "$H" -H 'content-type: application/json' $B/devices/pot-1/command \
  -d '{"command":"START","params":{"mode":"rice","durationMinutes":30},"confirmed":true}'
```

ឧបករណ៍ក្នុង LAN៖ `{"id":"lamp-1","name":"អំពូល","type":"light","adapter":"http","endpoint":"http://192.168.1.50"}`

## សាកល្បង

```bash
cd gateway && npm install && npm test
```
