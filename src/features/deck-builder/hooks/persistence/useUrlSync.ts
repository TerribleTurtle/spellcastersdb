"use client";

import { useAppHydration } from "../ui/useAppHydration";
import { useTeamUrlLoader } from "@/features/team-builder/hooks/useTeamUrlLoader";
import { useSoloImport } from "@/features/deck-builder/hooks/useSoloImport";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

interface UseUrlSyncProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  onError?: (message: string) => void;
}

export function useUrlSync({
  units,
  spellcasters,
  onError,
}: UseUrlSyncProps) {
  
  // 1. Hydrate App State (Mode, View Summary)
  const { lastTeamHash, hydratedMode } = useAppHydration();

  // 2. Handle Team Imports (?team=...)
  useTeamUrlLoader({
      units,
      spellcasters,
      lastTeamHash,
      hydratedMode,
      onError
  });

  // 3. Handle Solo Imports (?d=...)
  useSoloImport({
      units,
      spellcasters,
      mode: hydratedMode || "SOLO",
      onError
  });
}
