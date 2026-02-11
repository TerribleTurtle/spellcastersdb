import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatEntityName(id: string): string {
  if (!id) return "";
  if (id === "Unit") return "Creatures & Buildings";
  return id
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

export function getCardImageUrl(
  entity: {
    spellcaster_id?: string;
    entity_id?: string;
    consumable_id?: string;
    category?: string;
  },
  options?: { forceRemote?: boolean; forceFormat?: "png" | "webp" }
): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://terribleturtle.github.io/spellcasters-community-api/api/v2";
  const assetBase = apiUrl.replace(/\/api\/v2$/, "/assets");

  let folder = "units";

  // Determine folder based on ID presence or Category
  if (
    "spellcaster_id" in entity ||
    entity.category === "Spellcaster"
  ) {
    folder = "heroes";
  } else if ("consumable_id" in entity || entity.category === "Consumable") {
    folder = "consumables";
  } else if (entity.category === "Spell") {
    folder = "spells";
  } else if (entity.category === "Titan") {
    folder = "titans";
  } else if (entity.category === "Upgrade") {
    folder = "upgrades";
  }

  // Resolve ID: Spellcaster > Consumable > Entity
  const id =
    "spellcaster_id" in entity
      ? entity.spellcaster_id
      : "consumable_id" in entity
        ? entity.consumable_id
        : entity.entity_id;

  // Safety: Prevent undefined in URL
  if (!id) {
    console.warn("getCardImageUrl: entity has no valid ID", entity);
    return `${assetBase}/placeholder_card.png`;
  }

  const preferredFormat =
    options?.forceFormat ||
    process.env.NEXT_PUBLIC_PREFERRED_ASSET_FORMAT ||
    "png";

  // Check for local asset override
  // If forceRemote is true, SKIP this block
  if (
    !options?.forceRemote &&
    process.env.NEXT_PUBLIC_USE_LOCAL_ASSETS === "true"
  ) {
    return `/api/local-assets/${folder}/${id}.${preferredFormat}`;
  }

  // Production/Remote URL
  return `${assetBase}/${folder}/${id}.${preferredFormat}`;
}
