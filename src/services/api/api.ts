import "server-only";

import { monitoring } from "@/services/monitoring";
import {
  AllDataResponse,
  Consumable,
  Incantation,
  Spell,
  Spellcaster,
  Titan,
  UnifiedEntity,
  Unit,
  Upgrade,
} from "@/types/api";

import { GameDataSource } from "./GameDataSource";
import { LocalDataSource } from "./LocalDataSource";
import { RemoteDataSource } from "./RemoteDataSource";
import { DataFetchError } from "./api-client";
import { registry } from "./registry";

export { DataFetchError };

// ============================================================================
// Fetch Logic
// ============================================================================

/**
 * Explicitly initializes the data registry.
 * This ensures that the global registry is populated before any synchronous data access.
 * Should be called at app bootstrap (e.g., in a top-level layout or middleware).
 *
 * @returns Resolves once the registry is populated. No-ops if already initialized.
 *
 * @example
 * ```ts
 * // In a Server Component or layout
 * await ensureDataLoaded();
 * const unit = registry.get("fire_imp_1");
 * ```
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
    monitoring.captureException(error, {
      message: "Failed to fetch game data",
      context: "api.ts:fetchGameData",
    });

    // Fallback to remote if local fails in dev
    if (
      process.env.NODE_ENV === "development" &&
      source instanceof LocalDataSource
    ) {
      monitoring.captureMessage(
        "Local data failed, attempting remote fallback...",
        "warning",
        { context: "api.ts:fetchGameData" }
      );
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
  return fetchWithFallback((source) => source.fetch());
}

/**
 * Fetches only the critical game data (Units, Spells, Titans, Spellcasters).
 * Skips Consumables and Upgrades to reduce TTFB on initial page loads.
 *
 * @returns The game data object with `consumables` and `upgrades` as empty arrays.
 *
 * @example
 * ```ts
 * const data = await fetchCriticalGameData();
 * // data.units, data.spells, data.titans, data.spellcasters are populated
 * // data.consumables and data.upgrades are empty
 * ```
 */
export async function fetchCriticalGameData(): Promise<AllDataResponse> {
  return fetchWithFallback((source) => source.fetchCritical());
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
 *
 * @example
 * ```ts
 * const spells = await getSpells();
 * const fireSpells = spells.filter(s => s.magic_school === "Fire");
 * ```
 */
export async function getSpells(): Promise<Spell[]> {
  return getFromRegistry(
    () => registry.getAllSpells(),
    (data) => data.spells
  );
}

/**
 * Returns all Titans
 *
 * @example
 * ```ts
 * const titans = await getTitans();
 * const activeTitan = titans[0];
 * ```
 */
export async function getTitans(): Promise<Titan[]> {
  return getFromRegistry(
    () => registry.getAllTitans(),
    (data) => data.titans
  );
}

/**
 * Returns Units + Spells aggregated (for Deck Builder)
 *
 * @example
 * ```ts
 * const incantations = await getIncantations();
 * const deckCards = incantations.filter(i => deckCardIds.includes(i.entity_id));
 * ```
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
 *
 * @example
 * ```ts
 * const spellcasters = await getSpellcasters();
 * const darkSpellcaster = spellcasters.find(s => s.name === "Nadia");
 * ```
 */
export async function getSpellcasters(): Promise<Spellcaster[]> {
  return getFromRegistry(
    () => registry.getAllSpellcasters(),
    (data) => data.spellcasters
  );
}

/**
 * Returns all consumables
 *
 * @example
 * ```ts
 * const consumables = await getConsumables();
 * const potions = consumables.filter(c => c.type === "Potion");
 * ```
 */
export async function getConsumables(): Promise<Consumable[]> {
  return getFromRegistry(
    () => registry.getAllConsumables(),
    (data) => data.consumables
  );
}

/**
 * Returns all upgrades
 *
 * @example
 * ```ts
 * const upgrades = await getUpgrades();
 * const unitUpgrades = upgrades.filter(u => u.target_type === "Unit");
 * ```
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

  return (registry.get(entityId) as Unit | Spell | Titan | null) || null;
}

/**
 * Legacy support: Get a Unit by its entity_id (only checks the Units map).
 *
 * @param entityId - The unique entity_id of the unit.
 * @returns The Unit object, or `null` if not found.
 *
 * @example
 * ```ts
 * const unit = await getUnitById("fire_imp_1");
 * if (unit) console.log(unit.name, unit.stats);
 * ```
 */
export async function getUnitById(entityId: string): Promise<Unit | null> {
  if (!registry.isInitialized()) {
    await ensureDataLoaded();
  }
  return registry.getUnit(entityId) || null;
}

/**
 * Get a specific Spellcaster by its entity_id.
 *
 * @param entityId - The unique entity_id (or legacy spellcaster_id) of the spellcaster.
 * @returns The Spellcaster object, or `null` if not found.
 *
 * @example
 * ```ts
 * const sc = await getSpellcasterById("nadia");
 * if (sc) console.log(sc.name, sc.abilities);
 * ```
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
 * Returns a unified list of all searchable entities (Units, Spells, Titans,
 * Spellcasters, Consumables). Upgrades are intentionally excluded.
 *
 * @returns An array of `UnifiedEntity` objects for powering search/filter UIs.
 *
 * @example
 * ```ts
 * const entities = await getAllEntities();
 * const searchResults = entities.filter(e => e.name.toLowerCase().includes(query));
 * ```
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
