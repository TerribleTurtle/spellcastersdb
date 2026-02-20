export const DECK_VALIDATION_ERRORS = {
  MISSING_SPELLCASTER: "Select a Spellcaster",
  MISSING_UNITS: "Must have 4 Units",
  MISSING_TITAN: "Must have 1 Titan",
  MISSING_RANK_1_OR_2: "Must include at least 1 Rank I or II Creature",
  NO_CREATURES:
    "Deck must include at least 1 Creature (cannot be all Spells/Buildings)",
} as const;
