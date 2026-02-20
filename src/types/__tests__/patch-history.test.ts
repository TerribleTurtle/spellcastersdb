import { describe, expect, it } from "vitest";

import { PATCH_CATEGORY_LABELS } from "../../lib/patch-utils";

describe("Patch History Utilities", () => {
  it("PATCH_CATEGORY_LABELS contains all three categories", () => {
    expect(PATCH_CATEGORY_LABELS).toHaveProperty("Patch");
    expect(PATCH_CATEGORY_LABELS).toHaveProperty("Hotfix");
    expect(PATCH_CATEGORY_LABELS).toHaveProperty("Content");
  });

  it("labels are human-readable strings", () => {
    expect(typeof PATCH_CATEGORY_LABELS.Patch).toBe("string");
    expect(typeof PATCH_CATEGORY_LABELS.Hotfix).toBe("string");
    expect(typeof PATCH_CATEGORY_LABELS.Content).toBe("string");
  });
});
