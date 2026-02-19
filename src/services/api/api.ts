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
import { GameDataSource } from "./GameDataSource";
import { LocalDataSource } from "./LocalDataSource";
import { RemoteDataSource } from "./RemoteDataSource";

export { DataFetchError };

// ============================================================================
// Fetch Logic
// ============================================================================

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
// Helper to select data source based on environment
function getDataSource(): GameDataSource {
    return process.env.NODE_ENV === "development" 
        ? new LocalDataSource() 
        : new RemoteDataSource();
}

/**
 * Generic fetcher with fallback strategy for development.
 */
async function fetchWithFallback(
    fetcher: (source: GameDataSource) => Promise<AllDataResponse>
): Promise<AllDataResponse> {
    const source = getDataSource();
    try {
        const data = await fetcher(source);
        registry.initialize(data);
        return data;
    } catch (error) {
        console.error("Failed to fetch game data:", error);
        
        // Fallback to remote if local fails in dev
        if (process.env.NODE_ENV === "development" && source instanceof LocalDataSource) {
            console.warn("Local data failed, attempting remote fallback...");
            const remote = new RemoteDataSource();
            const data = await fetcher(remote);
            registry.initialize(data);
            return data;
        }
        throw error;
    }
}

/**
 * Fetches the complete game data from the data source (Local or Remote).
 * 
 * Uses the DataSource pattern to select the appropriate strategy based on the environment.
 * 
 * @returns The complete game data object.
 * 
 * @example
 * ```ts
 * const data = await fetchGameData();
 * 
 * ```
 */
export async function fetchGameData(): Promise<AllDataResponse> {
    return fetchWithFallback(source => source.fetch());
}

/**
 * Fetches only the critical game data (Units, Spells, Titans, Spellcasters).
 * Skips Consumables and Upgrades to reduce TTFB.
 */
export async function fetchCriticalGameData(): Promise<AllDataResponse> {
    return fetchWithFallback(source => source.fetchCritical());
}


/**
 * Generic helper to fetch data from registry if initialized, or fallback to fetchGameData.
 */
async function getFromRegistry<T>(
    registryGetter: () => T[],
    dataFallback: (data: AllDataResponse) => T[]
): Promise<T[]> {
  if (registry.isInitialized()) return registryGetter();
  const data = await fetchGameData();
  return dataFallback(data);
}

/**
 * Returns all Creatures and Buildings
 * 
 * @example
 * ```ts
 * const units = await getUnits();
 * const dragons = units.filter(u => u.name.includes("Dragon"));
 * ```
 */
export async function getUnits(): Promise<Unit[]> {
  return getFromRegistry(
    () => registry.getAllUnits(),
    (data) => data.units
  );
}

/**
 * Returns all Spells
 */
export async function getSpells(): Promise<Spell[]> {
  return getFromRegistry(
    () => registry.getAllSpells(),
    (data) => data.spells
  );
}

/**
 * Returns all Titans
 */
export async function getTitans(): Promise<Titan[]> {
  return getFromRegistry(
    () => registry.getAllTitans(),
    (data) => data.titans
  );
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
  return getFromRegistry(
    () => registry.getAllSpellcasters(),
    (data) => data.spellcasters
  );
}

/**
 * Returns all consumables
 */
export async function getConsumables(): Promise<Consumable[]> {
  return getFromRegistry(
    () => registry.getAllConsumables(),
    (data) => data.consumables
  );
}

/**
 * Returns all upgrades
 */
export async function getUpgrades(): Promise<Upgrade[]> {
  return getFromRegistry(
    () => registry.getAllUpgrades(),
    (data) => data.upgrades
  );
}

/**
 * Get a specific unit, spell, or titan by its entity_id.
 * Utilizes the O(1) Registry lookup.
 * 
 * @param entityId - The unique ID of the entity.
 * @returns The entity object or null if not found.
 * 
 * @example
 * ```ts
 * const entity = await getEntityById("fire_imp_1");
 * if (entity && "damage" in entity) {
 *   
 * }
 * ```
 */
export async function getEntityById(
  entityId: string
): Promise<Unit | Spell | Titan | null> {
  // Ensure registry is initialized (lazy-load if needed)
  if (!registry.isInitialized()) {
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
          // Note: Upgrades intentionally excluded from unified entity list.
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
