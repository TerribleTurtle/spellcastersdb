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
import { fetchRemoteData, DataFetchError } from "./api-client";
import { fetchLocalData } from "./dev-data-source";

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
 * - In Development: Attempts to load from local file system first.
 * - In Production: Fetches from the configured remote API.
 * 
 * Uses Zod to validate the response. Returns "best effort" empty arrays on total failure to prevent app crash.
 * @returns The complete game data object.
 */
export async function fetchGameData(): Promise<AllDataResponse> {
  // 1. Try Local Data (Dev only)
  if (process.env.NODE_ENV === "development") {
    const localData = await fetchLocalData();
    if (localData) {
      registry.initialize(localData);
      return localData;
    }
    // If local fails (returns null), fall through to remote
  }

  // 2. Fetch Remote Data
  const data = await fetchRemoteData();
  registry.initialize(data);
  return data;
}

/**
 * Returns all Creatures and Buildings
 */
export async function getUnits(): Promise<Unit[]> {
  // Ensure data is loaded before access
  if (!registry.isInitialized()) await ensureDataLoaded();
  const data = await fetchGameData(); // Fallback for now to stay safe, but we should rely on registry
  return data.units;
}

/**
 * Returns all Spells
 */
export async function getSpells(): Promise<Spell[]> {
  if (!registry.isInitialized()) await ensureDataLoaded();
  const data = await fetchGameData();
  return data.spells;
}

/**
 * Returns all Titans
 */
export async function getTitans(): Promise<Titan[]> {
  if (!registry.isInitialized()) await ensureDataLoaded();
  const data = await fetchGameData();
  return data.titans;
}

/**
 * Returns Units + Spells aggregated (for Deck Builder)
 */
export async function getIncantations(): Promise<Incantation[]> {
  if (!registry.isInitialized()) await ensureDataLoaded();
  const data = await fetchGameData();
  // Use type assertion to satisfy TS if needed, or rely on compatible interfaces
  return [...data.units, ...data.spells];
}

/**
 * Returns all spellcasters (formerly Heroes)
 */
export async function getSpellcasters(): Promise<Spellcaster[]> {
  if (!registry.isInitialized()) await ensureDataLoaded();
  const data = await fetchGameData();
  return data.spellcasters;
}

/**
 * Returns all consumables
 */
export async function getConsumables(): Promise<Consumable[]> {
  if (!registry.isInitialized()) await ensureDataLoaded();
  const data = await fetchGameData();
  return data.consumables;
}

/**
 * Returns all upgrades
 */
export async function getUpgrades(): Promise<Upgrade[]> {
  if (!registry.isInitialized()) await ensureDataLoaded();
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
  const data = await fetchGameData();
  return [
    ...data.units,
    ...data.spells,
    ...data.titans,
    ...data.spellcasters,
    ...data.consumables,
  ];
}
