# AGENTS.md — SpellcastersDB

> **Last generated:** 2026-03-01
> **Source:** Automated repo scan

---

## Project Identity

| Field        | Value                                                                                                 |
| :----------- | :---------------------------------------------------------------------------------------------------- |
| **Name**     | SpellcastersDB                                                                                        |
| **Purpose**  | Community database, deck builder, and team builder for the game *Spellcasters Chronicles*             |
| **Live URL** | [spellcastersdb.com](https://spellcastersdb.com)                                                      |
| **Repo**     | [TerribleTurtle/spellcastersdb](https://github.com/TerribleTurtle/spellcastersdb)                     |
| **License**  | MIT                                                                                                   |
| **Node**     | 20                                                                                                    |

## Stack

| Layer          | Technology                                                           |
| :------------- | :------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, React 19)                                    |
| Language       | TypeScript 5.9 (`strict`, `ES2022` target)                           |
| Styling        | Tailwind CSS v4, CSS Modules for design tokens, shadcn/ui (New York) |
| State          | Zustand 5 (sliced stores: `solo`, `team`, `ui`, `persistence`)      |
| Validation     | Zod 4 (runtime schema validation for all API data)                   |
| Data Source    | Static JSON API — [Spellcasters Community API v2](https://terribleturtle.github.io/spellcasters-community-api/api/v2) |
| Search         | Fuse.js (client-side fuzzy search)                                   |
| Drag & Drop    | @dnd-kit                                                             |
| Icons          | Lucide React                                                         |
| UI Primitives  | Radix UI                                                             |
| PWA            | Serwist (`@serwist/next`)                                            |
| Monitoring     | Sentry (`@sentry/nextjs`)                                            |
| Analytics      | Vercel Analytics + Speed Insights                                    |
| Short Links    | Upstash Redis                                                        |
| Rate Limiting  | Upstash Ratelimit                                                    |
| Images         | Sharp (AVIF/WebP, remote patterns for `terribleturtle.github.io`)    |
| Testing        | Vitest 4 (unit) + Playwright 1.58 (E2E)                             |
| Linting        | ESLint 9 (flat config) + `eslint-config-next` + `jsx-a11y` + `unused-imports` |
| Formatting     | Prettier 3 + `@trivago/prettier-plugin-sort-imports`                 |
| Bundling       | Webpack (production), Turbopack (dev)                                |
| Architecture   | dependency-cruiser (enforced import boundaries)                      |
| Dead Code      | knip                                                                 |
| Git Hooks      | Husky + lint-staged (prettier + eslint on `*.{ts,tsx}`)              |
| CI/CD          | GitHub Actions (lint, format, type-check, data-check, unit-test, build, daily revalidation) |

## Directory Structure

```
spellcastersdb/
├── .github/workflows/       # CI: test.yml (6-job pipeline), revalidate.yml (daily cache bust)
├── docs/                    # Project documentation (brand, E2E, security, SEO, state mgmt)
├── e2e/                     # Playwright E2E specs (Desktop Chromium + Mobile Safari)
├── public/                  # Static assets, PWA icons, manifest
├── scripts/                 # Dev utilities (scaffolding, validation, debug, coverage)
├── src/
│   ├── __tests__/           # Top-level / adversarial test suites
│   ├── app/                 # Next.js App Router (pages, layouts, API routes)
│   │   ├── api/             # API routes (revalidate, og, short-links, local-assets)
│   │   ├── about/           # Static info pages
│   │   ├── changes/         # Patch history page
│   │   ├── classes/         # Class browser
│   │   ├── consumables/     # Consumables browser
│   │   ├── database/        # Main database archive
│   │   ├── debug/           # Internal analytics dashboard
│   │   ├── deck-builder/    # The Forge — deck building tool
│   │   ├── design-system/   # Token catalog + Theme Builder
│   │   ├── guide/           # Guide Hub (game mechanics, tiers, progression)
│   │   ├── incantations/    # Units & Spells database (entities)
│   │   ├── roadmap/         # GitHub-connected issue tracker
│   │   ├── s/               # Short link redirector
│   │   ├── schools/         # School browser
│   │   ├── spellcasters/    # Spellcaster profiles
│   │   ├── titans/          # Titan browser
│   │   └── ~offline/        # PWA offline fallback
│   ├── assets/              # Embedded static assets
│   ├── components/          # React components (domain-agnostic)
│   │   ├── changelog/       # Patch history display components
│   │   ├── common/          # Shared presentational components
│   │   ├── database/        # Archive-specific components
│   │   ├── debug/           # Debug/analytics widgets
│   │   ├── entity-card/     # Card rendering system
│   │   ├── inspector/       # Entity detail inspector
│   │   ├── layout/          # Shell, sidebar, navigation, breadcrumbs
│   │   ├── modals/          # Dialogs and modals
│   │   ├── providers/       # Context providers (theme, etc.)
│   │   ├── skeletons/       # Loading skeletons
│   │   └── ui/              # shadcn/ui primitives (button, dialog, input, etc.)
│   ├── data/                # Static data files
│   ├── features/            # Feature modules (domain logic + UI)
│   │   ├── deck-builder/    # Deck building logic, panels, modals
│   │   ├── team-builder/    # Team builder (3 decks, shared pool validation)
│   │   └── shared/          # Cross-feature components and utilities
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Shared utilities, config, routing, clipboard
│   ├── services/            # Core services (side-effect-free logic)
│   │   ├── api/             # Data fetching, registry (O(1) lookup), caching
│   │   ├── assets/          # Image/asset resolution
│   │   ├── config/          # App configuration
│   │   ├── dnd/             # Drag-and-drop utilities
│   │   ├── domain/          # Domain models and entity logic
│   │   ├── infrastructure/  # Infrastructure adapters
│   │   ├── logic/           # Pure business logic
│   │   ├── metadata/        # SEO metadata generation
│   │   ├── monitoring/      # Observability (ConsoleAdapter, MonitoringService)
│   │   ├── persistence/     # State persistence (localStorage, backup/restore)
│   │   ├── rules/           # DeckRules, TeamRules (game constraint logic)
│   │   ├── sharing/         # Short-link encoding/decoding
│   │   ├── utils/           # Service-layer utilities
│   │   └── validation/      # Zod schemas and runtime validators
│   ├── store/               # Zustand global store
│   │   ├── index.ts         # Store entrypoint
│   │   ├── createSoloSlice.ts      # Solo deck state
│   │   ├── createTeamSlice.ts      # Team builder state
│   │   ├── createUISlice.ts        # Transient UI state
│   │   ├── createPersistenceSlice.ts # Backup/restore + localStorage
│   │   ├── calculator-store.ts     # Knowledge Tracker calculator
│   │   ├── ui-store.ts             # Lightweight UI flags
│   │   └── selectors.ts            # Derived state selectors
│   ├── styles/              # Global CSS (design tokens, themes, shadcn, print)
│   └── types/               # TypeScript type definitions (api.d.ts, deck, dnd, enums)
├── components.json          # shadcn/ui configuration
├── eslint.config.mjs        # ESLint flat config
├── next.config.ts           # Next.js config (redirects, headers, CSP, images, Sentry, Serwist)
├── playwright.config.ts     # E2E config (port 3010, Desktop Chrome + Mobile Safari)
├── vitest.config.ts         # Unit test config (jsdom, coverage thresholds)
└── .dependency-cruiser.cjs  # Import boundary rules
```

## Import & Naming Conventions

### Path Alias

All source imports use the `@/` alias, which maps to `./src/*`:

```ts
import { SomeComponent } from "@/components/ui/SomeComponent";
import { DeckRules } from "@/services/rules/deck-rules";
```

### Import Order (Prettier-enforced)

Imports are automatically sorted by `@trivago/prettier-plugin-sort-imports` in this order:

1. `react`
2. `next`
3. Third-party modules
4. `@/…` (internal aliases)
5. Relative imports (`./`, `../`)

### File Naming

- **Components:** PascalCase (`EntityCard.tsx`, `DeckPanel.tsx`)
- **Hooks:** camelCase with `use` prefix (`useDebounce.ts`, `useFocusTrap.ts`)
- **Services / Utilities:** kebab-case (`deck-rules.ts`, `link-dictionary.ts`)
- **Types:** PascalCase for type files, `.d.ts` for declaration files (`api.d.ts`)
- **Tests:** Co-located `__tests__/` directories or `*.test.ts(x)` suffix
- **CSS:** kebab-case (`design-tokens.css`, `theme-tokens.css`)

### Code Style

- **Strict TypeScript:** `strict: true` in `tsconfig.json`. No `any` — use `unknown` and narrow.
- **Double quotes**, semicolons, trailing commas (`es5`), 2-space tabs.
- **Unused vars:** Prefix with `_` to suppress (`argsIgnorePattern: "^_"`).
- **Inline styles forbidden:** ESLint warns on `style` prop usage via `react/forbid-dom-props` and `react/forbid-component-props`. Use Tailwind utilities or CSS classes.
- **Test files:** `@typescript-eslint/no-explicit-any` is relaxed in `*.test.ts(x)` only.

## Architecture Boundaries (Enforced)

`dependency-cruiser` enforces these rules on every `npm run preflight` / `npm run deps:validate`:

| Rule                        | From                   | Cannot Import       |
| :-------------------------- | :--------------------- | :------------------ |
| `no-circular`               | *any module*           | *itself (cycles)*   |
| `no-ui-importing-features`  | `src/components/ui`    | `src/features`      |
| `no-features-importing-app` | `src/features`         | `src/app`           |

**Dependency flow:** `app` → `features` → `services` / `components` → `lib` / `types`

```
app (pages, layouts, API routes)
 └─▶ features (deck-builder, team-builder)
      └─▶ services (api, rules, validation, domain)
      └─▶ components (UI, layout, entity-card)
           └─▶ lib (utils, config)
           └─▶ types
```

## Commands

All commands are verified against `package.json` scripts.

### Development

| Command                      | Description                                      |
| :--------------------------- | :----------------------------------------------- |
| `npm run dev`                | Start dev server (Turbopack, port 3000)           |
| `npm run build`              | Production build (Webpack)                        |
| `npm start`                  | Start production server                           |

### Quality Gates

| Command                      | Description                                      |
| :--------------------------- | :----------------------------------------------- |
| `npm run preflight`          | **Run before every commit.** Type-check → format → lint → test → deps |
| `npm run type-check`         | TypeScript compiler check (`tsc --noEmit`)        |
| `npm run lint`               | ESLint (a11y, unused imports, React rules)         |
| `npm run format:check`       | Prettier formatting check                         |
| `npm test`                   | Vitest unit tests                                 |
| `npm run test:coverage`      | Unit tests with V8 coverage report                |
| `npm run test:watch`         | Vitest in watch mode                              |
| `npm run deps:validate`      | dependency-cruiser boundary validation             |

### E2E Testing

| Command                      | Description                                      |
| :--------------------------- | :----------------------------------------------- |
| `npm run test:e2e`           | Playwright tests (auto-starts dev on port 3010)   |
| `npm run test:e2e:ui`        | Playwright interactive UI mode                     |

### Code Health

| Command                      | Description                                      |
| :--------------------------- | :----------------------------------------------- |
| `npm run dead-code`          | Scan for unused exports/files via knip             |
| `npm run audit`              | CVE scan (`better-npm-audit`, respects `.nsprc`)   |
| `npm run analyze`            | Webpack bundle analyzer                            |
| `npm run lighthouse`         | Lighthouse CI (a11y, SEO, best practices, PWA)     |

### Data & Validation

| Command                      | Description                                      |
| :--------------------------- | :----------------------------------------------- |
| `npm run check-data`         | Verify API data fetching + parsing                 |
| `npm run script:validate`    | Validate production data integrity                 |

### Scaffolding

| Command                                  | Description                               |
| :--------------------------------------- | :---------------------------------------- |
| `npm run new:component <Name>`           | Generate component + test file             |
| `npm run new:component <Name> -- --dir=<subdir>` | Generate in a subdirectory        |
| `npm run new:route <name>`               | Generate App Router page + loading.tsx     |

## CI/CD

### Test Suite (`test.yml`)

Triggers on push to `main` and all PRs. Runs 6 parallel jobs:

1. **Lint** — `npm run lint`
2. **Format Check** — `npm run format:check`
3. **Security Audit** — `npx better-npm-audit audit --level high`
4. **Type Check** — `npm run type-check`
5. **Data Check** — `npm run check-data`
6. **Unit Tests** — `npm test`
7. **Build** — `npm run build` (only on `main`, after all checks pass)

### Daily Revalidation (`revalidate.yml`)

Runs daily at 00:00 UTC. Calls `/api/revalidate` with `REVALIDATION_SECRET` to bust cached content. Requires GitHub Secrets: `REVALIDATION_SECRET`, optionally `APP_URL`.

## Environment Variables

See `.env.local.example` for the full list. Key variables:

| Variable                         | Required | Description                                     |
| :------------------------------- | :------- | :---------------------------------------------- |
| `NEXT_PUBLIC_API_URL`            | Yes      | Community API base URL                           |
| `NEXT_PUBLIC_PREFERRED_ASSET_FORMAT` | Yes  | Image format (`webp` or `png`)                   |
| `REVALIDATION_SECRET`            | Prod     | Auth token for `/api/revalidate`                 |
| `IP_HASH_SALT`                   | Prod     | Salt for IP anonymization                        |
| `UPSTASH_REDIS_REST_URL`         | Optional | Redis for short-link sharing                     |
| `UPSTASH_REDIS_REST_TOKEN`       | Optional | Redis token                                      |
| `NEXT_PUBLIC_SENTRY_DSN`         | Optional | Sentry error tracking                            |
| `GITHUB_TOKEN`                   | Optional | Raises GitHub API rate limits for `/roadmap`     |
| `NEXT_PUBLIC_APP_URL`            | Yes      | Base URL for short-link redirects                |

**Never** commit `.env.local` or any secrets. Use `.env.local.example` as the template.

## Recommended Build Order

When implementing new features or onboarding, follow this order:

### 1. Types & Schemas

Define TypeScript types in `src/types/` and Zod schemas in `src/services/validation/`. The entire app depends on these contracts. Ensure API type definitions (`api.d.ts`) are up-to-date.

### 2. Services & Domain Logic

Build pure, side-effect-free logic in `src/services/`. This includes:
- **API layer** (`src/services/api/`): Data fetching, registry, caching
- **Domain models** (`src/services/domain/`): Entity relationships, computed properties
- **Rules** (`src/services/rules/`): `DeckRules`, `TeamRules` — game constraints
- **Validation** (`src/services/validation/`): Zod schema enforcement

### 3. Store (State Management)

Wire Zustand slices in `src/store/`. State changes should delegate to services for business logic. The store is split into:
- `createSoloSlice.ts` — Single deck state
- `createTeamSlice.ts` — Team of 3 decks, shared card pool
- `createUISlice.ts` — Transient UI flags (modals, panels)
- `createPersistenceSlice.ts` — Backup/restore, localStorage serialization

### 4. Components

Build presentational components in `src/components/`. These must be **domain-agnostic** — they receive data via props and callbacks. The `ui/` directory holds shadcn/ui primitives that must never import from `features/`.

### 5. Features (Vertical Slices)

Compose components + store + services into feature modules in `src/features/`. Each feature is self-contained:
- `deck-builder/` — The Forge deck building experience
- `team-builder/` — The Trinity team management
- `shared/` — Cross-feature utilities

Once steps 1–4 are done, **multiple agents can build feature slices in parallel** using separate git worktrees without conflict.

### 6. App Routes

Wire features into Next.js App Router pages in `src/app/`. Pages are thin wrappers that compose feature modules.

## Testing Strategy

### Unit Tests (Vitest)

- **Location:** Co-located `__tests__/` directories alongside source
- **Coverage thresholds:** Lines ≥ 42.09%, Functions ≥ 36.84%, Branches ≥ 42.10% (enforced, `autoUpdate: false`)
- **Environment:** jsdom
- **Adversarial suite:** `src/__tests__/adversarial/` — 85+ tests that fuzz inputs, break boundaries, and simulate data corruption

### E2E Tests (Playwright)

- **Location:** `e2e/` directory
- **Viewports:** Desktop Chromium (1440×900), Mobile Safari (iPhone 13)
- **Naming:** All interactive elements use `data-testid` attributes (see `docs/E2E_CONVENTIONS.md`)
- **Dev server:** Auto-starts on port 3010 during E2E runs
- **Specs:** Navigation, theming, drag-and-drop deck builder, team builder, deck state management

## Forbidden Actions

> [!CAUTION]
> Agents must never perform any of the following:

1. **Do not modify `.env.local`** — Use `.env.local.example` as the source of truth for variable names.
2. **Do not install global packages** — Use `npx` for one-off commands.
3. **Do not delete files outside `build/`, `.next/`, `coverage/`, `node_modules/`** without explicit approval.
4. **Do not bypass `preflight`** — Always run `npm run preflight` before claiming work is complete.
5. **Do not add inline styles** — ESLint will warn. Use Tailwind classes or CSS custom properties.
6. **Do not import `features` from `components/ui`** — Enforced by dependency-cruiser.
7. **Do not import `app` from `features`** — Enforced by dependency-cruiser.
8. **Do not commit with failing tests or type errors.**
9. **Do not hardcode API URLs, secrets, or tokens** — Always use environment variables.
10. **Do not edit `src/components/ui/` shadcn primitives** unless regenerating via `npx shadcn`.

## Error Recovery Protocol

If a build, lint, or test command fails:

1. **Read the full error output.** Do not guess.
2. **Fix the root cause**, not the symptoms.
3. **Run `npm run preflight`** to validate the fix holistically.
4. **If stuck after 3 attempts**, stop and report the error with full context. Do not loop.

## Ecosystem

SpellcastersDB is part of a larger ecosystem. All tools consume the same Community API:

| Project                | Purpose                          | Repo                                                                                   |
| :--------------------- | :------------------------------- | :------------------------------------------------------------------------------------- |
| **SpellcastersDB**     | Community database & deck builder | [TerribleTurtle/spellcastersdb](https://github.com/TerribleTurtle/spellcastersdb)       |
| **Community API**      | Static JSON data source           | [TerribleTurtle/spellcasters-community-api](https://github.com/TerribleTurtle/spellcasters-community-api) |
| **The Grimoire**       | Data management & patch publishing | [TerribleTurtle/spellcasters-manager](https://github.com/TerribleTurtle/spellcasters-manager) |
| **Spellcasters Bot**   | Discord integration               | [TerribleTurtle/spellcasters-bot](https://github.com/TerribleTurtle/spellcasters-bot)   |
