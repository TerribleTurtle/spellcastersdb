// ============================================================================
// Entity Categories
// ============================================================================

import { EntityCategory } from "@/types/enums";

// ============================================================================
// Entity Categories
// ============================================================================

export { EntityCategory } from "@/types/enums";

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

export type School = typeof SCHOOLS[number];

export const RANKS = ["I", "II", "III", "IV", "V"] as const;
export type Rank = typeof RANKS[number];

export const RANK_CONFIG: Record<Rank, { label: string; color: string; bg: string; border: string; borderBg: string }> = {
  I: {
    label: "I",
    color: "text-white",
    bg: "bg-slate-600",
    border: "border-slate-400",
    borderBg: "bg-slate-400",
  },
  II: {
    label: "II",
    color: "text-white",
    bg: "bg-emerald-700",
    border: "border-emerald-500",
    borderBg: "bg-emerald-500",
  },
  III: {
    label: "III",
    color: "text-white",
    bg: "bg-blue-700",
    border: "border-blue-500",
    borderBg: "bg-blue-500",
  },
  IV: {
    label: "IV",
    color: "text-white",
    bg: "bg-purple-700",
    border: "border-purple-500",
    borderBg: "bg-purple-500",
  },
  V: {
    label: "V", // Will be overridden for Titans in component if needed, or we can treat V as Titan rank generically
    color: "text-white",
    bg: "bg-amber-800",
    border: "border-amber-600",
    borderBg: "bg-amber-600",
  },
};

export const SPELLCASTER_CLASSES = ["Duelist", "Conqueror", "Enchanter"] as const;
export type SpellcasterClass = typeof SPELLCASTER_CLASSES[number];

export const CLASS_CONFIG: Record<string, { label: string; bg: string; border: string; iconColor: string }> = {
  Conqueror: {
    label: "Conqueror",
    bg: "bg-slate-900",
    border: "border-slate-600",
    iconColor: "text-red-400"
  },
  Duelist: {
    label: "Duelist",
    bg: "bg-slate-900",
    border: "border-slate-600",
    iconColor: "text-amber-400"
  },
  Enchanter: {
    label: "Enchanter",
    bg: "bg-slate-900",
    border: "border-slate-600",
    iconColor: "text-purple-400"
  },
  Unknown: {
    label: "?",
    bg: "bg-slate-900",
    border: "border-slate-400",
    iconColor: "text-gray-400"
  }
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

export const BROWSER_CATEGORY_ORDER = ["Spellcaster", "Creature", "Building", "Spell", "Titan"];

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
