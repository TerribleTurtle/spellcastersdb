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
  const { setViewingTeam, closeCommandCenter } = useDeckStore(
    useShallow((state) => ({
      setViewingTeam: state.setViewingTeam,
      closeCommandCenter: state.closeCommandCenter,
    }))
  );

  // Track the last processed hash to allow handling URL changes without infinite loops
  const lastProcessedUrlHash = useRef<string | null>(null);

  useEffect(() => {
    const teamHash = searchParams.get("team");
    if (!teamHash) return;

    // 1. Prevent reprocessing the exact same hash in this session
    if (lastProcessedUrlHash.current === teamHash) return;

    // 2. Optimization: If the URL matches what we already have in persistence, don't re-parse.
    // However, if the user explicitly navigated here, we might want to ensure the UI state (modals) is correct.
    // If we skip parsing, we should still ensure modals are closed if this is the "first" time we see it this session.
    // For now, let's trust the persistence check for data, but we might miss the "Close Modal" side effect if we return early.
    // BUT: If it's persisted, we likely aren't "opening" it from a link in the same way as a fresh load.
    // Let's stick to the data loading logic first.
    if (lastTeamHash === teamHash && hydratedMode === "TEAM") {
        lastProcessedUrlHash.current = teamHash;
        return;
    }

    // Dynamic import to avoid bundling encoding logic in main chunk
    import("@/services/utils/encoding").then(({ decodeTeam }) => {
      try {
        const decodedData = decodeTeam(teamHash);
        if (!decodedData) throw new Error("Invalid team data");
        const { decks, name } = ReconstructionService.reconstructTeam(decodedData, units, spellcasters);
        
        // Mark as processed
        lastProcessedUrlHash.current = teamHash;

        setViewingTeam(decks, null, name);
        closeCommandCenter(); // Ensure Library is closed to show the Team Overview
        
      } catch (err) {
         console.error("Failed to load team from URL", err);
         if (onError) onError("Failed to load team from URL");
      }
    }).catch((err) => {
      console.error("Failed to load team module", err);
    });

  }, [searchParams, lastTeamHash, hydratedMode, units, spellcasters, setViewingTeam, closeCommandCenter, onError]);
}
