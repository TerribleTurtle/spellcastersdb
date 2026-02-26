import { describe, expect, it } from "vitest";

import {
  EXTERNAL_LINKS,
  PRIMARY_NAV,
  SECONDARY_NAV,
  isActivePath,
} from "../nav-links";

describe("nav-links", () => {
  describe("Constants", () => {
    it("should export PRIMARY_NAV", () => {
      expect(PRIMARY_NAV.length).toBeGreaterThan(0);
      expect(PRIMARY_NAV[0]).toHaveProperty("name");
      expect(PRIMARY_NAV[0]).toHaveProperty("href");
      expect(PRIMARY_NAV[0]).toHaveProperty("icon");
    });

    it("should export SECONDARY_NAV", () => {
      expect(SECONDARY_NAV.length).toBeGreaterThan(0);
      expect(SECONDARY_NAV[0].internal).toBe(true);
    });

    it("should export EXTERNAL_LINKS", () => {
      expect(EXTERNAL_LINKS.length).toBeGreaterThan(0);
      expect(EXTERNAL_LINKS[0].internal).toBe(false);
    });
  });

  describe("isActivePath", () => {
    it("should return false if pathname is null", () => {
      expect(isActivePath("/test", null)).toBe(false);
    });

    it("should return true for exact matches", () => {
      expect(isActivePath("/", "/")).toBe(true);
      expect(isActivePath("/deck-builder", "/deck-builder")).toBe(true);
    });

    it("should return true for sub-paths of non-root routes", () => {
      expect(isActivePath("/deck-builder", "/deck-builder/123")).toBe(true);
      expect(isActivePath("/database", "/database?search=foo")).toBe(true);
    });

    it("should return false for non-matching paths", () => {
      expect(isActivePath("/deck-builder", "/database")).toBe(false);
    });

    it("should NOT treat everything as active if path is /", () => {
      // If path is "/" and pathname is "/deck-builder", it shouldn't match
      expect(isActivePath("/", "/deck-builder")).toBe(false);
    });
  });
});
