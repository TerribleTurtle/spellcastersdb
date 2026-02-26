import { CONFIG } from "@/lib/config";
import { getAssetFolder } from "@/services/assets/asset-strategy";

export function getCardImageUrl(
  entity: {
    spellcaster_id?: string;
    entity_id?: string;
    consumable_id?: string;
    category?: string;
    image_urls?: { card?: string };
  },
  options?: { forceRemote?: boolean; forceFormat?: "png" | "webp" }
): string {
  const apiUrl = CONFIG.API.BASE_URL;
  const hostRoot = apiUrl.replace(/\/api\/v2$/, "");
  const assetBase = `${hostRoot}/assets`;

  // Check for local asset override first
  // If forceRemote is true, SKIP this block
  const useLocal = !options?.forceRemote && CONFIG.FEATURES.USE_LOCAL_ASSETS;

  // Prefer API-injected card URL for remote requests
  if (entity.image_urls?.card && !useLocal) {
    return `${hostRoot}${entity.image_urls.card}`;
  }

  const folder = getAssetFolder(entity);

  // Resolve ID: Spellcaster > Consumable > Entity
  const id =
    "spellcaster_id" in entity
      ? entity.spellcaster_id
      : "consumable_id" in entity
        ? entity.consumable_id
        : entity.entity_id;

  // Safety: Prevent undefined in URL
  if (!id) {
    return `${assetBase}/placeholder_card.png`;
  }

  const preferredFormat =
    options?.forceFormat || CONFIG.FEATURES.PREFERRED_ASSET_FORMAT;

  if (useLocal) {
    return `/api/local-assets/${folder}/${id}.${preferredFormat}`;
  }

  // Production/Remote URL
  return `${assetBase}/${folder}/${id}.${preferredFormat}`;
}

export function getCardAltText(entity: {
  name?: string;
  category?: string;
  class?: string;
  rank?: string;
  magic_school?: string;
  // We use a loose type here to avoid circular deps or complex discriminated unions in helpers
  // but in practice it receives UnifiedEntity
}): string {
  const name = entity.name || "Card Image";

  // 1. Spellcaster
  if (entity.category === "Spellcaster" && entity.class) {
    return `${name} - ${entity.class} Spellcaster`;
  }

  // 2. Titan
  if (entity.category === "Titan") {
    // Titans are always Rank V conceptually, but we can explicitly say it
    return `${name} - Titan (Rank V)`;
  }

  // 3. Unit (Creature/Building)
  if (
    (entity.category === "Creature" || entity.category === "Building") &&
    entity.rank &&
    entity.magic_school
  ) {
    return `${name} - Rank ${entity.rank} ${entity.magic_school} ${entity.category}`;
  }

  // 4. Spell
  if (entity.category === "Spell" && entity.magic_school) {
    return `${name} - ${entity.magic_school} Spell`;
  }

  // Fallback
  return name;
}

export type AbilityImageType = "attack" | "defense" | "passive" | "ultimate";

export function getAbilityImageUrl(
  entity: {
    image_urls?: {
      attack?: string;
      defense?: string;
      passive?: string;
      ultimate?: string;
    };
  },
  abilityType: AbilityImageType
): string | null {
  const path = entity.image_urls?.[abilityType];
  if (!path) return null;

  const apiUrl = CONFIG.API.BASE_URL;
  const hostRoot = apiUrl.replace(/\/api\/v2$/, "");
  return `${hostRoot}${path}`;
}
