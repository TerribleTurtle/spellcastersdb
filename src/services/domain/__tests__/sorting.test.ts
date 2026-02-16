
import { describe, it, expect } from 'vitest';
import { groupItems, compareByRank, compareByCategoryPriority } from '../sorting';
import { BrowserItem } from '@/types/browser';
import { Unit } from '@/types/api';
import { EntityCategory } from '@/types/enums';

describe('Sorting Logic', () => {
    const unitRank1: Unit = { entity_id: 'u1', name: 'A-Unit', rank: 'I', category: EntityCategory.Creature } as Unit;
    const unitRank2: Unit = { entity_id: 'u2', name: 'B-Unit', rank: 'II', category: EntityCategory.Creature } as Unit;
    const spellcaster: BrowserItem = { entity_id: 'sc1', name: 'Z-Caster', category: EntityCategory.Spellcaster } as unknown as BrowserItem;
    
    describe('Comparators', () => {
        it('compareByRank should sort I before II', () => {
             expect(compareByRank(unitRank1, unitRank2)).toBeLessThan(0);
        });

        it('compareByCategoryPriority should prioritize Spellcasters', () => {
             expect(compareByCategoryPriority(spellcaster, unitRank1)).toBeLessThan(0); // Spellcaster (1) < Unit (2)
        });
    });

    describe('groupItems', () => {
        const items = [unitRank2, spellcaster, unitRank1];

        it('should group by "All" correctly', () => {
            const groups = groupItems(items, 'All');
            // Expected order: Spellcasters, Creatures
            
            expect(groups[0].title).toBe('Spellcasters');
            expect(groups[0].items[0].name).toBe('Z-Caster');
            
            expect(groups[1].title).toBe('Creatures');
            // Within group, default sort is Rank -> Name
            // unitRank1 (I) before unitRank2 (II)
            expect(groups[1].items[0].name).toBe('A-Unit'); 
            expect(groups[1].items[1].name).toBe('B-Unit');
        });

        it('should group by "Rank" correctly', () => {
            const groups = groupItems(items, 'Rank');
            
            const rank1Group = groups.find(g => g.title === 'Rank I');

            expect(rank1Group).toBeDefined();
            expect(rank1Group?.items).toContain(unitRank1);
        });
    });
});
