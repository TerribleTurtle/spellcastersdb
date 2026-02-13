"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
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
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { TeamRow } from "@/components/deck-builder/shared/rows/TeamRow";
import { useTeamBuilder } from "@/components/deck-builder/hooks/domain/useTeamBuilder";
import { useDeckStore } from "@/store/index";

interface TeamForgeListProps {
  justSaved?: boolean;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function TeamForgeList({
  justSaved,
  selectionMode = false,
  selectedIds,
  onToggleSelect
}: TeamForgeListProps) {
  const { 
      savedTeams, 
      loadTeam, 
      deleteTeam, 
      duplicateTeam,
      renameSavedTeam,
      activeTeamId,
      clearTeam
  } = useTeamBuilder();

  const currentTeam = React.useMemo(() => 
    savedTeams.find(t => t.id === activeTeamId), 
  [savedTeams, activeTeamId]);

  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (justSaved && listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [justSaved]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const closeCommandCenter = useDeckStore(s => s.closeCommandCenter);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 overscroll-y-contain">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={() => {}} // No-op for Teams currently
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <div className="space-y-1">
              {savedTeams.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  <p className="mb-2">No saved teams.</p>
                  <span className="text-[10px] text-gray-700 block mb-2">
                    Build your team and save it below.
                  </span>
                </div>
              ) : (
                <SortableContext
                  items={savedTeams.map((t) => t.id!)}
                  strategy={verticalListSortingStrategy}
                >
                  {savedTeams.map((t) => (
                    <TeamRow
                      key={t.id}
                      team={t}
                      onLoad={() => {
                          loadTeam(t.id!);
                          closeCommandCenter();
                      }}
                      onDelete={() => deleteTeam(t.id!)}
                      onDuplicate={() => duplicateTeam(t.id!, crypto.randomUUID())}
                      onRename={(newName) => renameSavedTeam(t.id!, newName)}
                      
                      // Selection Props
                      selectionMode={selectionMode}
                      isSelected={selectedIds?.has(t.id!)}
                      onToggleSelect={() => onToggleSelect?.(t.id!)}
                      
                      // Active State
                      // We need to know the active team ID. `useTeamBuilder` might have it.
                      // Checking useTeamBuilder hook usage... 
                      // It exposes `currentTeam` or similar? 
                      // actually `useTeamBuilder` returns `currentTeam`.
                      // Let's use `currentTeam?.id === t.id`.
                      // But `currentTeam` is not destructured above.
                      // Let's add it to destructuring.
                      isActive={currentTeam?.id === t.id}
                      onPutAway={() => {
                          clearTeam();
                      }}
                    />
                  ))}
                </SortableContext>
              )}
          </div>
        </DndContext>
    </div>
  );
}
