"use client";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useUrlSync } from "@/features/deck-builder/hooks/persistence/useUrlSync";
import { DeckBuilderView } from "./DeckBuilderView";
import { useDeckSync } from "@/features/deck-builder/hooks/persistence/useDeckSync";
import { useToast } from "@/hooks/useToast";

interface DeckBuilderContainerProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderContainer({ units, spellcasters }: DeckBuilderContainerProps) {
  const { showToast } = useToast();
  
  // URL & State Sync Hook (Now self-contained)
  useUrlSync({
      units,
      spellcasters,
      onError: (msg) => showToast(msg, "error"),
  });

  // Sync Store Side-Effects
  useDeckSync();

  return (
    <>
      <DeckBuilderView 
        units={units} 
        spellcasters={spellcasters}
      />
    </>
  );
}
