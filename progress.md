# Progress — Archive Mode lite (2026-10-10)

Branch: `chore/archive-mode` (from `ff75327`, origin/main after PR #33). Plan: task_plan.md (lite).

## Baseline (before change)
- preflight exit 0: 177 test files passed / 1 skipped; 2033 tests. ESLint 0 errors / 60 warnings. depcruise 0 violations.
- audit exit 1: 1241339, 1241210, 1241221, 1241209 unexcepted.

## After steps 1–3 (verified by orchestrator, not just worker)
- `npm run audit` exit 0 ("All good!").
- `npm run preflight` exit 0: 175 files passed / 1 skipped (−2 = deleted useFeedback tests). depcruise 0 violations (595 modules).
- `npm run build` exit 0: 120/120 pages; no `1h` revalidate entries; `/deck-builder` still ƒ (expected, per-deck metadata kept).
- `npx playwright test`: first run 13/14 — team-builder timed out because the welcome modal appeared after the spec's 2s dismiss check (screenshot: builder fully rendered). Rerun deck/team specs `--repeat-each=3`: 18/18 passed. Pre-existing spec race, not caused by this change.
- Worker extras accepted: `eslint-plugin-react-hooks` override pinned at 7.0.1 (same as before; 7.1.1 adds lint rules that fail). Lockfile regenerated; runtime minors moved (e.g. zod 4.3.6 → 4.6.5); next/react/sharp unchanged.
- Orchestrator edits: privacy page (removed Vercel Analytics + Tally sections), config.ts comment.

## Next
- Push branch, open PR, user tests deck + team share on Vercel preview, then dashboard cleanup (see task_plan.md).
