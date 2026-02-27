import {
  BROWSER_CATEGORY_ORDER,
  CATEGORY_TO_PLURAL,
  RANKS,
} from "@/services/config/constants";
import { getComparator } from "@/services/domain/sorting";
import { UnifiedEntity } from "@/types/api";
import { Unit } from "@/types/api";

export interface RankSubGroup {
  rank: string;
  items: UnifiedEntity[];
}

export interface CalculatorGroup {
  title: string;
  items: UnifiedEntity[];
  rankGroups: RankSubGroup[];
}

/**
 * Groups and sorts entities for the Unlock Calculator.
 * - Sorts by Category Priority -> Rank -> Name (same as deck builder 'All' mode)
 * - Groups by Category (Spellcasters, Creatures, etc.)
 * - Sub-groups by Rank within each category
 * - Hides owned items if hideOwned is true
 */
export function groupCalculatorEntities(
  entities: UnifiedEntity[],
  ownedIds: Set<string>,
  hideOwned: boolean
): CalculatorGroup[] {
  // 1. Filter out owned if hideOwned is true
  const filtered = entities.filter((entity) => {
    if (hideOwned && ownedIds.has(entity.entity_id)) return false;
    return true;
  });

  // 2. Use the domain sorter for "All" mode (Rank -> Name)
  const comparator = getComparator("All");

  const groups: CalculatorGroup[] = [];

  // 3. Group strictly by BROWSER_CATEGORY_ORDER
  BROWSER_CATEGORY_ORDER.forEach((catSingular) => {
    const groupItems = filtered.filter((e) => {
      const c = e.category || "Spellcaster";
      return c === catSingular;
    });

    if (groupItems.length > 0) {
      groupItems.sort(
        comparator as unknown as (a: UnifiedEntity, b: UnifiedEntity) => number
      );
      const groupTitle = CATEGORY_TO_PLURAL[catSingular] || catSingular;

      // 4. Sub-group by Rank within this category
      const rankGroups: RankSubGroup[] = [];
      const hasRanks = groupItems.some((e) => "rank" in e && (e as Unit).rank);

      if (hasRanks) {
        RANKS.forEach((rank) => {
          const rankItems = groupItems.filter((e) => {
            const r = "rank" in e ? String((e as Unit).rank || "I") : "I";
            return r === rank;
          });
          if (rankItems.length > 0) {
            rankGroups.push({ rank, items: rankItems });
          }
        });
      } else {
        // No ranks (e.g. Spells, Buildings) — single flat group
        rankGroups.push({ rank: "", items: groupItems });
      }

      groups.push({ title: groupTitle, items: groupItems, rankGroups });
    }
  });

  return groups;
}
