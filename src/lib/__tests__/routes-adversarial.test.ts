import { describe, expect, it } from "vitest";

import { UnifiedEntity } from "@/types/api";

import { routes } from "../routes";

describe("routes.ts - Adversarial Tests", () => {
  describe("Injection & Path Traversal (Simple Routes)", () => {
    it("should safely encode XSS payloads in base routes", () => {
      // The current implementation directly interpolates: `/incantations/units/${id}`
      // This test ensures the output is URL-safe.
      const evilId = "<script>alert(1)</script>";
      const result = routes.unit(evilId);
      // It should NOT contain literal angle brackets
      expect(result).not.toContain("<script>");
      expect(result).toContain("%3Cscript%3E");
    });

    it("should safely encode path traversal attempts in base routes", () => {
      const evilId = "../../../etc/passwd";
      const result = routes.spellcaster(evilId);
      expect(result).not.toContain("../");
      expect(result).toContain("..%2F");
    });

    it("should produce a safe URL when given an empty string ID", () => {
      const result = routes.titan("");
      // Empty ID correctly results in trailing slash — this is safe behavior.
      // The important thing is it doesn't crash and produces a valid path.
      expect(result).toBe("/titans/");
      expect(typeof result).toBe("string");
    });

    it("should encode query parameters safely", () => {
      const evilSearch = "q=1&evil=true";
      const result = routes.database(evilSearch);
      expect(result).toContain(encodeURIComponent(evilSearch));
      expect(result).not.toContain("evil=true"); // Should be percent encoded
    });
  });

  describe("entityLink - Attack Surface", () => {
    it("should fallback gracefully if entity is completely empty", () => {
      const evilEntity = {} as UnifiedEntity;
      // "spellcaster_id" in {} is false.
      // entity.category is undefined.
      // Should hit fallback `routes.unit(undefined)`.
      expect(() => routes.entityLink(evilEntity)).not.toThrow();
    });

    it("should safely encode IDs originating from entityLink", () => {
      const evilEntity = {
        category: "Titan",
        entity_id: "<img src=x onerror=alert(1)>",
      } as UnifiedEntity;
      const result = routes.entityLink(evilEntity);
      expect(result).not.toContain("<img");
    });
  });

  describe("entityLinkFromChangelog - Attack Surface", () => {
    it("should not crash if categoryName is null", () => {
      expect(() =>
        routes.entityLinkFromChangelog("id", null as any)
      ).not.toThrow();
    });

    it("should handle completely empty targetId without crashing", () => {
      expect(() => routes.entityLinkFromChangelog("", "heroes")).not.toThrow();
    });

    it("should handle targetId missing slashes", () => {
      const result = routes.entityLinkFromChangelog("just_id.json", "heroes");
      expect(result).toBeTruthy();
    });

    it("should handle malicious targetId paths safely", () => {
      const result = routes.entityLinkFromChangelog(
        "../../../heroes/evil_hero.json",
        "heroes"
      );
      // The exact logic does `.split('/')` and takes the last part.
      // Let's verify it actually extracts just the ID and encodes it.
      expect(result).not.toContain("../");
    });
  });
});
