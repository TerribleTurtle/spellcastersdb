import { Unit, Spell, Titan, Spellcaster } from "@/types/api";
import { EntityCategory } from "@/types/enums";

export const DeckFactory = {
  createUnit: (overrides: Partial<Unit> = {}): Unit => ({
    entity_id: "u1",
    name: "Test Unit",
    category: EntityCategory.Creature,
    health: 100,
    movement_speed: 10,
    magic_school: "Wild",
    tags: [],
    description: "Test Description",
    range: 1,
    damage: 10,
    ...overrides,
  }),

  createSpell: (overrides: Partial<Spell> = {}): Spell => ({
    entity_id: "s1",
    name: "Test Spell",
    category: EntityCategory.Spell,
    magic_school: "Wild",
    tags: [],
    description: "Test Spell Desc",
    ...overrides,
  }),

  createTitan: (overrides: Partial<Titan> = {}): Titan => ({
    entity_id: "t1",
    name: "Test Titan",
    category: EntityCategory.Titan,
    magic_school: "Titan",
    rank: "V",
    health: 500,
    movement_speed: 5,
    tags: [],
    description: "Test Titan Desc",
    damage: 50,
    ...overrides,
  }),

  createSpellcaster: (overrides: Partial<Spellcaster> = {}): Spellcaster => ({
    entity_id: "sc1", // V2 uses entity_id
    spellcaster_id: "sc1", // Legacy
    name: "Test Caster",
    category: EntityCategory.Spellcaster,
    class: "Duelist",
    tags: [],
    health: 1000,
    abilities: {
        passive: [{ name: "Passive", description: "Desc" }],
        primary: { name: "Primary", description: "Desc" },
        defense: { name: "Defense", description: "Desc" },
        ultimate: { name: "Ultimate", description: "Desc" }
    },
    ...overrides
  })
};
