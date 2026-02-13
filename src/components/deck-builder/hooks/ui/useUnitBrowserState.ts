
import { useState } from "react";
import { GroupMode } from "@/services/config/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeckStore } from "@/store/index";

export interface FilterState {
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
}

export function useUnitBrowserState() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [groupMode, setGroupMode] = useState<GroupMode>("All");
  const [showFilters, setShowFilters] = useState(false);

  // Use Global Store for Filters
  const activeFilters = useDeckStore((state) => state.browserFilters);
  const toggleFilter = useDeckStore((state) => state.toggleBrowserFilter);
  const clearFilters = useDeckStore((state) => state.clearBrowserFilters);

  const activeFilterCount =
    activeFilters.schools.length +
    activeFilters.ranks.length +
    activeFilters.categories.length +
    activeFilters.classes.length;

  return {
      searchQuery,
      setSearchQuery,
      debouncedSearchQuery,
      groupMode,
      setGroupMode,
      showFilters,
      setShowFilters,
      activeFilters,
      toggleFilter,
      clearFilters,
      activeFilterCount
  };
}
