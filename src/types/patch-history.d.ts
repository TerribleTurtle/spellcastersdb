/**
 * TypeScript type definitions for Patch History API
 * Endpoints: balance_index.json, changelog_latest.json, changelog.json, timeline/{id}.json
 *
 * @see {@link docs/api_info.md} for endpoint details.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Classification of a balance change.
 */
export type PatchType = "buff" | "nerf" | "rework" | "fix" | "new";

// ============================================================================
// Balance Index (GET /api/v2/balance_index.json)
// ============================================================================

/**
 * Most recent patch's buff/nerf classifications.
 * Used to show ⬆️/⬇️/🔄 icons on cards in the deck builder.
 */
export interface BalanceIndex {
  version: string;
  entities: Record<string, PatchType>;
}

// ============================================================================
// Changelog (GET /api/v2/changelog.json, /api/v2/changelog_latest.json)
// ============================================================================

/**
 * A single patch entry describing changes to one entity.
 */
export interface PatchEntry {
  version: string;
  date: string;
  entity_id: string;
  patch_type: PatchType;
  changes: string[];
}

/**
 * Full changelog — array of all patches, newest first.
 */
export type Changelog = PatchEntry[];

/**
 * Latest changelog entry, or null if no patches exist.
 */
export type ChangelogLatest = PatchEntry | null;

// ============================================================================
// Entity Timeline (GET /api/v2/timeline/{entity_id}.json)
// ============================================================================

/**
 * A snapshot of an entity's stats at a specific patch version.
 */
export interface TimelineEntry {
  version: string;
  date: string;
  snapshot: Record<string, unknown>;
}

/**
 * Per-entity array of full snapshots at each patch version.
 * Newest first. Used for before/after stat comparison.
 */
export type EntityTimeline = TimelineEntry[];
