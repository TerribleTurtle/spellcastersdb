/**
 * Entity version badge configuration.
 *
 * Two concepts:
 * 1. **NEW entities** — Hardcoded set of entity IDs added fresh in EA.
 *    Update this list when new entities are introduced.
 *
 * 2. **Verified (Updated to EA)** — Determined by checking `stat_changes`.
 *    An entity is considered verified if it has a stat_changes entry at or above
 *    `VERIFIED_SINCE_VERSION`. Change that one constant when a new data pass lands.
 *    New entities are always considered verified.
 */
import type { StatChangeEntry } from "@/types/api";

export const SHOW_VERSION_BADGES_DEV = false;
// ============================================================================
// Configuration — Change these when data updates land
// ============================================================================

/**
 * The minimum version an entity's `stat_changes` must contain
 * to be considered "updated / verified for EA".
 *
 * Bump this when a new data pass is released (e.g., "0.2.0").
 */
export const VERIFIED_SINCE_VERSION = "0.1.0";

/**
 * Entity IDs that were added new in EA.
 * These show the "NEW" badge and are always considered verified.
 *
 * Update this set when new entities are added to the game.
 */
export const NEW_ENTITY_IDS: ReadonlySet<string> = new Set([
  // Units
  "rhino_rider",
  "rocket_soldier_factory",
  "siren",
  // Spells
  "holy_arrow",
  "ice_ray",
  "metamorphosis",
  "poison_breath",
]);

// ============================================================================
// Public Helpers
// ============================================================================

/** Checks if an entity is one of the newly-added EA entities. */
export function isNewEntity(entityId: string): boolean {
  return NEW_ENTITY_IDS.has(entityId);
}

/**
 * Determines whether an entity's data has been verified for Early Access.
 *
 * Verified if:
 * - The entity is NEW (inherently EA data), OR
 * - The entity has a `stat_changes` entry with version >= VERIFIED_SINCE_VERSION
 */
export function isUpdatedToEA(
  entityId: string,
  statChanges?: StatChangeEntry[]
): boolean {
  if (NEW_ENTITY_IDS.has(entityId)) return true;

  if (!statChanges || statChanges.length === 0) return false;

  return statChanges.some(
    (entry) => compareSemver(entry.version, VERIFIED_SINCE_VERSION) >= 0
  );
}

// ============================================================================
// Internal
// ============================================================================

/**
 * Simple semver comparison: positive if a > b, negative if a < b, 0 if equal.
 * Handles numeric x.y.z format.
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}
