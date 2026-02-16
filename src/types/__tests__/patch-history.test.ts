import { describe, it, expect } from "vitest";
import { isBrowserPatchType, BROWSER_PATCH_TYPES } from "../../lib/patch-utils";

describe("Patch History Filtering", () => {
  it("includes only buff, nerf, and rework in BROWSER_PATCH_TYPES", () => {
    expect(BROWSER_PATCH_TYPES.has("buff")).toBe(true);
    expect(BROWSER_PATCH_TYPES.has("nerf")).toBe(true);
    expect(BROWSER_PATCH_TYPES.has("rework")).toBe(true);
    expect(BROWSER_PATCH_TYPES.has("fix")).toBe(false);
    expect(BROWSER_PATCH_TYPES.has("new")).toBe(false);
  });

  it("isBrowserPatchType returns correct boolean", () => {
    expect(isBrowserPatchType("buff")).toBe(true);
    expect(isBrowserPatchType("nerf")).toBe(true);
    expect(isBrowserPatchType("rework")).toBe(true);
    expect(isBrowserPatchType("fix")).toBe(false);
    expect(isBrowserPatchType("new")).toBe(false);
  });
});
