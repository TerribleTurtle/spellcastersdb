import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCardImageUrl(entity: { hero_id?: string; entity_id?: string; consumable_id?: string }): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://terribleturtle.github.io/spellcasters-community-api/api/v1";
  const assetBase = apiUrl.replace(/\/api\/v1$/, "/assets");

  let folder = "units";
  if ("hero_id" in entity) folder = "heroes";
  else if ("consumable_id" in entity) folder = "consumables";

  const id = "hero_id" in entity ? entity.hero_id : 
             "consumable_id" in entity ? entity.consumable_id : 
             entity.entity_id;

  return `${assetBase}/${folder}/${id}_card.png`;
}
