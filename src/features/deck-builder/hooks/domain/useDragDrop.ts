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
import { useToast } from "@/hooks/useToast";
import { DragRoutingService } from "@/services/dnd/drag-routing";
import { DragData } from "@/types/dnd";
import { Unit, Spell, Titan } from "@/types/api";

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
    closeInspector
  } = useDeckBuilder();

  const { showToast } = useToast();

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
    const current = event.active.data.current as DragData | undefined;
    
    // Safety check for typed item
    if (current && current.item) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveDragItem(current.item as any);
    }
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

    const isTeamMode = mode === "TEAM" && !!action.deckId;
    
    const targetDeckIndex = isTeamMode ? getDeckIndex(action.deckId) : -1;

    // Guard: If in team mode but can't find deck, abort
    if (isTeamMode && targetDeckIndex === -1 && action.type !== 'REMOVE_SPELLCASTER') {
        console.warn("Dropped onto unknown deck in Team Mode", action.deckId);
        return;
    }

    switch (action.type) {
      case 'MOVE_SLOT':
        if (isTeamMode) {
             const sourceDeckIndex = action.sourceDeckId ? getDeckIndex(action.sourceDeckId) : targetDeckIndex;
             
             // Target Index -1 means "Auto - Find Empty"
             let finalTargetIndex = action.targetIndex;
             
             if (finalTargetIndex === -1) {
                 const targetDeck = teamDecks![targetDeckIndex];
                 // Find first empty non-titan slot (0-3)
                 // TODO: Handle Titan move intelligently if needed
                 const firstEmpty = targetDeck.slots.find(s => !s.unit && s.index < 4); 
                 
                 if (firstEmpty) {
                     finalTargetIndex = firstEmpty.index;
                 } else {
                     showToast("Deck is full", "error");
                     return;
                 }
             }

             if (sourceDeckIndex !== -1 && sourceDeckIndex !== targetDeckIndex) {
                 const error = moveCardBetweenDecks(sourceDeckIndex, action.sourceIndex, targetDeckIndex, finalTargetIndex);
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
        break;
      case 'SET_SLOT':
        if (isTeamMode) {
             let finalIndex = action.index;
             if (finalIndex === -1) {
                 // Auto-Fill Logic
                 const targetDeck = teamDecks![targetDeckIndex];
                 const isTitan = (action.item as Titan).category === "Titan";
                 
                 if (isTitan) {
                     finalIndex = 4; // Titan Slot
                 } else {
                     const firstEmpty = targetDeck.slots.find(s => !s.unit && s.index < 4);
                     if (firstEmpty) finalIndex = firstEmpty.index;
                 }
                 
                 if (finalIndex === -1) {
                      showToast("Deck is full", "error");
                      return;
                 }
             }
             setTeamSlot(targetDeckIndex, finalIndex, action.item);
        } else {
             // Solo Mode SET
             let finalIndex = action.index;

             if (finalIndex === -1 && currentDeck) {
                 // Auto-Fill for Solo
                 const isTitan = (action.item as Titan).category === "Titan";
                 if (isTitan) {
                     finalIndex = 4;
                 } else {
                     const firstEmpty = currentDeck.slots.find(s => !s.unit && s.index < 4);
                     if (firstEmpty) finalIndex = firstEmpty.index;
                 }

                 if (finalIndex === -1) {
                      showToast("Deck is full", "error");
                      return;
                 }
             }

             if (finalIndex !== -1) {
                setSlot(finalIndex, action.item);
             }
        }
        break;
      case 'CLEAR_SLOT':
        if (isTeamMode) {
             const deckIdx = action.deckId ? getDeckIndex(action.deckId) : -1;
             if (deckIdx !== -1) clearTeamSlotAction(deckIdx, action.index);
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
        if (isTeamMode && action.deckId) {
             const idx = getDeckIndex(action.deckId);
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
