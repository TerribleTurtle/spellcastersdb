"use client";

import { useShallow } from "zustand/react/shallow";

import { useSoloBuilder } from "@/features/deck-builder/hooks/useSoloBuilder";
import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useDeckStore } from "@/store/index";
import { UnifiedEntity } from "@/types/api";
import { EntityCategory } from "@/types/enums";

/**
 * Primary hook for Deck Builder logic.
 *
 * @pattern Facade
 *
 * Acts as a centralized facade over `useSoloBuilder`, `useTeamBuilder`, and the global store.
 * It provides a unified interface for the UI components, shielding them from the complexity
 * of the underlying simplified hooks.
 *
 * Maintains backward compatibility while delegating logic to specialized hooks.
 *
 * @returns {Object} The complete Deck Builder state and action methods.
 */
export function useDeckBuilder() {
  const solo = useSoloBuilder();
  const team = useTeamBuilder();

  const ui = useDeckStore(
    useShallow((state) => ({
      // UI State (Global)
      mode: state.mode,
      setMode: state.setMode,
      activeDragItem: state.activeDragItem,
      setActiveDragItem: state.setActiveDragItem,
      closeInspector: state.closeInspector, // Expose for drag-to-close logic
    }))
  );

  // Intercept quickAdd for Team Mode
  const quickAdd = (item: UnifiedEntity) => {
    if (item.category === EntityCategory.Consumable)
      return "Consumables cannot be added to decks.";
    if (item.category === EntityCategory.Upgrade)
      return "Upgrades cannot be added to decks.";

    // Check Mode from Store (not from `ui` obj which is partial)
    const isTeamMode = useDeckStore.getState().mode === "TEAM";

    if (isTeamMode) {
      const { activeSlot } = useDeckStore.getState();
      // If we have a valid slot, add to team
      if (typeof activeSlot === "number" && activeSlot >= 0) {
        return team.quickAddToTeam(activeSlot, item);
      }
      // Fallback: If no slot selected in team mode, maybe do nothing or error?
      return "Select a deck slot first!";
    }

    return solo.quickAdd(item);
  };

  return {
    ...solo,
    ...team,
    ...ui,
    quickAdd, // Override solo.quickAdd
    isInitialized: true,
  };
}
