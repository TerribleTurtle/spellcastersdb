import { describe, it, expect } from "vitest";
import { getCardAltText } from "../asset-helpers";
import { 
  Spellcaster, 
  Unit, 
  Spell, 
  Titan, 
  UnifiedEntity 
} from "@/types/api";
import { EntityCategory } from "@/types/enums";

describe("getCardAltText", () => {
  it("generates correct alt text for Spellcasters", () => {
    const spellcaster: Spellcaster = {
      entity_id: "sc1",
      name: "Kael'thas",
      class: "Enchanter",
      category: EntityCategory.Spellcaster,
      tags: [],
      health: 1000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      abilities: {} as any
    };
    expect(getCardAltText(spellcaster)).toBe("Kael'thas - Enchanter Spellcaster");
  });

  it("generates correct alt text for Titans", () => {
    const titan: Titan = {
      entity_id: "t1",
      name: "Molten Giant",
      category: EntityCategory.Titan,
      magic_school: "Elemental",
      rank: "V",
      description: "",
      tags: [],
      health: 5000,
      damage: 500,
      movement_speed: 10
    };
    expect(getCardAltText(titan)).toBe("Molten Giant - Titan (Rank V)");
  });

  it("generates correct alt text for Units (Creature)", () => {
    const unit: Unit = {
      entity_id: "u1",
      name: "Skeleton Warrior",
      category: EntityCategory.Creature,
      magic_school: "Necromancy",
      rank: "I",
      description: "",
      tags: [],
      health: 100
    };
    expect(getCardAltText(unit)).toBe("Skeleton Warrior - Rank I Necromancy Creature");
  });

  it("generates correct alt text for Units (Building)", () => {
    const building: Unit = {
      entity_id: "b1",
      name: "Tesla Coil",
      category: EntityCategory.Building,
      magic_school: "Technomancy",
      rank: "III",
      description: "",
      tags: [],
      health: 500
    };
    expect(getCardAltText(building)).toBe("Tesla Coil - Rank III Technomancy Building");
  });

  it("generates correct alt text for Spells", () => {
    const spell: Spell = {
      entity_id: "s1",
      name: "Fireball",
      category: EntityCategory.Spell,
      magic_school: "Elemental",
      description: "",
      tags: []
    };
    expect(getCardAltText(spell)).toBe("Fireball - Elemental Spell");
  });

  it("fallbacks to name if metadata is missing", () => {
    const basic: Partial<UnifiedEntity> = {
      name: "Unknown Entity"
    };
    expect(getCardAltText(basic as UnifiedEntity)).toBe("Unknown Entity");
  });

  it("handles missing name safely", () => {
    const empty: Partial<UnifiedEntity> = {};
    expect(getCardAltText(empty as UnifiedEntity)).toBe("Card Image");
  });
});
