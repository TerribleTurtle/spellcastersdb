# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.18] - 2026-02-18

### Changed

- **Layout Consistency**: Consolidated scattered `max-width` values into Tailwind v4 theme tokens (`--max-width-site-shell`, `--max-width-page-grid`) for single-source layout management.
  - Site shell (navbar, footer, layout): `1920px` → `1440px` via `max-w-site-shell`.
  - Grid/archive pages (7 pages): `1600px` → `1280px` via `max-w-page-grid`.
- **Deck Builder Grid**: Rewrote `useResponsiveGrid` to use `ResizeObserver` on the actual container element instead of `window.innerWidth`, so card columns scale correctly within the tighter site shell.
- **Database Cards**: Increased grid density — smaller card images (`h-20`), tighter padding (`p-2`), and 5 columns at `xl` breakpoint.

### Fixed

- **ESLint Purity**: Replaced impure `Math.random()` shuffle in `RelatedEntities` with deterministic `spreadSample`.
- **Code Cleanup**: Removed dead comments from `FilterSidebar.tsx`.

## [1.0.17] - 2026-02-18

### Refactor

- **Patch History**: Extracted `DiffLine` and `LocalDate` components for improved maintainability and consistent formatting.

### Fixed

- **Patch History**:
  - Added badges for "Added" and "Removed" fields in diff views.
  - Improved readability of field names in patch history.
  - Fixed date formatting to respect user's local timezone.
- **Schema**: Re-enabled `changelog` field validation in `CommonSchemaParts`.

## [1.0.16] - 2026-02-18

### Changed

- **Patch History UI**: Redesigned vertical layout and separated it from the card component for cleaner inspector view.
- **Mobile UI**: Adjusted deck badge sizes for better visibility on small screens.
- **Schema**: Removed `changelog` field from `CommonSchemaParts` validation (no longer used by API).

### Fixed

- **Code Health**: Resolved `no-explicit-any` and `prefer-const` linting errors in `PatchHistorySection.tsx`.

## [1.0.15] - 2026-02-17

### Added

- **Patch History Badges**: Wired `UnitArchive` to `usePatchHistoryStore` so database/archive pages now display buff/nerf/rework badges on unit cards.
- **Ecosystem Links**: Added "Part of the Spellcasters Ecosystem" section to `README.md` linking Community API, The Grimoire, and Spellcasters Bot.

### Fixed

- **Dark Mode**: Applied `color-scheme: dark` to prevent forced browser dark mode from distorting rank badge colors.
- **Team Drawer**: Centered drawer cards vertically and reduced excess padding in desktop view.
- **Deck Borders**: Fixed deck row border-radius so top/bottom decks have properly curved, colored borders.
- **Code Health**: Removed unused `vi` import in `BackupService.test.ts`. Deleted orphaned `HoverInspector.tsx`.

## [1.0.14] - 2026-02-15

### Added

- **Patch History Integration**:
  - **Visual Badges**: Added Buff/Nerf/Rework badges to all card surfaces (Browser, Inspector, Detail Pages).
  - **Filtering**: Browser and Inspector only show relevant patch types (buff/nerf/rework), while detail pages show full history including fixes.
  - **State Management**: Implemented `patch-history-store` with Zod validation for robust patch data handling.

## [1.0.13] - 2026-02-15

### Fixed

- **Swap Mode**: Resolved an issue where cards could not be placed into empty slots on other decks during swap mode.
- **Static Analysis**: Fixed `no-explicit-any` linting errors in `UnitBrowser.test.tsx`.

## [1.0.12] - 2026-02-15

### Fixed

- **Static Analysis**: Resolved `no-explicit-any` linting errors in `UnitBrowser.test.tsx` to ensure type safety in tests.

## [1.0.11] - 2026-02-15

### Fixed

- **Accessibility**: Color Contrast Improvements.
  - **Legibility**: Updated text colors in `MobileHeader`, `ContextBar`, `UnitGroupHeader`, and `UnitBrowserHeader` from `text-gray-500/600` to `text-gray-400` to improve readability on dark backgrounds.
  - **Badges**: Darkened background colors for Ranks II-V (Emerald, Blue, Purple, Amber) to ensure a contrast ratio of >4.5:1 with white text.

## [1.0.10] - 2026-02-15

### Fixed

- **Performance**:
  - **CLS**: Eliminated layout shift on Unit Browser by refactoring `BrowserSkeleton` to match exact DOM structure (padding, backgrounds, containers).
  - **Bundle Size**: Updated `browserslist` to `last 3 major versions`, removing ~13KB of legacy polyfills.
- **Visual Polish**:
  - **Loading States**: Replaced "Initializing..." spinner with `PageSkeleton` to eliminate layout flashes.
  - **Sidebar**: Fixed `DesktopSidebar` to use `sticky` positioning during loading, preventing layout collapse.
  - **Skeleton**: Added category headers to `BrowserSkeleton` and fixed Inspector alignment.

## [1.0.9] - 2026-02-15

### Fixed

- **Accessibility**: Button Standardization.
  - Replaced raw HTML buttons with accessible `Button` components across `UnitBrowser`, `MobileHeader`, `DeckActionToolbar`, `DesktopSidebar`, and `DeckRow`.
  - Added descriptive `aria-label` attributes to all icon-only buttons for screen reader support.
  - Added `role="button"` and `role="checkbox"` to interactive list elements.
- **Code Health**: Fixed strict type check errors in `DraggableCard` and `assets-helpers.test.ts`.

## [1.0.8] - 2026-02-15

### Fixed

- **Grid Layout Parity**:
  - **Mobile**: Locked `BrowserSkeleton` to 4 columns to match `useResponsiveGrid` (removed 5-col jump on larger phones).
  - **Desktop**: Locked `BrowserSkeleton` to 6 columns to match Desktop Grid.
- **Desktop Right Bar**: Increased `PageSkeleton` drawer height to 230px to align the Inspector panel correctly.
- **Accessibility**: Implemented dynamic alt text generation for all card images (Units, Spellcasters, spells, Titans) across Deck Builder, Inspector, and Open Graph images.

## [1.0.7] - 2026-02-15

### Fixed

- **CLS Regression**: Fixed 0.513 layout shift on mobile by aligning `PageSkeleton` height with real components.
  - Added missing `ContextBar` skeleton (56px).
  - Updated Mobile Dock skeleton to be `fixed` positioned with correct height (~180px).

## [1.0.6] - 2026-02-15

### Fixed

- **Visual Polish**: Replaced jarring "Loading..." text flashes with `PageSkeleton` logic.
  - Implemented **Responsive** full-page skeleton that adapts to Mobile (Dock) and Desktop (Grid/Inspector) layouts.
  - Softened the "Initializing Team Editor" loading state.

## [1.0.5] - 2026-02-15

### Fixed

- **CLS**: Implemented `BrowserSkeleton` to reserve grid space during initial load, eliminating layout shifts (0.31 -> ~0).
- **LCP**: Optimized resource contention by limiting eager loading (`fetchpriority=high`) to the first row of cards only.

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
  - Simplified Zustand slices.
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
