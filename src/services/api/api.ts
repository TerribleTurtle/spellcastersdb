import "server-only";
import {
  Spell, 
  Spellcaster, 
  Titan, 
  Unit,
  AllDataResponse,
  UnifiedEntity,
  Consumable,
  Upgrade,
  Incantation
} from "@/types/api";



import { registry } from "./registry";
import { DataFetchError } from "./api-client";


export { DataFetchError };

// ============================================================================
// Fetch Logic
// ============================================================================


import { GameDataSource } from "./GameDataSource";
import { LocalDataSource } from "./LocalDataSource";
import { RemoteDataSource } from "./RemoteDataSource";

/**
 * Explicitly initializes the data registry.
 * This ensures that the global registry is populated before any synchronous data access.
 * Should be called at app bootstrap.
 */
export async function ensureDataLoaded(): Promise<void> {
    if (registry.isInitialized()) return;
    await fetchGameData();
}

/**
 * Fetches the complete game data from the data source (Local or Remote).
 * 
 * Uses the DataSource pattern to select the appropriate strategy based on the environment.
 * 
 * @returns The complete game data object.
 */
export async function fetchGameData(): Promise<AllDataResponse> {
  let source: GameDataSource;

  if (process.env.NODE_ENV === "development") {
      source = new LocalDataSource();
  } else {
      source = new RemoteDataSource();
  }

  try {
      const data = await source.fetch();
      registry.initialize(data);
      return data;
  } catch (error) {
     console.error("Failed to fetch game data:", error);
     // Fallback to remote if local fails in dev? Or just rethrow?
     // For now, adhering to original behavior of "best effort" empty or throw
     if (process.env.NODE_ENV === "development" && source instanceof LocalDataSource) {
         console.warn("Local data failed, attempting remote fallback...");
         const remote = new RemoteDataSource();
         const data = await remote.fetch();
         registry.initialize(data);
         return data;
     }
     throw error;
  }
}

/**
 * Fetches only the critical game data (Units, Spells, Titans, Spellcasters).
 * Skips Consumables and Upgrades to reduce TTFB.
 */
export async function fetchCriticalGameData(): Promise<AllDataResponse> {
  let source: GameDataSource;

  if (process.env.NODE_ENV === "development") {
      source = new LocalDataSource();
  } else {
      source = new RemoteDataSource();
  }

  try {
      const data = await source.fetchCritical();
      registry.initialize(data);
      return data;
  } catch (error) {
     console.error("Failed to fetch critical game data:", error);
     if (process.env.NODE_ENV === "development" && source instanceof LocalDataSource) {
         console.warn("Local critical data failed, attempting remote fallback...");
         const remote = new RemoteDataSource();
         const data = await remote.fetchCritical();
         registry.initialize(data);
         return data;
     }
     throw error;
  }
}


/**
 * Returns all Creatures and Buildings
 */
export async function getUnits(): Promise<Unit[]> {
  if (registry.isInitialized()) return registry.getAllUnits();
  const data = await fetchGameData(); 
  return data.units;
}

/**
 * Returns all Spells
 */
export async function getSpells(): Promise<Spell[]> {
  if (registry.isInitialized()) return registry.getAllSpells();
  const data = await fetchGameData();
  return data.spells;
}

/**
 * Returns all Titans
 */
export async function getTitans(): Promise<Titan[]> {
  if (registry.isInitialized()) return registry.getAllTitans();
  const data = await fetchGameData();
  return data.titans;
}

/**
 * Returns Units + Spells aggregated (for Deck Builder)
 */
export async function getIncantations(): Promise<Incantation[]> {
  if (registry.isInitialized()) {
      return [...registry.getAllUnits(), ...registry.getAllSpells()];
  }
  const data = await fetchGameData();
  return [...data.units, ...data.spells];
}

/**
 * Returns all spellcasters (formerly Heroes)
 */
export async function getSpellcasters(): Promise<Spellcaster[]> {
  if (registry.isInitialized()) return registry.getAllSpellcasters();
  const data = await fetchGameData();
  return data.spellcasters;
}

/**
 * Returns all consumables
 */
export async function getConsumables(): Promise<Consumable[]> {
  if (registry.isInitialized()) return registry.getAllConsumables();
  const data = await fetchGameData();
  return data.consumables;
}

/**
 * Returns all upgrades
 */
export async function getUpgrades(): Promise<Upgrade[]> {
  if (registry.isInitialized()) return registry.getAllUpgrades();
  const data = await fetchGameData();
  return data.upgrades;
}

/**
 * Get a specific unit, spell, or titan by its entity_id.
 * Utilizes the O(1) Registry lookup.
 * 
 * @param entityId - The unique ID of the entity.
 * @returns The entity object or null if not found.
 */
export async function getEntityById(
  entityId: string
): Promise<Unit | Spell | Titan | null> {
  // Ensure registry is initialized
  if (!registry.isInitialized()) {
    // Fail fast or warn in strict mode? For now, lazy load but warn.
    console.warn("getEntityById called before data initialization");
    await ensureDataLoaded();
  }
  
  return registry.get(entityId) as Unit | Spell | Titan | null || null;
}

/**
 * Legacy support: Get Unit by ID (only checks Units)
 */
export async function getUnitById(entityId: string): Promise<Unit | null> {
  if (!registry.isInitialized()) {
    await ensureDataLoaded();
  }
  return registry.getUnit(entityId) || null;
}

/**
 * Get a specific spellcaster by id
 */
export async function getSpellcasterById(
  entityId: string
): Promise<Spellcaster | null> {
  if (!registry.isInitialized()) {
      await ensureDataLoaded();
  }
  return registry.getSpellcaster(entityId) || null;
}

/**
 * Returns a unified list of all searchable entities
 */
export async function getAllEntities(): Promise<UnifiedEntity[]> {
  if (registry.isInitialized()) {
      return [
          ...registry.getAllUnits(),
          ...registry.getAllSpells(),
          ...registry.getAllTitans(),
          ...registry.getAllSpellcasters(),
          ...registry.getAllConsumables(),
          // Upgrades included? Original code didn't include them in getAllEntities but did in mapped list?
          // Original code: ...data.consumables, ]; (End of list)
          // Wait, original code had: units, spells, titans, spellcasters, consumables. Upgrades were MISSING in original getAllEntities.
          // I will replicate original behavior exactly to avoid side effects.
      ];
  }
  const data = await fetchGameData();
  return [
    ...data.units,
    ...data.spells,
    ...data.titans,
    ...data.spellcasters,
    ...data.consumables,
  ];
}
