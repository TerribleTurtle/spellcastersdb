# Current Focus

Start Phase 6: Optimization & Automation.
Focus on GitHub Actions for daily revalidation and remaining SEO tuning.
Documentation Overhaul complete: README is now the entry point.

## Context

The Turbopack build error related to `fs/promises` in the Edge Runtime has been resolved by switching the OG route to the Node.js runtime.
Comprehensive JSON-LD structured data has been integrated for all entity types (Spellcasters, Units, Spells, Titans, Consumables) and collection pages.

## Audit Status

Completed Code Cleanup & Modernization Audit (2026-02-09). Report available in `docs/CODE_AUDIT_REPORT.md`.
Identified key areas for refactoring: Data Layer efficiency & Deck Builder component splitting.

## Active Tasks

- [x] Documentation Overhaul (README, CONTRIBUTING, .env.local.example).
- [x] Remove obsolete docs (ROADMAP.md, MIGRATION_SPEC.md).
- [x] Implement Schema v1.1 (Arrays for mechanics, new fields).
- [x] Improve UI naming consistency (formatEntityName).
- [x] Fix JSON-LD type errors.
- [x] Pre-push verification (Linting & Build).
- [x] Push changes to remote.

- [x] Fix Turbopack Edge Runtime error (fs/promises).
- [x] Push changes to remote.
- [x] Fix Turbopack Edge Runtime error (fs/promises).
- [x] Push changes to remote.
- [x] Fix Turbopack Edge Runtime error (fs/promises).
- [x] Push changes to remote.
- [x] Fix OG image loading (Robutst fetching prevents crash; PNG assets restored).
- [x] Rename deck slots from 'Unit' to 'Incant.' in UI.
- [x] Fix Drag and Drop for all unit types.
- [x] Enable Solo Deck Preview in Team Mode Sidebar.
- [x] Implement JSON-LD for all Entities & Collections.
- [x] Update Spellcaster Metadata ("Dual-Search" Targeting).
- [x] Add CollectionPage JSON-LD to Category Pages.
- [x] Expand Sitemap (Classes, Schools, Ranks, Titans).
- [x] Create Content Roadmap (docs/SEO_TODO.md).
- [x] Optimize Unit Vault (Mobile Performance) - WebP default, Memoization, Overscan.
- [x] Refactor Entity Views (CardInspector & EntityShowcase) - Shared Components for Stats, Mechanics, Abilities.
- [x] Update Spellcaster Schema (Movement, Standardized Mechanics, Features).
- [x] Pluralize mechanic labels (Creatures, Buildings, Everything).
- [x] Fix Team Builder "Edit" button behavior (close overlay).
- [x] Push changes to remote (Fixes & Refactors).
- [x] Update Schema (Hover units, Initial Attack).
- [x] Polymorphic Damage Modifiers (String | Array).
- [x] Pre-push verification (Linting & Build).
- [x] Push changes to remote.
- [x] Code Modernization Phase 1: Data Layer (EntityRegistry & O(1) Lookups).
- [x] Code Modernization Phase 2: Deck Builder Logic (Hooks Decomposition).
- [x] Code Modernization Phase 3: Component De-cluttering (ForgeControls Refactor).
- [x] Automated Verification: New Unit Tests (useDeckValidation) & Build Check.
- [x] Fix Waves/Interval mechanic display (Show if either exists).
- [x] Fix "SPELLCASTER" label clipping in ActiveDeckTray on medium screens.
- [x] Improve Saved Deck/Team Item UI (Rounded squares, consistent styling).
- [x] Security Remediation: XSS Fixes, Path Traversal Protection, Rate Limiting (Upstash), & CSP Headers.
- [x] Pre-push verification (Linting, Types, Build).
- [x] Push changes to remote.
- [x] Performance Phase 1: Localized Fonts (OG) & Debounced Search.
- [x] Performance Phase 2: Registry Warm-up & Asset Caching.
- [x] QA Phase 1: Added Unit Tests for Deck Encoding & Validation (100% pass, Type-Safe).
- [x] QA Phase 1.5: Verified Legacy V1 Decoding & Strict Creature/Building Rules.
- [x] QA Phase 2: Core Stability (Mocked Network & useDeckBuilder Unit Tests).
- [x] QA Phase 2.5: Verified Singleton & Type Constraints in Deck Builder.
- [x] QA Phase 3: Full Lifecycle Logic Verification (Storage, Teams, Imports).
- [x] Remove PWA configuration and files.
- [x] Verify build and push changes.
- [x] Add special mention to Anonymous Joker in About page credits.
