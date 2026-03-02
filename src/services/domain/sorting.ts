import {
  BROWSER_CATEGORY_ORDER,
  CATEGORY_PRIORITY,
  CATEGORY_TO_PLURAL,
  GroupMode,
  RANKS,
  SCHOOLS,
} from "@/services/config/constants";
import { Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";

export interface GroupedContent {
  title: string;
  items: BrowserItem[];
}

type Comparator<T> = (a: T, b: T) => number;

/**
 * Returns a comparator function based on the selected GroupMode.
 * Used to sort items WITHIN a group.
 *
 * @param mode - The active grouping mode ("All", "Rank", or "Magic School").
 * @returns A comparator that sorts two `BrowserItem`s by mode-specific criteria.
 */
export function getComparator(mode: GroupMode): Comparator<BrowserItem> {
  return (a, b) => {
    switch (mode) {
      case "All":
        // Original: Rank -> Name
        return compareByRank(a, b) || compareByName(a, b);

      case "Rank":
        // Original: Category Priority -> Name
        return compareByCategoryPriority(a, b) || compareByName(a, b);

      case "Magic School":
        // Original: Category Priority -> Rank -> Name
        return (
          compareByCategoryPriority(a, b) ||
          compareByRank(a, b) ||
          compareByName(a, b)
        );

      default:
        return compareByName(a, b);
    }
  };
}

/**
 * Groups a filtered list of items into discrete visual sections.
 *
 * Architectural Note:
 * This function enforces stable, predictable rendering by iterating over predefined,
 * constant arrays (e.g., `BROWSER_CATEGORY_ORDER`, `SCHOOLS`) rather than dynamically
 * deriving groups from the data. This guarantees that:
 * 1. Groups always appear in the identical order regardless of search results.
 * 2. Categories like 'Spellcaster' will always appear before 'Unit' when Mode is 'All'.
 * 3. Items within each group are then sorted by the provided `mode` comparator.
 *
 * @param items - The pre-filtered list of browser items to group.
 * @param mode - The active grouping mode determining section titles and sort order.
 * @returns An ordered array of `GroupedContent` sections, each with a title and sorted items.
 */
export function groupItems(
  items: BrowserItem[],
  mode: GroupMode
): GroupedContent[] {
  if (items.length === 0) return [];

  const itemComparator = getComparator(mode);
  const groups: { title: string; items: BrowserItem[]; sortIndex: number }[] =
    [];

  if (mode === "All") {
    // Order: Spellcaster, Creature, Spell, Building, Titan
    const catOrder = BROWSER_CATEGORY_ORDER;

    catOrder.forEach((catSingular, index) => {
      const catPlural = CATEGORY_TO_PLURAL[catSingular] || catSingular;
      // Filter items for this category
      const groupItems = items.filter((i) => {
        const c = "entity_id" in i ? i.category : "Spellcaster";
        return c === catSingular;
      });

      if (groupItems.length > 0) {
        groupItems.sort(itemComparator);
        groups.push({ title: catPlural, items: groupItems, sortIndex: index });
      }
    });
  } else if (mode === "Rank") {
    RANKS.forEach((rank, index) => {
      const groupItems = items.filter((i) => {
        if (!("entity_id" in i)) return false;
        return (i as Unit).rank === rank;
      });

      if (groupItems.length > 0) {
        groupItems.sort(itemComparator);
        groups.push({
          title: `Rank ${rank}`,
          items: groupItems,
          sortIndex: index,
        });
      }
    });
  } else if (mode === "Magic School") {
    SCHOOLS.forEach((school, index) => {
      const groupItems = items.filter((i) => {
        if (!("entity_id" in i)) return false;
        return "magic_school" in i && i.magic_school === school;
      });

      if (groupItems.length > 0) {
        groupItems.sort(itemComparator);
        groups.push({ title: school, items: groupItems, sortIndex: index });
      }
    });
  }

  // Groups are already pushed in order because we iterated over the ordered constants
  return groups.map((g) => ({ title: g.title, items: g.items }));
}

// --- Helpers ---

/**
 * Compares two browser items alphabetically by name using `localeCompare`.
 *
 * @param a - First item.
 * @param b - Second item.
 * @returns A negative, zero, or positive number for sort ordering.
 */
export function compareByName(a: BrowserItem, b: BrowserItem) {
  const nameA = String(a?.name || "");
  const nameB = String(b?.name || "");
  return nameA.localeCompare(nameB);
}

/**
 * Compares two browser items by rank (e.g., "I", "II", "III") using `localeCompare`.
 * Non-ranked items default to `"I"`.
 *
 * @param a - First item.
 * @param b - Second item.
 * @returns A negative, zero, or positive number for sort ordering.
 */
export function compareByRank(a: BrowserItem, b: BrowserItem) {
  // Use safe optional chaining and string coercion
  const rA = "rank" in a ? String((a as Unit)?.rank || "I") : "I";
  const rB = "rank" in b ? String((b as Unit)?.rank || "I") : "I";
  return rA.localeCompare(rB);
}

/**
 * Compares two browser items by their category's display priority.
 * Uses the `CATEGORY_PRIORITY` map; unknown categories fall back to priority `99`.
 *
 * @param a - First item.
 * @param b - Second item.
 * @returns A negative, zero, or positive number for sort ordering.
 */
export function compareByCategoryPriority(a: BrowserItem, b: BrowserItem) {
  const catA =
    "category" in a && a.category ? String(a.category) : "Spellcaster";
  const catB =
    "category" in b && b.category ? String(b.category) : "Spellcaster";

  const pA = CATEGORY_PRIORITY[catA] || 99;
  const pB = CATEGORY_PRIORITY[catB] || 99;

  return pA - pB;
}
