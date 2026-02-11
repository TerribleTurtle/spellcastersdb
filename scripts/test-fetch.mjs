
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://terribleturtle.github.io/spellcasters-community-api/api/v2";
const API_URL = BASE_URL.endsWith('json') ? BASE_URL : `${BASE_URL}/all_data.json`;
import fs from 'fs';
import path from 'path';

console.log(`Checking data at: ${API_URL}`);

async function checkData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.warn(`WARNING: Received status ${response.status} from API. Attempting local fallback...`);
        return await checkLocalData();
    }
    
    const data = await response.json();
    validate(data, "Remote API");

  } catch (error) {
    console.warn("Fetch failed:", error.message);
    console.log("Attempting local fallback...");
    await checkLocalData();
  }
}

async function checkLocalData() {
    // Hardcoded fallback path based on project structure or simple assumption for this script
    // We try to read relative to CWD
    const localPath = path.resolve(process.cwd(), "..", "spellcasters-community-api", "api", "v2", "all_data.json");
    
    if (fs.existsSync(localPath)) {
        console.log(`Found local data at: ${localPath}`);
        try {
            const content = fs.readFileSync(localPath, 'utf-8');
            const data = JSON.parse(content);
            validate(data, "Local File");
        } catch (e) {
            console.error("Failed to parse local data:", e.message);
            process.exit(1);
        }
    } else {
        console.error(`Local data not found at: ${localPath}`);
        process.exit(1);
    }
}

function validate(data, source) {
    console.log(`Validating data from: ${source}`);
    
    // Handle V2 structure where 'heroes' might be 'spellcasters'
    if (data.heroes && !data.spellcasters) {
         data.spellcasters = data.heroes;
    }

    if (!data.build_info || !data.spellcasters) {
         console.error("Error: Key data fields missing (build_info or spellcasters).");
         process.exit(1);
    }

    console.log(`✅ Data OK!`);
    console.log(`   Source: ${source}`);
    console.log(`   Version: ${data.build_info.version}`);
    console.log(`   Spellcasters: ${data.spellcasters?.length || 0}`);
    console.log(`   Units: ${data.units?.length || 0}`);
    console.log(`   Spells: ${data.spells?.length || 0}`);
    console.log(`   Titans: ${data.titans?.length || 0}`);
    console.log(`   Consumables: ${data.consumables?.length || 0}`);
    console.log(`   Upgrades: ${data.upgrades?.length || 0}`);

    const total = (data.spellcasters?.length || 0) + 
                  (data.units?.length || 0) + 
                  (data.spells?.length || 0) + 
                  (data.titans?.length || 0) + 
                  (data.consumables?.length || 0) + 
                  (data.upgrades?.length || 0);

    console.log(`   TOTAL ENTITIES: ${total}`);
    if (total !== 47) {
        console.warn(`\n⚠️  WARNING: Expected 47 entities, found ${total}.`);
    } else {
        console.log(`\n✅ Total count matches expected (47).`);
    }
    process.exit(0);
}

checkData();
