/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import { validateDeck } from "@/services/validation/deck-validation";
import { UnitSchema } from "@/services/validation/data-schemas";
import { EntityCategory } from "@/types/enums";
import { BackupService } from "@/services/domain/BackupService";

describe("Logic Hardening (Torture Tests)", () => {

    describe("Schema Violence: Invalid Unit Data", () => {
        it("should reject units with negative health", () => {
            const badUnit = {
                entity_id: "u1",
                name: "Negative Health Man",
                category: EntityCategory.Creature,
                health: -100, // VIOLATION
                movement_speed: 10,
                magic_school: "Wild",
                tags: []
            };
            const result = UnitSchema.safeParse(badUnit);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Ensure specifically health error or validation failure
                expect(result.error).toBeDefined();
            }
        });

        it("should reject units with empty names", () => {
             const badUnit = {
                entity_id: "u2",
                name: "", // VIOLATION
                category: EntityCategory.Creature,
                health: 100,
                movement_speed: 10,
                magic_school: "Wild",
                tags: []
            };
            const result = UnitSchema.safeParse(badUnit);
            expect(result.success).toBe(false);
        });

        it("should reject units with dangerous number (NaN)", () => {
             const badUnit = {
                entity_id: "u3",
                name: "NaN Man",
                category: EntityCategory.Creature,
                health: NaN, // Invalid number
                movement_speed: 10,
                magic_school: "Wild",
                tags: []
            };
            const result = UnitSchema.safeParse(badUnit);
            expect(result.success).toBe(false); 
        });
    });

    describe("Deck Validation Torture", () => {
        it("should handle a deck with NULL slots gracefully", () => {
            const badDeck: any = {
                id: "d1",
                name: "Null Slots",
                slots: null // VIOLATION: Should be array
            };
            // validateDeck should return isValid: false, NOT throw
            try {
                const { isValid, errors } = validateDeck(badDeck);
                expect(isValid).toBe(false);
                expect(errors.length).toBeGreaterThan(0);
            } catch (e) {
                expect.fail("validateDeck threw an error on null slots: " + e);
            }
        });

        it("should handle a deck with 0 slots", () => {
             const badDeck: any = {
                id: "d2",
                name: "Empty Slots Array",
                spellcaster: { name: "Mage" },
                slots: [] // VIOLATION
            };
             const { isValid, errors } = validateDeck(badDeck);
             expect(isValid).toBe(false);
             // Errors should mention slot 4 or missing slots
        });
    });

    describe("Data Volume & Backup", () => {
         it("should validate a massive backup file (1000 items) without crashing", () => {
             const hugeBackup = {
                 version: 1,
                 timestamp: new Date().toISOString(),
                 decks: Array.from({ length: 1000 }, (_, i) => ({
                     id: `deck_${i}`,
                     name: `Massive Deck ${i}`,
                     slots: []
                 })),
                 teams: []
             };

             const isValid = BackupService.validateBackup(hugeBackup);
             expect(isValid).toBe(true);
         });
    });

    describe("Rule Violations", () => {
         it("should detect duplicate Titans", () => {
             // Exploratory: validates that putting a Titan in a unit slot (index 0)
             // alongside one in the Titan slot (index 4) produces an invalid deck.
             
             const titanUnit = { 
                 entity_id: "t1", name: "Titan", category: EntityCategory.Titan, 
                 health: 1, movement_speed: 1, magic_school: "Wild", tags: [] 
             } as any;
             
             const badDeck: any = {
                 id: "d_titan",
                 name: "Double Titan",
                 slots: [
                     { index: 0, unit: titanUnit },
                     { index: 4, unit: titanUnit }
                 ]
             };
             
             const { isValid, errors } = validateDeck(badDeck);
             expect(isValid).toBe(false);
         });
    });

});
