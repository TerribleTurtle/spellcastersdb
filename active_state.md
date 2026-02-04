# Project State

**Current Phase**: Phase 3: The Forge (Deck Builder)
**Status**: Ready to Start
**Last Action**: Renamed user-facing "Heroes" references to "Spellcasters" on 2026-02-04.

## Current Focus

We are preparing to build "The Forge", but first completed a terminology update requested by the user.

## Active Tasks

1.  **DeckContext**: We need a global state manager for the current deck.
2.  **UI Components**:
    - "Add to Deck" toggle on Unit Cards.
    - Floating Deck Tray (Mobile/Desktop).
    - Mana Curve Visualization.
3.  **Validation**: Implement "The Invariants" (5 slots, 1 Titan, Rank I/II requirements).

## Recent Accomplishments

- [x] Renamed "Hero" -> "Spellcaster" in UI (Sidebar, Headers, Guide, Deck Builder).
- [x] Refactored Root Page to host the Archive.
- [x] Unified Units, Heroes, and Consumables into a single searchable database.
- [x] Implemented polymorphic `UnitCard` and dynamic filtering.
