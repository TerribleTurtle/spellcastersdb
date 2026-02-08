import { Unit, Spell, Titan, Spellcaster } from './api';

export type SlotIndex = 0 | 1 | 2 | 3 | 4;

export interface ValidationStatus {
  isValid: boolean;
  errors: string[];
}

export type SlotType = 'UNIT' | 'TITAN';

export interface DeckSlot {
  index: SlotIndex;
  unit: Unit | Spell | Titan | null;
  allowedTypes: SlotType[];
  isLocked?: boolean; // For potential future mechanics
}

export interface Deck {
  spellcaster: Spellcaster | null;
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  id?: string; // UUID for saved decks
  name?: string; // User defined name
}

export interface DeckStats {

  unitCounts: Record<string, number>;
  isValid: boolean;
  validationErrors: string[];
  // Validation Helpers
  unitCount: number;
  titanCount: number;
  hasSpellcaster: boolean;
  rank1or2Count: number;
  rank1or2CreatureCount: number;
}
