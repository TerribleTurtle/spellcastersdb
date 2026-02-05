# **SpellcastersDB.com: Site Design Document (SDD)**

## **1\. Executive Summary**

**SpellcastersDB.com** is the definitive community hub for _Spellcasters Chronicles_. It combines a high-performance unit database with a strict-logic deck builder and a curated community meta-tracker. The site is designed to be mobile-first, SEO-optimized, and highly shareable via custom social media embeds.

## **2\. Core Modules**

### **2.1 The Archive (Database & Unit Library)**

The Archive serves as the "Single Source of Truth" for unit stats, utilizing the official community API.

- **Search Engine:** Powered by fuse.js for fuzzy matching across name, tags, magic_school, and description.
- **Advanced Filtering:**
  - **Magic School:** Filter by Astral, War, Elemental, Lightning, Holy, Dark, Frost.
  - **Category:** Creature, Building, Spell, Titan.
  - **Rank:** Toggle visibility for Ranks I, II, III, and IV.
- **Comparison Engine:**
  - **Stats Compared:** Health, Damage, Attack Speed (DPS), Range, and Population Efficiency.
  - **Desktop View:** Sticky-header table with sortable columns.
  - **Mobile View:** Side-by-side card comparison layout with "quick-stats" overlay.
- **Dynamic Routing:** Individual pages for every entity (e.g., /units/faerie) with meta-tags for search engine discovery.

### **2.2 The Forge (Deck Builder)**

The Forge is a utility that enforces game-legal loadouts to prevent "impossible" theory-crafting.

- **Hero Selection:** Users must select 1 of the 6 heroes. Selecting a hero triggers synergy highlights (e.g., highlighting Astral units if **Astral Monk** is chosen).
- **Legal Validation Engine (The Invariants):**
  - **Slots 1-4 (Flex):** Must contain exactly 4 cards from Creature, Building, or Spell categories.
  - **Rank Rule:** At least one **Creature** in Slots 1-4 must be **Rank I** or **Rank II**.
  - **Slot 5 (Titan):** Strictly reserved for cards in the **Titan** category.
- **Deck Analytics:** Real-time calculation of average charge_time, total cost_population, and damage type balance.

### **2.3 The Stratosphere (Community & Top Decks)**

A manually curated section to guide players on the current competitive landscape.

- **Weekly Meta Update:** A dedicated page featuring 3–5 "Top Tier" decks.
- **Tactical Breakdown:** Each top deck includes a "How to Play" section and synergy notes for the selected Hero.
- **One-Click Import:** A "Load in Forge" button that uses the deck's lz-string to instantly populate the builder for user modification.
- **Archetype Tagging:** Decks are labeled by playstyle (e.g., "Siege Rush," "Astral Control," "Poison Stall").

## **3\. Technical Architecture**

### **3.1 Data Management**

- **Primary Source:** https://terribleturtle.github.io/spellcasters-community-api/all\_data.json.
- **Image Assets:** Sourced directly from GitHub Pages or proxied for optimized loading.
- **Client State:** React Context or a similar lightweight state manager for the active deck selection.

### **3.2 Sharing & Social Loop**

- **Compression:** Use lz-string to compress the Deck State (Hero ID \+ 5 Card IDs) into a URL fragment.
- **Visual Embeds (vercel-og):**
  - A dynamic API route that decodes the lz-string.
  - Generates a 1200x630 PNG for Discord/Twitter.
  - **Layout:** Hero splash art on the left, 5 card icons with Rank badges on the right.

### **3.3 SEO Strategy**

- **Dynamic Metadata:** Use Next.js generateMetadata to populate titles based on deck content (e.g., _"Top Rank IV War Deck \- SpellcastersDB"_).
- **Sitemap:** Automatically updated to include all unit pages and community deck articles.

## **4\. UI/UX Design**

### **4.1 Mobile-First Implementation**

- **The "Floating Tray":** A persistent bottom bar that shows the 5 active deck slots. Users can "tap to remove" or "drag and drop" from the library.
- **Grid Optimization:** 2-column card grid for mobile screens to maximize visibility of card art and Ranks.

### **4.2 Interaction Logic**

- **Smart Warnings:** Instead of preventing illegal clicks, the UI allows them but turns the "Share" button red with a list of missing requirements (e.g., _"Requires at least one Rank I or II Creature"_).
- **Dark Mode:** Default "Deep Astral" dark theme to match the game's aesthetic.

## **5\. Community Sustainability**

- **Official Integration:** Direct links to the Steam store, official Discord, and Game Homepage in the footer.
- **Open Source Roots:** Links back to the GitHub API repository to encourage data contributors.
- **Support:** Integrated Ko-fi button for server costs and development time.

## **6\. Implementation Checklist**

| Phase       | Milestone          | Key Deliverable                                               |
| :---------- | :----------------- | :------------------------------------------------------------ |
| **Phase 1** | **Database Core**  | API fetch, Search/Filter logic, and Unit Detail pages.        |
| **Phase 2** | **The Forge**      | Slot logic, Rank validation, and Deck Tray UI.                |
| **Phase 3** | **Social Linkage** | lz-string URL generation and vercel-og image templates.       |
| **Phase 4** | **The Meta Hub**   | Launch "Top Decks" page with initial curated content.         |
| **Phase 5** | **Polish & SEO**   | Mobile UI audit, Metadata tuning, and Community Footer links. |
