// ============================================================================
// Entity Categories
// ============================================================================
import { EntityCategory } from "@/types/enums";

export { EntityCategory };

// Retain backward compatibility for local usage if needed, or fully deprecate.
// For now, we will alias it to the Enum to match expected usage patterns.
export const ENTITY_CATEGORY = EntityCategory;

// ============================================================================
// Static Data Lists
// ============================================================================

export const SCHOOLS = [
  "Elemental",
  "Wild",
  "War",
  "Astral",
  "Holy",
  "Technomancy",
  "Necromancy",
  "Titan",
] as const;

export type School = (typeof SCHOOLS)[number];

export const RANKS = ["I", "II", "III", "IV", "V"] as const;
export type Rank = (typeof RANKS)[number];

export const RANK_CONFIG: Record<Rank, { label: string }> = {
  I: {
    label: "I",
  },
  II: {
    label: "II",
  },
  III: {
    label: "III",
  },
  IV: {
    label: "IV",
  },
  V: {
    label: "V", // Will be overridden for Titans in component if needed, or we can treat V as Titan rank generically
  },
};

export const SPELLCASTER_CLASSES = [
  "Duelist",
  "Conqueror",
  "Enchanter",
] as const;
export type SpellcasterClass = (typeof SPELLCASTER_CLASSES)[number];

export const CLASS_CONFIG: Record<string, { label: string }> = {
  Conqueror: {
    label: "Conqueror",
  },
  Duelist: {
    label: "Duelist",
  },
  Enchanter: {
    label: "Enchanter",
  },
  Unknown: {
    label: "?",
  },
};

// ============================================================================
// Sort & Filter Config
// ============================================================================

export const CATEGORY_TO_PLURAL: Record<string, string> = {
  Spellcaster: "Spellcasters",
  Creature: "Creatures",
  Building: "Buildings",
  Spell: "Spells",
  Titan: "Titans",
};

export const CATEGORIES = Object.values(CATEGORY_TO_PLURAL);

export const CATEGORY_PRIORITY: Record<string, number> = {
  Spellcaster: 1,
  Creature: 2,
  Building: 3,
  Spell: 4,
  Titan: 5,
};

export const BROWSER_CATEGORY_ORDER = [
  "Spellcaster",
  "Creature",
  "Building",
  "Spell",
  "Titan",
];

export const GROUP_MODES = ["All", "Rank", "Magic School"] as const;

export type GroupMode = (typeof GROUP_MODES)[number];

export const DEFAULT_BROWSER_COLUMNS = 4;

// ============================================================================
// Deck Builder Config
// ============================================================================

export const DECK_SIZE = 4;
export const MAX_UNIT_SLOTS = DECK_SIZE; // Alias for clarity
export const DECK_SLOTS = Array.from({ length: DECK_SIZE }, (_, i) => i);
export const TEAM_LIMIT = 3;
export const TITAN_SLOT_INDEX = 4;
export const SPELLCASTER_ZONE_ID = "spellcaster-zone";

export const SLOT_PREFIX = "slot-";
export const SLOT_DRAG_PREFIX = "slot-drag-";
export const SPELLCASTER_SLOT_DRAG_ID = "spellcaster-slot-drag";

export const DEFAULT_SCHOOL = "N/A";
export const DEFAULT_CATEGORY = "Spellcaster";
export const DEFAULT_RANK = "N/A";
