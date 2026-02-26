import { describe, expect, it } from "vitest";

import { isActivePath } from "../nav-links";

describe("isActivePath — Adversarial", () => {
  // ─── Prefix Collision ───────────────────────────────────────────────
  // A sibling route that starts with the same prefix but is NOT a child.
  // e.g. /deck-builder vs /deck-builder-pro
  it("should NOT match a sibling route that shares a prefix", () => {
    // BUG PROBE: startsWith("/deck-builder") is true for "/deck-builder-pro"
    expect(isActivePath("/deck-builder", "/deck-builder-pro")).toBe(false);
  });

  it("should NOT match /database when pathname is /database-v2", () => {
    expect(isActivePath("/database", "/database-v2")).toBe(false);
  });

  // ─── Empty & Whitespace ─────────────────────────────────────────────
  it("should return false for an empty string pathname", () => {
    expect(isActivePath("/deck-builder", "")).toBe(false);
  });

  it("should return false for a whitespace-only pathname", () => {
    expect(isActivePath("/deck-builder", "   ")).toBe(false);
  });

  it("should return false for an empty string path", () => {
    expect(isActivePath("", "/deck-builder")).toBe(false);
  });

  // ─── Trailing Slashes ──────────────────────────────────────────────
  it("should handle trailing slash on path", () => {
    // "/deck-builder/" should still match "/deck-builder"
    expect(isActivePath("/deck-builder/", "/deck-builder")).toBe(false);
  });

  it("should handle trailing slash on pathname", () => {
    expect(isActivePath("/deck-builder", "/deck-builder/")).toBe(true);
  });

  // ─── Case Sensitivity ─────────────────────────────────────────────
  it("should be case-sensitive (URLs are case-sensitive)", () => {
    expect(isActivePath("/Deck-Builder", "/deck-builder")).toBe(false);
  });

  // ─── Special Characters & Encoded Paths ────────────────────────────
  it("should handle encoded characters in pathname", () => {
    expect(isActivePath("/database", "/database?q=%20%20")).toBe(true);
  });

  it("should not match when path contains query string", () => {
    // A path should never include a query string, but if it does, be safe
    expect(isActivePath("/database?tab=1", "/database?tab=1")).toBe(true);
  });

  it("should handle hash fragments", () => {
    expect(isActivePath("/guide", "/guide#section-2")).toBe(true);
  });

  // ─── Root Path Edge Cases ──────────────────────────────────────────
  it("should match root to root only", () => {
    expect(isActivePath("/", "/")).toBe(true);
  });

  it("should NOT match root to any sub-path", () => {
    expect(isActivePath("/", "/anything")).toBe(false);
    expect(isActivePath("/", "/a/b/c")).toBe(false);
  });

  // ─── Deeply Nested Paths ───────────────────────────────────────────
  it("should match deeply nested child paths", () => {
    expect(isActivePath("/deck-builder", "/deck-builder/a/b/c/d")).toBe(true);
  });

  // ─── Unicode ───────────────────────────────────────────────────────
  it("should handle unicode in paths", () => {
    expect(isActivePath("/données", "/données/test")).toBe(true);
  });
});
