import { useState } from "react";

export interface UnitFilters {
  schools: string[];
  ranks: string[];
  categories: string[];
  classes: string[];
}

interface UseUnitFiltersProps {
  defaultFilters?: Partial<UnitFilters>;
}

export function useUnitFilters({ defaultFilters }: UseUnitFiltersProps = {}) {
  const [activeFilters, setActiveFilters] = useState<UnitFilters>({
    schools: defaultFilters?.schools || [],
    ranks: defaultFilters?.ranks || [],
    categories: defaultFilters?.categories || [],
    classes: defaultFilters?.classes || [],
  });

  const toggleFilter = (type: keyof UnitFilters, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const clearFilters = () => {
    setActiveFilters({ schools: [], ranks: [], categories: [], classes: [] });
  };

  return {
    activeFilters,
    toggleFilter,
    clearFilters,
    setActiveFilters, // Expose if needed for advanced cases
  };
}
