# SpellcastersDB.com Task List

> **Note:** Completed tasks from Phases 0-10 have been moved to `ARCHIVE.md`.

## Future Backlog

## E2E Tests (Playwright)

- [ ] Reimplement Deck Edge Cases (`clear deck`, unsaved changes modal) using URL state initialization (`/deck-builder?d=...`) to avoid brittle Drag & Drop interactions and wait failures.
- [ ] Investigate and stabilize `theming.spec.ts` failure across runners.
- [ ] **User Accounts**: Auth via Supabase/NextAuth
- [ ] **Cloud Decks**: Save decks to cloud account instead of localStorage
- [ ] **Public Profile**: Shareable user profile with favorite decks
- [ ] **Deck Ratings**: Community voting system
- [ ] **Patch History Data Pipeline**: Deploy balance_index, changelog, timeline JSON endpoints
- [ ] **TanStack Query**: Adopt `@tanstack/react-query` for client-side server state when User Accounts / Cloud Decks ship (low risk, incremental — see ROI report). Pairs with Zustand (client state) without conflict.
- [ ] **Tech Debt: Eslint v10 Migration**: Upgrade `eslint` to v10 to resolve transitive dependency vulnerabilities in `minimatch` and `ajv` (currently blocked by `eslint-config-next`).
