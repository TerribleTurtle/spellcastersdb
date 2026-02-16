import type { PatchType } from "@/types/patch-history";

/**
 * Patch types that should be displayed on browser cards and the inspector header.
 * Excludes "fix" and "new" to reduce visual noise.
 */
export const BROWSER_PATCH_TYPES = new Set<PatchType>(["buff", "nerf", "rework"]);

/**
 * Type guard to check if a patch type is allowed in the browser/inspector context.
 */
export function isBrowserPatchType(type: PatchType): boolean {
  return BROWSER_PATCH_TYPES.has(type);
}
