import { CONFIG } from "@/lib/config";
import { getAssetFolder } from "@/services/assets/asset-strategy";

export function getCardImageUrl(
  entity: {
    spellcaster_id?: string;
    entity_id?: string;
    consumable_id?: string;
    category?: string;
  },
  options?: { forceRemote?: boolean; forceFormat?: "png" | "webp" }
): string {
  const apiUrl = CONFIG.API.BASE_URL;
  const assetBase = apiUrl.replace(/\/api\/v2$/, "/assets");

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
    // Moved from console.warn to just returning placeholder to reduce noise
    return `${assetBase}/placeholder_card.png`;
  }

  const preferredFormat =
    options?.forceFormat ||
    CONFIG.FEATURES.PREFERRED_ASSET_FORMAT;

  // Check for local asset override
  // If forceRemote is true, SKIP this block
  if (
    !options?.forceRemote &&
    CONFIG.FEATURES.USE_LOCAL_ASSETS
  ) {
    return `/api/local-assets/${folder}/${id}.${preferredFormat}`;
  }

  // Production/Remote URL
  return `${assetBase}/${folder}/${id}.${preferredFormat}`;
}
