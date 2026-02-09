import { describe, it, expect, vi, afterEach } from "vitest";
import { getCardImageUrl } from "./utils";

describe("getCardImageUrl", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return remote URL for a unit by default", () => {
    const unit = { entity_id: "unit_123", category: "Creature", name: "Test Unit" };
    const url = getCardImageUrl(unit);
    expect(url).toBe("https://terribleturtle.github.io/spellcasters-community-api/assets/units/unit_123.png");
  });

  it("should return remote URL for a spell", () => {
    const spell = { entity_id: "spell_456", category: "Spell", name: "Test Spell" };
    const url = getCardImageUrl(spell);
    expect(url).toBe("https://terribleturtle.github.io/spellcasters-community-api/assets/spells/spell_456.png");
  });

  it("should return remote URL for a spellcaster", () => {
    const spellcaster = { spellcaster_id: "hero_789", category: "Spellcaster", name: "Test Spellcaster" };
    const url = getCardImageUrl(spellcaster);
    expect(url).toBe("https://terribleturtle.github.io/spellcasters-community-api/assets/spellcasters/hero_789.png");
  });

  it("should return remote URL for a consumable", () => {
    const item = { consumable_id: "item_000", category: "Consumable", name: "Test Item" };
    const url = getCardImageUrl(item);
    expect(url).toBe("https://terribleturtle.github.io/spellcasters-community-api/assets/consumables/item_000.png");
  });

  it("should prefer webp if forced via options", () => {
    const unit = { entity_id: "unit_123", category: "Creature", name: "Test Unit" };
    const url = getCardImageUrl(unit, { forceFormat: "webp" });
    expect(url).toBe("https://terribleturtle.github.io/spellcasters-community-api/assets/units/unit_123.webp");
  });

  it("should return local URL if NEXT_PUBLIC_USE_LOCAL_ASSETS is 'true'", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_USE_LOCAL_ASSETS: "true" };
    const unit = { entity_id: "unit_123", category: "Creature", name: "Test Unit" };
    const url = getCardImageUrl(unit);
    expect(url).toBe("/api/local-assets/units/unit_123.png");
  });

  it("should ignore local assets setting if forceRemote is true", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_USE_LOCAL_ASSETS: "true" };
    const unit = { entity_id: "unit_123", category: "Creature", name: "Test Unit" };
    const url = getCardImageUrl(unit, { forceRemote: true });
    expect(url).toBe("https://terribleturtle.github.io/spellcasters-community-api/assets/units/unit_123.png");
  });

  it("should return placeholder if no ID is present", () => {
    const badEntity = { name: "Broken" };
    // @ts-expect-error - testing invalid entity
    const url = getCardImageUrl(badEntity);
    expect(url).toContain("placeholder_card.png");
  });
});
