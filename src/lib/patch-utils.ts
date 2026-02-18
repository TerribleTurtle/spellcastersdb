/**
 * Patch utility helpers.
 * 
 * Updated for Phase 4 — old PatchType (buff/nerf/rework) removed.
 * Now uses PatchCategory (Patch/Hotfix/Content).
 */

import type { PatchCategory } from "@/types/patch-history";

/**
 * Map of PatchCategory to a human-readable label.
 */
export const PATCH_CATEGORY_LABELS: Record<PatchCategory, string> = {
  Patch: "Balance Patch",
  Hotfix: "Hotfix",
  Content: "Content Update",
};
