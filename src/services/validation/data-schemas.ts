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
  knowledge_cost: z.number().int().min(0).optional(),
};

// Condition Schema - Hardened for V2 API Drift
export const ConditionSchema = z.union([
  z.object({
    field: z.string(),
    operator: z.string(),
    value: z.union([z.string(), z.number()]),
  }),
  z.string(), // Allow string fallback for legacy/malformed data
]);

// Shared Mechanic Parts
const AuraSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  radius: z.number(),
  value: z.number(),
  interval: z.number(),
  target_type: z
    .enum(["Ally", "Enemy", "All", "Building", "Creature"])
    .optional(),
  target_types: z.array(z.string()).optional(), // V2
  effect: z.string().optional(),
});

export const DamageModifierSchema = z.object({
  target_type: z
    .union([
      z.enum([
        "Building",
        "Creature",
        "Spellcaster",
        "Unit",
        "All",
        "Lifestone",
        "Flying",
        "Ground",
        "Hover",
      ]),
      z.array(z.string()),
    ])
    .optional(),
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

const InfusionRefSchema = z.object({
  id: z.string(),
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
  initial_attack: z
    .object({
      damage_flat: z.number(),
      target_types: z.array(
        z.enum([
          "Ground",
          "Hover",
          "Flying",
          "Building",
          "Creature",
          "Spellcaster",
          "Unit",
          "All",
        ])
      ),
      description: z.string(),
    })
    .optional(),
  bonus_damage: z
    .array(
      z.object({
        value: z.number(),
        unit: z.enum(["flat", "percent_max_hp", "percent_current_hp"]),
        target_type: z.string().optional(),
        target_types: z.array(z.string()).optional(),
      })
    )
    .optional(),
  infusion: InfusionRefSchema.optional(),
});

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
  bonus_damage: z
    .array(
      z.object({
        value: z.number(),
        unit: z.enum(["flat", "percent_max_hp", "percent_current_hp"]),
        target_type: z.string().optional(),
        target_types: z.array(z.string()).optional(),
      })
    )
    .optional(),
  infusion: InfusionRefSchema.optional(),
});

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
  infusion: InfusionRefSchema.optional(),
});

// V1.2 Common fields
const StatChangeSchema = z.object({
  field: z.string(),
  old: z.unknown(),
  new: z.unknown(),
});

const StatChangeEntrySchema = z.object({
  version: z.string(),
  date: z.string(),
  changes: z.array(StatChangeSchema),
});

const CommonSchemaParts = {
  $schema: z.string().optional(),
  last_modified: z.string().optional(),
  changelog: z.any().optional(),
  stat_changes: z.array(StatChangeEntrySchema).optional(),
};

export const UnitSchema = z.object({
  ...CommonSchemaParts,
  ...IncantationBase,
  category: z.enum([EntityCategory.Creature, EntityCategory.Building]), // Strict subset
  health: z.number(),
  damage: z.number().optional(),
  dps: z.number().optional(),
  attack_interval: z.number().optional(),
  range: z.number().optional(),
  movement_speed: z.number().optional(),
  movement_type: z
    .enum(["Ground", "Fly", "Flying", "Hover", "Stationary"])
    .optional(),
  mechanics: UnitMechanicsSchema.optional(),
  population: z.number().optional(),

  // V2 Unit Config
  charges: z.number().optional(),
  recharge_time: z.number().optional(),
  cast_time: z.number().optional(),
  duration: z.number().optional(),
  value: z.number().optional(), // Faerie's "value"? Or maybe another unit's.
});

export const SpellSchema = z.object({
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
});

export const TitanSchema = z.object({
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

  // V2 Weak Points (positional vulnerabilities)
  weak_points: z
    .array(
      z.object({
        location: z.enum([
          "front",
          "back",
          "side",
          "head",
          "chest",
          "legs",
          "wings",
          "tail",
        ]),
        multiplier: z.number().min(1),
        description: z.string().optional(),
      })
    )
    .optional(),

  // V2 Fields detected during hardening
  mechanics: MechanicsSchema.optional(),
  charges: z.number().optional(),
  recharge_time: z.number().optional(),
  cast_time: z.number().optional(),
  population: z.number().optional(),
});

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

const SpellcasterImageUrlsSchema = z.object({
  card: z.string().optional(),
  attack: z.string().optional(),
  defense: z.string().optional(),
  passive: z.string().optional(),
  ultimate: z.string().optional(),
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
    category: z
      .literal(EntityCategory.Spellcaster)
      .default(EntityCategory.Spellcaster),
    image_required: z.boolean().optional(),
    difficulty: z.number().optional(),

    // V2 Stats Re-added
    health: z.number(),
    population: z.number().optional(),
    movement_type: z
      .enum(["Ground", "Fly", "Flying", "Hover", "Stationary"])
      .optional(),
    tags: z.array(z.string()).default([]),

    abilities: z.object({
      passive: z.array(AbilitySchema),
      primary: AbilitySchema,
      defense: AbilitySchema,
      ultimate: AbilitySchema,
    }),

    // API-injected image URLs
    image_urls: SpellcasterImageUrlsSchema.optional(),
  })
  // .strict() removed to allow stripping of legacy/unused API fields like movement_speed
  .transform((data) => {
    // Map spellcaster_id if missing from entity_id
    if (!data.spellcaster_id && data.entity_id) {
      data.spellcaster_id = data.entity_id;
    }
    return data;
  });

export const ConsumableSchema = z.object({
  entity_id: z.string(), // Renamed from consumable_id
  name: z.string(),
  description: z
    .string()
    .nullish()
    .transform((val) => val || ""),
  tags: z.array(z.string()).optional().default([]),
  category: z
    .literal(EntityCategory.Consumable)
    .optional()
    .default(EntityCategory.Consumable),
  rarity: z.string().optional(),
  // Cast Stone fields (V2 extension)
  effect_type: z.string().optional(),
  grants_incantation: z.string().optional(),
  drop_time_seconds: z.array(z.number()).optional(),
});

// Archetype-Based Upgrades (V2 Rework)
const UpgradeChoiceSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  effect: z.record(z.string(), z.number()),
});

const IncantationUpgradeSchema = z.object({
  incantation_id: z.string(),
  upgrades: z.array(UpgradeChoiceSchema),
});

const PopulationScalingSchema = z.object({
  level: z.number(),
  population_cap: z.number(),
});

export const UpgradeSchema = z.object({
  archetype: z.string(), // Accepts any archetype the API sends (was strict enum)
  level_cap: z.number().optional().default(0),
  population_scaling: z.array(PopulationScalingSchema).optional().default([]),
  incantation_upgrades: z
    .array(IncantationUpgradeSchema)
    .optional()
    .default([]),
});

// DamageTier Schema (used by Infusions)
const DamageTierSchema = z.object({
  tier: z.enum(["I", "II", "III"]),
  value: z.number(),
  calculation_unit: z.string(),
  interval: z.number().optional(),
});

const InfusionAlliedEffectSchema = z.object({
  description: z.string(),
  stat_multiplier: z.record(z.string(), z.number()).optional(),
  heal: z
    .object({
      value: z.number(),
      interval: z.number(),
    })
    .optional(),
});

const InfusionEnemyEffectSchema = z.object({
  description: z.string(),
  status_buildup: z.string().optional(),
  damage_tiers: z.array(DamageTierSchema).optional(),
});

export const InfusionSchema = z.object({
  id: z.string(),
  name: z.string(),
  element: z.enum(["Fire", "Lightning", "Poison", "Ice"]),
  allied_effect: InfusionAlliedEffectSchema,
  enemy_effect: InfusionEnemyEffectSchema,
});

// Game Systems Schema (V2 — New Standalone Endpoint)
const CaptureXPSchema = z.object({
  first: z.number(),
  recapture: z.number(),
  passive_per_sec: z.number(),
  spellcaster_on_point: z.number(),
});

const SummoningXPSchema = z.object({
  spellcaster_death: z.number(),
  rank_I: z.number(),
  rank_II: z.number(),
  rank_III: z.number(),
  rank_IV: z.number(),
});

const ScalingXPSchema = z.object({
  building_spawn_multiplier: z.number(),
  level_thresholds: z.array(z.number()),
});

export const MatchXPSchema = z
  .object({
    capture: CaptureXPSchema.optional(),
    kills: SummoningXPSchema.optional(),
    scaling: ScalingXPSchema.optional(),
  })
  .transform((data) => ({
    capture: data.capture,
    summoning: data.kills,
    scaling: data.scaling,
  }));

const ProgressionConfigSchema = z.object({
  starting_knowledge: z.object({
    default: z.number(),
    beta: z.number(),
  }),
  earn_rates: z.object({
    first_daily_match: z.number(),
    win: z.number(),
    loss: z.number(),
  }),
});

const RankedTierSchema = z.object({
  name: z.string(),
  rp_threshold_min: z.number(),
  rp_loss_per_loss: z.number(),
});

const RankedConfigSchema = z.object({
  tiers_per_rank: z.number(),
  rp_gain_per_win: z.number(),
  ranks: z.array(RankedTierSchema),
});

export const GameSystemsSchema = z.object({
  progression: ProgressionConfigSchema,
  ranked: RankedConfigSchema,
  match_xp: MatchXPSchema,
});

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
  upgrades: z.array(UpgradeSchema).optional().default([]),
  infusions: z.array(InfusionSchema).optional().default([]),
  game_systems: GameSystemsSchema.optional(),
});
