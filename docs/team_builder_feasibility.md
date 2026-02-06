# Feasibility Study: Team Builder Feature

## Executive Summary

**Viability:** High
**Complexity:** Medium
**Estimated Effort:** 2-3 Days

The "Team Builder" feature (creating and sharing 3 decks together) is **technically viable** with the current architecture. The project's modular design (hooks, types, compression) supports this extension, but specific refactoring of the state management system is required.

## Technical Analysis

### 1. Data Structure & URL Sharing (Ease: High)

- **Current State:** Decks are compressed using `lz-string` and stored in the `?d=` query parameter.
- **Team Implementation:**
  - We can legally encode 3 decks into a single URL without hitting browser limits (est. length < 500 characters).
  - Formats: `?team=<deck1_hash>~<deck2_hash>~<deck3_hash>` or `?d1=...&d2=...`.
  - No database changes required.

### 2. State Management (Ease: Medium-Hard)

- **Current Barrier:** The `useDeckBuilder` hook is currently a **Singleton** logic coupled to a hardcoded `localStorage` key (`spellcasters_deck_v1`).
- **Required Refactor:**
  - Update `useDeckBuilder` to accept a `storageKey` or `deckInstanceId`.
  - Create a parent `TeamContext` or `TeamBuilder` wrapper that manages 3 instances of the deck state (or switches the active key).
  - **Risk:** Existing "Saved Decks" logic needs to be careful not to mix "Team Decks" with "Personal Saved Decks".

### 3. UI/UX (Ease: Medium)

- **Desktop:** A tabbed interface ("Vanguard", "Mid", "Rear" or "Deck 1/2/3") above the existing Deck Builder is straightforward.
- **Mobile:** Screen real estate is tight. A "Team Tray" or "Deck Switcher" dropdown would be needed.
- **Complexity:** The main challenge is "Quick Add" logic (e.g., adding a card from the browser). If I double-click a card, which of the 3 decks does it go to? (Likely the "Active" tab).

### 4. Open Graph Images (Ease: Medium)

- **Current State:** `vercel/og` renders 1 Spellcaster + 5 Units.
- **Challenge:** Rendering 3 Spellcasters + 15 Units on one image will likely hit Vercel Edge Function limits (timeout or memory) and would look cluttered on small social cards.
- **Recommendation:** "Team" OG images should simple display the **3 Spellcasters** (The Commanders) to keep it clean and performant.

## Recommendation

Proceed with a **"Team Mode"** toggle on the Deck Builder.

1. **Refactor** `useDeckBuilder` to support multiple instances.
2. **Build** a `TeamDeckBuilder` wrapper that toggles the active deck instance.
3. **Update** URL logic to parse/serialize the `team` parameter.
4. **Create** a simplified OG Handler for teams (3 Heroes only).
