# Documentation Health & Usability Report

**Date:** 2026-02-14
**Repository:** SpellcastersDB
**Auditor:** Antigravity

## Executive Summary

The codebase is generally well-structured with strong typing and inline documentation for complex logic (e.g., `api.ts`). However, significant **Documentation Drift** has occurred in environment configuration and script definitions. New contributors may struggle to set up the environment correctly due to missing variables in `.env.local.example`.

**Overall Health Score: B-** (Strong internals, drifting onboarding docs)

---

## 🔴 DRIFT (Misleading Information)

_The following items are actively incorrect or incomplete and may cause errors._

### 1. Environment Variables Gap

The code relies on several environment variables that are missing from `.env.local.example`:

- `NEXT_PUBLIC_USE_LOCAL_ASSETS` (Found in `config.ts`)
- `LOCAL_DATA_PATH` (Found in `config.ts`)
- `UPSTASH_REDIS_REST_URL` & `TOKEN` (Found in `ratelimit.ts`)

**Impact:** A new developer following the "copy example env" step will have a partially broken environment (missing rate limiting, asset toggles).

### 2. Script Definitions

There is inconsistency between `README.md`, `CONTRIBUTING.md`, and `package.json`:

- `README.md` lists `npm run test:watch`.
- `CONTRIBUTING.md` is the most accurate but dictates `npm run check-data` which is absent from README.
- `package.json` contains `lint` and `type-check` which are only mentioned in `CONTRIBUTING.md`.

**Recommendation:** `README.md` should link to `CONTRIBUTING.md` for detailed workflows to avoid duplication drift.

---

## 🟡 MISSING (Knowledge Gaps)

_The following items are defined in code but lack high-level documentation._

### 1. State Management (Zustand)

The global store is complex, split into slices (`createSoloSlice`, `createTeamSlice`, etc.), but these files lack JSDoc headers explaining their specific responsibilities or how they interact.

- **Location:** `src/store/`

### 2. "Magic" Logic Documentation

- **API Fallbacks:** `src/services/api/api.ts` contains logic for sticking to specific data sources based on environment, which is critical but only documented in code comments.
- **Asset Handling:** The preference for `webp` vs `png` is configurable but undocumented in user-facing docs.

### 3. Orphaned Documentation

- `docs/GITHUB_TOKEN_SETUP.md` exists but is not linked from `README.md` or `CONTRIBUTING.md`. Users may miss this optimization step.
- `ROADMAP.md` is referenced in legacy reports but is missing from the project root (superseded by `active_state.md`?).

---

## 🟢 STYLE & CLARITY

_Improvements for readability and maintenance._

- **Type Safety:** The API layer (`api.ts`) has excellent return type coverage (`Promise<UnifiedEntity[]>`), setting a good standard.
- **Onboarding:** The "Getting Started" section in `README.md` is clean but should explicitly mention the need for the API repo if working on data features.

---

## Recommended Action Plan

1.  **fix(env):** Update `.env.local.example` with all current variables (marked as optional where appropriate).
2.  **docs(readme):** Consolidate script commands. Link `GITHUB_TOKEN_SETUP.md`.
3.  **docs(store):** Add high-level JSDoc to `src/store/index.ts` and slices.
