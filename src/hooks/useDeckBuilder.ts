"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { Unit, Spellcaster, Spell, Titan } from '@/types/api';
import { Deck, DeckSlot, SlotIndex } from '@/types/deck';
import { v4 as uuidv4 } from 'uuid';
import { validateDeck } from '@/lib/deck-validation';

// Storage Keys
// STORAGE KEYS
export const STORAGE_KEY_CURRENT = 'spellcasters_deck_v1';
export const STORAGE_KEY_SAVED = 'spellcasters_saved_decks_v1';

// LEGACY KEYS (Migration Support)
const STORAGE_KEY_LEGACY_CURRENT = 'spellcasters_deck';
const STORAGE_KEY_LEGACY_SAVED = 'spellcasters_saved_decks';

// Internal Storage Format (IDs only)
export interface StoredDeck {
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
export function serializeDeck(deck: Deck): StoredDeck {
  return {
    id: deck.id,
    name: deck.name,
    spellcasterId: deck.spellcaster?.spellcaster_id || null, // Ensure we use the ID, not the whole object
    slotIds: deck.slots.map(s => s.unit?.entity_id || null) as [string | null, string | null, string | null, string | null, string | null]
  };
}

// Helper: Reconstruct Deck from Stored Format
export function reconstructDeck(stored: StoredDeck, units: (Unit | Spell | Titan)[], spellcasters: Spellcaster[]): Deck {
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
        ? spellcasters.find(s => s.spellcaster_id === stored.spellcasterId) 
        : null;

    return {
        id: stored.id,
        name: stored.name,
        spellcaster: freshSpellcaster || null,
        slots: newSlots as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot]
    };
}

export function useDeckBuilder(
    availableUnits: (Unit | Spell | Titan)[] = [], 
    availableSpellcasters: Spellcaster[] =[],
    storageKey: string | null = STORAGE_KEY_CURRENT,
    savedDecksKey: string | null = STORAGE_KEY_SAVED,
    initialDeck: Deck = INITIAL_DECK
) {
  const [deck, setDeck] = useState<Deck>(initialDeck);
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastError] = useState<string | null>(null);
  const hasHydrated = useRef(false);
  const loadedKeyRef = useRef<string | null>(storageKey); // Track which key is currently loaded in 'deck'

  // 1. Hydration Load (Current Deck + Saved Decks)
  const EVENT_SAVED_DECKS_UPDATE = 'spellcasters:saved-decks-update';

    // Ref to skip persistence if the update came from an external sync
    const skipPersistence = useRef(false);

    // 1. Hydration Load (Current Deck + Saved Decks)

    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;
        
        // We only skip if we've already hydrated AND the key hasn't changed.
        // But since we want to support key changes without remounting, we should
        // checking if the current deck state matches the key is hard.
        // Instead, we'll just allow re-hydration if the key is different from what we last loaded?
        // Actually, just let it run if storageKey changes.

        if (storageKey) {
            let savedCurrent = localStorage.getItem(storageKey);
            
            // MIGRATION: Check Legacy if current is missing
            if (!savedCurrent && storageKey === STORAGE_KEY_CURRENT) {
                const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_CURRENT);
                if (legacy) {
                    console.log("Migrating Current Deck from Legacy Storage...");
                    savedCurrent = legacy;
                }
            }

            if (savedCurrent) {
                try {
                    const stored: StoredDeck = JSON.parse(savedCurrent);
                    // Force update even if initialized, because key changed
                    const reconstructed = reconstructDeck(stored, availableUnits, availableSpellcasters);
                    // eslint-disable-next-line
                    setDeck(prev => {
                        // Prevent unnecessary updates if data hasn't changed (Deep Compare via serialization)
                        if (JSON.stringify(serializeDeck(prev)) === JSON.stringify(serializeDeck(reconstructed))) {
                            return prev;
                        }
                        return reconstructed;
                    });
                    loadedKeyRef.current = storageKey;
                } catch (e) {
                    console.error('Failed to load current deck', e);
                }
            } else {
                 if (hasHydrated.current) {
                     setDeck(initialDeck);
                     loadedKeyRef.current = storageKey;
                 }
            }
        }

        // Load Saved Decks (Only once or if key changes)
        if (savedDecksKey && (!hasHydrated.current || savedDecksKey !== STORAGE_KEY_SAVED)) {
             // ... existing saved decks logic ...
             let savedList = localStorage.getItem(savedDecksKey);

             // MIGRATION: Check Legacy if list is missing/empty
             if (!savedList && savedDecksKey === STORAGE_KEY_SAVED) {
                 const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_SAVED);
                 if (legacy) {
                     console.log("Migrating Saved Decks from Legacy Storage...");
                     savedList = legacy;
                     // We don't delete legacy yet, just read from it.
                     // The next 'useEffect' (Persistence) will auto-save this to the NEW key, completing migration.
                 }
             }

             if (savedList) {
                 try {
                     const storedList: StoredDeck[] = JSON.parse(savedList);
                     const reconstructedList = storedList.map(d => reconstructDeck(d, availableUnits, availableSpellcasters));
                     setSavedDecks(reconstructedList);
                 } catch (e) {
                     console.error('Failed to load saved decks list', e);
                 }
             }
        }

        hasHydrated.current = true;
        setIsInitialized(true);
    }, [availableUnits, availableSpellcasters, storageKey, savedDecksKey, initialDeck]);



    // 2. Persistence (Current Deck Auto-Save)
    useEffect(() => {
        if (isInitialized && storageKey) {
            // Prevent writing race condition: Only save if we are writing the data that belongs to this key
            if (storageKey !== loadedKeyRef.current) return;

            const stored = serializeDeck(deck);
            const json = JSON.stringify(stored);
            localStorage.setItem(storageKey, json);
            
            // Dispatch event for local synchronization (e.g. for TeamBuilder to know a slot updated)
            window.dispatchEvent(new CustomEvent('spellcasters:deck-written', { 
                detail: { key: storageKey, deck: stored } 
            }));
        }
    }, [deck, isInitialized, storageKey]);

    // 3. Persistence (Saved Decks List) & Synchronization
    useEffect(() => {
        // If we are just syncing from another tab/hook, skip writing back to storage
        if (skipPersistence.current) {
            skipPersistence.current = false;
            return;
        }

        if (isInitialized && savedDecksKey) {
            const storedList = savedDecks.map(serializeDeck);
            localStorage.setItem(savedDecksKey, JSON.stringify(storedList));
            
            // Dispatch event to notify other hooks in the same window
            window.dispatchEvent(new Event(EVENT_SAVED_DECKS_UPDATE));
        }
    }, [savedDecks, isInitialized, savedDecksKey]);

    const EVENT_CURRENT_DECK_UPDATE = 'spellcasters:current-deck-update';

    // 4. Cross-Instance & Cross-Tab Synchronization (Saved Lists)
    useEffect(() => {
        if (!savedDecksKey || !isInitialized) return;

        const handleSync = () => {
            const savedList = localStorage.getItem(savedDecksKey);
            if (savedList) {
                try {
                    const storedList: StoredDeck[] = JSON.parse(savedList);
                    const currentString = JSON.stringify(savedDecks.map(serializeDeck));
                    if (JSON.stringify(storedList) !== currentString) {
                         const reconstructedList = storedList.map(d => reconstructDeck(d, availableUnits, availableSpellcasters));
                         skipPersistence.current = true;
                         setSavedDecks(reconstructedList);
                    }
                } catch (e) {
                    console.error('Failed to sync saved decks', e);
                }
            }
        };

        window.addEventListener(EVENT_SAVED_DECKS_UPDATE, handleSync);
        window.addEventListener('storage', handleSync); 

        return () => {
            window.removeEventListener(EVENT_SAVED_DECKS_UPDATE, handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, [savedDecksKey, isInitialized, availableUnits, availableSpellcasters, savedDecks]);

    // 5. Current Deck Synchronization (For Team/Same-Page updates)
    useEffect(() => {
        if (!storageKey || !isInitialized) return;

        const handleCurrentSync = (e: Event) => {
            // Check if this event targets our key
            if (e instanceof CustomEvent && e.detail?.key && e.detail.key !== storageKey) {
                return; 
            }
            
            // For general 'storage' events (cross-tab), we might not have key details, check everything?
            // Actually 'storage' event provides key.
            if (e instanceof StorageEvent && e.key !== storageKey) {
                return;
            }

            const savedCurrent = localStorage.getItem(storageKey);
            if (savedCurrent) {
                try {
                    const stored: StoredDeck = JSON.parse(savedCurrent);
                    
                    // Reconstruction
                    const newDeck = reconstructDeck(stored, availableUnits, availableSpellcasters);

                    // Compare to avoid loops if we triggered it (though custom events usually stay local)
                    // Serializing is heavy but safe
                    if (JSON.stringify(serializeDeck(deck)) !== JSON.stringify(stored)) {
                         setDeck(newDeck);
                    }
                } catch (err) {
                    console.error('Failed to sync current deck', err);
                }
            } else {
                // Storage cleared (or empty) -> Reset Deck if it has content
                // We check if it's already "empty" to avoid unnecessary re-renders
                // An empty deck has no spellcaster, no ID, and no units in slots.
                const hasContent = deck.id || deck.spellcaster || deck.slots.some(s => s.unit);
                if (hasContent) {
                     setDeck({ ...INITIAL_DECK, id: undefined, name: '' });
                }
            }
        };

        window.addEventListener(EVENT_CURRENT_DECK_UPDATE, handleCurrentSync);
        // We can reuse the 'storage' listener logic if we split it or add another listener
        // But let's keep it simple.

        return () => {
            window.removeEventListener(EVENT_CURRENT_DECK_UPDATE, handleCurrentSync);
        };
    }, [storageKey, isInitialized, availableUnits, availableSpellcasters, deck]);

  // --- Actions ---

  const setSpellcaster = useCallback((spellcaster: Spellcaster) => {
    setDeck(prev => ({ 
        ...prev, 
        spellcaster,
        name: prev.name ? prev.name : `${spellcaster.name} Deck`
    }));
  }, []);

  const removeSpellcaster = useCallback(() => {
    setDeck(prev => ({ ...prev, spellcaster: null }));
  }, []);

  const setSlot = useCallback((index: SlotIndex, unit: Unit | Spell | Titan) => {
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
      // Default name logic
      let finalName = nameInput.trim();
      if (!finalName) {
          finalName = deck.spellcaster?.name
            ? `${deck.spellcaster.name} Deck`
            : "Untitled Deck";
      }

      // Smart Save:
      // 1. If we have an ID, use it.
      // 2. If no ID, check if a deck with this name already exists.
      let id = deck.id;
      if (!id) {
          const existingByName = savedDecks.find(d => (d.name || "").toLowerCase() === finalName.toLowerCase());
          if (existingByName) {
              id = existingByName.id;
          } else {
              id = uuidv4();
          }
      }

      const deckToSave: Deck = { ...deck, name: finalName, id };

      setSavedDecks(prev => {
          const existingIndex = prev.findIndex(d => d.id === id);
          if (existingIndex >= 0) {
              const newSaved = [...prev];
              newSaved[existingIndex] = deckToSave;
              return newSaved;
          }
          return [...prev, deckToSave];
      });
      
      // Update current deck with the new info (saved status/ID)
      setDeck(deckToSave);

  }, [deck, savedDecks]);

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
    // If we deleted the current deck, we clear it completely
    setDeck(current => current.id === id ? { ...INITIAL_DECK, id: undefined, name: '' } : current);
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
  const { isValid, errors, stats } = useMemo(() => validateDeck(deck), [deck]);

  const rankReminder = stats.unitCount > 0 && stats.unitCount < 4 && stats.rank1or2CreatureCount === 0 
    ? "Tip: Include at least one Rank I or II Creature for early pressure" 
    : null;

  const isEmpty = !deck.spellcaster && deck.slots.every(s => !s.unit);

  // Check for Unsaved Changes
  const hasChanges = useMemo(() => {
     if (!isInitialized) return false;
     
     if (!deck.id) {
         // New Deck: Changes if not empty
         return !isEmpty;
     }
     
     const saved = savedDecks.find(d => d.id === deck.id);
     if (!saved) return true; // Should exist, but if not, it's dirty
     
     return JSON.stringify(serializeDeck(deck)) !== JSON.stringify(serializeDeck(saved));
  }, [deck, savedDecks, isInitialized, isEmpty]);

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
    saveAsCopy: useCallback((nameInput?: string) => {
        const newId = uuidv4();
        // Use provided name, or append (Copy) if none provided
        const finalName = nameInput ? nameInput.trim() : `${deck.name} (Copy)`;
        
        const deckToSave: Deck = { ...deck, id: newId, name: finalName };
        
        setSavedDecks(prev => [...prev, deckToSave]);
        setDeck(deckToSave);
    }, [deck]),
    saveNow: () => {
        if (storageKey) {
            // Apply a default name if missing to prevent "Untitled" in lists
            const effectiveDeck = {
                ...deck,
                name: deck.name || (deck.spellcaster ? `${deck.spellcaster.name} Deck` : "Untitled Deck")
            };
            const stored = serializeDeck(effectiveDeck);
            localStorage.setItem(storageKey, JSON.stringify(stored));
        }
    },
    loadDeck,
    deleteDeck,
    importDecks, // New
    duplicateDeck,
    isEmpty,
    lastError,
    validation: {
        isValid,
        errors,
        reminder: rankReminder
    },
    stats,
    reorderDecks: useCallback((newDecks: Deck[]) => {
        setSavedDecks(newDecks);
    }, []),
    hasChanges
  };
}
