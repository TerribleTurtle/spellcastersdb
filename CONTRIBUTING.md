# Contributing to SpellcastersDB

Thank you for your interest in contributing! This project is a community-driven database and builder for Spellcasters.

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/TerribleTurtle/spellcastersdb.git
cd spellcastersdb
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Copy the example environment file to create your local configuration:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`
Review the settings in \`.env.local\`. By default, it points to the live API, which is perfect for frontend development.

**Note on Local API Development:**
If you are also working on the `spellcasters-community-api`, you can point `NEXT_PUBLIC_API_URL` to your local API server or filesystem path (see `src/lib/api.ts` for details on the filesystem override used in `development` mode).

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`
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

## Project Structure (Quick Reference)

- \`src/app\`: Next.js App Router pages and API routes.
- \`src/components\`: React components (`ui` for generic, `deck-builder` for domain-specific).
- \`src/lib\`: Core logic, including `api.ts` (Data Layer) and `registry.ts` (In-memory database).
- \`src/hooks\`: Custom React hooks (state management).
- \`docs/\`: detailed documentation.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
