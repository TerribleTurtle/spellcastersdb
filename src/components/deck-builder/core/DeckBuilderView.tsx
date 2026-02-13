"use client";

import { Deck } from "@/types/deck";
import { v4 as uuidv4 } from "uuid";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useDeckStore } from "@/store/index";

import { DragDropProvider } from "./DragDropProvider";
import { SoloBuilderView } from "./SoloBuilderView";
import { TeamBuilderView } from "./TeamBuilderView";
import { DragDropErrorBoundary } from "./DragDropErrorBoundary";
import { CardInspectorModal } from "../features/inspector/CardInspectorModal";
import { HoverInspector } from "../features/inspector/HoverInspector";
import { CommandCenterModal } from "../features/forge/CommandCenterModal";
import { useDeckHotkeys } from "../hooks/ui/useDeckHotkeys";

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
