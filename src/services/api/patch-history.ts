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
import { monitoring } from "@/services/monitoring";
import {
  AuditLogSchema,
  EntityTimelineSchema,
} from "@/services/validation/patch-history-schemas";
import type {
  AuditEntry,
  ChangeEntry,
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
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: unknown;
    };
  },
  fallback: T
): Promise<T> {
  try {
    // In development, proxy requests through our local API route to access filesystem.
    // Server-side fetch requires an absolute URL, so we prepend the dev server origin.
    // In production (or if configured), use the remote API.
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? `http://localhost:${process.env.PORT || 3000}/api/local-assets`
        : CONFIG.API.BASE_URL;

    const url = `${baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      next: { revalidate: CONFIG.API.REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      // 404 is expected when no patch data exists yet
      if (response.status !== 404) {
        monitoring.captureMessage(
          `PatchHistory fetch returned ${response.status}`,
          "warning",
          { endpoint, status: response.status, statusText: response.statusText }
        );
      }
      return fallback;
    }

    const raw = await response.json();
    const result = schema.safeParse(raw);

    if (!result.success) {
      monitoring.captureMessage(
        "PatchHistory Zod validation failed",
        "warning",
        { endpoint, error: result.error }
      );
      return fallback;
    }

    return result.data as T;
  } catch (error) {
    monitoring.captureMessage("PatchHistory fetch failed", "warning", {
      endpoint,
      error,
    });
    return fallback;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Helper to convert an entity ID like "fire_elemental" to "Fire Elemental".
 * Exported for testing.
 */
export function titleCaseEntity(id: string): string {
  // Remove file extension if present (though entity_id usually doesn't have it)
  const base = id.replace(/\.json$/, "");
  return base
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Maps raw AuditLog commit entries to the frontend's PatchEntry format.
 * Bridges the gap between Git commits and the Changelog UI.
 */
export function mapAuditToChangelog(entries: AuditEntry[]): PatchEntry[] {
  return entries.map((entry) => {
    const changes: ChangeEntry[] = entry.changes.map((change) => {
      // 1. Determine the "field" label
      let fieldLabel = "entity"; // Default for add/delete/rename without diffs

      if (change.change_type === "edit" || change.change_type === "rename") {
        if (change.diffs && change.diffs.length === 1) {
          fieldLabel = change.diffs[0].path.join(".");
        } else if (change.diffs && change.diffs.length > 1) {
          fieldLabel = "multiple fields";
        }
      }

      // 2. Map change_type (rename -> edit)
      const mappedChangeType =
        change.change_type === "rename" ? "edit" : change.change_type;

      // 3. Map diffs explicitly to DiffData shape {path, lhs, rhs}
      const mappedDiffs = change.diffs.map((diff) => ({
        path: diff.path.map(String),
        lhs: diff.old_value ?? null,
        rhs: diff.new_value ?? null,
      }));

      return {
        target_id: change.file,
        name: titleCaseEntity(change.entity_id),
        field: fieldLabel,
        change_type: mappedChangeType,
        category: change.category,
        diffs: mappedDiffs,
      };
    });

    return {
      id: entry.commit,
      version: entry.commit.substring(0, 7),
      type: "Patch", // All audit entries are treated as content patches
      title: entry.message,
      date: entry.timestamp,
      tags: [entry.author],
      changes: changes,
    };
  });
}

/**
 * Maps the new inline `stat_changes` array from an entity to the frontend's PatchEntry format.
 * This completely replaces the need to fetch the massive audit log or timeline endpoints.
 * It also flattens multiple entries of the same version (e.g., 0.0.1) into a single entry for the UI.
 */
export function mapStatChangesToChangelog(
  statChanges: import("@/types/api").StatChangeEntry[],
  entityId: string,
  entityName: string
): PatchEntry[] {
  // 1. Group by version to flatten multiple same-version entries (like 0.0.1)
  const groupedByVersion = new Map<
    string,
    import("@/types/api").StatChangeEntry
  >();

  for (const entry of statChanges) {
    if (groupedByVersion.has(entry.version)) {
      // Merge changes into the existing version group
      const existing = groupedByVersion.get(entry.version)!;
      existing.changes.push(...entry.changes);
    } else {
      // Clone to avoid mutating the original data
      groupedByVersion.set(entry.version, {
        version: entry.version,
        date: entry.date,
        changes: [...entry.changes],
      });
    }
  }

  // 2. Map grouped entries to PatchEntry
  const patchEntries = Array.from(groupedByVersion.values()).map((entry) => {
    // Map individual stat changes to diffs
    const diffs = entry.changes.map((change) => ({
      path: change.field.split("."),
      lhs: change.old ?? null,
      rhs: change.new ?? null,
    }));

    const changeEntry: ChangeEntry = {
      target_id: `${entityId}.json`,
      name: entityName,
      field:
        diffs.length > 1
          ? "multiple fields"
          : diffs[0]?.path.join(".") || "stats",
      change_type: "edit",
      category: "Content", // Generic fallback
      diffs: diffs,
    };

    return {
      id: `patch-${entry.version}`,
      version: entry.version,
      type: "Content" as const,
      title:
        entry.version === "0.0.1"
          ? "Initial Release"
          : `Patch v${entry.version}`,
      date: entry.date,
      tags: [],
      changes: [changeEntry],
    };
  });

  // Sort newest first
  return patchEntries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateB !== dateA) return dateB - dateA;
    // Tie-break with version numbers
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });
}

/**
 * Fetch the latest changelog entry.
 * Used for the "what changed" tooltip on card hover/popup.
 */
export async function fetchChangelogLatest(): Promise<ChangelogLatest> {
  const changelog = await fetchChangelog();
  return changelog.length > 0 ? changelog[0] : null;
}

/**
 * Fetch the full changelog — all patches, newest first.
 *
 * STRATEGY:
 * Fetch `audit.json` (the single file source of truth) and map it to
 * the UI's expected PatchEntry format.
 */
export async function fetchChangelog(): Promise<Changelog> {
  const raw = await fetchPatchData("audit.json", AuditLogSchema, null);
  if (!raw) return EMPTY_CHANGELOG;
  return mapAuditToChangelog(raw);
}

/**
 * Fetch per-entity timeline — full stat snapshots at each patch version.
 * Used for before/after stat comparison on the full card page.
 *
 * @param entityId - The entity_id to fetch timeline for (e.g. "fire_imp_1").
 */
export async function fetchEntityTimeline(
  entityId: string
): Promise<EntityTimeline> {
  return fetchPatchData(
    `timeline/${entityId}.json`,
    EntityTimelineSchema,
    EMPTY_TIMELINE
  );
}

/**
 * Filters the global changelog for a specific entity.
 *
 * The API now returns a global list of patches (each containing changes for multiple entities).
 * This helper filters/transforms that list into a history view for a single entity.
 */
export function filterChangelogForEntity(
  changelog: Changelog,
  entityId: string
): Changelog {
  return changelog
    .map((patch) => {
      // Check if any change targets this entity.
      // target_id is typically "category/entity_id.json" or just "entity_id.json"
      const relevantChanges = patch.changes.filter((change) => {
        const target = change.target_id;
        // Match exact filename or path suffix
        return (
          target === `${entityId}.json` || target.endsWith(`/${entityId}.json`)
        );
      });

      if (relevantChanges.length === 0) return null;

      return {
        ...patch,
        changes: relevantChanges,
      };
    })
    .filter((p): p is PatchEntry => p !== null);
}
