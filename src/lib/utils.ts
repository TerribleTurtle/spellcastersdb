import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges and deduplicates Tailwind CSS class names using `clsx` and `tailwind-merge`.
 *
 * @param inputs - Any number of class values (strings, arrays, objects, or conditionals).
 * @returns A single, deduplicated class name string.
 *
 * @example
 * ```ts
 * cn("px-4 py-2", "px-6")           // "px-6 py-2" (tailwind-merge resolves conflict)
 * cn("text-red-500", isActive && "font-bold") // conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
