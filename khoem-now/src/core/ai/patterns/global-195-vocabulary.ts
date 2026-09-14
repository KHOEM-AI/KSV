// ============================================================
// KHOEM NOW — GLOBAL 195 LANGUAGE / VOCABULARY STANDARD
// ============================================================
// Purpose:
//   Single global language + vocabulary data layer.
//
// Architecture:
//   195 countries
//      ↓
//   Global languages / locales
//      ↓
//   Vocabulary categories
//      ↓
//   Terms + aliases
//
// IMPORTANT:
//   This file contains DATA only.
//   Intent / reasoning / behavior belongs in:
//     - khoem-ai-brain.ts
//     - khoem-ai-conduct.ts
//
// Do NOT create separate language files such as:
//   khmer.ts, english.ts, thai.ts, etc.
// ============================================================

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

export type GlobalLanguageEntry = {
  code: string;
  name: string;
  nativeName: string;
  countries: readonly string[];
};

export type GlobalVocabularyEntry = {
  term: string;
  language: string;
  countries: readonly string[];
  category: GlobalVocabularyCategory;
  aliases?: readonly string[];
};

//
// ============================================================
// GLOBAL LANGUAGE REGISTRY
// ============================================================
//
// Country codes use ISO 3166-1 alpha-2 style codes.
// Language codes use ISO 639-1 where available.
//
// One country can have multiple languages.
// One language can exist across multiple countries.
//



export type GlobalCountryEntry = {
  code: string;
  name: string;
  languages: readonly string[];
};

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

export function getGlobalCountries(): readonly GlobalCountryEntry[] {
  return GLOBAL_195_COUNTRIES;
}

export function getCountryByCode(
  code: string,
): GlobalCountryEntry | undefined {
  const normalizedCode = code.trim().toUpperCase();
  return GLOBAL_195_COUNTRIES.find(
    (country) => country.code === normalizedCode,
  );
}

export function isGlobal195CountryCode(code: string): boolean {
  return getCountryByCode(code) !== undefined;
}

export function getCountriesByLanguage(
  language: string,
): readonly GlobalCountryEntry[] {
  const normalizedLanguage = language.trim().toLowerCase();
  return GLOBAL_195_COUNTRIES.filter((country) =>
    country.languages.some(
      (countryLanguage) =>
        countryLanguage.toLowerCase() === normalizedLanguage,
    ),
  );
}

export function getCountryCodes(): readonly string[] {
  return GLOBAL_195_COUNTRIES.map((country) => country.code);
}

export function validateGlobal195CountryRegistry(): {
  valid: boolean;
  count: number;
  duplicateCodes: string[];
  reason: string;
} {
  const codes = GLOBAL_195_COUNTRIES.map((country) => country.code);
  const duplicateCodes = codes.filter(
    (code, index) => codes.indexOf(code) !== index,
  );
  const uniqueDuplicateCodes = [...new Set(duplicateCodes)];
  const countIsCorrect = GLOBAL_195_COUNTRIES.length === 195;
  const hasDuplicates = uniqueDuplicateCodes.length > 0;

  return {
    valid: countIsCorrect && !hasDuplicates,
    count: GLOBAL_195_COUNTRIES.length,
    duplicateCodes: uniqueDuplicateCodes,
    reason:
      countIsCorrect && !hasDuplicates
        ? "The country registry contains 195 unique country codes."
        : "The country registry requires correction.",
  };
}

export const GLOBAL_LANGUAGES: readonly GlobalLanguageEntry[] = [
  {
    code: "km",
    name: "Khmer",
    nativeName: "ខ្មែរ",
    countries: ["KH"],
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    countries: ["US", "GB", "CA", "AU", "NZ", "IE", "ZA", "SG", "PH"],
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    countries: ["CN", "TW", "SG", "MY"],
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    countries: [
      "ES", "MX", "GT", "HN", "SV", "NI", "CR", "PA",
      "CU", "DO", "PR", "CO", "VE", "EC", "PE", "BO",
      "PY", "CL", "AR", "UY"
    ],
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    countries: ["FR", "BE", "CH", "CA", "LU", "MC", "SN", "CI", "CM"],
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    countries: [
      "SA", "AE", "EG", "IQ", "JO", "LB", "SY", "YE",
      "OM", "QA", "KW", "BH", "MA", "DZ", "TN", "LY",
      "SD", "SO", "DJ", "KM", "MR", "PS"
    ],
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    countries: ["PT", "BR", "AO", "MZ", "CV", "GW", "ST", "TL"],
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    countries: ["RU", "BY", "KZ", "KG"],
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    countries: ["DE", "AT", "CH", "LI", "LU"],
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    countries: ["IT", "CH", "SM", "VA"],
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    countries: ["JP"],
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    countries: ["KR", "KP"],
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    countries: ["VN"],
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    countries: ["TH"],
  },
  {
    code: "lo",
    name: "Lao",
    nativeName: "ລາວ",
    countries: ["LA"],
  },
  {
    code: "my",
    name: "Burmese",
    nativeName: "မြန်မာ",
    countries: ["MM"],
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    countries: ["ID"],
  },
  {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    countries: ["MY", "BN", "SG"],
  },
  {
    code: "tl",
    name: "Filipino",
    nativeName: "Filipino",
    countries: ["PH"],
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    countries: ["IN"],
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    countries: ["BD", "IN"],
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    countries: ["PK", "IN"],
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    countries: ["PK", "IN"],
  },
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    countries: ["NP", "IN"],
  },
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
    countries: ["LK"],
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    countries: ["IN", "LK", "SG"],
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    countries: ["IN"],
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    countries: ["IN"],
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    countries: ["IN"],
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    countries: ["IN"],
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    countries: ["IN"],
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    countries: ["TR", "CY"],
  },
  {
    code: "fa",
    name: "Persian",
    nativeName: "فارسی",
    countries: ["IR", "AF", "TJ"],
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    countries: ["IL"],
  },
  {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    countries: ["TZ", "KE", "UG", "RW", "BI", "CD"],
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    countries: ["ET"],
  },
  {
    code: "so",
    name: "Somali",
    nativeName: "Soomaali",
    countries: ["SO", "DJ", "ET", "KE"],
  },
  {
    code: "ha",
    name: "Hausa",
    nativeName: "Hausa",
    countries: ["NG", "NE", "GH"],
  },
  {
    code: "yo",
    name: "Yoruba",
    nativeName: "Yorùbá",
    countries: ["NG", "BJ"],
  },
  {
    code: "ig",
    name: "Igbo",
    nativeName: "Igbo",
    countries: ["NG"],
  },
  {
    code: "zu",
    name: "Zulu",
    nativeName: "isiZulu",
    countries: ["ZA"],
  },
  {
    code: "af",
    name: "Afrikaans",
    nativeName: "Afrikaans",
    countries: ["ZA", "NA"],
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    countries: ["NL", "BE", "SR"],
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    countries: ["PL"],
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    countries: ["UA"],
  },
  {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    countries: ["CZ"],
  },
  {
    code: "sk",
    name: "Slovak",
    nativeName: "Slovenčina",
    countries: ["SK"],
  },
  {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    countries: ["HU"],
  },
  {
    code: "ro",
    name: "Romanian",
    nativeName: "Română",
    countries: ["RO", "MD"],
  },
  {
    code: "bg",
    name: "Bulgarian",
    nativeName: "Български",
    countries: ["BG"],
  },
  {
    code: "sr",
    name: "Serbian",
    nativeName: "Српски",
    countries: ["RS", "BA", "ME"],
  },
  {
    code: "hr",
    name: "Croatian",
    nativeName: "Hrvatski",
    countries: ["HR", "BA"],
  },
  {
    code: "sl",
    name: "Slovenian",
    nativeName: "Slovenščina",
    countries: ["SI"],
  },
  {
    code: "el",
    name: "Greek",
    nativeName: "Ελληνικά",
    countries: ["GR", "CY"],
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    countries: ["SE", "FI"],
  },
  {
    code: "no",
    name: "Norwegian",
    nativeName: "Norsk",
    countries: ["NO"],
  },
  {
    code: "da",
    name: "Danish",
    nativeName: "Dansk",
    countries: ["DK"],
  },
  {
    code: "fi",
    name: "Finnish",
    nativeName: "Suomi",
    countries: ["FI"],
  },
  {
    code: "et",
    name: "Estonian",
    nativeName: "Eesti",
    countries: ["EE"],
  },
  {
    code: "lv",
    name: "Latvian",
    nativeName: "Latviešu",
    countries: ["LV"],
  },
  {
    code: "lt",
    name: "Lithuanian",
    nativeName: "Lietuvių",
    countries: ["LT"],
  },
  {
    code: "is",
    name: "Icelandic",
    nativeName: "Íslenska",
    countries: ["IS"],
  },
  {
    code: "ga",
    name: "Irish",
    nativeName: "Gaeilge",
    countries: ["IE"],
  },
  {
    code: "mt",
    name: "Maltese",
    nativeName: "Malti",
    countries: ["MT"],
  },
  {
    code: "sq",
    name: "Albanian",
    nativeName: "Shqip",
    countries: ["AL", "XK"],
  },
  {
    code: "mk",
    name: "Macedonian",
    nativeName: "Македонски",
    countries: ["MK"],
  },
  {
    code: "bs",
    name: "Bosnian",
    nativeName: "Bosanski",
    countries: ["BA"],
  },
  {
    code: "ka",
    name: "Georgian",
    nativeName: "ქართული",
    countries: ["GE"],
  },
  {
    code: "hy",
    name: "Armenian",
    nativeName: "Հայերեն",
    countries: ["AM"],
  },
  {
    code: "az",
    name: "Azerbaijani",
    nativeName: "Azərbaycan dili",
    countries: ["AZ"],
  },
  {
    code: "kk",
    name: "Kazakh",
    nativeName: "Қазақша",
    countries: ["KZ"],
  },
  {
    code: "uz",
    name: "Uzbek",
    nativeName: "Oʻzbekcha",
    countries: ["UZ"],
  },
  {
    code: "tk",
    name: "Turkmen",
    nativeName: "Türkmençe",
    countries: ["TM"],
  },
  {
    code: "ky",
    name: "Kyrgyz",
    nativeName: "Кыргызча",
    countries: ["KG"],
  },
  {
    code: "tg",
    name: "Tajik",
    nativeName: "Тоҷикӣ",
    countries: ["TJ"],
  },
  {
    code: "mn",
    name: "Mongolian",
    nativeName: "Монгол",
    countries: ["MN"],
  },

  {
    code: "ps",
    name: "Pashto",
    nativeName: "پښتو",
    countries: ["AF", "PK"],
  },
  {
    code: "ku",
    name: "Kurdish",
    nativeName: "Kurdî",
    countries: ["TR", "IQ", "IR", "SY"],
  },

  {
    code: "la",
    name: "Latin",
    nativeName: "Latina",
    countries: ["VA"],
  },
] as const;

//
// ============================================================
// GLOBAL VOCABULARY SEED
// ============================================================
// This is the initial seed.
// The architecture is intentionally expandable.
// Do not place intent logic here.
//

export const GLOBAL_195_VOCABULARY: readonly GlobalVocabularyEntry[] = [
  // Khmer
  {
    term: "សួស្តី",
    language: "km",
    countries: ["KH"],
    category: "greeting",
    aliases: ["សួស្ដី"],
  },
  {
    term: "អរគុណ",
    language: "km",
    countries: ["KH"],
    category: "common",
  },
  {
    term: "បាទ",
    language: "km",
    countries: ["KH"],
    category: "answer",
  },
  {
    term: "ចាស",
    language: "km",
    countries: ["KH"],
    category: "answer",
  },
  {
    term: "សូម",
    language: "km",
    countries: ["KH"],
    category: "common",
  },
  {
    term: "ជួយ",
    language: "km",
    countries: ["KH"],
    category: "command",
  },

  // English
  {
    term: "hello",
    language: "en",
    countries: ["US", "GB", "CA", "AU", "NZ"],
    category: "greeting",
    aliases: ["hi", "hey"],
  },
  {
    term: "thanks",
    language: "en",
    countries: ["US", "GB", "CA", "AU", "NZ"],
    category: "common",
    aliases: ["thank you"],
  },
  {
    term: "yes",
    language: "en",
    countries: ["US", "GB", "CA", "AU", "NZ"],
    category: "answer",
  },
  {
    term: "no",
    language: "en",
    countries: ["US", "GB", "CA", "AU", "NZ"],
    category: "answer",
  },
  {
    term: "please",
    language: "en",
    countries: ["US", "GB", "CA", "AU", "NZ"],
    category: "common",
  },
  {
    term: "help",
    language: "en",
    countries: ["US", "GB", "CA", "AU", "NZ"],
    category: "command",
  },

  // Thai
  {
    term: "สวัสดี",
    language: "th",
    countries: ["TH"],
    category: "greeting",
  },

  // Vietnamese
  {
    term: "xin chào",
    language: "vi",
    countries: ["VN"],
    category: "greeting",
  },

  // Chinese
  {
    term: "你好",
    language: "zh",
    countries: ["CN", "TW", "SG", "MY"],
    category: "greeting",
  },

  // Japanese
  {
    term: "こんにちは",
    language: "ja",
    countries: ["JP"],
    category: "greeting",
  },

  // Korean
  {
    term: "안녕하세요",
    language: "ko",
    countries: ["KR", "KP"],
    category: "greeting",
  },

  // Spanish
  {
    term: "hola",
    language: "es",
    countries: ["ES", "MX", "AR", "CO", "CL", "PE"],
    category: "greeting",
  },

  // French
  {
    term: "bonjour",
    language: "fr",
    countries: ["FR", "BE", "CH", "CA"],
    category: "greeting",
  },

  // German
  {
    term: "hallo",
    language: "de",
    countries: ["DE", "AT", "CH"],
    category: "greeting",
  },

  // Italian
  {
    term: "ciao",
    language: "it",
    countries: ["IT", "CH"],
    category: "greeting",
  },

  // Portuguese
  {
    term: "olá",
    language: "pt",
    countries: ["PT", "BR", "AO", "MZ"],
    category: "greeting",
  },

  // Russian
  {
    term: "привет",
    language: "ru",
    countries: ["RU", "BY", "KZ", "KG"],
    category: "greeting",
  },

  // Arabic
  {
    term: "مرحبا",
    language: "ar",
    countries: ["SA", "AE", "EG", "JO", "LB"],
    category: "greeting",
  },

  // Indonesian
  {
    term: "halo",
    language: "id",
    countries: ["ID"],
    category: "greeting",
  },

  // Malay
  {
    term: "selamat",
    language: "ms",
    countries: ["MY", "BN", "SG"],
    category: "greeting",
  },

  // Filipino
  {
    term: "kumusta",
    language: "tl",
    countries: ["PH"],
    category: "greeting",
  },

  // Hindi
  {
    term: "नमस्ते",
    language: "hi",
    countries: ["IN"],
    category: "greeting",
  },

  // Bengali
  {
    term: "হ্যালো",
    language: "bn",
    countries: ["BD", "IN"],
    category: "greeting",
  },

  // Turkish
  {
    term: "merhaba",
    language: "tr",
    countries: ["TR", "CY"],
    category: "greeting",
  },

  // Persian
  {
    term: "سلام",
    language: "fa",
    countries: ["IR", "AF", "TJ"],
    category: "greeting",
  },

  // Swahili
  {
    term: "habari",
    language: "sw",
    countries: ["TZ", "KE", "UG", "RW", "BI", "CD"],
    category: "greeting",
  },

  // Amharic
  {
    term: "ሰላም",
    language: "am",
    countries: ["ET"],
    category: "greeting",
  },
] as const;

// ============================================================
// Helpers
// ============================================================

export function getGlobalLanguages(): readonly GlobalLanguageEntry[] {
  return GLOBAL_LANGUAGES;
}

export function getVocabularyByLanguage(
  language: string,
): readonly GlobalVocabularyEntry[] {
  return GLOBAL_195_VOCABULARY.filter(
    (entry) => entry.language.toLowerCase() === language.toLowerCase(),
  );
}

export function getVocabularyByCategory(
  category: GlobalVocabularyCategory,
): readonly GlobalVocabularyEntry[] {
  return GLOBAL_195_VOCABULARY.filter(
    (entry) => entry.category === category,
  );
}
