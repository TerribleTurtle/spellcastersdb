# Map Image Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display a map overview image prominently on each map chest detail page, sourced from the new `image_urls.map` field in `api/v2/map_chests.json`.

**Architecture:** Extend the `MapChestsResponse` type with an optional `image_urls` field, resolve the relative URL against the API base URL in the page, and render a new `MapImage` display component between the description card and the chest table.

**Tech Stack:** TypeScript, Next.js App Router (SSG/ISR), `next/image` (with `remotePatterns` — already configured), Vitest + React Testing Library.

---

## Task 1: Extend the TypeScript Type

**Files:**
- Modify: `src/types/map-chests.ts`

**Context:**
`MapChestsResponse` currently has no `image_urls` field. The API returns a relative path like `"/assets/maps/mausoleum.png"`. The field must be optional (backward-compat for maps that don't have an image yet).

**Step 1: Write the failing type test** (in `src/services/api/__tests__/map-chests.test.ts`)

Add a test that uses a mock entry **with** `image_urls` and one **without** to confirm TypeScript types at runtime:

```ts
it("preserves image_urls when present in API response", async () => {
  vi.mocked(fetchChunk).mockResolvedValue([
    { ...MOCK_ENTRY, image_urls: { map: "/assets/maps/mausoleum.png" } },
  ]);
  const result = await getMapChests("mausoleum");
  expect(result.image_urls?.map).toBe("/assets/maps/mausoleum.png");
});

it("returns undefined image_urls when absent from API response", async () => {
  vi.mocked(fetchChunk).mockResolvedValue([MOCK_ENTRY]);
  const result = await getMapChests("mausoleum");
  expect(result.image_urls).toBeUndefined();
});
```

**Step 2: Run to verify it fails** (TypeScript compile error / `image_urls` missing from type)

```bash
cd c:\dev\personal\spellcastersdb
npx vitest run src/services/api/__tests__/map-chests.test.ts --reporter=verbose
```

Expected: `Property 'image_urls' does not exist on type 'MapChestsResponse'`

**Step 3: Update the type**

In `src/types/map-chests.ts`:

```ts
export interface MapImageUrls {
  readonly map: string;
}

// Add to MapChestsResponse:
readonly image_urls?: MapImageUrls;
```

**Step 4: Run to verify it passes**

```bash
npx vitest run src/services/api/__tests__/map-chests.test.ts --reporter=verbose
```

Expected: all 7 tests PASS

**Step 5: Commit**

```bash
git add src/types/map-chests.ts src/services/api/__tests__/map-chests.test.ts
git commit -m "feat(types): add optional image_urls field to MapChestsResponse"
```

---

## Task 2: Create the MapImage Component

**Files:**
- Create: `src/components/guide/MapImage.tsx`
- Create: `src/components/guide/__tests__/MapImage.test.tsx`

**Context:**
The image URL passed to this component is already a fully-resolved absolute URL (constructed in the page). Use `next/image` (not `<img>`) because the hostname is already in `remotePatterns`. Render as a `<figure>` card so it fits the existing page card aesthetic. The image is wide (map + legend), so use a wide aspect ratio container.

**Step 1: Write the failing test**

```tsx
// src/components/guide/__tests__/MapImage.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapImage } from "../MapImage";

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  },
}));

describe("MapImage", () => {
  it("renders the image with the correct src and alt", () => {
    render(
      <MapImage
        src="https://terribleturtle.github.io/spellcasters-community-api/assets/maps/mausoleum.png"
        alt="Mausoleum arena map"
      />
    );
    const img = screen.getByRole("img", { name: /mausoleum arena map/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://terribleturtle.github.io/spellcasters-community-api/assets/maps/mausoleum.png"
    );
  });

  it("renders a figure element with an Arena Map caption", () => {
    const { container } = render(
      <MapImage src="https://terribleturtle.github.io/spellcasters-community-api/assets/maps/mausoleum.png" alt="Mausoleum arena map" />
    );
    expect(container.querySelector("figure")).toBeInTheDocument();
    expect(screen.getByText("Arena Map")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npx vitest run src/components/guide/__tests__/MapImage.test.tsx --reporter=verbose
```

Expected: FAIL with "Cannot find module '../MapImage'"

**Step 3: Implement MapImage**

```tsx
// src/components/guide/MapImage.tsx
import Image from "next/image";

interface MapImageProps {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
}

export function MapImage({ src, alt, className }: MapImageProps): React.JSX.Element {
  return (
    <figure className={`bg-surface-card border border-border-default rounded-lg overflow-hidden ${className ?? ""}`}>
      <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
        />
      </div>
      <figcaption className="px-4 py-2 text-xs font-semibold text-text-muted border-t border-border-subtle text-center tracking-wide uppercase">
        Arena Map
      </figcaption>
    </figure>
  );
}
```

> **Why `fill` + `aspectRatio`?** The map images are different sizes and we don't know dimensions at build time. Using a ratio container with `fill` prevents layout shift without hardcoding `width`/`height`.

**Step 4: Run to verify it passes**

```bash
npx vitest run src/components/guide/__tests__/MapImage.test.tsx --reporter=verbose
```

Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add src/components/guide/MapImage.tsx src/components/guide/__tests__/MapImage.test.tsx
git commit -m "feat(guide): add MapImage component for arena map display"
```

---

## Task 3: Integrate MapImage into the Detail Page

**Files:**
- Modify: `src/app/guide/map-chests/[mapId]/page.tsx:46-102`

**Context:**
The API `image_urls.map` value is a **relative path** (e.g., `/assets/maps/mausoleum.png`). The page must combine it with `CONFIG.API.BASE_URL` to get the absolute URL that `next/image` needs. The map image should appear between the description card and the "Chest Spawns & Rewards" section.

**Step 1: No new test needed** — the page is a Next.js RSC tested via E2E. Manual verification is sufficient here.

**Step 2: Update the page**

```tsx
// Add to imports:
import { CONFIG } from "@/lib/config";
import { MapImage } from "@/components/guide/MapImage";

// In the JSX, between the description <section> and the chests <section>:
{mapData.image_urls?.map && (
  <MapImage
    src={`${CONFIG.API.BASE_URL}${mapData.image_urls.map}`}
    alt={`${mapData.name} arena map`}
  />
)}
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors

**Step 4: Full test suite**

```bash
npx vitest run --reporter=verbose
```

Expected: All tests pass (no regressions)

**Step 5: Commit**

```bash
git add src/app/guide/map-chests/\[mapId\]/page.tsx
git commit -m "feat(guide): display arena map image on map chest detail page"
```

---

## Task 4: Update `api_info.md` Documentation

**Files:**
- Modify: `docs/api_info.md`

**Step 1: Add a new row to the Asset Locations table:**

```
- **Maps**: `maps/[id].png`
```

And note:
> The `MapChestsResponse.image_urls.map` field contains a relative path (e.g. `/assets/maps/mausoleum.png`). Prepend `CONFIG.API.BASE_URL` before use in `next/image`.

**Step 2: Commit**

```bash
git add docs/api_info.md
git commit -m "docs: document image_urls.map field and map asset path convention"
```

---

## Definition of Done

- [ ] `MapChestsResponse` type includes `image_urls?: { map: string }`
- [ ] Unit tests for the new type field (present + absent) pass
- [ ] `MapImage` component exists and all component tests pass
- [ ] Detail page renders `MapImage` when `image_urls.map` is defined; renders nothing extra when absent
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run` exits 0 with no regressions
- [ ] `docs/api_info.md` updated with map asset notes
