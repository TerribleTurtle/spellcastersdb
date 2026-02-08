import { encodeDeck } from "@/lib/encoding";

// Mock data structure matching app logic
const mockDeck = {
  spellcaster: { spellcaster_id: "sc_grand_magus", name: "Grand Magus" },
  slots: [
    { unit: { entity_id: "u_ballista", name: "Ballista" } },
    { unit: { entity_id: "u_dryad", name: "Dryad" } },
    { unit: { entity_id: "u_faerie", name: "Faerie" } },
    { unit: { entity_id: "u_harpy", name: "Harpy" } },
    { unit: { entity_id: "u_ogre", name: "Ogre" } },
  ],
  name: "Iron Sorcerer Deck",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deckHash = encodeDeck(mockDeck as any);
console.log(`Generated Deck Hash: ${deckHash}`);
console.log(
  `\nTest URL: http://localhost:3000/api/og?deck=${encodeURIComponent(deckHash)}`
);
