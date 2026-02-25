import { z } from "zod";
import fs from "fs";
import { UnitMechanicsSchema, SpellMechanicsSchema } from "./src/services/validation/data-schemas.js";

const d = JSON.parse(fs.readFileSync('all_data_dump.json'));

const lich = d.units.find(u => u.name === 'Lich');
console.log("Raw Lich Aura:", JSON.stringify(lich.mechanics.aura, null, 2));

try {
  const parsed = UnitMechanicsSchema.parse(lich.mechanics);
  console.log("Parsed Lich Aura:", JSON.stringify(parsed.aura, null, 2));
} catch (e) {
  console.log("Zod Error:", e.issues);
}
