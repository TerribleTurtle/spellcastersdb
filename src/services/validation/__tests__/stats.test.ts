import { describe, expect, it } from "vitest";

import { Spellcaster, Titan, Unit } from "@/types/api";
import { Deck, DeckSlot, SlotType } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { calculateDeckStats } from "../stats";

// --- Mock Factories ---

const mockSlot = (
  index: number,
  unit: Unit | Titan | null = null
): DeckSlot => ({
  index,
  unit,
  allowedTypes: index === 4 ? [SlotType.Titan] : [SlotType.Unit],
});

const emptyDeck = (): Deck => ({
  spellcaster: null,
  slots: [mockSlot(0), mockSlot(1), mockSlot(2), mockSlot(3), mockSlot(4)],
  name: "",
});

const mockUnit = (overrides: Partial<Unit> = {}): Unit =>
  ({
    entity_id: "u1",
    name: "Test Creature",
    category: EntityCategory.Creature,
    rank: "III",
    description: "desc",
    magic_school: "Wild",
    tags: [],
    health: 100,
    damage: 10,
    movement_speed: 10,
    ...overrides,
  }) as Unit;

const mockTitan = (): Titan =>
  ({
    entity_id: "t1",
    name: "Test Titan",
    category: EntityCategory.Titan,
    rank: "V",
    description: "titan",
    magic_school: "Titan",
    tags: [],
    health: 1000,
    damage: 100,
    movement_speed: 5,
  }) as Titan;

const mockSpellcaster = (): Spellcaster =>
  ({
    entity_id: "sc1",
    spellcaster_id: "sc1",
    name: "Test Caster",
    category: EntityCategory.Spellcaster,
    class: "Enchanter",
    tags: [],
    health: 100,
    abilities: {
      passive: [],
      primary: { name: "P", description: "D" },
      defense: { name: "D", description: "D" },
      ultimate: { name: "U", description: "D" },
    },
  }) as Spellcaster;

// --- Tests ---

describe("calculateDeckStats", () => {
  it("should return zeros for an empty deck", () => {
    const stats = calculateDeckStats(emptyDeck());

    expect(stats.unitCount).toBe(0);
    expect(stats.titanCount).toBe(0);
    expect(stats.hasSpellcaster).toBe(false);
    expect(stats.rank1or2Count).toBe(0);
    expect(stats.rank1or2CreatureCount).toBe(0);
  });

  it("should calculate full valid deck stats", () => {
    const deck = emptyDeck();
    deck.spellcaster = mockSpellcaster();
    deck.slots[0].unit = mockUnit({ entity_id: "u1" });
    deck.slots[1].unit = mockUnit({ entity_id: "u2" });
    deck.slots[2].unit = mockUnit({ entity_id: "u3" });
    deck.slots[3].unit = mockUnit({ entity_id: "u4" });
    deck.slots[4].unit = mockTitan();

    const stats = calculateDeckStats(deck);

    expect(stats.unitCount).toBe(4);
    expect(stats.titanCount).toBe(1);
    expect(stats.hasSpellcaster).toBe(true);
  });

  it("should count Rank I creatures correctly", () => {
    const deck = emptyDeck();
    deck.slots[0].unit = mockUnit({
      rank: "I",
      category: EntityCategory.Creature,
    });

    const stats = calculateDeckStats(deck);

    expect(stats.rank1or2Count).toBe(1);
    expect(stats.rank1or2CreatureCount).toBe(1);
  });

  it("should count Rank I buildings but NOT as creatures", () => {
    const deck = emptyDeck();
    deck.slots[0].unit = mockUnit({
      rank: "I",
      category: EntityCategory.Building,
    });

    const stats = calculateDeckStats(deck);

    expect(stats.rank1or2Count).toBe(1);
    expect(stats.rank1or2CreatureCount).toBe(0);
  });

  it("should break down category counts correctly", () => {
    const deck = emptyDeck();
    deck.slots[0].unit = mockUnit({
      entity_id: "c1",
      category: EntityCategory.Creature,
    });
    deck.slots[1].unit = mockUnit({
      entity_id: "c2",
      category: EntityCategory.Creature,
    });
    deck.slots[2].unit = mockUnit({
      entity_id: "b1",
      category: EntityCategory.Building,
    });
    deck.slots[3].unit = mockUnit({
      entity_id: "s1",
      category: EntityCategory.Spell,
    } as unknown as Partial<Unit>);

    const stats = calculateDeckStats(deck);

    expect(stats.unitCounts[EntityCategory.Creature]).toBe(2);
    expect(stats.unitCounts[EntityCategory.Building]).toBe(1);
    expect(stats.unitCounts[EntityCategory.Spell]).toBe(1);
  });

  it("should return safe defaults for null/undefined deck", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nullStats = calculateDeckStats(null as any);
    expect(nullStats.unitCount).toBe(0);
    expect(nullStats.titanCount).toBe(0);
    expect(nullStats.hasSpellcaster).toBe(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const undefinedStats = calculateDeckStats(undefined as any);
    expect(undefinedStats.unitCount).toBe(0);
  });
});
