"use client";

import dynamic from "next/dynamic";

import { v4 as uuidv4 } from "uuid";

// Lazy Load Heavy Components
import { SoloBuilderView } from "@/features/deck-builder/components/SoloBuilderView";
// import { CardInspectorModal } from "@/features/shared/inspector/CardInspectorModal";
// import { CommandCenterModal } from "@/features/deck-builder/forge/CommandCenterModal";
import { useDeckHotkeys } from "@/features/deck-builder/hooks/ui/useDeckHotkeys";
import { useDeckStore } from "@/store/index";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { Deck } from "@/types/deck";

// import { SoloBuilderView } from "@/features/deck-builder/components/SoloBuilderView";
// import { TeamBuilderView } from "@/features/team-builder/TeamBuilderView";
import { DragDropErrorBoundary } from "../providers/DragDropErrorBoundary";
import { DragDropProvider } from "../providers/DragDropProvider";
import { PageSkeleton } from "./PageSkeleton";

const TeamBuilderView = dynamic(
  () =>
    import("@/features/team-builder/TeamBuilderView").then(
      (mod) => mod.TeamBuilderView
    ),
  {
    loading: () => <PageSkeleton />,
  }
);

const CardInspectorModal = dynamic(
  () =>
    import("@/features/shared/inspector/CardInspectorModal").then(
      (mod) => mod.CardInspectorModal
    ),
  { ssr: false }
);

const CommandCenterModal = dynamic(
  () =>
    import("@/features/deck-builder/forge/CommandCenterModal").then(
      (mod) => mod.CommandCenterModal
    ),
  { ssr: false }
);

export interface DeckBuilderViewProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderView({ units, spellcasters }: DeckBuilderViewProps) {
  const { mode, importSoloDeckToTeam, activeSlot, commandCenterOpen } =
    useDeckStore();

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
