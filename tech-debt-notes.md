# Technical Debt & Architectural Oddities

This document tracks odd logic, technical debt, and potential refactor targets discovered during test coverage implementations and codebase audits.

## Store Slices (Zustand)

### `createTeamSlice.ts`

1. **`setActiveSlot(null)` state pollution**
   - **Issue:** When deselecting a team slot (`setActiveSlot(null)`), the `currentDeck` isn't reset to an empty initial state. It retains a clone of the last viewed team deck.
   - **Impact:** Downstream components must manually clear or handle this lingering state, which could lead to ghost data if not careful.
2. **`exportTeamSlotToSolo` dead code and implicit renaming**
   - **Issue:** The action accepts a `newId` parameter, but this parameter is effectively ignored for the final persisted deck because it delegates to `importDeckToLibrary()`, which generates a brand new `uuidv4()` internally.
   - **Issue 2:** The exported deck automatically has `" (From Team)"` appended to its name behind the scenes via `TeamModification.exportDeck`.
   - **Impact:** Misleading API contract. Callers passing an ID expect that ID to be used.

### `createPersistenceSlice.ts`

1. **Unenforced `TEAM_LIMIT`**
   - **Issue:** The `saveTeam` action relies on `upsertSavedTeam`, which delegates to `TeamPersistenceHelper.updateSavedTeams`. This helper simply pushes to the `savedTeams` array without verifying or enforcing any maximum team limit constant (like `TEAM_LIMIT`).
   - **Impact:** Users could theoretically circumvent the team limit if the UI layer fails to restrict them. Enforcements belong in the store layer.

---

## Services (Phase 2)

### `formatting.ts`

1. **`capitalize()` is NOT `titleCase()`**
   - **Issue:** `capitalize()` only uppercases the first character and leaves the rest as-is. So `capitalize("ORC")` → `"ORC"`, not `"Orc"`. This means `formatEntityName("ORC_WARRIOR")` → `"ORC WARRIOR"` instead of the expected `"Orc Warrior"`.
   - **Impact:** If entity IDs are ever stored in ALL_CAPS, the display names will look wrong. Currently works because all entity IDs appear to be lowercase/capitalized already.

2. **`formatTargetName` double-formats through `formatEntityName`**
   - **Issue:** `formatTargetName("All")` first calls `formatEntityName("All")` which returns `"All"`, then looks up `PLURAL_TARGETS["All"]` → `"Everything"`. But `formatTargetName("Unit")` calls `formatEntityName("Unit")` which returns `"Creatures & Buildings"` (a special case), and then `PLURAL_TARGETS["Creatures & Buildings"]` is `undefined`, so it falls through to `"Creatures & Buildings"`. This is accidental correctness — if someone adds "Unit" to the `PLURAL_TARGETS` map, it would never match.
   - **Impact:** Fragile coupling between two independent functions. The special-case `"Unit"` handling in `formatEntityName` silently breaks `formatTargetName`'s lookup table.

### `deck-utils.ts`

1. **`cloneSlots` is shallow, `cloneDeck` is deep — inconsistent**
   - **Issue:** `cloneSlots` does `slots.map(s => ({...s}))` which is a shallow spread (unit references are shared). But `cloneDeck` uses `structuredClone()` which creates a full deep copy. These are in the same file but behave very differently regarding immutability guarantees.
   - **Impact:** Callers of `cloneSlots` who mutate the returned unit objects will corrupt the original, while callers of `cloneDeck` are safe. Easy to introduce bugs if someone expects consistent behavior.

### `custom-themes.ts`

1. **Zod validation is all-or-nothing for the theme array**
   - **Issue:** `getAll()` uses `z.array(CustomThemeSchema).safeParse(parsed)`. If _any single_ theme in the array fails validation, the _entire array_ is rejected and returns `[]`. There's no per-item filtering.
   - **Impact:** One corrupt theme wipes all custom themes from the user's view until they manually clear `localStorage`. Should probably use `z.array(CustomThemeSchema.passthrough()).safeParse()` or filter individually.

### `export-service.ts`

1. **Filename sanitization doesn't strip special characters**
   - **Issue:** The download filename is built with `.toLowerCase().replace(/\s+/g, "-")` — spaces become hyphens, but special characters like `!`, `@`, `#`, `&` pass through untouched. So a team named `"My Team!!! @#$"` becomes `"my-team!!!-@#$.json"`.
   - **Impact:** Could cause issues on certain filesystems or confuse users. Should strip non-alphanumeric characters.

---

## Hooks (Phase 3)

### `useDeckEditorUI.ts`

1. **Blind Success Toasts on Swaps**
   - **Issue:** When the `pendingSwapCard` workflow is active, `handleSelectItem` blindly dispatches `setSlot(slotIndex, pendingSwapCard)` and immediately triggers a `"success"` toast.
   - **Impact:** If `setSlot` rejects the action internally (for example, trying to swap a Titan into a non-Titan slot), the UI will still show "Swapped Card X with Card Y!" even though the state never actually changed. UI and Store are desynced in error handling.

## Infrastructure (Phase 4)

### `redis.ts` & `ratelimit.ts`

1. **Top-level module initialization**
   - **Issue:** These singletons are created at the global module level inside `if/else` checks based on environment variables, rather than initialized inside a bootloader or function closure.
   - **Impact:** Makes testing highly volatile because module state is cached by the Node/Vite resolver. Requires `vi.resetModules()` and dynamic `await import()` in every single test block to simulate re-evaluating the file.

---

_Note: Add to this file as more oddities are discovered during the testing overhaul._
