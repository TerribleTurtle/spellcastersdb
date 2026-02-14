
import { useMemo } from "react";
import { Deck } from "@/types/deck";
import { validateDeck } from "@/services/validation/deck-validation";

export function useDeckValidation(deck: Deck) {
  const { isValid, errors, stats } = useMemo(() => validateDeck(deck), [deck]);

  const rankReminder =
    stats.unitCount > 0 &&
    stats.unitCount < 4 &&
    stats.rank1or2CreatureCount === 0
      ? "Tip: Include at least one Rank I or II Creature for early pressure"
      : null;

  return {
    isValid,
    errors,
    stats,
    reminder: rankReminder,
  };
}
