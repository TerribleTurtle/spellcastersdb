
import { AllDataSchema } from "@/services/validation/data-schemas";
import { mapRawDataToAllData } from "@/services/api/mappers";

const BASE_URL = "https://terribleturtle.github.io/spellcasters-community-api/api/v2";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

async function main() {
  console.log("Fetching production data...");
  
  try {
    const [units, spells, spellcasters, titans, consumables, upgrades] = await Promise.all([
      fetchJson(`${BASE_URL}/units.json`),
      fetchJson(`${BASE_URL}/spells.json`),
      fetchJson(`${BASE_URL}/heroes.json`), // Note: API uses 'heroes.json' but maps to spellcasters
      fetchJson(`${BASE_URL}/titans.json`),
      fetchJson(`${BASE_URL}/consumables.json`),
      fetchJson(`${BASE_URL}/upgrades.json`).catch(() => []),
    ]);

    const rawData = {
      build_info: {
        version: "debug-script",
        generated_at: new Date().toISOString(),
      },
      units,
      spells,
      spellcasters, // Will be mapped if undefined but here we pass it
      heroes: spellcasters, // mapRawDataToAllData handles this if spellcasters is missing
      titans,
      consumables,
      upgrades,
    };

    console.log("Validating data...");
    // We intentionally skip mapRawDataToAllData's internal validation to see the error ourselves,
    // or we can just use the mapper which throws.
    // Let's use the mapper logic but catching the error to print it nicely.

    // First, replicate mapper's preprocessing
    if (rawData.heroes && !rawData.spellcasters) {
      rawData.spellcasters = rawData.heroes;
    }
    // Filter units
    if (Array.isArray(rawData.units)) {
       // Need EntityCategory enum or string literal
       rawData.units = rawData.units.filter((u: any) => u.category === "Creature" || u.category === "Building");
    }

    // Inject error for testing
    // @ts-ignore
    // rawData.units = "invalid"; 

    console.log("Fetched Data Summary:");
    console.log("Units:", Array.isArray(rawData.units) ? rawData.units.length : typeof rawData.units);
    console.log("Spells:", Array.isArray(rawData.spells) ? rawData.spells.length : typeof rawData.spells);
    console.log("Spellcasters:", Array.isArray(rawData.spellcasters) ? rawData.spellcasters.length : typeof rawData.spellcasters);
    console.log("Titans:", Array.isArray(rawData.titans) ? rawData.titans.length : typeof rawData.titans);
    console.log("Consumables:", Array.isArray(rawData.consumables) ? rawData.consumables.length : typeof rawData.consumables);
    console.log("Upgrades:", Array.isArray(rawData.upgrades) ? rawData.upgrades.length : typeof rawData.upgrades);

    const result = AllDataSchema.safeParse(rawData);

    if (!result.success) {
      console.error("❌ Data Validation Failed!");
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    } else {
      console.log("✅ Data Validation Passed!");
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

main();
