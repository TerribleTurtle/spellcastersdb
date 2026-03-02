/**
 * Capitalizes the first character of a string.
 *
 * @param str - The input string.
 * @returns The string with its first character uppercased, or `""` if empty.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a snake_case entity ID into a human-readable display name.
 *
 * Special case: `"Unit"` maps to `"Creatures & Buildings"` (the UI label for the combined category).
 *
 * @param id - The raw entity ID string (e.g., `"fire_imp"`).
 * @returns A title-cased, space-separated name (e.g., `"Fire Imp"`).
 */
export function formatEntityName(id: string): string {
  if (!id) return "";
  if (id === "Unit") return "Creatures & Buildings";
  return id
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

const PLURAL_TARGETS: Record<string, string> = {
  Creature: "Creatures",
  Building: "Buildings",
  Spellcaster: "Spellcasters",
  Lifestone: "Lifestones",
  Flying: "Flying",
  Hover: "Hovering",
  Ground: "Ground",
  Ally: "Allies",
  Enemy: "Enemies",
  All: "Everything",
};

/**
 * Converts a target keyword into its plural UI label using the `PLURAL_TARGETS` lookup table.
 * Falls back to `formatEntityName` if no mapping exists.
 *
 * @param target - The raw target keyword (e.g., `"Creature"`, `"Enemy"`).
 * @returns The plural display label (e.g., `"Creatures"`, `"Enemies"`).
 */
export function formatTargetName(target: string): string {
  const formatted = formatEntityName(target);
  return PLURAL_TARGETS[formatted] || formatted;
}
