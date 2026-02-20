/**
 * Utility for formatting changelog diff paths into human-readable labels.
 *
 * Pure string manipulation — no entity data needed.
 * Converts raw paths like ["abilities", "passive", "0", "description"]
 * into "Passive[0] › Description".
 */

// ============================================================================
// Path Formatting
// ============================================================================

/**
 * Title-case a snake_case or lowercase string.
 * "description" → "Description", "attack_interval" → "Attack Interval"
 */
function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format a diff path into a human-readable label.
 *
 * - Strips the leading "abilities" segment (redundant context)
 * - Attaches numeric indices to the preceding segment: passive[0]
 * - Title-cases remaining segments
 *
 * @example
 * ["abilities", "passive", "0", "description"]  → "Passive[0] › Description"
 * ["mechanics", "aura", "0", "radius"]          → "Mechanics › Aura[0] › Radius"
 * ["health"]                                     → "Health"
 */
export function formatDiffPath(path: string[]): string {
  if (path.length === 0) return "Value";

  // Convert everything to strings (deep-diff may include numbers)
  let segments = path.map(String);

  // Strip leading "abilities" — it's implied context on ability changes
  if (segments.length >= 2 && segments[0].toLowerCase() === "abilities") {
    segments = segments.slice(1);
  }

  // Merge numeric indices into the preceding segment: ["passive", "0"] → ["passive[0]"]
  const merged: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    if (/^\d+$/.test(segments[i]) && merged.length > 0) {
      merged[merged.length - 1] += `[${segments[i]}]`;
    } else {
      merged.push(segments[i]);
    }
  }

  return merged.map(titleCase).join(" › ") || "Value";
}

/**
 * Format a `ChangeEntry.field` string into a human-readable label.
 * Returns empty string for "entity" fields (no extra label needed).
 */
export function formatChangeField(field: string): string {
  if (!field || field === "entity") return "";

  // Split on " > " delimiters (from changelog data) or underscores
  const parts = field.includes(" > ")
    ? field.split(" > ").map((p) => p.trim())
    : field.split("_");

  return formatDiffPath(parts);
}
