import { Deck, SlotIndex, Team } from "@/types/deck";
import { Unit, Spell, Titan, Spellcaster, Consumable } from "@/types/api";

export type DeckBuilderMode = "SOLO" | "TEAM";

/**
 * Operations for the Solo Deck Builder.
 * Manages the construction of a single deck.
 */
export interface DeckActions {
  // Deck Editor Actions
  setDeck: (deck: Deck) => void;
  setSpellcaster: (spellcaster: Spellcaster) => void;
  removeSpellcaster: () => void;
  setSlot: (index: SlotIndex, unit: Unit | Spell | Titan) => void;
  clearSlot: (index: SlotIndex) => void;
  swapSlots: (indexA: number, indexB: number) => void;
  /** Attempts to add an item to the first available slot. Returns error message if failed. */
  quickAdd: (item: Unit | Spellcaster | Spell | Titan) => string | null; 
  clearDeck: () => void;
  setDeckName: (name: string) => void;
}

export interface SoloState extends DeckActions {
  /** The currently active deck in Solo Mode */
  currentDeck: Deck;
}

/**
 * Operations for the Team Builder.
 * Manages a collection of 3 decks and their metadata.
 */
export interface TeamDataActions {
  setTeamName: (name: string) => void;
  setActiveTeamId: (id: string | null) => void;
  setTeamDecks: (decks: [Deck, Deck, Deck]) => void;
  
  // Team Persistence Actions
  saveTeam: (newId: string, nameInput?: string, activeSlot?: number, activeDeckOverride?: Deck) => void;
  loadTeam: (id: string) => void;
  deleteTeam: (id: string) => void;
  deleteTeams: (ids: string[]) => void;
  duplicateTeam: (id: string, newId: string) => void;
  
  // Team Slot Actions (Granular)
  setTeamSlot: (deckIndex: number, slotIndex: SlotIndex, item: Unit | Spell | Titan) => void;
  clearTeamSlot: (deckIndex: number, slotIndex: SlotIndex) => void;
  setTeamSpellcaster: (deckIndex: number, item: Spellcaster) => void;
  removeTeamSpellcaster: (deckIndex: number) => void;
  swapTeamSlots: (deckIndex: number, indexA: number, indexB: number) => void;

  // Team Actions
  importSoloDeckToTeam: (slotIndex: number, deck: Deck, newId: string) => void;
  loadTeamFromData: (decks: Deck[], newIds: string[]) => void;
  clearTeam: () => void;
  
  // Cross-Pollenation
  exportTeamSlotToSolo: (slotIndex: number, deck: Deck, newId: string) => void;
  renameSavedTeam: (id: string, newName: string) => void;
  clearSavedTeams: () => void;
  
  // Smart Add
  quickAddToTeam: (slotIndex: number, item: Unit | Spell | Titan | Spellcaster) => string | null;
  moveCardBetweenDecks: (sourceDeckIndex: number, sourceSlotIndex: SlotIndex, targetDeckIndex: number, targetSlotIndex: SlotIndex) => void;
  moveSpellcasterBetweenDecks: (sourceDeckIndex: number, targetDeckIndex: number) => void;
}

export interface TeamUIActions {
  /** Sets the index of the deck currently being edited in the Team view */
  setActiveSlot: (index: number | null) => void;
}

export type TeamActions = TeamDataActions & TeamUIActions;

export interface TeamDataState extends TeamDataActions {
  teamName: string;
  activeTeamId: string | null;
  teamDecks: Team["decks"]; // The 3 active decks in the team editor
  savedTeams: Team[];
}

export interface TeamUIState extends TeamUIActions {
    activeSlot: number | null; // Which slot (0-2) is being edited in main view
}

export type TeamState = TeamDataState & TeamUIState;

/**
 * Persistence operations for saving/loading individual decks.
 */
export interface PersistenceActions {
  saveDeck: (nameInput?: string) => void;
  saveAsCopy: (nameInput?: string) => void;
  loadDeck: (id: string) => void;
  deleteDeck: (id: string) => void;
  deleteDecks: (ids: string[]) => void;
  duplicateDeck: (id: string) => void;
  importDecks: (decks: Deck[]) => void;
  importTeams: (teams: Team[]) => void; // New action
  setSavedDecks: (decks: Deck[]) => void; // For reordering
  renameSavedDeck: (id: string, newName: string) => void;
  importDeckToLibrary: (deck: Deck) => void;
  checkDeckNameAvailable: (name: string, excludeId?: string) => boolean;
  clearSavedDecks: () => void;
}

export interface PersistenceState extends PersistenceActions {
  savedDecks: Deck[];
}

/**
 * UI State for the application.
 * Manages view modes, filters, and transient drag/drop state.
 */
export interface UIState {
  mode: DeckBuilderMode;
  viewSummary: boolean;
  isReadOnly: boolean;
  
  // Viewing State (migrated from DeckBuilderContainer)
  viewingTeamData: Deck[] | null;
  viewingTeamId: string | null;
  viewingTeamName: string | null;
  viewingDeckData: Deck | null;
  viewingDeckId: string | null;
  pendingImport: Deck | null;

  setMode: (mode: DeckBuilderMode) => void;
  setViewSummary: (view: boolean) => void;
  setIsReadOnly: (isReadOnly: boolean) => void;
  
  // New Actions
  setViewingTeam: (data: Deck[] | null, id?: string | null, name?: string) => void;
  setViewingDeck: (data: Deck | null, id?: string | null) => void;
  setPendingImport: (deck: Deck | null) => void;
  resolvePendingImport: (strategy: "OVERWRITE" | "SAVE_AND_OVERWRITE") => void;

  // Import State
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;

  // Global Drag State
  activeDragItem: Unit | Spell | Titan | Spellcaster | Consumable | null;
  setActiveDragItem: (item: Unit | Spell | Titan | Spellcaster | Consumable | null) => void;

  // Inspector State
  inspectorOpen: boolean;
  inspectedCard: Unit | Spell | Titan | Spellcaster | Consumable | null;
  inspectorPosition: { x: number; y: number } | null;
  inspectorOptions?: { isReadOnly?: boolean };
  openInspector: (item: Unit | Spell | Titan | Spellcaster | Consumable, position?: { x: number; y: number }, options?: { isReadOnly?: boolean }) => void;
  closeInspector: () => void;

  // Hover Inspector State
  hoveredItem: Unit | Spell | Titan | Spellcaster | Consumable | null;
  setHoveredItem: (item: Unit | Spell | Titan | Spellcaster | Consumable | null) => void;
  isInspectorHovered: boolean;
  setIsInspectorHovered: (isHovered: boolean) => void;

  // Command Center State
  commandCenterOpen: boolean;
  openCommandCenter: () => void;
  closeCommandCenter: () => void;

  // Global Browser State (Filters)
  browserFilters: {
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
  };
  setBrowserFilters: (filters: {
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
  }) => void;
  toggleBrowserFilter: (type: "schools" | "ranks" | "categories" | "classes", value: string) => void;
  clearBrowserFilters: () => void;
}

// Combined State
export type DeckBuilderState = SoloState & TeamState & PersistenceState & UIState;
