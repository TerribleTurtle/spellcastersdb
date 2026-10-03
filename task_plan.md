# SpellcastersDB Task Plan

## Phase 1: Environment & Sanity Checks
- [x] Run `npm run preflight` to confirm type safety, linting, tests (Vitest), and dependency boundaries (`dependency-cruiser`) remain fully intact after recent package overrides.
- [x] Run `npm run test:e2e` to verify Playwright end-to-end functionality across desktop and mobile views.
- [x] Run `npm run check-data` to ensure the Community API static data fetching logic is fully operational.

## Phase 2: Codebase Maintenance Audit (Optional)
- [x] Run `npm run dead-code` (`knip`) to identify and remove any unused files or exports left over from previous refactors.
- [x] Run `npm run analyze` to review bundle sizes and ensure Next.js chunks remain lightweight.
- [x] Run `npm run lighthouse` to confirm there are no regressions in accessibility or performance scores.

## Phase 3: Active Feature Development (Clean Slate)
- [ ] **CURRENT:** Security & Dependabot Vulnerability Resolution.
  - Plan document: `docs/plans/2026-10-03-security-patch.md`
- [ ] Task 1: Direct Production Dependency Updates (`next`, `sharp`).
- [ ] Task 2: Safe Audit Fix & `.nsprc` Stale Exception Cleanup.
- [ ] Task 3: Verification & Integration (`npm run preflight`).
- [ ] Provide End-to-End proof before marking the task complete.
