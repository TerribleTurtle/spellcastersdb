The project keeps raw data (JSON files) separate from images (Assets).

spellcasters-community-api/
├── assets/ # Images and Icons
│ ├── units/ # e.g., orc_grunt_card.png
│ ├── heroes/
│ ├── consumables/
│ └── upgrades/
├── data/ # Raw JSON Data Sources
│ ├── units/ # e.g., orc_grunt.json
│ ├── heroes/
│ ├── consumables/
│ ├── upgrades/ # Level-up options
│ └── mechanics/ # Game Logic (Curves, Settings)
├── schemas/ # Validation Logic
│ └── v1/ # Versioned JSON Schemas
│ ├── unit.schema.json
│ ├── hero.schema.json
│ ├── consumable.schema.json
│ ├── upgrade.schema.json
│ └── ...
├── scripts/ # Build Tools
│ └── build_api.py # The Compiler Script
└── .github/
├── PULL_REQUEST_TEMPLATE.md
└── workflows/ # Automation (CI/CD)
├── .gitignore

We host images directly in the repository for simplicity.

Location: assets/[category]/[id].png
Size Limit: Must be < 1MB per image.
Total Limit: We aim to keep the repo under 1GB.
Format: .png preferred.
Access: Images are fetched directly via the GitHub Pages URL.
Example: https://terribleturtle.github.io/spellcasters-community-api/assets/units/orc_grunt_card.png
Validation: scripts/validate_integrity.py checks for these images.
Note: Missing images are only flagged if "image_required": true is set in the JSON file. If omitted (default true per v1.0), warnings will be issued.

Accessing the API
Base URL: https://terribleturtle.github.io/spellcasters-community-api/api/v1/

Units: .../units.json
Cards: .../cards.json
Heroes: .../heroes.json
Consumables: .../consumables.json
Upgrades: .../upgrades.json
Game Info: .../game_info.json (Singleton)
