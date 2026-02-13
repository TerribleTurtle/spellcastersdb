import { Spell, Spellcaster, Titan, Unit } from "./api";


export type SlotIndex = number;

/**
 * Represents a validation result for a deck or slot operation.
 */
export interface ValidationStatus {
  isValid: boolean;
  errors: string[];
}

/**
 * Distinguishes between standard Unit slots and the restricted Titan slot.
 * - `TITAN`: Only for Titan-class entities. Max 1 per deck.
 * - `UNIT`: Standard slots for Units and Spells.
 */
import { SlotType } from "./enums";

export { SlotType };

export interface DeckSlot {
  /** 0-indexed position in the deck (0-4) */
  index: SlotIndex;
  /** The entity currently occupying this slot, or null if empty */
  unit: Unit | Spell | Titan | null;
  /** Allowable entity types for this specific slot */
  allowedTypes: SlotType[];
  /** If true, this slot cannot be modified by the user */
  isLocked?: boolean; 
}

/**
 * Core Deck structure.
 * Represents a complete set of 5 slots and a Spellcaster.
 */
export interface Deck {
  spellcaster: Spellcaster | null;
  /** Fixed tuple of 5 slots */
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  /** Unique ID (UUID) if the deck is persisted */
  id?: string; 
  /** User-defined name */
  name?: string; 
}

/**
 * Calculated statistics for a deck.
 * Used for validation and UI display.
 */
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

export interface DeckOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string; // Standardized error code
  message?: string;
}

// Helper for fixed length arrays
type Tuple<T, N extends number, R extends unknown[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

/**
 * Represents a Team of 3 Decks.
 */
export interface Team {
  id?: string;
  name: string;
  /** Fixed tuple of 3 Decks */
  decks: Tuple<Deck, 3>; // Sync with TEAM_LIMIT in constants
}
