# SpellcastersDB

<div align="center">

**A community database and deck builder for Spellcasters Chronicles.**

[Live Site](https://spellcastersdb.com) • [Contributing](CONTRIBUTING.md) • [Documentation](docs/)

</div>

## Project Overview

**SpellcastersDB** is a Next.js application designed to serve as a community resource for the game _Spellcasters Chronicles_. It features:

- **The Archive**: A searchable, filterable database of all Units, Spells, Titans, and Spellcasters.
- **The Forge**: A logic-validating deck builder with modals for saving/editing and toast notifications for sharing.
- **The Trinity (Team Builder)**: Build and manage teams of 3 decks with shared card pool validation and easy link sharing.
- **Patch History**: Real-time balance updates with visual badges (Buff/Nerf/Rework) and detailed before/after stat comparisons for every entity.
- **Live Updates**: Powered by a static JSON API that allows for rapid balance updates without full site rebuilds.
- **Roadmap**: A live, interactive issue tracker connected to GitHub, featuring search and filtering.
- **Accessibility (WCAG 2.1 AA)**: Skip navigation, focus-trapped modals, ARIA labels/states on all interactive controls, and `prefers-reduced-motion` support.
- **Theming**: 6 custom themes (Dark, Light, Arcane, Inferno, Frost, Retro) plus a secret Rainbow mode (Konami Code).
- **Design System**: A dedicated `/design-system` route for previewing tokens, components, and building custom themes with live preview and export/import capabilities.
- **SEO Optimized**: Fully crawlable with dynamic sitemaps, structured data (JSON-LD), and semantic HTML for maximum discoverability.
- **Legal Compliance**: Dedicated `/privacy` and `/terms` pages with transparent data practices.
- **Navigation**: Integrated Breadcrumbs via `PageShell` for improved user wayfinding and SEO structure.
- **Debug Suite**: Internal analytics tools for tracking data integrity, balance statistics, and keyword frequency.

## Architecture at a Glance

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS.
- **Data Layer**:
  - **Static Fetch**: Fetches JSON data from the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api).
  - **Registry**: An in-memory, O(1) lookup map (`src/services/api/registry.ts`) that initializes once per session.
  - **Domain Services**: Feature-based logic (e.g., `DeckRules`, `TeamRules`) that interacts with the Registry.
- **State Management**: Zustand (Global Store) split into slices (`solo`, `team`, `ui`) for robust state handling.
- **Performance**:
  - **Read-Through Caching**: Optimizes data fetching.
  - **Virtualization**: `react-virtuoso` for large lists.
  - **Zod Validation**: Ensures data integrity at runtime.
  - **Comprehensive Testing**: 275 unit and integration tests (Vitest) covering core logic, validation, and data integrity.
  - **Revalidation API**: On-demand cache invalidation via `/api/revalidate` (using `Authorization` header) with `revalidateTag` for robust content updates.
    - **CI/CD**: The "Daily Revalidation" workflow requires `REVALIDATION_SECRET` and optionally `APP_URL` (defaults to `https://www.spellcastersdb.com`) in GitHub Secrets.
  - **State Persistence**: Optimized `zustand/persist` with `partialize` to serialize only critical user data, excluding transient UI state for consistent high performance.
  - **Image Optimization**: Configured with a 1-year cache TTL, AVIF support, and constrained device sizes to minimize bandwidth. Critical images use `priority` loading for LCP.
  - **Browser Support**: Targets modern browsers (Chrome 100+, Safari 15+, Firefox 100+) for smaller bundles and better performance.
- **Infrastructure Hardening**:
  - **Architecture Enforcement**: `dependency-cruiser` validates import boundaries (`components/ui` ↛ `features`, `features` ↛ `app`) on every preflight run.
  - **Observability**: A `MonitoringService` (`src/services/monitoring/`) abstracts error reporting. Default `ConsoleAdapter` outputs structured logs; swap in a Sentry/Axiom adapter with zero app-code changes.
  - **E2E Readiness**: Standardized `data-testid` attributes on all shell, database, and deck builder components. See [E2E Conventions](docs/E2E_CONVENTIONS.md) for naming rules.

## Getting Started

1.  **Clone & Install**:

    ```bash
    git clone https://github.com/TerribleTurtle/spellcastersdb.git
    npm install
    ```

2.  **Configure Environment**:

    ```bash
    cp .env.local.example .env.local
    # Optional: Add GITHUB_TOKEN to .env.local for higher API rate limits
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

For detailed setup instructions, including **Local API Development**, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Available Scripts

| Command                   | Description                                              |
| :------------------------ | :------------------------------------------------------- |
| `npm run dev`             | Starts the development server                            |
| `npm run build`           | Builds the application for production                    |
| `npm run start`           | Starts the production server                             |
| `npm run test`            | Runs the test suite (Vitest)                             |
| `npm run test:watch`      | Runs tests in watch mode                                 |
| `npm run lint`            | Runs ESLint                                              |
| `npm run type-check`      | Runs TypeScript compiler check                           |
| `npm run check-data`      | Verifies API data fetching logic                         |
| `npm run preflight`       | Runs Type-Check, Format, Lint, Tests, and Dep Validation |
| `npm run format:check`    | Checks formatting matches Prettier rules                 |
| `npm run deps:validate`   | Validates import boundary rules                          |
| `npm run new:component`   | Scaffolds a new React component                          |
| `npm run new:route`       | Scaffolds a new App Router page                          |
| `npm run script:validate` | Validates production data integrity                      |

## Documentation

- [**Active State**](active_state.md): The current development focus and daily progress log.
- [**API Info**](docs/api_info.md): Specification for the JSON data consumed by this app.
- [**Brand Guidelines**](docs/BRAND_GUIDELINES.md): Colors, fonts, and styling rules.
- [**E2E Conventions**](docs/E2E_CONVENTIONS.md): `data-testid` naming rules and viewport strategy.

## 🌐 Part of the Spellcasters Ecosystem

- **[Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api)** — The shared data source (GitHub Pages)
- **[The Grimoire](https://github.com/TerribleTurtle/spellcasters-manager)** — Data management & patch publishing
- **[Spellcasters Bot](https://github.com/TerribleTurtle/spellcasters-bot)** — Discord integration

> All tools consume the same [Community API v2](https://terribleturtle.github.io/spellcasters-community-api/api/v2/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
