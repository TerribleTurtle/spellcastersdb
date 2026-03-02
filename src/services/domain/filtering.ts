import { CATEGORY_TO_PLURAL } from "@/services/config/constants";
import { DEFAULT_CATEGORY, DEFAULT_SCHOOL } from "@/services/config/constants";
import { isSpellcaster } from "@/services/validation/guards";
import { BrowserItem } from "@/types/browser";

/**
 * Represents the set of active hard filters applied to the entity browser.
 * Each field holds an array of selected values; an empty array means "no filter" for that dimension.
 */
export interface FilterState {
  /** Selected magic schools (e.g., "Fire", "Null"). Only applies to units. */
  schools: string[];
  /** Selected ranks (e.g., "I", "II", "III"). */
  ranks: string[];
  /** Selected entity categories (e.g., "Creature", "Building"). */
  categories: string[];
  /** Selected spellcaster classes. Only applies to spellcasters. */
  classes: string[];
}

/**
 * Checks whether an item matches a free-text search query across multiple fields.
 * Matches against name, description, tags, magic school, and category (substring, case-insensitive).
 *
 * @param item - The browser item to test.
 * @param query - The search string entered by the user. Empty string matches everything.
 * @param category - The resolved plural category label for the item.
 * @returns `true` if `query` is empty or matches any searchable field.
 */
export const matchesSearch = (
  item: BrowserItem,
  query: string,
  category: string
): boolean => {
  if (!query) return true;
  const lowQuery = String(query).toLowerCase();

  // Name match
  if (item?.name && String(item.name).toLowerCase().includes(lowQuery))
    return true;

  // Description match
  if (
    "description" in item &&
    item.description &&
    String(item.description).toLowerCase().includes(lowQuery)
  )
    return true;

  // Tags match
  if ("tags" in item && Array.isArray(item.tags)) {
    if (
      item.tags.some(
        (tag) => tag && String(tag).toLowerCase().includes(lowQuery)
      )
    )
      return true;
  }

  // Magic School match
  if (
    "magic_school" in item &&
    item.magic_school &&
    String(item.magic_school).toLowerCase().includes(lowQuery)
  )
    return true;

  // Category match
  if (category && String(category).toLowerCase().includes(lowQuery))
    return true;

  return false;
};

/**
 * Applies hard (boolean) filters to an item. Returns `false` immediately
 * if the item fails any active filter dimension (categories, schools, ranks, classes).
 *
 * @param item - The browser item to test.
 * @param filters - The active `FilterState` containing selected values per dimension.
 * @param category - The resolved plural category label for the item.
 * @param school - The item's magic school (or the default school for non-units).
 * @param rank - The item's rank, or `null` if not applicable.
 * @param spellcasterClass - The spellcaster's class, or `null` for non-spellcasters.
 * @param isUnit - Whether the item is a unit entity (affects school filtering).
 * @returns `true` if the item passes all active filters.
 */
export const matchesFilters = (
  item: BrowserItem,
  filters: FilterState,
  category: string,
  school: string,
  rank: string | null,
  spellcasterClass: string | null,
  isUnit: boolean
): boolean => {
  if (filters.categories.length > 0 && !filters.categories.includes(category))
    return false;

  if (filters.schools.length > 0) {
    if (!isUnit) return false;
    if (!filters.schools.includes(school)) return false;
  }

  if (filters.ranks.length > 0) {
    if (!rank || !filters.ranks.includes(rank)) return false;
  }

  if (filters.classes.length > 0) {
    if (!spellcasterClass) return false;
    if (!filters.classes.includes(spellcasterClass)) return false;
  }

  return true;
};

/**
 * Calculates a search relevance score for a given item.
 *
 * Scoring Hierarchy:
 * - Exact Match (1000): Unambiguous user intent; bypasses all other signals.
 * - Prefix Match (500): High likelihood of intent (e.g. typing "fire i" for "Fire Imp").
 * - Partial Match (100): Standard substring match.
 * - Tags Match (50): Matches curated entity tags (e.g. "burn", "heal").
 * - School Match (40): Matches the magic school (e.g. "Fire", "Null").
 * - Category Match (30): Matches the entity type (e.g. "Spellcaster", "Unit").
 * - Description Match (10): Lowest priority as descriptions are long and prone to false positives.
 */
const calculateScore = (
  item: BrowserItem,
  query: string,
  category: string
): number => {
  if (!query || !item) return 0;
  const lowQuery = String(query).toLowerCase();
  const lowName = item.name ? String(item.name).toLowerCase() : "";
  let score = 0;

  if (lowName) {
    if (lowName === lowQuery) {
      score += 1000; // Exact match - Highest Priority
    } else if (lowName.startsWith(lowQuery)) {
      score += 500; // Prefix match - High Priority
    } else if (lowName.includes(lowQuery)) {
      score += 100; // Partial name match
    }
  }

  if ("tags" in item && Array.isArray(item.tags)) {
    if (
      item.tags.some(
        (tag) => tag && String(tag).toLowerCase().includes(lowQuery)
      )
    ) {
      score += 50;
    }
  }

  if (
    "magic_school" in item &&
    item.magic_school &&
    String(item.magic_school).toLowerCase().includes(lowQuery)
  ) {
    score += 40;
  }

  // Category match shouldn't outweigh name match usually, but good to have
  if (category && String(category).toLowerCase().includes(lowQuery)) {
    score += 30;
  }

  if (
    "description" in item &&
    item.description &&
    String(item.description).toLowerCase().includes(lowQuery)
  ) {
    score += 10;
  }

  return score;
};

/**
 * Filters and ranks a list of browser items through a two-stage pipeline:
 * 1. **Hard filters** — items failing any active filter dimension are excluded.
 * 2. **Search scoring** — remaining items are scored by `calculateScore` and sorted descending.
 *
 * Items with a score of 0 (no search match) are excluded when a search query is active.
 *
 * @param items - The full unfiltered list of browser items.
 * @param searchQuery - The user's free-text search string. Empty string skips scoring.
 * @param activeFilters - The currently active `FilterState`.
 * @returns A filtered and relevance-sorted array of `BrowserItem`s.
 */
export function filterBrowserItems(
  items: BrowserItem[],
  searchQuery: string,
  activeFilters: FilterState
): BrowserItem[] {
  const scoredItems = items.map((item) => {
    const isSpellcasterEntity = isSpellcaster(item);
    const isUnit = "entity_id" in item && !isSpellcasterEntity;
    const rawCategory = isUnit ? item.category : DEFAULT_CATEGORY;
    const category = CATEGORY_TO_PLURAL[rawCategory] || rawCategory;
    const school = "magic_school" in item ? item.magic_school : DEFAULT_SCHOOL;

    let rank: string | null = null;
    if ("rank" in item) {
      rank = item.rank || null;
    }

    const spellcasterClass = isSpellcasterEntity ? item.class : null;

    // Check Hard Filters First
    if (
      !matchesFilters(
        item,
        activeFilters,
        category,
        school,
        rank,
        spellcasterClass,
        isUnit
      )
    ) {
      return { item, score: -1 };
    }

    // Calculate Search Score
    const score = searchQuery ? calculateScore(item, searchQuery, category) : 1;

    // If searching but no match, filter out
    if (searchQuery && score === 0) {
      return { item, score: -1 };
    }

    return { item, score };
  });

  return scoredItems
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
