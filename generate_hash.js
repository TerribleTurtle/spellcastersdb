
const LZString = require('lz-string');

const DELIMITER = "\u001F";
const TEAM_V2_PREFIX = "v2~";

function encodeTeam(decks, name = "") {
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

// REAL IDs from API
const decks = [
    { id: "astral_monk", u1: "u1", name: "Astral Deck" },
    { id: "stone_shaman", u1: "u2", name: "Stone Deck" },
    { id: "swamp_witch", u1: "u3", name: "Swamp Deck" }
];
const encoded = encodeTeam(decks, "Real Team");
console.log(encoded);
