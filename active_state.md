# Active State

## Current Focus

Release v1.0.15 — Patch badges on archive, dark mode fix, team drawer/deck border polish.

## Status

- [x] Static Analysis (ESLint 0 errors, TypeScript 0 errors)
- [x] Testing (205 pass, 1 skip)
- [x] Documentation (CHANGELOG, README updated)
- [x] CI/CD Check (test.yml, revalidate.yml verified)
- [x] Build Verification (next build 90/90 pages)
- [x] Secrets Scan (clean)

## Next Steps

- [ ] Commit, tag v1.0.15, and push

## Notes

- Released v1.0.15. All deploy checks passed.
- Patch badges: Wired `UnitArchive` to `usePatchHistoryStore` so database/archive pages now display patch badges on `UnitCard`.
- Dark mode: Added `color-scheme: dark` to prevent forced browser dark mode from distorting rank badge colors.
- Team drawer: Centered cards vertically, reduced padding.
- Deck borders: Fixed border-radius on top/bottom deck rows.
- Ecosystem links added to README.
- Removed orphaned `HoverInspector.tsx`, fixed unused `vi` import in `BackupService.test.ts`.
