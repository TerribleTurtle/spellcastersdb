import { SpellMechanics } from "@/types/api";

import { EntityDisplayItem } from "./types";

export const getDamageDisplay = (item: EntityDisplayItem) => {
  if (!("damage" in item) || !item.damage) return undefined;

  if ("mechanics" in item && item.mechanics) {
    // Only Spells have waves
    const mechanics = item.mechanics as Partial<SpellMechanics>;
    if (mechanics.waves && mechanics.waves > 1) {
      return `${item.damage}x${mechanics.waves}`;
    }
  }
  return item.damage;
};
