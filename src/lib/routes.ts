import { UnifiedEntity } from "@/types/api";

/**
 * Centralized Route Registry for SpellcastersDB
 * All internal links should use these helpers to ensure consistency and prevent broken links.
 */
export const routes = {
  // --- Entity Detail Pages ---
  unit: (id: string) => `/incantations/units/${id}`,
  spell: (id: string) => `/incantations/spells/${id}`,
  titan: (id: string) => `/titans/${id}`,
  spellcaster: (id: string) => `/spellcasters/${id}`,
  consumable: (id: string) => `/consumables/${id}`,
  upgrade: (id: string) => `/upgrades/${id}`, // Reserved for future/edge cases

  // --- Archives & Filter Views ---
  database: (search?: string) =>
    search ? `/database?search=${encodeURIComponent(search)}` : `/database`,
  school: (schoolId: string) => `/schools/${schoolId}`,
  rank: (rankId: string) => `/ranks/${rankId}`,
  class_: (classId: string) => `/classes/${classId}`, // 'class' is a reserved word

  // --- Static Pages ---
  guide: (anchor?: string) => `/guide${anchor ? `#${anchor}` : ""}`,
  infusions: () => `/guide/infusions`,
  infusion: (id: string) => `/guide/infusions/${id}`,

  // --- Dynamic Entity Link Builder ---
  /**
   * Generates the correct detail page URL for any unified entity object.
   */
  entityLink(entity: UnifiedEntity): string {
    if ("spellcaster_id" in entity && entity.spellcaster_id) {
      return routes.spellcaster(entity.spellcaster_id);
    }

    // Fallbacks for category-based routing
    if (entity.category === "Spellcaster" && "entity_id" in entity) {
      return routes.spellcaster(entity.entity_id);
    }
    if (entity.category === "Titan") {
      return routes.titan(entity.entity_id);
    }
    if (entity.category === "Spell") {
      return routes.spell(entity.entity_id);
    }
    if (entity.category === "Consumable") {
      return routes.consumable(entity.entity_id);
    }
    if (entity.category === "Upgrade") {
      return routes.upgrade(entity.entity_id);
    }

    // Default to unit
    return routes.unit(entity.entity_id);
  },

  // --- Edge Cases ---
  /**
   * Resolves entity URLs from Changelog target_id format (e.g. "heroes/alden.json" or "building/astral_tower.json")
   */
  entityLinkFromChangelog(
    targetId: string,
    categoryName: string
  ): string | null {
    const parts = targetId.replace(".json", "").split("/");
    const entityId = parts[parts.length - 1];
    const cat = categoryName.toLowerCase();

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
