export const DECK_ERRORS = {
  INVALID_DECK_INDEX: "Invalid deck index",
  INVALID_SLOT_INDEX: "Invalid slot index",
  DECK_FULL: "Deck Full!",
  DUPLICATE_UNIT: "Already in deck!",
  NO_TITAN_SLOT: "No Titan Slot Found",
  TITAN_SLOT_MISMATCH: "Only Titans can go in this slot",
  UNIT_SLOT_MISMATCH: "Titans cannot go in this slot",
  EXPECTS_TITAN: "Slot expects Titan",
  EXPECTS_UNIT: "Slot expects Unit",
  INVALID_TYPE: "Invalid item type",
  INVALID_TYPE_SLOT: "Invalid item type for slot", 
  INVALID_TYPE_QUICK_ADD: "Invalid item type for quick add",
  SPELLCASTER_IN_NORMAL_SLOT: "Cannot add Spellcaster to a normal slot",
  SWAP_INVALID: "Swap invalid",
} as const;

export const TEAM_ERRORS = {
    INVALID_DECK_INDEX: "Invalid deck index",
    INVALID_SLOT_INDEX: "Invalid slot index",
    INVALID_TYPE_SLOT: "Invalid item type for slot",
    INVALID_TYPE_QUICK_ADD: "Invalid item type for quick add",
} as const;
