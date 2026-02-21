"use client";

import { useDataHydration } from "@/features/deck-builder/hooks/persistence/useDataHydration";
import { useDeckSync } from "@/features/deck-builder/hooks/persistence/useDeckSync";
import { useUrlSync } from "@/features/deck-builder/hooks/persistence/useUrlSync";
import { useShareErrorHandler } from "@/features/deck-builder/hooks/ui/useShareErrorHandler";
import { useToast } from "@/hooks/useToast";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

import { DeckBuilderView } from "./DeckBuilderView";
import { PageSkeleton } from "./PageSkeleton";

interface DeckBuilderContainerProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderContainer({
  units,
  spellcasters,
}: DeckBuilderContainerProps) {
  const { showToast } = useToast();

  // 0. Handle any share errors from short links
  useShareErrorHandler();

  // 1. Hydrate Stale Data (e.g. old cooldowns in storage)
  useDataHydration({ units, spellcasters });

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
      <DeckBuilderView units={units} spellcasters={spellcasters} />
    </>
  );
}
