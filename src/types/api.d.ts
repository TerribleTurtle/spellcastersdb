/**
 * TypeScript type definitions for Spellcasters Community API
 * Based on: https://terribleturtle.github.io/spellcasters-community-api/api/v1/all_data.json
 */

// ============================================================================
// Enums & Literal Types
// ============================================================================

export type MagicSchool =
  | "Elemental"
  | "Wild"
  | "War"
  | "Astral"
  | "Holy"
  | "Technomancy"
  | "Necromancy"
  | "Titan";

export type UnitCategory = "Creature" | "Building";
export type SpellCategory = "Spell";
export type TitanCategory = "Titan";
export type IncantationCategory = UnitCategory | SpellCategory;

export type UnitRank = "I" | "II" | "III" | "IV" | "V"; // Added V for Titans just in case, though they have their own schema

export type SpellcasterClass =
  | "Enchanter"
  | "Duelist"
  | "Conqueror"
  | "Unknown";

export type MovementType = "Ground" | "Fly" | "Hover" | "Stationary";

// ============================================================================
// Core Entity Interfaces
// ============================================================================

// CardConfig removed - properties flattened into Incantation/Unit

/**
 * Base Interface for all "Deck-able" items (Units + Spells)
 * Named "Incantation" in the new spec.
 */
export interface Incantation {
  $schema?: string;
  // game_version removed, changelog used instead
  entity_id: string;
  name: string;
  category: string; // Refined in sub-interfaces
  magic_school: MagicSchool;
  description: string;
  image_required?: boolean;
  tags: string[];

  // Flattened Config
  rank?: UnitRank;
  
  movement_type?: MovementType;

  mechanics?: {
    waves?: number;
    bonus_damage?: {
      target_type: string;
      unit: string;
      value: number;
    }[];
  };
}

/**
 * Represents Creatures and Buildings
 */
export interface Unit extends Incantation {
  category: UnitCategory;

  // Combat Stats
  health: number;
  damage?: number;
  attack_speed?: number;
  range?: number;

  // Movement
  movement_speed?: number;
}

/**
 * Represents Spells (Instant Actions)
 */
export interface Spell extends Incantation {
  category: SpellCategory;

  // Spell specifics
  radius?: number;
  duration?: number;
  tick_rate?: number;
  max_targets?: number;
  target_mask?: string[];

  // Spells usually don't have health/movement
  damage?: number;
  range?: number;
}

/**
 * Titans (Unique Ultimate Entities)
 */
export interface Titan {
  $schema?: string;
  entity_id: string;
  name: string;
  category: TitanCategory;
  magic_school: MagicSchool;
  rank: string; // Usually "V"
  description: string;
  image_required?: boolean;

  tags: string[];

  // Titan Stats vary, but similar to Units
  health: number;
  damage: number;
  movement_speed: number;
  heal_amount?: number;
}

export interface Ability {
  ability_id?: string;
  name: string;
  description: string;
  cooldown?: number;
  stats?: Record<string, number | null>;
  mechanics?: {
    name: string;
    description: string;
  }[];
}

export interface SpellcasterAbilities {
  passive: Ability[];
  primary: Ability;
  defense: Ability;
  ultimate: Ability;
}

export interface Spellcaster {
  $schema?: string;
  spellcaster_id: string;
  name: string;
  category: "Spellcaster";
  tags: string[];
  class: SpellcasterClass;
  image_required?: boolean;

  difficulty?: number;

  // RPG Stats Removed
  // health: number;
  // movement_speed: number;
  // flight_speed: number;
  // health_regen_rate: number;
  // regen_delay?: number | null;
  // attack_damage_summoner: number;
  // attack_damage_minion: number;

  // Kit
  abilities: SpellcasterAbilities;
}

export interface Consumable {
  $schema?: string;
  entity_id: string; // Renamed from consumable_id in some contexts? Spec says entity_id.
  name: string;
  description: string;
  image_required?: boolean;

  // Consumable-specific
  effect_type?: string;
  effect_value?: number;
  duration?: number;
  value?: number; // Some have 'value' instead of effect_value

  tags: string[];
  category: "Consumable";
  rarity?: string;
  stats?: {
    duration?: number;
  };
}

export interface Upgrade {
  $schema?: string;
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
  spellcasters: Spellcaster[];
  units: Unit[]; // Creatures + Buildings ONLY
  spells: Spell[]; // New Array
  titans: Titan[]; // New Array
  consumables: Consumable[];
  upgrades: Upgrade[];
}

/**
 * Union for Deck Builder slots (can accept Units or Spells)
 * "Incantation" is the polymorphic term.
 */
// export type Incantation = Unit | Spell; // Already defined as base interface, but practically we use union in code?
// No, Interface inheritance is better for shared props.

export type UnifiedEntity = Unit | Spell | Titan | Spellcaster | Consumable;
