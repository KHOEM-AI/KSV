/**
 * KHOEM NOW — Global 195 Language / Vocabulary Data Layer
 * ------------------------------------------------------------------
 * This module contains data and small lookup/validation helpers only.
 *
 * Intent interpretation, reasoning, safety, authorization, and device
 * behavior belong in the Brain and service layers. This file must not:
 *   - dispatch commands;
 *   - grant permissions;
 *   - claim that a device is online;
 *   - infer physical execution; or
 *   - silently create a language-specific source file.
 *
 * Country codes use ISO 3166-1 alpha-2 style codes.
 * Language codes use ISO 639-1 where available.
 */

// =====================================================================
// 1. Public types
// =====================================================================

export type GlobalVocabularyCategory =
  | "greeting"
  | "question"
  | "answer"
  | "command"
  | "person"
  | "family"
  | "food"
  | "drink"
  | "place"
  | "travel"
  | "work"
  | "business"
  | "technology"
  | "device"
  | "weather"
  | "time"
  | "date"
  | "number"
  | "emotion"
  | "money"
  | "shopping"
  | "education"
  | "transport"
  | "security"
  | "system"
  | "social"
  | "common"
  | "slang";

export interface GlobalCountryEntry {
  code: string;
  name: string;
  languages: readonly string[];
}

export interface GlobalLanguageEntry {
  code: string;
  name: string;
  nativeName: string;
  countries: readonly string[];
}

export interface GlobalVocabularyEntry {
  term: string;
  language: string;
  countries: readonly string[];
  category: GlobalVocabularyCategory;
  aliases?: readonly string[];
}

export interface VocabularyValidationResult {
  valid: boolean;
  count: number;
  duplicateKeys: string[];
  invalidCountryCodes: string[];
  invalidLanguageCodes: string[];
  reason: string;
}

export interface VocabularyMatch {
  entry: GlobalVocabularyEntry;
  matchedText: string;
  matchedBy: "term" | "alias";
}

// =====================================================================
// 2. Global country registry — exactly 195 entries
// =====================================================================

export const GLOBAL_195_COUNTRIES: readonly GlobalCountryEntry[] = [
  { code: "AF", name: "Afghanistan", languages: ["ps", "fa"] },
  { code: "AL", name: "Albania", languages: ["sq"] },
  { code: "DZ", name: "Algeria", languages: ["ar", "fr"] },
  { code: "AD", name: "Andorra", languages: ["ca"] },
  { code: "AO", name: "Angola", languages: ["pt"] },
  { code: "AG", name: "Antigua and Barbuda", languages: ["en"] },
  { code: "AR", name: "Argentina", languages: ["es"] },
  { code: "AM", name: "Armenia", languages: ["hy"] },
  { code: "AU", name: "Australia", languages: ["en"] },
  { code: "AT", name: "Austria", languages: ["de"] },
  { code: "AZ", name: "Azerbaijan", languages: ["az"] },
  { code: "BS", name: "Bahamas", languages: ["en"] },
  { code: "BH", name: "Bahrain", languages: ["ar"] },
  { code: "BD", name: "Bangladesh", languages: ["bn"] },
  { code: "BB", name: "Barbados", languages: ["en"] },
  { code: "BY", name: "Belarus", languages: ["be", "ru"] },
  { code: "BE", name: "Belgium", languages: ["nl", "fr", "de"] },
  { code: "BZ", name: "Belize", languages: ["en"] },
  { code: "BJ", name: "Benin", languages: ["fr"] },
  { code: "BT", name: "Bhutan", languages: ["dz"] },
  { code: "BO", name: "Bolivia", languages: ["es"] },
  { code: "BA", name: "Bosnia and Herzegovina", languages: ["bs", "hr", "sr"] },
  { code: "BW", name: "Botswana", languages: ["en"] },
  { code: "BR", name: "Brazil", languages: ["pt"] },
  { code: "BN", name: "Brunei", languages: ["ms"] },
  { code: "BG", name: "Bulgaria", languages: ["bg"] },
  { code: "BF", name: "Burkina Faso", languages: ["fr"] },
  { code: "BI", name: "Burundi", languages: ["fr", "rn"] },
  { code: "CV", name: "Cabo Verde", languages: ["pt"] },
  { code: "KH", name: "Cambodia", languages: ["km"] },
  { code: "CM", name: "Cameroon", languages: ["fr", "en"] },
  { code: "CA", name: "Canada", languages: ["en", "fr"] },
  { code: "CF", name: "Central African Republic", languages: ["fr", "sg"] },
  { code: "TD", name: "Chad", languages: ["fr", "ar"] },
  { code: "CL", name: "Chile", languages: ["es"] },
  { code: "CN", name: "China", languages: ["zh"] },
  { code: "CO", name: "Colombia", languages: ["es"] },
  { code: "KM", name: "Comoros", languages: ["ar", "fr"] },
  { code: "CG", name: "Republic of the Congo", languages: ["fr"] },
  { code: "CR", name: "Costa Rica", languages: ["es"] },
  { code: "CI", name: "Cote d'Ivoire", languages: ["fr"] },
  { code: "HR", name: "Croatia", languages: ["hr"] },
  { code: "CU", name: "Cuba", languages: ["es"] },
  { code: "CY", name: "Cyprus", languages: ["el", "tr"] },
  { code: "CZ", name: "Czechia", languages: ["cs"] },
  { code: "CD", name: "Democratic Republic of the Congo", languages: ["fr", "sw"] },
  { code: "DK", name: "Denmark", languages: ["da"] },
  { code: "DJ", name: "Djibouti", languages: ["fr", "ar"] },
  { code: "DM", name: "Dominica", languages: ["en"] },
  { code: "DO", name: "Dominican Republic", languages: ["es"] },
  { code: "EC", name: "Ecuador", languages: ["es"] },
  { code: "EG", name: "Egypt", languages: ["ar"] },
  { code: "SV", name: "El Salvador", languages: ["es"] },
  { code: "GQ", name: "Equatorial Guinea", languages: ["es", "fr", "pt"] },
  { code: "ER", name: "Eritrea", languages: ["ti", "ar", "en"] },
  { code: "EE", name: "Estonia", languages: ["et"] },
  { code: "SZ", name: "Eswatini", languages: ["en", "ss"] },
  { code: "ET", name: "Ethiopia", languages: ["am"] },
  { code: "FJ", name: "Fiji", languages: ["en", "fj", "hi"] },
  { code: "FI", name: "Finland", languages: ["fi", "sv"] },
  { code: "FR", name: "France", languages: ["fr"] },
  { code: "GA", name: "Gabon", languages: ["fr"] },
  { code: "GM", name: "Gambia", languages: ["en"] },
  { code: "GE", name: "Georgia", languages: ["ka"] },
  { code: "DE", name: "Germany", languages: ["de"] },
  { code: "GH", name: "Ghana", languages: ["en"] },
  { code: "GR", name: "Greece", languages: ["el"] },
  { code: "GD", name: "Grenada", languages: ["en"] },
  { code: "GT", name: "Guatemala", languages: ["es"] },
  { code: "GN", name: "Guinea", languages: ["fr"] },
  { code: "GW", name: "Guinea-Bissau", languages: ["pt"] },
  { code: "GY", name: "Guyana", languages: ["en"] },
  { code: "HT", name: "Haiti", languages: ["fr", "ht"] },
  { code: "HN", name: "Honduras", languages: ["es"] },
  { code: "HU", name: "Hungary", languages: ["hu"] },
  { code: "IS", name: "Iceland", languages: ["is"] },
  { code: "IN", name: "India", languages: ["hi", "en", "bn", "ta"] },
  { code: "ID", name: "Indonesia", languages: ["id"] },
  { code: "IR", name: "Iran", languages: ["fa"] },
  { code: "IQ", name: "Iraq", languages: ["ar", "ku"] },
  { code: "IE", name: "Ireland", languages: ["en", "ga"] },
  { code: "IL", name: "Israel", languages: ["he", "ar"] },
  { code: "IT", name: "Italy", languages: ["it"] },
  { code: "JM", name: "Jamaica", languages: ["en"] },
  { code: "JP", name: "Japan", languages: ["ja"] },
  { code: "JO", name: "Jordan", languages: ["ar"] },
  { code: "KZ", name: "Kazakhstan", languages: ["kk", "ru"] },
  { code: "KE", name: "Kenya", languages: ["sw", "en"] },
  { code: "KI", name: "Kiribati", languages: ["en", "gil"] },
  { code: "KP", name: "North Korea", languages: ["ko"] },
  { code: "KR", name: "South Korea", languages: ["ko"] },
  { code: "KW", name: "Kuwait", languages: ["ar"] },
  { code: "KG", name: "Kyrgyzstan", languages: ["ky", "ru"] },
  { code: "LA", name: "Laos", languages: ["lo"] },
  { code: "LV", name: "Latvia", languages: ["lv"] },
  { code: "LB", name: "Lebanon", languages: ["ar", "fr"] },
  { code: "LS", name: "Lesotho", languages: ["en", "st"] },
  { code: "LR", name: "Liberia", languages: ["en"] },
  { code: "LY", name: "Libya", languages: ["ar"] },
  { code: "LI", name: "Liechtenstein", languages: ["de"] },
  { code: "LT", name: "Lithuania", languages: ["lt"] },
  { code: "LU", name: "Luxembourg", languages: ["lb", "fr", "de"] },
  { code: "MG", name: "Madagascar", languages: ["mg", "fr"] },
  { code: "MW", name: "Malawi", languages: ["en", "ny"] },
  { code: "MY", name: "Malaysia", languages: ["ms"] },
  { code: "MV", name: "Maldives", languages: ["dv"] },
  { code: "ML", name: "Mali", languages: ["fr"] },
  { code: "MT", name: "Malta", languages: ["mt", "en"] },
  { code: "MH", name: "Marshall Islands", languages: ["en", "mh"] },
  { code: "MR", name: "Mauritania", languages: ["ar", "fr"] },
  { code: "MU", name: "Mauritius", languages: ["en", "fr"] },
  { code: "MX", name: "Mexico", languages: ["es"] },
  { code: "FM", name: "Micronesia", languages: ["en"] },
  { code: "MD", name: "Moldova", languages: ["ro"] },
  { code: "MC", name: "Monaco", languages: ["fr"] },
  { code: "MN", name: "Mongolia", languages: ["mn"] },
  { code: "ME", name: "Montenegro", languages: ["sr"] },
  { code: "MA", name: "Morocco", languages: ["ar", "fr"] },
  { code: "MZ", name: "Mozambique", languages: ["pt"] },
  { code: "MM", name: "Myanmar", languages: ["my"] },
  { code: "NA", name: "Namibia", languages: ["en", "af"] },
  { code: "NR", name: "Nauru", languages: ["en", "na"] },
  { code: "NP", name: "Nepal", languages: ["ne"] },
  { code: "NL", name: "Netherlands", languages: ["nl"] },
  { code: "NZ", name: "New Zealand", languages: ["en", "mi"] },
  { code: "NI", name: "Nicaragua", languages: ["es"] },
  { code: "NE", name: "Niger", languages: ["fr"] },
  { code: "NG", name: "Nigeria", languages: ["en", "ha", "yo", "ig"] },
  { code: "MK", name: "North Macedonia", languages: ["mk"] },
  { code: "NO", name: "Norway", languages: ["no"] },
  { code: "OM", name: "Oman", languages: ["ar"] },
  { code: "PK", name: "Pakistan", languages: ["ur", "en", "pa"] },
  { code: "PW", name: "Palau", languages: ["en"] },
  { code: "PS", name: "Palestine", languages: ["ar"] },
  { code: "PA", name: "Panama", languages: ["es"] },
  { code: "PG", name: "Papua New Guinea", languages: ["en", "tpi", "ho"] },
  { code: "PY", name: "Paraguay", languages: ["es", "gn"] },
  { code: "PE", name: "Peru", languages: ["es"] },
  { code: "PH", name: "Philippines", languages: ["tl", "en"] },
  { code: "PL", name: "Poland", languages: ["pl"] },
  { code: "PT", name: "Portugal", languages: ["pt"] },
  { code: "QA", name: "Qatar", languages: ["ar"] },
  { code: "RO", name: "Romania", languages: ["ro"] },
  { code: "RU", name: "Russia", languages: ["ru"] },
  { code: "RW", name: "Rwanda", languages: ["rw", "en", "fr"] },
  { code: "KN", name: "Saint Kitts and Nevis", languages: ["en"] },
  { code: "LC", name: "Saint Lucia", languages: ["en"] },
  { code: "VC", name: "Saint Vincent and the Grenadines", languages: ["en"] },
  { code: "WS", name: "Samoa", languages: ["sm", "en"] },
  { code: "SM", name: "San Marino", languages: ["it"] },
  { code: "ST", name: "Sao Tome and Principe", languages: ["pt"] },
  { code: "SA", name: "Saudi Arabia", languages: ["ar"] },
  { code: "SN", name: "Senegal", languages: ["fr"] },
  { code: "RS", name: "Serbia", languages: ["sr"] },
  { code: "SC", name: "Seychelles", languages: ["en", "fr"] },
  { code: "SL", name: "Sierra Leone", languages: ["en"] },
  { code: "SG", name: "Singapore", languages: ["en", "ms", "zh", "ta"] },
  { code: "SK", name: "Slovakia", languages: ["sk"] },
  { code: "SI", name: "Slovenia", languages: ["sl"] },
  { code: "SB", name: "Solomon Islands", languages: ["en"] },
  { code: "SO", name: "Somalia", languages: ["so", "ar"] },
  { code: "ZA", name: "South Africa", languages: ["en", "af", "zu"] },
  { code: "SS", name: "South Sudan", languages: ["en"] },
  { code: "ES", name: "Spain", languages: ["es"] },
  { code: "LK", name: "Sri Lanka", languages: ["si", "ta"] },
  { code: "SD", name: "Sudan", languages: ["ar", "en"] },
  { code: "SR", name: "Suriname", languages: ["nl"] },
  { code: "SE", name: "Sweden", languages: ["sv"] },
  { code: "CH", name: "Switzerland", languages: ["de", "fr", "it"] },
  { code: "SY", name: "Syria", languages: ["ar"] },
  { code: "TJ", name: "Tajikistan", languages: ["tg"] },
  { code: "TZ", name: "Tanzania", languages: ["sw", "en"] },
  { code: "TH", name: "Thailand", languages: ["th"] },
  { code: "TL", name: "Timor-Leste", languages: ["pt", "tet"] },
  { code: "TG", name: "Togo", languages: ["fr"] },
  { code: "TO", name: "Tonga", languages: ["en", "to"] },
  { code: "TT", name: "Trinidad and Tobago", languages: ["en"] },
  { code: "TN", name: "Tunisia", languages: ["ar", "fr"] },
  { code: "TR", name: "Türkiye", languages: ["tr"] },
  { code: "TM", name: "Turkmenistan", languages: ["tk"] },
  { code: "TV", name: "Tuvalu", languages: ["en"] },
  { code: "UG", name: "Uganda", languages: ["en", "sw"] },
  { code: "UA", name: "Ukraine", languages: ["uk"] },
  { code: "AE", name: "United Arab Emirates", languages: ["ar"] },
  { code: "GB", name: "United Kingdom", languages: ["en"] },
  { code: "US", name: "United States", languages: ["en"] },
  { code: "UY", name: "Uruguay", languages: ["es"] },
  { code: "UZ", name: "Uzbekistan", languages: ["uz"] },
  { code: "VU", name: "Vanuatu", languages: ["bi", "en", "fr"] },
  { code: "VA", name: "Vatican City", languages: ["it", "la"] },
  { code: "VE", name: "Venezuela", languages: ["es"] },
  { code: "VN", name: "Vietnam", languages: ["vi"] },
  { code: "YE", name: "Yemen", languages: ["ar"] },
  { code: "ZM", name: "Zambia", languages: ["en"] },
  { code: "ZW", name: "Zimbabwe", languages: ["en", "sn"] },
] as const;

export const GLOBAL_195_COUNTRY_COUNT = 195 as const;

// =====================================================================
// 3. Global language registry
// =====================================================================

type GlobalLanguageRow = readonly [
  code: string,
  name: string,
  nativeName: string,
  countries: readonly string[],
];

export const GLOBAL_LANGUAGES: readonly GlobalLanguageEntry[] = ([
  ["km", "Khmer", "ខ្មែរ", ["KH"]],
  ["en", "English", "English", ["US", "GB", "CA", "AU", "NZ", "IE", "ZA", "SG", "PH"]],
  ["zh", "Chinese", "中文", ["CN", "TW", "SG", "MY"]],
  ["es", "Spanish", "Español", ["ES", "MX", "GT", "HN", "SV", "NI", "CR", "PA", "CU", "DO", "CO", "VE", "EC", "PE", "BO", "PY", "CL", "AR", "UY"]],
  ["fr", "French", "Français", ["FR", "BE", "CH", "CA", "LU", "MC", "SN", "CI", "CM"]],
  ["ar", "Arabic", "العربية", ["SA", "AE", "EG", "IQ", "JO", "LB", "SY", "YE", "OM", "QA", "KW", "BH", "MA", "DZ", "TN", "LY", "SD", "SO", "DJ", "KM", "MR", "PS"]],
  ["pt", "Portuguese", "Português", ["PT", "BR", "AO", "MZ", "CV", "GW", "ST", "TL"]],
  ["ru", "Russian", "Русский", ["RU", "BY", "KZ", "KG"]],
  ["de", "German", "Deutsch", ["DE", "AT", "CH", "LI", "LU"]],
  ["it", "Italian", "Italiano", ["IT", "CH", "SM", "VA"]],
  ["ja", "Japanese", "日本語", ["JP"]],
  ["ko", "Korean", "한국어", ["KR", "KP"]],
  ["vi", "Vietnamese", "Tiếng Việt", ["VN"]],
  ["th", "Thai", "ไทย", ["TH"]],
  ["lo", "Lao", "ລາວ", ["LA"]],
  ["my", "Burmese", "မြန်မာ", ["MM"]],
  ["id", "Indonesian", "Bahasa Indonesia", ["ID"]],
  ["ms", "Malay", "Bahasa Melayu", ["MY", "BN", "SG"]],
  ["tl", "Filipino", "Filipino", ["PH"]],
  ["hi", "Hindi", "हिन्दी", ["IN"]],
  ["bn", "Bengali", "বাংলা", ["BD", "IN"]],
  ["ur", "Urdu", "اردو", ["PK", "IN"]],
  ["pa", "Punjabi", "ਪੰਜਾਬੀ", ["PK", "IN"]],
  ["ne", "Nepali", "नेपाली", ["NP", "IN"]],
  ["si", "Sinhala", "සිංහල", ["LK"]],
  ["ta", "Tamil", "தமிழ்", ["IN", "LK", "SG"]],
  ["te", "Telugu", "తెలుగు", ["IN"]],
  ["mr", "Marathi", "मराठी", ["IN"]],
  ["gu", "Gujarati", "ગુજરાતી", ["IN"]],
  ["kn", "Kannada", "ಕನ್ನಡ", ["IN"]],
  ["ml", "Malayalam", "മലയാളം", ["IN"]],
  ["tr", "Turkish", "Türkçe", ["TR", "CY"]],
  ["fa", "Persian", "فارسی", ["IR", "AF", "TJ"]],
  ["he", "Hebrew", "עברית", ["IL"]],
  ["sw", "Swahili", "Kiswahili", ["TZ", "KE", "UG", "RW", "BI", "CD"]],
  ["am", "Amharic", "አማርኛ", ["ET"]],
  ["so", "Somali", "Soomaali", ["SO", "DJ", "ET", "KE"]],
  ["ha", "Hausa", "Hausa", ["NG", "NE", "GH"]],
  ["yo", "Yoruba", "Yorùbá", ["NG", "BJ"]],
  ["ig", "Igbo", "Igbo", ["NG"]],
  ["zu", "Zulu", "isiZulu", ["ZA"]],
  ["af", "Afrikaans", "Afrikaans", ["ZA", "NA"]],
  ["nl", "Dutch", "Nederlands", ["NL", "BE", "SR"]],
  ["pl", "Polish", "Polski", ["PL"]],
  ["uk", "Ukrainian", "Українська", ["UA"]],
  ["cs", "Czech", "Čeština", ["CZ"]],
  ["sk", "Slovak", "Slovenčina", ["SK"]],
  ["hu", "Hungarian", "Magyar", ["HU"]],
  ["ro", "Romanian", "Română", ["RO", "MD"]],
  ["bg", "Bulgarian", "Български", ["BG"]],
  ["sr", "Serbian", "Српски", ["RS", "BA", "ME"]],
  ["hr", "Croatian", "Hrvatski", ["HR", "BA"]],
  ["sl", "Slovenian", "Slovenščina", ["SI"]],
  ["el", "Greek", "Ελληνικά", ["GR", "CY"]],
  ["sv", "Swedish", "Svenska", ["SE", "FI"]],
  ["no", "Norwegian", "Norsk", ["NO"]],
  ["da", "Danish", "Dansk", ["DK"]],
  ["fi", "Finnish", "Suomi", ["FI"]],
  ["et", "Estonian", "Eesti", ["EE"]],
  ["lv", "Latvian", "Latviešu", ["LV"]],
  ["lt", "Lithuanian", "Lietuvių", ["LT"]],
  ["is", "Icelandic", "Íslenska", ["IS"]],
  ["ga", "Irish", "Gaeilge", ["IE"]],
  ["mt", "Maltese", "Malti", ["MT"]],
  ["sq", "Albanian", "Shqip", ["AL", "XK"]],
  ["mk", "Macedonian", "Македонски", ["MK"]],
  ["bs", "Bosnian", "Bosanski", ["BA"]],
  ["ka", "Georgian", "ქართული", ["GE"]],
  ["hy", "Armenian", "Հայերեն", ["AM"]],
  ["az", "Azerbaijani", "Azərbaycan dili", ["AZ"]],
  ["kk", "Kazakh", "Қазақша", ["KZ"]],
  ["uz", "Uzbek", "Oʻzbekcha", ["UZ"]],
  ["tk", "Turkmen", "Türkmençe", ["TM"]],
  ["ky", "Kyrgyz", "Кыргызча", ["KG"]],
  ["tg", "Tajik", "Тоҷикӣ", ["TJ"]],
  ["mn", "Mongolian", "Монгол", ["MN"]],
  ["ps", "Pashto", "پښتو", ["AF", "PK"]],
  ["ku", "Kurdish", "Kurdî", ["TR", "IQ", "IR", "SY"]],
  ["la", "Latin", "Latina", ["VA"]],
  ["ca", "Catalan", "Català", ["AD"]],
  ["be", "Belarusian", "Беларуская", ["BY"]],
  ["dz", "Dzongkha", "རྫོང་ཁ", ["BT"]],
  ["rn", "Kirundi", "Ikirundi", ["BI"]],
  ["sg", "Sango", "Sängö", ["CF"]],
  ["fj", "Fijian", "Na Vosa Vakaviti", ["FJ"]],
  ["ss", "Swazi", "siSwati", ["SZ"]],
  ["gil", "Gilbertese", "Taetae ni Kiribati", ["KI"]],
  ["ht", "Haitian Creole", "Kreyòl ayisyen", ["HT"]],
  ["st", "Southern Sotho", "Sesotho", ["LS"]],
  ["lb", "Luxembourgish", "Lëtzebuergesch", ["LU"]],
  ["mg", "Malagasy", "Malagasy", ["MG"]],
  ["ny", "Chichewa", "Chichewa", ["MW"]],
  ["dv", "Dhivehi", "ދިވެހި", ["MV"]],
  ["mh", "Marshallese", "Kajin M̧ajeļ", ["MH"]],
  ["na", "Nauruan", "Dorerin Naoero", ["NR"]],
  ["mi", "Māori", "Māori", ["NZ"]],
  ["tpi", "Tok Pisin", "Tok Pisin", ["PG"]],
  ["ho", "Hiri Motu", "Hiri Motu", ["PG"]],
  ["gn", "Guarani", "Avañe'ẽ", ["PY"]],
  ["rw", "Kinyarwanda", "Ikinyarwanda", ["RW"]],
  ["sm", "Samoan", "Gagana Samoa", ["WS"]],
  ["tet", "Tetum", "Tetun", ["TL"]],
  ["to", "Tongan", "Lea faka-Tonga", ["TO"]],
  ["bi", "Bislama", "Bislama", ["VU"]],
  ["sn", "Shona", "chiShona", ["ZW"]],
 ] as readonly GlobalLanguageRow[]).map(([code, name, nativeName, countries]) => ({
  code,
  name,
  nativeName,
  countries,
})) as readonly GlobalLanguageEntry[];

// =====================================================================
// 4. Vocabulary seed
// =====================================================================

export const GLOBAL_195_VOCABULARY: readonly GlobalVocabularyEntry[] = [
  // Khmer
  { term: "សួស្តី", language: "km", countries: ["KH"], category: "greeting", aliases: ["សួស្ដី"] },
  { term: "អរគុណ", language: "km", countries: ["KH"], category: "common" },
  { term: "បាទ", language: "km", countries: ["KH"], category: "answer" },
  { term: "ចាស", language: "km", countries: ["KH"], category: "answer" },
  { term: "សូម", language: "km", countries: ["KH"], category: "common" },
  { term: "ជួយ", language: "km", countries: ["KH"], category: "command" },

  // English
  { term: "hello", language: "en", countries: ["US", "GB", "CA", "AU", "NZ"], category: "greeting", aliases: ["hi", "hey"] },
  { term: "thanks", language: "en", countries: ["US", "GB", "CA", "AU", "NZ"], category: "common", aliases: ["thank you"] },
  { term: "yes", language: "en", countries: ["US", "GB", "CA", "AU", "NZ"], category: "answer" },
  { term: "no", language: "en", countries: ["US", "GB", "CA", "AU", "NZ"], category: "answer" },
  { term: "please", language: "en", countries: ["US", "GB", "CA", "AU", "NZ"], category: "common" },
  { term: "help", language: "en", countries: ["US", "GB", "CA", "AU", "NZ"], category: "command" },

  // Common seed terms from the recovered document
  { term: "สวัสดี", language: "th", countries: ["TH"], category: "greeting" },
  { term: "xin chào", language: "vi", countries: ["VN"], category: "greeting" },
  { term: "你好", language: "zh", countries: ["CN", "TW", "SG", "MY"], category: "greeting" },
  { term: "こんにちは", language: "ja", countries: ["JP"], category: "greeting" },
  { term: "안녕하세요", language: "ko", countries: ["KR", "KP"], category: "greeting" },
  { term: "hola", language: "es", countries: ["ES", "MX", "AR", "CO", "CL", "PE"], category: "greeting" },
  { term: "bonjour", language: "fr", countries: ["FR", "BE", "CH", "CA"], category: "greeting" },
  { term: "hallo", language: "de", countries: ["DE", "AT", "CH"], category: "greeting" },
  { term: "ciao", language: "it", countries: ["IT", "CH"], category: "greeting" },
  { term: "olá", language: "pt", countries: ["PT", "BR", "AO", "MZ"], category: "greeting" },
  { term: "привет", language: "ru", countries: ["RU", "BY", "KZ", "KG"], category: "greeting" },
  { term: "مرحبا", language: "ar", countries: ["SA", "AE", "EG", "JO", "LB"], category: "greeting" },
  { term: "halo", language: "id", countries: ["ID"], category: "greeting" },
  { term: "selamat", language: "ms", countries: ["MY", "BN", "SG"], category: "greeting" },
  { term: "kumusta", language: "tl", countries: ["PH"], category: "greeting" },
  { term: "नमस्ते", language: "hi", countries: ["IN"], category: "greeting" },
  { term: "হ্যালো", language: "bn", countries: ["BD", "IN"], category: "greeting" },
  { term: "merhaba", language: "tr", countries: ["TR", "CY"], category: "greeting" },
  { term: "سلام", language: "fa", countries: ["IR", "AF", "TJ"], category: "greeting" },
  { term: "habari", language: "sw", countries: ["TZ", "KE", "UG", "RW", "BI", "CD"], category: "greeting" },
  { term: "ሰላም", language: "am", countries: ["ET"], category: "greeting" },
] as const;

// =====================================================================
// 5. Country and language lookup helpers
// =====================================================================

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeLanguage(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}

export function getGlobalCountries(): readonly GlobalCountryEntry[] {
  return GLOBAL_195_COUNTRIES;
}

export function getCountryByCode(
  code: string,
): GlobalCountryEntry | undefined {
  const normalizedCode = normalizeCode(code);
  return GLOBAL_195_COUNTRIES.find((country) => country.code === normalizedCode);
}

export function isGlobal195CountryCode(code: string): boolean {
  return getCountryByCode(code) !== undefined;
}

export function getCountryCodes(): readonly string[] {
  return GLOBAL_195_COUNTRIES.map((country) => country.code);
}

export function getCountriesByLanguage(
  language: string,
): readonly GlobalCountryEntry[] {
  const normalizedLanguage = normalizeLanguage(language);
  return GLOBAL_195_COUNTRIES.filter((country) =>
    country.languages.includes(normalizedLanguage),
  );
}

export function getGlobalLanguages(): readonly GlobalLanguageEntry[] {
  return GLOBAL_LANGUAGES;
}

export function getLanguageByCode(
  language: string,
): GlobalLanguageEntry | undefined {
  const normalizedLanguage = normalizeLanguage(language);
  return GLOBAL_LANGUAGES.find((entry) => entry.code === normalizedLanguage);
}

export function isSupportedLanguage(language: string): boolean {
  return getLanguageByCode(language) !== undefined;
}

export function getLanguagesForCountry(
  countryCode: string,
): readonly GlobalLanguageEntry[] {
  const normalizedCountry = normalizeCode(countryCode);
  return GLOBAL_LANGUAGES.filter((language) =>
    language.countries.includes(normalizedCountry),
  );
}

// =====================================================================
// 6. Vocabulary lookup helpers
// =====================================================================

export function getVocabularyByLanguage(
  language: string,
): readonly GlobalVocabularyEntry[] {
  const normalizedLanguage = normalizeLanguage(language);
  return GLOBAL_195_VOCABULARY.filter(
    (entry) => entry.language === normalizedLanguage,
  );
}

export function getVocabularyByCategory(
  category: GlobalVocabularyCategory,
): readonly GlobalVocabularyEntry[] {
  return GLOBAL_195_VOCABULARY.filter((entry) => entry.category === category);
}

export function getVocabularyByCountry(
  countryCode: string,
): readonly GlobalVocabularyEntry[] {
  const normalizedCountry = normalizeCode(countryCode);
  return GLOBAL_195_VOCABULARY.filter((entry) =>
    entry.countries.includes(normalizedCountry),
  );
}

export function searchGlobalVocabulary(
  query: string,
  options: {
    language?: string;
    category?: GlobalVocabularyCategory;
    countryCode?: string;
  } = {},
): readonly VocabularyMatch[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const language = options.language
    ? normalizeLanguage(options.language)
    : undefined;
  const countryCode = options.countryCode
    ? normalizeCode(options.countryCode)
    : undefined;

  const matches: VocabularyMatch[] = [];

  for (const entry of GLOBAL_195_VOCABULARY) {
    if (language && entry.language !== language) continue;
    if (options.category && entry.category !== options.category) continue;
    if (countryCode && !entry.countries.includes(countryCode)) continue;

    const candidates = [
      { text: entry.term, matchedBy: "term" as const },
      ...(entry.aliases ?? []).map((text) => ({
        text,
        matchedBy: "alias" as const,
      })),
    ];

    for (const candidate of candidates) {
      if (normalizeSearchText(candidate.text).includes(normalizedQuery)) {
        matches.push({
          entry,
          matchedText: candidate.text,
          matchedBy: candidate.matchedBy,
        });
      }
    }
  }

  return matches;
}

export function findVocabularyForText(
  text: string,
  language?: string,
): readonly VocabularyMatch[] {
  const normalizedText = normalizeSearchText(text);
  if (!normalizedText) return [];

  const languageFilter = language ? normalizeLanguage(language) : undefined;
  const matches: VocabularyMatch[] = [];

  for (const entry of GLOBAL_195_VOCABULARY) {
    if (languageFilter && entry.language !== languageFilter) continue;

    const candidates = [
      { text: entry.term, matchedBy: "term" as const },
      ...(entry.aliases ?? []).map((candidate) => ({
        text: candidate,
        matchedBy: "alias" as const,
      })),
    ];

    for (const candidate of candidates) {
      if (normalizedText.includes(normalizeSearchText(candidate.text))) {
        matches.push({
          entry,
          matchedText: candidate.text,
          matchedBy: candidate.matchedBy,
        });
      }
    }
  }

  return matches;
}

// =====================================================================
// 7. Registry validation
// =====================================================================

export function validateGlobal195CountryRegistry(): {
  valid: boolean;
  count: number;
  duplicateCodes: string[];
  reason: string;
} {
  const codes = GLOBAL_195_COUNTRIES.map((country) => country.code);
  const duplicateCodes = [
    ...new Set(
      codes.filter((code, index) => codes.indexOf(code) !== index),
    ),
  ];
  const countIsCorrect = GLOBAL_195_COUNTRIES.length === GLOBAL_195_COUNTRY_COUNT;
  const valid = countIsCorrect && duplicateCodes.length === 0;

  return {
    valid,
    count: GLOBAL_195_COUNTRIES.length,
    duplicateCodes,
    reason: valid
      ? "The country registry contains 195 unique country codes."
      : "The country registry requires correction.",
  };
}

export function validateVocabularyRegistry(): VocabularyValidationResult {
  const countryCodes = new Set(getCountryCodes());
  const languageCodes = new Set(GLOBAL_LANGUAGES.map((entry) => entry.code));
  const keySet = new Set<string>();
  const duplicateKeys: string[] = [];
  const invalidCountryCodes: string[] = [];
  const invalidLanguageCodes: string[] = [];

  for (const entry of GLOBAL_195_VOCABULARY) {
    const key = `${entry.language}:${entry.category}:${entry.term}`;
    if (keySet.has(key)) duplicateKeys.push(key);
    keySet.add(key);

    if (!languageCodes.has(entry.language)) {
      invalidLanguageCodes.push(entry.language);
    }

    for (const country of entry.countries) {
      if (!countryCodes.has(country)) invalidCountryCodes.push(country);
    }
  }

  const uniqueInvalidCountries = [...new Set(invalidCountryCodes)];
  const uniqueInvalidLanguages = [...new Set(invalidLanguageCodes)];
  const uniqueDuplicates = [...new Set(duplicateKeys)];
  const valid =
    uniqueDuplicates.length === 0 &&
    uniqueInvalidCountries.length === 0 &&
    uniqueInvalidLanguages.length === 0;

  return {
    valid,
    count: GLOBAL_195_VOCABULARY.length,
    duplicateKeys: uniqueDuplicates,
    invalidCountryCodes: uniqueInvalidCountries,
    invalidLanguageCodes: uniqueInvalidLanguages,
    reason: valid
      ? "The vocabulary seed has unique keys and valid country/language references."
      : "The vocabulary seed requires correction.",
  };
}

export const GLOBAL_LANGUAGE_COUNT = GLOBAL_LANGUAGES.length as number;
export const GLOBAL_VOCABULARY_SEED_COUNT =
  GLOBAL_195_VOCABULARY.length as number;
