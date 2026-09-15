
### [2026-08-30] Server Startup — dotenv fixed, file sync gap found, MongoDB status unclear

**តភ្ជាប់អ្វីជាមួយអ្វី:**
1. `dotenv` package មិនទាន់ `npm install` ក្នុង Termux ទេ (`ERR_MODULE_NOT_FOUND: dotenv`)
   — បាន Install ដោយ `npm install dotenv`, **ដោះស្រាយបានជោគជ័យ** (Error នេះលែងលេចឡើងទៀត)។
2. `src/core/safety/safety.engine.ts` **មិនមាននៅលើ Termux Filesystem ទាល់តែសោះ**
   (`ERR_MODULE_NOT_FOUND`) — ថ្វីត្បិតតែ Code ត្រូវបានពិភាក្សា/សរសេររួចក្នុង
   Conversation ក៏ដោយ, File ពិតប្រាកដមិនធ្លាប់ត្រូវបាន Save ចូល Termux ទេ។
   **កែដោយសរសេរ File ដោយផ្ទាល់ (heredoc) ចូល Termux** — File ឥឡូវមាន 295 បន្ទាត់។

**⚠️ មេរៀនសំខាន់សម្រាប់ Developer/AI ថ្ងៃក្រោយ:** Code ដែល "សរសេររួច" ក្នុង
Chat/Conversation **មិនស្មើនឹង** Code ដែលមាននៅលើ Termux/GitHub ជាក់ស្តែងទេ។
តែងតែផ្ទៀងផ្ទាត់ដោយ `ls` ឬ `cat` ថា File ពិតជាមាននៅទីតាំងជាក់ស្តែង មុននឹងសន្មតថា
"បានធ្វើរួច"។

**ឯកសារពាក់ព័ន្ធ:** `src/server.ts`, `src/core/safety/safety.engine.ts`, `.env`

**របៀបផ្ទៀងផ្ទាត់:** រត់ `timeout 10 npx tsx src/server.ts`

**លទ្ធផលពិត:** **គ្មាន Output អ្វីសោះ** — គ្មានទាំង `[DB] Connected to MongoDB`,
គ្មានទាំង Error Message ណាមួយ។ Process ចប់ស្ងាត់ៗក្រោយ Timeout 10 វិនាទី។

**ស្ថានភាព:** ⚠️ AMBIGUOUS / NOT YET VERIFIED — **មិនអាចសន្និដ្ឋានថា Server
Start ជោគជ័យបានទេ** ព្រោះគ្មាន Log បញ្ជាក់ច្បាស់។ ករណីអាចមាន៖ (ក) Server កំពុង
ព្យាយាម Connect MongoDB ជាប់រហូតដល់ Timeout កាត់ចោល ឬ (ខ) បញ្ហា Output
Buffering។ **មិនត្រូវចាត់ទុកជា ✅ VERIFIED ទេ** រហូតដល់ឃើញ Log បញ្ជាក់ច្បាស់
មួយក្នុងចំណោម `[DB] Connected` ឬ `[DB] Connection failed`។

**ជំហានបន្ទាប់ត្រូវការ:** រត់ដោយគ្មាន `timeout` (ឬបង្កើន Timeout ដល់ 20-30
វិនាទី) ដើម្បីមើលថាតើ Log លេចឡើងទេពេលមិនកាត់ពេលដេញតាម។ ក៏ត្រូវផ្ទៀងផ្ទាត់ថា
MongoDB ដំណើរការនៅ Termux ដែរឬទេ (`pkg list-installed | grep mongo`)។

