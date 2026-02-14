import { StateCreator } from "zustand";
import { v4 as uuidv4 } from 'uuid';
import { DeckBuilderState, PersistenceState } from "./types";
import { Deck, Team } from "@/types/deck";
import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { getUniqueName } from "@/services/utils/naming-utils";

import { TeamFactory } from "@/services/domain/team/TeamFactory";
import { TeamPersistenceHelper } from "@/services/domain/team/TeamPersistenceHelper";

export const createPersistenceSlice: StateCreator<
  DeckBuilderState,
  [], 
  [], 
  PersistenceState
> = (set, get) => ({
  savedDecks: [],
  savedTeams: [],

  saveDeck: (nameInput) => set((state) => {
       let finalName = nameInput?.trim();
       if (!finalName) {
           finalName = state.currentDeck.name || (state.currentDeck.spellcaster?.name 
              ? `${state.currentDeck.spellcaster.name} Deck` 
              : "Untitled Deck");
       }
       
       let id = state.currentDeck.id;
       if (!id) {
           id = uuidv4();
       }
       
       const deckToSave = { ...state.currentDeck, name: finalName, id };
       
       const existingIndex = state.savedDecks.findIndex(d => d.id === id);
       const newSavedDecks = [...state.savedDecks];
       if (existingIndex >= 0) {
           newSavedDecks[existingIndex] = deckToSave;
       } else {
           newSavedDecks.push(deckToSave);
       }
       
       return { 
           currentDeck: deckToSave,
           savedDecks: newSavedDecks,
       };
  }),

  saveAsCopy: (nameInput) => set((state) => {
      const newId = uuidv4();
      // Generate unique name
      const { savedDecks } = get();
      const existingNames = savedDecks.map(d => d.name || "");
      const baseName = nameInput?.trim() || state.currentDeck.name || "Untitled Deck";
      const finalName = getUniqueName(baseName, existingNames);
      
      const deckToSave = { ...state.currentDeck, id: newId, name: finalName };
      
      return {
          currentDeck: deckToSave,
          savedDecks: [...state.savedDecks, deckToSave],
      };
  }),

  loadDeck: (id) => set((state) => {
      const target = state.savedDecks.find(d => d.id === id);
      if (target) {
           const clone = cloneDeck(target);
           return { currentDeck: clone };
      }
      return {};
  }),

  deleteDeck: (id) => set((state) => ({
      savedDecks: state.savedDecks.filter(d => d.id !== id),
      currentDeck: state.currentDeck.id === id 
          ? { ...INITIAL_DECK, id: undefined, name: "" }
          : state.currentDeck
  })),

  deleteDecks: (ids: string[]) => set((state) => ({
      savedDecks: state.savedDecks.filter(d => !ids.includes(d.id!)),
      // If the current deck is one of the deleted ones, reset it
      currentDeck: (state.currentDeck.id && ids.includes(state.currentDeck.id))
          ? { ...INITIAL_DECK, id: undefined, name: "" }
          : state.currentDeck
  })),

  duplicateDeck: (id) => set((state) => {
      const target = state.savedDecks.find(d => d.id === id);
      if (target) {
          // Generate unique name
          const existingNames = state.savedDecks.map(d => d.name || "");
          const finalName = getUniqueName(target.name || "Untitled", existingNames);

          const newId = uuidv4();
          const clone = {
              ...cloneDeck(target),
              id: newId,
              name: finalName
          };
          return {
              currentDeck: clone,
              savedDecks: [...state.savedDecks, clone]
          };
      }
      return {};
  }),

  importDecks: (decks) => set((state) => ({
      savedDecks: [...state.savedDecks, ...decks.map(d => ({
          ...d,
          id: uuidv4(),
          name: d.name || "Imported Deck"
      }))]
  })),

  importTeams: (teams) => set((state) => ({
      savedTeams: [...state.savedTeams, ...teams.map(t => ({
          ...t,
          id: uuidv4(),
          name: t.name || "Imported Team"
      }))]
  })),

  setSavedDecks: (decks) => set({ savedDecks: decks }),

  renameSavedDeck: (id, newName) => set((state) => ({
      savedDecks: state.savedDecks.map(d => 
        d.id === id ? { ...d, name: newName } : d
      )
  })),

  importDeckToLibrary: (deck) => set((state) => {
      const newId = uuidv4();
      const name = deck.name || "Imported Deck";
      const newDeck = { ...cloneDeck(deck), id: newId, name };
      
      return {
          savedDecks: [...state.savedDecks, newDeck]
      };
  }),

  checkDeckNameAvailable: (name: string, excludeId?: string) => {
      const { savedDecks } = get();
      const normalizedName = name.trim().toLowerCase();
      
      return !savedDecks.some(deck => {
          if (deck.id === excludeId) return false;
          return (deck.name || "").trim().toLowerCase() === normalizedName;
      });
  },

  clearSavedDecks: () => set({ savedDecks: [] }),

  // --- Team Persistence ---

  upsertSavedTeam: (team) => set((state) => ({
      savedTeams: TeamPersistenceHelper.updateSavedTeams(state.savedTeams, team)
  })),

  deleteTeam: (id) => {
       get().checkActiveTeamDeletion([id]);
       set((state) => ({
           savedTeams: state.savedTeams.filter(t => t.id !== id),
       }));
  },

  deleteTeams: (ids) => {
       get().checkActiveTeamDeletion(ids);
       set((state) => ({
           savedTeams: state.savedTeams.filter(t => !ids.includes(t.id!)),
       }));
  },

  duplicateTeam: (id, newId) => set((state) => {
      const target = state.savedTeams.find(t => t.id === id);
      if (target) {
          const existingNames = state.savedTeams.map(t => t.name || "");
          const newTeam = TeamFactory.duplicateTeam(target, newId, existingNames);
          return { savedTeams: [...state.savedTeams, newTeam] };
      }
      return {};
  }),

  renameSavedTeam: (id, newName) => set((state) => ({
      savedTeams: state.savedTeams.map(t => 
        t.id === id ? { ...t, name: newName } : t
      )
  })),

  saveTeamAsCopy: (nameInput) => set((state) => {
      // 1. Generate New IDs
      const newTeamId = uuidv4();
      
      // 2. Resolve Name
      const existingNames = state.savedTeams.map(t => t.name || "");
      const baseName = nameInput?.trim() || state.teamName || "Untitled Team";
      const finalName = getUniqueName(baseName, existingNames);

      // 3. Deep Clone Decks with NEW IDs
      const newDecks = state.teamDecks.map(deck => ({
          ...cloneDeck(deck),
          id: uuidv4(),
          name: deck.name // Keep deck names, or could suffix them if desired
      })) as [Deck, Deck, Deck];

      // 4. Construct New Team
      const newTeam: Team = {
          id: newTeamId,
          name: finalName,
          decks: newDecks
      };

      // 5. Update State: Save and Set Active
      return {
          savedTeams: [...state.savedTeams, newTeam],
          activeTeamId: newTeamId,
          teamName: finalName,
          teamDecks: newDecks 
      };
  }),

  clearSavedTeams: () => set({ savedTeams: [] }),


});
