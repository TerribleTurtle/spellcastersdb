import { describe, expect, it } from "vitest";

import { UnifiedEntity } from "@/types/api";
import { EntityCategory } from "@/types/enums";

import { routes } from "../routes";

// --- Simple Route Tests ---

describe("routes — simple paths", () => {
  it("unit() returns correct path", () => {
    expect(routes.unit("fire_imp")).toBe("/incantations/units/fire_imp");
  });

  it("spell() returns correct path", () => {
    expect(routes.spell("fireball")).toBe("/incantations/spells/fireball");
  });

  it("titan() returns correct path", () => {
    expect(routes.titan("colossus")).toBe("/titans/colossus");
  });

  it("spellcaster() returns correct path", () => {
    expect(routes.spellcaster("alden")).toBe("/spellcasters/alden");
  });

  it("consumable() returns correct path", () => {
    expect(routes.consumable("potion")).toBe("/consumables/potion");
  });

  it("upgrade() returns correct path", () => {
    expect(routes.upgrade("shield")).toBe("/upgrades/shield");
  });

  it("school() returns correct path", () => {
    expect(routes.school("elemental")).toBe("/schools/elemental");
  });

  it("rank() returns correct path", () => {
    expect(routes.rank("I")).toBe("/ranks/I");
  });

  it("class_() returns correct path", () => {
    expect(routes.class_("duelist")).toBe("/classes/duelist");
  });

  it("infusions() returns correct path", () => {
    expect(routes.infusions()).toBe("/guide/infusions");
  });

  it("infusion() returns correct path", () => {
    expect(routes.infusion("flame")).toBe("/guide/infusions/flame");
  });
});

// --- Optional Parameters ---

describe("routes — optional params", () => {
  it("database() without search returns base path", () => {
    expect(routes.database()).toBe("/database");
  });

  it("database() with search returns encoded query param", () => {
    expect(routes.database("fire imp")).toBe("/database?search=fire%20imp");
  });

  it("guide() without anchor returns base path", () => {
    expect(routes.guide()).toBe("/guide");
  });

  it("guide() with anchor returns hash", () => {
    expect(routes.guide("combat")).toBe("/guide#combat");
  });
});

// --- entityLink Branch Tests ---

describe("routes.entityLink", () => {
  it("should route entity with spellcaster_id to /spellcasters/", () => {
    const entity = {
      entity_id: "sc1",
      spellcaster_id: "sc1",
      name: "Alden",
      category: EntityCategory.Spellcaster,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/spellcasters/sc1");
  });

  it("should route category=Spellcaster (without spellcaster_id) via entity_id", () => {
    const entity = {
      entity_id: "sc2",
      name: "Test",
      category: EntityCategory.Spellcaster,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/spellcasters/sc2");
  });

  it("should route category=Titan", () => {
    const entity = {
      entity_id: "t1",
      name: "Colossus",
      category: EntityCategory.Titan,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/titans/t1");
  });

  it("should route category=Spell", () => {
    const entity = {
      entity_id: "sp1",
      name: "Fireball",
      category: EntityCategory.Spell,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/incantations/spells/sp1");
  });

  it("should route category=Consumable", () => {
    const entity = {
      entity_id: "c1",
      name: "Potion",
      category: EntityCategory.Consumable,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/consumables/c1");
  });

  it("should route category=Upgrade", () => {
    const entity = {
      entity_id: "up1",
      name: "Shield",
      category: EntityCategory.Upgrade,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/upgrades/up1");
  });

  it("should default to unit route for Creature category", () => {
    const entity = {
      entity_id: "u1",
      name: "Fire Imp",
      category: EntityCategory.Creature,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/incantations/units/u1");
  });

  it("should default to unit route for unknown category", () => {
    const entity = {
      entity_id: "x1",
      name: "Unknown",
      category: "FutureCategory",
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/incantations/units/x1");
  });

  it("should prioritize spellcaster_id over category-based routing", () => {
    // Entity has spellcaster_id AND category=Titan — spellcaster_id should win
    const entity = {
      entity_id: "mixed",
      spellcaster_id: "mixed",
      name: "Hybrid",
      category: EntityCategory.Titan,
    } as unknown as UnifiedEntity;
    expect(routes.entityLink(entity)).toBe("/spellcasters/mixed");
  });
});

// --- entityLinkFromChangelog Branch Tests ---

describe("routes.entityLinkFromChangelog", () => {
  it("should resolve 'heroes' category", () => {
    expect(routes.entityLinkFromChangelog("heroes/alden.json", "heroes")).toBe(
      "/spellcasters/alden"
    );
  });

  it("should resolve 'spellcaster' category", () => {
    expect(
      routes.entityLinkFromChangelog("heroes/nadia.json", "spellcaster")
    ).toBe("/spellcasters/nadia");
  });

  it("should resolve 'spellcasters' category", () => {
    expect(
      routes.entityLinkFromChangelog("heroes/nadia.json", "spellcasters")
    ).toBe("/spellcasters/nadia");
  });

  it("should resolve 'units' category", () => {
    expect(routes.entityLinkFromChangelog("units/fire_imp.json", "units")).toBe(
      "/incantations/units/fire_imp"
    );
  });

  it("should resolve 'creature' category", () => {
    expect(
      routes.entityLinkFromChangelog("units/fire_imp.json", "creature")
    ).toBe("/incantations/units/fire_imp");
  });

  it("should resolve 'building' category", () => {
    expect(
      routes.entityLinkFromChangelog("building/astral_tower.json", "building")
    ).toBe("/incantations/units/astral_tower");
  });

  it("should resolve 'spells' category", () => {
    expect(
      routes.entityLinkFromChangelog("spells/fireball.json", "spells")
    ).toBe("/incantations/spells/fireball");
  });

  it("should resolve 'spell' category", () => {
    expect(
      routes.entityLinkFromChangelog("spells/fireball.json", "spell")
    ).toBe("/incantations/spells/fireball");
  });

  it("should resolve 'titans' category", () => {
    expect(
      routes.entityLinkFromChangelog("titans/colossus.json", "titans")
    ).toBe("/titans/colossus");
  });

  it("should resolve 'titan' category", () => {
    expect(
      routes.entityLinkFromChangelog("titans/colossus.json", "titan")
    ).toBe("/titans/colossus");
  });

  it("should resolve 'consumables' category", () => {
    expect(
      routes.entityLinkFromChangelog("consumables/potion.json", "consumables")
    ).toBe("/consumables/potion");
  });

  it("should resolve 'consumable' category", () => {
    expect(
      routes.entityLinkFromChangelog("consumables/potion.json", "consumable")
    ).toBe("/consumables/potion");
  });

  it("should return null for unknown category", () => {
    expect(
      routes.entityLinkFromChangelog("unknown/thing.json", "artifacts")
    ).toBeNull();
  });

  it("should handle targetId without directory prefix", () => {
    expect(routes.entityLinkFromChangelog("alden.json", "heroes")).toBe(
      "/spellcasters/alden"
    );
  });

  it("should handle nested paths correctly (takes last segment)", () => {
    expect(
      routes.entityLinkFromChangelog("some/deep/path/fire_imp.json", "units")
    ).toBe("/incantations/units/fire_imp");
  });
});
