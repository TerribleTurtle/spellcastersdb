"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDeckStore } from "@/store/index";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useShallow } from "zustand/react/shallow";
import { decodeDeck } from "@/services/encoding";
import { createNewDeck } from "@/services/data/deck-factory";

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
  onError
}: UseSoloImportProps) {
  const searchParams = useSearchParams();
  const setViewingDeck = useDeckStore(useShallow((state) => state.setViewingDeck));
  
  const hasProcessedDeck = useRef(false);

  useEffect(() => {
    if (hasProcessedDeck.current) return;

    const deckHash = searchParams.get("d");
    if (!deckHash) return;

    // Solo Import only happens if we are in SOLO mode (or defaulting to it)
    // If team param exists, useTeamImport handles it.
    if (mode !== "SOLO") return;

    hasProcessedDeck.current = true;

    try {
        const decoded = decodeDeck(deckHash);
        if (decoded) {
          const spellcaster = spellcasters.find(s => s.spellcaster_id === decoded.spellcasterId) || undefined;
          
          // Use Factory
          const deckName = decoded.name || (spellcaster ? `${spellcaster.name} Import` : "Imported Deck");
          const newDeck = createNewDeck(deckName, spellcaster);
          
          decoded.slotIds.forEach((id, idx) => {
            if (idx > 4) return;
            if (id) {
              const unit = units.find((u) => u.entity_id === id);
              if (unit) newDeck.slots[idx] = { ...newDeck.slots[idx], unit };
            }
          });
          
          setViewingDeck(newDeck, null);
        }
      } catch (e) {
          console.error("Failed to decode deck", e);
          if (onError) onError("Failed to load deck from URL");
      }
  }, [searchParams, mode, units, spellcasters, setViewingDeck, onError]);
}
