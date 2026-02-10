import { describe, it, expect, vi } from 'vitest';
import { fetchGameData } from './api';

describe('Remote Data Validation', () => {
    it('should validate remote data against schema', async () => {
        // Enforce production environment to use remote URL
        vi.stubEnv('NODE_ENV', 'production');
        
        // Ensure API_URL is using the default (remote) one
        vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://terribleturtle.github.io/spellcasters-community-api/api/v1');

        console.log('Fetching data from remote...');
        const data = await fetchGameData();

        // Check if data is empty (which indicates validation failure in fetchGameData)
        if (data.spellcasters.length === 0 && data.units.length === 0) {
            console.error('Data Validation Failed! Returned empty data.');
        }

        expect(data.spellcasters.length).toBeGreaterThan(0);
        expect(data.units.length).toBeGreaterThan(0);
    });
});
