# Active State

**Current Phase**: Phase 5: Visual Sharing & OG Images
**Status**: Deployment Ready
**Last Action**: Finalized OG Image layout refinements (bottom alignment, centered names, adjusted spacing).

## Current Focus

- [x] Implemented **Quick Add** (Mobile '+' button, Desktop Double-Click)
- [x] Fixed **Mobile Drag & Drop**: resolved scroll interference and "Jump to Top Left" glitch
- [x] Fixed **Mobile Scrolling**: Removed `touch-none` to allow scrolling; drag now relies on long-press (250ms)
- [x] Improved **Mobile UX**: Disabled auto-opening of Inspector when dragging cards
- [x] Refactored **Navbar** with Primary/Secondary tiers and centered desktop layout
- [x] Added explicit **Deck Builder** link (pointing to `/`) for easier navigation back from database/roadmap
- [x] Enabled **Hamburger Menu on Desktop** for secondary links (Guide, FAQ, About)
- [x] Implemented **Status Dashboard** at `/roadmap` with JSON-based roadmap management
- [x] SEO: Refine metadata to include ALL terms: "Card", "Deck", "Build", "Loadout".
- [x] OG: Refined Image Layout (larger text, tighter spacing) and dynamic Spellcaster descriptions.

## Recent Changes

- Updated `src/app/page.tsx` metadata: "Deck Builder, Card Builds & Loadouts".
- Updated `src/app/database/page.tsx` metadata: "Card Database & Builds", description mentions "unit", "deck", "loadout".
- [x] Implemented **Saved Deck Enhancements**: Added Unit Previews, Quick Actions (Duplicate/Copy Link), and Smart Import Logic (Save & Load conflict resolution).
- [x] Implemented **Vercel OG (Open Graph)**: Dynamic images for shared decks (`/api/og`) displaying deck name, commander, and units.
