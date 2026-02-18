# Active State

## Current Focus

v1.0.16 deployed — Patch History Redesign, schema cleanup, docs sync.
Change Log page added at `/changes` with full search, sort, and filter.

## Status

- [x] TypeScript: 0 errors
- [x] ESLint: 0 errors
- [x] Tests: 205 pass / 1 skip
- [x] Secrets scan: clean
- [x] CI/CD: valid (test.yml, revalidate.yml)
- [x] Env vars: all documented in .env.local.example
- [x] CHANGELOG: updated to v1.0.16
- [x] Commit `9e20809` pushed to main

## Next Steps

- [x] Manual verify `/changes` page (date display fixed)
- [ ] Monitor Vercel deployment for build success
- [x] Patch diff: show "Added"/"Removed" badges instead of null values
- [x] Changelog dates: display in viewer's local timezone
- [x] Refactored date display to shared `LocalDate` component (covered `/changes`, debug page, and patch history)
- [x] Improve patch sorting to use Version as tie-breaker for same-day patches
- [ ] Monitor Vercel deployment for build success
