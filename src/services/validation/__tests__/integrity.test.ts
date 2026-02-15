import { describe, it, expect } from 'vitest';
import { validateIntegrity } from '../integrity-checker';
import { AllDataResponse, Unit } from '@/types/api';

describe('Data Integrity Checker', () => {
    const mockData: AllDataResponse = {
        build_info: { version: '0.0.0', generated_at: '' },
        spellcasters: [],
        units: [],
        spells: [],
        titans: [],
        consumables: [],
        upgrades: [],
    };

    it('should detect duplicate unit IDs', () => {
        const data = { ...mockData, units: [
            { entity_id: 'u1', category: 'Creature' },
            { entity_id: 'u1', category: 'Building' }
        ] as unknown as Unit[] };

        const issues = validateIntegrity(data);
        expect(issues).toEqual(expect.arrayContaining([
            expect.objectContaining({ 
                severity: 'error', 
                message: expect.stringContaining('Duplicate Entity ID') 
            })
        ]));
    });

    it('should detect broken spawner links', () => {
        const data = { ...mockData, units: [
            { 
                entity_id: 'spawner_unit', 
                category: 'Creature',
                mechanics: {
                    spawner: [{ unit_id: 'missing_unit', count: 1, trigger: 'Death' }]
                }
            }
        ] as unknown as Unit[] };

        const issues = validateIntegrity(data);
        expect(issues).toEqual(expect.arrayContaining([
            expect.objectContaining({ 
                severity: 'warning', 
                message: expect.stringContaining('spawns unknown unit_id') 
            })
        ]));
    });

    it('should pass for valid data', () => {
        const data = { ...mockData, units: [
            { entity_id: 'u1', category: 'Creature' },
            { 
                entity_id: 'spawner', 
                category: 'Creature',
                mechanics: {
                    spawner: [{ unit_id: 'u1', count: 1, trigger: 'Death' }]
                } 
            }
        ] as unknown as Unit[] };

        const issues = validateIntegrity(data);
        expect(issues).toHaveLength(0);
    });
});
