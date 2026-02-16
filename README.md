# SpellcastersDB

<div align="center">

**A modern, high-performance community database and deck builder for Spellcasters Chronicles.**

[Live Site](https://spellcastersdb.com) • [Contributing](CONTRIBUTING.md) • [Documentation](docs/)

</div>

## Project Overview

**SpellcastersDB** is a Next.js application designed to serve as the definitive community resource for the game _Spellcasters Chronicles_. It features:

- **The Archive**: A searchable, filterable database of all Units, Spells, Titans, and Spellcasters.
- **The Forge**: A logic-validating deck builder with premium modals for saving/editing and toast notifications for sharing.
- **The Trinity (Team Builder)**: Build and manage teams of 3 decks with shared card pool validation and easy link sharing.
- **Live Updates**: Powered by a static JSON API that allows for rapid balance updates without full site rebuilds.
- **Roadmap**: A live, interactive issue tracker connected to GitHub, featuring search, filtering, and "premium" UI.
- **Accessibility**: Standardized UI components with ARIA labels and keyboard navigation support for an inclusive experience.
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
  - **Comprehensive Testing**: 195+ unit and integration tests (Vitest) covering core logic, validation, and data integrity.
  - **Revalidation API**: On-demand cache invalidation via `/api/revalidate` (using `Authorization` header) with `revalidateTag` for robust content updates.
    - **CI/CD**: The "Daily Revalidation" workflow requires `REVALIDATION_SECRET` and optionally `APP_URL` (defaults to `https://www.spellcastersdb.com`) in GitHub Secrets.
  - **State Persistence**: Optimized `zustand/persist` with `partialize` to serialize only critical user data, excluding transient UI state for consistent high performance.

  - **Image Optimization**: Configured with a 1-year cache TTL, AVIF support, and constrained device sizes to minimize bandwidth. Critical images use `priority` loading for LCP.
  - **Browser Support**: Targets modern browsers (Chrome 100+, Safari 15+, Firefox 100+) for smaller bundles and better performance.

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

| Command              | Description                           |
| :------------------- | :------------------------------------ |
| `npm run dev`        | Starts the development server         |
| `npm run build`      | Builds the application for production |
| `npm run start`      | Starts the production server          |
| `npm run test`       | Runs the test suite (Vitest)          |
| `npm run test:watch` | Runs tests in watch mode              |
| `npm run lint`       | Runs ESLint                           |
| `npm run type-check` | Runs TypeScript compiler check        |
| `npm run check-data` | Verifies API data fetching logic      |

     ## Documentation

- [**Active State**](active_state.md): The current development focus and daily progress log.
- [**API Info**](docs/api_info.md): Specification for the JSON data consumed by this app.
- [**Brand Guidelines**](docs/BRAND_GUIDELINES.md): Colors, fonts, and styling rules.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
