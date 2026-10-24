# Privacy Audit Report

**Date:** 2026-02-20 (Updated: 2026-10-24 for Archive Mode)  
**Methodology:** DPO (`@privacy`) workflow — GDPR/CCPA gap analysis against live codebase.

## Executive Summary

SpellcastersDB stores **zero Personally Identifiable Information (PII)** server-side. All user data (decks, themes, preferences) is persisted exclusively in browser `localStorage`. The application is cookie-less and does not implement user accounts.

## Archive Mode Update (2026-10-24)

As part of the transition to Archive Mode:
- **Vercel Analytics** and **Speed Insights** tracking libraries and components have been completely removed.
- **Tally.so** user feedback widgets and embeds have been removed.
- **Sentry** error tracking is disabled (`NEXT_PUBLIC_SENTRY_DSN` is empty/disabled by default).
- No third-party telemetry, tracking cookies, analytics pixels, or external feedback forms remain active in the production build.

## Findings

### ✅ No Issues Found

| Area              | Status  | Details                                                                                                                                                                    |
| :---------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PII Storage**   | ✅ Pass | No server-side PII. Decks, themes, and filters stored in `localStorage` only.                                                                                              |
| **Cookies**       | ✅ Pass | Zero cookies set. No third-party analytics or tracking cookies.                                                                                                            |
| **Sentry PII**    | ✅ Pass | Sentry is disabled in archive mode. If re-enabled, `beforeSend` hook strips IPs, emails, and tokens; Session Replay remains disabled.                                       |
| **Rate Limiting** | ✅ Pass | `anonymizeIp()` applies one-way HMAC-SHA256 hash before passing to Upstash Redis. Raw IPs never stored. Hash TTL is 10 seconds.                                            |
| **Short Links**   | ✅ Pass | Deck/team share links (Upstash Redis) contain only encoded game state (card IDs). No user metadata attached.                                                               |

### 🟡 Medium Priority — Remediated

| Gap                                           | Resolution                                                                                                                                        |
| :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sentry not disclosed** in `/privacy` page   | Added dedicated "Error Monitoring (Sentry)" section disclosing PII stripping, tunneled ingestion, and no cookies/replays.                         |
| **Tally.so not disclosed** in `/privacy` page | Added dedicated "Feedback (Tally)" section disclosing that only the current page URL (game state) is sent as context.                             |
| **No local data erasure instructions**        | Added explicit browser-specific instructions for clearing `localStorage`, plus a one-click "Clear All Data" button (`ClearDataButton` component). |

## Sub-Processors

| Service       | Purpose                    | Data Sent                               | PII Risk         | Status                        |
| :------------ | :------------------------- | :-------------------------------------- | :--------------- | :---------------------------- |
| Upstash Redis | Rate limiting, short links | Hashed IP (10s TTL), encoded game state | None (mitigated) | Active                        |
| Sentry        | Error monitoring           | Stack traces (PII-stripped)             | None (mitigated) | Disabled in Archive Mode      |
| Vercel Analytics | Page views, country      | Aggregated metrics                      | None             | **Removed** (Archive Mode)    |
| Vercel Speed Insights | Performance metrics  | Core Web Vitals                         | None             | **Removed** (Archive Mode)    |
| Tally.so      | Feedback forms             | User text, page URL                     | Low (voluntary)  | **Removed** (Archive Mode)    |

## Conclusion

All medium-priority gaps identified during this audit have been remediated in the `/privacy` page. In Archive Mode, external third-party sub-processors (Vercel Analytics, Speed Insights, Tally.so) have been decommissioned and Sentry disabled, further minimizing exposure.
