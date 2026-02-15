"use client";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useUrlSync } from "@/features/deck-builder/hooks/persistence/useUrlSync";
import { DeckBuilderView } from "./DeckBuilderView";
import { useDeckSync } from "@/features/deck-builder/hooks/persistence/useDeckSync";
import { useToast } from "@/hooks/useToast";
import { PageSkeleton } from "./PageSkeleton";

interface DeckBuilderContainerProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderContainer({ units, spellcasters }: DeckBuilderContainerProps) {
  const { showToast } = useToast();
  
  // URL & State Sync Hook (Now self-contained)
  const { isHydrated, isProcessing } = useUrlSync({
      units,
      spellcasters,
      onError: (msg) => showToast(msg, "error"),
  });

  // Sync Store Side-Effects
  useDeckSync();

  // Prevent flash of wrong mode or empty deck by waiting for hydration + processing
  // The server sends PageSkeleton, we keep it until we know the client mode AND have loaded data
  if (!isHydrated || isProcessing) {
      return <PageSkeleton />;
  }

  return (
    <>
      <DeckBuilderView 
        units={units} 
        spellcasters={spellcasters}
      />
    </>
  );
}
