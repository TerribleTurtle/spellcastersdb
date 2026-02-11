
import { z } from "zod";

// ============================================================================
// Zod Schemas (Validation Layer)
// ============================================================================

// Base parts shared by Unit and Spell
export const IncantationBase = {
  entity_id: z.string(),
  name: z.string(),
  magic_school: z.enum([
    "Elemental",
    "Wild",
    "War",
    "Astral",
    "Holy",
    "Technomancy",
    "Necromancy",
    "Titan",
  ]),
  description: z.string(),
  image_required: z.boolean().optional(),
  tags: z.array(z.string()),

  // Flattened Card Config
  rank: z.enum(["I", "II", "III", "IV", "V"]).optional(), // Optional for non-units if shared? Actually Units need it.
};

// Shared Mechanic Parts
const AuraSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  radius: z.number(),
  value: z.number(),
  interval: z.number(),
  target_type: z.enum(["Ally", "Enemy", "All", "Building", "Creature"]),
  effect: z.string().optional(),
});

const DamageModifierSchema = z.object({
  target_type: z.union([
    z.enum(["Building", "Creature", "Spellcaster", "Unit", "All", "Lifestone", "Flying", "Ground", "Hover"]),
    z.array(z.enum(["Building", "Creature", "Spellcaster", "Unit", "All", "Lifestone", "Flying", "Ground", "Hover"]))
  ]),
  multiplier: z.number(),
  condition: z.string().optional(),
});

const DamageReductionSchema = z.object({
  source_type: z.string(),
  multiplier: z.number(),
  condition: z.string().optional(),
});

const SpawnerSchema = z.object({
  unit_id: z.string(),
  count: z.number(),
  trigger: z.enum(["Death", "Interval", "Spawn"]),
  interval: z.number().optional(),
});

const FeaturesSchema = z.object({
  name: z.string(),
  description: z.string(),
});

// Unit Mechanics (Creature/Building)
export const UnitMechanicsSchema = z.object({
  aura: z.array(AuraSchema).optional(),
  damage_modifiers: z.array(DamageModifierSchema).optional(),
  damage_reduction: z.array(DamageReductionSchema).optional(),
  spawner: z.array(SpawnerSchema).optional(),
  features: z.array(FeaturesSchema).optional(),
  capture_speed_modifier: z.number().optional(),
  initial_attack: z.object({
      damage_flat: z.number(),
      target_types: z.array(z.enum(["Ground", "Hover", "Flying", "Building", "Creature", "Spellcaster", "Unit", "All"])),
      description: z.string(),
  }).optional(),
  bonus_damage: z.array(z.object({
      value: z.number(),
      unit: z.enum(["flat", "percent_max_hp", "percent_current_hp"]),
      target_type: z.enum(["Building", "Creature", "All"])
  })).optional()
}).strict();

// Spell Mechanics
export const SpellMechanicsSchema = z.object({
  waves: z.number().optional(),
  interval: z.number().optional(),
  stagger_modifier: z.enum(["None", "Light", "Medium", "High"]).optional(),
  capture_speed_modifier: z.number().optional(),
  aura: z.array(AuraSchema).optional(),
  spawner: z.array(SpawnerSchema).optional(),
  damage_modifiers: z.array(DamageModifierSchema).optional(),
  damage_reduction: z.array(DamageReductionSchema).optional(),
  features: z.array(FeaturesSchema).optional(),
  bonus_damage: z.array(z.object({
      value: z.number(),
      unit: z.enum(["flat", "percent_max_hp", "percent_current_hp"]),
      target_type: z.enum(["Building", "Creature", "All"])
  })).optional()
}).strict();

// Legacy/Loose Mechanics for Titans/Abilities (or update to strict later)
export const MechanicsSchema = z.object({
  waves: z.number().optional(),
  interval: z.number().optional(),
  aura: z.array(AuraSchema).optional(),
  damage_modifiers: z.union([z.string(), z.array(DamageModifierSchema)]).optional(), // Keep loose for legacy compat if needed
  damage_reduction: z.array(DamageReductionSchema).optional(),
  spawner: z.array(SpawnerSchema).optional(),
  features: z.array(FeaturesSchema).optional(),
}).passthrough();

// V1.2 Common fields
const CommonSchemaParts = {
    $schema: z.string().optional(),
    last_modified: z.string().optional(),
    changelog: z.array(z.object({
        date: z.string(),
        version: z.string(),
        description: z.string()
    })).optional(),
};

export const UnitSchema = z
  .object({
    ...CommonSchemaParts,
    ...IncantationBase,
    category: z.enum(["Creature", "Building"]), // Strict subset
    health: z.number(),
    damage: z.number().optional(),
    dps: z.number().optional(),
    attack_interval: z.number().optional(),
    attack_speed: z.number().optional(), // Deprecated in favor of attack_interval, but kept if data has it
    range: z.number().optional(),
    movement_speed: z.number().optional(),
    movement_type: z.enum(["Ground", "Fly", "Flying", "Hover", "Stationary"]).nullish(),
    mechanics: UnitMechanicsSchema.optional(),
    
    // Additional strict Unit fields
    heal_amount: z.number().optional(),
    duration: z.number().optional(),
  })
  .strict();

export const SpellSchema = z
  .object({
    ...CommonSchemaParts,
    ...IncantationBase,
    category: z.literal("Spell"),
    radius: z.number().nullish(), // Deprecated in V1.2 mechanics?
    duration: z.number().nullish(),
    tick_rate: z.number().nullish(), // Deprecated
    max_targets: z.number().nullish(), // Deprecated
    target_mask: z.array(z.string()).nullish(), // Deprecated
    damage: z.number().optional(),
    range: z.number().optional(),
    heal_amount: z.number().optional(),
    mechanics: SpellMechanicsSchema.optional(),
  })
  .strict();

export const TitanSchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    category: z.literal("Titan"),
    magic_school: z.enum([
      "Elemental",
      "Wild",
      "War",
      "Astral",
      "Holy",
      "Technomancy",
      "Necromancy",
      "Titan",
    ]),
    rank: z.string(), // Usually V
    description: z.string(),
    image_required: z.boolean().optional(),
    tags: z.array(z.string()),

    // Titan Stats (Flattened)
    health: z.number(),
    damage: z.number(),
    dps: z.number().optional(),
    attack_interval: z.number().optional(),
    movement_speed: z.number(),
    heal_amount: z.number().optional(),
    passive_health_regen: z.number().optional(),
  })
  .passthrough();

export const AbilitySchema = z.object({
  ability_id: z.string().optional(),
  name: z.string(),
  description: z
    .string()
    .nullish()
    .transform((val) => val || ""),
  cooldown: z.number().nullish(),
  stats: z.record(z.string(), z.union([z.number(), z.null()])).optional(),
  mechanics: MechanicsSchema.optional(),
});

export const SpellcasterSchema = z
  .object({
    spellcaster_id: z.string(),
    name: z.string(),
    // category: z.literal("Spellcaster").optional().default("Spellcaster"), // Removed (fixed in source)
    class: z
      .enum(["Enchanter", "Duelist", "Conqueror", "Unknown"])
      .optional()
      .default("Unknown"),
    image_required: z.boolean().optional(),
    difficulty: z.number().optional(), // New field

    // RPG Stats Removed
    // health: z.number(),
    // movement_speed: z.number(),
    // flight_speed: z.number(),
    // health_regen_rate: z.number(),
    // regen_delay: z.number().optional().nullable(),
    // attack_damage_summoner: z.number(),
    // attack_damage_minion: z.number(),
    
    movement_type: z.enum(["Ground", "Fly", "Flying", "Hover", "Stationary"]).nullish(),


    abilities: z.object({
      passive: z.array(AbilitySchema),
      primary: AbilitySchema,
      defense: AbilitySchema,
      ultimate: AbilitySchema,
    }),
  })
  .passthrough();

export const ConsumableSchema = z
  .object({
    entity_id: z.string(), // Renamed from consumable_id
    name: z.string(),
    description: z.string().optional().nullable().default(""),
    tags: z.array(z.string()).optional().default([]),
    category: z.literal("Consumable").optional().default("Consumable"),
    rarity: z.string().optional(),
  })
  .passthrough();

export const UpgradeSchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    description: z.string(),
    image_required: z.boolean().optional(),
    prerequisite_level: z.number().optional(),
    cost: z.number().optional(),
    tags: z.array(z.string()),
  })
  .passthrough();

export const AllDataSchema = z.object({
  build_info: z.object({
    version: z.string(),
    generated_at: z.string(),
  }),
  spellcasters: z.array(SpellcasterSchema),
  units: z.array(UnitSchema),
  spells: z.array(SpellSchema),
  titans: z.array(TitanSchema),
  consumables: z.array(ConsumableSchema),
  upgrades: z.array(UpgradeSchema),
});
