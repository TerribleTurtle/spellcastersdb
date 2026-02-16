/**
 * Zod Schemas for Patch History API responses.
 * Validates balance_index.json, changelog.json, changelog_latest.json, and timeline/{id}.json.
 *
 * @see {@link types/patch-history.d.ts} for TypeScript types.
 */

import { z } from "zod";

// ============================================================================
// Shared
// ============================================================================

export const PatchTypeSchema = z.enum(["buff", "nerf", "rework", "fix", "new"]);

// ============================================================================
// Balance Index
// ============================================================================

export const BalanceIndexSchema = z.object({
  version: z.string(),
  entities: z.record(z.string(), PatchTypeSchema),
});

// ============================================================================
// Changelog
// ============================================================================

export const PatchEntrySchema = z.object({
  version: z.string(),
  date: z.string(),
  entity_id: z.string(),
  patch_type: PatchTypeSchema,
  changes: z.array(z.string()),
});

export const ChangelogSchema = z.array(PatchEntrySchema);

export const ChangelogLatestSchema = PatchEntrySchema.nullable();

// ============================================================================
// Entity Timeline
// ============================================================================

export const TimelineEntrySchema = z.object({
  version: z.string(),
  date: z.string(),
  snapshot: z.record(z.string(), z.unknown()),
});

export const EntityTimelineSchema = z.array(TimelineEntrySchema);
