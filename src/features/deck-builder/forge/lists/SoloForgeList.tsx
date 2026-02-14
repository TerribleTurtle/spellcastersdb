"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import { Virtuoso } from "react-virtuoso";

import { Deck } from "@/types/deck";
import { useDeckStore } from "@/store/index";
import { DeckRow } from "@/features/deck-builder/shared/rows/DeckRow";
import { useSoloBuilder } from "@/features/deck-builder/hooks/useSoloBuilder";
import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useToast } from "@/hooks/useToast";

interface SoloForgeListProps {
  isTeamMode: boolean;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function SoloForgeList({
  isTeamMode, 
  selectionMode = false,
  selectedIds,
  onToggleSelect
}: SoloForgeListProps) {
  const { 
      savedDecks: savedDecksList, 
      currentDeck,
      loadDeck,
      deleteDeck,
      duplicateDeck,
      reorderDecks,
      renameSavedDeck,
      clearDeck
  } = useSoloBuilder();

  const {
      activeSlot,
      importSoloDeckToTeam,
  } = useTeamBuilder();
  
  const { showToast } = useToast();

  const activeDeckId = !isTeamMode ? currentDeck?.id : undefined;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
       if (reorderDecks && !selectionMode) {
          const oldIndex = savedDecksList.findIndex((d) => d.id === active.id);
          const newIndex = savedDecksList.findIndex((d) => d.id === over.id);
          reorderDecks(arrayMove(savedDecksList, oldIndex, newIndex));
       }
    }
  };

  // Direct store access for UI control
  const closeCommandCenter = useDeckStore(s => s.closeCommandCenter);

  const handleLoadOrImport = (deck: Deck) => {
    if (isTeamMode) {
        if (activeSlot === null || activeSlot < 0) {
            showToast("Please select a team slot first.");
            return;
        }

        // Generate a new ID when importing to avoid collisions with the original solo deck.
        importSoloDeckToTeam(activeSlot, deck, uuidv4());
        showToast(`Imported ${deck.name} to active slot.`);
        closeCommandCenter();
    } else {
        // Load Logic
        if (deck.id) {
            loadDeck(deck.id);
            closeCommandCenter();
        }
    }
  };

  return (
    <div className="flex-1 h-full px-3 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
            {savedDecksList.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                <p className="mb-2">No saved decks.</p>
                <span className="text-[10px] text-gray-700 block mb-2">
                   Decks are saved in your browser&apos;s local storage.
                </span>
              </div>
            ) : (
              <SortableContext
                items={savedDecksList.map((d) => d.id!)}
                strategy={verticalListSortingStrategy}
              >
                 <Virtuoso
                    style={{ height: "100%" }}
                    data={savedDecksList}
                    computeItemKey={(_, item) => item.id!}
                    itemContent={(_, d) => (
                       <div className="pb-1 pr-1">
                          <DeckRow
                            // Key is handled by Virtuoso via computeItemKey, but passing explicit key is safe/good practice
                            key={d.id}
                            deck={d}
                            isActive={activeDeckId === d.id}
                            isTeamMode={isTeamMode}
                            onLoad={() => handleLoadOrImport(d)}
                            onPutAway={!isTeamMode ? () => {
                                clearDeck();
                            } : undefined}
                            onDelete={() => deleteDeck(d.id!)}
                            onDuplicate={() => duplicateDeck(d.id!)}
                            onRename={(newName) => renameSavedDeck(d.id!, newName)}
                            
                            // Selection Props
                            selectionMode={selectionMode}
                            isSelected={selectedIds?.has(d.id!)}
                            onToggleSelect={() => onToggleSelect?.(d.id!)}
                          />
                       </div>
                    )}
                 />
              </SortableContext>
            )}
        </DndContext>
    </div>
  );
}
