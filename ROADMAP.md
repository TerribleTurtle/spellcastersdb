# SpellcastersDB Implementation Roadmap

## Goal Description

Build and deploy **SpellcastersDB.com**, a premium, high-performance community hub for _Spellcasters Chronicles_. The site will feature a unit database (The Archive), a logic-validating deck builder (The Forge), and shareable deck links.

## User Review Required

> [!IMPORTANT]
> **Domain Setup**: This plan assumes you have access to the `spellcastersdb.com` DNS settings on Squarespace. We will need to add Vercel's `A` and `CNAME` records manually during Phase 0.

> [!NOTE]
> **Data Logic**: We are strictly adhering to the `api_info.md` structure. If the external API changes, our TypeScript interfaces (The Contract) will need updates.

## Proposed Phased Plan

### Phase 0: Pipeline Plumbing & "Hello World"

**Goal:** A live URL serving a branded landing page. Verified CI/CD pipeline.

1.  **Initialize Project**: `npx create-next-app@latest` with TypeScript, Tailwind, ESLint.
2.  **Repo Connection**: Push to `TerribleTurtle/spellcasters-db`.
3.  **Vercel Connect**: Import project to Vercel dashboard.
4.  **Domain Mapping**:
    - Add Vercel nameservers/records to Squarespace.
    - Verify SSL generation.
5.  **Stopping Point**: We visit `https://spellcastersdb.com` on our phones and see "Coming Soon".

### Phase 1: The Contract & Data Layer

**Goal:** The application can "read" the game data correctly.

1.  **Define Contracts**: Create `types/api.d.ts` matching the JSON structure (e.g., `Unit`, `Hero`, `Upgrade`).
2.  **Fetch Logic**: Implement `lib/api.ts` to fetch `all_data.json` from the GitHub Pages API.
3.  **Stubbing**: Create local fallback data (stubs) for offline dev.
4.  **Stopping Point**: Run a script `npm run check-data` that logs "Fetched 50 Units, 6 Heroes successfully".

### Phase 2: The Archive (Read-Only)

**Goal:** Users can find and view units. Google can index them.

1.  **Components**: Build `UnitCard`, `StatRow`, `AttributeBadge`.
2.  **Pages**:
    - `/units` (Grid Index)
    - `/units/[id]` (Detail Page with SSG)
3.  **Search**: Implement Fuse.js for client-side fuzzy search.
4.  **Stopping Point**: Search for "Paladin" and see the correct card.

### Phase 3: The Forge (Write/Logic)

**Goal:** Users can build valid decks.

1.  **State**: `DeckContext` to track selected Hero + 5 Cards.
2.  **UI**: The "Floating Tray" (Mobile bottom bar).
3.  **Validation**: "The Invariants" (Rank limits, Role limits).
4.  **Stopping Point**: Try to add 5 Titans. UI should prevent it or warn "Invalid Deck".

### Phase 4: Social & Sharing

**Goal:** Decks can be shared via URL.

1.  **Compression**: `lz-string` to encode deck state into URL query params (e.g., `?d=ABC123XYZ...`).
2.  **OG Images**: Vercel OG endpoint that catches the query param and draws the deck image.
3.  **Stopping Point**: Paste a link in Discord. See a generated image of the deck.

### Phase 5: The "Deep Dive" (Optimization & Automation)

**Goal:** Set-and-forget maintenance + Max SEO.

1.  **ISR (Incremental Static Regeneration)**: Set revalidate time to 60s.
2.  **Sitemap**: `next-sitemap` to list all unit pages.
3.  **Schema.org**: Add JSON-LD for "Game Data" entities.
4.  **Asset Strategy**: Cache-headers for remote images.
5.  **Automation**: GitHub Action requesting a "Re-Build" webhook on Vercel whenever the API repo updates.

## Verification Plan

### Automated Tests

- `npm run lint` (Static analysis)
- `npm run build` (Type checking + Production build integrity)

### Manual Verification

- **Mobile Check**: Verify "Floating Tray" works on iOS Safari.
- **SEO Check**: Use Vercel Toolbar to audit Meta Tags.
- **Speed Check**: Google PageSpeed Insights > 90.
