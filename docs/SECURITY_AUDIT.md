# Security Audit

> Last reviewed: 2026-03-01

## Resolved

### minimatch — ReDoS (Regular Expression Denial of Service)

- **Severity:** High
- **Advisory:** [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74)
- **Affected package:** `minimatch` 10.0.0–10.2.2 (via `@ts-morph/common`)
- **Resolution:** Fixed via `npm audit fix` on 2026-03-01.

---

## Deferred

### serialize-javascript — Remote Code Execution (RCE)

- **Severity:** High
- **Advisory:** [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq)
- **Affected package:** `serialize-javascript` ≤7.0.2
- **Dependency chain:** `@sentry/nextjs` → `@sentry/webpack-plugin` → `webpack` → `terser-webpack-plugin` → `serialize-javascript`

#### Why we are deferring

Running `npm audit fix --force` would downgrade `@sentry/nextjs` from v8.x to v7.120.4. This is a **major version downgrade** that would:

1. **Break the existing Sentry integration** — v8 and v7 have incompatible APIs and configuration.
2. **Require manual code changes** across Sentry config files and any instrumented code.
3. **Lose v8 features** currently in use by the project.

#### Why the risk is acceptable for now

- The vulnerable package (`serialize-javascript`) is only used at **build time** inside Webpack/Terser, not at runtime in production.
- It is **not exposed to user input** — an attacker cannot reach this code path through the application.
- The practical exploitability in this context is **very low**.

#### Action plan

- [ ] Monitor for a patched `@sentry/nextjs` v8.x release that updates its Webpack/Terser dependencies.
- [ ] Re-run `npm audit` periodically to check if the issue has been resolved upstream.
- [ ] When a compatible fix is available, apply it and remove this entry.
