---
trigger: always_on
---

# SpellcastersDB AI Context

> **Note to AI Agents:** Read this file first to ground yourself in the project's architecture, conventions, and state.

## 1. Project Identity

**SpellcastersDB** is a Next.js application serving as a community database and deck builder for the game _Spellcasters Chronicles_. It emphasizes high performance, rich visuals, and complex state management (drag-and-drop deck building).

## 2. Core Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (Draft), `clsx`, `tailwind-merge`
- **State Management:**
  - **Global:** Zustand (`src/store`) - Sliced pattern
  - **Local/DnD:** React Context (`src/context`)
- **Drag & Drop:** `@dnd-kit` (Core, Sortable, Modifiers)
- **Testing:**
  - **Unit:** Vitest
  - **E2E:** Playwright (`e2e/`)
- **Icons:** Lucide React

## 3. Architecture & Directory Structure

The project follows a **Feature-Sliced** inspired architecture.

### `src/features` (UI & Feature Logic)

Contains the bulk of the application's UI code, organized by domain.

- **`deck-builder/`**: The complex deck building interface (Solo & Team).
- **`shared/`**: Reusable UI components used across features (e.g., `Card`, `FilterBar`).
- **`team-builder/`**: Specifics for the 3-deck team mode.

### `src/services` (Business Logic)

**Strict Rule:** Complex business logic belongs here, NOT in React components.

- **`domain/`**: Core game logic (e.g., `DeckService`, `validation/`).
- **`api/`**: Data fetching and API interaction.

### `src/store` (Global State)

Zustand store split into slices:

- `createSoloSlice`: Single deck management.
- `createTeamSlice`: Team (3-deck) management.
- `createUISlice`: UI state (modals, sidebars).

### `src/app` (Routing)

Standard Next.js App Router.

- `page.tsx`: Landing page.
- `deck-builder/`: Route for the application core.

## 4. Key Workflows & Commands

### Development

```bash
npm run dev
```

### Testing

**Crucial:** Run E2E tests before confirming major refactors.

```bash
# Run all E2E tests
npm run test:e2e
# Run critical path only (faster check)
npx playwright test e2e/deck-builder-solo.spec.ts
```

## 5. Coding Conventions

1.  **Source of Truth:** Always check `active_state.md` for the current focus.
2.  **Styling:**
    - Use `clsx` and `tailwind-merge` for conditional classes.
    - Avoid `style={{}}` props; use Tailwind utility classes.
3.  **Components:**
    - Prefer small, single-responsibility components.
    - If a component grows too large, extract sub-components to `src/features/.../ui/`.
4.  **State:**
    - Use **Zustand** for data that needs to persist or be accessed globally.
    - Use **React State** for transient UI states (hover, open/close).
5.  **Magic Numbers:**
    - Extract constants to `src/services/logic/constants.ts` or similar.

## 6. Common Pitfalls to Avoid

- **"God Components":** Do not add more logic to `SoloEditorLayout` or similar huge files. Break them down.
- **Direct Store Mutation:** Always use the actions defined in the Zustand slices.
- **Mixing Logic & UI:** If you are writing a complex `useEffect` or validation logic inside a component, **stop**. Move it to a hook or service.
