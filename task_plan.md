# Archive Mode (lite) plan

**Goal:** Safe, green CI, less Vercel usage, fewer third-party services, deck builder untouched.
**Approach:** Small code changes in files the deck builder doesn't use, plus dashboard cleanup. Upstash and Sentry are switched off by removing their env vars; the code already degrades (`redis.ts` exports `null` without env vars, share falls back to permanent `?d=` links; monitoring uses ConsoleAdapter without a DSN).
**Success criteria:** `npm run audit`, `npm run preflight`, `npm run build`, `npx playwright test` exit 0; build route table shows no hourly revalidation; deck build → share → open link works on the Vercel preview.

## Code (one flash worker, in place on `chore/archive-mode`; I verify and commit)
- [ ] 1 CI green: `npm uninstall shadcn @lhci/cli`; delete `lighthouserc.js`; remove `lighthouse` script; `npm audit fix` (no `--force`); drop `.nsprc` entries `npm run audit` reports as unmatched; `.github/workflows/test.yml` node 20 → 24 · verify `npm run audit` exit 0
- [ ] 2 Stop hourly refresh: `src/lib/config.ts:12` `REVALIDATE_SECONDS` → `false` (fix type + users `api-client.ts:67`, `patch-history.ts:62`); delete `export const revalidate` in `src/app/page.tsx:45`, `src/app/guide/page.tsx:21`, `src/app/sitemap.ts:6` · verify `npm run build` table has no `1h` revalidate entries
- [ ] 3 Trim: delete `.github/workflows/revalidate.yml`; delete `src/app/discord-bot/` + its nav/sitemap/seo-guards entries; remove Tally (script in `layout.tsx`, `FeedbackButton` + `useFeedback` + tests, uses in `Navbar.tsx`/`DesktopSidebar.tsx`), `<Analytics/>`, `<SpeedInsights/>`; drop `tally.so`, `va.vercel-scripts.com`, `vitals.vercel-insights.com` from CSP; `npm uninstall @vercel/analytics @vercel/speed-insights` · verify `npm run preflight`, `npm run build`, `npx playwright test`

## Me
- [ ] 4 Review diff (`git diff --stat` vs files above; no deck-builder files touched), rerun checks, commit, push branch, open PR
- [ ] 5 You test on the Vercel preview: build a deck, share, open link in a private window; same for a team

## You (dashboards, ~10 min, after merge)
- Vercel env vars: delete `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SALT`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `REVALIDATION_SECRET`, `GITHUB_TOKEN`; turn off Web Analytics + Speed Insights; Node.js version 22 or 24. Redeploy.
- Delete the Upstash database and Sentry project. GitHub secrets: delete `APP_URL`, `REVALIDATION_SECRET`.
- Future data refresh = redeploy.

## Not doing (deliberately)
Share-link rewrite, removing `/api/og` (patched; runs only when links are shared), static `/deck-builder`, new E2E suite, Sentry package removal, docs rewrite. Known leftover: `monitoring-index.test.ts` can time out under full-suite load on Windows (Sentry import cost); rerun alone if it's the only failure.
