# Active State

## Current Focus

Patch History Integration — Complete. All card surfaces display balance badges.

## Status

- [x] Static Analysis
- [x] Testing
- [x] Documentation
- [x] CI/CD Check
- [x] Test Audit (179 pass, 1 skip)

## Next Steps

- [x] Fix 4 critical test quality issues (false positives)
- [x] Add missing tests for persistence/stats layers

## Current Focus

- **Patch History Integration** — Buff/nerf/rework badges on all card surfaces, inspector header. Filtered to exclude "fix"/"new" in browser context, but shown on detail pages.
- **Filtering Logic** — Added `BROWSER_PATCH_TYPES` and `isBrowserPatchType` helper. Verified with new unit tests.

## Notes

- CI/CD Phase 1: Added concurrency group, corrected all version comments in `test.yml`.
- Released v1.0.14. Codebase is clean and pushed to `main` with tag `v1.0.14`.
- Lighthouse audit fixes applied.
- All verification checks passed (Lint, Type-Check, Test, Build).
- Hotfix: Whitelisted www.spellcastersdb.com for images.
- Performance: Added `partialize` to Zustand persist, replaced `transition-all` on critical-path components.
- Patch History: New Zustand store (`patch-history-store.ts`), Zod schemas, PatchBadge component, PatchHistorySection for full card pages.
- UI Fix: Added `color-scheme: dark` to prevent forced browser dark mode from distorting rank badge colors.
- Deployment complete.
