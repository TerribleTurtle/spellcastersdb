
const urls = [
  "https://terribleturtle.github.io/spellcasters-community-api/api/v2/units.json",
  "https://terribleturtle.github.io/spellcasters-community-api/api/v2/heroes.json",
  "https://terribleturtle.github.io/spellcasters-community-api/api/v2/spells.json",
  "https://terribleturtle.github.io/spellcasters-community-api/api/v2/titans.json"
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`Checking ${url}...`);
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.name.toLowerCase().includes("lich") || item.entity_id.toLowerCase().includes("lich")) {
            console.log(`Found in ${url}:`, JSON.stringify(item, null, 2));
          }
        });
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
    }
  }
}

check();
