import { useMemo } from "react";
import { 
    GroupMode 
} from "@/services/config/constants";


import { BrowserItem } from "@/types/browser";
import { groupItems } from "@/services/domain/sorting";
import { filterBrowserItems, FilterState } from "@/services/domain/filtering";

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
