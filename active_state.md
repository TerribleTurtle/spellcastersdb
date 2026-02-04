# Project State

**Current Phase**: Phase 3: The Forge (Deck Builder)
**Status**: Ready to Start
**Last Action**: Completed Phase 2 (Archive UI, Search, Filter, Data Unification) on 2026-02-04.

## Current Focus

We are about to begin building "The Forge", the deck-building engine of SpellcastersDB.

## Active Tasks

1.  **DeckContext**: We need a global state manager for the current deck.
2.  **UI Components**:
    - "Add to Deck" toggle on Unit Cards.
    - Floating Deck Tray (Mobile/Desktop).
    - Mana Curve Visualization.
3.  **Validation**: Implement "The Invariants" (Min 40 cards, Max 3 copies, etc.).

## Recent Accomplishments

- [x] Refactored Root Page to host the Archive.
- [x] Unified Units, Heroes, and Consumables into a single searchable database.
- [x] Implemented polymorphic `UnitCard` and dynamic filtering.
