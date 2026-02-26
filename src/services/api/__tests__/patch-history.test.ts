import { describe, expect, it } from "vitest";

import type { AuditEntry } from "@/types/patch-history";

import {
  filterChangelogForEntity,
  mapAuditToChangelog,
  mapStatChangesToChangelog,
  titleCaseEntity,
} from "../patch-history";

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
    expect(result[0].changes[0].field).toBe("entity");
  });
});

describe("filterChangelogForEntity", () => {
  const dummyChangelog = [
    {
      id: "patch1",
      version: "1.0",
      type: "Patch" as const,
      title: "Patch 1",
      date: "2024",
      tags: [],
      changes: [
        {
          target_id: "ogre.json",
          name: "Ogre",
          field: "stats.hp",
          change_type: "edit" as const,
          category: "units",
          diffs: [],
        },
        {
          target_id: "data/units/dragon.json",
          name: "Dragon",
          field: "stats.damage",
          change_type: "edit" as const,
          category: "units",
          diffs: [],
        },
      ],
    },
  ];

  it("filters by exact filename match", () => {
    const result = filterChangelogForEntity(dummyChangelog, "ogre");
    expect(result).toHaveLength(1);
    expect(result[0].changes).toHaveLength(1);
    expect(result[0].changes[0].target_id).toBe("ogre.json");
  });

  it("filters by path suffix match", () => {
    const result = filterChangelogForEntity(dummyChangelog, "dragon");
    expect(result).toHaveLength(1);
    expect(result[0].changes).toHaveLength(1);
    expect(result[0].changes[0].name).toBe("Dragon");
  });

  it("returns empty if no match found", () => {
    const result = filterChangelogForEntity(dummyChangelog, "goblin");
    expect(result).toHaveLength(0);
  });
});

describe("mapStatChangesToChangelog", () => {
  it("maps a single-field entry", () => {
    const changes = [
      {
        version: "1.1.0",
        date: "2024-05-10T12:00:00Z",
        changes: [{ field: "health", old: 100, new: 120 }],
      },
    ];

    const result = mapStatChangesToChangelog(changes, "ogre", "Ogre");
    expect(result).toHaveLength(1);
    expect(result[0].version).toBe("1.1.0");
    expect(result[0].changes[0].field).toBe("health");
    expect(result[0].changes[0].diffs).toHaveLength(1);
  });

  it("maps a multi-field entry to 'multiple fields' label", () => {
    const changes = [
      {
        version: "1.1.0",
        date: "2024-05-10T12:00:00Z",
        changes: [
          { field: "health", old: 100, new: 120 },
          { field: "damage", old: 10, new: 15 },
        ],
      },
    ];

    const result = mapStatChangesToChangelog(changes, "ogre", "Ogre");
    expect(result[0].changes[0].field).toBe("multiple fields");
  });

  it("titles version 0.0.1 as 'Initial Release'", () => {
    const changes = [
      {
        version: "0.0.1",
        date: "2024-01-01T12:00:00Z",
        changes: [{ field: "added", old: null, new: "yes" }],
      },
    ];

    const result = mapStatChangesToChangelog(changes, "ogre", "Ogre");
    expect(result[0].title).toBe("Initial Release");
  });

  it("merges multiple entries of the same version", () => {
    const changes = [
      {
        version: "1.2.0",
        date: "2024-06-01T12:00:00Z",
        changes: [{ field: "health", old: 100, new: 110 }],
      },
      {
        version: "1.2.0", // Same version
        date: "2024-06-01T12:00:00Z",
        changes: [{ field: "damage", old: 20, new: 25 }],
      },
    ];

    const result = mapStatChangesToChangelog(changes, "ogre", "Ogre");
    expect(result).toHaveLength(1);
    expect(result[0].changes[0].diffs).toHaveLength(2); // Merged into one group
    expect(result[0].changes[0].field).toBe("multiple fields"); // Because >1 diff now
  });

  it("sorts newest date first, tie-breaking on version number", () => {
    const changes = [
      {
        version: "1.0.0",
        date: "2024-01-01T12:00:00Z",
        changes: [{ field: "health", old: 10, new: 20 }],
      },
      {
        version: "1.1.0",
        date: "2024-02-01T12:00:00Z", // Newer date
        changes: [{ field: "health", old: 20, new: 30 }],
      },
      {
        version: "1.1.2",
        date: "2024-02-01T12:00:00Z", // Same date, newer version
        changes: [{ field: "health", old: 30, new: 40 }],
      },
      {
        version: "1.1.10",
        date: "2024-02-01T12:00:00Z", // Same date, newest version
        changes: [{ field: "health", old: 40, new: 50 }],
      },
    ];

    const result = mapStatChangesToChangelog(changes, "ogre", "Ogre");
    expect(result).toHaveLength(4);
    // Should sort newest first based on date then version
    expect(result[0].version).toBe("1.1.10");
    expect(result[1].version).toBe("1.1.2");
    expect(result[2].version).toBe("1.1.0");
    expect(result[3].version).toBe("1.0.0");
  });
});
