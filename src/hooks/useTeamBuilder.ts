"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { Deck, DeckSlot } from "@/types/deck";

import { StoredDeck, reconstructDeck, serializeDeck } from "./useDeckBuilder";

const STORAGE_KEY_TEAM_METADATA = "spellcasters_team_meta_v1";
// We use specific keys for the 3 active slots to leverage the existing useDeckBuilder persistence
export const STORAGE_KEY_SAVED_TEAMS = "spellcasters_saved_teams_v1";

// Legacy Keys for Migration
const STORAGE_KEY_LEGACY_TEAM_METADATA = "spellcasters_team_meta";
const STORAGE_KEY_LEGACY_SAVED_TEAMS = "spellcasters_saved_teams";

// We use specific keys for the 3 active slots to leverage the existing useDeckBuilder persistence
export const TEAM_SLOT_KEYS = [
  "spellcasters_team_slot_0",
  "spellcasters_team_slot_1",
  "spellcasters_team_slot_2",
];

export interface Team {
  id?: string;
  name: string;
  decks: [Deck, Deck, Deck];
}

interface StoredTeam {
  id?: string;
  name: string;
  deckData: [StoredDeck, StoredDeck, StoredDeck];
}

const INITIAL_TEAM_NAME = "New Team";

export function useTeamBuilder(
  availableUnits: (Unit | Spell | Titan)[],
  availableSpellcasters: Spellcaster[]
) {
  const [teamName, setTeamName] = useState(INITIAL_TEAM_NAME);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null); // null = Overview Mode
  const [teamDecks, setTeamDecks] = useState<[Deck, Deck, Deck] | null>(null);
  const [savedTeams, setSavedTeams] = useState<Team[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasHydrated = useRef(false);

  // --- Hydration ---

  const refreshTeamDecks = useCallback(() => {
    if (typeof window === "undefined") return;

    const loadedDecks: Deck[] = TEAM_SLOT_KEYS.map((key) => {
      const raw = localStorage.getItem(key);

      // MIGRATION: Check Legacy Slots (assuming they were just index based or had no _v1?
      // actually if they were 'spellcasters_team_slot_0', they might be same if we didn't change those keys.
      // I'll stick to migrating the Saved Lists for now as that's the big data loss.

      if (raw) {
        try {
          const stored: StoredDeck = JSON.parse(raw);
          return reconstructDeck(stored, availableUnits, availableSpellcasters);
        } catch (e) {
          console.error(`Failed to parse team slot ${key}`, e);
        }
      }
      // Return empty deck if missing
      return reconstructDeck(
        {
          spellcasterId: null,
          slotIds: [null, null, null, null, null],
        },
        availableUnits,
        availableSpellcasters
      );
    });

    setTeamDecks(loadedDecks as [Deck, Deck, Deck]);
  }, [availableUnits, availableSpellcasters]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasHydrated.current) return;

    // 1. Load Metadata (Name)
    let storedMeta = localStorage.getItem(STORAGE_KEY_TEAM_METADATA);

    // MIGRATION: Check Legacy Meta
    if (!storedMeta) {
      const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_TEAM_METADATA);
      if (legacy) {
        storedMeta = legacy;
      }
    }

    if (storedMeta) {
      try {
        const meta = JSON.parse(storedMeta);
        if (meta.name) {
          // Avoid synchronous update warning
          setTimeout(() => setTeamName(meta.name), 0);
        }
        if (meta.id) {
          setTimeout(() => setActiveTeamId(meta.id), 0);
        }
        if (meta.activeSlot !== undefined) {
          setTimeout(() => setActiveSlot(meta.activeSlot), 0);
        }
      } catch (e) {
        console.error("Failed to load team meta", e);
      }
    }

    // 2. Load Decks
    // 2. Load Decks
    setTimeout(() => refreshTeamDecks(), 0);

    // 3. Load Saved Teams List
    let storedSaved = localStorage.getItem(STORAGE_KEY_SAVED_TEAMS);

    // MIGRATION: Check Legacy
    if (!storedSaved) {
      const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_SAVED_TEAMS);
      if (legacy) {
        storedSaved = legacy;
        // Will be auto-saved to new key by persistence effect
      }
    }

    if (storedSaved) {
      try {
        const list: StoredTeam[] = JSON.parse(storedSaved);
        const reconstructedList = list.map((t) => ({
          id: t.id,
          name: t.name,
          decks: t.deckData.map((d) =>
            reconstructDeck(d, availableUnits, availableSpellcasters)
          ) as [Deck, Deck, Deck],
        }));
        setTimeout(() => setSavedTeams(reconstructedList), 0);
      } catch (e) {
        console.error("Failed to load saved teams", e);
      }
    }

    hasHydrated.current = true;
    hasHydrated.current = true;
    // Prevent synchronous setState in effect
    setTimeout(() => setIsInitialized(true), 0);
  }, [refreshTeamDecks, availableUnits, availableSpellcasters]);

  // --- Synchronization ---
  // Listen for Deck Updates (from useDeckBuilder) to keep teamDecks fresh
  useEffect(() => {
    const handleDeckWrite = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { key } = customEvent.detail || {};
      if (TEAM_SLOT_KEYS.includes(key)) {
        refreshTeamDecks();
      }
    };

    window.addEventListener("spellcasters:deck-written", handleDeckWrite);
    return () =>
      window.removeEventListener("spellcasters:deck-written", handleDeckWrite);
  }, [refreshTeamDecks]);

  // --- Persistence ---

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem(
      STORAGE_KEY_TEAM_METADATA,
      JSON.stringify({
        name: teamName,
        id: activeTeamId,
        activeSlot,
      })
    );
  }, [teamName, activeTeamId, activeSlot]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    const storedList: StoredTeam[] = savedTeams.map((t) => ({
      id: t.id,
      name: t.name,
      deckData: t.decks.map(serializeDeck) as [
        StoredDeck,
        StoredDeck,
        StoredDeck,
      ],
    }));
    localStorage.setItem(STORAGE_KEY_SAVED_TEAMS, JSON.stringify(storedList));
  }, [savedTeams]);

  // --- Actions ---

  const enterEditMode = (slotIndex: number) => {
    refreshTeamDecks();
    setActiveSlot(slotIndex);
  };

  const exitEditMode = () => {
    // When exiting edit mode, we must refresh our local state because
    // useDeckBuilder changed localStorage behind our back
    refreshTeamDecks();
    setActiveSlot(null);
  };

  const saveTeam = (nameInput: string, activeDeckOverride?: Deck) => {
    // Read current state from storage
    const currentDecks = TEAM_SLOT_KEYS.map((key, idx) => {
      // If this is the active slot and we have an override, use it!
      if (activeSlot === idx && activeDeckOverride) {
        return activeDeckOverride;
      }

      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const stored: StoredDeck = JSON.parse(raw);
          return reconstructDeck(stored, availableUnits, availableSpellcasters);
        } catch (e) {
          console.error(`Failed to parse team slot ${key}`, e);
        }
      }
      return reconstructDeck(
        {
          spellcasterId: null,
          slotIds: [null, null, null, null, null],
        },
        availableUnits,
        availableSpellcasters
      );
    }) as [Deck, Deck, Deck];

    const name = nameInput.trim() || teamName || "Untitled Team";

    // Determine ID upfront
    let targetId = activeTeamId;
    if (!targetId) {
      targetId = uuidv4();
      setActiveTeamId(targetId);
    }

    setSavedTeams((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === targetId);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          name,
          decks: currentDecks,
        };
        return updated;
      } else {
        const newTeam: Team = { id: targetId!, name, decks: currentDecks };
        return [...prev, newTeam];
      }
    });

    setTeamName(name);
    setTeamDecks(currentDecks);

    // Ensure the ACTIVE slots in local storage are also updated to match what we just saved
    // This prevents state desync if we click "Update" multiple times
    currentDecks.forEach((deck, idx) => {
      const key = TEAM_SLOT_KEYS[idx];
      const serial = serializeDeck(deck);
      localStorage.setItem(key, JSON.stringify(serial));
    });

    // Refresh to ensure 'initialTeamRef' matches current state, clearing hasChanges
    setTimeout(() => refreshTeamDecks(), 0);
  };

  const loadTeam = (teamId: string) => {
    const target = savedTeams.find((t) => t.id === teamId);
    if (target) {
      setTeamName(target.name);
      setActiveTeamId(target.id || null);
      setActiveSlot(0); // Auto-select Slot 0 (Deck 1) on load
      setTeamDecks(target.decks); // Sync update to prevent "hasChanges" race condition
      // Write directly to storage keys to "Load" it

      target.decks.forEach((deck, idx) => {
        const key = TEAM_SLOT_KEYS[idx];
        const serial = serializeDeck(deck);
        localStorage.setItem(key, JSON.stringify(serial));

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("spellcasters:current-deck-update", {
              detail: { key },
            })
          );
        }
      });
      refreshTeamDecks();
    }
  };

  const deleteTeam = (teamId: string) => {
    setSavedTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (
      teamDecks &&
      savedTeams.find((t) => t.id === teamId)?.name === teamName
    ) {
      // If deleting current, maybe reset? For now just keep current state.
    }
  };

  const duplicateTeam = (teamId: string) => {
    const target = savedTeams.find((t) => t.id === teamId);
    if (target) {
      const newId = uuidv4();
      // Deep copy decks to avoid reference issues
      const newDecks = target.decks.map((d) => ({
        ...d,
        // Typically slots are the only thing needing deep copy besides the deck object itself
        slots: d.slots.map((s) => ({ ...s })),
      })) as [Deck, Deck, Deck];

      const newTeam: Team = {
        id: newId,
        name: `${target.name} (Copy)`,
        decks: newDecks,
      };

      setSavedTeams((prev) => [...prev, newTeam]);
    }
  };

  const importSoloDeck = (slotIndex: number, deck: Deck) => {
    const key = TEAM_SLOT_KEYS[slotIndex];
    // Generate new ID for the imported copy and ensure slots are deep copied to break references
    const importDeck: Deck = {
      ...deck,
      id: uuidv4(),
      slots: deck.slots.map((s) => ({ ...s })) as [
        DeckSlot,
        DeckSlot,
        DeckSlot,
        DeckSlot,
        DeckSlot,
      ],
    };
    const serial = serializeDeck(importDeck);
    localStorage.setItem(key, JSON.stringify(serial));

    if (typeof window !== "undefined") {
      // Notify useDeckBuilder about this specific key update
      const event = new CustomEvent("spellcasters:current-deck-update", {
        detail: { key },
      });
      window.dispatchEvent(event);
    }

    // Optimistic update
    setTeamDecks((prev) => {
      if (!prev) return prev;
      const next = [...prev] as [Deck, Deck, Deck];
      next[slotIndex] = importDeck;
      return next;
    });
  };

  const loadTeamFromData = (decks: Deck[]) => {
    // Prepare decks with new IDs first
    const processedDecks = decks.slice(0, 3).map((deck) => ({
      ...deck,
      id: uuidv4(),
      slots: deck.slots.map((s) => ({ ...s })) as [
        DeckSlot,
        DeckSlot,
        DeckSlot,
        DeckSlot,
        DeckSlot,
      ],
    })) as [Deck, Deck, Deck];

    // Save to storage
    processedDecks.forEach((deck, idx) => {
      const key = TEAM_SLOT_KEYS[idx];
      const serial = serializeDeck(deck);
      localStorage.setItem(key, JSON.stringify(serial));

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("spellcasters:current-deck-update", {
            detail: { key },
          })
        );
      }
    });

    // Synchronous State Update
    setTeamDecks(processedDecks);

    // Reset ID to null since this is a new "Copy"
    setActiveTeamId(null);
    setTeamName(`${teamName} (Copy)`);
  };

  const importSoloDecks = (decks: Deck[]) => {
    // Legacy/Generic handler - assumes Active Slot if available
    if (typeof activeSlot === "number" && decks.length > 0) {
      importSoloDeck(activeSlot, decks[0]);
    }
  };

  const exportSlotToSolo = (slotIndex: number, decksState: Deck) => {
    const deckToExport = {
      ...decksState,
      id: uuidv4(),
      name: `${decksState.name} (From Team)`,
    };

    const soloKey = "spellcasters_saved_decks_v1";
    const rawSolo = localStorage.getItem(soloKey);
    const soloList: StoredDeck[] = rawSolo ? JSON.parse(rawSolo) : [];
    soloList.push(serializeDeck(deckToExport));
    localStorage.setItem(soloKey, JSON.stringify(soloList));

    // Dispatch Event for Sync
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("spellcasters:saved-decks-update"));
    }

    return deckToExport;
  };

  const clearTeam = () => {
    setTeamName(INITIAL_TEAM_NAME);
    setActiveTeamId(null);
    setTeamName(INITIAL_TEAM_NAME);
    setActiveTeamId(null);
    // setTeamDecks(null); // DANGEROUS: App expects array.

    // Create empty state
    const emptyState = TEAM_SLOT_KEYS.map(() =>
      reconstructDeck(
        {
          spellcasterId: null,
          slotIds: [null, null, null, null, null],
        },
        availableUnits,
        availableSpellcasters
      )
    ) as [Deck, Deck, Deck];

    setTeamDecks(emptyState);

    // Reset all slots in storage
    TEAM_SLOT_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      // Notify useDeckBuilder
      window.dispatchEvent(
        new CustomEvent("spellcasters:current-deck-update", {
          detail: { key },
        })
      );
    });
    // refreshTeamDecks(); // No longer needed as we set state explicitly
  };

  const hasChanges = useMemo(() => {
    if (!isInitialized) return false;

    // Calculate Current State Serial
    const currentSerial = JSON.stringify({
      name: teamName,
      // We need to serialize the decks.
      decks: teamDecks?.map(serializeDeck),
    });

    if (!activeTeamId) {
      // Compare against "New/Empty" State
      // Empty state: Name="New Team", Decks=Empty
      // We can just check if it matches that directly, or simpler:
      // Check if name is default AND all decks are empty
      const isNameDefault = teamName === INITIAL_TEAM_NAME;
      const areDecksEmpty = teamDecks?.every(
        (d) => !d.spellcaster && d.slots.every((s) => !s.unit)
      );

      return !(isNameDefault && areDecksEmpty);
    }

    // Compare against Saved Team
    const saved = savedTeams.find((t) => t.id === activeTeamId);
    if (!saved) return true; // Orphaned ID?

    const savedSerial = JSON.stringify({
      name: saved.name,
      decks: saved.decks.map(serializeDeck),
    });

    return currentSerial !== savedSerial;
  }, [teamName, teamDecks, activeTeamId, savedTeams, isInitialized]);

  return {
    teamName,
    setTeamName,
    activeSlot,
    enterEditMode,
    exitEditMode,
    teamDecks,
    refreshTeamDecks,
    savedTeams,
    saveTeam,
    loadTeam,
    deleteTeam,
    duplicateTeam,
    importSoloDeck, // Fixed reference
    importSoloDecks,
    loadTeamFromData,
    exportSlotToSolo,
    activeTeamId,

    setTeamId: setActiveTeamId,
    clearTeam,
    reorderTeams: useCallback((newTeams: Team[]) => {
      setSavedTeams(newTeams);
    }, []),
    hasChanges,
  };
}
