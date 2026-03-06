# Project Status

## In Progress

| Feature | Phase | Started | Notes |
|---|---|---|---|
| Map Image Support (`image_urls`) | Phase 4 – Vertical UI | 2026-03-05 | Adding `image_urls.map` field to type, new `MapImage` component, and detail page integration |

## Completed

| Feature | Completed | Summary |
|---|---|---|
| Map Chests Types & API Service | 2026-03 | `MapChestsResponse`, `getMapChests()`, input validation, ISR via `fetchChunk` |
| Map Chests Index & Detail Pages | 2026-03 | `[mapId]/page.tsx`, static params from `KNOWN_MAPS`, breadcrumb nav |
| MapChestTable Component | 2026-03 | Tier-grouped table and mobile card view, rarity badges, reward links |

## Active Decisions & Learnings

- `image_urls` paths from the API are **relative** (e.g. `/assets/maps/mausoleum.png`) and must be combined with `CONFIG.API.BASE_URL` before passing to `next/image`.
- `terribleturtle.github.io` is already whitelisted in `next.config.ts` `remotePatterns` and in the `img-src` CSP header — no config changes needed for map images.

## Known Blockers

_None._

## Feature Worktrees

_None active._
