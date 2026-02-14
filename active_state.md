# Current Focus

- **Deck Persistence UX**
  - **Phase 1**: Solo Builder Smart Save & Save Copy. `[Completed]`
  - **Phase 2**: Team Builder Parity (Smart Save & Save Copy). `[Completed]`
  - **Status**: Released.

# Recent Changes

- **Completed Deck Persistence UX**
  - **Smart Save**: "Save" button automatically toggles to "Update" for existing decks/teams.
  - **Save Copy**: Added explicit "Save Copy" button to fork existing decks/teams.
  - **Store Logic**: Implemented deep cloning for Team forks to ensure data integrity.

- **Completed Phase 9: Code Modernization**
  - **Architecture** Unification: All `src/components/deck-builder` code moved to `src/features`.
  - **Logic**: Decoupled `DragDropProvider` logic into `modifiers.ts` and `useScrollLock.ts`.
  - **Cleanup**: Deleted legacy directories and unused imports.

# Active Context

- User is on Windows.
- Project path: `c:\Projects\spellcastersdb`
