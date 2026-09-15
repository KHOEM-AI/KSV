// ======================================================================
// KSV — International System (Domain #1: Global & International)
// File: src/data/countries.ts
//
// Principle (as defined by the project owner):
//   Country ≠ Language ≠ Time Zone
//   Each country's users see THEIR OWN real local time — never a single
//   "universal" time forced on everyone. Time is computed live from the
//   official IANA Time Zone Database identifier, not hardcoded offsets
//   (offsets change with Daylight Saving Time; zone IDs do not).
// ======================================================================

export interface Country {
  /** ISO 3166-1 alpha-2 code */
  code: string;
  /** English name */
  name: string;
  /** IANA Time Zone Database identifier(s). Countries that span multiple
   *  zones (e.g. USA, Russia, Brazil) list every zone; `timezone` is the
   *  default/primary one (usually the capital's zone). */
  timezone: string;
  timezones?: string[];
  /** International calling code */
  dialCode: string;
}

// 195 countries = 193 UN member states + 2 UN observer states
// (Vatican City / Holy See, State of Palestine), matching the KSV spec.
export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", timezone: "Asia/Kabul", dialCode: "+93" },
  { code: "AL", name: "Albania", timezone: "Europe/Tirane", dialCode: "+355" },
  { code: "DZ", name: "Algeria", timezone: "Africa/Algiers", dialCode: "+213" },
  { code: "AD", name: "Andorra", timezone: "Europe/Andorra", dialCode: "+376" },
  { code: "AO", name: "Angola", timezone: "Africa/Luanda", dialCode: "+244" },
  { code: "AG", name: "Antigua and Barbuda", timezone: "America/Antigua", dialCode: "+1268" },
  { code: "AR", name: "Argentina", timezone: "America/Argentina/Buenos_Aires", dialCode: "+54" },
  { code: "AM", name: "Armenia", timezone: "Asia/Yerevan", dialCode: "+374" },
  { code: "AU", name: "Australia", timezone: "Australia/Sydney", dialCode: "+61",
    timezones: ["Australia/Perth", "Australia/Darwin", "Australia/Adelaide", "Australia/Brisbane", "Australia/Sydney", "Australia/Melbourne", "Australia/Hobart"] },
  { code: "AT", name: "Austria", timezone: "Europe/Vienna", dialCode: "+43" },
  { code: "AZ", name: "Azerbaijan", timezone: "Asia/Baku", dialCode: "+994" },
  { code: "BS", name: "Bahamas", timezone: "America/Nassau", dialCode: "+1242" },
  { code: "BH", name: "Bahrain", timezone: "Asia/Bahrain", dialCode: "+973" },
  { code: "BD", name: "Bangladesh", timezone: "Asia/Dhaka", dialCode: "+880" },
  { code: "BB", name: "Barbados", timezone: "America/Barbados", dialCode: "+1246" },
  { code: "BY", name: "Belarus", timezone: "Europe/Minsk", dialCode: "+375" },
  { code: "BE", name: "Belgium", timezone: "Europe/Brussels", dialCode: "+32" },
  { code: "BZ", name: "Belize", timezone: "America/Belize", dialCode: "+501" },
  { code: "BJ", name: "Benin", timezone: "Africa/Porto-Novo", dialCode: "+229" },
  { code: "BT", name: "Bhutan", timezone: "Asia/Thimphu", dialCode: "+975" },
  { code: "BO", name: "Bolivia", timezone: "America/La_Paz", dialCode: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", timezone: "Europe/Sarajevo", dialCode: "+387" },
  { code: "BW", name: "Botswana", timezone: "Africa/Gaborone", dialCode: "+267" },
  { code: "BR", name: "Brazil", timezone: "America/Sao_Paulo", dialCode: "+55",
    timezones: ["America/Noronha", "America/Sao_Paulo", "America/Manaus", "America/Rio_Branco"] },
  { code: "BN", name: "Brunei", timezone: "Asia/Brunei", dialCode: "+673" },
  { code: "BG", name: "Bulgaria", timezone: "Europe/Sofia", dialCode: "+359" },
  { code: "BF", name: "Burkina Faso", timezone: "Africa/Ouagadougou", dialCode: "+226" },
  { code: "BI", name: "Burundi", timezone: "Africa/Bujumbura", dialCode: "+257" },
  { code: "CV", name: "Cabo Verde", timezone: "Atlantic/Cape_Verde", dialCode: "+238" },
  { code: "KH", name: "Cambodia", timezone: "Asia/Phnom_Penh", dialCode: "+855" },
  { code: "CM", name: "Cameroon", timezone: "Africa/Douala", dialCode: "+237" },
  { code: "CA", name: "Canada", timezone: "America/Toronto", dialCode: "+1",
    timezones: ["America/St_Johns", "America/Halifax", "America/Toronto", "America/Winnipeg", "America/Edmonton", "America/Vancouver"] },
  { code: "CF", name: "Central African Republic", timezone: "Africa/Bangui", dialCode: "+236" },
  { code: "TD", name: "Chad", timezone: "Africa/Ndjamena", dialCode: "+235" },
  { code: "CL", name: "Chile", timezone: "America/Santiago", dialCode: "+56" },
  { code: "CN", name: "China", timezone: "Asia/Shanghai", dialCode: "+86" },
  { code: "CO", name: "Colombia", timezone: "America/Bogota", dialCode: "+57" },
  { code: "KM", name: "Comoros", timezone: "Indian/Comoro", dialCode: "+269" },
  { code: "CG", name: "Congo, Republic of the", timezone: "Africa/Brazzaville", dialCode: "+242" },
  { code: "CD", name: "Congo, DR", timezone: "Africa/Kinshasa", dialCode: "+243",
    timezones: ["Africa/Kinshasa", "Africa/Lubumbashi"] },
  { code: "CR", name: "Costa Rica", timezone: "America/Costa_Rica", dialCode: "+506" },
  { code: "CI", name: "Côte d'Ivoire", timezone: "Africa/Abidjan", dialCode: "+225" },
  { code: "HR", name: "Croatia", timezone: "Europe/Zagreb", dialCode: "+385" },
  { code: "CU", name: "Cuba", timezone: "America/Havana", dialCode: "+53" },
  { code: "CY", name: "Cyprus", timezone: "Asia/Nicosia", dialCode: "+357" },
  { code: "CZ", name: "Czechia", timezone: "Europe/Prague", dialCode: "+420" },
  { code: "DK", name: "Denmark", timezone: "Europe/Copenhagen", dialCode: "+45" },
  { code: "DJ", name: "Djibouti", timezone: "Africa/Djibouti", dialCode: "+253" },
  { code: "DM", name: "Dominica", timezone: "America/Dominica", dialCode: "+1767" },
  { code: "DO", name: "Dominican Republic", timezone: "America/Santo_Domingo", dialCode: "+1809" },
  { code: "EC", name: "Ecuador", timezone: "America/Guayaquil", dialCode: "+593" },
  { code: "EG", name: "Egypt", timezone: "Africa/Cairo", dialCode: "+20" },
  { code: "SV", name: "El Salvador", timezone: "America/El_Salvador", dialCode: "+503" },
  { code: "GQ", name: "Equatorial Guinea", timezone: "Africa/Malabo", dialCode: "+240" },
  { code: "ER", name: "Eritrea", timezone: "Africa/Asmara", dialCode: "+291" },
  { code: "EE", name: "Estonia", timezone: "Europe/Tallinn", dialCode: "+372" },
  { code: "SZ", name: "Eswatini", timezone: "Africa/Mbabane", dialCode: "+268" },
  { code: "ET", name: "Ethiopia", timezone: "Africa/Addis_Ababa", dialCode: "+251" },
  { code: "FJ", name: "Fiji", timezone: "Pacific/Fiji", dialCode: "+679" },
  { code: "FI", name: "Finland", timezone: "Europe/Helsinki", dialCode: "+358" },
  { code: "FR", name: "France", timezone: "Europe/Paris", dialCode: "+33" },
  { code: "GA", name: "Gabon", timezone: "Africa/Libreville", dialCode: "+241" },
  { code: "GM", name: "Gambia", timezone: "Africa/Banjul", dialCode: "+220" },
  { code: "GE", name: "Georgia", timezone: "Asia/Tbilisi", dialCode: "+995" },
  { code: "DE", name: "Germany", timezone: "Europe/Berlin", dialCode: "+49" },
  { code: "GH", name: "Ghana", timezone: "Africa/Accra", dialCode: "+233" },
  { code: "GR", name: "Greece", timezone: "Europe/Athens", dialCode: "+30" },
  { code: "GD", name: "Grenada", timezone: "America/Grenada", dialCode: "+1473" },
  { code: "GT", name: "Guatemala", timezone: "America/Guatemala", dialCode: "+502" },
  { code: "GN", name: "Guinea", timezone: "Africa/Conakry", dialCode: "+224" },
  { code: "GW", name: "Guinea-Bissau", timezone: "Africa/Bissau", dialCode: "+245" },
  { code: "GY", name: "Guyana", timezone: "America/Guyana", dialCode: "+592" },
  { code: "HT", name: "Haiti", timezone: "America/Port-au-Prince", dialCode: "+509" },
  { code: "HN", name: "Honduras", timezone: "America/Tegucigalpa", dialCode: "+504" },
  { code: "HU", name: "Hungary", timezone: "Europe/Budapest", dialCode: "+36" },
  { code: "IS", name: "Iceland", timezone: "Atlantic/Reykjavik", dialCode: "+354" },
  { code: "IN", name: "India", timezone: "Asia/Kolkata", dialCode: "+91" },
  { code: "ID", name: "Indonesia", timezone: "Asia/Jakarta", dialCode: "+62",
    timezones: ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"] },
  { code: "IR", name: "Iran", timezone: "Asia/Tehran", dialCode: "+98" },
  { code: "IQ", name: "Iraq", timezone: "Asia/Baghdad", dialCode: "+964" },
  { code: "IE", name: "Ireland", timezone: "Europe/Dublin", dialCode: "+353" },
  { code: "IL", name: "Israel", timezone: "Asia/Jerusalem", dialCode: "+972" },
  { code: "IT", name: "Italy", timezone: "Europe/Rome", dialCode: "+39" },
  { code: "JM", name: "Jamaica", timezone: "America/Jamaica", dialCode: "+1876" },
  { code: "JP", name: "Japan", timezone: "Asia/Tokyo", dialCode: "+81" },
  { code: "JO", name: "Jordan", timezone: "Asia/Amman", dialCode: "+962" },
  { code: "KZ", name: "Kazakhstan", timezone: "Asia/Almaty", dialCode: "+7" },
  { code: "KE", name: "Kenya", timezone: "Africa/Nairobi", dialCode: "+254" },
  { code: "KI", name: "Kiribati", timezone: "Pacific/Tarawa", dialCode: "+686" },
  { code: "KP", name: "Korea, North", timezone: "Asia/Pyongyang", dialCode: "+850" },
  { code: "KR", name: "Korea, South", timezone: "Asia/Seoul", dialCode: "+82" },
  { code: "KW", name: "Kuwait", timezone: "Asia/Kuwait", dialCode: "+965" },
  { code: "KG", name: "Kyrgyzstan", timezone: "Asia/Bishkek", dialCode: "+996" },
  { code: "LA", name: "Laos", timezone: "Asia/Vientiane", dialCode: "+856" },
  { code: "LV", name: "Latvia", timezone: "Europe/Riga", dialCode: "+371" },
  { code: "LB", name: "Lebanon", timezone: "Asia/Beirut", dialCode: "+961" },
  { code: "LS", name: "Lesotho", timezone: "Africa/Maseru", dialCode: "+266" },
  { code: "LR", name: "Liberia", timezone: "Africa/Monrovia", dialCode: "+231" },
  { code: "LY", name: "Libya", timezone: "Africa/Tripoli", dialCode: "+218" },
  { code: "LI", name: "Liechtenstein", timezone: "Europe/Vaduz", dialCode: "+423" },
  { code: "LT", name: "Lithuania", timezone: "Europe/Vilnius", dialCode: "+370" },
  { code: "LU", name: "Luxembourg", timezone: "Europe/Luxembourg", dialCode: "+352" },
  { code: "MG", name: "Madagascar", timezone: "Indian/Antananarivo", dialCode: "+261" },
  { code: "MW", name: "Malawi", timezone: "Africa/Blantyre", dialCode: "+265" },
  { code: "MY", name: "Malaysia", timezone: "Asia/Kuala_Lumpur", dialCode: "+60" },
  { code: "MV", name: "Maldives", timezone: "Indian/Maldives", dialCode: "+960" },
  { code: "ML", name: "Mali", timezone: "Africa/Bamako", dialCode: "+223" },
  { code: "MT", name: "Malta", timezone: "Europe/Malta", dialCode: "+356" },
  { code: "MH", name: "Marshall Islands", timezone: "Pacific/Majuro", dialCode: "+692" },
  { code: "MR", name: "Mauritania", timezone: "Africa/Nouakchott", dialCode: "+222" },
  { code: "MU", name: "Mauritius", timezone: "Indian/Mauritius", dialCode: "+230" },
  { code: "MX", name: "Mexico", timezone: "America/Mexico_City", dialCode: "+52",
    timezones: ["America/Tijuana", "America/Hermosillo", "America/Mexico_City", "America/Cancun"] },
  { code: "FM", name: "Micronesia", timezone: "Pacific/Chuuk", dialCode: "+691" },
  { code: "MD", name: "Moldova", timezone: "Europe/Chisinau", dialCode: "+373" },
  { code: "MC", name: "Monaco", timezone: "Europe/Monaco", dialCode: "+377" },
  { code: "MN", name: "Mongolia", timezone: "Asia/Ulaanbaatar", dialCode: "+976" },
  { code: "ME", name: "Montenegro", timezone: "Europe/Podgorica", dialCode: "+382" },
  { code: "MA", name: "Morocco", timezone: "Africa/Casablanca", dialCode: "+212" },
  { code: "MZ", name: "Mozambique", timezone: "Africa/Maputo", dialCode: "+258" },
  { code: "MM", name: "Myanmar", timezone: "Asia/Yangon", dialCode: "+95" },
  { code: "NA", name: "Namibia", timezone: "Africa/Windhoek", dialCode: "+264" },
  { code: "NR", name: "Nauru", timezone: "Pacific/Nauru", dialCode: "+674" },
  { code: "NP", name: "Nepal", timezone: "Asia/Kathmandu", dialCode: "+977" },
  { code: "NL", name: "Netherlands", timezone: "Europe/Amsterdam", dialCode: "+31" },
  { code: "NZ", name: "New Zealand", timezone: "Pacific/Auckland", dialCode: "+64" },
  { code: "NI", name: "Nicaragua", timezone: "America/Managua", dialCode: "+505" },
  { code: "NE", name: "Niger", timezone: "Africa/Niamey", dialCode: "+227" },
  { code: "NG", name: "Nigeria", timezone: "Africa/Lagos", dialCode: "+234" },
  { code: "MK", name: "North Macedonia", timezone: "Europe/Skopje", dialCode: "+389" },
  { code: "NO", name: "Norway", timezone: "Europe/Oslo", dialCode: "+47" },
  { code: "OM", name: "Oman", timezone: "Asia/Muscat", dialCode: "+968" },
  { code: "PK", name: "Pakistan", timezone: "Asia/Karachi", dialCode: "+92" },
  { code: "PW", name: "Palau", timezone: "Pacific/Palau", dialCode: "+680" },
  { code: "PS", name: "Palestine", timezone: "Asia/Gaza", dialCode: "+970" },
  { code: "PA", name: "Panama", timezone: "America/Panama", dialCode: "+507" },
  { code: "PG", name: "Papua New Guinea", timezone: "Pacific/Port_Moresby", dialCode: "+675" },
  { code: "PY", name: "Paraguay", timezone: "America/Asuncion", dialCode: "+595" },
  { code: "PE", name: "Peru", timezone: "America/Lima", dialCode: "+51" },
  { code: "PH", name: "Philippines", timezone: "Asia/Manila", dialCode: "+63" },
  { code: "PL", name: "Poland", timezone: "Europe/Warsaw", dialCode: "+48" },
  { code: "PT", name: "Portugal", timezone: "Europe/Lisbon", dialCode: "+351" },
  { code: "QA", name: "Qatar", timezone: "Asia/Qatar", dialCode: "+974" },
  { code: "RO", name: "Romania", timezone: "Europe/Bucharest", dialCode: "+40" },
  { code: "RU", name: "Russia", timezone: "Europe/Moscow", dialCode: "+7",
    timezones: ["Europe/Kaliningrad", "Europe/Moscow", "Asia/Yekaterinburg", "Asia/Novosibirsk", "Asia/Irkutsk", "Asia/Vladivostok", "Asia/Kamchatka"] },
  { code: "RW", name: "Rwanda", timezone: "Africa/Kigali", dialCode: "+250" },
  { code: "KN", name: "Saint Kitts and Nevis", timezone: "America/St_Kitts", dialCode: "+1869" },
  { code: "LC", name: "Saint Lucia", timezone: "America/St_Lucia", dialCode: "+1758" },
  { code: "VC", name: "Saint Vincent and the Grenadines", timezone: "America/St_Vincent", dialCode: "+1784" },
  { code: "WS", name: "Samoa", timezone: "Pacific/Apia", dialCode: "+685" },
  { code: "SM", name: "San Marino", timezone: "Europe/San_Marino", dialCode: "+378" },
  { code: "ST", name: "Sao Tome and Principe", timezone: "Africa/Sao_Tome", dialCode: "+239" },
  { code: "SA", name: "Saudi Arabia", timezone: "Asia/Riyadh", dialCode: "+966" },
  { code: "SN", name: "Senegal", timezone: "Africa/Dakar", dialCode: "+221" },
  { code: "RS", name: "Serbia", timezone: "Europe/Belgrade", dialCode: "+381" },
  { code: "SC", name: "Seychelles", timezone: "Indian/Mahe", dialCode: "+248" },
  { code: "SL", name: "Sierra Leone", timezone: "Africa/Freetown", dialCode: "+232" },
  { code: "SG", name: "Singapore", timezone: "Asia/Singapore", dialCode: "+65" },
  { code: "SK", name: "Slovakia", timezone: "Europe/Bratislava", dialCode: "+421" },
  { code: "SI", name: "Slovenia", timezone: "Europe/Ljubljana", dialCode: "+386" },
  { code: "SB", name: "Solomon Islands", timezone: "Pacific/Guadalcanal", dialCode: "+677" },
  { code: "SO", name: "Somalia", timezone: "Africa/Mogadishu", dialCode: "+252" },
  { code: "ZA", name: "South Africa", timezone: "Africa/Johannesburg", dialCode: "+27" },
  { code: "SS", name: "South Sudan", timezone: "Africa/Juba", dialCode: "+211" },
  { code: "ES", name: "Spain", timezone: "Europe/Madrid", dialCode: "+34" },
  { code: "LK", name: "Sri Lanka", timezone: "Asia/Colombo", dialCode: "+94" },
  { code: "SD", name: "Sudan", timezone: "Africa/Khartoum", dialCode: "+249" },
  { code: "SR", name: "Suriname", timezone: "America/Paramaribo", dialCode: "+597" },
  { code: "SE", name: "Sweden", timezone: "Europe/Stockholm", dialCode: "+46" },
  { code: "CH", name: "Switzerland", timezone: "Europe/Zurich", dialCode: "+41" },
  { code: "SY", name: "Syria", timezone: "Asia/Damascus", dialCode: "+963" },
  { code: "TW", name: "Taiwan", timezone: "Asia/Taipei", dialCode: "+886" },
  { code: "TJ", name: "Tajikistan", timezone: "Asia/Dushanbe", dialCode: "+992" },
  { code: "TZ", name: "Tanzania", timezone: "Africa/Dar_es_Salaam", dialCode: "+255" },
  { code: "TH", name: "Thailand", timezone: "Asia/Bangkok", dialCode: "+66" },
  { code: "TL", name: "Timor-Leste", timezone: "Asia/Dili", dialCode: "+670" },
  { code: "TG", name: "Togo", timezone: "Africa/Lome", dialCode: "+228" },
  { code: "TO", name: "Tonga", timezone: "Pacific/Tongatapu", dialCode: "+676" },
  { code: "TT", name: "Trinidad and Tobago", timezone: "America/Port_of_Spain", dialCode: "+1868" },
  { code: "TN", name: "Tunisia", timezone: "Africa/Tunis", dialCode: "+216" },
  { code: "TR", name: "Turkey", timezone: "Europe/Istanbul", dialCode: "+90" },
  { code: "TM", name: "Turkmenistan", timezone: "Asia/Ashgabat", dialCode: "+993" },
  { code: "TV", name: "Tuvalu", timezone: "Pacific/Funafuti", dialCode: "+688" },
  { code: "UG", name: "Uganda", timezone: "Africa/Kampala", dialCode: "+256" },
  { code: "UA", name: "Ukraine", timezone: "Europe/Kyiv", dialCode: "+380" },
  { code: "AE", name: "United Arab Emirates", timezone: "Asia/Dubai", dialCode: "+971" },
  { code: "GB", name: "United Kingdom", timezone: "Europe/London", dialCode: "+44" },
  { code: "US", name: "United States", timezone: "America/New_York", dialCode: "+1",
    timezones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"] },
  { code: "UY", name: "Uruguay", timezone: "America/Montevideo", dialCode: "+598" },
  { code: "UZ", name: "Uzbekistan", timezone: "Asia/Tashkent", dialCode: "+998" },
  { code: "VU", name: "Vanuatu", timezone: "Pacific/Efate", dialCode: "+678" },
  { code: "VA", name: "Vatican City", timezone: "Europe/Vatican", dialCode: "+379" },
  { code: "VE", name: "Venezuela", timezone: "America/Caracas", dialCode: "+58" },
  { code: "VN", name: "Vietnam", timezone: "Asia/Ho_Chi_Minh", dialCode: "+84" },
  { code: "YE", name: "Yemen", timezone: "Asia/Aden", dialCode: "+967" },
  { code: "ZM", name: "Zambia", timezone: "Africa/Lusaka", dialCode: "+260" },
  { code: "ZW", name: "Zimbabwe", timezone: "Africa/Harare", dialCode: "+263" },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/**
 * Returns the current real local time for a given IANA timezone.
 * This NEVER hardcodes an offset — it always asks the runtime's own
 * timezone database, so Daylight Saving Time and historical rule
 * changes are always correct automatically.
 */
export function getLocalTime(timezone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function getLocalDateTime(timezone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** UTC offset string, e.g. "+07:00" — computed live, not hardcoded. */
export function getUtcOffset(timezone: string, date: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const part = dtf.formatToParts(date).find((p) => p.type === "timeZoneName");
  return part ? part.value.replace("GMT", "UTC") : "";
}
