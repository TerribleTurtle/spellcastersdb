import { StateCreator } from "zustand";

import { DeckBuilderState, TeamState } from "./types";
import { cloneDeck } from "@/services/deck-utils";
import { Team } from "@/types/deck";
import { TEAM_LIMIT } from "@/services/config/constants";
import { TeamService } from "@/services/logic/TeamService";
import { getUniqueName } from "@/services/naming-utils";
import { DeckRules } from "@/services/rules/deck-rules";

export const createTeamSlice: StateCreator<
  DeckBuilderState,
  [], 
  [], 
  TeamState
> = (set) => ({
  teamName: "New Team",
  activeTeamId: null,
  activeSlot: null,
  teamDecks: TeamService.createInitialTeamDecks(),
  savedTeams: [],

  setTeamName: (name) => set({ teamName: name }),
  setActiveTeamId: (id) => set({ activeTeamId: id }),
  setTeamDecks: (decks) => set({ teamDecks: decks }),
  
  /**
   * Sets the active slot for editing a deck within a team.
   * 
   * @param index - The index of the slot to edit (0-2), or null to stop editing.
   * 
   * @remarks
   * When checking out a slot (index != null), this action explicitly couples
   * the Team state with the Solo state by updating `currentDeck`.
   * This allows the main `DeckEditor` component, which observes `currentDeck`,
   * to seamlessly edit the selected team slot without needing a separate editor mode.
   */
  setActiveSlot: (index) => set(() => {
      if (index === null) {
          // Exiting edit mode
          return { activeSlot: null };
      }
      if (index >= 0 && index < TEAM_LIMIT) {
          // Entering edit mode
          return { 
              activeSlot: index,
          };
      }
      return {};
  }),

  /**
   * Saves the current team state to the savedTeams list.
   * 
   * @param newId - A new UUID to use if creating a brand new team.
   * @param nameInput - (Optional) Name override.
   * @param activeSlot - (Optional) The slot currently being edited, to ensure the latest deck content is saved.
   * @param activeDeckOverride - (Optional) The latest deck content from the main editor.
   */
  saveTeam: (newId, nameInput, activeSlot, activeDeckOverride) => set((state) => {
      // Determine if we are updating an existing team or creating a new one
      const targetId = state.activeTeamId || newId;
      const nameToUse = nameInput?.trim() || state.teamName || "Untitled Team";

      const newTeam = TeamService.constructTeam(
          targetId, 
          nameToUse,
          state.teamDecks,
          activeSlot ?? null, // Ensure null if undefined
          activeDeckOverride
      );

      const newSavedTeams = TeamService.updateSavedTeams(state.savedTeams, newTeam);

      return {
          teamName: newTeam.name,
          activeTeamId: targetId,
          teamDecks: newTeam.decks,
          savedTeams: newSavedTeams
      };
  }),

  loadTeam: (id) => set((state) => {
      const target = state.savedTeams.find(t => t.id === id);
      if (target) {
          return {
              teamName: target.name,
              activeTeamId: target.id || null,
              teamDecks: target.decks.map(d => cloneDeck(d)) as Team["decks"]
          };
      }
      return {};
  }),

  deleteTeam: (id) => set((state) => ({
       savedTeams: state.savedTeams.filter(t => t.id !== id),
  })),

  deleteTeams: (ids) => set((state) => ({
       savedTeams: state.savedTeams.filter(t => !ids.includes(t.id!)),
       // If active team is deleted, reset active team id
       activeTeamId: (state.activeTeamId && ids.includes(state.activeTeamId))
          ? null 
          : state.activeTeamId
  })),

  duplicateTeam: (id, newId) => set((state) => {
      const target = state.savedTeams.find(t => t.id === id);
      if (target) {
          // Generate unique name
          const existingNames = state.savedTeams.map(t => t.name || "");
          const finalName = getUniqueName(target.name || "Untitled Team", existingNames);

          const newTeam = {
              ...TeamService.prepareDuplicate(target, newId),
              name: finalName
          };
          return { savedTeams: [...state.savedTeams, newTeam] };
      }
      return {};
  }),

  importSoloDeckToTeam: (slotIndex, deck, newId) => set((state) => {
      const newDecks = [...state.teamDecks] as Team["decks"];
      newDecks[slotIndex] = {
          ...cloneDeck(deck),
          id: newId
      };
      return { teamDecks: newDecks };
  }),

  loadTeamFromData: (decks, newIds) => set((state) => {
       const { teamDecks, teamName } = TeamService.prepareImportedTeam(decks, newIds, state.teamName);
       
       return {
           teamDecks,
           activeTeamId: null,
           teamName,
       };
  }),

  clearTeam: () => set({
      teamName: "New Team",
      activeTeamId: null,
      teamDecks: TeamService.createInitialTeamDecks()
  }),

  exportTeamSlotToSolo: (_slotIndex, deck, newId) => set((state) => {
       const newDeck = {
           ...deck,
           id: newId,
           name: `${deck.name} (From Team)`
       };
       return { savedDecks: [...state.savedDecks, newDeck] };
  }),


  /**
   * Team Slot Logic 
   * Wraps DeckRules to modify a specific deck within the teamDecks array.
   */
  setTeamSlot: (deckIndex, slotIndex, item) => set((state) => {
      const targetDeck = state.teamDecks[deckIndex];
      if (!targetDeck) return {};

      const result = DeckRules.setSlot(targetDeck, slotIndex, item);
      if (result.success && result.data) {
          const newDecks = [...state.teamDecks] as Team["decks"];
          newDecks[deckIndex] = result.data;
          
          // Sync with Current Deck if active
          const changes: Partial<DeckBuilderState> = { teamDecks: newDecks };
          return changes;
      }
      return {};
  }),

  clearTeamSlot: (deckIndex, slotIndex) => set((state) => {
      const targetDeck = state.teamDecks[deckIndex];
      if (!targetDeck) return {};

      const newDeck = cloneDeck(targetDeck);
      newDeck.slots[slotIndex].unit = null;

      const newDecks = [...state.teamDecks] as Team["decks"];
      newDecks[deckIndex] = newDeck;

      const changes: Partial<DeckBuilderState> = { teamDecks: newDecks };
      return changes;
  }),

  setTeamSpellcaster: (deckIndex, item) => set((state) => {
       const targetDeck = state.teamDecks[deckIndex];
       if (!targetDeck) return {};

       const newDeck = DeckRules.setSpellcaster(targetDeck, item);
       const newDecks = [...state.teamDecks] as Team["decks"];
       newDecks[deckIndex] = newDeck;

       const changes: Partial<DeckBuilderState> = { teamDecks: newDecks };
       return changes;
  }),

  removeTeamSpellcaster: (deckIndex) => set((state) => {
       const targetDeck = state.teamDecks[deckIndex];
       if (!targetDeck) return {};

       const newDeck = DeckRules.removeSpellcaster(targetDeck);
       const newDecks = [...state.teamDecks] as Team["decks"];
       newDecks[deckIndex] = newDeck;

       const changes: Partial<DeckBuilderState> = { teamDecks: newDecks };
       return changes;
  }),

  swapTeamSlots: (deckIndex, indexA, indexB) => set((state) => {
       const targetDeck = state.teamDecks[deckIndex];
       if (!targetDeck) return {};

       const result = DeckRules.swapSlots(targetDeck, indexA, indexB);
       if (result.success && result.data) {
           const newDecks = [...state.teamDecks] as Team["decks"];
           newDecks[deckIndex] = result.data;

           const changes: Partial<DeckBuilderState> = { teamDecks: newDecks };
           return changes;
       }
       return {};
  }),

  renameSavedTeam: (id, newName) => set((state) => ({
      savedTeams: state.savedTeams.map(t => 
        t.id === id ? { ...t, name: newName } : t
      )
  })),

  clearSavedTeams: () => set({ savedTeams: [] }),

  quickAddToTeam: (slotIndex, item) => {
      let error: string | null = null;
      set((state) => {
          const targetDeck = state.teamDecks[slotIndex];
          if (!targetDeck) {
              error = "Invalid team slot";
              return {};
          }

          const result = DeckRules.quickAdd(targetDeck, item);
          if (result.success && result.data) {
              const newDecks = [...state.teamDecks] as Team["decks"];
              newDecks[slotIndex] = result.data;
              
              const changes: Partial<DeckBuilderState> = { teamDecks: newDecks };
              return changes;
          }
          
          if (result.error) {
              error = result.error;
          }
          return {};
      });
      return error;
  },

  moveCardBetweenDecks: (sourceDeckIndex, sourceSlotIndex, targetDeckIndex, targetSlotIndex) => set((state) => {
      const result = TeamService.moveCardBetweenDecks(
          state.teamDecks,
          sourceDeckIndex,
          sourceSlotIndex,
          targetDeckIndex,
          targetSlotIndex
      );

      if (result.success && result.data) {
          const changes: Partial<DeckBuilderState> = { teamDecks: result.data };
          return changes;
      }
      return {}; // No-op on failure (or maybe log error?)
  }),

  moveSpellcasterBetweenDecks: (sourceDeckIndex, targetDeckIndex) => set((state) => {
      const result = TeamService.moveSpellcasterBetweenDecks(
          state.teamDecks,
          sourceDeckIndex,
          targetDeckIndex
      );

      if (result.success && result.data) {
          return { teamDecks: result.data };
      }
      return {};
  }),
});
