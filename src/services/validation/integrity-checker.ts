import { AllDataResponse } from "@/types/api";

export interface IntegrityIssue {
    severity: "warning" | "error";
    message: string;
    path: string;
}

export function validateIntegrity(data: AllDataResponse): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    const unitIds = new Set(data.units.map((u) => u.entity_id));

    
    // 1. Validate Entity ID Uniqueness (Global Check mostly, or per category)
    // We check duplicates within categories for now.
    const checkDuplicates = (ids: string[], category: string) => {
        const seen = new Set<string>();
        for (const id of ids) {
            if (seen.has(id)) {
                issues.push({
                    severity: "error",
                    message: `Duplicate Entity ID found: ${id}`,
                    path: `duplicate_check.${category}`,
                });
            }
            seen.add(id);
        }
    };

    checkDuplicates(data.units.map(u => u.entity_id), "units");
    checkDuplicates(data.spellcasters.map(s => s.entity_id), "spellcasters");
    checkDuplicates(data.upgrades.map(u => u.entity_id || ""), "upgrades"); // Handle optional? Schema says entity_id is required after transform.

    // 2. Validate Spawners (Unit -> Unit)
    // Both Units and Spells can have spawners.
    const checkSpawners = (entity: { entity_id: string; mechanics?: { spawner?: { unit_id: string }[] } }, sourceCategory: string) => {
        const spawners = entity.mechanics?.spawner;
        if (spawners) {
            for (const spawner of spawners) {
                if (!unitIds.has(spawner.unit_id)) {
                     issues.push({
                        severity: "warning",
                        message: `Entity ${entity.entity_id} (${sourceCategory}) spawns unknown unit_id: ${spawner.unit_id}`,
                        path: `${entity.entity_id}.mechanics.spawner`,
                    });
                }
            }
        }
    };

    data.units.forEach(u => checkSpawners(u, "unit"));
    data.spells.forEach(s => checkSpawners(s, "spell"));

    // 3. Validate Spellcaster ID mapping (Self-reference check if needed, mostly handled by transform)
    data.spellcasters.forEach(s => {
        if (s.spellcaster_id !== s.entity_id) {
             // This isn't necessarily an error, just a data consistency check if we expected them to be same.
             // Schema transform ensures they match if one is missing, but if both exist and differ, might be weird.
             // Let's rely on schema transform for now.
        }
    });

    return issues;
}
