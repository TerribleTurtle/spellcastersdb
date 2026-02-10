# Documentation Health & Usability Report

**Date:** 2026-02-10
**Repository:** SpellcastersDB

## Executive Summary

The **SpellcastersDB** repository has a good technical foundation with a modern Next.js stack. The code itself is generally well-structured with helpful inline comments in complex logic (e.g., `useDeckBuilder.ts`). The `docs/` directory contains valuable specific information regarding API specs and migration.

However, the **onboarding experience for a new developer is currently fragmented**. The root `README.md` is minimal and does not effectively act as an entry point to the deeper documentation available. There is no high-level architectural overview, making it difficult to understand how the data layer, UI, and deck builder logic connect without diving into the code.

**Score: B-** (Strong technical internals, weak entry-point/onboarding docs)

---

## Critical Gaps (High Priority)

These items represent barriers to entry or missing essential information.

- **[ ] Comprehensive `README.md`**: The current README is a standard Next.js template. It needs:
  - A high-level project description (What does this app actually _do_? Deck building, database viewing, etc.).
  - Links to the rich sub-documentation in `docs/`.
  - Architecture Overview (e.g., "We fetch static JSON data, validate it with Zod, and render via Next.js").
- **[ ] Environment Variable Documentation**: usage of `NEXT_PUBLIC_API_URL` is seen in the code (`api.ts`), but there is no `.env.example` explanation or documentation in the README about what values are expected or how to override them for local dev vs. prod.
- **[ ] `CONTRIBUTING.md` Expansion**: The current file is very basic. It should include:
  - Code style guidelines (prettier, eslint).
  - Branch naming conventions.
  - Explanation of the "Source of Truth" (referencing `active_state.md`).

## Clarity & Accuracy (Medium Priority)

These items cause confusion but don't stop development.

- **[ ] Ambiguous Script Usage**: `npm run check-data` is listed, but its output and purpose (troubleshooting API connection) could be better explained.
- **[ ] Roadmap Synchronization**: `ROADMAP.md` appears slightly outdated compared to `active_state.md` (which tracks daily progress). This can confuse a new contributor about what is effectively "live" vs "planned".
- **[ ] Inline Comments Cleanup**: Some components (e.g., `TeamRow.tsx`) contain "note to self" style comments (e.g., // Let's create a shared ItemMenu component...) which should be resolved or moved to an issue tracker.
- **[ ] "Magic" Logic Documentation**: The `api.ts` file has specific logic for "Local Dev Override" hardcoded to a specific windows path. This will fail for any other developer. This needs to be documented or, better yet, moved to a config/env variable.

## Structure & Formatting (Low Priority)

- **[ ] Standardized Headers**: `MIGRATION_SPEC.md` and `api_info.md` use slightly different header styles.
- **[ ] Image/Asset management**: There is no documentation on where to put new assets or how the `public/` folder is organized.

---

## Action Plan

To improve the Documentation Health to an **A** standard:

1.  **Immediate Fixes (The "Front Door"):**
    - [ ] Update **`README.md`** to be the true "Table of Contents" for the project. Link to `active_state.md`, `ROADMAP.md`, and `docs/*.md`.
    - [ ] Add an "Architecture" section to `README.md` explaining the Data Layer -> Registry -> UI flow.

2.  **Developer Experience:**
    - [ ] Update **`CONTRIBUTING.md`** with specific steps for setting up the environment, including the `NEXT_PUBLIC_API_URL` requirement.
    - [ ] Document the "Local Dev Override" logic in `api.ts` so new devs know how to point to their own local API repo if needed.

3.  **Cleanup:**
    - [ ] Sync `ROADMAP.md` with the reality in `active_state.md` (or deprecate one).
    - [ ] Scan codebase for `// TODO` or `// NOTE` comments and either convert them to GitHub Issues or resolve them.
