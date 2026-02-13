import { StoredDeck, reconstructDeck } from "@/services/data/persistence";
import { Spellcaster, Unit, Spell, Titan } from "@/types/api";
import { Deck } from "@/types/deck";

interface DecodedTeam {
    name?: string;
    decks: ({
        name?: string;
        spellcasterId: string | null;
        slotIds: (string | null)[];
    } | null)[];
}

export const ReconstructionService = {
  reconstructTeam(
    decodedData: DecodedTeam,
    units: (Unit | Spell | Titan)[],
    spellcasters: Spellcaster[]
  ): { decks: Deck[]; name: string } {
    const { name: decodedName, decks: decodedDecks } = decodedData;
    const importedDecks: StoredDeck[] = [];
    const normalizeId = (id: string | null | undefined) => id || null;

    decodedDecks.forEach((d, idx) => {
      if (idx > 2 || !d) return;
      const slots = (d.slotIds || []).map(normalizeId) as [
        string | null,
        string | null,
        string | null,
        string | null,
        string | null
      ];
      while (slots.length < 5) slots.push(null);
      importedDecks.push({
        id: undefined,
        name: d.name || "Imported Deck",
        spellcasterId: normalizeId(d.spellcasterId),
        slotIds: slots,
      });
    });

    const fullDecks = importedDecks.map((d) =>
      reconstructDeck(d, units, spellcasters)
    );

    return {
      decks: fullDecks,
      name: decodedName || "Imported Team",
    };
  },
};
