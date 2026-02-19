# Active State

## Current Focus

UI Redesign — Layout consistency complete (v1.0.18 candidate)

## Status

- [x] Phase 1: Layout redesign (cards + detail pages + SSR)
- [x] Phase 2: Design system polish (SmartRankBadge, typography, tokens)
- [x] Phase 3: Final polish (padding, loading skeletons, cleanup)
- [x] Phase 4: Layout consistency (token consolidation, card density, responsive grid fix)
- [x] TypeScript: 0 errors
- [x] Tests: 205 pass / 1 skip

## Layout Tokens (globals.css @theme)

- `--max-width-site-shell: 1440px` → shell (navbar, sidebar, footer)
- `--max-width-page-grid: 80rem` → grid/archive pages

## Next Steps

- [ ] Monitor Vercel deployment for build success
- [ ] Visual QA on deployed site (mobile + desktop)
- [x] Patch history: ability name resolution + scanability improvements
- [x] Patch history: word-level diff highlighting
- [x] Deployment: v1.0.19 pushed to main
- [x] Bonus damage display: added BonusDamageList mechanic component (% Max HP, % Current HP, flat)
- [x] Unit Stats: Globally hidden Damage, Attack Speed, and Charges (feature flag style via comments)
