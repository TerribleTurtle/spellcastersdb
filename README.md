# SpellcastersDB

<div align="center">

**A modern, high-performance community database and deck builder for Spellcasters Chronicles.**

[Live Site](https://spellcastersdb.com) • [Contributing](CONTRIBUTING.md) • [Documentation](docs/)

</div>

## Project Overview

**SpellcastersDB** is a Next.js application designed to serve as the definitive community resource for the game _Spellcasters Chronicles_. It features:

- **The Archive**: A searchable, filterable database of all Units, Spells, Titans, and Spellcasters.
- **The Forge**: A logic-validating deck builder that enforces game rules (e.g., max 1 Titan, school restrictions).
- **Live Updates**: Powered by a static JSON API that allows for rapid balance updates without full site rebuilds.

## Architecture at a Glance

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Data Layer**: Fetches static JSON from the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api).
- **State Management**: React Context + Validation Hooks for the Deck Builder.
- **Assets**: Optimized image delivery via Next.js Image or Vercel OG.

## Getting Started

1.  **Clone & Install**:

    ```bash
    git clone https://github.com/TerribleTurtle/spellcastersdb.git
    npm install
    ```

2.  **Configure Environment**:

    ```bash
    cp .env.local.example .env.local
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [**Active State**](active_state.md): The current development focus and daily progress log. **Start here to see what we are working on.**
- [**API Info**](docs/api_info.md): Specification for the JSON data consumed by this app.
- [**Brand Guidelines**](docs/BRAND_GUIDELINES.md): Colors, fonts, and styling rules.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
