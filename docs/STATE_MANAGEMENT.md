# State Management Architecture

**Tech Stack:** Zustand + Immer (via slices) + LocalStorage Persistence.

## Overview

The global state is managed by a single Zustand store (`useDeckStore`) which is composed of several "Slices". This implementation ensures separation of concerns while allowing different features (Deck Builder, Team Builder) to react to shared state changes.

## Store Slices

The store is constructed in `src/store/index.ts` by combining these slices:

| Slice           | File                        | Responsibility                                         |
| :-------------- | :-------------------------- | :----------------------------------------------------- |
| **Solo**        | `createSoloSlice.ts`        | Managing the "Active Deck" currently being edited.     |
| **Team**        | `createTeamSlice.ts`        | Managing the "Active Team" (3 decks).                  |
| **Persistence** | `createPersistenceSlice.ts` | Saving, loading, importing, and exporting decks/teams. |
| **UI**          | `createUISlice.ts`          | Transient UI state (Sidebar open, filters, etc.).      |

## Persistence Strategy

We use `zustand/middleware/persist` to sync the specific parts of the store to `localStorage`.

- **Key:** `spellcasters-store-v2`
- **Behavior:**
  - On page load, the store hydrates from local storage.
  - Using `skipHydration: true` in some components prevents React Hydration Mismatches.
  - UUIDs are generated for new entities to verify uniqueness.

## Key Patterns

### 1. The Registry Pattern

The store **does not** hold the entire game database. It only holds references (IDs) or lightweight objects.

- **Data:** Fetched via `api.ts` -> Stored in `registry.ts`.
- **Store:** Holds `cardId` or objects derived from user input.

### 2. Selectors

Always use specific selectors when consuming state to prevent unnecessary re-renders.

```tsx
// ❌ Bad: Re-renders on ANY store change
const { currentDeck } = useDeckStore();

// ✅ Good: Only re-renders when deck name changes
const deckName = useDeckStore((state) => state.currentDeck.name);
```

## Debugging

This project uses `zustand/middleware/devtools`. You can inspect the state changes using the **Redux DevTools** browser extension.
