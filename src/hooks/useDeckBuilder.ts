import { useState, useEffect, useCallback, useRef } from 'react';
import { Unit, Spellcaster } from '@/types/api';
import { Deck, DeckSlot, SlotIndex } from '@/types/deck';

const STORAGE_KEY = 'spellcasters_deck_v1';

// Internal Storage Format (IDs only)
interface StoredDeck {
  spellcasterId: string | null;
  slotIds: [string | null, string | null, string | null, string | null, string | null]; // 5 slots
}

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

// Helper: Convert Deck to Stored Format
function serializeDeck(deck: Deck): StoredDeck {
  return {
    spellcasterId: deck.spellcaster?.hero_id || null,
    slotIds: deck.slots.map(s => s.unit?.entity_id || null) as [string | null, string | null, string | null, string | null, string | null]
  };
}

export function useDeckBuilder(availableUnits: Unit[] = [], availableSpellcasters: Spellcaster[] = []) {
  const [deck, setDeck] = useState<Deck>(INITIAL_DECK);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const hasHydrated = useRef(false);

  // 1. Hydration Load (Fix for Phantom Data)
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    // Prevent hydration race: only run once
    if (hasHydrated.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const stored: StoredDeck = JSON.parse(saved);
        
        // Reconstruct Deck from fresh API data with DEEP CLONE
        const newSlots = INITIAL_SLOTS.map(s => ({ ...s }));
        
        stored.slotIds.forEach((id, idx) => {
            if (id && idx < 5) {
                const freshUnit = availableUnits.find(u => u.entity_id === id);
                if (freshUnit) {
                     newSlots[idx] = { ...newSlots[idx], unit: freshUnit };
                }
            }
        });

        const freshSpellcaster = stored.spellcasterId 
            ? availableSpellcasters.find(s => s.hero_id === stored.spellcasterId) 
            : null;

        setDeck({
            spellcaster: freshSpellcaster || null,
            slots: newSlots as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot]
        });
      } catch (e) {
        console.error('Failed to load deck', e);
      }
    }
    hasHydrated.current = true;
    setIsInitialized(true);
  }, [availableUnits, availableSpellcasters]);

  // 2. Persistence Save (IDs only)
  useEffect(() => {
    if (isInitialized) {
      const stored = serializeDeck(deck);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  }, [deck, isInitialized]);

  const setSpellcaster = useCallback((spellcaster: Spellcaster) => {
    setDeck(prev => ({ ...prev, spellcaster }));
  }, []);

  const removeSpellcaster = useCallback(() => {
    setDeck(prev => ({ ...prev, spellcaster: null }));
  }, []);

  const setSlot = useCallback((index: SlotIndex, unit: Unit) => {
    setDeck(prev => {
      // Enforce Singleton: Max 1 copy per card
      // We only care if the unit is being added to a standard slot (0-3)
      if (index < 4) {
          const isDuplicate = prev.slots.some((s, i) => 
               i < 4 && i !== index && s.unit?.entity_id === unit.entity_id
          );
          if (isDuplicate) {
            setLastError("Unique: You can only have 1 copy of this card.");
            setTimeout(() => setLastError(null), 3000);
            return prev;
          }
      }

      const newSlots = [...prev.slots] as typeof prev.slots;
      
      const slot = newSlots[index];
      const isTitan = unit.category === 'Titan';
      
      // Strict Functionality: Prevent invalid drops
      if (slot.allowedTypes.includes('TITAN') && !isTitan) return prev;
      if (slot.allowedTypes.includes('UNIT') && isTitan) return prev;

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
     // Note: Caller handles confirmation now to avoid window.confirm
      setDeck(INITIAL_DECK);
  }, []);

  // Validation Logic (The Invariants)
  const stats = {
    unitCount: deck.slots.filter(s => s.unit && s.index < 4).length,
    titanCount: deck.slots[4].unit ? 1 : 0,
    hasSpellcaster: !!deck.spellcaster,
    rank1or2Count: 0,
    averageChargeTime: 0,
    averageCost: 0,
    unitCounts: { Creature: 0, Building: 0, Spell: 0, Titan: 0 } as Record<string, number>,
    // Removed unused rankCounts
    isValid: false,
    validationErrors: [] as string[]
  };

  // Calculate Stats
  let totalCharge = 0;
  let totalPop = 0;
  let filledCount = 0;

  deck.slots.forEach(slot => {
    if (slot.unit) {
        if (slot.index < 4) {
            const rank = slot.unit.card_config.rank;
            if (rank === 'I' || rank === 'II') {
                stats.rank1or2Count++;
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

  // Strict: Rank I/II Requirement (Blocking if full)
  if (stats.unitCount === 4 && stats.rank1or2Count === 0) {
      stats.validationErrors.push("Must include a Rank I or II unit");
  }

  // Passive reminder for Rank I/II (Tip if not full)
  const rankReminder = stats.unitCount > 0 && stats.unitCount < 4 && stats.rank1or2Count === 0 
    ? "Tip: Include at least one Rank I or II unit for early pressure" 
    : null;

  stats.isValid = stats.validationErrors.length === 0;

  const setDeckState = useCallback((newDeck: Deck) => {
      setDeck(newDeck);
  }, []);

  const isEmpty = !deck.spellcaster && deck.slots.every(s => !s.unit);

  return {
    deck,
    isInitialized,
    setSpellcaster,
    removeSpellcaster,
    setSlot,
    clearSlot,
    clearDeck,
    setDeckState,
    isEmpty,
    lastError,
    validation: {
        isValid: stats.isValid,
        errors: stats.validationErrors,
        reminder: rankReminder
    },
    stats
  };
}
