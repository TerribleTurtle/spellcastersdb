
import { describe, it, expect, vi } from 'vitest';
import { mapRawDataToAllData, DataValidationError } from '../mappers';
import { EntityCategory } from '@/types/enums';

describe('mapRawDataToAllData', () => {
    const validSpellcaster = {
        entity_id: 'sc1',
        spellcaster_id: 'sc1',
        name: 'Mage',
        category: EntityCategory.Spellcaster,
        class: 'Enchanter',
        description: 'Test Spellcaster Description',
        tags: [],
        health: 100,
        abilities: {
            passive: [],
            primary: { name: 'P', description: '' },
            defense: { name: 'D', description: '' },
            ultimate: { name: 'U', description: '' }
        }
    };

    const validUnit = {
        entity_id: 'u1',
        name: 'Goblin',
        category: EntityCategory.Creature,
        health: 10,
        tags: [],
        magic_school: 'Wild',
        description: ''
    };

    const minimalValidData = {
        build_info: { version: 'v1', generated_at: '2024-01-01' },
        spellcasters: [validSpellcaster],
        units: [validUnit],
        spells: [],
        titans: [],
        consumables: [],
        upgrades: []
    };

    it('should map valid data correctly', () => {
        const result = mapRawDataToAllData(minimalValidData);
        expect(result).toEqual(minimalValidData);
    });

    it('should handle legacy "heroes" field', () => {
        const legacyData = {
            ...minimalValidData,
            spellcasters: undefined,
            heroes: [validSpellcaster]
        };
        
        const result = mapRawDataToAllData(legacyData);
        expect(result.spellcasters).toEqual([validSpellcaster]);
    });

    it('should filter out non-Creature/Building units', () => {
        const dataWithInvalidUnit = {
            ...minimalValidData,
            units: [
                validUnit,
                { ...validUnit, entity_id: 'u2', category: 'InvalidCategory' }
            ]
        };

        const result = mapRawDataToAllData(dataWithInvalidUnit);
        expect(result.units).toHaveLength(1);
        expect(result.units[0].entity_id).toBe('u1');
    });

    it('should throw DataValidationError on schema failure', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        const invalidData = {
            ...minimalValidData,
            spellcasters: [{ ...validSpellcaster, name: 123 }] // Name should be string
        };

        expect(() => mapRawDataToAllData(invalidData)).toThrow(DataValidationError);
        
        consoleSpy.mockRestore();
    });

    it('should cache results', () => {
        const firstResult = mapRawDataToAllData(minimalValidData);
        const secondResult = mapRawDataToAllData(minimalValidData);
        
        expect(firstResult).toBe(secondResult); // Check reference equality
    });
});
