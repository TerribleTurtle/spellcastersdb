import { describe, expect, it } from "vitest";

import type { AuditEntry } from "@/types/patch-history";

import { mapAuditToChangelog, titleCaseEntity } from "../patch-history";

describe("titleCaseEntity", () => {
  it("formats underscore separated names", () => {
    expect(titleCaseEntity("fire_ball")).toBe("Fire Ball");
    expect(titleCaseEntity("ogre")).toBe("Ogre");
  });

  it("handles hyphens and strips .json", () => {
    expect(titleCaseEntity("astral-monk.json")).toBe("Astral Monk");
  });
});

describe("mapAuditToChangelog", () => {
  it("maps a single edit change correctly", () => {
    const input: AuditEntry[] = [
      {
        commit: "a1b2c3d4e5f6",
        timestamp: "2024-05-10T12:00:00Z",
        author: "Dev",
        message: "Update ogre hp",
        changes: [
          {
            entity_id: "ogre",
            file: "data/units/ogre.json",
            category: "units",
            change_type: "edit",
            diffs: [
              {
                path: ["stats", "hp"],
                old_value: 100,
                new_value: 120,
              },
            ],
          },
        ],
      },
    ];

    const result = mapAuditToChangelog(input);
    expect(result).toHaveLength(1);

    const patch = result[0];
    expect(patch.id).toBe("a1b2c3d4e5f6");
    expect(patch.version).toBe("a1b2c3d");
    expect(patch.type).toBe("Patch");
    expect(patch.title).toBe("Update ogre hp");
    expect(patch.date).toBe("2024-05-10T12:00:00Z");
    expect(patch.tags).toEqual(["Dev"]);

    expect(patch.changes).toHaveLength(1);
    const change = patch.changes[0];
    expect(change.target_id).toBe("data/units/ogre.json");
    expect(change.name).toBe("Ogre");
    expect(change.field).toBe("stats.hp");
    expect(change.change_type).toBe("edit");
    expect(change.category).toBe("units");

    expect(change.diffs).toHaveLength(1);
    expect(change.diffs![0]).toEqual({
      path: ["stats", "hp"],
      lhs: 100,
      rhs: 120,
    });
  });

  it("maps multiple diffs to 'multiple fields' field label", () => {
    const input: AuditEntry[] = [
      {
        commit: "abc1234",
        timestamp: "2024-05-10T12:00:00Z",
        author: "Dev",
        message: "Big update",
        changes: [
          {
            entity_id: "dragon",
            file: "data/units/dragon.json",
            category: "units",
            change_type: "edit",
            diffs: [
              { path: ["stats", "hp"], old_value: 100, new_value: 120 },
              { path: ["stats", "attack"], old_value: 10, new_value: 15 },
            ],
          },
        ],
      },
    ];

    const result = mapAuditToChangelog(input);
    expect(result[0].changes[0].field).toBe("multiple fields");
  });

  it("maps add and delete changes to 'entity' field label", () => {
    const input: AuditEntry[] = [
      {
        commit: "abc",
        timestamp: "2024",
        author: "Dev",
        message: "Add/Del",
        changes: [
          {
            entity_id: "new_spell",
            file: "data/spells/new_spell.json",
            category: "spells",
            change_type: "add",
            diffs: [{ path: ["name"], new_value: "New Spell" }],
          },
          {
            entity_id: "old_spell",
            file: "data/spells/old_spell.json",
            category: "spells",
            change_type: "delete",
            diffs: [{ path: ["id"], old_value: "old_spell" }],
          },
        ],
      },
    ];

    const result = mapAuditToChangelog(input);
    expect(result[0].changes[0].field).toBe("entity");
    expect(result[0].changes[0].change_type).toBe("add");
    expect(result[0].changes[1].field).toBe("entity");
    expect(result[0].changes[1].change_type).toBe("delete");
  });

  it("maps rename to edit", () => {
    const input: AuditEntry[] = [
      {
        commit: "abc",
        timestamp: "2024",
        author: "Dev",
        message: "Rename",
        changes: [
          {
            entity_id: "spell",
            file: "data/spells/spell.json",
            category: "spells",
            change_type: "rename",
            diffs: [],
          },
        ],
      },
    ];

    const result = mapAuditToChangelog(input);
    expect(result[0].changes[0].change_type).toBe("edit");
    expect(result[0].changes[0].field).toBe("entity");
  });
});
