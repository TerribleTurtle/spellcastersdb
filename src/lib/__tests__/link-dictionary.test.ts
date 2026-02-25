import { describe, expect, it } from "vitest";

import { Unit } from "@/types/api";

import { KEYWORD_LINKS, buildDynamicDictionary } from "../link-dictionary";

// ---------------------------------------------------------------------------
// Helpers – minimal mock entities
// ---------------------------------------------------------------------------

function mockUnit(id: string, name: string): Unit {
  return { entity_id: id, name, category: "Creature" } as unknown as Unit;
}

function mockSpellcaster(id: string, name: string) {
  return {
    spellcaster_id: id,
    entity_id: id,
    name,
    category: "Spellcaster",
    class: "Duelist",
  } as unknown as Unit;
}

function mockSpell(id: string, name: string) {
  return { entity_id: id, name, category: "Spell" } as unknown as Unit;
}

function mockTitan(id: string, name: string) {
  return { entity_id: id, name, category: "Titan" } as unknown as Unit;
}

// ============================================================================
// KEYWORD_LINKS static dictionary
// ============================================================================

describe("KEYWORD_LINKS", () => {
  it("maps all six magic schools to /schools/:id", () => {
    const schools = [
      "Elemental",
      "Wild",
      "Astral",
      "Holy",
      "Technomancy",
      "Necromancy",
    ];
    for (const school of schools) {
      expect(KEYWORD_LINKS[school]).toBe(`/schools/${school}`);
    }
  });

  it("maps all three spellcaster classes to /classes/:id", () => {
    expect(KEYWORD_LINKS["Enchanter"]).toBe("/classes/Enchanter");
    expect(KEYWORD_LINKS["Duelist"]).toBe("/classes/Duelist");
    expect(KEYWORD_LINKS["Conqueror"]).toBe("/classes/Conqueror");
  });

  it("maps four infusions to the correct detail route", () => {
    expect(KEYWORD_LINKS["Fire Infusion"]).toBe(
      "/guide/infusions/fire_infusion"
    );
    expect(KEYWORD_LINKS["Lightning Infusion"]).toBe(
      "/guide/infusions/lightning_infusion"
    );
    expect(KEYWORD_LINKS["Poison Infusion"]).toBe(
      "/guide/infusions/poison_infusion"
    );
    expect(KEYWORD_LINKS["Ice Infusion"]).toBe("/guide/infusions/ice_infusion");
  });

  it("maps lowercase mechanic terms to /guide#mechanics", () => {
    const mechanics = ["pierce", "stealth", "cleave", "aura", "infusion"];
    for (const m of mechanics) {
      expect(KEYWORD_LINKS[m]).toBe("/guide#mechanics");
    }
  });

  it("maps categories and movement types to /database?search=", () => {
    for (const term of ["Creature", "Building", "Spell", "Consumable"]) {
      expect(KEYWORD_LINKS[term]).toBe(
        `/database?search=${encodeURIComponent(term)}`
      );
    }
    for (const term of ["Flying", "Ground", "Hover"]) {
      expect(KEYWORD_LINKS[term]).toBe(
        `/database?search=${encodeURIComponent(term)}`
      );
    }
  });

  it("does NOT include ambiguous terms (War, Titan)", () => {
    expect(KEYWORD_LINKS["War"]).toBeUndefined();
    expect(KEYWORD_LINKS["Titan"]).toBeUndefined();
  });
});

// ============================================================================
// buildDynamicDictionary
// ============================================================================

describe("buildDynamicDictionary", () => {
  it("merges static links with dynamic entity names", () => {
    const entities = [
      mockUnit("astral_tower", "Astral Tower"),
      mockSpellcaster("alden", "Alden"),
    ];
    const dict = buildDynamicDictionary(entities);

    // Static still present
    expect(dict["Astral"]).toBe("/schools/Astral");
    // Dynamic names present
    expect(dict["Astral Tower"]).toBe("/incantations/units/astral_tower");
    expect(dict["Alden"]).toBe("/spellcasters/alden");
  });

  it("filters out names shorter than 4 characters", () => {
    const entities = [
      mockUnit("rat", "Rat"),
      mockUnit("imp", "Imp"),
      mockUnit("fox", "Fox"),
    ];
    const dict = buildDynamicDictionary(entities);
    expect(dict["Rat"]).toBeUndefined();
    expect(dict["Imp"]).toBeUndefined();
    expect(dict["Fox"]).toBeUndefined();
  });

  it("includes names with exactly 4 characters", () => {
    const entities = [mockUnit("lich", "Lich")];
    const dict = buildDynamicDictionary(entities);
    expect(dict["Lich"]).toBe("/incantations/units/lich");
  });

  it("skips entities with empty names", () => {
    const entities = [mockUnit("unnamed", "")];
    const dict = buildDynamicDictionary(entities);
    expect(Object.keys(dict).length).toBe(Object.keys(KEYWORD_LINKS).length);
  });

  it("returns only statics when given an empty array", () => {
    const dict = buildDynamicDictionary([]);
    expect(Object.keys(dict).length).toBe(Object.keys(KEYWORD_LINKS).length);
    expect(dict["Elemental"]).toBe("/schools/Elemental");
  });

  it("static keywords take precedence over dynamic names", () => {
    // An entity named exactly "Holy" must not override the school link
    const entities = [mockUnit("holy_unit", "Holy")];
    const dict = buildDynamicDictionary(entities);
    expect(dict["Holy"]).toBe("/schools/Holy");
  });

  it("routes spells to /incantations/spells/:id", () => {
    const entities = [mockSpell("fireball", "Fireball")];
    const dict = buildDynamicDictionary(entities);
    expect(dict["Fireball"]).toBe("/incantations/spells/fireball");
  });

  it("routes titans to /titans/:id", () => {
    const entities = [mockTitan("golem", "Golem")];
    const dict = buildDynamicDictionary(entities);
    expect(dict["Golem"]).toBe("/titans/golem");
  });

  it("handles a mix of valid and invalid entities", () => {
    const entities = [
      mockUnit("rat", "Rat"),
      mockUnit("dryad", "Dryad"),
      mockUnit("unnamed", ""),
      mockSpellcaster("swamp_witch", "Swamp Witch"),
    ];
    const dict = buildDynamicDictionary(entities);

    expect(dict["Rat"]).toBeUndefined();
    expect(dict[""]).toBeUndefined();
    expect(dict["Dryad"]).toBe("/incantations/units/dryad");
    expect(dict["Swamp Witch"]).toBe("/spellcasters/swamp_witch");
  });
});
