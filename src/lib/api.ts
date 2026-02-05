/**
 * API Fetching Service for Spellcasters Community API
 * Implements Stale-While-Revalidate (SWR) via Next.js fetch
 * NOW WITH ZOD VALIDATION
 */

import { z } from "zod";
import type { AllDataResponse, Unit, Spellcaster, Consumable, Upgrade, UnifiedEntity } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://terribleturtle.github.io/spellcasters-community-api/api/v1";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("WARN: NEXT_PUBLIC_API_URL is not defined. Using default API URL.");
}
const REVALIDATE_SECONDS = 60; // 1 minute cache

// ============================================================================
// Zod Schemas (Validation Layer)
// ============================================================================

const CardConfigSchema = z.object({
  rank: z.enum(["I", "II", "III", "IV"]),
  cost_population: z.number(),
  cost_charges: z.number(),
  initial_charges: z.number().optional().default(0),
  charge_time: z.number(),
  cast_time: z.number(),
});

const UnitSchema = z.object({
  entity_id: z.string(),
  name: z.string(),
  category: z.enum(["Creature", "Building", "Spell", "Titan"]),
  magic_school: z.enum(["Astral", "War", "Elemental", "Lightning", "Holy", "Dark", "Frost"]),
  description: z.string(),
  image_required: z.boolean().optional(),
  health: z.number(),
  damage: z.number(),
  attack_speed: z.number(),
  range: z.number(),
  movement_speed: z.number(),
  movement_type: z.enum(["Ground", "Fly", "Hover", "Stationary"]).optional(),
  radius: z.number().optional(),
  duration: z.number().optional(),
  tick_rate: z.number().optional(),
  max_targets: z.number().optional(),
  collision_radius: z.number().optional(),
  target_mask: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  card_config: CardConfigSchema,
  // Catch-all for extra fields to prevent strict failure on minor schema additions
}).passthrough(); 

const AbilitySchema = z.object({
  ability_id: z.string(),
  name: z.string(),
  description: z.string(),
  cooldown: z.number().optional(),
});

const SpellcasterSchema = z.object({
  hero_id: z.string(),
  name: z.string(),
  image_required: z.boolean().optional(),
  health: z.number(),
  movement_speed: z.number(),
  flight_speed: z.number(),
  health_regen_rate: z.number(),
  regen_delay: z.number(),
  attack_damage_summoner: z.number(),
  attack_damage_minion: z.number(),
  abilities: z.object({
    passive: z.array(AbilitySchema),
    primary: AbilitySchema,
    defense: AbilitySchema,
    ultimate: AbilitySchema,
  }),
}).passthrough();

const ConsumableSchema = z.object({
  consumable_id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
}).passthrough();

const AllDataSchema = z.object({
  build_info: z.object({
    version: z.string(),
    generated_at: z.string(),
  }),
  units: z.array(UnitSchema),
  heroes: z.array(SpellcasterSchema),
  consumables: z.array(ConsumableSchema),
  upgrades: z.array(z.any()), // Loose typing for upgrades for now
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
    
    // Zod Safe Parse
    const result = AllDataSchema.safeParse(rawData);

    if (!result.success) {
      console.error("🔴 CRITICAL: API Schema Validation Failed", result.error.format());
      
      // FALLBACK: Return whatever we got if it looks vaguely shaped right, OR return safe empties.
      // For this app, strict correctness is preferred, but "Show nothing" is better than "Crash".
      // We will try to patch the raw data into our verified shape type casted, 
      // but alerting the developer is key.
      
      // If we have units/heroes keys, return them even if dirty?
      // No, let's respect the "Anti-Corruption" goal. 
      // We will return empty arrays to avoid crashing components downstream.
      if (process.env.NODE_ENV === 'development') {
         // In Dev, throw so we see it.
         console.warn("Returning raw data despite validation error for dev inspection...");
         return rawData as AllDataResponse; 
      }
      return {
          build_info: { version: "unknown", generated_at: new Date().toISOString() },
          units: [],
          heroes: [],
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
        units: [],
        heroes: [],
        consumables: [],
        upgrades: []
    };
  }
}

/**
 * Returns all units (Creatures, Buildings, Spells, Titans)
 */
export async function getUnits(): Promise<Unit[]> {
  const data = await fetchGameData();
  return data.units;
}

/**
 * Returns all spellcasters (formerly Heroes)
 */
export async function getSpellcasters(): Promise<Spellcaster[]> {
  const data = await fetchGameData();
  return data.heroes; // The API JSON key is 'heroes', we return Spellcaster[]
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
 * Get a specific unit by entity_id
 */
export async function getUnitById(entityId: string): Promise<Unit | null> {
  const units = await getUnits();
  return units.find(unit => unit.entity_id === entityId) || null;
}

/**
 * Get a specific spellcaster by id (maps to hero_id for now)
 */
export async function getSpellcasterById(entityId: string): Promise<Spellcaster | null> {
  const spellcasters = await getSpellcasters();
  return spellcasters.find(s => s.hero_id === entityId) || null;
}

/**
 * Filter units by category
 */
export async function getUnitsByCategory(category: Unit['category']): Promise<Unit[]> {
  const units = await getUnits();
  return units.filter(unit => unit.category === category);
}

/**
 * Filter units by magic school
 */
export async function getUnitsByMagicSchool(school: Unit['magic_school']): Promise<Unit[]> {
  const units = await getUnits();
  return units.filter(unit => unit.magic_school === school);
}

/**
 * Returns a unified list of all searchable entities (Units, Spellcasters, Consumables)
 */
export async function getAllEntities(): Promise<UnifiedEntity[]> {
  const data = await fetchGameData();
  return [
    ...data.units,
    ...data.heroes,
    ...data.consumables
  ];
}
