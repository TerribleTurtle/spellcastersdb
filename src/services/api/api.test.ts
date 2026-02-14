import { describe, it, expect, vi, afterEach, beforeEach, type Mock } from 'vitest';

// Mock server-only to allow testing server code in client/test env
vi.mock("server-only", () => { return {}; });

import { fetchGameData } from './api';
import { AllDataResponse } from '@/types/api';
import { EntityCategory } from '@/types/enums';

describe('Remote Data Validation', () => {
    // Basic mock data satisfying the strict schema
    const mockApiResponse: AllDataResponse = {
        build_info: { version: 'test-v1', generated_at: '2025-01-01' },
        spellcasters: [
            { 
                entity_id: 'sc1', 
                spellcaster_id: 'sc1', 
                name: 'Mage', 
                category: EntityCategory.Spellcaster, 
                class: 'Enchanter', 
                tags: [], 
                health: 100, 
                movement_speed: 10,
                abilities: { 
                    passive: [], 
                    primary: { name: 'P', description: '' }, 
                    defense: { name: 'D', description: '' }, 
                    ultimate: { name: 'U', description: '' } 
                } 
            }
        ],
        units: [
            { entity_id: 'u1', name: 'Goblin', category: EntityCategory.Creature, health: 10, tags: [], magic_school: 'Wild', description: '' }
        ],
        spells: [],
        titans: [],
        consumables: [],
        upgrades: []
    };

    beforeEach(() => {
        // Spy on fetch
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should validate and return data on successful fetch', async () => {
        // Mock success response
        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => mockApiResponse,
        });

        const data = await fetchGameData();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(data.spellcasters).toHaveLength(1);
        expect(data.units).toHaveLength(1);
        expect(data.build_info.version).toBe('test-v1');
    });

    it('should throw DataFetchError on API failure (404/500)', async () => {
        // Mock error response
        (global.fetch as Mock).mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Server Error',
        });

        await expect(fetchGameData()).rejects.toThrow('Failed to fetch: 500 Server Error');
    });

    it('should throw DataFetchError on malformed JSON (Schema Validation Failure)', async () => {
        // Mock malformed data (missing required fields)
        const badData = { foo: 'bar' };
        
        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => badData,
        });

        // Use a spy on console.error to suppress the expected error log during test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(fetchGameData()).rejects.toThrow('Data Validation Failed');
        
        consoleSpy.mockRestore();
    });
});
