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
