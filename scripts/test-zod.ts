import fs from "fs";
import { z } from "zod";

import { UnitMechanicsSchema } from "../src/services/validation/data-schemas";

const d = JSON.parse(fs.readFileSync("all_data_dump.json", "utf-8"));
const lich = d.units.find((u: any) => u.name === "Lich");

let out =
  "Raw Lich Aura:\n" + JSON.stringify(lich.mechanics.aura, null, 2) + "\n\n";

try {
  const parsed = UnitMechanicsSchema.parse(lich.mechanics);
  out += "Parsed Lich Aura:\n" + JSON.stringify(parsed.aura, null, 2);
} catch (e: any) {
  out += "Zod Error:\n" + JSON.stringify(e.issues, null, 2);
}

fs.writeFileSync("zod_test_output_utf8.txt", out, "utf-8");
