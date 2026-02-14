import { describe, it, expect } from "vitest";
import { filterBrowserItems, matchesSearch } from "./filtering";
import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

const MockItems: BrowserItem[] = [
    { entity_id: "1", name: "Fireball", category: EntityCategory.Spell, description: "A ball of fire", tags: ["fire"], magic_school: "Pyromancy" } as any,
    { entity_id: "2", name: "Water Elemental", category: EntityCategory.Creature, description: "Effective against fire", tags: ["water"], magic_school: "Hydromancy" } as any,
    { entity_id: "3", name: "Fireworks", category: EntityCategory.Item, description: "Pretty lights", tags: ["fire"], magic_school: "None" } as any,
];

describe("Filtering Logic", () => {
    it("should prioritize exact matches", () => {
        const results = filterBrowserItems(MockItems, "Fireball", { schools: [], ranks: [], categories: [], classes: [] });
        expect(results[0].name).toBe("Fireball");
    });

    it("should prioritize name matches over description", () => {
        // "Fire" matches "Fireball" (Name) and "Water Elemental" (Description)
        // Current logic might just return both in arbitrary order or ID order.
        // We want Fireball first.
        const results = filterBrowserItems(MockItems, "Fire", { schools: [], ranks: [], categories: [], classes: [] });
        expect(results[0].name).toBe("Fireball"); 
        expect(results[1].name).toBe("Fireworks"); // Starts with Fire
        expect(results[2].name).toBe("Water Elemental"); // Contains fire in desc
    });
});
