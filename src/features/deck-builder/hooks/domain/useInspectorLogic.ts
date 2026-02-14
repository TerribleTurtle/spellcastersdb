"use client";

import { useShallow } from "zustand/react/shallow";
import { useDeckStore } from "@/store/index";
import { UnifiedEntity, Spellcaster, Unit, Spell, Titan } from "@/types/api";
import { isSpellcaster as isSpellcasterGuard, isTitan } from "@/services/validation/guards";
import { TITAN_SLOT_INDEX } from "@/services/config/constants";
import { getSlotStatus, getTitanStatus } from "@/features/shared/inspector/utils";
import { SlotIndex } from "@/types/deck";

interface UseInspectorLogicProps {
  item: UnifiedEntity;
}

export function useInspectorLogic({ item }: UseInspectorLogicProps) {
  const { currentDeck, setSlot, setSpellcaster } = useDeckStore(
    useShallow((state) => ({
      currentDeck: state.currentDeck,
      setSlot: state.setSlot,
      setSpellcaster: state.setSpellcaster,
    }))
  );

  const isSpellcaster = isSpellcasterGuard(item);

  // Check if item is already in deck
  const isCurrentSpellcaster =
    isSpellcaster &&
    currentDeck.spellcaster?.spellcaster_id ===
      (item as Spellcaster).spellcaster_id;

  const handleSelectSpellcaster = () => {
    if (isSpellcaster) {
      setSpellcaster(item as Spellcaster);
    }
  };

  const handleSelectTitan = () => {
    if (isTitan(item)) {
       setSlot(TITAN_SLOT_INDEX, item as Titan);
    }
  };

  const handleSelectSlot = (idx: SlotIndex) => {
      setSlot(idx, item as Unit | Spell | Titan);
  };

  // For units, check specific slots
  const getStatus = (idx: SlotIndex) => {
    return getSlotStatus(currentDeck, item, idx);
  };

  const isTitanInDeck = getTitanStatus(currentDeck, item);

  return {
    isSpellcaster,
    isCurrentSpellcaster,
    isTitan: isTitan(item),
    isTitanInDeck,
    handleSelectSpellcaster,
    handleSelectTitan,
    handleSelectSlot,
    getStatus
  };
}
