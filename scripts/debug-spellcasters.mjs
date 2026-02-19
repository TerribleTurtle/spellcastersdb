
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
    inspectDefense(data, "Remote API");

  } catch (error) {
    console.warn("Fetch failed:", error.message);
    console.log("Attempting local fallback...");
    await checkLocalData();
  }
}

async function checkLocalData() {
    const localPath = path.resolve(process.cwd(), "..", "spellcasters-community-api", "api", "v2", "all_data.json");
    
    if (fs.existsSync(localPath)) {
        console.log(`Found local data at: ${localPath}`);
        try {
            const content = fs.readFileSync(localPath, 'utf-8');
            const data = JSON.parse(content);
            inspectDefense(data, "Local File");
        } catch (e) {
            console.error("Failed to parse local data:", e.message);
        }
    } else {
        console.error(`Local data not found at: ${localPath}`);
    }
}

function inspectDefense(data, source) {
    console.log(`\n--- Inspecting Defense Abilities (${source}) ---`);
    
    // Handle V2 structure where 'heroes' might be 'spellcasters'
    const spellcasters = data.spellcasters || data.heroes || [];

    if (spellcasters.length === 0) {
        console.log("No spellcasters found.");
        return;
    }

    spellcasters.forEach(sc => {
        const defense = sc.abilities?.defense;
        if (defense) {
            console.log(`\nSpellcaster: ${sc.name}`);
            console.log(`  Defense Ability: ${defense.name}`);
            console.log(`  Cooldown: ${defense.cooldown}`);
            console.log(`  Keys: ${Object.keys(defense).join(', ')}`);
        } else {
            console.log(`\nSpellcaster: ${sc.name} - NO DEFENSE ABILITY FOUND`);
        }
    });
}

checkData();
