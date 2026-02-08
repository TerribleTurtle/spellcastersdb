import { Deck, DeckStats } from "@/types/deck";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    stats: DeckStats;
}

export function validateDeck(deck: Deck): ValidationResult {
    const stats: DeckStats = {
        unitCount: deck.slots.filter(s => s.unit && s.index < 4).length,
        titanCount: deck.slots[4].unit ? 1 : 0,
        hasSpellcaster: !!deck.spellcaster,
        rank1or2Count: 0,
        rank1or2CreatureCount: 0,
        averageChargeTime: 0,
        averageCost: 0,
        unitCounts: { Creature: 0, Building: 0, Spell: 0, Titan: 0 } as Record<string, number>,
        isValid: false,
        validationErrors: [] as string[]
    };

    let totalCharge = 0;
    let totalPop = 0;
    let filledCount = 0;

    deck.slots.forEach(slot => {
        if (slot.unit) {
            if (slot.index < 4) {
                const rank = slot.unit.card_config.rank;
                const category = slot.unit.category;
                if (rank === 'I' || rank === 'II') {
                    stats.rank1or2Count++;
                    if (category === 'Creature') {
                        stats.rank1or2CreatureCount++;
                    }
                }
            }
            totalCharge += slot.unit.card_config.charge_time;
            totalPop += slot.unit.card_config.cost_population;
            filledCount++;

            const cat = slot.unit.category;
            stats.unitCounts[cat] = (stats.unitCounts[cat] || 0) + 1;
        }
    });

    stats.averageChargeTime = filledCount > 0 ? totalCharge / filledCount : 0;
    stats.averageCost = filledCount > 0 ? totalPop / filledCount : 0;

    // Validation Rules
    if (stats.unitCount < 4) stats.validationErrors.push("Must have 4 Units");
    if (!stats.titanCount) stats.validationErrors.push("Must have 1 Titan");
    if (!stats.hasSpellcaster) stats.validationErrors.push("Select a Spellcaster");

    if (stats.unitCount === 4 && stats.rank1or2CreatureCount === 0) {
        stats.validationErrors.push("Must include at least 1 Rank I or II Creature");
    }

    const creatureCount = deck.slots.slice(0, 4).filter(s => s.unit && s.unit.category === 'Creature').length;
    if (stats.unitCount === 4 && creatureCount === 0) {
        stats.validationErrors.push("Deck must include at least 1 Creature (cannot be all Spells/Buildings)");
    }

    stats.isValid = stats.validationErrors.length === 0;

    return {
        isValid: stats.isValid,
        errors: stats.validationErrors,
        stats
    };
}
