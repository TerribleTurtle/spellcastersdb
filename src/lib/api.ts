/**
 * API Fetching Service for Spellcasters Community API
 * Implements Stale-While-Revalidate (SWR) via Next.js fetch
 */

import { z } from "zod";
import type { AllDataResponse, Unit, Spell, Titan, Spellcaster, Consumable, Upgrade, UnifiedEntity, Incantation } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://terribleturtle.github.io/spellcasters-community-api/api/v1";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("WARN: NEXT_PUBLIC_API_URL is not defined. Using default API URL.");
}
const REVALIDATE_SECONDS = 60; // 1 minute cache

// ============================================================================
// Zod Schemas (Validation Layer)
// ============================================================================


// Base parts shared by Unit and Spell
const IncantationBase = {
  entity_id: z.string(),
  name: z.string(),
  magic_school: z.enum(["Elemental", "Wild", "War", "Astral", "Holy", "Technomancy", "Necromancy", "Titan"]),
  description: z.string(),
  image_required: z.boolean().optional(),
  tags: z.array(z.string()),
  
  // Flattened Card Config
  rank: z.enum(["I", "II", "III", "IV", "V"]).optional(), // Optional for non-units if shared? Actually Units need it.
};

const UnitSchema = z.object({
  ...IncantationBase,
  category: z.enum(["Creature", "Building"]), // Strict subset
  health: z.number(),
  damage: z.number().optional(),
  attack_speed: z.number().optional(),
  range: z.number().optional(),
  movement_speed: z.number().optional(),
  movement_type: z.enum(["Ground", "Fly", "Hover", "Stationary"]).nullish(),
}).passthrough(); 

const SpellSchema = z.object({
  ...IncantationBase,
  category: z.literal("Spell"),
  radius: z.number().nullish(),
  duration: z.number().nullish(),
  tick_rate: z.number().nullish(),
  max_targets: z.number().nullish(),
  target_mask: z.array(z.string()).nullish(),
  damage: z.number().optional(),
  range: z.number().optional(),
}).passthrough();

const TitanSchema = z.object({
  entity_id: z.string(),
  name: z.string(),
  category: z.literal("Titan"),
  magic_school: z.enum(["Elemental", "Wild", "War", "Astral", "Holy", "Technomancy", "Necromancy", "Titan"]),
  rank: z.string(), // Usually V
  description: z.string(),
  image_required: z.boolean().optional(),
  tags: z.array(z.string()),
  
  // Titan Stats (Flattened)
  health: z.number(),
  damage: z.number(),
  movement_speed: z.number(),
  heal_amount: z.number().optional(),
}).passthrough();

const AbilitySchema = z.object({
  ability_id: z.string().optional(),
  name: z.string(),
  description: z.string().nullish().transform(val => val || ""),
  cooldown: z.number().nullish(),
});

const SpellcasterSchema = z.object({
  spellcaster_id: z.string(), // Renamed from hero_id
  name: z.string(),
  // category: z.literal("Spellcaster").optional().default("Spellcaster"), // Removed (fixed in source)
  class: z.enum(["Enchanter", "Duelist", "Conqueror", "Unknown"]).optional().default("Unknown"),
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
  
  abilities: z.object({
    passive: z.array(AbilitySchema),
    primary: AbilitySchema,
    defense: AbilitySchema,
    ultimate: AbilitySchema,
  }),
}).passthrough();

const ConsumableSchema = z.object({
  entity_id: z.string(), // Renamed from consumable_id
  name: z.string(),
  description: z.string().optional().nullable().default(""),
  tags: z.array(z.string()).optional().default([]),
  category: z.literal("Consumable").optional().default("Consumable"),
  rarity: z.string().optional(),
}).passthrough();

const UpgradeSchema = z.object({
  entity_id: z.string(),
  name: z.string(),
  description: z.string(),
  image_required: z.boolean().optional(),
  prerequisite_level: z.number().optional(),
  cost: z.number().optional(),
  tags: z.array(z.string()),
}).passthrough();

const AllDataSchema = z.object({
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

// ============================================================================
// Fetch Logic
// ============================================================================

/**
 * Fetches the complete game data from all_data.json
 * Uses Zod to validate the response. Returns "best effort" empty arrays on total failure.
 */
export async function fetchGameData(): Promise<AllDataResponse> {
  const url = `${API_BASE_URL}/all_data.json`;
  
    // Local Dev Override
    if (process.env.NODE_ENV === 'development') {
        try {
            console.log("Attempting to load local data...");
            const fs = await import('fs/promises');

            
            // CRITICAL: Local Development Source of Truth
            // This MUST point to the external repo location, NOT a local copy in this repo.
            const specificPath = "C:\\Projects\\spellcasters-community-api\\api\\v1\\all_data.json";
            const localPath = specificPath;
            
            console.log(`Loading data from: ${localPath}`);
            const fileContent = await fs.readFile(localPath, 'utf-8');
            const rawData = JSON.parse(fileContent);

            // Pre-process: Filter units to ensure only Creatures and Buildings are in the units array
            if (Array.isArray(rawData.units)) {
                rawData.units = rawData.units.filter((u: any) => u.category === "Creature" || u.category === "Building");
            }
            
            const result = AllDataSchema.safeParse(rawData);
            if (result.success) {
                console.log("✅ Loaded and validated local data successfully.");
                return result.data as unknown as AllDataResponse;
            } else {
                console.error("🔴 Local Data Validation Failed:", JSON.stringify(result.error.format(), null, 2));
                // Fallthrough to remote? Or throw?
                // Throwing in dev is better visibility
                throw new Error("Local Data Validation Failed");
            }
        } catch (e) {
            console.warn("⚠️ Could not load local data:", e);
            // Fallback
        }
    }

    try {
    const response = await fetch(url, {
      next: { 
        revalidate: REVALIDATE_SECONDS,
        tags: ['game-data']
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game data: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    // Pre-process: Filter units to ensure only Creatures and Buildings are in the units array
    // The raw data might have Spells mixed in (legacy structure)
    if (Array.isArray(rawData.units)) {
        rawData.units = rawData.units.filter((u: any) => u.category === "Creature" || u.category === "Building");
    }

    // Zod Safe Parse
    const result = AllDataSchema.safeParse(rawData);

    if (!result.success) {
      console.error("🔴 CRITICAL: API Schema Validation Failed", result.error.format());
      
      if (process.env.NODE_ENV === 'development') {
         // In Dev, throw so we see it.
         throw new Error(`API Validation Failed: ${JSON.stringify(result.error.format(), null, 2)}`);
      }
      return {
          build_info: { version: "unknown", generated_at: new Date().toISOString() },
          spellcasters: [],
          units: [],
          spells: [],
          titans: [],
          consumables: [],
          upgrades: []
      };
    }

    return result.data as unknown as AllDataResponse;
  } catch (error) {
    console.error("Error fetching game data:", error);
    // Return empty safe object
    return {
        build_info: { version: "error", generated_at: new Date().toISOString() },
        spellcasters: [],
        units: [],
        spells: [],
        titans: [],
        consumables: [],
        upgrades: []
    };
  }
}

/**
 * Returns all Creatures and Buildings
 */
export async function getUnits(): Promise<Unit[]> {
  const data = await fetchGameData();
  return data.units;
}

/**
 * Returns all Spells
 */
export async function getSpells(): Promise<Spell[]> {
  const data = await fetchGameData();
  return data.spells;
}

/**
 * Returns all Titans
 */
export async function getTitans(): Promise<Titan[]> {
  const data = await fetchGameData();
  return data.titans;
}

/**
 * Returns Units + Spells aggregated (for Deck Builder)
 */
export async function getIncantations(): Promise<Incantation[]> {
    const data = await fetchGameData();
    // Use type assertion to satisfy TS if needed, or rely on compatible interfaces
    return [...data.units, ...data.spells];
}

/**
 * Returns all spellcasters (formerly Heroes)
 */
export async function getSpellcasters(): Promise<Spellcaster[]> {
  const data = await fetchGameData();
  return data.spellcasters;
}



/**
 * Returns all consumables
 */
export async function getConsumables(): Promise<Consumable[]> {
  const data = await fetchGameData();
  return data.consumables;
}

/**
 * Returns all upgrades
 */
export async function getUpgrades(): Promise<Upgrade[]> {
  const data = await fetchGameData();
  return data.upgrades;
}

/**
 * Get a specific unit or spell by entity_id
 * Searches units, spells, and titans
 */
export async function getEntityById(entityId: string): Promise<Unit | Spell | Titan | null> {
  const data = await fetchGameData();
  const unit = data.units.find(u => u.entity_id === entityId);
  if (unit) return unit;
  
  const spell = data.spells.find(s => s.entity_id === entityId);
  if (spell) return spell;

  const titan = data.titans.find(t => t.entity_id === entityId);
  if (titan) return titan;

  return null;
}

/**
 * Legacy support: Get Unit by ID (only checks Units)
 */
export async function getUnitById(entityId: string): Promise<Unit | null> {
    const units = await getUnits();
    return units.find(unit => unit.entity_id === entityId) || null;
}

/**
 * Get a specific spellcaster by id
 */
export async function getSpellcasterById(entityId: string): Promise<Spellcaster | null> {
  const spellcasters = await getSpellcasters();
  return spellcasters.find(s => s.spellcaster_id === entityId) || null;
}

/**
 * Returns a unified list of all searchable entities
 */
export async function getAllEntities(): Promise<UnifiedEntity[]> {
  const data = await fetchGameData();
  return [
    ...data.units,
    ...data.spells,
    ...data.titans,
    ...data.spellcasters,
    ...data.consumables
  ];
}
