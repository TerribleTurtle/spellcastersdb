"use client";

import { useEffect, useRef, useState } from "react";
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

  const [isProcessing, setIsProcessing] = useState(() => {
    // If there is a 'team' param, we are initially processing
    if (typeof window !== 'undefined') {
        return !!new URLSearchParams(window.location.search).get("team");
    }
    return false;
  });

  useEffect(() => {
    const teamHash = searchParams.get("team");
    
    // Safety check: If param disappeared, stop processing
    if (!teamHash) {
        if (isProcessing) setIsProcessing(false);
        return;
    }

    // 1. Prevent reprocessing the exact same hash in this session
    if (lastProcessedUrlHash.current === teamHash) {
         if (isProcessing) setIsProcessing(false);
         return;
    }

    // 2. Optimization check
    if (lastTeamHash === teamHash && hydratedMode === "TEAM") {
        lastProcessedUrlHash.current = teamHash;
        setIsProcessing(false);
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
        closeCommandCenter(); 
        
      } catch (err) {
         console.error("Failed to load team from URL", err);
         if (onError) onError("Failed to load team from URL");
      } finally {
         setIsProcessing(false);
      }
    }).catch((err) => {
      console.error("Failed to load team module", err);
      setIsProcessing(false);
    });

  }, [searchParams, lastTeamHash, hydratedMode, units, spellcasters, setViewingTeam, closeCommandCenter, onError, isProcessing]);

  return { isProcessing };
}
