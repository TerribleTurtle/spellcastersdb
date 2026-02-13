export type AssetFolder = "heroes" | "consumables" | "spells" | "titans" | "upgrades" | "units";

export const ASSET_STRATEGY: Record<string, AssetFolder> = {
  Spellcaster: "heroes",
  Consumable: "consumables",
  Spell: "spells",
  Titan: "titans",
  Upgrade: "upgrades",
  Creature: "units",
  Building: "units",
};

export const DEFAULT_ASSET_FOLDER: AssetFolder = "units";

export function getAssetFolder(entity: {
  spellcaster_id?: string;
  consumable_id?: string;
  category?: string;
}): AssetFolder {
  if ("spellcaster_id" in entity) return "heroes";
  if ("consumable_id" in entity) return "consumables";
  
  if (entity.category && entity.category in ASSET_STRATEGY) {
    return ASSET_STRATEGY[entity.category];
  }

  return DEFAULT_ASSET_FOLDER;
}
