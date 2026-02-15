/**
 * TypeScript type definitions for Spellcasters Community API
 * Based on V2 Schema
 */

// ============================================================================
// Enums & Literal Types
// ============================================================================

import { EntityCategory } from "./enums";

export type Mode = "SOLO" | "TEAM";

export type MagicSchool =
  | "Elemental"
  | "Wild"
  | "War"
  | "Astral"
  | "Holy"
  | "Technomancy"
  | "Necromancy"
  | "Titan";

export type UnitCategory = EntityCategory.Creature | EntityCategory.Building;
export type SpellCategory = EntityCategory.Spell;
export type TitanCategory = EntityCategory.Titan;
export type IncantationCategory = UnitCategory | SpellCategory;

export type UnitRank = "I" | "II" | "III" | "IV" | "V";

export type SpellcasterClass =
  | "Enchanter"
  | "Duelist"
  | "Conqueror"
  | "Unknown";

export type MovementType = "Ground" | "Flying" | "Hover" | "Stationary" | "Fly";

// ============================================================================
// Mechanics
// ============================================================================

export interface ConditionObject {
  field: string;
  operator: string;
  value: string | number;
}

export type Condition = ConditionObject | string;

export interface Aura {
  name?: string;
  description?: string;
  radius: number;
  value: number;
  interval: number;
  target_type?: "Ally" | "Enemy" | "All" | "Building" | "Creature";
  target_types?: string[]; // V2 uses plural array in some places
  effect?: string;
}

export interface DamageModifier {
  target_type?: string | string[]; // Legacy/V2 mix
  target_types?: string[]; // V2 Strict
  multiplier: number;
  condition?: Condition;
}

export interface DamageReduction {
  source_type: string;
  multiplier: number;
  condition?: Condition;
}

export interface Spawner {
  unit_id: string;
  count: number;
  trigger: "Death" | "Interval" | "Spawn";
  interval?: number;
}

export interface Feature {
  name: string;
  description: string;
}

export interface BonusDamage {
    value: number;
    unit: "flat" | "percent_max_hp" | "percent_current_hp";
    target_type?: string;
    target_types?: string[];
}

export interface InitialAttack {
    damage_flat: number;
    target_types: string[]; 
    description: string;
}

export interface Stealth {
  duration: number;
  break_on_attack: boolean;
}

export interface Cleave {
  radius: number;
  arc: number; 
  damage_dropoff: number;
}

export interface UnitMechanics {
    pierce?: boolean;
    stealth?: Stealth;
    cleave?: Cleave | boolean;
    aura?: Aura[];
    damage_modifiers?: DamageModifier[];
    damage_reduction?: DamageReduction[];
    spawner?: Spawner[];
    features?: Feature[];
    capture_speed_modifier?: number;
    initial_attack?: InitialAttack;
    bonus_damage?: BonusDamage[];
}

export interface SpellMechanics {
    pierce?: boolean;
    stealth?: Stealth;
    cleave?: Cleave | boolean;
    waves?: number;
    interval?: number;
    stagger_modifier?: boolean; // V2 changed to boolean
    capture_speed_modifier?: number;
    aura?: Aura[];
    spawner?: Spawner[];
    damage_modifiers?: DamageModifier[];
    damage_reduction?: DamageReduction[];
    features?: Feature[];
    bonus_damage?: BonusDamage[];
}

// Loose mechanics for general use
export type Mechanics = Omit<UnitMechanics, "damage_modifiers"> & Omit<SpellMechanics, "damage_modifiers"> & {
  // Legacy support
  damage_modifiers?: DamageModifier[] | string;
};

// ============================================================================
// Core Entity Interfaces
// ============================================================================

/**
 * Base Interface for all "Deck-able" items (Units + Spells)
 */
export interface Incantation {
  $schema?: string;
  entity_id: string;
  name: string;
  category: string;
  magic_school: MagicSchool;
  description: string;
  image_required?: boolean;
  tags: string[];

  // Config
  rank?: UnitRank;
  mechanics?: UnitMechanics | SpellMechanics;
}


/**
 * Represents Creatures and Buildings
 */
export interface Unit extends Incantation {
  category: UnitCategory;
  mechanics?: UnitMechanics;

  // Combat Stats
  health: number;
  damage?: number;
  dps?: number;
  attack_interval?: number;
  range?: number;

  // Movement
  movement_speed?: number;
  movement_type?: MovementType;
  
  // V2 Specific
  population?: number;
}

/**
 * Represents Spells (Instant Actions)
 */
export interface Spell extends Incantation {
  category: SpellCategory;
  mechanics?: SpellMechanics;

  // Spells usually don't have health/movement
  damage?: number;
  heal_amount?: number;
  cooldown?: number; // V2 Spells have cooldown
  range?: number;
  
  // Legacy fields likely deprecated but kept safe
  duration?: number;
  radius?: number;
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
  dps?: number;
  attack_interval?: number;
  movement_speed: number;
  heal_amount?: number;
  passive_health_regen?: number;
}

export interface Ability {
  name: string;
  description: string;
  damage?: number; // V2 flat damage on ability
  cooldown?: number;
  charges?: number;
  duration?: number;
  interval?: number;
  mechanics?: Mechanics;
  projectiles?: number;
}

export interface SpellcasterAbilities {
  passive: Ability[];
  primary: Ability;
  defense: Ability;
  ultimate: Ability;
}

export interface Spellcaster {
  $schema?: string;
  entity_id: string; // V2 uses entity_id
  spellcaster_id?: string; // Legacy mapping
  name: string;
  category: EntityCategory.Spellcaster;
  tags: string[];
  class: SpellcasterClass;
  image_required?: boolean;

  difficulty?: number;

  // V2 Re-added Stats
  health: number;
  movement_speed: number;
  population?: number;
  movement_type?: MovementType;

  // Kit
  abilities: SpellcasterAbilities;
}

export interface Consumable {
  $schema?: string;
  entity_id: string;
  name: string;
  description: string;
  image_required?: boolean;

  // Consumable-specific
  effect_type?: string;
  value?: number;
  effect_value?: number;
  duration?: number;

  tags: string[];
  category: EntityCategory.Consumable;
  rarity?: string;
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
  category: EntityCategory.Upgrade;
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
  units: Unit[];
  spells: Spell[];
  titans: Titan[];
  consumables: Consumable[];
  upgrades: Upgrade[];
  _source?: string;
}

export type UnifiedEntity = Unit | Spell | Titan | Spellcaster | Consumable | Upgrade;
