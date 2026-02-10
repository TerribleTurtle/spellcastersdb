# Performance Optimization Report

**Date:** 2026-02-10
**Codebase:** SpellcastersDB (Next.js 14+)

## 1. Executive Summary

The application demonstrates a solid architectural foundation with good modularity. The use of **Next.js App Router** provides a strong baseline for performance.

- **Frontend:** Excellent use of virtualization (`react-virtuoso`) handles large lists efficiently. Component decomposition is effectively utilized.
- **Backend:** The API surface is minimal, primarily focused on Open Graph (OG) image generation.
- **Data Layer:** The "Load All + Singleton Registry" strategy is appropriate for the current dataset size and ensures O(1) lookups.

**Overall Rating:** 🟢 **Good** (Maintenance & Specific Fixes Needed)

However, **critical bottlenecks** exist in the server-side image generation (OG routes) which rely on external network calls for _every request_, creating significant latency and stability risks.

## 2. High-Impact Bottlenecks

### 🔴 Critical: Blocking Network Requests in OG Generation

**Location:** `src/app/api/og/route.tsx`
**Issue:** The route fetches a Google Font (`Oswald-Bold.ttf`) from `cdn.jsdelivr.net` on **every single request**.
**Impact:**

- Adds **100ms - 500ms** latency to every image generation.
- Introduces a single point of failure: if JSDelivr is down or slow, social sharing images break.
- Consumes unnecessary bandwidth.
  **Recommendation:** Download the font file to the project (`assets/fonts/Oswald-Bold.ttf`) and load it from the filesystem or bundle it.

### 🟠 Moderate: Repeated Zod Parsing

**Location:** `src/lib/api.ts` -> `fetchGameData()`
**Issue:** While the `fetch` call is cached (60s revalidate), the JSON response is **parsed and validated with Zod** on every function call.
**Impact:** Unnecessary CPU cycles on the server, especially if the dataset grows.
**Recommendation:** Implementing a stricter server-side singleton caching layer for the _parsed_ object, or optimizing the Zod schema if it becomes a bottleneck.

## 3. Resource Management

### 🟢 Memory Usage

- **EntityRegistry:** The Singleton pattern (`src/lib/registry.ts`) is effective. Loading the entire dataset (~1MB) into memory is negligible for modern server environments.
- **Garbage Collection:** No obvious memory leaks found in hooks or event listeners.

### 🟡 Image Optimization

- **External Images:** The Team OG renderer (`render-team.tsx`) fetches up to 3 spellcaster images in parallel. While `Promise.all` is used (Good), there is no persistent caching mechanism for these external assets beyond the fetch cache.
- **Recommendation:** Ensure `NEXT_PUBLIC_PREFERRED_ASSET_FORMAT` is strictly enforced to avoid fetching large PNGs when WebP is available.

## 4. Concurrency & Async

### 🟢 Good Practices

- **Parallel Execution:** `render-team.tsx` correctly uses `Promise.all` to fetch multiple images concurrently.
- **Hook Stability:** `useDeckBuilder` leads to stable references, minimizing re-renders.

### ⚠️ Potential Race Conditions

- **DeckEditor Import:** The `isClearingRef` pattern in `DeckEditor.tsx` acts as a manual mutex for URL syncing. This is fragile.
- **Recommendation:** Move URL synchronization to a dedicated `useEffect` that listens to a unified state version or hash, rather than imperatively managing it with refs.

## 5. Optimization Roadmap

### Phase 1: Critical Fixes (Immediate)

1.  **Localize Fonts:** Download `Oswald-Bold.ttf` to `src/assets/fonts/` and update `api/og/route.tsx` to read from disk.
2.  **Debounce Search:** Add debouncing (300ms) to the search input in `UnitBrowser.tsx` to prevent filtering loop thrashing on every keystroke.

### Phase 2: Structural Improvements

3.  **Strict Image Caching:** Implement a caching wrapper for `getCardImageUrl` fetches in the OG route to prevent re-fetching the same static assets repeatedly.
4.  **Registry Warm-up:** Ensure the `EntityRegistry` is initialized during app bootstrap rather than lazily on the first request if possible.

### Phase 3: Long-term

5.  **Build Analysis:** Add `@next/bundle-analyzer` to monitor bundle size as the component library grows.
6.  **Edge Caching:** Verify that Vercel (or host) Edge Caching is correctly configured for the `/api/og` route headers.
