"use client";

import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import { useShallow } from "zustand/react/shallow";

import { createNewDeck } from "@/services/api/deck-factory";
import { monitoring } from "@/services/monitoring";
import { useDeckStore } from "@/store/index";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

interface UseSoloImportProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  mode: string;
  onError?: (message: string) => void;
}

export function useSoloImport({
  units,
  spellcasters,
  mode,
  onError,
}: UseSoloImportProps) {
  const searchParams = useSearchParams();

  const { setViewingDeck, setViewSummary, closeCommandCenter, closeInspector } =
    useDeckStore(
      useShallow((state) => ({
        setViewingDeck: state.setViewingDeck,
        setViewSummary: state.setViewSummary,
        closeCommandCenter: state.closeCommandCenter,
        closeInspector: state.closeInspector,
      }))
    );

  // Use a string ref to track the last processed hash, allowing updates if the URL changes
  const lastProcessedHash = useRef<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(() => {
    // If there is a 'd' param, we are initially processing
    if (typeof window !== "undefined") {
      return !!new URLSearchParams(window.location.search).get("d");
    }
    return false;
  });

  useEffect(() => {
    const deckHash = searchParams.get("d");

    // 1. Validation
    if (!deckHash) return;

    // 2. Prevent redundant processing of the same hash
    if (lastProcessedHash.current === deckHash) return;

    // 3. Mode Check: Solo Import only happens if we are in SOLO mode
    // If team param exists, useTeamImport handles it.
    if (mode !== "SOLO") return;

    // 4. Processing
    const loadDeck = async () => {
      try {
        const { decodeDeck } = await import("@/services/utils/encoding");
        const decoded = decodeDeck(deckHash);
        if (decoded) {
          const spellcaster =
            spellcasters.find(
              (s) => s.spellcaster_id === decoded.spellcasterId
            ) || undefined;

          // Use Factory
          const deckName =
            decoded.name ||
            (spellcaster ? `${spellcaster.name} Import` : "Imported Deck");
          const newDeck = createNewDeck(deckName, spellcaster);

          decoded.slotIds.forEach((id, idx) => {
            if (idx > 4) return;
            if (id) {
              const unit = units.find((u) => u.entity_id === id);
              if (unit) newDeck.slots[idx] = { ...newDeck.slots[idx], unit };
            }
          });

          // Mark as processed BEFORE state updates to prevent loops
          lastProcessedHash.current = deckHash;

          // 5. State Updates
          setViewingDeck(newDeck, null);
          setViewSummary(true); // Force the Overview to show
          closeCommandCenter(); // Ensure Library is closed
          closeInspector(); // Ensure Inspector is closed
        }
      } catch (e) {
        monitoring.captureException(e, { operation: "soloImport" });
        if (onError) onError("Failed to load deck from URL");
      } finally {
        setIsProcessing(false);
      }
    };

    loadDeck();
  }, [
    searchParams,
    mode,
    units,
    spellcasters,
    setViewingDeck,
    setViewSummary,
    closeCommandCenter,
    closeInspector,
    onError,
  ]);

  return { isProcessing };
}
