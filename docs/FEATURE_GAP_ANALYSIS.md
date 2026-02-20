# Feature Gap Analysis: SpellcastersDB

**Date:** 2026-02-20
**App Category:** TCG Community Database & Deck Builder
**Core Capabilities Identified:** Advanced search/filtering (The Archive), local/URL-based deck/team building (The Forge/Trinity), PWA support, theming, static API ingestion.

---

## The Report (Prioritized)

### 🔴 MUST HAVE (Embarrassing to Launch Without)

_Basic functionality expected by 100% of users in this category._

1. **User Accounts & Authentication**
   - **Gap:** Users currently rely on `localStorage` and URL sharing to persist their decks. There is no way to log in across devices (Mobile to Desktop) and see the same library of decks.
   - **Missing Utilities:** Sign Up, Login, Password Reset, Email Verification, Delete Account.
   - **Action:** Accelerate the "User Accounts: Auth via Supabase/NextAuth" and "Cloud Decks" tasks currently sitting in the `TODO.md` backlog.

2. **User-Facing Feedback / Error Reporting Form**
   - **Gap:** If card data is incorrect or a user finds a bug, they must navigate to the "Roadmap" (GitHub Issues). This is too high-friction for the average gamer.
   - **Action:** Add a simple, accessible "Report an Issue" modal inside the app that pushes to a Slack/Discord webhook or creates a GitHub issue behind the scenes.

3. **Empty States with CTAs**
   - **Gap:** When a user first opens the Deck Builder and has no saved decks, or runs a search with zero results, the app needs strong, helpful empty states.
   - **Action:** Ensure the Deck Builder has a prominent "Create Your First Deck" state, not just an empty list.

### 🟡 SHOULD HAVE (Competitive Parity)

_Features your competitors definitely have._

1. **Public User Profiles**
   - **Gap:** Players want to show off their creations. Currently, sharing is limited to single-deck URLs.
   - **Action:** Create `/profile/[username]` routes to display a user's favored/public decks and stats.

2. **Deck Duplication ("Forking")**
   - **Gap:** Standard CRUD exists per the `TODO.md` (save/edit/clear), but taking an opponent's shared deck URL and clicking "Duplicate to my account" is a staple in TCG builders.
   - **Action:** Add a "Fork / Copy to My Decks" button on shared deck views.

3. **Community Deck Ratings & Comments**
   - **Gap:** The community cannot interact with each other's builds natively (upvoting the "Meta" decks).
   - **Action:** Implement a basic upvote system (ties directly into the User Accounts feature). Phase 2 item from `TODO.md`.

### 🟢 ADMIN/INTERNAL (The "Oh Crap" Tools)

_Tools you need to run the business safely._

1. **Content Moderation & Admin Dashboard**
   - **Gap:** Once User Accounts and Public Decks launch, users _will_ create decks with offensive titles or descriptions. There is currently no UI to ban a user or soft-delete a deck without touching the production database/Supabase directly.
   - **Action:** Build a protected `/admin` route with basic user banning, content flagging, and a "Kill Switch" feature to hide specific decks.

2. **Feature Flags System**
   - **Gap:** If a specific card interaction in the deck validator causes a crash, or if the API goes down, there is no quick toggle to gracefully disable the "Forge" while keeping "The Archive" alive.
   - **Action:** Implement basic Environment Variable-based feature flags for major site sections.
