import { useState, useEffect, useCallback } from 'react';
import { Unit, Hero as Spellcaster } from '@/types/api';
import { Deck, DeckSlot, SlotIndex } from '@/types/deck';

const STORAGE_KEY = 'spellcasters_deck_v1';

const INITIAL_SLOTS: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] = [
  { index: 0, unit: null, allowedTypes: ['UNIT'] },
  { index: 1, unit: null, allowedTypes: ['UNIT'] },
  { index: 2, unit: null, allowedTypes: ['UNIT'] },
  { index: 3, unit: null, allowedTypes: ['UNIT'] },
  { index: 4, unit: null, allowedTypes: ['TITAN'] },
];

const INITIAL_DECK: Deck = {
  spellcaster: null,
  slots: INITIAL_SLOTS,
};

export function useDeckBuilder() {
  const [deck, setDeck] = useState<Deck>(INITIAL_DECK);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic schema check could go here
        setDeck(parsed);
      } catch (e) {
        console.error('Failed to load deck', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    }
  }, [deck, isInitialized]);

  const setSpellcaster = useCallback((spellcaster: Spellcaster) => {
    setDeck(prev => ({ ...prev, spellcaster }));
  }, []);

  const setSlot = useCallback((index: SlotIndex, unit: Unit) => {
    setDeck(prev => {
      const newSlots = [...prev.slots] as typeof prev.slots;
      
      // Validation: Enforce Slot Types
      const slot = newSlots[index];
      const isTitan = unit.category === 'Titan';
      
      if (slot.allowedTypes.includes('TITAN') && !isTitan) {
        // Trying to put non-Titan in Titan slot
        return prev;
      }
      
      if (slot.allowedTypes.includes('UNIT') && isTitan) {
        // Trying to put Titan in Unit slot
        return prev;
      }

      // Check if unit limits (max 3 copies) - Ignored for MVP per user request "No Invariants" comment?
      // Actually user said "Min 40 cards... is wrong" but "4 units, 1 titan... we're fine and don't need to worry about harder stuff"
      // User said "Validation: Strict 4+1 Rules" in V4 plan.
      // We will allow setting the slot if type matches.

      newSlots[index] = { ...slot, unit };
      return { ...prev, slots: newSlots };
    });
  }, []);

  const clearSlot = useCallback((index: SlotIndex) => {
    setDeck(prev => {
      const newSlots = [...prev.slots] as typeof prev.slots;
      newSlots[index] = { ...newSlots[index], unit: null };
      return { ...prev, slots: newSlots };
    });
  }, []);

  const clearDeck = useCallback(() => {
    if (confirm('Are you sure you want to clear your deck?')) {
      setDeck(INITIAL_DECK);
    }
  }, []);

  // Validation Logic
  // 1. Check all slots filled
  const stats = {
    unitCount: deck.slots.filter(s => s.unit && s.index < 4).length,
    titanCount: deck.slots[4].unit ? 1 : 0,
    hasSpellcaster: !!deck.spellcaster,
    rank1or2Count: 0,
    averageChargeTime: 0,
    averageCost: 0,
    unitCounts: { Creature: 0, Building: 0, Spell: 0, Titan: 0 } as Record<string, number>,
    rankCounts: { I: 0, II: 0, III: 0, IV: 0 } as Record<string, number>,
    isValid: false,
    validationErrors: [] as string[]
  };

  if (stats.unitCount < 4) stats.validationErrors.push("Must have 4 Units");
  if (!stats.titanCount) stats.validationErrors.push("Must have 1 Titan");
  if (!stats.hasSpellcaster) stats.validationErrors.push("Select a Spellcaster");

  // 2. Rank Logic
  let totalCharge = 0;
  let totalPop = 0;
  let filledCount = 0;

  deck.slots.forEach(slot => {
    if (slot.unit) {
        // Rank Count for Units (Slots 0-3)
        if (slot.index < 4) {
            if (slot.unit.card_config.rank === 'I' || slot.unit.card_config.rank === 'II') {
                stats.rank1or2Count++;
            }
        }
        totalCharge += slot.unit.card_config.charge_time;
        totalPop += slot.unit.card_config.cost_population;
        filledCount++;

        // Counts
        const cat = slot.unit.category;
        stats.unitCounts[cat] = (stats.unitCounts[cat] || 0) + 1;
        const rank = slot.unit.card_config.rank;
        stats.rankCounts[rank] = (stats.rankCounts[rank] || 0) + 1;
    }
  });

  if (stats.unitCount === 4 && stats.rank1or2Count === 0) {
      stats.validationErrors.push("Requires at least one Rank I or II unit");
  }

  stats.averageChargeTime = filledCount > 0 ? totalCharge / filledCount : 0;
  stats.averageCost = filledCount > 0 ? totalPop / filledCount : 0;
  stats.isValid = stats.validationErrors.length === 0;

  const setDeckState = useCallback((newDeck: Deck) => {
      setDeck(newDeck);
  }, []);

  const isEmpty = !deck.spellcaster && deck.slots.every(s => !s.unit);

  return {
    deck,
    isInitialized,
    setSpellcaster,
    setSlot,
    clearSlot,
    clearDeck,
    setDeckState,
    isEmpty,
    validation: {
        isValid: stats.isValid,
        errors: stats.validationErrors
    },
    stats
  };
}
