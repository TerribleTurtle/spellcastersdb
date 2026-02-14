# Current Focus

- **Mobile UX Redesign**
  - **Split UI**: Implemented Mobile Header, Context Bar, and Deck Dock. `[Completed]`
  - **Team Mode**: Simplified UI (removed deck naming). `[Completed]`
  - **Phase 8 (Team Builder)**: Complete.
  - **Status**: **READY FOR DEPLOYMENT**. Verification passed.

# Recent Changes

- **Mobile UX Redesign**
  - **New Layout**: `SoloEditorMobile` now uses a split 4-part layout (Header, Context, Browser, Dock).
  - **Fix**: infinite loop in store selector resolved with `useShallow`.
  - **Pre-Deployment Verification**:
    - **Quality**: Fixed lint/syntax errors in `SoloEditorMobile.tsx`, `Navbar.tsx`, `SaveTeamModal.tsx`.
    - **Tests**: Validated Unit Tests (Vitest). Removed Playwright.
    - **Docs**: Updated CHANGELOG and README.
  - **Team Builder**: Renamed decks to "Slot X" and removed rename input.

- **Team Drawer Logic Refresh**
  - **Interaction Model:** Implemented "Smart Click" logic for Desktop Team Drawers (Closed->Open/Active, Open/Inactive->Active, Open/Active->Close).
  - **Bug Fix**: Resolved `allowMultiple` state initialization issue in `useTeamEditor`.
  - **Verification**: Added `DeckDrawer.test.tsx` for unit testing.

- **Completed Deck Persistence UX**
  - **Architecture** Unification: All `src/components/deck-builder` code moved to `src/features`.
  - **Logic**: Decoupled `DragDropProvider` logic into `modifiers.ts` and `useScrollLock.ts`.
  - **Cleanup**: Deleted legacy directories and unused imports.

# Active Context

- User is on Windows.
- Project path: `c:\Projects\spellcastersdb`
