# Arcane Modern - Brand Guidelines

## 1. Core Identity

**Name:** SpellcastersDB
**Vibe:** Magical, Modern, Clean, Data-Rich.
**Visual Style:** "Arcane Modern" - Dark interfaces with vibrant neon accents (Purple/Pink/Cyan) and glassmorphism effects.

## 2. Color Palette

### Brand Colors

These are the primary defining colors of the UI.

- **Primary (Magic Purple):** `#a855f7` (Tailwind: `purple-500`) used for primary actions, branding, titles.
- **Secondary (Power Pink):** `#ec4899` (Tailwind: `pink-500`) used for gradients, call-to-actions, ultimates.
- **Accent (Mana Cyan):** `#22d3ee` (Tailwind: `cyan-400`) used for information, highlights, energy.
- **Dark (Void):** `#0f172a` (Tailwind: `slate-900`) main background color.

### Surfaces

Layering system to create depth.

- **Surface Main:** `#0f172a` (Base background)
- **Surface Card:** `rgba(255, 255, 255, 0.05)` (Glass panels)
- **Surface Hover:** `rgba(255, 255, 255, 0.1)` (Interactive feedback)
- **Surface Highlight:** `rgba(168, 85, 247, 0.2)` (Focus states/borders)

### Rarity Colors

Game-specific rarity indicators.

- **Common:** `#94a3b8` (Slate 400)
- **Rare:** `#60a5fa` (Blue 400)
- **Epic:** `#a855f7` (Purple 500)
- **Legendary:** `#facc15` (Yellow 400)

## 3. Typography

**Font Family:** Geist Sans & Geist Mono (Vercel Fonts)

- **Headings:** Geist Sans, Bold/ExtraBold. often uppercase tracking-wider.
- **Body:** Geist Sans, commercial/clean reading experience.
- **Data/Code:** Geist Mono, used for stats, IDs, and technical details.

## 4. UI Patterns

### Glassmorphism

Use semi-transparent backgrounds with subtle white borders for cards and containers.

```css
bg-surface-card border border-white/10 backdrop-blur-sm
```

### Gradients

Use gradients for text and buttons to add magic.

- Text: `bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary`
- Backgrounds: `bg-gradient-to-b from-brand-dark to-slate-950`

### Glows

Use localized box-shadows or drop-shadows to simulate light emission from magical elements.

## 5. Tailwind Configuration Reference

Defined in `globals.css` via Tailwind v4 `@theme`.

```css
@theme {
  --color-brand-primary: #a855f7;
  --color-brand-secondary: #ec4899;
  --color-brand-accent: #22d3ee;
  --color-brand-dark: #0f172a;

  --color-surface-main: #0f172a;
  --color-surface-card: rgba(255, 255, 255, 0.05);
  --color-surface-hover: rgba(255, 255, 255, 0.1);
  --color-surface-highlight: rgba(168, 85, 247, 0.2);
}
```
