import { Deck, DeckStats } from "@/types/deck";
import { ENTITY_CATEGORY, TITAN_SLOT_INDEX } from "@/services/config/constants";

export function calculateDeckStats(deck: Deck): DeckStats {
  // Safe default stats
  const emptyStats: DeckStats = {
      unitCount: 0,
      titanCount: 0,
      hasSpellcaster: false,
      rank1or2Count: 0,
      rank1or2CreatureCount: 0,
      unitCounts: { 
        [ENTITY_CATEGORY.Creature]: 0, 
        [ENTITY_CATEGORY.Building]: 0, 
        [ENTITY_CATEGORY.Spell]: 0, 
        [ENTITY_CATEGORY.Titan]: 0 
      } as Record<string, number>,
      isValid: false,
      validationErrors: [],
  };

  if (!deck || !deck.slots || !Array.isArray(deck.slots)) {
      return emptyStats;
  }

  const stats: DeckStats = {
    unitCount: deck.slots.filter((s) => s.unit && s.index < TITAN_SLOT_INDEX).length,
    titanCount: (deck.slots[TITAN_SLOT_INDEX] && deck.slots[TITAN_SLOT_INDEX].unit) ? 1 : 0,
    hasSpellcaster: !!deck.spellcaster,
    rank1or2Count: 0,
    rank1or2CreatureCount: 0,
    unitCounts: { ...emptyStats.unitCounts },
    isValid: false,
    validationErrors: [] as string[],
  };

  for (const slot of deck.slots) {
    if (slot.unit) {
      const unit = slot.unit;
      const category = unit.category;
      
      // Strict Type Guard based on Category
      if (category === ENTITY_CATEGORY.Titan) {
          // Titan Logic (if any specific logic needed)
      } else {
        // Non-Titan Units (Creature, Spell, Building)
        // Check for Rank I/II check
        if (slot.index < TITAN_SLOT_INDEX) {
             // Safe access because Titans are excluded and we expect standard units here
             // In our schema, Creatures/Spells/Buildings have 'rank'
             if ('rank' in unit) {
                 const rank = unit.rank;
                 if (rank === "I" || rank === "II") {
                    stats.rank1or2Count++;
                    if (category === ENTITY_CATEGORY.Creature) {
                        stats.rank1or2CreatureCount++;
                    }
                 }
             }
        }
      }

      stats.unitCounts[category] = (stats.unitCounts[category] || 0) + 1;
    }
  }
  
  return stats;
}
