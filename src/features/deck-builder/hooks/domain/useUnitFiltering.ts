import { useMemo } from "react";

import { GroupMode } from "@/services/config/constants";
import { FilterState, filterBrowserItems } from "@/services/domain/filtering";
import { groupItems } from "@/services/domain/sorting";
import { BrowserItem } from "@/types/browser";

export function useUnitFiltering(
  items: BrowserItem[],
  searchQuery: string,
  activeFilters: FilterState,
  groupMode: GroupMode
) {
  // 1. Filter Items
  const filteredItems = useMemo(() => {
    return filterBrowserItems(items, searchQuery, activeFilters);
  }, [items, searchQuery, activeFilters]);

  // 2. Group Items
  const groupedContent = useMemo(() => {
    return groupItems(filteredItems, groupMode);
  }, [filteredItems, groupMode]);

  return { filteredItems, groupedContent };
}
