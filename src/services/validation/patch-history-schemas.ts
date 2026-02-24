/**
 * Zod Schemas for Patch History API responses.
 * Validates audit.json and timeline/{id}.json.
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

// ============================================================================
// Entity Timeline
// ============================================================================

export const TimelineEntrySchema = z.object({
  version: z.string(),
  date: z.string(),
  snapshot: z.record(z.string(), z.unknown()),
});

export const EntityTimelineSchema = z.array(TimelineEntrySchema);

// ============================================================================
// Raw Audit Log API (GET /audit.json)
// ============================================================================

export const AuditDiffSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  old_value: z.unknown().optional(),
  new_value: z.unknown().optional(),
  removed: z.boolean().optional(),
});

export const AuditChangeSchema = z.object({
  entity_id: z.string(),
  file: z.string(),
  category: z.string(),
  change_type: z.enum(["add", "edit", "delete", "rename"]),
  diffs: z.array(AuditDiffSchema),
});

export const AuditEntrySchema = z.object({
  commit: z.string(),
  timestamp: z.string(),
  author: z.string(),
  message: z.string(),
  changes: z.array(AuditChangeSchema),
});

export const AuditLogSchema = z.array(AuditEntrySchema);
