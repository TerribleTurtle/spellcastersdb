import { StateCreator } from "zustand";

import { TEAM_LIMIT } from "@/services/config/constants";
import { EditorSyncService } from "@/services/domain/team/EditorSyncService";
import { TeamFactory } from "@/services/domain/team/TeamFactory";
import { TeamModification } from "@/services/domain/team/TeamModification";
import { TeamMovement } from "@/services/domain/team/TeamMovement";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Team } from "@/types/deck";

import { DeckBuilderState, TeamState } from "./types";

export const createTeamSlice: StateCreator<
  DeckBuilderState,
  [],
  [],
  TeamState
> = (set, get) => ({
  teamName: "New Team",
  activeTeamId: null,
  activeSlot: null,
  teamDecks: TeamFactory.createInitialTeamDecks(),

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
  setActiveSlot: (index) =>
    set((state) => {
      if (index === null) {
        // Exiting edit mode
        return { activeSlot: null };
      }
      if (index >= 0 && index < TEAM_LIMIT) {
        // Entering edit mode:
        // 1. Sync the Team Deck to the Global "currentDeck" (Solo/Editor State)
        // This ensures the Inspector, Validation, and other editor components work on this deck.
        const selectedDeck = state.teamDecks[index];

        return {
          activeSlot: index,
          currentDeck: cloneDeck(selectedDeck), // Critical Fix: Load deck into editor
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
  saveTeam: (newId, nameInput, activeSlot, activeDeckOverride) => {
    const state = get();
    const targetId = state.activeTeamId || newId;
    const nameToUse = nameInput?.trim() || state.teamName || "Untitled Team";

    const newTeam = TeamFactory.constructTeam(
      targetId,
      nameToUse,
      state.teamDecks,
      activeSlot ?? null,
      activeDeckOverride
    );

    state.upsertSavedTeam(newTeam);

    set({
      teamName: newTeam.name,
      activeTeamId: targetId,
      teamDecks: newTeam.decks,
    });
  },

  loadTeam: (id) => {
    const target = get().savedTeams.find((t) => t.id === id);
    if (target) {
      set({
        teamName: target.name,
        activeTeamId: target.id || null,
        teamDecks: target.decks.map((d) => cloneDeck(d)) as Team["decks"],
      });
    }
  },

  importSoloDeckToTeam: (slotIndex, deck, newId) =>
    set((state) => {
      const result = TeamModification.importDeck(
        state.teamDecks,
        slotIndex,
        deck,
        newId
      );
      if (result.success && result.data) {
        // Import implies overwriting a slot, so we might need to sync if that slot is active
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),

  loadTeamFromData: (decks, newIds) =>
    set((state) => {
      const { teamDecks, teamName } = TeamFactory.prepareImportedTeam(
        decks,
        newIds,
        state.teamName
      );

      return {
        teamDecks,
        activeTeamId: null,
        teamName,
      };
    }),

  clearTeam: () =>
    set({
      teamName: "New Team",
      activeTeamId: null,
      teamDecks: TeamFactory.createInitialTeamDecks(),
    }),

  exportTeamSlotToSolo: (_slotIndex, deck, newId) => {
    const newDeck = TeamModification.exportDeck(deck, newId);
    get().importDeckToLibrary(newDeck);
  },

  checkActiveTeamDeletion: (ids) =>
    set((state) => {
      // If the currently active team is in the deleted list, close it
      if (state.activeTeamId && ids.includes(state.activeTeamId)) {
        return {
          activeTeamId: null,
          teamName: "New Team",
          teamDecks: TeamFactory.createInitialTeamDecks(),
        };
      }
      return {};
    }),

  /**
   * Team Slot Logic
   * Wraps DeckRules to modify a specific deck within the teamDecks array.
   */
  setTeamSlot: (deckIndex, slotIndex, item) =>
    set((state) => {
      const result = TeamModification.setSlot(
        state.teamDecks,
        deckIndex,
        slotIndex,
        item
      );
      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),

  clearTeamSlot: (deckIndex, slotIndex) =>
    set((state) => {
      const result = TeamModification.clearSlot(
        state.teamDecks,
        deckIndex,
        slotIndex
      );
      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),

  setTeamSpellcaster: (deckIndex, item) =>
    set((state) => {
      const result = TeamModification.setSpellcaster(
        state.teamDecks,
        deckIndex,
        item
      );
      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),

  removeTeamSpellcaster: (deckIndex) =>
    set((state) => {
      const result = TeamModification.removeSpellcaster(
        state.teamDecks,
        deckIndex
      );
      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),

  swapTeamSlots: (deckIndex, indexA, indexB) =>
    set((state) => {
      const result = TeamModification.swapSlots(
        state.teamDecks,
        deckIndex,
        indexA,
        indexB
      );
      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),

  quickAddToTeam: (slotIndex, item) => {
    let error: string | null = null;
    set((state) => {
      const result = TeamModification.quickAdd(
        state.teamDecks,
        slotIndex,
        item
      );

      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }

      if (result.error) {
        error = result.error;
      }
      return {};
    });
    return error;
  },

  moveCardBetweenDecks: (
    sourceDeckIndex,
    sourceSlotIndex,
    targetDeckIndex,
    targetSlotIndex
  ) => {
    let error: string | null = null;
    set((state) => {
      const result = TeamMovement.moveCardBetweenDecks(
        state.teamDecks,
        sourceDeckIndex,
        sourceSlotIndex,
        targetDeckIndex,
        targetSlotIndex
      );

      if (result.success && result.data) {
        // Note: syncToEditor handles if we are editing EITHER source or target,
        // because it only cares about `state.activeSlot`.
        // If activeSlot is source, it syncs source. If activeSlot is target, it syncs target.
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }

      if (result.error) {
        error = result.error;
      }
      return {};
    });
    return error;
  },

  moveSpellcasterBetweenDecks: (sourceDeckIndex, targetDeckIndex) =>
    set((state) => {
      const result = TeamMovement.moveSpellcasterBetweenDecks(
        state.teamDecks,
        sourceDeckIndex,
        targetDeckIndex
      );

      if (result.success && result.data) {
        return EditorSyncService.getSyncUpdate(state.activeSlot, result.data);
      }
      return {};
    }),
});
