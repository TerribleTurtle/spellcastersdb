# Privacy Audit Report

**Date:** 2026-02-20
**Methodology:** DPO (`@privacy`) workflow — GDPR/CCPA gap analysis against live codebase.

## Executive Summary

SpellcastersDB stores **zero Personally Identifiable Information (PII)** server-side. All user data (decks, themes, preferences) is persisted exclusively in browser `localStorage`. The application is cookie-less and does not implement user accounts.

## Findings

### ✅ No Issues Found

| Area              | Status  | Details                                                                                                                                                                    |
| :---------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PII Storage**   | ✅ Pass | No server-side PII. Decks, themes, and filters stored in `localStorage` only.                                                                                              |
| **Cookies**       | ✅ Pass | Zero cookies set. Vercel Analytics and Speed Insights are cookie-less.                                                                                                     |
| **Sentry PII**    | ✅ Pass | `beforeSend` hook strips IPs, emails, and tokens. Session Replay disabled. Telemetry routed through Next.js tunnel (`/monitoring`) to prevent direct third-party requests. |
| **Rate Limiting** | ✅ Pass | `anonymizeIp()` applies one-way HMAC-SHA256 hash before passing to Upstash Redis. Raw IPs never stored. Hash TTL is 10 seconds.                                            |
| **Short Links**   | ✅ Pass | Deck/team share links (Upstash Redis) contain only encoded game state (card IDs). No user metadata attached.                                                               |

### 🟡 Medium Priority — Remediated

| Gap                                           | Resolution                                                                                                                                        |
| :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sentry not disclosed** in `/privacy` page   | Added dedicated "Error Monitoring (Sentry)" section disclosing PII stripping, tunneled ingestion, and no cookies/replays.                         |
| **Tally.so not disclosed** in `/privacy` page | Added dedicated "Feedback (Tally)" section disclosing that only the current page URL (game state) is sent as context.                             |
| **No local data erasure instructions**        | Added explicit browser-specific instructions for clearing `localStorage`, plus a one-click "Clear All Data" button (`ClearDataButton` component). |

## Sub-Processors

| Service               | Purpose                          | Data Sent                               | PII Risk         |
| :-------------------- | :------------------------------- | :-------------------------------------- | :--------------- |
| Vercel Analytics      | Page views, device type, country | Aggregated, anonymous                   | None             |
| Vercel Speed Insights | Core Web Vitals                  | Performance metrics                     | None             |
| Sentry                | Error monitoring                 | Stack traces (PII-stripped)             | None (mitigated) |
| Upstash Redis         | Rate limiting, short links       | Hashed IP (10s TTL), encoded game state | None (mitigated) |
| Tally.so              | Feedback forms                   | User-submitted text, page URL           | Low (voluntary)  |

## Conclusion

All medium-priority gaps identified during this audit have been remediated in the `/privacy` page. No further action required unless new sub-processors are introduced.
