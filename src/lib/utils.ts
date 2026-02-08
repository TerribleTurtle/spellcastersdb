import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getCardImageUrl(entity: { spellcaster_id?: string; hero_id?: string; entity_id?: string; consumable_id?: string; category?: string }): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://terribleturtle.github.io/spellcasters-community-api/api/v1";
  const assetBase = apiUrl.replace(/\/api\/v1$/, "/assets");

  let folder = "units";
  
  // Determine folder based on ID presence or Category
  if ("spellcaster_id" in entity || "hero_id" in entity || entity.category === "Spellcaster" || entity.category === "Spellcaster") {
    folder = "spellcasters";
  } else if ("consumable_id" in entity || entity.category === "Consumable") {
    folder = "consumables";
  } else if (entity.category === "Spell") {
    folder = "spells";
  } else if (entity.category === "Titan") {
    folder = "titans";
  }

  // Resolve ID: Spellcaster > Consumable > Entity
  const id = "spellcaster_id" in entity ? entity.spellcaster_id :
             "consumable_id" in entity ? entity.consumable_id : 
             entity.entity_id;

  // Safety: Prevent undefined in URL
  if (!id) {
    console.warn("getCardImageUrl: entity has no valid ID", entity);
    return `${assetBase}/placeholder_card.png`;
  }

  // Check for local asset override
  if (process.env.NEXT_PUBLIC_USE_LOCAL_ASSETS === 'true') {
     const format = process.env.NEXT_PUBLIC_PREFERRED_ASSET_FORMAT || "png";
     return `/api/local-assets/${folder}/${id}.${format}`;
  }

  // Production/Remote URL (New naming convention: detailed-name.png, no _card suffix)
  const format = process.env.NEXT_PUBLIC_PREFERRED_ASSET_FORMAT || "png";
  return `${assetBase}/${folder}/${id}.${format}`;
}
