
import { encodeTeam } from '@/lib/encoding';

// Mock data structure matching app logic
const mockDeck = {
    spellcaster: { spellcaster_id: 'sc_grand_magus', name: 'Grand Magus' },
    slots: [
        { unit: { entity_id: 'u_ballista', name: 'Ballista' } },
        { unit: { entity_id: 'u_dryad', name: 'Dryad' } },
        { unit: { entity_id: 'u_faerie', name: 'Faerie' } },
        { unit: { entity_id: 'u_harpy', name: 'Harpy' } },
        { unit: { entity_id: 'u_ogre', name: 'Ogre' } }
    ],
    name: 'Deck 1'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const teamHash = encodeTeam([mockDeck, mockDeck, mockDeck] as any, "Test Team");
console.log(`Generated Team Hash: ${teamHash}`);
console.log(`\nTest URL: http://localhost:3000/api/og?team=${encodeURIComponent(teamHash)}`);
console.log(`\nCurl Command: curl -v "http://localhost:3000/api/og?team=${encodeURIComponent(teamHash)}" > og_output.png`);
