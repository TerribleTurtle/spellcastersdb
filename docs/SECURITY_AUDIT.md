# Security Audit

> Last reviewed: 2026-10-24

## Resolved

### minimatch — ReDoS (Regular Expression Denial of Service)

- **Severity:** High
- **Advisory:** [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74)
- **Affected package:** `minimatch` 10.0.0–10.2.2 (via `@ts-morph/common`)
- **Resolution:** Fixed via `npm audit fix` on 2026-03-01.

### serialize-javascript — Remote Code Execution (RCE)

- **Severity:** High
- **Advisory:** [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq)
- **Affected package:** `serialize-javascript` ≤7.0.2
- **Resolution:** Resolved via `@sentry/nextjs` v10 (`^10.75.2`) upgrade on 2026-10-24, updating its transitive Webpack and Terser dependencies.

### next@16.4.3 Upgrade

- **Severity:** Maintenance / Security Hardening
- **Affected package:** `next`
- **Resolution:** Upgraded to `16.4.3` to apply upstream framework security patches and ensure compatibility with React 19.

### zod@^4.6.6 Upgrade

- **Severity:** Maintenance / Security Hardening
- **Affected package:** `zod`
- **Resolution:** Upgraded to `^4.6.6` for latest schema validation security, bug fixes, and performance improvements.

### @sentry/nextjs@^10.75.2 Upgrade

- **Severity:** Maintenance / Vulnerability Remediation
- **Affected package:** `@sentry/nextjs`
- **Resolution:** Upgraded to `^10.75.2` (v10), eliminating legacy transitive build dependencies and aligning with Next.js 16.

### /api/revalidate Empty-Secret Guard

- **Severity:** High / Authentication Bypass Prevention
- **Affected route:** `/api/revalidate`
- **Resolution:** Added server-side validation rejecting requests when `REVALIDATION_SECRET` is unset, empty, or whitespace-only, preventing unintended open revalidation endpoints when environment variables are omitted.

---

## Deferred

None. No deferred high or critical severity items remain.
