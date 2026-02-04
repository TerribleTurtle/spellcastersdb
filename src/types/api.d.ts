/**
 * TypeScript type definitions for Spellcasters Community API
 * Based on: https://terribleturtle.github.io/spellcasters-community-api/api/v1/all_data.json
 */

// ============================================================================
// Enums & Literal Types
// ============================================================================

export type MagicSchool =
  | "Astral"
  | "War"
  | "Elemental"
  | "Lightning"
  | "Holy"
  | "Dark"
  | "Frost";

export type UnitCategory = "Creature" | "Building" | "Spell" | "Titan";

export type UnitRank = "I" | "II" | "III" | "IV";

export type MovementType = "Ground" | "Fly" | "Hover" | "Stationary";

// ============================================================================
// Core Entity Interfaces
// ============================================================================

export interface CardConfig {
  rank: UnitRank;
  cost_population: number;
  cost_charges: number;
  initial_charges: number;
  charge_time: number;
  cast_time: number;
}

export interface Unit {
  $schema?: string;
  game_version: string;
  entity_id: string;
  name: string;
  category: UnitCategory;
  magic_school: MagicSchool;
  description: string;
  image_required?: boolean;

  // Combat Stats
  health: number;
  damage: number;
  attack_speed: number;
  range: number;

  // Movement (for Creatures/Buildings)
  movement_speed: number;
  movement_type?: MovementType;

  // Optional Fields (Spells, Buildings, etc.)
  radius?: number;
  duration?: number;
  tick_rate?: number;
  max_targets?: number;
  collision_radius?: number;
  target_mask?: string[];

  tags: string[];
  card_config: CardConfig;
}

export interface Ability {
  ability_id: string;
  name: string;
  name: string;
  description: string;
  // Some abilities might not have cooldown in the data yet, but good to keep optional
  cooldown?: number;
}

export interface HeroAbilities {
  passive: Ability[];
  primary: Ability;
  defense: Ability;
  ultimate: Ability;
}

export interface Hero {
  $schema?: string;
  game_version: string;
  hero_id: string;
  name: string;
  image_required?: boolean;

  // Combat Stats
  health: number;
  movement_speed: number;
  flight_speed: number;
  health_regen_rate: number;
  regen_delay: number;
  
  // Offense
  attack_damage_summoner: number;
  attack_damage_minion: number;

  // Kit
  abilities: HeroAbilities;
}

export interface Consumable {
  $schema?: string;
  game_version: string;
  consumable_id: string; // Changed from entity_id
  name: string;
  description: string;
  image_required?: boolean;

  // Consumable-specific
  effect_type?: string;
  effect_value?: number;
  duration?: number;

  tags: string[];
}

export interface Upgrade {
  $schema?: string;
  game_version: string;
  entity_id: string;
  name: string;
  description: string;
  image_required?: boolean;

  // Upgrade-specific
  prerequisite_level?: number;
  cost?: number;

  tags: string[];
}

// ============================================================================
// API Response Structures
// ============================================================================

export interface BuildInfo {
  version: string;
  generated_at: string;
}

export interface AllDataResponse {
  build_info: BuildInfo;
  units: Unit[];
  heroes: Hero[];
  consumables: Consumable[];
  upgrades: Upgrade[];
}
