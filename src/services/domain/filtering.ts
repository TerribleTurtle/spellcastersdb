
import { isSpellcaster } from "@/services/validation/guards";
import { CATEGORY_TO_PLURAL } from "@/services/config/constants";
import { BrowserItem } from "@/types/browser";

import { DEFAULT_CATEGORY, DEFAULT_SCHOOL } from "@/services/config/constants";

export interface FilterState {
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
}


export const matchesSearch = (item: BrowserItem, query: string, category: string): boolean => {
    if (!query) return true;
    const lowQuery = query.toLowerCase();
    
    if (item.name.toLowerCase().includes(lowQuery)) return true;
    if ("description" in item && item.description.toLowerCase().includes(lowQuery)) return true;
    if ("tags" in item && item.tags.some((tag) => tag.toLowerCase().includes(lowQuery))) return true;
    if ("magic_school" in item && item.magic_school.toLowerCase().includes(lowQuery)) return true;
    if (category.toLowerCase().includes(lowQuery)) return true;

    return false;
};

export const matchesFilters = (item: BrowserItem, filters: FilterState, category: string, school: string, rank: string | null, spellcasterClass: string | null, isUnit: boolean): boolean => {
    if (filters.categories.length > 0 && !filters.categories.includes(category)) return false;
    
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

export function filterBrowserItems(
    items: BrowserItem[],
    searchQuery: string,
    activeFilters: FilterState
): BrowserItem[] {
    return items.filter((item) => {
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

        if (!matchesSearch(item, searchQuery, category)) return false;
        if (!matchesFilters(item, activeFilters, category, school, rank, spellcasterClass, isUnit)) return false;

        return true;
    });
}

