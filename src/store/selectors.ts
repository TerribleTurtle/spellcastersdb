import { DeckBuilderState } from "./types";
import { areDecksEqual } from "@/services/data/persistence";

type SelectorState = Pick<DeckBuilderState, "currentDeck">;
type ChangesState = Pick<DeckBuilderState, "currentDeck" | "savedDecks">;

export const selectCurrentDeck = (state: SelectorState) => state.currentDeck;
export const selectSavedDecks = (state: Pick<DeckBuilderState, "savedDecks">) => state.savedDecks;

export const selectIsEmpty = (state: SelectorState) => {
    const { currentDeck } = state;
    return !currentDeck.spellcaster && currentDeck.slots.every((s) => !s.unit);
};

export const selectHasChanges = (state: ChangesState) => {
    const { currentDeck, savedDecks } = state;
    const empty = selectIsEmpty(state);

    if (!currentDeck.id) {
        return !empty;
    }

    const saved = savedDecks.find((d) => d.id === currentDeck.id);
    if (!saved) return true;

    return !areDecksEqual(currentDeck, saved);
};

export const selectIsSaved = (state: ChangesState) => {
    const { currentDeck, savedDecks } = state;
    if (!currentDeck.id) return false;
    
    // Must exist in saved decks AND be equal to it
    const saved = savedDecks.find((d) => d.id === currentDeck.id);
    if (!saved) return false;
    
    return areDecksEqual(currentDeck, saved);
};
