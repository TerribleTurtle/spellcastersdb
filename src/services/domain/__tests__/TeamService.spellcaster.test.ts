import { describe, it, expect } from 'vitest';
import { TeamMovement } from "@/services/domain/team/TeamMovement";

import { Spellcaster } from "@/types/api";
import { cloneDeck } from "@/services/utils/deck-utils";

import { INITIAL_DECK } from "@/services/api/persistence"; 
import { EntityCategory } from '@/types/enums';

// Mock Data
const MockSCA: Spellcaster = {
    entity_id: "sc_a",
    name: "Caster A",
    category: EntityCategory.Spellcaster,
    spellcaster_id: "sc_a",
    class: "Conqueror",
    tags: [],
    health: 100,
    abilities: {
        passive: [],
        primary: { name: "P", description: "D" },
        defense: { name: "D", description: "D" },
        ultimate: { name: "U", description: "D" }
    }
};

const MockSCB: Spellcaster = {
    entity_id: "sc_b",
    name: "Caster B",
    category: EntityCategory.Spellcaster,
    spellcaster_id: "sc_b",
    class: "Duelist",
    tags: [],
    health: 120,
    abilities: {
        passive: [],
        primary: { name: "P", description: "D" },
        defense: { name: "D", description: "D" },
        ultimate: { name: "U", description: "D" }
    }
};

describe('TeamMovement.moveSpellcasterBetweenDecks', () => {
    const createTeamDecks = () => [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK)
    ] as [typeof INITIAL_DECK, typeof INITIAL_DECK, typeof INITIAL_DECK];

    it('should move spellcaster to empty slot', () => {
        const decks = createTeamDecks();
        decks[0].spellcaster = MockSCA;

        const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 1);

        expect(result.success).toBe(true);
        const newDecks = result.data!;

        expect(newDecks[1].spellcaster).toEqual(MockSCA);
        expect(newDecks[0].spellcaster).toBeNull();
    });

    it('should swap spellcasters if target occupied', () => {
        const decks = createTeamDecks();
        decks[0].spellcaster = MockSCA;
        decks[1].spellcaster = MockSCB;

        const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 1);

        expect(result.success).toBe(true);
        const newDecks = result.data!;

        expect(newDecks[1].spellcaster).toEqual(MockSCA);
        expect(newDecks[0].spellcaster).toEqual(MockSCB);
    });
});
