# Findings

- **Security Override Technique**: Deeply nested vulnerable dependencies inside developer tools (like `@lhci/cli` containing old `uuid`) can be securely resolved via `overrides` in `package.json` without breaking the top-level package constraints if the changes are API-compatible.
- **Monitoring Flakiness**: The 5000ms timeout for `src/services/monitoring/__tests__/monitoring-index.test.ts` during full `npm run preflight` on Windows is an isolated concurrency timeout. The test itself passes locally in <1s.
