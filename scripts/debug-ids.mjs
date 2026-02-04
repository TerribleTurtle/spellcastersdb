const API_URL = "https://terribleturtle.github.io/spellcasters-community-api/api/v1/all_data.json";

async function checkConsumables() {
  const res = await fetch(API_URL);
  const data = await res.json();
  
  console.log("Checking Consumables...");
  data.consumables.forEach((c, i) => {
    console.log(`[${i}] ID: ${c.entity_id} | Name: ${c.name}`);
    if (!c.entity_id) {
      console.error(`❌ ERROR: Consumable at index ${i} is missing entity_id!`);
      console.log(JSON.stringify(c, null, 2));
    }
  });

  console.log("\nChecking Other Entities (Just in case)...");
  data.heroes.forEach((h, i) => {
    if (!h.entity_id) console.error(`❌ Hero ${i} missing ID`);
  });
}

checkConsumables();
