
import { describe, it, expect, beforeEach } from 'vitest';
import { EntityRegistry } from './registry';
import { AllDataResponse } from '@/types/api';
import { EntityCategory } from '@/types/enums';

describe('EntityRegistry', () => {
    const registry = EntityRegistry.getInstance();

    const mockData: AllDataResponse = {
        build_info: { version: 'test', generated_at: 'now' },
        units: [
            { entity_id: 'u1', name: 'Unit 1', category: EntityCategory.Creature, health: 100, tags: [], magic_school: 'War', description: '' }
        ],
        spells: [
            { entity_id: 's1', name: 'Spell 1', category: EntityCategory.Spell, tags: [], magic_school: 'Wild', description: '' }
        ],
        titans: [
            { entity_id: 't1', name: 'Titan 1', category: EntityCategory.Titan, health: 1000, damage: 100, movement_speed: 10, rank: 'V', magic_school: 'Titan', description: '', tags: [] }
        ],
        spellcasters: [
            {
                entity_id: 'sc1',
                spellcaster_id: 'sc1',
                name: "Test Caster",
                category: EntityCategory.Spellcaster,
                class: "Enchanter",
                tags: [],
                health: 100,
                abilities: { passive: [], primary: { name: 'p', description: '' }, defense: { name: 'd', description: '' }, ultimate: { name: 'u', description: '' } }
            }
        ],
        consumables: [],
        upgrades: []
    };

    beforeEach(() => {
        // Reset via initialize with empty or mock data
        registry.initialize({ ...mockData, units: [], spells: [], titans: [], spellcasters: [] });
    });

    it('should be effectively empty after initialization with empty data', () => {
        expect(registry.get('u1')).toBeUndefined();
    });

    it('should populate maps correctly', () => {
        registry.initialize(mockData);
        expect(registry.isInitialized()).toBe(true);
        expect(registry.get('u1')).toBeDefined();
        expect(registry.get('s1')).toBeDefined();
        expect(registry.get('t1')).toBeDefined();
        expect(registry.get('sc1')).toBeDefined();
    });

    it('should retrieve specific types', () => {
        registry.initialize(mockData);
        const unit = registry.getUnit('u1');
        expect(unit?.name).toBe('Unit 1');
        expect(registry.getUnit('s1')).toBeUndefined(); // Spell is not a unit
    });

    it('should return undefined for unknowns', () => {
        registry.initialize(mockData);
        expect(registry.get('unknown-id')).toBeUndefined();
    });

    it('should overwrite data on re-initialization', () => {
        registry.initialize(mockData);
        expect(registry.get('u1')).toBeDefined();

        const emptyData = { ...mockData, units: [] };
        registry.initialize(emptyData);
        expect(registry.get('u1')).toBeUndefined();
    });
});
