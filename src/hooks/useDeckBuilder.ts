import { useState, useEffect, useCallback, useRef } from 'react';
import { Unit, Spellcaster } from '@/types/api';
import { Deck, DeckSlot, SlotIndex } from '@/types/deck';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_CURRENT = 'spellcasters_deck_v1';
const STORAGE_KEY_SAVED = 'spellcasters_saved_decks_v1';

// Internal Storage Format (IDs only)
interface StoredDeck {
  id?: string;
  name?: string;
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
  name: '',
};

// Helper: Convert Deck to Stored Format
function serializeDeck(deck: Deck): StoredDeck {
  return {
    id: deck.id,
    name: deck.name,
    spellcasterId: deck.spellcaster?.hero_id || null,
    slotIds: deck.slots.map(s => s.unit?.entity_id || null) as [string | null, string | null, string | null, string | null, string | null]
  };
}

// Helper: Reconstruct Deck from Stored Format
function reconstructDeck(stored: StoredDeck, units: Unit[], spellcasters: Spellcaster[]): Deck {
    const newSlots = INITIAL_SLOTS.map(s => ({ ...s }));
    
    stored.slotIds.forEach((id, idx) => {
        if (id && idx < 5) {
            const freshUnit = units.find(u => u.entity_id === id);
            if (freshUnit) {
                 newSlots[idx] = { ...newSlots[idx], unit: freshUnit };
            }
        }
    });

    const freshSpellcaster = stored.spellcasterId 
        ? spellcasters.find(s => s.hero_id === stored.spellcasterId) 
        : null;

    return {
        id: stored.id,
        name: stored.name,
        spellcaster: freshSpellcaster || null,
        slots: newSlots as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot]
    };
}

export function useDeckBuilder(availableUnits: Unit[] = [], availableSpellcasters: Spellcaster[] = []) {
  const [deck, setDeck] = useState<Deck>(INITIAL_DECK);
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastError] = useState<string | null>(null);
  const hasHydrated = useRef(false);

  // 1. Hydration Load (Current Deck + Saved Decks)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasHydrated.current) return;

    // Load Current Draft
    const savedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (savedCurrent) {
      try {
        const stored: StoredDeck = JSON.parse(savedCurrent);
        setDeck(reconstructDeck(stored, availableUnits, availableSpellcasters));
      } catch (e) {
        console.error('Failed to load current deck', e);
      }
    }

    // Load Saved Decks
    const savedList = localStorage.getItem(STORAGE_KEY_SAVED);
    if (savedList) {
        try {
            const storedList: StoredDeck[] = JSON.parse(savedList);
            const reconstructedList = storedList.map(d => reconstructDeck(d, availableUnits, availableSpellcasters));
            setSavedDecks(reconstructedList);
        } catch (e) {
            console.error('Failed to load saved decks list', e);
        }
    }

    hasHydrated.current = true;
    setIsInitialized(true);
  }, [availableUnits, availableSpellcasters]);

  // 2. Persistence (Current Deck Auto-Save)
  useEffect(() => {
    if (isInitialized) {
      const stored = serializeDeck(deck);
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(stored));
    }
  }, [deck, isInitialized]);

  // 3. Persistence (Saved Decks List)
  useEffect(() => {
    if (isInitialized) {
        const storedList = savedDecks.map(serializeDeck);
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(storedList));
    }
  }, [savedDecks, isInitialized]);

  // --- Actions ---

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
      if (index < 4) {
          const existingIndex = prev.slots.findIndex((s, i) => 
               i < 4 && i !== index && s.unit?.entity_id === unit.entity_id
          );
          
          if (existingIndex !== -1) {
               newSlots[existingIndex] = { ...newSlots[existingIndex], unit: prev.slots[index].unit };
          }
      }
      
      const slot = newSlots[index];
      const isTitan = unit.category === 'Titan';
      
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

          if (unitB) {
              const isTitanB = unitB.category === 'Titan';
              if (slotA.allowedTypes.includes('TITAN') && !isTitanB) return prev;
              if (slotA.allowedTypes.includes('UNIT') && isTitanB) return prev;
          }

          if (unitA) {
              const isTitanA = unitA.category === 'Titan';
              if (slotB.allowedTypes.includes('TITAN') && !isTitanA) return prev;
              if (slotB.allowedTypes.includes('UNIT') && isTitanA) return prev;
          }

          newSlots[indexA] = { ...newSlots[indexA], unit: unitB };
          newSlots[indexB] = { ...newSlots[indexB], unit: unitA };

          return { ...prev, slots: newSlots };
      });
  }, []);

  const clearDeck = useCallback(() => {
      setDeck({ ...INITIAL_DECK, id: undefined, name: '' }); 
      // Note: We clear ID so it becomes a "New Deck", preserving the old Saved Deck if it existed
  }, []);

  const setDeckState = useCallback((newDeck: Deck) => {
      setDeck(newDeck);
  }, []);

  const setDeckName = useCallback((name: string) => {
      setDeck(prev => ({ ...prev, name }));
  }, []);

  // --- Saved Decks Logic ---

  const saveDeck = useCallback((nameInput: string) => {
      setDeck(current => {
          // Default name logic
          let finalName = nameInput.trim();
          if (!finalName) {
              finalName = current.spellcaster?.name
                ? `${current.spellcaster.name} Deck`
                : "Untitled Deck";
          }

          // Smart Save:
          // 1. If we have an ID, use it.
          // 2. If no ID, check if a deck with this name already exists.
          let id = current.id;
          if (!id) {
              const existingByName = savedDecks.find(d => (d.name || "").toLowerCase() === finalName.toLowerCase());
              if (existingByName) {
                  id = existingByName.id;
              } else {
                  id = uuidv4();
              }
          }

          const deckToSave: Deck = { ...current, name: finalName, id };

          setSavedDecks(prev => {
              const existingIndex = prev.findIndex(d => d.id === id);
              if (existingIndex >= 0) {
                  const newSaved = [...prev];
                  newSaved[existingIndex] = deckToSave;
                  return newSaved;
              }
              return [...prev, deckToSave];
          });

          return deckToSave;
      });
  }, [savedDecks]);

  const loadDeck = useCallback((id: string) => {
      const target = savedDecks.find(d => d.id === id);
      if (target) {
          // Deep clone to avoid reference issues
          const clone: Deck = {
              ...target,
              slots: target.slots.map(s => ({...s})) as typeof target.slots
          };
          setDeck(clone);
      }
  }, [savedDecks]);

  const deleteDeck = useCallback((id: string) => {
    setSavedDecks(prev => prev.filter(d => d.id !== id));
    // If we deleted the current deck, we just clear the ID from the current view so it becomes a "new draft"
    setDeck(current => current.id === id ? { ...current, id: undefined } : current);
  }, []);

  const importDecks = useCallback((newDecks: Deck[]) => {
      setSavedDecks(prev => {
          // enhance new decks with IDs if missing and ensure no ID collisions
          const safeNewDecks = newDecks.map(d => ({
              ...d,
              id: uuidv4(), // Always assign new ID on import to avoid collisions/overwrites
              name: d.name || "Imported Deck"
          }));
          return [...prev, ...safeNewDecks];
      });
  }, []);

  const duplicateDeck = useCallback((id: string) => {
      const target = savedDecks.find(d => d.id === id);
      if (target) {
          const newId = uuidv4();
          const clone: Deck = {
              ...target,
              id: newId,
              name: `${target.name} (Copy)`,
              slots: target.slots.map(s => ({...s})) as typeof target.slots
          };
          
          setSavedDecks(prev => [...prev, clone]);
          setDeck(clone); // Open the new copy immediately
      }
  }, [savedDecks]);


  // --- Validation ---
  const stats = {
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

  if (stats.unitCount < 4) stats.validationErrors.push("Must have 4 Units");
  if (!stats.titanCount) stats.validationErrors.push("Must have 1 Titan");
  if (!stats.hasSpellcaster) stats.validationErrors.push("Select a Spellcaster");

  if (stats.unitCount === 4 && stats.rank1or2CreatureCount === 0) {
      stats.validationErrors.push("Must include at least 1 Rank I or II Creature");
  }

  const creatureCount = deck.slots.slice(0, 4).filter(s => s.unit && s.unit.category === 'Creature').length;
  if (stats.unitCount === 4 && creatureCount === 0) {
      stats.validationErrors.push("Deck must include at least 1 Creature (cannot be all Spells or Buildings)");
  }

  const rankReminder = stats.unitCount > 0 && stats.unitCount < 4 && stats.rank1or2CreatureCount === 0 
    ? "Tip: Include at least one Rank I or II Creature for early pressure" 
    : null;

  stats.isValid = stats.validationErrors.length === 0;

  const isEmpty = !deck.spellcaster && deck.slots.every(s => !s.unit);

  return {
    deck,
    savedDecks,
    isInitialized,
    setSpellcaster,
    removeSpellcaster,
    setSlot,
    clearSlot,
    clearDeck,
    moveSlot: swapSlots,
    setDeckState,
    setDeckName,
    saveDeck,
    loadDeck,
    deleteDeck,
    importDecks, // New
    duplicateDeck,
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
