import { describe, expect, it } from "vitest";

import { formatChangeField, formatDiffPath } from "../format-change-field";

describe("formatDiffPath", () => {
  it("strips abilities prefix and formats passive with index", () => {
    const path = ["abilities", "passive", "0", "description"];
    expect(formatDiffPath(path)).toBe("Passive[0] › Description");
  });

  it("formats primary ability (no index)", () => {
    const path = ["abilities", "primary", "cooldown"];
    expect(formatDiffPath(path)).toBe("Primary › Cooldown");
  });

  it("merges numeric indices into preceding segment", () => {
    const path = ["mechanics", "aura", "0", "radius"];
    expect(formatDiffPath(path)).toBe("Mechanics › Aura[0] › Radius");
  });

  it("handles single segment", () => {
    expect(formatDiffPath(["health"])).toBe("Health");
  });

  it("handles empty path", () => {
    expect(formatDiffPath([])).toBe("Value");
  });

  it("handles snake_case segments", () => {
    const path = ["attack_interval"];
    expect(formatDiffPath(path)).toBe("Attack Interval");
  });
});

describe("formatChangeField", () => {
  it("formats delimited field strings", () => {
    expect(formatChangeField("Abilities > Passive > 0 > Description")).toBe(
      "Passive[0] › Description"
    );
  });

  it("returns empty for entity field", () => {
    expect(formatChangeField("entity")).toBe("");
  });

  it("returns empty for empty string", () => {
    expect(formatChangeField("")).toBe("");
  });
});
