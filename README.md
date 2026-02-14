# SpellcastersDB

<div align="center">

**A modern, high-performance community database and deck builder for Spellcasters Chronicles.**

[Live Site](https://spellcastersdb.com) • [Contributing](CONTRIBUTING.md) • [Documentation](docs/)

</div>

## Project Overview

**SpellcastersDB** is a Next.js application designed to serve as the definitive community resource for the game _Spellcasters Chronicles_. It features:

- **The Archive**: A searchable, filterable database of all Units, Spells, Titans, and Spellcasters.
- **The Forge**: A logic-validating deck builder that enforces game rules (e.g., max 1 Titan, school restrictions).
- **The Trinity (Team Builder)**: Build and manage teams of 3 decks with shared card pool validation.
- **Live Updates**: Powered by a static JSON API that allows for rapid balance updates without full site rebuilds.
- **Roadmap**: A live, interactive issue tracker connected to GitHub, featuring search, filtering, and "premium" UI.

## Architecture at a Glance

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS.
- **Data Layer**: High-performance, read-through cached registry interacting with the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api).
  - Fetches static JSON once per session (O(1) subsequent lookups).
  - Includes `EntityRegistry` for instant access to Units, Spells, Titans, Consumables, and Upgrades.
- **Architecture**: Feature-based slices (`src/features/deck-builder`, `src/features/team-builder`) with a shared core (`src/features/shared`) and modular domain services. `src/components` is reserved for generic UI atoms.
- **State Management**: Zustand (Global Store) + React Context (Drag & Drop) + Validation Hooks.
- **Assets**: Optimized image delivery via Next.js Image or Vercel OG.
- **Performance**:
  - **Parallel Data Fetching**: Concurrent loading of game data chunks for faster TTI.
  - **Virtualization**: `react-virtuoso` handles large lists (Limitless saved decks) without performance degradation.
  - **Hybrid Caching**: Environment-aware asset caching strategy (FileReader for Browser, Buffer for Node.js).

## Getting Started

1.  **Clone & Install**:

    ```bash
    git clone https://github.com/TerribleTurtle/spellcastersdb.git
    npm install
    ```

2.  **Configure Environment**:

    ```bash
    cp .env.local.example .env.local
    # Optional: Add GITHUB_TOKEN to .env.local for higher API rate limits
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Testing

     Run the Unit test suite:

     ```bash
     npm run test
     ```

     ## Documentation

- [**Active State**](active_state.md): The current development focus and daily progress log. **Start here to see what we are working on.**
- [**API Info**](docs/api_info.md): Specification for the JSON data consumed by this app.
- [**Brand Guidelines**](docs/BRAND_GUIDELINES.md): Colors, fonts, and styling rules.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
