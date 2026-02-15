import { z } from "zod";
import { EntityCategory } from "@/types/enums";

// ============================================================================
// Zod Schemas (Validation Layer)
// ============================================================================

// Base parts shared by Unit and Spell
export const IncantationBase = {
  entity_id: z.string(),
  name: z.string().min(1),
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

// Condition Schema - Hardened for V2 API Drift
const ConditionSchema = z.union([
  z.object({
    field: z.string(),
    operator: z.string(),
    value: z.union([z.string(), z.number()]),
  }),
  z.string() // Allow string fallback for legacy/malformed data
]);

// Shared Mechanic Parts
const AuraSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  radius: z.number(),
  value: z.number(),
  interval: z.number(),
  target_type: z.enum(["Ally", "Enemy", "All", "Building", "Creature"]).optional(),
  target_types: z.array(z.string()).optional(), // V2
  effect: z.string().optional(),
});

const DamageModifierSchema = z.object({
  target_type: z.union([
    z.enum(["Building", "Creature", "Spellcaster", "Unit", "All", "Lifestone", "Flying", "Ground", "Hover"]),
    z.array(z.string())
  ]).optional(),
  target_types: z.array(z.string()).optional(), // V2
  multiplier: z.number(),
  condition: ConditionSchema.optional(),
});

const DamageReductionSchema = z.object({
  source_type: z.string(),
  multiplier: z.number(),
  condition: ConditionSchema.optional(),
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

const StealthSchema = z.object({
  duration: z.number(),
  break_on_attack: z.boolean(),
});

// CleaveSchema removed - replaced by boolean in V2
// const CleaveSchema = z.object({
//   radius: z.number(),
//   arc: z.number(),
//   damage_percent: z.number().optional(),
//   damage_dropoff: z.number().optional(),
// });

// Unit Mechanics (Creature/Building)
export const UnitMechanicsSchema = z.object({
  pierce: z.boolean().optional(),
  stealth: StealthSchema.optional(),
  cleave: z.boolean().optional(), // V2 Changed to bool
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
      target_type: z.string().optional(),
      target_types: z.array(z.string()).optional(),
  })).optional()
}).strict();

// Spell Mechanics
export const SpellMechanicsSchema = z.object({
  pierce: z.boolean().optional(),
  stealth: StealthSchema.optional(),
  cleave: z.boolean().optional(), // V2 Changed to bool
  waves: z.number().optional(),
  interval: z.number().optional(),
  stagger_modifier: z.boolean().optional(), // V2 Boolean
  capture_speed_modifier: z.number().optional(),
  aura: z.array(AuraSchema).optional(),
  spawner: z.array(SpawnerSchema).optional(),
  damage_modifiers: z.array(DamageModifierSchema).optional(),
  damage_reduction: z.array(DamageReductionSchema).optional(),
  features: z.array(FeaturesSchema).optional(),
  bonus_damage: z.array(z.object({
      value: z.number(),
      unit: z.enum(["flat", "percent_max_hp", "percent_current_hp"]),
      target_type: z.string().optional(),
      target_types: z.array(z.string()).optional(),
  })).optional()
}).strict();

// Legacy/Loose Mechanics for Titans/Abilities (or update to strict later)
// NOTE: "Legacy" implies this schema is less strict than Unit/Spell schemas to accommodate
// the wider variety of effects found in Titans and Abilities.
export const MechanicsSchema = z.object({
  waves: z.number().optional(),
  interval: z.number().optional(),
  pierce: z.boolean().optional(),
  stealth: StealthSchema.optional(),
  cleave: z.boolean().optional(), // V2 Changed to bool
  aura: z.array(AuraSchema).optional(),
  damage_modifiers: z.array(DamageModifierSchema).optional(),
  damage_reduction: z.array(DamageReductionSchema).optional(),
  spawner: z.array(SpawnerSchema).optional(),
  features: z.array(FeaturesSchema).optional(),
  auto_capture_altars: z.boolean().optional(),
}).strict();

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
    category: z.enum([EntityCategory.Creature, EntityCategory.Building]), // Strict subset
    health: z.number(),
    damage: z.number().optional(),
    dps: z.number().optional(),
    attack_interval: z.number().optional(),
    range: z.number().optional(),
    movement_speed: z.number().optional(),
    movement_type: z.enum(["Ground", "Fly", "Flying", "Hover", "Stationary"]).optional(),
    mechanics: UnitMechanicsSchema.optional(),
    population: z.number().optional(),
    
    // V2 Unit Config
    charges: z.number().optional(),
    recharge_time: z.number().optional(),
    cast_time: z.number().optional(),
    duration: z.number().optional(), 
    value: z.number().optional(), // Faerie's "value"? Or maybe another unit's.
  })
  .strict();

export const SpellSchema = z
  .object({
    ...CommonSchemaParts,
    ...IncantationBase,
    category: z.literal(EntityCategory.Spell),
    damage: z.number().optional(),
    range: z.number().optional(),
    cooldown: z.number().optional(),
    mechanics: SpellMechanicsSchema.optional(),

    // V2 Spell Config
    charges: z.number().optional(),
    recharge_time: z.number().optional(),
    cast_time: z.number().optional(),
    value: z.number().optional(),
    duration: z.number().optional(), // V2
    heal_amount: z.number().optional(),
  })
  .strict();

export const TitanSchema = z
  .object({
    ...CommonSchemaParts,
    entity_id: z.string(),
    name: z.string(),
    category: z.literal(EntityCategory.Titan),
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
    
    // V2 Fields detected during hardening
    mechanics: MechanicsSchema.optional(),
    charges: z.number().optional(),
    recharge_time: z.number().optional(),
    cast_time: z.number().optional(),
    population: z.number().optional(),
  })
  .strict(); // Enforce strict schema to catch API drift

export const AbilitySchema = z.object({
  name: z.string(),
  description: z
    .string()
    .nullish()
    .transform((val) => val || ""),
  damage: z.number().optional(),
  cooldown: z.number().optional(),
  mechanics: MechanicsSchema.optional(),
  charges: z.number().optional(),
  duration: z.number().optional(),
  interval: z.number().optional(),
  projectiles: z.number().optional(),
});

export const SpellcasterSchema = z
  .object({
    ...CommonSchemaParts,
    entity_id: z.string(), // V2 uses entity_id
    spellcaster_id: z.string().optional(), // Mapping
    name: z.string(),
    description: z.string().optional().default(""),
    class: z
      .enum(["Enchanter", "Duelist", "Conqueror", "Unknown"])
      .optional()
      .default("Unknown"),
    category: z.literal(EntityCategory.Spellcaster).default(EntityCategory.Spellcaster),
    image_required: z.boolean().optional(),
    difficulty: z.number().optional(),
    
    // V2 Stats Re-added
    health: z.number(),
    population: z.number().optional(),
    movement_type: z.enum(["Ground", "Fly", "Flying", "Hover", "Stationary"]).optional(),
    tags: z.array(z.string()).default([]),

    abilities: z.object({
      passive: z.array(AbilitySchema),
      primary: AbilitySchema,
      defense: AbilitySchema,
      ultimate: AbilitySchema,
    }),
  })
  // .strict() removed to allow stripping of legacy/unused API fields like movement_speed
  .transform((data) => {
    // Map spellcaster_id if missing from entity_id
    if (!data.spellcaster_id && data.entity_id) {
      data.spellcaster_id = data.entity_id;
    }
    return data;
  });

export const ConsumableSchema = z
  .object({
    entity_id: z.string(), // Renamed from consumable_id
    name: z.string(),
    description: z.string().nullish().transform((val) => val || ""),
    tags: z.array(z.string()).optional().default([]),
    category: z.literal(EntityCategory.Consumable).optional().default(EntityCategory.Consumable),
    rarity: z.string().optional(),
  });

export const UpgradeSchema = z
  .object({
    ...CommonSchemaParts,
    entity_id: z.string().optional(),
    upgrade_id: z.string().optional(),
    name: z.string(),
    description: z.string(),
    image_required: z.boolean().optional(),
    prerequisite_level: z.number().optional(),
    cost: z.number().optional(),
    tags: z.array(z.string()).optional().default([]), // Allow missing tags or default empty
    target_tags: z.array(z.string()).optional(), // V2 Placeholder often has target_tags
    category: z.literal(EntityCategory.Upgrade).default(EntityCategory.Upgrade),
    effect: z.record(z.string(), z.any()).optional(),
  })
  .strict() // Enforce strict schema
  .transform((data) => {
      // Map upgrade_id to entity_id
      if (!data.entity_id && data.upgrade_id) {
          data.entity_id = data.upgrade_id;
      }
      return data as {
          entity_id: string; // Ensure entity_id is present after transform
          name: string;
          description: string;
          image_required?: boolean;
          prerequisite_level?: number;
          cost?: number;
          tags: string[];
          category: EntityCategory.Upgrade;
          [key: string]: unknown;
      };
  })
  .refine((data) => !!data.entity_id, { message: "entity_id or upgrade_id is required" });

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
