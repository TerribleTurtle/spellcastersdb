import { UnifiedEntity } from "@/types/api";

import { routes } from "./routes";

/**
 * Static map of core game terms to their ideal route targets.
 * Used by TextWithLinks component to automatically interlink descriptions.
 */
export const KEYWORD_LINKS: Record<string, string> = {
  // --- Schools ---
  // Excluding "Titan" (ambiguous with Category), linking others to dedicated info views
  Elemental: routes.school("Elemental"),
  Wild: routes.school("Wild"),
  Astral: routes.school("Astral"),
  Holy: routes.school("Holy"),
  Technomancy: routes.school("Technomancy"),
  Necromancy: routes.school("Necromancy"),
  // War: routes.school("War"), -> EXCLUDED: Too common in standard English

  // --- Classes ---
  Enchanter: routes.class_("Enchanter"),
  Duelist: routes.class_("Duelist"),
  Conqueror: routes.class_("Conqueror"),

  // --- Categories (Common) ---
  Creature: routes.database("Creature"),
  Building: routes.database("Building"),
  Spell: routes.database("Spell"),
  Consumable: routes.database("Consumable"),

  // --- Movement Types ---
  Flying: routes.database("Flying"),
  Ground: routes.database("Ground"),
  Hover: routes.database("Hover"),

  // --- Mechanics ---
  // Lowercase keys to match typically usage in descriptions
  pierce: routes.guide("mechanics"),
  stealth: routes.guide("mechanics"),
  cleave: routes.guide("mechanics"),
  aura: routes.guide("mechanics"),
  infusion: routes.guide("mechanics"),

  // --- Infusions (Explicit Names) ---
  "Fire Infusion": routes.infusion("fire_infusion"),
  "Lightning Infusion": routes.infusion("lightning_infusion"),
  "Poison Infusion": routes.infusion("poison_infusion"),
  "Ice Infusion": routes.infusion("ice_infusion"),
};

/**
 * Merges static keywords with dynamic entity names into a single dictionary.
 * Filters out short entity names to prevent rampant false-positive linking in text.
 * @param entities All unified entities fetched from the API
 * @returns Complete dictionary for use with TextWithLinks
 */
export function buildDynamicDictionary(
  entities: UnifiedEntity[]
): Record<string, string> {
  const dynamic: Record<string, string> = {};

  for (const entity of entities) {
    if (!entity.name) continue;

    // Guard against excessive linking: exclude short generic names like "Rat" or "Imp"
    // They are too likely to appear as substrings naturally in English text
    if (entity.name.length >= 4) {
      dynamic[entity.name] = routes.entityLink(entity);
    }
  }

  // Precedence: Static keywords override identical entity names (if any ever conflict)
  return { ...dynamic, ...KEYWORD_LINKS };
}
