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
 * Groups items and returns them in the correct display order.
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

export function compareByName(a: BrowserItem, b: BrowserItem) {
  return a.name.localeCompare(b.name);
}

export function compareByRank(a: BrowserItem, b: BrowserItem) {
  const rA = "rank" in a ? (a as Unit).rank || "I" : "I";
  const rB = "rank" in b ? (b as Unit).rank || "I" : "I";
  return rA.localeCompare(rB);
}

export function compareByCategoryPriority(a: BrowserItem, b: BrowserItem) {
  const catA = "category" in a ? a.category : "Spellcaster";
  const catB = "category" in b ? b.category : "Spellcaster";

  const pA = CATEGORY_PRIORITY[catA] || 99;
  const pB = CATEGORY_PRIORITY[catB] || 99;

  return pA - pB;
}
