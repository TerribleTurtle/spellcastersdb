# SpellcastersDB.com - Completed Tasks Archive

## Phase 0: Architecture & Deployment

- [x] Initialize Next.js Project (TypeScript, Tailwind, customized `npx` command)
- [x] Commit Initial Codebase to GitHub
- [x] Verify Vercel Deployment & Domain Connection (`spellcastersdb.com`)

## Phase 1: The Foundation (Data Layer)

- [x] Define TypeScript Interfaces (The Contract) based on API Docs
- [x] Create Data Fetching Service (`lib/api.ts`) with Stale-While-Revalidate
- [x] Implement Static Site Generation (SSG) for Unit Pages
- [x] Implement Static Site Generation (SSG) for Spellcaster Pages
  - [x] Create Dynamic Route `src/app/heroes/[id]/page.tsx`
  - [x] Implement `generateStaticParams` for build-time generation
  - [x] Implement `generateMetadata` for dynamic spellcaster SEO
- [x] Implement Static Site Generation (SSG) for Consumable Pages
  - [x] Create Dynamic Route `src/app/consumables/[id]/page.tsx`
  - [x] Implement `generateStaticParams` for build-time generation
  - [x] Implement `generateMetadata` for dynamic consumable SEO

## Phase 1.5: Design Identity & Infrastructure

- [x] **Design System**: Implement "Arcane Modern" theme with Tailwind v4 (CSS Variables, @theme)
- [x] **Analytics**: Install Vercel Analytics & Speed Insights
- [x] **Security**: Configure strict Security Headers (CSP, X-Frame-Options) in `next.config.ts`
- [x] **SEO**: Generate dynamic `sitemap.xml` for all 50+ pages (`src/app/sitemap.ts`)
- [x] **Refactor**: Update Debug Page and generated pages to use new Design Tokens
- [x] **Config**: Externalize API URL to `NEXT_PUBLIC_API_URL` & add `.env.local` support
- [x] **Quality**: Add `type-check` script and fix duplicate type definitions

## Phase 2: The Archive (UI Core)

- [x] Build Global Layout (Nav, Footer with Socials)
- [x] Create specialized `Card` components (Unit, Spell, Building)
- [x] Implement Search & Filter Logic (Fuse.js)

## Phase 3: The Forge (Deck Builder)

- [x] implement `DeckContext` (useDeckBuilder hook)
- [x] Build Drag & Drop Tray Logic
- [x] Implement "The Invariants" validation logic

## Phase 4: Social & Sharing

- [x] Implement `lz-string` URL compression/decompression
- [x] Add "Share Link" and Conflict Resolution Modal
- [x] Optimize URL size by removing JSON overhead (Pipe-delimit with ASCII Unit Separator)

## Phase 5: Visual Sharing & OG Images

- [x] Implement `@vercel/og` for dynamic deck previews
- [x] Design OG template: Clean, game-accurate view of Spellcaster + Units (Names/Ranks)

## Phase 7: User Experience Polish

- [x] Fix drag and drop logic: Dragging unit to spellcaster should cancel drop instead of removing unit
- [x] Remove Deck Tray 'X' buttons (User Request)
- [x] **Saved Deck Enhancements**:
  - [x] Show Unit Previews in saved deck list (with Titan highlight)
  - [x] Add "Duplicate Deck" feature (Layers icon)
  - [x] Add "Copy Link" quick action
  - [x] Implement "Save & Load" conflict resolution for imports
- [x] Refactor Navbar: implement primary/secondary links and centered layout
- [x] Optimize Mobile Drag Performance: implemented `useRef` and `React.memo` to eliminate lag
- [x] Hide global Footer on `/deck-builder` for immersive full-screen experience

## Phase 8: Team Builder ("The Trinity")

- [x] **Core Logic**: Storage segregation (`spellcasters_teams_v1` implemented via `useTeamBuilder` generic storage) and `useTeamBuilder` hook.
- [x] **UI/UX**: Distinct "Team Overview" mode with 3-column layout and visual cues (borders/colors) to distinguish from Solo mode.
- [x] **Data Flow**: Import "Solo" decks into Team slots; Export Team slots to Solo storage.
- [x] **Sharing**: specialized `?team=` URL and OG images.
- [x] **Refactor**: Consolidate Team Slice Logic & Shared Components (Recent Work).
- [x] Fix incorrect header "Saved Teams" when importing solo decks
- [x] **UX Polish**:
  - [x] Decouple solo deck from team deck after import (no longer linked).
  - [x] Show Solo Deck Previews in Team Mode (sidebar).
  - [x] Auto-focus "Saved Teams" list after clicking "Save Team".
  - [x] Synchronize deck names in team builder automatically on change.

## Maintenance & UX Refinement (Completed)

- [x] Implement persistent dismissal for Beta Banner (localStorage)
- [x] Fix navbar overlap issue when Beta Banner is dismissed (moved spacing to body)
- [x] Change Beta Banner to relative positioning (scrolls with page)
- [x] Fix oversized Spellcaster image in Deck Builder controls
- [x] Refine Deck Builder Card Inspector UI (Padding + Close button)
- [x] Add visual feedback for valid drop zones when dragging cards
- [x] Implement dynamic viewport-relative sizing for deck tray (mobile/desktop scaling)
- [x] Implement holistic responsive design across all deck builder components
- [x] Audit and fix deck builder mobile scaling issues (oversized units)
- [x] Deduplicate spellcaster drop zone IDs
- [x] Fix Forge tab passives visibility (removed restrictive max-height)
- [x] Implement GLOBAL custom scrollbar styles (replaces native Windows Chrome bars everywhere)
- [x] Fix inspector rank badge overlap with close button
- [x] Relocate spellcaster passives from Forge to deck tray (desktop: hover tooltips, mobile: uses Inspector)
- [x] Implement Status Dashboard (Roadmap page) with JSON-based roadmap management
- [x] Populate roadmap with community feedback (12 new items) and cleanup stale placeholder items
- [x] Add Magic School Alignment request to roadmap and cleanup schools
- [x] Refine Deck validation logic: Require 1x Rank I/II Creature and prevent all-spell decks
- [x] Document Rank I/II Creature requirement in guide and design docs (not just any unit)
- [x] Enhance validation logic documentation with comprehensive rule comments and clearer error messages
- [x] Redesign roadmap page: add 5 item types (bug/feature/enhancement/ux/data), compact layout with inline icons
- [x] Improve roadmap density: flatten type subsections into unified grid, tighten card spacing
- [x] Add explicit type labels to roadmap cards (e.g., "Bug", "Feature") for better accessibility
- [x] Update Deck Builder Health Icon from Shield to Heart (UX Polish)
- [x] Implement draggable deck slots with Swap and Move logic
- [x] Implement "Drag to Remove" interaction for deck tray
- [x] Enable click-to-inspect for units in the deck tray
- [x] Fix double "TITAN" label in Deck Builder slot
- [x] Stabilize Deck Tray layout: absolute position spellcaster passives to prevent slot shift
- [x] Implement "Swap on Add": dragging a card already in the deck to another slot swaps it instead of clearing the old slot
- [x] Implement **Roadmap Concepts**: Added 'concept' type for massive requests with visual disclaimers
- [x] Improve **Roadmap Sorting**: Sort items by type (Bugs first, Concepts last) to manage user expectations
- [x] Update **Roadmap Metadata**: Added devNote support and implemented disclaimer rendering
- [x] Pluralize filter categories (Spellcasters, Creatures) in Unit Browser
- [x] Implement Rank-first (then Alphabetical) sorting in Unit Browser for better grouping

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
