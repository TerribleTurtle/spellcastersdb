import { describe, expect, it } from "vitest";

import { PATCH_CATEGORY_LABELS } from "../patch-utils";

describe("patch-utils.ts", () => {
  it("should map 'Patch' to 'Balance Patch'", () => {
    expect(PATCH_CATEGORY_LABELS["Patch"]).toBe("Balance Patch");
  });

  it("should map 'Hotfix' to 'Hotfix'", () => {
    expect(PATCH_CATEGORY_LABELS["Hotfix"]).toBe("Hotfix");
  });

  it("should map 'Content' to 'Content Update'", () => {
    expect(PATCH_CATEGORY_LABELS["Content"]).toBe("Content Update");
  });

  it("should have exactly three mapped categories", () => {
    const keys = Object.keys(PATCH_CATEGORY_LABELS);
    expect(keys).toHaveLength(3);
    expect(keys).toContain("Patch");
    expect(keys).toContain("Hotfix");
    expect(keys).toContain("Content");
  });
});
