"use client";

import { useEffect } from "react";
import { useDeckStore } from "@/store/index";
import { cloneDeck } from "@/services/deck-utils";
import { Team } from "@/types/deck";
import { TEAM_LIMIT } from "@/services/config/constants";

/**
 * Manages side-effects for the Deck Store.
 * Specifically handles synchronizing the "Current Deck" (Solo Mode/Edit Mode)
 * back to the "Team Decks" when in Team Mode.
 */
export function useDeckSync() {
  useEffect(() => {
    // Subscribe to changes in currentDeck
    const unsub = useDeckStore.subscribe(
      (state) => state.currentDeck,
      (currentDeck) => {
        const state = useDeckStore.getState();
        const { activeSlot, teamDecks } = state;

        // If we are editing a slot (0 to TEAM_LIMIT-1)
        if (activeSlot !== null && activeSlot >= 0 && activeSlot < TEAM_LIMIT) {
            
          // If the deck in the slot is different from the current working deck
          if (teamDecks[activeSlot] !== currentDeck) {
            const newTeamDecks = [...teamDecks] as Team["decks"];
            // Use cloneDeck to ensure we don't hold references to the active editing state
            newTeamDecks[activeSlot] = cloneDeck(currentDeck);
            
            // update the team decks without triggering a full re-render loop
            useDeckStore.setState({ teamDecks: newTeamDecks });
          }
        }
      }
    );

    return () => {
      unsub();
    };
  }, []);
}
