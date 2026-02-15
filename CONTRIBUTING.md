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

| Variable                             | Description                      | Default / Example                                                    |
| :----------------------------------- | :------------------------------- | :------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                | Base URL for game data           | `https://terribleturtle.github.io/spellcasters-community-api/api/v2` |
| `NEXT_PUBLIC_USE_LOCAL_ASSETS`       | Toggle to use local images       | `false`                                                              |
| `NEXT_PUBLIC_PREFERRED_ASSET_FORMAT` | Asset format (webp/png)          | `webp`                                                               |
| `LOCAL_DATA_PATH`                    | Absolute path to local data JSON | `C:\Projects\spellcasters-community-api\api\v2\all_data.json`        |
| `UPSTASH_REDIS_REST_URL`             | Redis URL for rate limiting      | _(Optional)_                                                         |
| `UPSTASH_REDIS_REST_TOKEN`           | Redis Token                      | _(Optional)_                                                         |

**Note on Local API Development:**
If you are working on the Data Layer, you can point the app to a local version of the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api).

1. Clone the API repo as a sibling to this repo: `../spellcasters-community-api`.
2. The app will automatically try to find it there in `development` mode.
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
- **Data Verification**:
  - Run `npm run check-data` to verify the application can correctly fetch and parse the external API data.
    - **Use this when:** You encounter "Failed to fetch" errors or want to debug raw API responses.
    - **Output:** It will log the number of entities fetched and any validation errors.

## Project Structure (Quick Reference)

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: React components (`ui` for generic, `deck-builder` for domain-specific).
- `src/lib`: Core logic, including `api.ts` (Data Layer) and `registry.ts` (In-memory database).
- `src/hooks`: Custom React hooks (state management).
- `docs/`: detailed documentation.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
