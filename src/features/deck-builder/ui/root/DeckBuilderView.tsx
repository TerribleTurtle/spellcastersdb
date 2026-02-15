"use client";

import { Deck } from "@/types/deck";
import { v4 as uuidv4 } from "uuid";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useDeckStore } from "@/store/index";
import dynamic from "next/dynamic";

import { DragDropProvider } from "../providers/DragDropProvider";
// import { SoloBuilderView } from "@/features/deck-builder/components/SoloBuilderView";
// import { TeamBuilderView } from "@/features/team-builder/TeamBuilderView";
import { DragDropErrorBoundary } from "../providers/DragDropErrorBoundary";
// import { CardInspectorModal } from "@/features/shared/inspector/CardInspectorModal";
// import { CommandCenterModal } from "@/features/deck-builder/forge/CommandCenterModal";
import { useDeckHotkeys } from "@/features/deck-builder/hooks/ui/useDeckHotkeys";

// Lazy Load Heavy Components
import { SoloBuilderView } from "@/features/deck-builder/components/SoloBuilderView";

const TeamBuilderView = dynamic(
  () => import("@/features/team-builder/TeamBuilderView").then(mod => mod.TeamBuilderView),
  {
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-surface-main">
         <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground animate-pulse">Initializing Team Editor...</span>
         </div>
      </div>
    )
  }
);

const CardInspectorModal = dynamic(
  () => import("@/features/shared/inspector/CardInspectorModal").then(mod => mod.CardInspectorModal),
  { ssr: false } 
);

const CommandCenterModal = dynamic(
  () => import("@/features/deck-builder/forge/CommandCenterModal").then(mod => mod.CommandCenterModal),
  { ssr: false }
);

export interface DeckBuilderViewProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderView({
  units,
  spellcasters,
}: DeckBuilderViewProps) {
  const { 
      mode, 
      importSoloDeckToTeam,
      activeSlot,
      commandCenterOpen
  } = useDeckStore();
  
  const isTeamMode = mode === "TEAM";

  const handleImportSolo = (deck: Deck) => {
      if (activeSlot !== null) {
          importSoloDeckToTeam(activeSlot, deck, uuidv4());
      }
  };

  useDeckHotkeys();

  return (
    <div className="h-full flex flex-col relative w-full">
      <DragDropErrorBoundary>
        <DragDropProvider>
          {isTeamMode ? (
            <TeamBuilderView
              units={units}
              spellcasters={spellcasters}
              onImportSolo={handleImportSolo}
            />
          ) : (
            <SoloBuilderView
              units={units}
              spellcasters={spellcasters}
              onImportSolo={handleImportSolo} 
            />
          )}

          <div className="xl:hidden">
            <CardInspectorModal />
          </div>
          {/* HoverInspector disabled/removed per new layout */}
          {/* <HoverInspector /> */}
          {commandCenterOpen && <CommandCenterModal />}
        </DragDropProvider>
      </DragDropErrorBoundary>
    </div>
  );
}
