/**
 * Test Script: Verify API Data Fetching
 * Run with: node scripts/test-fetch.mjs
 */

const API_URL = "https://terribleturtle.github.io/spellcasters-community-api/api/v1/all_data.json";

async function testFetch() {
  console.log("🔍 Fetching game data from API...\n");
  console.log(`URL: ${API_URL}\n`);

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate structure
    if (!data.build_info || !data.units || !data.heroes) {
      throw new Error("Invalid data structure: missing required fields");
    }

    // Display results
    console.log("✅ Successfully fetched game data!\n");
    console.log("📦 Build Info:");
    console.log(`   Version: ${data.build_info.version}`);
    console.log(`   Generated: ${data.build_info.generated_at}\n`);
    
    console.log("📊 Data Summary:");
    console.log(`   Units: ${data.units.length}`);
    console.log(`   Heroes: ${data.heroes.length}`);
    console.log(`   Consumables: ${data.consumables?.length || 0}`);
    console.log(`   Upgrades: ${data.upgrades?.length || 0}\n`);

    // Category breakdown
    const categories = data.units.reduce((acc, unit) => {
      acc[unit.category] = (acc[unit.category] || 0) + 1;
      return acc;
    }, {});

    console.log("🏷️  Unit Categories:");
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

    console.log("\n✨ All checks passed!");
    return true;

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testFetch();
