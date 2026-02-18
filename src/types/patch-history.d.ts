/**
 * TypeScript type definitions for Patch History API
 * Endpoints: changelog_index.json, changelog_page_N.json, changelog_latest.json, timeline/{id}.json
 *
 * @see {@link docs/api_info.md} for endpoint details.
 */

// ============================================================================
// Core Types
// ============================================================================

/** Type of change made to an entity. */
export type ChangeType = "add" | "edit" | "delete";

/** Patch classification. */
export type PatchCategory = "Patch" | "Hotfix" | "Content";

/** A single entity change within a patch. */
export interface ChangeEntry {
  /** Entity filename (e.g. "knight.json"). */
  target_id: string;
  /** Human-readable entity name. */
  name: string;
  /** Which field/aspect was changed. */
  field: string;
  /** Type of change. */
  change_type?: ChangeType;
  /** Entity category (e.g. "units", "heroes"). */
  category?: string;
  /** Field-level diffs (deep-diff format). */
  diffs?: unknown[];
}

// ============================================================================
// Changelog
// ============================================================================

/**
 * A single patch entry with all its changes.
 */
export interface PatchEntry {
  /** Unique patch identifier. */
  id: string;
  /** Semantic version (e.g. "1.2.0"). */
  version: string;
  /** Patch classification. */
  type: PatchCategory;
  /** Human-readable title. */
  title: string;
  /** ISO 8601 timestamp. */
  date: string;
  /** Optional tags. */
  tags?: string[];
  /** All entity changes in this patch. */
  changes: ChangeEntry[];
}

/** A single changelog page — array of patches. */
export type ChangelogPage = PatchEntry[];

/** The latest patch entry, or null if none exist. */
export type ChangelogLatest = PatchEntry | null;

/** Pagination manifest for the changelog. */
export interface ChangelogIndex {
  /** Total number of patches across all pages. */
  total_patches: number;
  /** Maximum patches per page. */
  page_size: number;
  /** Number of page files. */
  total_pages: number;
  /** Ordered list of page filenames. */
  pages: string[];
}

/**
 * Full flattened changelog used by the UI.
 * Computed by fetching all pages listed in ChangelogIndex.
 */
export type Changelog = PatchEntry[];

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
