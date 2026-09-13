import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Site, Organization } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

// 99 distinct real countries (ISO 3166-1 alpha-2) — one site each.
const COUNTRIES: { name: string; country: string }[] = [
  { name: "Germany Site", country: "DE" }, { name: "Taiwan Site", country: "TW" },
  { name: "South Korea Site", country: "KR" }, { name: "Singapore Site", country: "SG" },
  { name: "UAE Site", country: "AE" }, { name: "Japan Site", country: "JP" },
  { name: "Netherlands Site", country: "NL" }, { name: "United Kingdom Site", country: "GB" },
  { name: "United States Site", country: "US" }, { name: "Canada Site", country: "CA" },
  { name: "Australia Site", country: "AU" }, { name: "India Site", country: "IN" },
  { name: "Brazil Site", country: "BR" }, { name: "Mexico Site", country: "MX" },
  { name: "France Site", country: "FR" }, { name: "Spain Site", country: "ES" },
  { name: "Italy Site", country: "IT" }, { name: "Portugal Site", country: "PT" },
  { name: "Switzerland Site", country: "CH" }, { name: "Austria Site", country: "AT" },
  { name: "Belgium Site", country: "BE" }, { name: "Sweden Site", country: "SE" },
  { name: "Norway Site", country: "NO" }, { name: "Denmark Site", country: "DK" },
  { name: "Finland Site", country: "FI" }, { name: "Poland Site", country: "PL" },
  { name: "Czechia Site", country: "CZ" }, { name: "Hungary Site", country: "HU" },
  { name: "Greece Site", country: "GR" }, { name: "Ireland Site", country: "IE" },
  { name: "Romania Site", country: "RO" }, { name: "Bulgaria Site", country: "BG" },
  { name: "Croatia Site", country: "HR" }, { name: "Slovakia Site", country: "SK" },
  { name: "Slovenia Site", country: "SI" }, { name: "Lithuania Site", country: "LT" },
  { name: "Latvia Site", country: "LV" }, { name: "Estonia Site", country: "EE" },
  { name: "Russia Site", country: "RU" }, { name: "Ukraine Site", country: "UA" },
  { name: "Turkey Site", country: "TR" }, { name: "Israel Site", country: "IL" },
  { name: "Saudi Arabia Site", country: "SA" }, { name: "Qatar Site", country: "QA" },
  { name: "Kuwait Site", country: "KW" }, { name: "Bahrain Site", country: "BH" },
  { name: "Oman Site", country: "OM" }, { name: "Jordan Site", country: "JO" },
  { name: "Egypt Site", country: "EG" }, { name: "South Africa Site", country: "ZA" },
  { name: "Nigeria Site", country: "NG" }, { name: "Kenya Site", country: "KE" },
  { name: "Morocco Site", country: "MA" }, { name: "Tunisia Site", country: "TN" },
  { name: "Ghana Site", country: "GH" }, { name: "Ethiopia Site", country: "ET" },
  { name: "China Site", country: "CN" }, { name: "Hong Kong Site", country: "HK" },
  { name: "Thailand Site", country: "TH" }, { name: "Vietnam Site", country: "VN" },
  { name: "Malaysia Site", country: "MY" }, { name: "Indonesia Site", country: "ID" },
  { name: "Philippines Site", country: "PH" }, { name: "Pakistan Site", country: "PK" },
  { name: "Bangladesh Site", country: "BD" }, { name: "Sri Lanka Site", country: "LK" },
  { name: "Nepal Site", country: "NP" }, { name: "Myanmar Site", country: "MM" },
  { name: "Cambodia Site", country: "KH" }, { name: "Laos Site", country: "LA" },
  { name: "Mongolia Site", country: "MN" }, { name: "Kazakhstan Site", country: "KZ" },
  { name: "Uzbekistan Site", country: "UZ" }, { name: "Argentina Site", country: "AR" },
  { name: "Chile Site", country: "CL" }, { name: "Colombia Site", country: "CO" },
  { name: "Peru Site", country: "PE" }, { name: "Venezuela Site", country: "VE" },
  { name: "Ecuador Site", country: "EC" }, { name: "Uruguay Site", country: "UY" },
  { name: "Paraguay Site", country: "PY" }, { name: "Bolivia Site", country: "BO" },
  { name: "Costa Rica Site", country: "CR" }, { name: "Panama Site", country: "PA" },
  { name: "Dominican Republic Site", country: "DO" }, { name: "Guatemala Site", country: "GT" },
  { name: "Honduras Site", country: "HN" }, { name: "El Salvador Site", country: "SV" },
  { name: "New Zealand Site", country: "NZ" }, { name: "Fiji Site", country: "FJ" },
  { name: "Iceland Site", country: "IS" }, { name: "Luxembourg Site", country: "LU" },
  { name: "Malta Site", country: "MT" }, { name: "Cyprus Site", country: "CY" },
  { name: "Serbia Site", country: "RS" }, { name: "Bosnia and Herzegovina Site", country: "BA" },
  { name: "North Macedonia Site", country: "MK" }, { name: "Albania Site", country: "AL" },
  { name: "Georgia Site", country: "GE" },
];

async function seed() {
  await connectDatabase();
  const org = await Organization.findById(ORG_ID);
  if (!org) { console.log("Org not found."); process.exit(1); }

  const uniqueCountries = new Set(COUNTRIES.map(c => c.country));
  if (uniqueCountries.size !== COUNTRIES.length) {
    console.log(`WARNING: ${COUNTRIES.length - uniqueCountries.size} duplicate country codes found. Aborting.`);
    process.exit(1);
  }

  await Site.deleteMany({ organizationId: org._id });
  const created = await Site.insertMany(COUNTRIES.map(c => ({ ...c, organizationId: org._id })));
  console.log(`Created ${created.length} sites across ${uniqueCountries.size} distinct countries.`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
