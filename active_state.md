# Active State

**Current Phase**: Phase 5: Visual Sharing & OG Images
**Status**: Deployment Ready | Researching Team Builder
**Last Action**: Completed feasibility study for "Team Builder" (3-deck share) feature; documented requirements and refactoring path in `docs/team_builder_feasibility.md`.

## Current Focus

- [x] Updated **Magic Schools**: Aligned Types, API Zod Schema, and UI Filter constants to the new 8-school set.
- [x] Implemented **Quick Add** (Mobile '+' button, Desktop Double-Click)
- [x] Fixed **Mobile Drag & Drop**: resolved scroll interference and "Jump to Top Left" glitch
- [x] Fixed **Desktop Unit Collection**: resolved auto-scroll to bottom on drag start
- [x] Fixed **Mobile Scrolling**: Removed `touch-none` to allow scrolling; drag now relies on long-press (250ms)
- [x] Improved **Mobile UX**: Disabled auto-opening of Inspector when dragging cards
- [x] Refactored **Navbar** with Primary/Secondary tiers and centered desktop layout
- [x] Added explicit **Deck Builder** link (pointing to `/`) for easier navigation back from database/roadmap
- [x] Enabled **Hamburger Menu on Desktop** for secondary links (Guide, FAQ, About)
- [x] Implemented **Status Dashboard** at `/roadmap` with JSON-based roadmap management
- [x] SEO: Refine metadata to include ALL terms: "Card", "Deck", "Build", "Loadout".
- [x] OG: Refined Image Layout (larger text, tighter spacing) and dynamic Spellcaster descriptions.
- [x] Fixed **Deck Builder Logic**: Resolved "Double Tap" bug where units replaced slot 0. Titans now swap properly, Units fail gracefully if full.

## Recent Changes

- Updated `src/app/page.tsx` metadata: "Deck Builder, Card Builds & Loadouts".
- Updated `src/app/database/page.tsx` metadata: "Card Database & Builds", description mentions "unit", "deck", "loadout".
- [x] Implemented **Saved Deck Enhancements**: Added Unit Previews, Quick Actions (Duplicate/Copy Link), and Smart Import Logic (Save & Load conflict resolution).
- [x] Implemented **Vercel OG (Open Graph)**: Optimized with "Card Slice" layout, "Oswald" font, and aggressive caching.
- [x] **OG Optimization**: Added dynamic font loading (Oswald) and improved text legibility with stroke hacks.
