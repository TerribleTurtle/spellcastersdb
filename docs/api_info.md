# Spellcasters Community API

The project consumes data from the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api). This repository hosts the raw JSON data and static assets (images).

## Data Structure

The API is served via GitHub Pages as static JSON files. The primary endpoint used by this application is the **aggregated data file**:

- **Endpoint**: `https://terribleturtle.github.io/spellcasters-community-api/api/v1/all_data.json`
- **Content**: A single JSON object containing arrays for all entity types.

### Entity Types

| Type            | Description                                   | Source Key     |
| :-------------- | :-------------------------------------------- | :------------- |
| **Spellcaster** | The player characters (formerly Heroes).      | `spellcasters` |
| **Unit**        | Creatures and Buildings. placed on the board. | `units`        |
| **Spell**       | Instant actions.                              | `spells`       |
| **Titan**       | Unique, powerful units (1 per deck).          | `titans`       |
| **Consumable**  | Items found in chests.                        | `consumables`  |
| **Upgrade**     | Level-up bonuses.                             | `upgrades`     |

### Asset Locations

Images are hosted in the `assets/` directory of the API repository.

- **Base URL**: `https://terribleturtle.github.io/spellcasters-community-api/assets/`
- **Spellcasters**: `spellcasters/[id].png`
- **Units/Spells/Titans**: `units/[id].png` (Shared folder)
- **Consumables**: `consumables/[id].png`
- **Upgrades**: `upgrades/[id].png`

## Schema Validation

This project uses **Zod** schemas in `src/lib/schemas.ts` to validate the incoming JSON data. We generally expect the data to conform to the interfaces defined in `src/types/api.d.ts`.

## Local Development

To test with local API changes:

1.  Clone the API repo adjacent to this repo.
2.  Set `NEXT_PUBLIC_API_URL` in `.env.local` to your local server (if running one) OR rely on the `fs` override in `src/lib/api.ts` (requires modifying the hardcoded path currently).
