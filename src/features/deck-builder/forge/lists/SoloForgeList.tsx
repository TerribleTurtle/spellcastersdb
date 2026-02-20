"use client";

import React from "react";
import { Virtuoso } from "react-virtuoso";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Ghost } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { useSoloBuilder } from "@/features/deck-builder/hooks/useSoloBuilder";
import { DeckRow } from "@/features/deck-builder/shared/rows/DeckRow";
import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useToast } from "@/hooks/useToast";
import { useDeckStore } from "@/store/index";
import { Deck } from "@/types/deck";

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
  onToggleSelect,
}: SoloForgeListProps) {
  const {
    savedDecks: savedDecksList,
    currentDeck,
    loadDeck,
    deleteDeck,
    duplicateDeck,
    reorderDecks,
    renameSavedDeck,
    clearDeck,
  } = useSoloBuilder();

  const { activeSlot, importSoloDeckToTeam } = useTeamBuilder();

  const { showToast } = useToast();

  const activeDeckId = !isTeamMode ? currentDeck?.id : undefined;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
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
  const closeCommandCenter = useDeckStore((s) => s.closeCommandCenter);

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
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-surface-card flex items-center justify-center mb-4 border border-border-default">
              <Ghost size={32} className="text-text-dimmed opacity-50" />
            </div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
              No Saved Decks
            </h3>
            <p className="text-xs text-text-dimmed max-w-[200px] mb-4">
              Your library is empty. Create a deck to get started.
            </p>
            <p className="text-[10px] text-text-faint uppercase tracking-widest font-bold">
              Locally Saved
            </p>
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
                    onPutAway={
                      !isTeamMode
                        ? () => {
                            clearDeck();
                          }
                        : undefined
                    }
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
