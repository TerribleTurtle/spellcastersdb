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
  BalanceIndexSchema,
  ChangelogSchema,
  ChangelogLatestSchema,
  EntityTimelineSchema,
} from "@/services/validation/patch-history-schemas";
import type {
  BalanceIndex,
  Changelog,
  ChangelogLatest,
  EntityTimeline,
} from "@/types/patch-history";

// ============================================================================
// Empty Defaults (graceful fallbacks)
// ============================================================================

const EMPTY_BALANCE_INDEX: BalanceIndex = { version: "", entities: {} };
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
    // In development, proxy requests through our local API route to access filesystem
    // In production (or if configured), use the remote API
    const baseUrl = process.env.NODE_ENV === "development" 
        ? "/api/local-assets" 
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
 * Fetch the balance index — most recent patch's buff/nerf classifications.
 * Used for card badges in the deck builder.
 */
export async function fetchBalanceIndex(): Promise<BalanceIndex> {
  return fetchPatchData("balance_index.json", BalanceIndexSchema, EMPTY_BALANCE_INDEX);
}

/**
 * Fetch the latest changelog entry.
 * Used for the "what changed" tooltip on card hover/popup.
 */
export async function fetchChangelogLatest(): Promise<ChangelogLatest> {
  return fetchPatchData("changelog_latest.json", ChangelogLatestSchema, null);
}

/**
 * Fetch the full changelog — all patches, newest first.
 * Used for the full card page's patch history tab.
 */
export async function fetchChangelog(): Promise<Changelog> {
  return fetchPatchData("changelog.json", ChangelogSchema, EMPTY_CHANGELOG);
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
