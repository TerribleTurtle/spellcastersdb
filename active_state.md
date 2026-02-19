# Active State

## Current Focus

- [x] **Design Overhaul (Phase 1-5):**
  - [x] Foundation (PageShell, tokens)
  - [x] Route Architecture (`/` landing, `/deck-builder` app, redirects)
  - [x] Navigation (Navbar, Sidebar, CTAs)
  - [x] Content Consistency (PageShell wrapper)
  - [x] Polish (Hover states, Footer, Icons)
- [x] **Accessibility Remediation (WCAG 2.1 AA):**
  - [x] Phase 1: Critical Blockers (Modals + Skip-Nav)
  - [x] Phase 2: Input Labels
  - [x] Phase 3: ARIA State
  - [x] Phase 4: Polish
- [ ] **Next Steps:**
  - [ ] Performance Optimization (LCP on Deck Builder)
  - [ ] SEO Tuning (Metadata Refinement)
  - [ ] Feature Development (Stale Data Handling)

## Status

- [x] Phase 1: Layout redesign (cards + detail pages + SSR)
- [x] Phase 2: Design system polish (SmartRankBadge, typography, tokens)
- [x] Phase 3: Final polish (padding, loading skeletons, cleanup)
- [x] Phase 4: Layout consistency (token consolidation, card density, responsive grid fix)
- [x] TypeScript: 0 errors
- [x] Tests: 250 pass / 1 skip

## Layout Tokens (globals.css @theme)

- `--max-width-site-shell: 1440px` → shell (navbar, sidebar, footer)
- `--max-width-page-grid: 80rem` → grid/archive pages

## Next Steps

- [ ] Monitor Vercel deployment for build success
- [ ] Visual QA on deployed site (mobile + desktop)
- [x] Patch history: ability name resolution + scanability improvements
- [x] Patch history: word-level diff highlighting
- [x] Deployment: v1.0.19 pushed to main
- [x] Bonus damage display: added BonusDamageList mechanic component (% Max HP, % Current HP, flat)
- [x] Unit Stats: Globally hidden Damage, Attack Speed, and Charges (feature flag style via comments)
- [x] Fixed 404 error on `/incantations/spells` by creating missing page route
- [x] Audited `/incantations/spells` page and resolved 3 minor issues (CSS, filters, sitemap)
- [x] Tone audit: removed hype, competitive language, and false claims from 10 files (30 fixes)
- [x] Home page polish: animations, null safety, icon consistency, gradient headings, Site Stats block
- [x] Centralized UI theme: 38 semantic tokens in globals.css, 100+ files refactored from hardcoded colors to tokens (0 remaining)
- [x] Cleanup-5: removed /debug from sitemap, cleaned debug comments, updated BRAND_GUIDELINES.md with token reference
- [x] Theme switching: full light/dark mode via `next-themes`, dynamic `themeColor`, toggle in Library
- [x] Fun themes: Arcane, Inferno, Frost, Retro (picker), Rainbow (Konami code ↑↑↓↓←→←→BA)
- [x] Styling fixes: Frost/Retro button contrast, Konami rainbow class, ThemePicker z-index clipping
- [x] Perf optimization: Sidebar resize debounce (150ms), console.warn cleanup in api.ts
- [x] Reduced console noise: Silenced 404 warnings in GameImage fallback logic
- [x] CLS Optimization: Implemented comprehensive skeleton system (UnitArchiveSkeleton, ShellSkeleton) for zero layout shift on all major routes
- [x] SEO Audit & Remediation: Fixed indexing, sitemap gaps, accessibility (alt text), and implemented structured data (FAQ, WebApp, Breadcrumbs).
- [x] Refactoring Audit: Fixed 8 items across 4 phases (Quick Wins, Shared Nav, Type Improvements, Cleanup).
- [x] Code Modernization: Split 70-line UIState interface, centralized nav config, instituted DRY for API getters.
- [x] Verification: 258 Tests passed, 0 Lint errors, 0 Type errors in modified files.
- [x] Repo Hygiene: Removed 4 cruft files, fixed .gitignore gaps (\_.log, temp\_\_), removed stale ESLint ignore, ran npm prune.
- [x] Deployment Verification: Fixed 8 TS errors in tests, deduped CHANGELOG. 0 errors, 258 tests pass. **GO for deploy.**
- [x] ThemePicker: Portal-based dropdown to prevent clipping by sidebar `overflow-x-hidden` in collapsed view.
