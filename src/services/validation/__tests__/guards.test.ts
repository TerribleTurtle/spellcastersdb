import { describe, expect, it } from "vitest";

import { DeckFactory } from "@/tests/factories/deck-factory";
import { EntityCategory } from "@/types/enums";

import {
  isSpell,
  isSpellcaster,
  isTitan,
  isUnifiedEntity,
  isUnit,
} from "../guards";

describe("guards.ts - Entity Type Guards", () => {
  describe("isSpellcaster()", () => {
    it("should return true for an entity with category 'Spellcaster'", () => {
      const caster = DeckFactory.createSpellcaster();
      expect(isSpellcaster(caster)).toBe(true);
    });

    it("should return true for an entity with spellcaster_id", () => {
      const caster = { spellcaster_id: "sc_1", name: "Test" };
      expect(isSpellcaster(caster)).toBe(true);
    });

    it("should return true for an entity with class and abilities (legacy)", () => {
      const caster = { class: "Duelist", abilities: {}, name: "Test" };
      expect(isSpellcaster(caster)).toBe(true);
    });

    it("should return false for null or primitive values", () => {
      expect(isSpellcaster(null)).toBe(false);
      expect(isSpellcaster(undefined)).toBe(false);
      expect(isSpellcaster("string")).toBe(false);
      expect(isSpellcaster(123)).toBe(false);
    });

    it("should return false for empty or non-matching objects", () => {
      expect(isSpellcaster({})).toBe(false);
      expect(isSpellcaster({ name: "Not a caster" })).toBe(false);
    });

    it("should return false for other entity types", () => {
      expect(isSpellcaster(DeckFactory.createUnit())).toBe(false);
      expect(isSpellcaster(DeckFactory.createSpell())).toBe(false);
    });
  });

  describe("isUnit()", () => {
    it("should return true for Creature category", () => {
      const unit = DeckFactory.createUnit({
        category: EntityCategory.Creature,
      });
      expect(isUnit(unit)).toBe(true);
    });

    it("should return true for Building category", () => {
      const unit = DeckFactory.createUnit({
        category: EntityCategory.Building,
      });
      expect(isUnit(unit)).toBe(true);
    });

    it("should return false for Spell category", () => {
      const spell = DeckFactory.createSpell();
      expect(isUnit(spell)).toBe(false);
    });

    it("should return false for falsy/primitives", () => {
      expect(isUnit(null)).toBe(false);
      expect(isUnit("Creature")).toBe(false);
    });
  });

  describe("isTitan()", () => {
    it("should return true for Titan category", () => {
      const titan = DeckFactory.createTitan();
      expect(isTitan(titan)).toBe(true);
    });

    it("should return false for other categories", () => {
      expect(isTitan(DeckFactory.createUnit())).toBe(false);
    });

    it("should return false for falsy inputs", () => {
      expect(isTitan(undefined)).toBe(false);
    });
  });

  describe("isSpell()", () => {
    it("should return true for Spell category", () => {
      const spell = DeckFactory.createSpell();
      expect(isSpell(spell)).toBe(true);
    });

    it("should return false for other categories", () => {
      expect(isSpell(DeckFactory.createUnit())).toBe(false);
    });

    it("should return false for falsy inputs", () => {
      expect(isSpell(null)).toBe(false);
    });
  });

  describe("isUnifiedEntity()", () => {
    it("should return true for any valid entity type", () => {
      expect(isUnifiedEntity(DeckFactory.createUnit())).toBe(true);
      expect(isUnifiedEntity(DeckFactory.createSpell())).toBe(true);
      expect(isUnifiedEntity(DeckFactory.createTitan())).toBe(true);
      expect(isUnifiedEntity(DeckFactory.createSpellcaster())).toBe(true);
    });

    it("should return false for plain objects or unrecognised categories", () => {
      expect(isUnifiedEntity({})).toBe(false);
      expect(isUnifiedEntity({ category: "Unknown" })).toBe(false);
      expect(isUnifiedEntity(null)).toBe(false);
    });
  });
});
