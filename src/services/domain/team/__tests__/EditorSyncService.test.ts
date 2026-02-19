
import { describe, it, expect } from 'vitest';
import { EditorSyncService } from '../EditorSyncService';
import { cloneDeck } from '@/services/utils/deck-utils';
import { INITIAL_DECK } from '@/services/api/persistence';
import { Team } from '@/types/deck';

describe('EditorSyncService', () => {
    it('should always return TeamDecks update', () => {
        const decks = [cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK)] as Team["decks"];
        const update = EditorSyncService.getSyncUpdate(null, decks);
        expect(update.teamDecks).toEqual(decks);
        expect(update.currentDeck).toBeUndefined();
    });

    it('should update currentDeck if activeSlot matches a deck', () => {
        const decks = [cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK)] as Team["decks"];
        decks[0].name = "Updated Name";
        
        const update = EditorSyncService.getSyncUpdate(0, decks);
        expect(update.teamDecks).toEqual(decks);
        expect(update.currentDeck?.name).toBe("Updated Name");
        // Ensure deep copy
        expect(update.currentDeck).not.toBe(decks[0]); 
    });

    it('should NOT update currentDeck if activeSlot is null', () => {
        const decks = [cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK)] as Team["decks"];
        const update = EditorSyncService.getSyncUpdate(null, decks);
        expect(update.currentDeck).toBeUndefined();
    });
});
