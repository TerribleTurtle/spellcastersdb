import { useEffect, useRef } from 'react';
import { useDeckStore } from '@/store/index';
import { Unit, Spell, Titan, Spellcaster } from '@/types/api';
import { serializeDeck, reconstructDeck } from '@/services/api/persistence';
import { Deck } from '@/types/deck';

interface UseDataHydrationProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

/**
 * Hydrates ALL persisted deck data with fresh API data on mount.
 * This fixes stale snapshots (e.g. old cooldowns) in LocalStorage.
 *
 * Uses existing `serializeDeck` (snapshot -> IDs) and `reconstructDeck` (IDs + Fresh Data -> Deck)
 * utilities to seamlessly refresh data without losing user customizations.
 */
export function useDataHydration({ units, spellcasters }: UseDataHydrationProps) {
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Guard: Only run once, and only when data is available
    if (hasHydrated.current) return;
    if (!units || units.length === 0) return;
    if (!spellcasters || spellcasters.length === 0) return;

    // Helper: Hydrate a single deck using fresh API data
    const hydrateDeck = (deck: Deck): Deck => {
      if (!deck || !deck.slots) return deck;
      try {
        const stored = serializeDeck(deck);
        const fresh = reconstructDeck(stored, units, spellcasters);
        return {
          ...fresh,
          id: deck.id || fresh.id,
          name: deck.name || fresh.name,
        };
      } catch (e) {
        console.error('[Hydration] Failed for deck:', deck.name, e);
        return deck; // Fallback to stale data rather than crashing
      }
    };

    try {
      const state = useDeckStore.getState();
      const savedDecks = state.savedDecks ?? [];
      const currentDeck = state.currentDeck;
      const teamDecks = state.teamDecks ?? [];
      const savedTeams = state.savedTeams ?? [];

      const freshSavedDecks = savedDecks.map(hydrateDeck);
      const freshCurrentDeck = currentDeck ? hydrateDeck(currentDeck) : currentDeck;
      const freshTeamDecks = teamDecks.map(hydrateDeck) as [Deck, Deck, Deck];
      const freshSavedTeams = savedTeams.map((team) => ({
        ...team,
        decks: (team.decks ?? []).map(hydrateDeck) as [Deck, Deck, Deck],
      }));

      useDeckStore.setState({
        savedDecks: freshSavedDecks,
        currentDeck: freshCurrentDeck,
        teamDecks: freshTeamDecks,
        savedTeams: freshSavedTeams,
      });

      hasHydrated.current = true;
    } catch (e) {
      console.error('💧 [Hydration] Batch hydration failed:', e);
    }
  }, [units, spellcasters]);
}
