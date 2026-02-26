import { UnifiedEntity } from "@/types/api";

// Helper to safely encode path parameters, preventing XSS and Path Traversal
const safeEncode = (id: unknown): string => {
  if (id === null || id === undefined) return "";
  return encodeURIComponent(String(id));
};

/**
 * Centralized Route Registry for SpellcastersDB
 * All internal links should use these helpers to ensure consistency and prevent broken links.
 */
export const routes = {
  // --- Entity Detail Pages ---
  unit: (id: string) => `/incantations/units/${safeEncode(id)}`,
  spell: (id: string) => `/incantations/spells/${safeEncode(id)}`,
  titan: (id: string) => `/titans/${safeEncode(id)}`,
  spellcaster: (id: string) => `/spellcasters/${safeEncode(id)}`,
  consumable: (id: string) => `/consumables/${safeEncode(id)}`,
  upgrade: (id: string) => `/upgrades/${safeEncode(id)}`, // Reserved for future/edge cases

  // --- Archives & Filter Views ---
  database: (search?: string) =>
    search ? `/database?search=${encodeURIComponent(search)}` : `/database`,
  school: (schoolId: string) => `/schools/${safeEncode(schoolId)}`,
  rank: (rankId: string) => `/ranks/${safeEncode(rankId)}`,
  class_: (classId: string) => `/classes/${safeEncode(classId)}`, // 'class' is a reserved word

  // --- Static Pages ---
  guide: (anchor?: string) => `/guide${anchor ? `#${anchor}` : ""}`,
  guideBasics: () => `/guide/basics`,
  guideMechanics: () => `/guide/mechanics`,
  guideRanked: () => `/guide/ranked`,
  guideUpgrades: () => `/guide/upgrades`,
  infusions: () => `/guide/infusions`,
  infusion: (id: string) => `/guide/infusions/${safeEncode(id)}`,

  // --- Dynamic Entity Link Builder ---
  /**
   * Generates the correct detail page URL for any unified entity object.
   */
  entityLink(entity: UnifiedEntity): string {
    if (!entity) return routes.unit("");

    if ("spellcaster_id" in entity && entity.spellcaster_id) {
      return routes.spellcaster(entity.spellcaster_id);
    }

    const category = entity.category ? String(entity.category) : "";

    // Fallbacks for category-based routing
    if (category === "Spellcaster" && "entity_id" in entity) {
      return routes.spellcaster(entity.entity_id);
    }
    if (category === "Titan") {
      return routes.titan(entity.entity_id!);
    }
    if (category === "Spell") {
      return routes.spell(entity.entity_id!);
    }
    if (category === "Consumable") {
      return routes.consumable(entity.entity_id!);
    }
    if (category === "Upgrade") {
      return routes.upgrade(entity.entity_id!);
    }

    // Default to unit
    return routes.unit(entity.entity_id!);
  },

  // --- Edge Cases ---
  /**
   * Resolves entity URLs from Changelog target_id format (e.g. "heroes/alden.json" or "building/astral_tower.json")
   */
  entityLinkFromChangelog(
    targetId: string | null | undefined,
    categoryName: string | null | undefined
  ): string | null {
    if (!categoryName) return null;

    const safeTargetId = targetId ? String(targetId) : "";
    const parts = safeTargetId.replace(".json", "").split("/");
    const entityId = parts[parts.length - 1] || "";
    const cat = String(categoryName).toLowerCase();

    if (cat === "heroes" || cat === "spellcaster" || cat === "spellcasters")
      return routes.spellcaster(entityId);
    if (cat === "units" || cat === "creature" || cat === "building")
      return routes.unit(entityId);
    if (cat === "spells" || cat === "spell") return routes.spell(entityId);
    if (cat === "titans" || cat === "titan") return routes.titan(entityId);
    if (cat === "consumables" || cat === "consumable")
      return routes.consumable(entityId);

    // Unknown changelog category mapping
    return null;
  },
};
