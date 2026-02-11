/**
 * API Fetching Service for Spellcasters Community API
 * Implements Stale-While-Revalidate (SWR) via Next.js fetch
 */
import type {
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

import { AllDataSchema } from "./schemas";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://terribleturtle.github.io/spellcasters-community-api/api/v1";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "WARN: NEXT_PUBLIC_API_URL is not defined. Using default API URL."
  );
}
const REVALIDATE_SECONDS = 60; // 1 minute cache

import { registry } from "./registry";

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
  if (process.env.NODE_ENV === "development") {
    try {
      console.log("Attempting to load local data...");
      const fs = await import("fs/promises");
      const path = await import("path");

      // CRITICAL: Local Development Source of Truth
      // Prioritize explicit env, fallback to sibling directory
      const localPath =
        process.env.LOCAL_DATA_PATH ||
        process.env.LOCAL_API_PATH || // Use correct .env key
        path.resolve(process.cwd(), "..", "spellcasters-community-api", "api", "v1", "all_data.json");

      console.log(`Loading data from: ${localPath}`);
      const fileContent = await fs.readFile(localPath, "utf-8");
      const rawData = JSON.parse(fileContent);

      // Pre-process: Filter units to ensure only Creatures and Buildings are in the units array
      if (Array.isArray(rawData.units)) {
        rawData.units = rawData.units.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (u: any) => u.category === "Creature" || u.category === "Building"
        );
      }

      const result = AllDataSchema.safeParse(rawData);
      if (result.success) {
        console.log("✅ Loaded and validated local data successfully.");
        const data = result.data as unknown as AllDataResponse;
        registry.initialize(data); // Initialize Registry
        return data;
      } else {
        console.error(
          "🔴 Local Data Validation Failed:",
          JSON.stringify(result.error.format(), null, 2)
        );
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
        tags: ["game-data"],
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch game data: ${response.status} ${response.statusText}`
      );
    }

    const rawData = await response.json();

    // Pre-process: Filter units to ensure only Creatures and Buildings are in the units array
    // The raw data might have Spells mixed in (legacy structure)
    if (Array.isArray(rawData.units)) {
      rawData.units = rawData.units.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (u: any) => u.category === "Creature" || u.category === "Building"
      );
    }

    // Zod Safe Parse
    const result = AllDataSchema.safeParse(rawData);

    if (!result.success) {
      console.error(
        "🔴 CRITICAL: API Schema Validation Failed",
        result.error.format()
      );

      return {
        build_info: {
          version: "unknown",
          generated_at: new Date().toISOString(),
        },
        spellcasters: [],
        units: [],
        spells: [],
        titans: [],
        consumables: [],
        upgrades: [],
      };
    }

    const data = result.data as unknown as AllDataResponse;
    registry.initialize(data); // Initialize Registry
    return data;

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
      upgrades: [],
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
 * Searches units, spells, and titans using O(1) Registry
 */
export async function getEntityById(
  entityId: string
): Promise<Unit | Spell | Titan | null> {
  // Ensure registry is initialized
  if (!registry.isInitialized()) {
    await fetchGameData();
  }
  
  return registry.get(entityId) as Unit | Spell | Titan | null || null;
}

/**
 * Legacy support: Get Unit by ID (only checks Units)
 */
export async function getUnitById(entityId: string): Promise<Unit | null> {
  if (!registry.isInitialized()) {
    await fetchGameData();
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
      await fetchGameData();
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
