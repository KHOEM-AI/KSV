# សៀវភៅណែនាំ៖ បញ្ជាឧបករណ៍ទូទៅ (KSV)

22 ប្រភេទឧបករណ៍ · 158 ពាក្យបញ្ជា · បង្កើតស្វ័យប្រវត្តិពីកាតាឡុកពិតរបស់ប្រព័ន្ធ (`npm run guide:devices`)។

## ១. របៀបបញ្ជា

1. ចូលប្រព័ន្ធ (ត្រូវមានសិទ្ធិ device:command)។
2. ជ្រើសឧបករណ៍ ហើយផ្ញើ POST /api/devices/:id/commands ដោយមាន commandType និង payload (ប្រសិនបើពាក្យបញ្ជាត្រូវការ)។
3. Safety Engine និង Emergency Stop ត្រួតពិនិត្យមុនគេ។ ពាក្យបញ្ជាត្រូវបានផ្ញើទៅឧបករណ៍ តាម Wi-Fi/HTTP (PROTO_WIFI) ឬ MQTT (PROTO_MQTT)។
4. ពាក្យបញ្ជាជោគជ័យ តែពេលឧបករណ៍ពិតបញ្ជាក់ថាបានទទួលប៉ុណ្ណោះ។

```json
POST /api/devices/<id>/commands
{"commandType":"SET_BRIGHTNESS","payload":{"value":60}}
```

## ២. សុវត្ថិភាព

- ឧបករណ៍ប្រភេទ appliance (ឧបករណ៍កម្ដៅ/ចម្អិន) និង energy ត្រូវការ "confirmed": true ក្នុង payload សម្រាប់ ON, START, SET_TEMPERATURE, SET_POWER។ បើគ្មាន ប្រព័ន្ធឆ្លើយ 403 SAFETY_BLOCKED។
- ឧបករណ៍កម្ដៅ (ឆ្នាំង ឧបករណ៍កម្ដៅ) ត្រូវមាន durationMinutes ជានិច្ច ដើម្បីបិទស្វ័យប្រវត្តិ។
- ពេល Emergency Stop សកម្ម គ្រប់ពាក្យបញ្ជាត្រូវបានរារាំង (423 EMERGENCY_STOP_ACTIVE)។
- កាតាឡុកនេះគ្រាន់តែពណ៌នា និងត្រួតពិនិត្យទម្រង់ពាក្យបញ្ជា។ ការអនុញ្ញាត ឬរារាំង ជាការសម្រេចរបស់ Safety Engine ជានិច្ច។

## ៣. ប្រភេទឧបករណ៍

### អំពូល (`light`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `bulb`, `lamp`, `led`, `lighting`, `lights`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`TOGGLE`** — ប្តូរបើក/បិទ
  - ឧទាហរណ៍: `{"commandType":"TOGGLE"}`
- **`SET_BRIGHTNESS`** — កម្រិតពន្លឺ
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_BRIGHTNESS","payload":{"value":50}}`
- **`SET_COLOR`** — ពណ៌
  - `hex`: ពណ៌ HEX ដូច #ff8800
  - ឧទាហរណ៍: `{"commandType":"SET_COLOR","payload":{"hex":"#ff8800"}}`
- **`SET_COLOR_TEMP`** — សីតុណ្ហភាពពណ៌
  - `value`: ចំនួនគត់ 2000 ដល់ 6500 K
  - ឧទាហរណ៍: `{"commandType":"SET_COLOR_TEMP","payload":{"value":4250}}`
- **`SET_SCENE`** — ទិដ្ឋភាព
  - `value`: ជ្រើសមួយ៖ relax | reading | party | night | focus
  - ឧទាហរណ៍: `{"commandType":"SET_SCENE","payload":{"value":"relax"}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 1440 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":721}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ឧបករណ៍ភ្លេង (`speaker`)

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`PLAY`** — ចាក់
  - `source`: ជ្រើសមួយ៖ bluetooth | aux | wifi | usb (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"PLAY"}`
- **`PAUSE`** — ផ្អាក
  - ឧទាហរណ៍: `{"commandType":"PAUSE"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`NEXT`** — បន្ទាប់
  - ឧទាហរណ៍: `{"commandType":"NEXT"}`
- **`PREVIOUS`** — ត្រឡប់ក្រោយ
  - ឧទាហរណ៍: `{"commandType":"PREVIOUS"}`
- **`SET_VOLUME`** — កម្រិតសំឡេង
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_VOLUME","payload":{"value":50}}`
- **`MUTE`** — បិទសំឡេង
  - ឧទាហរណ៍: `{"commandType":"MUTE"}`
- **`UNMUTE`** — បើកសំឡេង
  - ឧទាហរណ៍: `{"commandType":"UNMUTE"}`
- **`SET_SOURCE`** — ប្រភពសំឡេង
  - `value`: ជ្រើសមួយ៖ bluetooth | aux | wifi | usb
  - ឧទាហរណ៍: `{"commandType":"SET_SOURCE","payload":{"value":"bluetooth"}}`
- **`SET_EQ`** — សមតុល្យសំឡេង
  - `value`: ជ្រើសមួយ៖ flat | bass_boost | vocal | treble_boost
  - ឧទាហរណ៍: `{"commandType":"SET_EQ","payload":{"value":"flat"}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ធុងបាស (`subwoofer`)

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_VOLUME`** — កម្រិតសំឡេង
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_VOLUME","payload":{"value":50}}`
- **`SET_BASS_LEVEL`** — កម្រិតបាស
  - `value`: ចំនួនគត់ -10 ដល់ 10 dB
  - ឧទាហរណ៍: `{"commandType":"SET_BASS_LEVEL","payload":{"value":0}}`
- **`SET_CROSSOVER`** — Crossover
  - `value`: ចំនួនគត់ 40 ដល់ 200 Hz
  - ឧទាហរណ៍: `{"commandType":"SET_CROSSOVER","payload":{"value":120}}`
- **`SET_PHASE`** — Phase
  - `value`: ជ្រើសមួយ៖ 0 | 180
  - ឧទាហរណ៍: `{"commandType":"SET_PHASE","payload":{"value":0}}`
- **`MUTE`** — បិទសំឡេង
  - ឧទាហរណ៍: `{"commandType":"MUTE"}`
- **`UNMUTE`** — បើកសំឡេង
  - ឧទាហរណ៍: `{"commandType":"UNMUTE"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ម៉ាស៊ីនត្រជាក់ (`ac`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `hvac`, `aircon`, `air_conditioner`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_TEMPERATURE`** — សីតុណ្ហភាព
  - `value`: ចំនួនគត់ 16 ដល់ 30 °C
  - ឧទាហរណ៍: `{"commandType":"SET_TEMPERATURE","payload":{"value":23}}`
- **`SET_MODE`** — របៀប
  - `value`: ជ្រើសមួយ៖ cool | heat | dry | fan | auto
  - ឧទាហរណ៍: `{"commandType":"SET_MODE","payload":{"value":"cool"}}`
- **`SET_FAN_SPEED`** — ល្បឿនកង្ហារ
  - `value`: ជ្រើសមួយ៖ auto | low | medium | high
  - ឧទាហរណ៍: `{"commandType":"SET_FAN_SPEED","payload":{"value":"auto"}}`
- **`SET_SWING`** — ផ្លុំបក់
  - `value`: ជ្រើសមួយ៖ off | vertical | horizontal | both
  - ឧទាហរណ៍: `{"commandType":"SET_SWING","payload":{"value":"off"}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 720 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":361}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ទូទឹកកក (`fridge`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `refrigerator`, `freezer`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_TEMPERATURE`** — សីតុណ្ហភាពទូទឹកកក
  - `value`: ចំនួនគត់ 1 ដល់ 8 °C
  - ឧទាហរណ៍: `{"commandType":"SET_TEMPERATURE","payload":{"value":5}}`
- **`SET_FREEZER_TEMPERATURE`** — សីតុណ្ហភាពកន្លែងកកកំណក
  - `value`: ចំនួនគត់ -24 ដល់ -14 °C
  - ឧទាហរណ៍: `{"commandType":"SET_FREEZER_TEMPERATURE","payload":{"value":-19}}`
- **`SET_MODE`** — របៀប
  - `value`: ជ្រើសមួយ៖ normal | eco | turbo_cool | vacation
  - ឧទាហរណ៍: `{"commandType":"SET_MODE","payload":{"value":"normal"}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ឆ្នាំង (`cooker`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `rice_cooker`, `pot`, `stove`

- **`START`** — ចាប់ផ្តើមចម្អិន (ត្រូវ confirmed)
  - `mode`: ជ្រើសមួយ៖ rice | soup | steam | boil | keep_warm | fry
  - `durationMinutes`: ចំនួនគត់ 1 ដល់ 480 min
  - `temperature`: ចំនួនគត់ 40 ដល់ 250 °C (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"START","payload":{"mode":"rice","durationMinutes":30,"confirmed":true}}`
- **`STOP`** — ឈប់ចម្អិន
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_TEMPERATURE`** — សីតុណ្ហភាព (ត្រូវ confirmed)
  - `value`: ចំនួនគត់ 40 ដល់ 250 °C
  - ឧទាហរណ៍: `{"commandType":"SET_TEMPERATURE","payload":{"value":145,"confirmed":true}}`
- **`SET_POWER`** — កម្រិតកម្ដៅ (ត្រូវ confirmed)
  - `value`: ចំនួនគត់ 1 ដល់ 10 level
  - ឧទាហរណ៍: `{"commandType":"SET_POWER","payload":{"value":6,"confirmed":true}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 480 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":241}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ម៉ាស៊ីនលាងចាន (`dishwasher`)

- **`START`** — ចាប់ផ្តើមលាង (ត្រូវ confirmed)
  - `program`: ជ្រើសមួយ៖ eco | normal | intensive | quick
  - `delayHours`: ចំនួនគត់ 0 ដល់ 24 h (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"START","payload":{"program":"eco","confirmed":true}}`
- **`PAUSE`** — ផ្អាក
  - ឧទាហរណ៍: `{"commandType":"PAUSE"}`
- **`RESUME`** — បន្ត
  - ឧទាហរណ៍: `{"commandType":"RESUME"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ឡាន (`car`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `vehicle`

- **`LOCK`** — ចាក់សោ
  - ឧទាហរណ៍: `{"commandType":"LOCK"}`
- **`UNLOCK`** — ដោះសោ
  - ឧទាហរណ៍: `{"commandType":"UNLOCK"}`
- **`HORN`** — ផ្លុំកញ្ចែ
  - `durationSeconds`: ចំនួនគត់ 1 ដល់ 5 s (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"HORN"}`
- **`FLASH_LIGHTS`** — បញ្ចេញភ្លើង
  - ឧទាហរណ៍: `{"commandType":"FLASH_LIGHTS"}`
- **`SET_HEADLIGHT`** — ភ្លើងមុខ
  - `value`: ជ្រើសមួយ៖ off | parking | low | high
  - ឧទាហរណ៍: `{"commandType":"SET_HEADLIGHT","payload":{"value":"off"}}`
- **`SET_TURN_SIGNAL`** — ភ្លើងសញ្ញា
  - `value`: ជ្រើសមួយ៖ off | left | right | hazard
  - ឧទាហរណ៍: `{"commandType":"SET_TURN_SIGNAL","payload":{"value":"off"}}`
- **`SET_INTERIOR_LIGHT`** — ភ្លើងក្នុងឡាន
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_INTERIOR_LIGHT","payload":{"value":50}}`
- **`START_ENGINE`** — បញ្ឆេះម៉ាស៊ីន
  - `durationMinutes`: ចំនួនគត់ 1 ដល់ 15 min
  - ឧទាហរណ៍: `{"commandType":"START_ENGINE","payload":{"durationMinutes":15}}`
- **`STOP_ENGINE`** — ពន្លត់ម៉ាស៊ីន
  - ឧទាហរណ៍: `{"commandType":"STOP_ENGINE"}`
- **`SET_CABIN_TEMPERATURE`** — សីតុណ្ហភាពក្នុងឡាន
  - `value`: ចំនួនគត់ 16 ដល់ 30 °C
  - ឧទាហរណ៍: `{"commandType":"SET_CABIN_TEMPERATURE","payload":{"value":23}}`
- **`GET_LOCATION`** — ទីតាំង (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_LOCATION"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ភ្លើងផ្លូវ (`street_light`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `streetlight`, `outdoor_light`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_BRIGHTNESS`** — កម្រិតពន្លឺ
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_BRIGHTNESS","payload":{"value":50}}`
- **`SET_MODE`** — របៀប
  - `value`: ជ្រើសមួយ៖ auto | manual | schedule
  - ឧទាហរណ៍: `{"commandType":"SET_MODE","payload":{"value":"auto"}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 1440 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":721}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ទូរទស្សន៍ (`tv`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `television`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_VOLUME`** — កម្រិតសំឡេង
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_VOLUME","payload":{"value":50}}`
- **`MUTE`** — បិទសំឡេង
  - ឧទាហរណ៍: `{"commandType":"MUTE"}`
- **`UNMUTE`** — បើកសំឡេង
  - ឧទាហរណ៍: `{"commandType":"UNMUTE"}`
- **`SET_CHANNEL`** — ឆានែល
  - `value`: ចំនួនគត់ 1 ដល់ 999
  - ឧទាហរណ៍: `{"commandType":"SET_CHANNEL","payload":{"value":500}}`
- **`SET_INPUT`** — ប្រភពរូបភាព
  - `value`: ជ្រើសមួយ៖ antenna | hdmi1 | hdmi2 | hdmi3 | av | usb
  - ឧទាហរណ៍: `{"commandType":"SET_INPUT","payload":{"value":"antenna"}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### កង្ហារ (`fan`)

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_SPEED`** — ល្បឿន
  - `value`: ចំនួនគត់ 1 ដល់ 5 level
  - ឧទាហរណ៍: `{"commandType":"SET_SPEED","payload":{"value":3}}`
- **`SET_OSCILLATION`** — ផ្លុំបក់
  - `value`: ជ្រើសមួយ៖ on | off
  - ឧទាហរណ៍: `{"commandType":"SET_OSCILLATION","payload":{"value":"on"}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 720 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":361}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ម៉ាស៊ីនបោកគក់ (`washer`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `washing_machine`

- **`START`** — ចាប់ផ្តើមបោក (ត្រូវ confirmed)
  - `program`: ជ្រើសមួយ៖ cotton | synthetic | delicate | quick | eco
  - `delayHours`: ចំនួនគត់ 0 ដល់ 24 h (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"START","payload":{"program":"cotton","confirmed":true}}`
- **`PAUSE`** — ផ្អាក
  - ឧទាហរណ៍: `{"commandType":"PAUSE"}`
- **`RESUME`** — បន្ត
  - ឧទាហរណ៍: `{"commandType":"RESUME"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ឧបករណ៍កម្ដៅ (`heater`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `water_heater`, `boiler`

- **`START`** — ចាប់ផ្តើមកម្ដៅ (ត្រូវ confirmed)
  - `durationMinutes`: ចំនួនគត់ 1 ដល់ 480 min
  - `temperature`: ចំនួនគត់ 20 ដល់ 80 °C (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"START","payload":{"durationMinutes":30,"confirmed":true}}`
- **`STOP`** — ឈប់កម្ដៅ
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_TEMPERATURE`** — សីតុណ្ហភាព (ត្រូវ confirmed)
  - `value`: ចំនួនគត់ 20 ដល់ 80 °C
  - ឧទាហរណ៍: `{"commandType":"SET_TEMPERATURE","payload":{"value":50,"confirmed":true}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 480 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":241}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ម៉ាស៊ីនបូមទឹក (`pump`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `water_pump`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`SET_SPEED`** — ល្បឿន
  - `value`: ចំនួនគត់ 10 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_SPEED","payload":{"value":55}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 720 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":361}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ម៉ូទ័រ (`motor`)

- **`START`** — ចាប់ផ្តើម
  - `durationMinutes`: ចំនួនគត់ 1 ដល់ 1440 min (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"START"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`EMERGENCY_STOP`** — ឈប់បន្ទាន់
  - ឧទាហរណ៍: `{"commandType":"EMERGENCY_STOP"}`
- **`SET_SPEED`** — ល្បឿន
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_SPEED","payload":{"value":50}}`
- **`SET_DIRECTION`** — ទិស
  - `value`: ជ្រើសមួយ៖ forward | reverse
  - ឧទាហរណ៍: `{"commandType":"SET_DIRECTION","payload":{"value":"forward"}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ទ្វារ (`door`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `lock`, `smart_lock`

- **`LOCK`** — ចាក់សោ
  - ឧទាហរណ៍: `{"commandType":"LOCK"}`
- **`UNLOCK`** — ដោះសោ
  - ឧទាហរណ៍: `{"commandType":"UNLOCK"}`
- **`OPEN`** — បើក
  - ឧទាហរណ៍: `{"commandType":"OPEN"}`
- **`CLOSE`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"CLOSE"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ទ្វាររំកិល / វាំងនន (`gate`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `garage`, `shutter`, `curtain`, `blind`

- **`OPEN`** — បើក
  - ឧទាហរណ៍: `{"commandType":"OPEN"}`
- **`CLOSE`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"CLOSE"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`SET_POSITION`** — ទីតាំង
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_POSITION","payload":{"value":50}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### កាមេរ៉ា (`camera`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `cctv`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`START_RECORDING`** — ចាប់ផ្តើមថត
  - ឧទាហរណ៍: `{"commandType":"START_RECORDING"}`
- **`STOP_RECORDING`** — ឈប់ថត
  - ឧទាហរណ៍: `{"commandType":"STOP_RECORDING"}`
- **`SET_MODE`** — របៀប
  - `value`: ជ្រើសមួយ៖ day | night | auto
  - ឧទាហរណ៍: `{"commandType":"SET_MODE","payload":{"value":"day"}}`
- **`SET_RESOLUTION`** — គុណភាព
  - `value`: ជ្រើសមួយ៖ 720p | 1080p | 4k
  - ឧទាហរណ៍: `{"commandType":"SET_RESOLUTION","payload":{"value":"720p"}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ម៉ូតូ (`motorcycle`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `motorbike`, `scooter`

- **`LOCK`** — ចាក់សោ
  - ឧទាហរណ៍: `{"commandType":"LOCK"}`
- **`UNLOCK`** — ដោះសោ
  - ឧទាហរណ៍: `{"commandType":"UNLOCK"}`
- **`HORN`** — ផ្លុំកញ្ចែ
  - `durationSeconds`: ចំនួនគត់ 1 ដល់ 5 s (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"HORN"}`
- **`FLASH_LIGHTS`** — បញ្ចេញភ្លើង
  - ឧទាហរណ៍: `{"commandType":"FLASH_LIGHTS"}`
- **`SET_HEADLIGHT`** — ភ្លើងមុខ
  - `value`: ជ្រើសមួយ៖ off | parking | low | high
  - ឧទាហរណ៍: `{"commandType":"SET_HEADLIGHT","payload":{"value":"off"}}`
- **`SET_TURN_SIGNAL`** — ភ្លើងសញ្ញា
  - `value`: ជ្រើសមួយ៖ off | left | right | hazard
  - ឧទាហរណ៍: `{"commandType":"SET_TURN_SIGNAL","payload":{"value":"off"}}`
- **`START_ENGINE`** — បញ្ឆេះម៉ាស៊ីន
  - `durationMinutes`: ចំនួនគត់ 1 ដល់ 15 min
  - ឧទាហរណ៍: `{"commandType":"START_ENGINE","payload":{"durationMinutes":15}}`
- **`STOP_ENGINE`** — ពន្លត់ម៉ាស៊ីន
  - ឧទាហរណ៍: `{"commandType":"STOP_ENGINE"}`
- **`GET_LOCATION`** — ទីតាំង (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_LOCATION"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### ឧបករណ៍ទូទៅ (`generic`)

ឈ្មោះដែលស្គាល់ដូចគ្នា៖ `switch`, `outlet`, `plug`, `socket`, `relay`, `device`

- **`ON`** — បើក
  - ឧទាហរណ៍: `{"commandType":"ON"}`
- **`OFF`** — បិទ
  - ឧទាហរណ៍: `{"commandType":"OFF"}`
- **`TOGGLE`** — ប្តូរបើក/បិទ
  - ឧទាហរណ៍: `{"commandType":"TOGGLE"}`
- **`SET_LEVEL`** — កម្រិត
  - `value`: ចំនួនគត់ 0 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_LEVEL","payload":{"value":50}}`
- **`SET_TIMER`** — កំណត់ម៉ោងបិទ
  - `value`: ចំនួនគត់ 1 ដល់ 1440 min
  - ឧទាហរណ៍: `{"commandType":"SET_TIMER","payload":{"value":721}}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

### សិនស័រ (`sensor`)

- **`READ`** — អានតម្លៃ (អានតែប៉ុណ្ណោះ)
  - `metric`: ជ្រើសមួយ៖ temperature | humidity | motion | smoke | gas | water_leak | door_contact | light_level (ជម្រើស)
  - ឧទាហរណ៍: `{"commandType":"READ"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`
- **`SET_INTERVAL`** — រយៈពេលរាយការណ៍
  - `value`: ចំនួនគត់ 1 ដល់ 3600 s
  - ឧទាហរណ៍: `{"commandType":"SET_INTERVAL","payload":{"value":1801}}`
- **`SET_THRESHOLD`** — កម្រិតជូនដំណឹង
  - `metric`: ជ្រើសមួយ៖ temperature | humidity | motion | smoke | gas | water_leak | door_contact | light_level
  - `value`: ចំនួនគត់ -100 ដល់ 10000
  - ឧទាហរណ៍: `{"commandType":"SET_THRESHOLD","payload":{"metric":"temperature","value":4950}}`

### មនុស្សយន្ត (`robot`)

- **`EMERGENCY_STOP`** — ឈប់បន្ទាន់
  - ឧទាហរណ៍: `{"commandType":"EMERGENCY_STOP"}`
- **`RESET_ESTOP`** — លុបស្ថានភាពឈប់បន្ទាន់
  - ឧទាហរណ៍: `{"commandType":"RESET_ESTOP"}`
- **`START`** — ចាប់ផ្តើមដំណើរការ
  - ឧទាហរណ៍: `{"commandType":"START"}`
- **`STOP`** — ឈប់
  - ឧទាហរណ៍: `{"commandType":"STOP"}`
- **`RESUME`** — បន្ត
  - ឧទាហរណ៍: `{"commandType":"RESUME"}`
- **`MOVE`** — ធ្វើចលនា
  - `direction`: ជ្រើសមួយ៖ forward | backward | left | right
  - `distanceCm`: ចំនួនគត់ 1 ដល់ 500 cm
  - `speedPercent`: ចំនួនគត់ 1 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"MOVE","payload":{"direction":"forward","distanceCm":251,"speedPercent":51}}`
- **`SET_SPEED`** — ល្បឿន
  - `value`: ចំនួនគត់ 1 ដល់ 100 %
  - ឧទាហរណ៍: `{"commandType":"SET_SPEED","payload":{"value":51}}`
- **`GO_HOME`** — ត្រឡប់ទៅទីតាំងដើម
  - ឧទាហរណ៍: `{"commandType":"GO_HOME"}`
- **`GET_STATUS`** — ស្ថានភាព (អានតែប៉ុណ្ណោះ)
  - ឧទាហរណ៍: `{"commandType":"GET_STATUS"}`

## ៤. លទ្ធផលដែលអាចទទួលបាន

- `200` — ជោគជ័យ — ឧបករណ៍បានបញ្ជាក់ទទួល
- `400 CATALOG_INVALID` — ទម្រង់ពាក្យបញ្ជាខុស (តែក្នុងរបៀប strict)
- `403 SAFETY_BLOCKED` — Safety Engine រារាំង (ឧ. ខ្វះ confirmed)
- `404 DEVICE_NOT_FOUND` — រកឧបករណ៍មិនឃើញ
- `423 EMERGENCY_STOP_ACTIVE` — Emergency Stop កំពុងសកម្ម

## ៥. ការត្រួតពិនិត្យទម្រង់ពាក្យបញ្ជា

កំណត់ក្នុង `.env` ដោយ `KSV_DEVICE_CATALOG`៖

- `off (លំនាំដើម)` — មិនត្រួតពិនិត្យ — ដំណើរការដូចមុន
- `warn` — សរសេរភាពខុសគ្នាក្នុង log ([CATALOG]) ប៉ុន្តែពាក្យបញ្ជានៅតែដើរ
- `strict` — បដិសេធពាក្យបញ្ជាខុសទម្រង់ដោយ HTTP 400

UI អាចអានកាតាឡុកពី `GET /api/device-catalog` និង `GET /api/device-catalog/:type`។
