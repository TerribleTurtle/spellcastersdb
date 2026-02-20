# E2E Testing Conventions

## Selectors

We use `data-testid` attributes for all E2E test selectors. This decouples tests from implementation details like CSS classes or DOM structure.

### Naming Convention

Use `kebab-case` for all test IDs.

- **Component Root:** `data-testid="component-name"`
  - _Example:_ `data-testid="navbar"`
- **Interactable Elements:** `data-testid="component-element"`
  - _Example:_ `data-testid="navbar-logo"`
- **List Items:** `data-testid="component-item-{id}"`
  - _Example:_ `data-testid="deck-row-123"`

### Viewport Specificity

Since our app has distinct mobile and desktop UI paths (often rendering completely different components), use suffixes to distinguish them when necessary.

- **Mobile Only:** `-mobile`
  - _Example:_ `data-testid="navbar-mobile-toggle"`
- **Desktop Only:** `-desktop`
  - _Example:_ `data-testid="desktop-sidebar"`

## Critical Flows

Ensure the following flows are fully covered with test IDs:

1. **Navigation:** Navbar (mobile/desktop), Sidebar, Footer.
2. **Deck Builder:** All drag-and-drop zones, slots, and toolbars.
3. **Theming:** Theme picker trigger and options.

## Test Suite Inventory

| File                               | Tests | Viewports        | Coverage                                 |
| ---------------------------------- | ----- | ---------------- | ---------------------------------------- |
| `e2e/navigation.spec.ts`           | 3     | Desktop + Mobile | Footer links, Sidebar nav, Mobile drawer |
| `e2e/theming.spec.ts`              | 1     | Desktop + Mobile | Theme switch + persistence               |
| `e2e/deck-builder-desktop.spec.ts` | 1     | Desktop          | DND into slot + Quick Add                |
| `e2e/deck-builder-mobile.spec.ts`  | 1     | Mobile           | Touch DND into dock slot                 |
| `e2e/team-builder.spec.ts`         | 1     | Desktop          | Mode switch + Team DND                   |
| `e2e/deck-edge-cases.spec.ts`      | 1     | Desktop          | Clear Deck modal flow                    |

**Total: 8 test cases × 2 browser projects = 16 Playwright tests.**

## Running E2E Tests

```bash
# Run all E2E tests headless
npm run test:e2e

# Open Playwright UI for interactive debugging
npm run test:e2e:ui
```

### DND Testing Notes

`dnd-kit` uses `PointerSensor` which requires manual `mouse.down/move/up` sequences. Playwright's `dragTo()` does not reliably trigger the sensor threshold. The E2E tests use manual pointer event trajectories for reliable cross-browser DND simulation.
