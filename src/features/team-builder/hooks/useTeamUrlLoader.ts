"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDeckStore } from "@/store/index";
import { ReconstructionService } from "@/services/api/reconstruction";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useShallow } from "zustand/react/shallow";

interface UseTeamUrlLoaderProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  lastTeamHash: string | null;
  hydratedMode: string | null;
  onError?: (message: string) => void;
}

export function useTeamUrlLoader({
  units,
  spellcasters,
  lastTeamHash,
  hydratedMode,
  onError
}: UseTeamUrlLoaderProps) {
  const searchParams = useSearchParams();
  const setViewingTeam = useDeckStore(useShallow((state) => state.setViewingTeam));

  const hasProcessedTeam = useRef(false);

  useEffect(() => {
    if (hasProcessedTeam.current) return;

    const teamHash = searchParams.get("team");
    if (!teamHash) return;

    // Prevent redundant reload if hash matches persisted state
    if (lastTeamHash === teamHash && hydratedMode === "TEAM") {
        hasProcessedTeam.current = true;
        return;
    }

    hasProcessedTeam.current = true;

    // Dynamic import to avoid bundling encoding logic in main chunk
    import("@/services/utils/encoding").then(({ decodeTeam }) => {
      try {
        const decodedData = decodeTeam(teamHash);
        if (!decodedData) throw new Error("Invalid team data");
        const { decks, name } = ReconstructionService.reconstructTeam(decodedData, units, spellcasters);
        setViewingTeam(decks, null, name);
      } catch (err) {
         console.error("Failed to load team from URL", err);
         if (onError) onError("Failed to load team from URL");
      }
    }).catch((err) => {
      console.error("Failed to load team module", err);
    });

  }, [searchParams, lastTeamHash, hydratedMode, units, spellcasters, setViewingTeam, onError]);
}
