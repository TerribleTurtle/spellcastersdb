/**
 * @file deck-validation.ts
 * @description CRITICAL CORE COMPONENT. Contains the immutable rules for deck construction (4 units, 1 Titan, etc.).
 * DO NOT DELETE OR MODIFY WITHOUT VERIFICATION.
 */
import { Deck, DeckStats } from "@/types/deck";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  stats: DeckStats;
}

export function validateDeck(deck: Deck): ValidationResult {
  const stats: DeckStats = {
    unitCount: deck.slots.filter((s) => s.unit && s.index < 4).length,
    titanCount: deck.slots[4].unit ? 1 : 0,
    hasSpellcaster: !!deck.spellcaster,
    rank1or2Count: 0,
    rank1or2CreatureCount: 0,
    unitCounts: { Creature: 0, Building: 0, Spell: 0, Titan: 0 } as Record<
      string,
      number
    >,
    isValid: false,
    validationErrors: [] as string[],
  };

  deck.slots.forEach((slot) => {
    if (slot.unit) {
      // Titans don't have rank/cost the same way
      const isTitan = slot.unit.category === "Titan";

      if (slot.index < 4 && !isTitan) {
        // Use 'in' operator for safe property access if types are uncertain
        // or assume Incantation shape has optional rank
        const unit = slot.unit;
        const rank = "rank" in unit ? unit.rank : undefined;
        const category = unit.category;

        if (rank === "I" || rank === "II") {
          stats.rank1or2Count++;
          if (category === "Creature") {
            stats.rank1or2CreatureCount++;
          }
        }
      }

      const cat = slot.unit.category;
      stats.unitCounts[cat] = (stats.unitCounts[cat] || 0) + 1;
    }
  });

  // Validation Rules
  if (stats.unitCount < 4) stats.validationErrors.push("Must have 4 Units");
  if (!stats.titanCount) stats.validationErrors.push("Must have 1 Titan");
  if (!stats.hasSpellcaster)
    stats.validationErrors.push("Select a Spellcaster");

  if (stats.unitCount === 4 && stats.rank1or2CreatureCount === 0) {
    stats.validationErrors.push(
      "Must include at least 1 Rank I or II Creature"
    );
  }

  const creatureCount = deck.slots
    .slice(0, 4)
    .filter((s) => s.unit && s.unit.category === "Creature").length;
  if (stats.unitCount === 4 && creatureCount === 0) {
    stats.validationErrors.push(
      "Deck must include at least 1 Creature (cannot be all Spells/Buildings)"
    );
  }

  stats.isValid = stats.validationErrors.length === 0;

  return {
    isValid: stats.isValid,
    errors: stats.validationErrors,
    stats,
  };
}
