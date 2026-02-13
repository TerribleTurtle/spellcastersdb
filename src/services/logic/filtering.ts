import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { isSpellcaster } from "@/services/validation/guards";
import { CATEGORY_TO_PLURAL } from "@/services/config/constants";
import { BrowserItem } from "@/types/browser";

export interface FilterState {
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
}

export function filterBrowserItems(
    items: BrowserItem[],
    searchQuery: string,
    activeFilters: FilterState
): BrowserItem[] {
    return items.filter((item) => {
        const isSpellcasterEntity = isSpellcaster(item);
        const isUnit = "entity_id" in item && !isSpellcasterEntity;
        const rawCategory = isUnit ? item.category : "Spellcaster";
        const category = CATEGORY_TO_PLURAL[rawCategory] || rawCategory;
        const school = "magic_school" in item ? item.magic_school : "N/A";
        const rank = "rank" in item ? (item as Unit | Spell | Titan).rank : null;
        const spellcasterClass = isSpellcasterEntity ? (item as Spellcaster).class : null;

        // Search
        if (searchQuery) {
            const lowQuery = searchQuery.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(lowQuery);
            const matchesDesc =
                "description" in item &&
                item.description.toLowerCase().includes(lowQuery);
            const matchesTags =
                "tags" in item &&
                item.tags.some((tag) => tag.toLowerCase().includes(lowQuery));
            const matchesSchool =
                "magic_school" in item && item.magic_school.toLowerCase().includes(lowQuery);
            const matchesCategory = category.toLowerCase().includes(lowQuery);

            if (
                !matchesName &&
                !matchesDesc &&
                !matchesTags &&
                !matchesSchool &&
                !matchesCategory
            ) {
                return false;
            }
        }

        // Filters
        if (
            activeFilters.categories.length > 0 &&
            !activeFilters.categories.includes(category)
        )
            return false;
        
        if (activeFilters.schools.length > 0) {
            if (!isUnit) return false;
            if (!activeFilters.schools.includes(school)) return false;
        }
        
        if (activeFilters.ranks.length > 0) {
            if (!rank || !activeFilters.ranks.includes(rank)) return false;
        }
        
        if (activeFilters.classes.length > 0) {
            if (!spellcasterClass) return false;
            if (!activeFilters.classes.includes(spellcasterClass)) return false;
        }

        return true;
    });
}
