/**
 * Phase 6 — Cross-Layer Integration Cascades
 *
 * This suite verifies the interplay between multiple layers:
 * `DeckRules` (Build) -> `validateDeck` (Check) -> `serialize/reconstruct` (Save/Load) -> `areDecksEqual` (Compare).
 *
 * NOTE: Tests that expect an unhandled error/crash/logic flaw are explicitly documented
 * as (EXPECTED FAIL). If no Expected Fail is marked, the sequence should complete cleanly.
 */
import { describe, expect, it } from "vitest";
import { create } from "zustand";

import {
  INITIAL_DECK,
  areDecksEqual,
  reconstructDeck,
  serializeDeck,
} from "@/services/api/persistence";
import { DeckRules } from "@/services/rules/deck-rules";
import { cloneDeck } from "@/services/utils/deck-utils";
import { validateDeck } from "@/services/validation/deck-validation";
import { createPersistenceSlice } from "@/store/createPersistenceSlice";
import { DeckBuilderState } from "@/store/types";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { Deck } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

// --- Mock Store Setup (Reused from Phase 5) ---
type TestState = DeckBuilderState;

function createTestStore(initialDeck: Deck) {
  return create<TestState>()(
    (set, get, store) =>
      ({
        currentDeck: cloneDeck(initialDeck),
        ...createPersistenceSlice(set, get, store),
        teamName: "",
        teamDecks: [],
        activeTeamId: null,
        checkActiveTeamDeletion: () => {},
      }) as unknown as TestState
  );
}

function getEmptyDeck() {
  return cloneDeck(INITIAL_DECK);
}

describe("Phase 6 — Cross-Layer Integration Cascades", () => {
  it("ADV-57: Build valid deck → Validate (Happy Path Chain)", () => {
    let deck = getEmptyDeck();
    deck.spellcaster = DeckFactory.createSpellcaster();

    // Add 1 Rank I Creature to satisfy rules
    deck = DeckRules.setSlot(
      deck,
      0,
      DeckFactory.createUnit({
        entity_id: "U1",
        category: EntityCategory.Creature as any,
        rank: "I",
      })
    ).data!;

    // Add 3 spells
    for (let i = 1; i < 4; i++) {
      deck = DeckRules.setSlot(
        deck,
        i,
        DeckFactory.createSpell({
          entity_id: `S${i}`,
          category: EntityCategory.Spell as any,
        })
      ).data!;
    }
    // Add 1 Titan
    deck = DeckRules.setSlot(
      deck,
      4,
      DeckFactory.createTitan({
        entity_id: "T1",
        category: EntityCategory.Titan as any,
      })
    ).data!;

    const result = validateDeck(deck);
    expect(result.isValid).toBe(true);
  });

  it("ADV-58: Build deck → Externally corrupt slot → Validate catches it", () => {
    let deck = getEmptyDeck();
    deck.spellcaster = DeckFactory.createSpellcaster();
    deck = DeckRules.setSlot(
      deck,
      0,
      DeckFactory.createUnit({
        entity_id: "U1",
        category: EntityCategory.Creature as any,
        rank: "I",
      })
    ).data!;
    for (let i = 1; i < 4; i++)
      deck = DeckRules.setSlot(
        deck,
        i,
        DeckFactory.createSpell({
          entity_id: `S${i}`,
          category: EntityCategory.Spell as any,
        })
      ).data!;
    deck = DeckRules.setSlot(
      deck,
      4,
      DeckFactory.createTitan({
        entity_id: "T1",
        category: EntityCategory.Titan as any,
      })
    ).data!;

    // Bypass DeckRules and tamper with the state directly
    const badUnit = DeckFactory.createUnit();
    // Simulate invalid category tricking the validator if possible
    (badUnit as any).category = "FAKE_CATEGORY";
    deck.slots[0].unit = badUnit;

    const result = validateDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("ADV-59: Build deck → Serialize → Reconstruct → areDecksEqual (Round-trip Integrity)", () => {
    let original = getEmptyDeck();
    // CRITICAL: INITIAL_DECK has no id. Without setting one, reconstructDeck
    // self-heals with a new UUID, breaking areDecksEqual's ID comparison.
    original.id = "roundtrip-test";
    const spellcaster = DeckFactory.createSpellcaster();
    original.spellcaster = spellcaster;

    const spell = DeckFactory.createSpell({
      entity_id: "S1",
      category: EntityCategory.Spell as any,
    });
    original = DeckRules.setSlot(original, 0, spell).data!;

    const dummyUnits = [spell];
    const dummySpellcasters = [spellcaster];

    const serialized = serializeDeck(original);
    const reconstructed = reconstructDeck(
      serialized,
      dummyUnits,
      dummySpellcasters
    );

    expect(areDecksEqual(original, reconstructed)).toBe(true);
  });

  it("ADV-60: Build deck → clearSlot(titanSlot) → Validate (Mid-state)", () => {
    let deck = getEmptyDeck();
    deck.spellcaster = DeckFactory.createSpellcaster();
    deck = DeckRules.setSlot(
      deck,
      0,
      DeckFactory.createUnit({
        entity_id: "U1",
        category: EntityCategory.Creature as any,
        rank: "I",
      })
    ).data!;
    for (let i = 1; i < 4; i++)
      deck = DeckRules.setSlot(
        deck,
        i,
        DeckFactory.createSpell({
          entity_id: `S${i}`,
          category: EntityCategory.Spell as any,
        })
      ).data!;
    deck = DeckRules.setSlot(
      deck,
      4,
      DeckFactory.createTitan({
        entity_id: "T1",
        category: EntityCategory.Titan as any,
      })
    ).data!;

    // Mid-build modification — clearSlot returns Deck directly, not DeckOperationResult
    deck = DeckRules.clearSlot(deck, 4);

    const result = validateDeck(deck);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Must have 1 Titan");
  });

  it("ADV-61: quickAdd Titan twice → Validate (Overwrite)", () => {
    let deck = getEmptyDeck();
    deck.spellcaster = DeckFactory.createSpellcaster();
    deck = DeckRules.setSlot(
      deck,
      0,
      DeckFactory.createUnit({
        entity_id: "U1",
        category: EntityCategory.Creature as any,
        rank: "I",
      })
    ).data!;
    for (let i = 1; i < 4; i++)
      deck = DeckRules.setSlot(
        deck,
        i,
        DeckFactory.createSpell({
          entity_id: `S${i}`,
          category: EntityCategory.Spell as any,
        })
      ).data!;

    const titan1 = DeckFactory.createTitan({
      entity_id: "T1",
      category: EntityCategory.Titan as any,
    });
    const titan2 = DeckFactory.createTitan({
      entity_id: "T2",
      category: EntityCategory.Titan as any,
    });

    deck = DeckRules.quickAdd(deck, titan1).data!;
    deck = DeckRules.quickAdd(deck, titan2).data!; // Should overwrite T1

    expect(deck.slots[4].unit?.entity_id).toBe("T2");

    const result = validateDeck(deck);
    expect(result.isValid).toBe(true);
  });

  it("ADV-62: Fill deck with all Buildings → Validate (Category Constraint)", () => {
    let deck = getEmptyDeck();
    deck.spellcaster = DeckFactory.createSpellcaster();

    for (let i = 0; i < 4; i++) {
      // createBuilding doesn't exist on the factory, use createUnit with Building category
      deck = DeckRules.setSlot(
        deck,
        i,
        DeckFactory.createUnit({
          entity_id: `B${i}`,
          category: EntityCategory.Building as any,
        })
      ).data!;
    }
    deck = DeckRules.setSlot(
      deck,
      4,
      DeckFactory.createTitan({
        entity_id: "T1",
        category: EntityCategory.Titan as any,
      })
    ).data!;

    const result = validateDeck(deck);
    expect(result.isValid).toBe(false);
    // Based on game rules, buildings fill the unit slots but the "no creatures" rule triggers
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("ADV-63: Build deck → Serialize → simulate generic ID corruption (missing cards) → Reconstruct", () => {
    let original = getEmptyDeck();
    original.spellcaster = DeckFactory.createSpellcaster();
    const spell = DeckFactory.createSpell({
      entity_id: "SPELL_1",
      category: EntityCategory.Spell as any,
    });
    original = DeckRules.setSlot(original, 0, spell).data!;

    const serialized = serializeDeck(original);

    // Simulate user editing localStorage JSON directly
    // Let's say SPELL_1 is rotated out of the game, so the lookup pool no longer has it.
    const emptyPool: any[] = [];

    // Reconstruct with an empty pool (the card no longer exists in the DB)
    const reconstructed = reconstructDeck(serialized, emptyPool, emptyPool);

    expect(reconstructed.spellcaster).toBeNull();
    expect(reconstructed.slots[0].unit).toBeNull();
    // It shouldn't crash, just gracefully empty the slots.
  });

  it("ADV-64: Full Lifecycle: Build → Save → Load → Validate → Serialize → Reconstruct → Compare", () => {
    // 1. Build
    let deck = getEmptyDeck();
    deck.name = "My Ultimate Deck";
    const sc = DeckFactory.createSpellcaster();
    deck.spellcaster = sc;
    const unit1 = DeckFactory.createUnit({
      entity_id: "U1",
      category: EntityCategory.Creature as any,
      rank: "I",
    });
    deck = DeckRules.setSlot(deck, 0, unit1).data!;

    const s1 = DeckFactory.createSpell({
      entity_id: "S1",
      category: EntityCategory.Spell as any,
    });
    const s2 = DeckFactory.createSpell({
      entity_id: "S2",
      category: EntityCategory.Spell as any,
    });
    const s3 = DeckFactory.createSpell({
      entity_id: "S3",
      category: EntityCategory.Spell as any,
    });
    deck = DeckRules.setSlot(deck, 1, s1).data!;
    deck = DeckRules.setSlot(deck, 2, s2).data!;
    deck = DeckRules.setSlot(deck, 3, s3).data!;

    const titan = DeckFactory.createTitan({
      entity_id: "T1",
      category: EntityCategory.Titan as any,
    });
    deck = DeckRules.setSlot(deck, 4, titan).data!;

    // 2. Save via Store
    const store = createTestStore(deck);
    store.getState().saveDeck("My Ultimate Deck");
    const savedDeckId = store.getState().savedDecks[0].id!;

    // 3. Emulate app restart by clearing current deck then loading
    store.setState({ currentDeck: getEmptyDeck() });
    store.getState().loadDeck(savedDeckId);

    const loadedDeck = store.getState().currentDeck;

    // 4. Validate
    const valResult = validateDeck(loadedDeck);
    expect(valResult.isValid).toBe(true); // Should now be a totally valid deck

    // 5. Serialize
    const networkPayload = serializeDeck(loadedDeck);

    // 6. Reconstruct
    const dbUnits = [unit1, s1, s2, s3, titan];
    const dbSCs = [sc];
    const networkReconstructed = reconstructDeck(
      networkPayload,
      dbUnits as any,
      dbSCs
    );

    // 7. Compare
    expect(areDecksEqual(loadedDeck, networkReconstructed)).toBe(true);
  });
});
