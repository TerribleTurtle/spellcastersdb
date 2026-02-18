/**
 * Zod Schemas for Patch History API responses.
 * Validates changelog_index.json, changelog_page_N.json, timeline/{id}.json.
 *
 * @see {@link types/patch-history.d.ts} for TypeScript types.
 */

import { z } from "zod";

// ============================================================================
// Core Types
// ============================================================================

export const ChangeTypeSchema = z.enum(["add", "edit", "delete"]);

export const PatchCategorySchema = z.enum(["Patch", "Hotfix", "Content"]);

export const ChangeEntrySchema = z.object({
  target_id: z.string(),
  name: z.string(),
  field: z.string(),
  change_type: ChangeTypeSchema.optional(),
  category: z.string().optional(),
  diffs: z.array(z.unknown()).optional(),
});

// ============================================================================
// Changelog
// ============================================================================

export const PatchEntrySchema = z.object({
  id: z.string(),
  version: z.string(),
  type: PatchCategorySchema,
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
  changes: z.array(ChangeEntrySchema),
});

export const ChangelogPageSchema = z.array(PatchEntrySchema);

export const ChangelogLatestSchema = PatchEntrySchema.nullable();

export const ChangelogIndexSchema = z.object({
  total_patches: z.number(),
  page_size: z.number(),
  total_pages: z.number(),
  pages: z.array(z.string()),
});

// ============================================================================
// Entity Timeline
// ============================================================================

export const TimelineEntrySchema = z.object({
  version: z.string(),
  date: z.string(),
  snapshot: z.record(z.string(), z.unknown()),
});

export const EntityTimelineSchema = z.array(TimelineEntrySchema);
