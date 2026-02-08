
const LZString = require('lz-string');

const DELIMITER = "\u001F";
const TEAM_V2_PREFIX = "v2~";

function encodeTeam(decks, name = "") {
    // Mock getDeckIds
    const getDeckIds = (d) => [
        d.id || "",
        d.u1 || "", d.u2 || "", d.u3 || "", d.u4 || "", d.u5 || "",
        (d.name || "").substring(0, 50)
    ];

    const deck1Ids = getDeckIds(decks[0]);
    const deck2Ids = getDeckIds(decks[1]);
    const deck3Ids = getDeckIds(decks[2]);
    
    const combined = [name, ...deck1Ids, ...deck2Ids, ...deck3Ids];
    const packed = combined.join(DELIMITER);
    return TEAM_V2_PREFIX + LZString.compressToEncodedURIComponent(packed);
}

function decodeTeam(hash) {
    if (!hash) return { name: "", decks: [] };
    const cleanHash = hash.replace(/ /g, '+');
    
    if (cleanHash.startsWith(TEAM_V2_PREFIX)) {
        const payload = cleanHash.slice(TEAM_V2_PREFIX.length);
        console.log("Payload to decompress:", payload);
        const packed = LZString.decompressFromEncodedURIComponent(payload);
        console.log("Decompressed packed string:", packed);
        
        if (!packed) return null;
        return packed.split(DELIMITER);
    }
    return "Legacy or Invalid";
}

// Test Case
const testHash = "v2~NoH4sIAAAAAAAAA6tWKs7My1ayUlDKz8xT0lFQKihKLS5R0lHKTcxLBAoVpyZnJqUWFesoeBcllqQmFuUXK2hAjCjOzEsGShSUlipZGRkYGBjrKBgZGeooGBkZ6SgYGRnpKBgZGekAgAD//w==";
console.log("Decoding Test Hash:", testHash);
const result = decodeTeam(testHash);
console.log("Result:", result);

// Encode Test
const decks = [
    { id: "h1", u1: "u1", name: "D1" },
    { id: "h2", u1: "u2", name: "D2" },
    { id: "h3", u1: "u3", name: "D3" }
];
const encoded = encodeTeam(decks, "My Team");
console.log("Encoded:", encoded);
const decoded = decodeTeam(encoded);
console.log("Decoded back:", decoded);
