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
