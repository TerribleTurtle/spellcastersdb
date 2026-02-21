# Spellcasters Community API

The project consumes data from the [Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api). This repository hosts the raw JSON data and static assets (images).

## Data Structure

The API is served via GitHub Pages as static JSON files. The primary endpoint used by this application is the **aggregated data file**:

- **Endpoint**: `https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json`
- **Content**: A single JSON object containing arrays for all entity types.

### Entity Types

| Type            | Description                                   | Source Key     |
| :-------------- | :-------------------------------------------- | :------------- |
| **Spellcaster** | The player characters (formerly Heroes).      | `spellcasters` |
| **Unit**        | Creatures and Buildings, placed on the board. | `units`        |
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

This project uses **Zod** schemas in `src/services/validation/` (e.g., `data-schemas.ts`) to validate the incoming JSON data. We generally expect the data to conform to the interfaces defined in `src/types/api.d.ts`.

## Local Development

To test with local API changes:

1.  Clone the API repo adjacent to this repo (e.g., `../spellcasters-community-api`).
2.  The application will automatically detect it in development mode.
3.  Alternatively, set `LOCAL_DATA_PATH` in `.env.local` to point strictly to your JSON file.

## ISR & Revalidation

This application uses **Incremental Static Regeneration (ISR)** to keep data fresh without rebuilding.

- **Revalidation Interval**: Defined in `src/lib/config.ts` (default: 60 seconds).
- **On-Demand Revalidation**:
  - Endpoint: `/api/revalidate`
  - Method: `GET`
  - Header: `Authorization: Bearer YOUR_SECRET` (Secure)
  - _Fallback_: `?secret=YOUR_SECRET` (Legacy)
  - Requires `REVALIDATION_SECRET` in `.env.local` (and production environment variables).
  - This triggers a cache purge for the `game-data` tag, ensuring the next request fetches fresh data from the API.

## Known API Quirks

The raw API data sometimes has schema inconsistencies that are handled by validation transforms in `src/services/validation/data-schemas.ts`.

- **ID Handling**:
  - `Spellcaster`: The API might use `spellcaster_id` or `entity_id`. The schema normalizes both to `entity_id`.
  - `Upgrade`: The API uses `upgrade_id` in some places. The schema normalizes this to `entity_id`.
- **Validation**:
  - Zod transforms are used to ensure that the internal application logic always receives a consistent `entity_id` field, regardless of the raw JSON format.
