import { Unit, Spellcaster } from './api';

export type SlotIndex = 0 | 1 | 2 | 3 | 4;

export interface ValidationStatus {
  isValid: boolean;
  errors: string[];
}

export type SlotType = 'UNIT' | 'TITAN';

export interface DeckSlot {
  index: SlotIndex;
  unit: Unit | null;
  allowedTypes: SlotType[];
  isLocked?: boolean; // For potential future mechanics
}

export interface Deck {
  spellcaster: Spellcaster | null;
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  name?: string; // For saved decks
}

export interface DeckStats {
  averageCost: number;
  averageChargeTime: number;
  unitCounts: Record<string, number>;
  isValid: boolean;
  validationErrors: string[];
}
