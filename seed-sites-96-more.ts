import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Site, Organization } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

// 96 additional distinct real countries (ISO 3166-1 alpha-2) — none overlap
// with the original seed-sites-99.ts list. 99 + 96 = 195 total.
const COUNTRIES: { name: string; country: string }[] = [
  { name: "Afghanistan Site", country: "AF" }, { name: "Antigua and Barbuda Site", country: "AG" },
  { name: "Armenia Site", country: "AM" }, { name: "Angola Site", country: "AO" },
  { name: "Azerbaijan Site", country: "AZ" }, { name: "Barbados Site", country: "BB" },
  { name: "Burkina Faso Site", country: "BF" }, { name: "Burundi Site", country: "BI" },
  { name: "Benin Site", country: "BJ" }, { name: "Brunei Site", country: "BN" },
  { name: "Bahamas Site", country: "BS" }, { name: "Bhutan Site", country: "BT" },
  { name: "Botswana Site", country: "BW" }, { name: "Belarus Site", country: "BY" },
  { name: "Belize Site", country: "BZ" }, { name: "DR Congo Site", country: "CD" },
  { name: "Central African Republic Site", country: "CF" }, { name: "Congo Site", country: "CG" },
  { name: "Ivory Coast Site", country: "CI" }, { name: "Cameroon Site", country: "CM" },
  { name: "Cuba Site", country: "CU" }, { name: "Cabo Verde Site", country: "CV" },
  { name: "Djibouti Site", country: "DJ" }, { name: "Dominica Site", country: "DM" },
  { name: "Algeria Site", country: "DZ" }, { name: "Eritrea Site", country: "ER" },
  { name: "Micronesia Site", country: "FM" }, { name: "Gabon Site", country: "GA" },
  { name: "Grenada Site", country: "GD" }, { name: "Gambia Site", country: "GM" },
  { name: "Guinea Site", country: "GN" }, { name: "Equatorial Guinea Site", country: "GQ" },
  { name: "Guinea-Bissau Site", country: "GW" }, { name: "Guyana Site", country: "GY" },
  { name: "Haiti Site", country: "HT" }, { name: "Iraq Site", country: "IQ" },
  { name: "Iran Site", country: "IR" }, { name: "Jamaica Site", country: "JM" },
  { name: "Kyrgyzstan Site", country: "KG" }, { name: "Kiribati Site", country: "KI" },
  { name: "Comoros Site", country: "KM" }, { name: "Saint Kitts and Nevis Site", country: "KN" },
  { name: "North Korea Site", country: "KP" }, { name: "Lebanon Site", country: "LB" },
  { name: "Saint Lucia Site", country: "LC" }, { name: "Liechtenstein Site", country: "LI" },
  { name: "Liberia Site", country: "LR" }, { name: "Lesotho Site", country: "LS" },
  { name: "Libya Site", country: "LY" }, { name: "Monaco Site", country: "MC" },
  { name: "Moldova Site", country: "MD" }, { name: "Montenegro Site", country: "ME" },
  { name: "Madagascar Site", country: "MG" }, { name: "Marshall Islands Site", country: "MH" },
  { name: "Mali Site", country: "ML" }, { name: "Mauritania Site", country: "MR" },
  { name: "Mauritius Site", country: "MU" }, { name: "Maldives Site", country: "MV" },
  { name: "Malawi Site", country: "MW" }, { name: "Mozambique Site", country: "MZ" },
  { name: "Namibia Site", country: "NA" }, { name: "Niger Site", country: "NE" },
  { name: "Nicaragua Site", country: "NI" }, { name: "Nauru Site", country: "NR" },
  { name: "Papua New Guinea Site", country: "PG" }, { name: "Palau Site", country: "PW" },
  { name: "Rwanda Site", country: "RW" }, { name: "Solomon Islands Site", country: "SB" },
  { name: "Seychelles Site", country: "SC" }, { name: "Sudan Site", country: "SD" },
  { name: "Sierra Leone Site", country: "SL" }, { name: "San Marino Site", country: "SM" },
  { name: "Senegal Site", country: "SN" }, { name: "Somalia Site", country: "SO" },
  { name: "Suriname Site", country: "SR" }, { name: "South Sudan Site", country: "SS" },
  { name: "Sao Tome and Principe Site", country: "ST" }, { name: "Syria Site", country: "SY" },
  { name: "Eswatini Site", country: "SZ" }, { name: "Chad Site", country: "TD" },
  { name: "Togo Site", country: "TG" }, { name: "Tajikistan Site", country: "TJ" },
  { name: "Timor-Leste Site", country: "TL" }, { name: "Turkmenistan Site", country: "TM" },
  { name: "Tonga Site", country: "TO" }, { name: "Trinidad and Tobago Site", country: "TT" },
  { name: "Tuvalu Site", country: "TV" }, { name: "Tanzania Site", country: "TZ" },
  { name: "Uganda Site", country: "UG" }, { name: "Vatican City Site", country: "VA" },
  { name: "Saint Vincent and the Grenadines Site", country: "VC" }, { name: "Vanuatu Site", country: "VU" },
  { name: "Samoa Site", country: "WS" }, { name: "Yemen Site", country: "YE" },
  { name: "Zambia Site", country: "ZM" }, { name: "Zimbabwe Site", country: "ZW" },
];

async function seed() {
  await connectDatabase();
  const org = await Organization.findById(ORG_ID);
  if (!org) { console.log("Org not found."); process.exit(1); }

  const uniqueCountries = new Set(COUNTRIES.map(c => c.country));
  if (uniqueCountries.size !== COUNTRIES.length) {
    console.log(`WARNING: ${COUNTRIES.length - uniqueCountries.size} duplicate country codes in this new batch. Aborting.`);
    process.exit(1);
  }

  const existing = await Site.find({ organizationId: org._id }).distinct("country");
  const overlap = COUNTRIES.filter(c => existing.includes(c.country));
  if (overlap.length > 0) {
    console.log("WARNING: overlap with existing sites, aborting:", overlap.map(c => c.country));
    process.exit(1);
  }

  const created = await Site.insertMany(COUNTRIES.map(c => ({ ...c, organizationId: org._id })));
  const total = await Site.countDocuments({ organizationId: org._id });
  console.log(`Inserted ${created.length} new sites. Total sites now: ${total}`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
