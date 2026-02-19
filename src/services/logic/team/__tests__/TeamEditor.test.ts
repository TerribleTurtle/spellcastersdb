
import { describe, it, expect, beforeEach } from 'vitest';
import { TeamEditor } from '../TeamEditor';
import { INITIAL_DECK } from '@/services/api/persistence';
import { cloneDeck } from '@/services/utils/deck-utils';
import { Team } from '@/types/deck';
import { SlotType } from '@/types/deck';
import { Unit, Spellcaster, Titan, Spell } from '@/types/api';
import { EntityCategory } from '@/types/enums';

// --- Mocks ---
const MockUnit: Unit = {
    entity_id: "unit_1",
    name: "Test Unit",
    category: EntityCategory.Creature,
    rank: "I",
    description: "desc",
    magic_school: "Elemental",
    tags: [],
    health: 10,
    range: 1,
    movement_speed: 1,
    damage: 1
};

const MockSpellcaster: Spellcaster = {
    entity_id: "caster_1",
    spellcaster_id: "caster_1",
    name: "Test Caster",
    category: EntityCategory.Spellcaster,
    class: "Duelist",
    tags: ['hero'],
    health: 100,
    abilities: {
        passive: [],
        primary: { name: "A", description: "D" },
        defense: { name: "B", description: "D" },
        ultimate: { name: "C", description: "D" }
    }
};

const MockTitan: Titan = {
    entity_id: "titan_1",
    name: "Titan",
    category: EntityCategory.Titan,
    rank: "V",
    magic_school: "Titan",
    tags: [],
    description: "desc",
    health: 1000,
    damage: 100,
    movement_speed: 10
};

describe('TeamEditor', () => {
    let teamDecks: Team["decks"];

    beforeEach(() => {
        teamDecks = [
            cloneDeck(INITIAL_DECK),
            cloneDeck(INITIAL_DECK),
            cloneDeck(INITIAL_DECK)
        ];
    });

    describe('setSlot', () => {
        it('should set a unit in a valid slot', () => {
            const result = TeamEditor.setSlot(teamDecks, 0, 0, MockUnit);
            expect(result.success).toBe(true);
            expect(result.data![0].slots[0].unit).toEqual(MockUnit);
        });

        it('should return error for invalid deck index', () => {
             const result = TeamEditor.setSlot(teamDecks, 99, 0, MockUnit);
             expect(result.success).toBe(false);
             expect(result.code).toBe("INVALID_DECK");
        });

        it('should fail if DeckRules fails (e.g. invalid type)', () => {
            const result = TeamEditor.setSlot(teamDecks, 0, 0, MockSpellcaster as unknown as Unit);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('clearSlot', () => {
        it('should clear a populated slot', () => {
             teamDecks[0].slots[0].unit = MockUnit;
             const newDecks = TeamEditor.clearSlot(teamDecks, 0, 0);
             expect(newDecks[0].slots[0].unit).toBeNull();
        });

        it('should return original state if deck index invalid', () => {
            const result = TeamEditor.clearSlot(teamDecks, 99, 0);
            expect(result).toBe(teamDecks);
        });
    });

    describe('setSpellcaster', () => {
        it('should set spellcaster', () => {
             const newDecks = TeamEditor.setSpellcaster(teamDecks, 0, MockSpellcaster);
             expect(newDecks[0].spellcaster).toEqual(MockSpellcaster);
        });
    });

    describe('removeSpellcaster', () => {
        it('should remove spellcaster', () => {
             teamDecks[0].spellcaster = MockSpellcaster;
             const newDecks = TeamEditor.removeSpellcaster(teamDecks, 0);
             expect(newDecks[0].spellcaster).toBeNull();
        });
    });

    describe('swapSlots', () => {
        it('should swap two units within the same deck', () => {
             teamDecks[0].slots[0].unit = MockUnit;
             const unit2 = { ...MockUnit, entity_id: "u2" };
             teamDecks[0].slots[1].unit = unit2;

             const result = TeamEditor.swapSlots(teamDecks, 0, 0, 1);
             expect(result.success).toBe(true);
             expect(result.data![0].slots[0].unit).toEqual(unit2);
             expect(result.data![0].slots[1].unit).toEqual(MockUnit);
        });

        it('should return error for invalid deck index', () => {
            const result = TeamEditor.swapSlots(teamDecks, 99, 0, 1);
            expect(result.success).toBe(false);
            expect(result.code).toBe("INVALID_DECK");
        });
    });

    describe('quickAdd', () => {
        it('should quick add unit to first empty slot', () => {
             const result = TeamEditor.quickAdd(teamDecks, 0, MockUnit);
             expect(result.success).toBe(true);
             expect(result.data![0].slots[0].unit).toEqual(MockUnit);
        });

        it('should quick add spellcaster', () => {
            const result = TeamEditor.quickAdd(teamDecks, 0, MockSpellcaster);
            expect(result.success).toBe(true);
            expect(result.data![0].spellcaster).toEqual(MockSpellcaster);
        });

        it('should fail quick add if deck index invalid', () => {
            const result = TeamEditor.quickAdd(teamDecks, 99, MockUnit);
            expect(result.success).toBe(false);
            expect(result.code).toBe("INVALID_DECK");
        });
    });
});
