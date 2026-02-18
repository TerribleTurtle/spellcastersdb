"use client";

/**
 * DiffLine — Shared component for rendering a single field-level diff.
 *
 * Handles:
 * - Human-readable field names (title case, underscore → space)
 * - Smart value formatting (detects ISO timestamps, large numbers, etc.)
 * - Added / Removed / Changed badges
 */

/** Format a field path into a human-readable label. */
function formatFieldName(path: string[], fallback = "value"): string {
  const raw = path.length > 0 ? path.join(" › ") : fallback;
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** ISO 8601 datetime pattern (with time component). */
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Format a diff value for display. Detects timestamps and formats them. */
function formatValue(val: unknown): string {
  if (val == null) return "—";
  const str = String(val);

  // Detect ISO datetime strings and format them locally
  if (ISO_DATETIME_RE.test(str)) {
    try {
      return new Date(str).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return str;
    }
  }

  return str;
}

export interface DiffData {
  path?: string[];
  lhs?: unknown;
  rhs?: unknown;
}

interface DiffLineProps {
  diff: DiffData;
}

export function DiffLine({ diff }: DiffLineProps) {
  const isAdded = diff.lhs == null && diff.rhs != null;
  const isRemoved = diff.rhs == null && diff.lhs != null;

  return (
    <div className="text-[10px] font-mono text-gray-500 flex flex-wrap gap-1 items-center">
      <span className="text-gray-300 font-semibold">
        {formatFieldName(diff.path || [])}:
      </span>
      {isAdded ? (
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 rounded px-1 uppercase font-bold">
            Added
          </span>
          {formatValue(diff.rhs)}
        </span>
      ) : isRemoved ? (
        <span className="text-red-400 flex items-center gap-1">
          <span className="text-[9px] bg-red-500/20 border border-red-500/30 rounded px-1 uppercase font-bold">
            Removed
          </span>
          {formatValue(diff.lhs)}
        </span>
      ) : (
        <span className="text-gray-400">
          {formatValue(diff.lhs)}{" "}
          <span className="text-gray-600">→</span>{" "}
          {formatValue(diff.rhs)}
        </span>
      )}
    </div>
  );
}
