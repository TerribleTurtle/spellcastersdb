/**
 * Generates a unique name by appending `" (Copy)"` or `" (Copy N)"` suffixes.
 *
 * Algorithm:
 * 1. If `baseName` is not already taken (case-insensitive), return it as-is.
 * 2. Try `"Name (Copy)"`, then `"Name (Copy 2)"`, ..., up to 100 attempts.
 * 3. If all 100 are taken, falls back to a timestamp suffix: `"Name (Copy 1709312345678)"`.
 *
 * @param baseName - The desired name before deduplication (will be trimmed).
 * @param existingNames - The list of names already in use.
 * @returns A name guaranteed to be unique (case-insensitive) within `existingNames`.
 */
export function getUniqueName(
  baseName: string,
  existingNames: string[]
): string {
  const normalizedBase = baseName.trim();
  const lowerBase = normalizedBase.toLowerCase();

  // If the exact name doesn't exist (case-insensitive check), use it
  if (!existingNames.some((n) => n.toLowerCase() === lowerBase)) {
    return normalizedBase;
  }

  // Check for " (Copy)" variations
  // Pattern: Name (Copy) or Name (Copy X)
  let attempt = 0;
  let candidate = "";

  // Safety break after 100 attempts
  while (attempt < 100) {
    if (attempt === 0) {
      candidate = `${normalizedBase} (Copy)`;
    } else {
      candidate = `${normalizedBase} (Copy ${attempt + 1})`;
    }

    if (
      !existingNames.some((n) => n.toLowerCase() === candidate.toLowerCase())
    ) {
      return candidate;
    }
    attempt++;
  }

  // Fallback to timestamp if crowded
  return `${normalizedBase} (Copy ${Date.now()})`;
}
