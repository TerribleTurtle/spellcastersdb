"use client";

import {
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useToast } from "@/hooks/useToast";
import { DRAG_CONFIG } from "@/services/config/dnd-config";
import { DragAction } from "@/services/dnd/drag-routing";
import { DragRoutingService } from "@/services/dnd/drag-routing";
import { findAutoFillSlot } from "@/services/utils/deck-utils";
import { DragData, DraggableEntity } from "@/types/dnd";

import { useDeckBuilder } from "./useDeckBuilder";

export function useDragDrop() {
  const {
    // Solo Actions
    setSlot,
    setSpellcaster,
    removeSpellcaster,
    moveSlot,
    clearSlot,
    currentDeck, // Expose for Solo Auto-Fill

    // Team Actions
    setTeamSlot,
    setTeamSpellcaster,
    removeTeamSpellcaster,
    swapTeamSlots,
    clearTeamSlot: clearTeamSlotAction,
    moveCardBetweenDecks,
    moveSpellcasterBetweenDecks,
    teamDecks,

    // State
    mode,
    activeDragItem,
    setActiveDragItem,
    closeInspector,
  } = useDeckBuilder();

  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: DRAG_CONFIG.SENSORS.MOUSE.DISTANCE },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: DRAG_CONFIG.SENSORS.TOUCH.DELAY,
        tolerance: DRAG_CONFIG.SENSORS.TOUCH.TOLERANCE,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    closeInspector(); // Close inspector when drag starts
    const current = event.active.data.current as
      | DragData<DraggableEntity>
      | undefined;

    // Safety check for typed item
    if (current && current.item) {
      setActiveDragItem(current.item);
    }
  };

  const getDeckIndex = (id?: string) => {
    if (!id || !teamDecks) return -1;
    return teamDecks.findIndex((d) => d.id === id);
  };

  const handleMoveSlot = (
    action: DragAction & { type: "MOVE_SLOT" },
    isTeamMode: boolean,
    targetDeckIndex: number
  ) => {
    if (isTeamMode) {
      const sourceDeckIndex = action.sourceDeckId
        ? getDeckIndex(action.sourceDeckId)
        : targetDeckIndex;

      let finalTargetIndex = action.targetIndex;

      // Auto-Fill Logic (Move)
      if (finalTargetIndex === -1) {
        const targetDeck = teamDecks![targetDeckIndex];
        // Use shared helper
        // We need the item to know if it is a Titan.
        // However, MOVE_SLOT action usually comes from a slot, so we might need to look up the item if not provided in action.
        // DragRoutingService adds 'item' to action for SET_SLOT mostly.
        // For MOVE_SLOT, the item is at the source.
        // We can try to assume it's a unit moving to 0-3 if finding first empty.
        // But if it's a Titan moving... we need to know.

        // Simplification: DragRoutingService *should* probably pass the item in the action or we look it up.
        // But for now, let's use the activeDragItem from state if available, or try to find it.

        if (activeDragItem) {
          finalTargetIndex = findAutoFillSlot(targetDeck, activeDragItem);
        } else {
          // Fallback: If we don't know the item, we can only default to first empty unit slot (0-3).
          // Titan moves might fail this fallback if drag item state is lost.
          // But activeDragItem should be set.
          const firstEmpty = targetDeck.slots.find(
            (s) => !s.unit && s.index < 4
          );
          finalTargetIndex = firstEmpty ? firstEmpty.index : -1;
        }

        if (finalTargetIndex === -1) {
          showToast("Deck is full", "error");
          return;
        }
      }

      if (sourceDeckIndex !== -1 && sourceDeckIndex !== targetDeckIndex) {
        const error = moveCardBetweenDecks(
          sourceDeckIndex,
          action.sourceIndex,
          targetDeckIndex,
          finalTargetIndex
        );
        if (error) {
          showToast(error, "error");
        }
      } else {
        if (finalTargetIndex !== -1)
          swapTeamSlots(targetDeckIndex, action.sourceIndex, finalTargetIndex);
      }
    } else {
      // Solo Mode Move
      if (action.targetIndex !== -1)
        moveSlot(action.sourceIndex, action.targetIndex);
    }
  };

  const handleSetSlot = (
    action: DragAction & { type: "SET_SLOT" },
    isTeamMode: boolean,
    targetDeckIndex: number
  ) => {
    let finalIndex = action.index;

    if (isTeamMode) {
      if (finalIndex === -1) {
        const targetDeck = teamDecks![targetDeckIndex];
        finalIndex = findAutoFillSlot(targetDeck, action.item);

        if (finalIndex === -1) {
          showToast("Deck is full", "error");
          return;
        }
      }
      setTeamSlot(targetDeckIndex, finalIndex, action.item);
    } else {
      // Solo Mode
      if (finalIndex === -1 && currentDeck) {
        finalIndex = findAutoFillSlot(currentDeck, action.item);

        if (finalIndex === -1) {
          showToast("Deck is full", "error");
          return;
        }
      }

      if (finalIndex !== -1) {
        setSlot(finalIndex, action.item);
      }
    }
  };

  const handleSpellcasterAction = (
    action: DragAction,
    type: "SET" | "REMOVE",
    isTeamMode: boolean,
    targetDeckIndex: number
  ) => {
    if (type === "SET" && action.type === "SET_SPELLCASTER") {
      if (isTeamMode) {
        const sourceDeckIndex = action.sourceDeckId
          ? getDeckIndex(action.sourceDeckId)
          : -1;

        if (sourceDeckIndex !== -1 && sourceDeckIndex !== targetDeckIndex) {
          moveSpellcasterBetweenDecks(sourceDeckIndex, targetDeckIndex);
        } else {
          setTeamSpellcaster(targetDeckIndex, action.item);
        }
      } else {
        setSpellcaster(action.item);
      }
    } else if (type === "REMOVE" && action.type === "REMOVE_SPELLCASTER") {
      if (isTeamMode && action.deckId) {
        const idx = getDeckIndex(action.deckId);
        if (idx !== -1) removeTeamSpellcaster(idx);
      } else {
        removeSpellcaster();
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Capture Drag Item before clearing it (needed for logic)
    // We already have activeDragItem in state, but let's be safe

    const action = DragRoutingService.determineAction(active, over);

    // Clear drag item state *after* processing could be better, but existing logic cleared it early.
    // For our refactor, we rely on activeDragItem being present in scope or passed.
    // However, react state updates are async. `activeDragItem` is from the hook scope (previous render).
    // So it should still be valid during this function execution even if we call setActiveDragItem(null).
    setActiveDragItem(null);

    if (action.type === "NO_OP") return;

    const isTeamMode = mode === "TEAM" && !!action.deckId;
    const targetDeckIndex = isTeamMode ? getDeckIndex(action.deckId) : -1;

    // Guard: If in team mode but can't find deck, abort
    if (
      isTeamMode &&
      targetDeckIndex === -1 &&
      action.type !== "REMOVE_SPELLCASTER"
    ) {
      showToast("Invalid Drop Target", "error");
      return;
    }

    switch (action.type) {
      case "MOVE_SLOT":
        handleMoveSlot(action, isTeamMode, targetDeckIndex);
        break;
      case "SET_SLOT":
        handleSetSlot(action, isTeamMode, targetDeckIndex);
        break;
      case "CLEAR_SLOT":
        if (isTeamMode) {
          const deckIdx = action.deckId ? getDeckIndex(action.deckId) : -1;
          if (deckIdx !== -1) clearTeamSlotAction(deckIdx, action.index);
        } else {
          clearSlot(action.index);
        }
        break;
      case "SET_SPELLCASTER":
        handleSpellcasterAction(action, "SET", isTeamMode, targetDeckIndex);
        break;
      case "REMOVE_SPELLCASTER":
        handleSpellcasterAction(action, "REMOVE", isTeamMode, targetDeckIndex);
        break;
      default:
        break;
    }
  };

  const handleDragCancel = () => {
    setActiveDragItem(null);
    showToast("Drag cancelled", "info");
  };

  return {
    sensors,
    activeDragItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
