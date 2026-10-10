# Archive Mode plan

**Goal:** Put SpellcastersDB into low-maintenance archive mode: safe, green CI, fewer third-party services, deck + team builder still fully working.
**Approach:** Remove server features that only made sense for a live game (Redis short links, dynamic OG images, revalidation webhook, Sentry, roadmap/Discord pages) and dev tools that cause most of the audit noise. No re-architecture.
**Success criteria:**
- `npm run audit` exits 0 (CI security gate green) without adding new `.nsprc` exceptions.
- `npm run preflight`, `npm run build`, `npm run test:e2e` exit 0.
- Deck and team share links round-trip (copy → open in new tab → same deck), as permanent `?d=` / `?team=` URLs.
- Zero required secrets/env vars for production; Upstash, Sentry, GitHub API dependencies gone.
- Old `/s/<id>`, `/roadmap`, `/discord-bot` URLs redirect instead of 404.

**Non-goals (rejected; see findings.md):** static export, baking a data snapshot, framework/major upgrades, lint-warning cleanup, replacing `uuid`, removing Playwright.

## Execution model
- Branch `chore/archive-mode` off synced `main`. One `flash` worker at a time, editing in place; I verify and commit after each step. Never push to `main`; finish with a PR.
- Sequential on purpose: steps share `package.json`, `package-lock.json`, `next.config.ts`. Each step uninstalls its own packages so the build proves nothing still imports them. All prose docs are consolidated in Step 6.
- My checks per step (T2): rerun the DONE commands, `git diff --stat` vs ALLOWED FILES, confirm the only deleted tests belong to deleted features. Steps 3, 4 and Final also get a full diff read (T3).
- Until Step 1 lands, `monitoring-index.test.ts` can time out under full-suite load: if it is the only failure, rerun that file alone and accept a pass.

## Phase 0: Setup (me)
- [ ] 0.1 Create branch `chore/archive-mode`; record baseline `npm run preflight` + `npm run audit` output · verify: branch exists, baseline saved to progress.md
- [ ] 0.2 Deck builder safety net (written BEFORE any removal, must pass on current code): new `e2e/deck-builder-archive.spec.ts` covering (a) solo: pick spellcaster, add ≥2 cards, assert slots actually filled; (b) share: click `share-deck-btn`, read clipboard, assert `?d=` URL; open it in a fresh context, assert same spellcaster + cards; (c) team: fill a card in a team deck, share, round-trip `?team=`; (d) save deck → reload → deck still in saved list; (e) mobile project smoke (page loads, card add works). Stub `/api/share` with `page.route` → 503 so tests never touch real Redis and pass both before and after Phase 4. Add `E2E_PROD=1` switch in `playwright.config.ts` webServer (`npx next start -p 3010` instead of `next dev`) · verify `npx playwright test e2e/deck-builder-archive.spec.ts` passes in dev AND after `npm run build` with `E2E_PROD=1` · tier: flash

**Deck builder gate (run by me after every phase, before commit):** `npx playwright test` (all specs, dev) + `npm run build` then `$env:E2E_PROD=1; npx playwright test e2e/deck-builder-archive.spec.ts`. Any failure blocks the commit. Tests in the safety-net spec may not be weakened or skipped by later workers.

## Phase 1: Remove Sentry (fixes the flaky test, drops one third-party service)
- [ ] 1.1 Delete `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation-client.ts`, `src/components/debug/SentryCrashTest.tsx`, `src/services/monitoring/SentryAdapter.ts` (+ its test). Edit `src/instrumentation.ts` (keep `register()`/`fetchGameData`), `src/app/global-error.tsx` (use `monitoring`), `src/services/monitoring/index.ts` (always `ConsoleAdapter`), `src/services/monitoring/__tests__/monitoring-index.test.ts` (drop Sentry case), `next.config.ts` (drop commented Sentry wrapper + `*.ingest.us.sentry.io` from CSP), `vitest.config.ts:55`. `npm uninstall @sentry/nextjs` · verify `git grep -n -i "sentry" -- src next.config.ts vitest.config.ts` → only comments/none; `npx vitest run src/services/monitoring` < 5s; `npm run preflight`; `npm run build` · tier: flash

## Phase 2: Green CI security gate
- [ ] 2.1 `npm uninstall shadcn @lhci/cli`; delete `lighthouserc.js`; remove `lighthouse` script; `npm audit fix` (no `--force`); delete `.nsprc` entries that `npm run audit` reports as unmatched; bump `node-version` 20 → 24 in `.github/workflows/test.yml` (Node 20 EOL 2026-04-30). Keep `components.json` (`npx shadcn@latest` still works later) · verify `npm run audit` exit 0; `npm run preflight`; `npm run build` · tier: flash

## Phase 3: Replace dynamic OG images with the static card (must precede Phase 4: `/api/og` uses ratelimit/anonymize-ip)
- [ ] 3.1 Delete `src/app/api/og/**`, `src/services/api/asset-cache.ts` (+ test), `src/assets/fonts/`. Point metadata/JSON-LD at `/og-default.png` in `src/services/metadata/metadata-service.ts` and `src/app/{consumables,incantations/spells,incantations/units,spellcasters,titans}/[id]/page.tsx`; update `metadata-service.test.ts` expectations; remove `/api/og/:path*` header block from `next.config.ts`. `npm uninstall @vercel/og @fontsource/oswald` · verify `git grep -n "api/og" -- src next.config.ts` → 0 hits; `npm run preflight`; `npm run build` · tier: flash

## Phase 4: Retire Redis short links → permanent hash links
- [ ] 4.1 TDD: write failing tests for a pure `buildShareUrl({ origin, path, deck | teamDecks+teamName+activeSlot })` in `src/services/sharing/build-share-url.ts` (reuse `encodeDeck`/`encodeTeam`, same URL shape as today's fallback), then implement · verify `npx vitest run src/services/sharing` · tier: flash
- [ ] 4.2 Switch the 10 callers (`useDeckSharing.ts`, `useTeamEditor.ts`, `TeamShareButton.tsx`, `SoloOverview.tsx`, `DeckRow.tsx`, `TeamRow.tsx`, `SoloEditorLayout.tsx`, `TeamDeckEditorRow.tsx`, `TeamHeader.tsx`, `TeamOverview.tsx`) to `buildShareUrl` + one "Link copied" toast; update `useDeckSharing*.test.ts` and `useTeamEditor.test.tsx` (drop rate-limit/short-link cases only). Delete `src/app/api/share/**`, `src/app/s/[id]/**`, `create-short-link.ts`, `src/services/infrastructure/{redis,ratelimit,anonymize-ip}.ts` (+ tests). Add redirect `/s/:id` → `/deck-builder?error=link-expired` (non-permanent) in `next.config.ts`; the existing `useShareErrorHandler` toast explains it. Prune error codes in `useShareErrorHandler.ts` that can no longer occur (`redis-offline`, `invalid-data`, `server-error`), keep `link-expired`. `npm uninstall @upstash/redis @upstash/ratelimit` · verify `git grep -n -E "createShortLink|api/share|upstash|ratelimit|anonymizeIp|isShortLink|rateLimited" -- src` → 0 hits; `npm run preflight`; `npm run build`; `npm run test:e2e` · tier: flash

## Phase 5: Freeze data refresh + prune dead-game pages + drop remaining third parties
- [ ] 5.1 Delete `src/app/api/revalidate/`, `.github/workflows/revalidate.yml`; remove `tags: [...]` in `src/services/api/api-client.ts:68` (+ its test expectation). Delete roadmap (`src/app/roadmap/`, `src/components/roadmap/`, `src/services/roadmap-service.ts` + test, `src/data/roadmap-fallback.ts`, `src/types/roadmap.ts`, `scripts/fetch_issues.js`) and `src/app/discord-bot/`; edit `src/lib/nav-links.ts`, `src/app/sitemap.ts`, `src/__tests__/seo-guards.test.ts`. Add redirects `/roadmap`, `/discord-bot` → `/about`, and add a short "Archive status" section near the top of `src/app/about/page.tsx` (game sunset 2026-06-19; site preserved read-only; deck/team builder still work; no further updates). D1: remove Tally (`FeedbackButton.tsx`, `useFeedback.ts` + test, `layout.tsx`, CSP `tally.so`), Vercel Speed Insights and Vercel Analytics (`layout.tsx`, CSP `va.vercel-scripts.com`, `vitals.vercel-insights.com`); `npm uninstall @vercel/analytics @vercel/speed-insights` · verify `git grep -n -i -E "revalidate\.yml|api/revalidate|roadmap-service|discord-bot|tally|@vercel/analytics|speed-insights|vercel-scripts|vercel-insights" -- src next.config.ts .github` → 0 hits; `npm run preflight`; `npm run build` · tier: flash
- [ ] 5.2 D3 freeze ISR: set `CONFIG.API.REVALIDATE_SECONDS` in `src/lib/config.ts:12` to `false` (cache until next deploy; fix the type and the two users `api-client.ts:67`, `patch-history.ts:62`); delete `export const revalidate` in `src/app/page.tsx:45`, `src/app/guide/page.tsx:21`, `src/app/sitemap.ts:6`. Make `/deck-builder` static: remove the `searchParams`-based `generateMetadata` in `src/app/deck-builder/page.tsx` (use the default deck-builder metadata from `metadata-service.ts`; delete `generateSingleDeckMetadata`/`generateTeamMetadata` + their tests). Client import via `useSoloImport` already reads `?d=`/`?team=` · verify `npm run build` route table shows no `Revalidate 1h` column values and `/deck-builder` as `○` (static); `npm run test:e2e` (deck/team import from URL still works); `npm run preflight` · tier: flash

## Phase 6: Docs, env, privacy page, archive notes
- [ ] 6.1 Update `.env.local.example`, `README.md`, `CONTRIBUTING.md`, `docs/*.md`, `src/app/privacy/page.tsx` (remove Sentry/Upstash/Vercel Analytics/Tally sections so the policy matches reality), `AGENTS.md` + `.agents/rules/agent.md` (CI row; add a ≤10-line "Archive maintenance" section: data only refreshes on redeploy; quarterly `npm run audit`, `npm run preflight`, `npm run build`). `CHANGELOG.md` entry + version 1.1.0 · verify `git grep -n -i -E "upstash|sentry|REVALIDATION_SECRET|IP_HASH_SALT|GITHUB_TOKEN|lighthouse|tally|speed-insights" -- . ":!CHANGELOG.md" ":!docs/plans" ":!package-lock.json" ":!findings.md" ":!task_plan.md"` → 0 hits; `npm run format:check` · tier: flash

## Final: Verify and hand off (me)
- [ ] F.1 Full `npm run preflight`, `npm run build`, `npm run test:e2e`, `npm run audit` all exit 0; read the full `git diff main` (T3)
- [ ] F.2 Push branch, open PR; on the Vercel preview: create deck → copy link → open in private window; same for team; `/s/abc1234` redirects with the expired-link toast; `/roadmap` lands on the archive notice; one entity page renders; CSP header present
- [ ] F.3 Update findings.md / progress.md; remove leftover local branches after your OK

## After merge (you, in dashboards; I can't do these)
- Vercel → Env Vars: delete `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SALT`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `REVALIDATION_SECRET`, `GITHUB_TOKEN`. Disable Web Analytics + Speed Insights in the project. Check Project → Node.js version is 22 or 24.
- Delete the Upstash database and the Sentry project. GitHub → Secrets: delete `APP_URL`, `REVALIDATION_SECRET`.
- To refresh game data in future: redeploy (Vercel → Redeploy). Nothing refreshes on its own.

## Decisions (confirmed 2026-10-10)
- D1 Remove Tally, Vercel Speed Insights and Vercel Analytics (no visitor counts afterwards).
- D2 Delete roadmap + Discord bot pages; redirect both to `/about`, which gets an "Archive status" notice.
- D3 Freeze ISR (pages cached until next deploy) and make `/deck-builder` static. Trade-off: shared deck links preview with the generic site title/image instead of the deck name.

