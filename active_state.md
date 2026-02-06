# Project State

**Current Phase**: Phase 5: Visual Sharing & OG Images
**Status**: In Progress
**Last Action**: Refactor Navbar: split primary/secondary links and centered alignment for a cleaner, premium UI.

## Current Focus

The Deck Builder is now optimized for mobile with virtualization and stable drag-and-drop. Next up: implementing `@vercel/og` for visual deck sharing on social media.

## Recent Accomplishments

- [x] Optimized **Mobile Deck Builder** with `react-virtuoso` for 60fps scrolling
- [x] Implemented **Quick Add** (Mobile '+' button, Desktop Double-Click)
- [x] Fixed **Mobile Drag & Drop**: resolved scroll interference and "Jump to Top Left" glitch
- [x] Fixed **Mobile Scrolling**: Removed `touch-none` to allow scrolling; drag now relies on long-press (250ms)
- [x] Refactored **Navbar** with Primary/Secondary tiers and centered desktop layout
- [x] Added explicit **Deck Builder** link (pointing to `/`) for easier navigation back from database/roadmap
- [x] Enabled **Hamburger Menu on Desktop** for secondary links (Guide, FAQ, About)
- [x] Implemented **Status Dashboard** at `/roadmap` with JSON-based roadmap management
- [x] Added **Concept** item type to roadmap for massive requests (visual disclaimer + deprioritized sorting)
- [x] Moved **Refined Validation Logic** to LIVE (requires Rank I/II Creature)
- [x] Created flatter data structure for easy item movement between categories
- [x] Integrated roadmap into navigation with visual consistency across the site
- [x] Implemented **The Forge** (Deck Builder) with 5 unit slots and 1 Spellcaster slot
- [x] Added **Drag-to-Equip** for units and Spellcasters
- [x] Built **URL Sharing** using `lz-string` compression and Import Conflict Resolution
- [x] Implemented **Deck Persistence** via LocalStorage
- [x] Added **Deck Validation** according to "The Invariants"
- [x] Renamed "Hero" -> "Spellcaster" in UI
- [x] Refactored Root Page to host the Archive
