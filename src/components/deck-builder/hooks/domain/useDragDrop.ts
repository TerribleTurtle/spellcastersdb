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

import { useDeckBuilder } from "./useDeckBuilder";
import { DragRoutingService, extractDragItem } from "@/services/dnd/drag-routing";

export function useDragDrop() {
  const {
    // Solo Actions
    setSlot,
    setSpellcaster,
    removeSpellcaster,
    moveSlot,
    clearSlot,

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
    closeInspector
  } = useDeckBuilder();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    closeInspector(); // Close inspector when drag starts
    const item = extractDragItem(event.active.data.current);
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    const action = DragRoutingService.determineAction(active, over);

    if (action.type === 'NO_OP') return;

    // Helper to find deck index by ID
    const getDeckIndex = (id?: string) => {
        if (!id || !teamDecks) return -1;
        return teamDecks.findIndex(d => d.id === id);
    };

    const isTeamMode = mode === "TEAM" && action.deckId;
    const targetDeckIndex = isTeamMode ? getDeckIndex(action.deckId) : -1;

    // Guard: If in team mode but can't find deck, abort (or fallback?)
    if (isTeamMode && targetDeckIndex === -1) {
        console.warn("Dropped onto unknown deck in Team Mode", action.deckId);
        return;
    }

    switch (action.type) {
      case 'MOVE_SLOT':
        if (isTeamMode) {
             const sourceDeckIndex = action.sourceDeckId ? getDeckIndex(action.sourceDeckId) : targetDeckIndex;
             
             if (sourceDeckIndex !== -1 && sourceDeckIndex !== targetDeckIndex) {
                 moveCardBetweenDecks(sourceDeckIndex, action.sourceIndex, targetDeckIndex, action.targetIndex);
             } else {
                 swapTeamSlots(targetDeckIndex, action.sourceIndex, action.targetIndex);
             }
        } else {
             moveSlot(action.sourceIndex, action.targetIndex);
        }
        break;
      case 'SET_SLOT':
        if (isTeamMode) {
             setTeamSlot(targetDeckIndex, action.index, action.item);
        } else {
             setSlot(action.index, action.item);
        }
        break;
      case 'CLEAR_SLOT':
        if (isTeamMode) {
             clearTeamSlotAction(targetDeckIndex, action.index);
        } else {
             clearSlot(action.index);
        }
        break;
      case 'SET_SPELLCASTER':
        if (isTeamMode) {
             const sourceDeckIndex = action.sourceDeckId ? getDeckIndex(action.sourceDeckId) : -1;
             
             if (sourceDeckIndex !== -1 && sourceDeckIndex !== targetDeckIndex) {
                 moveSpellcasterBetweenDecks(sourceDeckIndex, targetDeckIndex);
             } else {
                 setTeamSpellcaster(targetDeckIndex, action.item);
             }
        } else {
             setSpellcaster(action.item);
        }
        break;
      case 'REMOVE_SPELLCASTER':
        // For remove, we might need to know WHICH deck if dragged from a slot
        // DragRoutingService returns NO_OP if dropped into void usually, unless we specifically handle "drag away to remove"
        // But the current logic for REMOVE_SPELLCASTER is "Drag started from spellcaster slot, dropped into void"
        // In Team Mode, we assume the active drag item data knows its source deck? 
        // ActiveDragData now has `deckId`.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sourceDeckId = (active.data.current as any)?.deckId;
        if (mode === "TEAM" && sourceDeckId) {
             const idx = getDeckIndex(sourceDeckId);
             if (idx !== -1) removeTeamSpellcaster(idx);
        } else {
             removeSpellcaster();
        }
        break;
      default:
        break;
    }
  };

  return {
    sensors,
    activeDragItem,
    handleDragStart,
    handleDragEnd,
  };
}
