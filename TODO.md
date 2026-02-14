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

## Future Backlog

- [ ] **User Accounts**: Auth via Supabase/NextAuth
- [ ] **Cloud Decks**: Save decks to cloud account instead of localStorage
- [ ] **Public Profile**: Shareable user profile with favorite decks
- [ ] **Deck Ratings**: Community voting system
