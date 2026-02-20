"use client";

import { useSoloImport } from "@/features/deck-builder/hooks/useSoloImport";
import { useTeamUrlLoader } from "@/features/team-builder/hooks/useTeamUrlLoader";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

import { useAppHydration } from "../ui/useAppHydration";

interface UseUrlSyncProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  onError?: (message: string) => void;
}

export function useUrlSync({ units, spellcasters, onError }: UseUrlSyncProps) {
  // 1. Hydrate App State (Mode, View Summary)
  const { lastTeamHash, hydratedMode } = useAppHydration();

  // 2. Handle Team Imports (?team=...)
  const { isProcessing: isTeamProcessing } = useTeamUrlLoader({
    units,
    spellcasters,
    lastTeamHash,
    hydratedMode,
    onError,
  });

  // 3. Handle Solo Imports (?d=...)
  const { isProcessing: isSoloProcessing } = useSoloImport({
    units,
    spellcasters,
    mode: hydratedMode || "SOLO",
    onError,
  });

  return {
    isHydrated: !!hydratedMode,
    isProcessing: isTeamProcessing || isSoloProcessing,
  };
}
