
import { encodeDeck, decodeDeck, encodeTeam, decodeTeam } from './src/lib/encoding';

const DELIMITER = "\u001F";
const TEAM_DELIMITER = "~";

console.log("--- Testing LZ String Sanitization ---");

// Test 1: Deck Name Sanitization
const dirtyDeckName = `Evil${DELIMITER}Deck${TEAM_DELIMITER}Name`;
const deck = {
    name: dirtyDeckName,
    spellcaster: { spellcaster_id: "sc_1" },
    slots: [
        { unit: { entity_id: "u_1" } },
        { unit: { entity_id: "u_2" } },
        { unit: { entity_id: "u_3" } },
        { unit: { entity_id: "u_4" } },
        { unit: { entity_id: "u_5" } },
    ]
};

const encodedDeck = encodeDeck(deck as any);
const decodedDeck = decodeDeck(encodedDeck);

console.log(`Original Name: ${JSON.stringify(dirtyDeckName)}`);
console.log(`Decoded Name:  ${JSON.stringify(decodedDeck?.name)}`);

if (decodedDeck?.name === "EvilDeckName") {
    console.log("PASS: Deck name sanitized.");
} else {
    console.error("FAIL: Deck name NOT sanitized correctly.");
}

// Test 2: Team Name Sanitization
const dirtyTeamName = `Bad${DELIMITER}Team`;
const encodedTeam = encodeTeam([deck as any, deck as any, deck as any], dirtyTeamName);
const decodedTeam = decodeTeam(encodedTeam);

console.log(`Original Team Name: ${JSON.stringify(dirtyTeamName)}`);
console.log(`Decoded Team Name:  ${JSON.stringify(decodedTeam.name)}`);

if (decodedTeam.name === "BadTeam") {
    console.log("PASS: Team name sanitized.");
} else {
    console.error("FAIL: Team name NOT sanitized correctly.");
}
