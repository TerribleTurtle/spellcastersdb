const resp = await fetch('https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json');
const d = await resp.json();
const fs = await import('fs');
const results = [];

// Check units with auras
d.units.filter(u => u.mechanics?.aura).forEach(u => {
  results.push(`--- UNIT: ${u.name} ---`);
  results.push(JSON.stringify(u.mechanics.aura, null, 2));
});

// Check spells with auras
d.spells.filter(s => s.mechanics?.aura).forEach(s => {
  results.push(`--- SPELL: ${s.name} ---`);
  results.push(JSON.stringify(s.mechanics.aura, null, 2));
});

// Check spellcaster abilities safely
for (const sc of d.spellcasters) {
  if (!sc.abilities) continue;
  const abilities = [];
  if (Array.isArray(sc.abilities.passive)) abilities.push(...sc.abilities.passive);
  if (sc.abilities.primary) abilities.push(sc.abilities.primary);
  if (sc.abilities.defense) abilities.push(sc.abilities.defense);
  if (sc.abilities.ultimate) abilities.push(sc.abilities.ultimate);
  for (const a of abilities) {
    if (a?.mechanics?.aura) {
      results.push(`--- SPELLCASTER: ${sc.name} - ABILITY: ${a.name} ---`);
      results.push(JSON.stringify(a.mechanics.aura, null, 2));
    }
  }
}

fs.writeFileSync('aura-dump.json', JSON.stringify(results, null, 2));
console.log('Done. ' + results.length + ' entries written.');
