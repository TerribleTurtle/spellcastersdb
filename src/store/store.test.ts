import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from './index';
import { INITIAL_DECK } from "@/services/api/persistence";
import { Unit, Spellcaster } from '@/types/api';
import { EntityCategory } from '@/types/enums';

// Mock Data
// Mock Data
const MockUnit: Unit = {
    entity_id: "unit_1",
    name: "Test Unit",
    category: EntityCategory.Creature,
    rank: "I",
    description: "A test unit", // Unit extends Incantation which has description
    magic_school: "Elemental",
    tags: [],
    // Flat stats
    health: 10,
    range: 10,
    movement_speed: 10,
    damage: 10
};

const MockSpellcaster: Spellcaster = {
    entity_id: "caster_1",
    name: "Test Caster",
    spellcaster_id: "caster_1",
    category: EntityCategory.Spellcaster,
    class: "Conqueror",
    tags: [],
    health: 100,
    movement_speed: 10,
    abilities: {
        passive: [{ name: "P", description: "D" }],
        primary: { name: "P1", description: "D" },
        defense: { name: "D1", description: "D" },
        ultimate: { name: "U", description: "D" }
    }
};

describe('DeckStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useDeckStore.setState({
            currentDeck: INITIAL_DECK,
            savedDecks: [],
            teamName: "New Team",
            activeTeamId: null,
            teamDecks: [INITIAL_DECK, INITIAL_DECK, INITIAL_DECK],
            savedTeams: []
        });
    });

    describe('Solo Actions', () => {
        it('should set spellcaster', () => {
            const { setSpellcaster } = useDeckStore.getState();
            setSpellcaster(MockSpellcaster);
            const { currentDeck } = useDeckStore.getState();
            expect(currentDeck.spellcaster).toEqual(MockSpellcaster);
        });

        it('should add unit to slot', () => {
            const { setSlot } = useDeckStore.getState();
            setSlot(0, MockUnit);
            const { currentDeck } = useDeckStore.getState();
            expect(currentDeck.slots[0].unit).toEqual(MockUnit);
        });

        it('should save deck', () => {
            const { setDeckName, saveDeck } = useDeckStore.getState();
            setDeckName("My Saved Deck");
            saveDeck();
            
            const { savedDecks } = useDeckStore.getState();
            expect(savedDecks.length).toBe(1);
            expect(savedDecks[0].name).toBe("My Saved Deck");
            expect(savedDecks[0].id).toBeDefined();
        });

        it('should load deck', () => {
             const { setDeckName, saveDeck, loadDeck, clearDeck } = useDeckStore.getState();
             setDeckName("To Load");
             saveDeck();
             const savedId = useDeckStore.getState().savedDecks[0].id!;
             
             clearDeck();
             expect(useDeckStore.getState().currentDeck.name).toBe("New Deck");
             
             loadDeck(savedId);
             expect(useDeckStore.getState().currentDeck.name).toBe("To Load");
             expect(useDeckStore.getState().currentDeck.id).toBe(savedId);
        });
    });

    describe('Team Actions', () => {
        it('should update team name', () => {
            const { setTeamName } = useDeckStore.getState();
            setTeamName("Champions");
            expect(useDeckStore.getState().teamName).toBe("Champions");
        });

        it('should save team', () => {
             const { setTeamName, saveTeam } = useDeckStore.getState();
             setTeamName("My Team");
             saveTeam("mock-team-id");
             
             const { savedTeams } = useDeckStore.getState();
             expect(savedTeams.length).toBe(1);
             expect(savedTeams[0].name).toBe("My Team");
             expect(savedTeams[0].id).toBeDefined();
        });
    });
    describe('Persistence Actions', () => {
        it('should check if deck name is available', () => {
            const { saveDeck, setDeckName, checkDeckNameAvailable } = useDeckStore.getState();
            setDeckName("Unique Name");
            saveDeck();
            
            expect(checkDeckNameAvailable("Unique Name")).toBe(false);
            expect(checkDeckNameAvailable("unique name")).toBe(false); // Case insensitive
            expect(checkDeckNameAvailable("Other Name")).toBe(true);
        });

        it('should ignore self when checking availability', () => {
            const { saveDeck, setDeckName, checkDeckNameAvailable } = useDeckStore.getState();
            setDeckName("My Deck");
            saveDeck();
            const id = useDeckStore.getState().savedDecks[0].id!;
            
            expect(checkDeckNameAvailable("My Deck", id)).toBe(true);
        });
        it('should handle duplicate naming collisions', () => {
            const { saveDeck, setDeckName, duplicateDeck } = useDeckStore.getState();
            setDeckName("My Deck");
            saveDeck();
            const originalId = useDeckStore.getState().savedDecks[0].id!;
            
            // First duplication -> "My Deck (Copy)"
            duplicateDeck(originalId);
            const firstCopy = useDeckStore.getState().savedDecks.find(d => d.name === "My Deck (Copy)");
            expect(firstCopy).toBeDefined();

            // Second duplication -> Should be "My Deck (Copy 1)" or similar, currently fails
            duplicateDeck(originalId);
            
            const copies = useDeckStore.getState().savedDecks.filter(d => (d.name || "").startsWith("My Deck (Copy"));
            // Expect 2 distinct copies
            expect(copies.length).toBe(2);
            expect(copies[0].name).not.toBe(copies[1].name);
        });
    });
});
