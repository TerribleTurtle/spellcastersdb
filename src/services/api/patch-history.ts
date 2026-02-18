/**
 * Client-side API service for Patch History endpoints.
 *
 * These endpoints are static JSON files on GitHub Pages with CORS (*).
 * Called from client components (not server-only) because DraggableCard is "use client".
 *
 * All functions handle errors gracefully — returning safe empty defaults on 404/failure.
 *
 * @see {@link docs/api_info.md} for endpoint documentation.
 */

import { CONFIG } from "@/lib/config";
import {
  ChangelogLatestSchema,
  ChangelogIndexSchema,
  ChangelogPageSchema,
  EntityTimelineSchema,
} from "@/services/validation/patch-history-schemas";
import type {
  Changelog,
  ChangelogLatest,
  EntityTimeline,
  PatchEntry,
} from "@/types/patch-history";

// ============================================================================
// Empty Defaults (graceful fallbacks)
// ============================================================================

const EMPTY_CHANGELOG: Changelog = [];
const EMPTY_TIMELINE: EntityTimeline = [];

// ============================================================================
// Generic Fetcher
// ============================================================================

/**
 * Fetch and validate JSON from the API, returning a safe fallback on any error.
 */
async function fetchPatchData<T>(
  endpoint: string,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown } },
  fallback: T
): Promise<T> {
  try {
    // In development, proxy requests through our local API route to access filesystem.
    // Server-side fetch requires an absolute URL, so we prepend the dev server origin.
    // In production (or if configured), use the remote API.
    const baseUrl = process.env.NODE_ENV === "development" 
        ? `http://localhost:${process.env.PORT || 3000}/api/local-assets` 
        : CONFIG.API.BASE_URL;

    const url = `${baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      next: { revalidate: CONFIG.API.REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      // 404 is expected when no patch data exists yet
      if (response.status !== 404) {
        console.warn(`[PatchHistory] ${endpoint}: ${response.status} ${response.statusText}`);
      }
      return fallback;
    }

    const raw = await response.json();
    const result = schema.safeParse(raw);

    if (!result.success) {
      console.warn(`[PatchHistory] ${endpoint}: Zod validation failed`, result.error);
      return fallback;
    }

    return result.data as T;
  } catch (error) {
    console.warn(`[PatchHistory] ${endpoint}: fetch failed`, error);
    return fallback;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch the latest changelog entry.
 * Used for the "what changed" tooltip on card hover/popup.
 */
export async function fetchChangelogLatest(): Promise<ChangelogLatest> {
  return fetchPatchData("changelog_latest.json", ChangelogLatestSchema, null);
}

/**
 * Fetch the full changelog — all patches, newest first.
 *
 * STRATEGY:
 * 1. Fetch `changelog_index.json` manifest.
 * 2. Parallel fetch all page files listed in the manifest.
 * 3. Flatten into a single list of patches.
 */
export async function fetchChangelog(): Promise<Changelog> {
  // 1. Fetch Index
  const index = await fetchPatchData("changelog_index.json", ChangelogIndexSchema, null);
  
  if (!index) {
      // Fallback: try fetching legacy changelog.json directly (backward compatibility during migration)
      return fetchPatchData("changelog.json", ChangelogPageSchema, EMPTY_CHANGELOG);
  }

  // 2. Fetch Pages
  const pagePromises = index.pages.map(pageFile => 
      fetchPatchData(pageFile, ChangelogPageSchema, [])
  );

  const pages = await Promise.all(pagePromises);

  // 3. Flatten
  return pages.flat();
}

/**
 * Fetch per-entity timeline — full stat snapshots at each patch version.
 * Used for before/after stat comparison on the full card page.
 *
 * @param entityId - The entity_id to fetch timeline for (e.g. "fire_imp_1").
 */
export async function fetchEntityTimeline(entityId: string): Promise<EntityTimeline> {
  return fetchPatchData(`timeline/${entityId}.json`, EntityTimelineSchema, EMPTY_TIMELINE);
}

/**
 * Filters the global changelog for a specific entity.
 * 
 * The API now returns a global list of patches (each containing changes for multiple entities).
 * This helper filters/transforms that list into a history view for a single entity.
 */
export function filterChangelogForEntity(changelog: Changelog, entityId: string): Changelog {
  return changelog.map(patch => {
    // Check if any change targets this entity.
    // target_id is typically "category/entity_id.json" or just "entity_id.json"
    const relevantChanges = patch.changes.filter(change => {
        const target = change.target_id;
        // Match exact filename or path suffix
        return target === `${entityId}.json` || target.endsWith(`/${entityId}.json`);
    });

    if (relevantChanges.length === 0) return null;

    return {
      ...patch,
      changes: relevantChanges
    };
  }).filter((p): p is PatchEntry => p !== null);
}
