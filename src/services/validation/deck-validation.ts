import { Deck, DeckStats } from "@/types/deck";

import {
  checkCreaturePresence,
  checkDeckSize,
  checkRank1or2,
  checkSpellcaster,
  checkTitan,
} from "./rules";
import { calculateDeckStats } from "./stats";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  stats: DeckStats;
}

export function validateDeck(deck: Deck): ValidationResult {
  if (!deck || !Array.isArray(deck.slots)) {
    return {
      isValid: false,
      errors: ["Invalid Deck Structure"],
      stats: calculateDeckStats(deck || ({} as Deck)),
    };
  }

  const stats = calculateDeckStats(deck);
  const errors: string[] = [];

  // Run Rules
  const checks = [
    checkDeckSize(stats),
    checkTitan(stats),
    checkSpellcaster(stats),
    checkRank1or2(stats),
    checkCreaturePresence(deck, stats),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  stats.isValid = errors.length === 0;
  stats.validationErrors = errors;

  return {
    isValid: stats.isValid,
    errors,
    stats,
  };
}
