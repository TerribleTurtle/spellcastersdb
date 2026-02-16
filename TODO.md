# SpellcastersDB.com Task List

> **Note:** Completed tasks from Phases 0-5, 7, and 8 have been moved to `ARCHIVE.md`.

## Phase 9: Code Modernization & Refactor (Completed)

### Phase 9.1: Architecture Unification (The "Split Brain" Fix)

- [x] **Move**: `SoloEditorLayout.tsx` to `src/features/deck-builder/ui/layouts/`
- [x] **Move**: `TeamEditorLayout.tsx` to `src/features/deck-builder/ui/layouts/`
- [x] **Refactor**: Update imports in `src/app` and `src/features`
- [x] **Cleanup**: Delete `src/components/deck-builder` directory

### Phase 9.2: Logic Decoupling (The "God Hook" Fix)

- [x] **Extract**: `useDeckEditorNavigation` from `useDeckEditorUI` (Verified)
- [x] **Extract**: `useDeckSelection` from `useDeckEditorUI` (Verified)
- [x] **Refactor**: `SoloEditorLayout` to use new hooks
- [x] **Extract**: `useScrollLock` and generic modifiers from `DragDropProvider`

### Phase 9.3: Component Responsiveness (The "God Component" Fix)

- [x] **Extract**: `SoloEditorDesktop` component (Verified)
- [x] **Extract**: `SoloEditorMobile` component (Verified)
- [x] **Refactor**: `SoloEditorLayout` to delegate to sub-layouts

## Phase 10: Patch History Integration (Completed)

- [x] Types, Zod schemas, API service for balance_index/changelog/timeline endpoints
- [x] Zustand store (`patch-history-store.ts`) for client-side balance index
- [x] `PatchBadge` component (icon + full variants)
- [x] Badge on `DraggableCard`, `UnitCard`, `InspectorHeader`
- [x] `PatchHistorySection` with stat comparison on all 4 card detail pages
- [x] 5 new PatchBadge unit tests (200 total tests passing)

> **Note:** API endpoints (`balance_index.json`, `changelog.json`, `timeline/{id}.json`) return 404 until deployed. All UI gracefully handles empty state.

## Future Backlog

- [ ] **PWA & Offline Support**: Installable app, service worker caching, full offline deck building — see [`docs/PWA_PLAN.md`](docs/PWA_PLAN.md)
- [ ] **User Accounts**: Auth via Supabase/NextAuth
- [ ] **Cloud Decks**: Save decks to cloud account instead of localStorage
- [ ] **Public Profile**: Shareable user profile with favorite decks
- [ ] **Deck Ratings**: Community voting system
- [ ] **Patch History Data Pipeline**: Deploy balance_index, changelog, timeline JSON endpoints
