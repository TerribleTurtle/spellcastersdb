# Arcane Modern - Brand Guidelines

## 1. Core Identity

**Name:** SpellcastersDB
**Vibe:** Magical, Modern, Clean, Data-Rich.
**Visual Style:** "Arcane Modern" - Dark interfaces with vibrant neon accents (Purple/Pink/Cyan) and glassmorphism effects.

## 2. Color Palette

### Brand Colors

These are the primary defining colors of the UI. Defined as `@theme` tokens in `src/styles/theme-tokens.css`.

- **Primary (Magic Purple):** `#9333ea` → `--color-brand-primary`
- **Secondary (Power Pink):** `#db2777` → `--color-brand-secondary`
- **Accent (Mana Cyan):** `#22d3ee` → `--color-brand-accent`
- **Dark (Void):** `#0f172a` → `--color-brand-dark`

### Surfaces

Layering system to create depth. All use `color-mix(in oklch)` for Tailwind v4 compatibility.

| Token             | Usage                            | Tailwind Class       |
| ----------------- | -------------------------------- | -------------------- |
| `surface-main`    | Base background                  | `bg-surface-main`    |
| `surface-card`    | Glass panels (5% white)          | `bg-surface-card`    |
| `surface-hover`   | Interactive feedback (10% white) | `bg-surface-hover`   |
| `surface-raised`  | Elevated elements (8% white)     | `bg-surface-raised`  |
| `surface-dim`     | Recessed areas (20% black)       | `bg-surface-dim`     |
| `surface-overlay` | Modal backdrops (80% black)      | `bg-surface-overlay` |

### Borders

| Token            | Usage                  | Tailwind Class          |
| ---------------- | ---------------------- | ----------------------- |
| `border-subtle`  | Very subtle (5% white) | `border-border-subtle`  |
| `border-default` | Standard (10% white)   | `border-border-default` |
| `border-strong`  | Emphasized (20% white) | `border-border-strong`  |

### Text

| Token            | Usage                        | Tailwind Class        |
| ---------------- | ---------------------------- | --------------------- |
| `text-primary`   | Primary text (#fff)          | `text-text-primary`   |
| `text-secondary` | Body text (Slate 300)        | `text-text-secondary` |
| `text-muted`     | Labels, captions (Slate 400) | `text-text-muted`     |
| `text-dimmed`    | Placeholders (Slate 500)     | `text-text-dimmed`    |
| `text-faint`     | Very subtle (Slate 600)      | `text-text-faint`     |

### Status Colors

Semantic replacements for status indicators.

| Status  | Base             | Text                  | Muted BG               | Border                  |
| ------- | ---------------- | --------------------- | ---------------------- | ----------------------- |
| Success | `status-success` | `status-success-text` | `status-success-muted` | `status-success-border` |
| Danger  | `status-danger`  | `status-danger-text`  | `status-danger-muted`  | `status-danger-border`  |
| Info    | `status-info`    | `status-info-text`    | `status-info-muted`    | `status-info-border`    |
| Warning | `status-warning` | `status-warning-text` | `status-warning-muted` | `status-warning-border` |

### Rarity Colors

Game-specific rarity indicators (defined in `src/styles/design-tokens.css`).

- **Common:** `--color-rarity-common` (#94a3b8)
- **Rare:** `--color-rarity-rare` (#60a5fa)
- **Epic:** `--color-rarity-epic` (#a855f7)
- **Legendary:** `--color-rarity-legendary` (#facc15)

## 3. Typography

**Font Family:** Geist Sans & Geist Mono (Vercel Fonts)

- **Headings:** Geist Sans, Bold/ExtraBold. Often uppercase tracking-wider.
- **Body:** Geist Sans, clean reading experience.
- **Data/Code:** Geist Mono, used for stats, IDs, and technical details.

## Semantic Component Tokens (New in v1.1)

To ensure consistency, use these semantic tokens instead of hardcoded utility classes.

### Control Dimensions

| Token                 | Value     | Tailwind Utility          | Use Case               |
| --------------------- | --------- | ------------------------- | ---------------------- |
| `--height-control-sm` | `2rem`    | `h-(--height-control-sm)` | Small buttons/inputs   |
| `--height-control-md` | `2.25rem` | `h-(--height-control-md)` | Default buttons/inputs |
| `--height-control-lg` | `2.5rem`  | `h-(--height-control-lg)` | Large buttons/inputs   |

### Layout & Spacing

| Token               | Value              | Tailwind Utility             | Use Case            |
| ------------------- | ------------------ | ---------------------------- | ------------------- |
| `--radius-control`  | `var(--radius-md)` | `rounded-(--radius-control)` | All form controls   |
| `--padding-card`    | `1.5rem`           | `p-(--padding-card)`         | Card/Dialog padding |
| `--gap-card-header` | `0.375rem`         | `gap-(--gap-card-header)`    | Card header spacing |

### Animation

| Token               | Value   | Tailwind Utility               |
| ------------------- | ------- | ------------------------------ |
| `--duration-fast`   | `150ms` | `duration-(--duration-fast)`   |
| `--duration-normal` | `200ms` | `duration-(--duration-normal)` |
| `--duration-slow`   | `300ms` | `duration-(--duration-slow)`   |

## 4. UI Patterns

### Glassmorphism

Use semantic surface/border tokens for cards and containers.

```css
bg-surface-card border border-border-default backdrop-blur-sm
```

### Gradients

Use gradients for text and buttons.

- Text: `bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary`
- Backgrounds: `bg-gradient-to-b from-brand-dark to-surface-deck`

### Glows

Use localized box-shadows or drop-shadows to simulate light emission from magical elements.

## 5. Themes

Core themes override `--sp-*` CSS custom properties in `src/styles/design-tokens.css`. The ThemePicker UI and `next-themes` handle switching.

| Theme | CSS Class | Primary Color | Vibe                       |
| ----- | --------- | ------------- | -------------------------- |
| Dark  | `.dark`   | `#9333ea`     | Default — purple on slate  |
| Light | `.light`  | `#7c3aed`     | Inverted — violet on white |

Additional fun/side themes (Arcane, Inferno, Frost, Retro, GlitchWitch, Rainbow) are defined in `src/styles/themes.css` but are not part of the core brand identity.

## 6. Important Notes

- **All opacity-based tokens** use `color-mix(in oklch, ...)` to match Tailwind v4's native opacity rendering.
- **Never use hardcoded colors** like `border-white/10` or `text-slate-400`. Always use the semantic tokens above.
- **Token definitions** live in `src/styles/` — see `design-tokens.css`, `theme-tokens.css`, and `components.css`.
