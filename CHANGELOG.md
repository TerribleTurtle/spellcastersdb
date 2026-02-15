# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2026-02-15

### Fixed

- **Performance**: Reverted `OptimizedCardImage` to `next/image` to restore Vercel Edge Caching (1 Year TTL). This fixes cache misses on repeat visits.
- **LCP**: Tuned `UnitBrowser` to eagerly load the first 4 rows of cards.
- **CLS**: Adjusted `Virtuoso` estimated height to match mobile card dimensions (230px).

## [1.0.3] - 2026-02-15

### Fixed

- **Content Security Policy**: Added frame-src directive to allow embedding Tally forms.
- **Mobile Layouts**: Refined theme constants and fixed layout issues on mobile devices.
- **Static Analysis**: Resolved linting and type errors in `useDragDrop` tests and `DeckSlot` component.

### Performance

- **Core Web Vitals**: Drastically reduced LCP on mobile by removing blocking data fetches in `RootLayout`.
- **Preloading**: Switched `DeckBuilderView` to eager loading to eliminate "Double Jump" render delay.
- **Stability**: Added `display: swap` to fonts and `aspect-ratio` to cards to eliminate Cumulative Layout Shift (CLS).
- **Optimization**: Comprehensive performance improvements including caching strategies, search optimization, and lazy-loading.

## [1.0.1] - 2026-02-15

## [1.0.1] - 2026-02-15

### Fixed

- **Scroll Lock**: Fixed an issue where scrolling remained locked if a card drag was cancelled (e.g., via quick tap or system interruption).
  - Resolved `useToast` type mismatch in `SoloOverview` and `TeamOverview`.
  - Fixed `encodeTeam` signature mismatch in `TeamOverview`.
  - Removed unused variables in `useTeamImport` and `SoloOverview`.
  - Cleaned up unused logic in `TeamBuilderView` and `useTeamBuilder`.
  - Removed unused variables in `rank-badge.tsx` and `DragOverlayContainer.tsx`.

## [1.0.0] - 2026-02-15

### Added

- **Performance Optimization**:
  - **Core Web Vitals**: Implemented code splitting for Deck Builder views and heavy modals, reducing initial bundle size.
  - **Search**: Added 300ms debounce and decoupled search input from virtual list rendering to eliminate typing lag.
  - **Rendering**: Verified virtualization for large card lists.
  - **Caching**: Configured 1-year cache TTL for images on Vercel to reduce transformation costs.
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
