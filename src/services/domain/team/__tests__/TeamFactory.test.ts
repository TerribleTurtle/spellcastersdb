
import { describe, it, expect } from 'vitest';
import { TeamFactory } from '../TeamFactory';
import { INITIAL_DECK } from '@/services/api/persistence';
import { cloneDeck } from '@/services/utils/deck-utils';
import { Team } from '@/types/deck';

describe('TeamFactory', () => {
    describe('createInitialTeamDecks', () => {
        it('should create 3 unique decks with IDs', () => {
            const decks = TeamFactory.createInitialTeamDecks();
            expect(decks).toHaveLength(3);
            expect(decks[0].id).toBeDefined();
            expect(decks[1].id).toBeDefined();
            expect(decks[2].id).toBeDefined();
            expect(decks[0].id).not.toBe(decks[1].id);
        });
    });

    describe('constructTeam', () => {
        it('should construct basic team', () => {
            const initialDecks = TeamFactory.createInitialTeamDecks();
            const team = TeamFactory.constructTeam("t1", "My Team", initialDecks, null);
            expect(team.id).toBe("t1");
            expect(team.name).toBe("My Team");
            expect(team.decks).toEqual(initialDecks);
        });

        it('should use default name if input is empty', () => {
            const initialDecks = TeamFactory.createInitialTeamDecks();
            const team = TeamFactory.constructTeam("t1", "   ", initialDecks, null);
            expect(team.name).toBe("Untitled Team");
        });

        it('should override active slot if provided', () => {
            const initialDecks = TeamFactory.createInitialTeamDecks();
            const overrideDeck = cloneDeck(INITIAL_DECK);
            overrideDeck.name = "Override";
            overrideDeck.id = "override-id";

            const team = TeamFactory.constructTeam("t1", "Team", initialDecks, 0, overrideDeck);
            expect(team.decks[0].name).toBe("Override");
            expect(team.decks[0].id).toBe("override-id");
            expect(team.decks[1].id).toBe(initialDecks[1].id);
        });
    });

    describe('duplicateTeam', () => {
        it('should duplicate team with new ID and unique name', () => {
            const originalDecks = TeamFactory.createInitialTeamDecks();
            const original: Team = { id: "old", name: "Team A", decks: originalDecks };
            const existingNames = ["Team A", "Team B"];

            const duplicate = TeamFactory.duplicateTeam(original, "new-id", existingNames);
            
            expect(duplicate.id).toBe("new-id");
            expect(duplicate.name).toBe("Team A (Copy)");
            expect(duplicate.decks).toHaveLength(3);
            // Verify decks were cloned (not same reference)
            expect(duplicate.decks[0]).not.toBe(original.decks[0]); 
            expect(duplicate.decks[0].name).toBe(original.decks[0].name);
        });
    });

    describe('prepareImportedTeam', () => {
        it('should construct team from deck array', () => {
            const importedDecks = [cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK)];
            const newIds = ["id1", "id2", "id3"];
            
            const result = TeamFactory.prepareImportedTeam(importedDecks, newIds, "Imported");
            expect(result.teamName).toBe("Imported (Copy)");
            // slice(0, TEAM_LIMIT) on a 2-element array returns 2 elements
            expect(result.teamDecks).toHaveLength(2);
            expect(result.teamDecks[0].id).toBe("id1");
            expect(result.teamDecks[1].id).toBe("id2");
        });
    });
});
