# Project Status

## In Progress

_Nothing in progress._

## Completed

| Feature | Completed | Summary |
|---|---|---|
| v0.2.0 Schema Consumer Changes | 2026-03-07 | Added `summon_xp`, `map_objects`, `early_access_compensation`, and `max_active` to Zod schemas, TS types, and Mechanics guide UI |
| Map Image Support (`image_urls`) | 2026-03-05 | Added `MapImageUrls` type, `MapImage` component, and conditional image display on map chest detail pages for all arena maps |
| Map Chests Types & API Service | 2026-03 | `MapChestsResponse`, `getMapChests()`, input validation, ISR via `fetchChunk` |
| Map Chests Index & Detail Pages | 2026-03 | `[mapId]/page.tsx`, static params from `KNOWN_MAPS`, breadcrumb nav |
| MapChestTable Component | 2026-03 | Tier-grouped table and mobile card view, rarity badges, reward links |

## Active Decisions & Learnings

- `image_urls` paths from the API are **relative** (e.g. `/assets/maps/mausoleum.png`) and must be combined with the host root before passing to `next/image`: `CONFIG.API.BASE_URL.replace(/\/api\/v2$/, "")`. This pattern matches `asset-helpers.ts`.
- `terribleturtle.github.io` is already whitelisted in `next.config.ts` `remotePatterns` and `img-src` CSP — no config changes needed for map images.
- `MapImage` uses `fill` + inline `aspectRatio: "4 / 3"` style to prevent layout shift on images of unknown dimensions. The `react/forbid-dom-props` lint warning is intentional and accepted.
- Hono vulns (`1113974`, `1114004`, `1114005`, `1114006`) are dev-only via `shadcn → @modelcontextprotocol/sdk`. Excepted in `.nsprc` until shadcn ships a fix.

## Known Blockers

_None._

## Feature Worktrees

_None active._
