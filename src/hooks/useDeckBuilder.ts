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
      const newSlots = [...prev.slots] as typeof prev.slots;

      // Enforce Singleton: Max 1 copy per card
      // If the unit exists in another slot, SWAP it with the content of the new slot
      // This allows [Slot 1: A, Slot 3: B] -> Drag A to Slot 3 -> [Slot 1: B, Slot 3: A]
      if (index < 4) {
          const existingIndex = prev.slots.findIndex((s, i) => 
               i < 4 && i !== index && s.unit?.entity_id === unit.entity_id
          );
          
          if (existingIndex !== -1) {
               // The unit is already in the deck at existingIndex.
               // We want to put whatever is currently in the TARGET slot (index) into the OLD slot (existingIndex).
               // This preserves the unit that would otherwise be overwritten if it was a simple move.
               newSlots[existingIndex] = { ...newSlots[existingIndex], unit: prev.slots[index].unit };
          }
      }
      
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

  const swapSlots = useCallback((indexA: number, indexB: number) => {
      setDeck(prev => {
          const newSlots = [...prev.slots] as typeof prev.slots;
          const unitA = newSlots[indexA].unit;
          const unitB = newSlots[indexB].unit;
          
          const slotA = newSlots[indexA];
          const slotB = newSlots[indexB];

          // Validate Unit B moving to Slot A
          if (unitB) {
              const isTitanB = unitB.category === 'Titan';
              if (slotA.allowedTypes.includes('TITAN') && !isTitanB) return prev;
              if (slotA.allowedTypes.includes('UNIT') && isTitanB) return prev;
          }

          // Validate Unit A moving to Slot B
          if (unitA) {
              const isTitanA = unitA.category === 'Titan';
              if (slotB.allowedTypes.includes('TITAN') && !isTitanA) return prev;
              if (slotB.allowedTypes.includes('UNIT') && isTitanA) return prev;
          }

          // Simple swap (handles nulls gracefully)
          newSlots[indexA] = { ...newSlots[indexA], unit: unitB };
          newSlots[indexB] = { ...newSlots[indexB], unit: unitA };

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
    rank1or2CreatureCount: 0,
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

  // ============================================================================
  // VALIDATION RULES (The Invariants)
  // ============================================================================
  // 1. Must have exactly 4 units in slots 0-3 (any mix of Creature/Building/Spell)
  // 2. Must have exactly 1 Titan in slot 4
  // 3. Must have exactly 1 Spellcaster
  // 4. CRITICAL: Must have at least 1 Rank I or II CREATURE (not Building, not Spell)
  // 5. Cannot have a deck composed entirely of Spells (must have ≥1 permanent)
  // ============================================================================
  
  if (stats.unitCount < 4) stats.validationErrors.push("Must have 4 Units");
  if (!stats.titanCount) stats.validationErrors.push("Must have 1 Titan");
  if (!stats.hasSpellcaster) stats.validationErrors.push("Select a Spellcaster");

  // RULE 4: Rank I/II Creature Requirement (Blocking Error when deck is full)
  // This ensures early-game board presence and prevents degenerate spell-heavy strategies
  if (stats.unitCount === 4 && stats.rank1or2CreatureCount === 0) {
      stats.validationErrors.push("Must include at least 1 Rank I or II Creature");
  }

  // RULE 5: Prevent All-Spell/Building Decks (Must have at least one Creature)
  // Note: Buildings and Spells do not satisfy this requirement. Titan (slot 5) doesn't count toward this requirement.
  const creatureCount = deck.slots.slice(0, 4).filter(s => s.unit && s.unit.category === 'Creature').length;
  if (stats.unitCount === 4 && creatureCount === 0) {
      stats.validationErrors.push("Deck must include at least 1 Creature (cannot be all Spells or Buildings)");
  }

  // Passive reminder for Rank I/II Creature (Friendly tip when deck is incomplete)
  const rankReminder = stats.unitCount > 0 && stats.unitCount < 4 && stats.rank1or2CreatureCount === 0 
    ? "Tip: Include at least one Rank I or II Creature for early pressure" 
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
    moveSlot: swapSlots, // Alias for now as swap handles move
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
