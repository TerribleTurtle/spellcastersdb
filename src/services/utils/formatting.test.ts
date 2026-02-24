import { describe, expect, it } from "vitest";

import { capitalize, formatEntityName, formatTargetName } from "./formatting";

describe("formatting utilities", () => {
  describe("capitalize", () => {
    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should capitalize single character", () => {
      expect(capitalize("a")).toBe("A");
      expect(capitalize("Z")).toBe("Z");
    });

    it("should capitalize a normal string", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("WORLD"); // Note: capitalize implementation only touches first char
      expect(capitalize("camelCase")).toBe("CamelCase");
    });
  });

  describe("formatEntityName", () => {
    it("should handle empty string", () => {
      expect(formatEntityName("")).toBe("");
    });

    it("should handle special 'Unit' case", () => {
      // Logic converts "Unit" directly to "Creatures & Buildings"
      expect(formatEntityName("Unit")).toBe("Creatures & Buildings");
      // "unit" strictly doesn't match the strict triple-equals "Unit" check in the code, so it will fall through to capitalization
      expect(formatEntityName("unit")).toBe("Unit");
    });

    it("should replace underscores with spaces and capitalize first letter of words", () => {
      expect(formatEntityName("fire_dragon")).toBe("Fire Dragon");
      expect(formatEntityName("ancient_mystic_tree")).toBe(
        "Ancient Mystic Tree"
      );
      // capitalize() only touches the first char, so existing ALL_CAPS stays ALL_CAPS
      expect(formatEntityName("ORC_WARRIOR")).toBe("ORC WARRIOR");
    });

    it("should handle normal strings correctly", () => {
      expect(formatEntityName("goblin")).toBe("Goblin");
    });
  });

  describe("formatTargetName", () => {
    it("should use plural rules for known targets", () => {
      expect(formatTargetName("All")).toBe("Everything");
      expect(formatTargetName("Enemy")).toBe("Enemies");
      expect(formatTargetName("Ally")).toBe("Allies");
      expect(formatTargetName("Creature")).toBe("Creatures");
      expect(formatTargetName("Building")).toBe("Buildings");
      expect(formatTargetName("Spellcaster")).toBe("Spellcasters");
    });

    it("should fallback to formatted entity name for unknown strings", () => {
      expect(formatTargetName("Target")).toBe("Target");
      expect(formatTargetName("dragon")).toBe("Dragon");
      expect(formatTargetName("")).toBe(""); // Empty falls through to empty
    });
  });
});
