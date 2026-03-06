export type ChestRarity = "Common" | "Epic" | "Legendary";
export type ChestTier = "T1" | "T2" | "T3" | "T4";
export type ChestRewardType = "Unit" | "Spell";

export interface MapImageUrls {
  /** Relative path to the map overview image, e.g. "/assets/maps/mausoleum.png" */
  readonly map: string;
}

export interface MapChest {
  readonly location: string;
  readonly rarity: ChestRarity;
  readonly tier: ChestTier;
  readonly reward_entity_id: string;
  readonly reward_type: ChestRewardType;
}

export interface MapChestsResponse {
  readonly entity_id: string;
  readonly name: string;
  readonly description: string;
  readonly chests: readonly MapChest[];
  readonly last_modified: string;
  readonly tags: readonly string[];
  readonly image_required: boolean;
  /** Optional map image URLs. Present once the community API publishes images for this map. */
  readonly image_urls?: MapImageUrls;
}
