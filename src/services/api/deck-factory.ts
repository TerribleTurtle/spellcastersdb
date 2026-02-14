import { Deck, SlotType } from "@/types/deck";
import { Spellcaster } from "@/types/api";

export const createNewDeck = (name: string = "New Deck", spellcaster?: Spellcaster): Deck => {
  return {
    spellcaster: spellcaster || null,
    slots: [
      { index: 0, unit: null, allowedTypes: [SlotType.Unit] },
      { index: 1, unit: null, allowedTypes: [SlotType.Unit] },
      { index: 2, unit: null, allowedTypes: [SlotType.Unit] },
      { index: 3, unit: null, allowedTypes: [SlotType.Unit] },
      { index: 4, unit: null, allowedTypes: [SlotType.Titan] },
    ],
    name: name,
  };
};
