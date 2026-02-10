
import { EntityDisplayItem } from "./types";
import { Unit, Spell } from "@/types/api";

export const getDamageDisplay = (item: EntityDisplayItem) => {
  if (!("damage" in item) || !item.damage) return undefined;
  const mechanics = "mechanics" in item ? (item as Unit | Spell).mechanics : undefined;
  if (mechanics?.waves && mechanics.waves > 1) {
    return `${item.damage}x${mechanics.waves}`;
  }
  return item.damage;
};
