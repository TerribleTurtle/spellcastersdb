# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.1] - 2026-02-15

### Fixed

- **Static Analysis & Type Safety**:
  - Resolved `useToast` type mismatch in `SoloOverview` and `TeamOverview`.
  - Fixed `encodeTeam` signature mismatch in `TeamOverview`.
  - Removed unused variables in `useTeamImport` and `SoloOverview`.
  - Cleaned up unused logic in `TeamBuilderView` and `useTeamBuilder`.

## [1.0.0] - 2026-02-15

### Added

- **Team Builder (Phase 8)**: Full support for building teams of 3 decks with shared validation logic.
- **Drag & Drop**: Improved drag-and-drop experience with `dnd-kit`.
- **Optimization**: CSP and LCP improvements.
- **Refactoring**:
  - Centralized Error Constants.
  - Simplified Redux slices.
  - Moved business logic to domain services (`TeamModification`, `TeamEditor`).
  - Standardized error handling.
  - **Inspector UI**:
    - Unified styling for Spellcaster and Titan selection buttons to match Unit Slot buttons.
    - Created reusable `InspectorActionButton` component.
  - **Deck Persistence**:
    - **Smart Save**: "Save" button intelligently toggles to "Update" for existing decks.
    - **Save Copy**: Added explicit flow to fork decks/teams.
    - **Auto-Naming**: Decks automatically adopt Spellcaster name if untitled.
  - **Code Health**:
    - Removed unused keys in `selectors.test.ts`.
    - Fixed type safety in `mappers.ts` and `filtering.test.ts`.

### Changed

- Refactored `createTeamSlice` to remove duplicate logic.
- Updated `TeamEditor` to use pure functions for state transitions.

- Improved error messages for deck validation.
- **Mobile UX Redesign**:
  - Implemented split 4-part layout (Header, Context, Browser, Dock) for `SoloEditorMobile`.
  - Simplified Team Mode UI on mobile.
- **Team Drawer Logic**: Implemented "Smart Click" interaction model for desktop drawers.

### Fixed

- **Code Health & Linting**:
  - Resolved unused variable warnings in `Navbar.tsx`, `SaveTeamModal.tsx`, `TeamEditorLayout.tsx`, `MobileHeader.tsx`, `MobileContextBar.tsx`.
  - Fixed syntax error in `SoloEditorMobile.tsx`.
- Console warnings (unused variables, duplicate keys).
- Infinite recursion in `TeamDeckEditorRow`.
- Build errors related to duplicate identifiers.
- **Inspector Panel**: Fixed state sync issues where clicking cards in browser didn't update inspector.
- **Team Mode**: Fixed drawer focus issues when switching slots.
