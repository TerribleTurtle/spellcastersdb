# Findings

## Security & Dependencies
- **Dependency Overrides (`package.json`)**: Deeply nested vulnerable dependencies within dev tools (e.g., outdated `uuid` in `@lhci/cli`) can be securely patched using NPM `overrides`, provided the version bump remains API-compatible. This allows patching without breaking top-level package constraints.
- **Deployed versions (2026-10-10)**: `next@16.3.8`, `sharp@0.35.5` (PR #33, merged 2026-10-03). The `next/og` RCE GHSA-vcvr-r3jv-pc5j affects `>= 16.2.0, < 16.3.6` (https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), so it is patched. Before 10-03 it was reachable via `/api/og?d=` (nodejs runtime + user deck name in JSX).
- **Residual CI-gate advisories (2026-10-10)**: 1241339 `@modelcontextprotocol/sdk` (via shadcn), 1241210 `proxy-addr` (via @lhci/cli + shadcn), 1241221 `compression` (dev tooling), 1241209 `source-map-js` (`npm audit fix` available). All dev/build-time.
- **Hosting**: Vercel Hobby. Image optimization runs on Vercel's managed infra, not the app's `sharp`. 30-day usage (user screenshot, 2026-10-10): Active CPU 44m/4h, ISR writes 34K/200K, image transforms 23/5K.
- **Node 20 EOL**: 2026-04-30 (https://endoflife.date/api/nodejs/20.json). CI `test.yml` still pinned to Node 20 as of 2026-10-10.

## Testing & CI
- **monitoring-index timeout**: valid_until: Phase 1 of archive plan (Sentry removal). Root cause: `vi.resetModules()` + `await import("../index")` re-transforms `SentryAdapter` → `@sentry/nextjs` + OpenTelemetry, ~8.7s on Windows under full-suite load. Passes in <1s alone. The earlier "system-level concurrency" explanation was incomplete.

## Repo gotchas
- Local `main` can lag `origin/main`; run `git fetch` before auditing. A stale local tree produced a wrong "50 vulnerabilities / unpatched RCE" report on 2026-10-10.
- `/debug` and `/design-system` are reachable in prod; `/debug` exposes only `NEXT_PUBLIC_API_URL` (public), so not a risk.
- `nul` and `tsconfig.tsbuildinfo` at repo root are git-ignored.

## Rejected Approaches
- **`output: 'export'` static site** (2026-10-10): would require moving CSP/headers/redirects to host config, making `/deck-builder` metadata static, and disabling image optimization. Too much work for an archive; zero API routes on Vercel gives most of the security benefit.
- **Baking a data snapshot into the repo** (2026-10-10): the community API on GitHub Pages is the owner's own and also serves the images, so a snapshot removes no real dependency.
- **Replacing `uuid`, removing Playwright, major upgrades (React/TS/ESLint/Vitest 5), cleaning 60 lint warnings**: out of scope for archive mode.
