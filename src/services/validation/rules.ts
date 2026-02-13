import { DeckStats, Deck } from "@/types/deck";
import { DECK_SIZE, ENTITY_CATEGORY } from "@/services/config/constants";
import { DECK_VALIDATION_ERRORS } from "./constants";

export function checkDeckSize(stats: DeckStats): string | null {
    if (stats.unitCount < DECK_SIZE) return DECK_VALIDATION_ERRORS.MISSING_UNITS;
    return null;
}

export function checkTitan(stats: DeckStats): string | null {
    if (!stats.titanCount) return DECK_VALIDATION_ERRORS.MISSING_TITAN;
    return null;
}

export function checkSpellcaster(stats: DeckStats): string | null {
    if (!stats.hasSpellcaster) return DECK_VALIDATION_ERRORS.MISSING_SPELLCASTER;
    return null;
}

export function checkRank1or2(stats: DeckStats): string | null {
    if (stats.unitCount === DECK_SIZE && stats.rank1or2CreatureCount === 0) {
        return DECK_VALIDATION_ERRORS.MISSING_RANK_1_OR_2;
    }
    return null;
}

export function checkCreaturePresence(deck: Deck, stats: DeckStats): string | null {
     const creatureCount = deck.slots
        .slice(0, DECK_SIZE)
        .filter((s) => s.unit && s.unit.category === ENTITY_CATEGORY.Creature).length;
      if (stats.unitCount === DECK_SIZE && creatureCount === 0) {
        return DECK_VALIDATION_ERRORS.NO_CREATURES;
      }
      return null;
}
