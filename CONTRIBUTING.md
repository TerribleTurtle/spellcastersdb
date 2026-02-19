# Contributing to SpellcastersDB

Thank you for your interest in contributing! This project is a community-driven database and builder for Spellcasters.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/TerribleTurtle/spellcastersdb.git
cd spellcastersdb
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file to create your local configuration:

```bash
cp .env.local.example .env.local
```

Review the settings in `.env.local`.

### Environment Variables

| Variable                             | Description                           | Default / Example                                                    |
| :----------------------------------- | :------------------------------------ | :------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                | Base URL for game data                | `https://terribleturtle.github.io/spellcasters-community-api/api/v2` |
| `NEXT_PUBLIC_USE_LOCAL_ASSETS`       | Toggle to use local images            | `false`                                                              |
| `NEXT_PUBLIC_PREFERRED_ASSET_FORMAT` | Asset format (webp/png)               | `webp`                                                               |
| `LOCAL_DATA_PATH`                    | Absolute path to local data JSON      | `C:\Projects\spellcasters-community-api\api\v2\all_data.json`        |
| `LOCAL_API_PATH`                     | _Legacy Fallback for LOCAL_DATA_PATH_ | _(Optional)_                                                         |
| `GITHUB_TOKEN`                       | Increases GitHub API rate limits      | _(Optional)_                                                         |
| `REVALIDATION_SECRET`                | Secures `/api/revalidate` endpoint    | _(Required in production)_                                           |
| `LOCAL_ASSETS_PATH`                  | Path to local image assets            | _(Optional)_                                                         |
| `UPSTASH_REDIS_REST_URL`             | Redis URL for rate limiting           | _(Optional)_                                                         |
| `UPSTASH_REDIS_REST_TOKEN`           | Redis Token                           | _(Optional)_                                                         |

**Note on Local API Development:**
If you are working on the Data Layer, you can point the app to a local version of the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api).

1. Clone the API repo as a sibling to this repo: `../spellcasters-community-api`.
2. The app will automatically try to find it there in `development` mode.
   - **Game Data** (Units, Spells): Loaded via server-side file reading.
   - **Patch History** (Badges, Timeline): Served via local API proxy.
   - **Zero Config**: No environment variables required if using this folder structure.
3. OR set `LOCAL_DATA_PATH` in `.env.local` to point explicitly to the `all_data.json`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Development Workflow

- **Branching**: Create a branch for your feature or fix (e.g., `feat/new-card-ui` or `fix/deck-validation`).
- **Code Style**: We use Prettier and ESLint.
  - Run `npm run lint` to catch errors.
  - Run `npm run type-check` to ensure TypeScript compliance.
- **Testing**:
  - Run `npm test` to execute Vitest unit tests.
  - Run `npm run test:coverage` to see a coverage report.
  - Run `npm run preflight` to run type-check + lint + tests in one go.
- **Scaffolding**:
  - Run `npm run new:component <Name>` to generate a new component + test file.
    - Example: `npm run new:component StatBlock` → creates `src/components/ui/StatBlock.tsx` + `__tests__/StatBlock.test.tsx`
    - Use `--dir=database` to place in a subdirectory: `npm run new:component StatBlock -- --dir=database`
  - Run `npm run new:route <name>` to generate a new page route.
    - Example: `npm run new:route leaderboard` → creates `src/app/leaderboard/page.tsx` + `loading.tsx`
- **Data Verification**:
  - Run `npm run check-data` to verify the application can correctly fetch and parse the external API data.
    - **Use this when:** You encounter "Failed to fetch" errors or want to debug raw API responses.
    - **Output:** It will log the number of entities fetched and any validation errors.

## Project Structure (Quick Reference)

- `src/app`: Next.js App Router pages and API routes.
- `src/app/design-system`: Theme Builder, Token/Component catalog.
- `src/components`: React components (`ui` for generic, `deck-builder` for domain-specific).
- `src/features`: Feature-based modules (e.g., `deck-builder`, `team-builder`).
- `src/services`: Core domain logic and API services (`api`, `validation`, `roadmap`).
- `src/lib`: Shared utilities (`config.ts`, `utils.ts`).
- `src/hooks`: Custom React hooks (state management).
- `docs/`: Detailed documentation (see [`docs/README.md`](docs/README.md)).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
