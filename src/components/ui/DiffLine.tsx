"use client";

/**
 * DiffLine — Renders a single field-level diff with word-level highlighting.
 *
 * For text changes, highlights exactly which words changed:
 * - Removed words in red with strikethrough
 * - Added words in green
 * - Unchanged words in gray
 */
import { formatDiffPath } from "@/lib/format-change-field";

// ============================================================================
// Word-Level Diff
// ============================================================================

type DiffSegment = { text: string; type: "same" | "added" | "removed" };

/**
 * Compute a simple word-level diff between two strings.
 * Finds common prefix/suffix words, highlights changed middle.
 */
function wordDiff(oldStr: string, newStr: string): DiffSegment[] {
  const oldWords = oldStr.split(/(\s+)/); // preserve whitespace
  const newWords = newStr.split(/(\s+)/);

  // Find common prefix
  let pre = 0;
  while (
    pre < oldWords.length &&
    pre < newWords.length &&
    oldWords[pre] === newWords[pre]
  ) {
    pre++;
  }

  // Find common suffix (from end, not overlapping prefix)
  let suf = 0;
  while (
    suf < oldWords.length - pre &&
    suf < newWords.length - pre &&
    oldWords[oldWords.length - 1 - suf] === newWords[newWords.length - 1 - suf]
  ) {
    suf++;
  }

  const segments: DiffSegment[] = [];

  if (pre > 0) {
    segments.push({ text: oldWords.slice(0, pre).join(""), type: "same" });
  }

  const removedMiddle = oldWords.slice(pre, oldWords.length - suf);
  if (removedMiddle.length > 0) {
    segments.push({ text: removedMiddle.join(""), type: "removed" });
  }

  const addedMiddle = newWords.slice(pre, newWords.length - suf);
  if (addedMiddle.length > 0) {
    segments.push({ text: addedMiddle.join(""), type: "added" });
  }

  if (suf > 0) {
    segments.push({
      text: oldWords.slice(oldWords.length - suf).join(""),
      type: "same",
    });
  }

  return segments;
}

// ============================================================================
// Value Formatting
// ============================================================================

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function formatValue(val: unknown): string {
  if (val == null) return "—";
  const str = String(val);
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

function isStringish(val: unknown): val is string {
  return typeof val === "string" && val.length > 0;
}

/** True if both values are ISO timestamps — skip word diff, use formatted dates. */
function areBothTimestamps(a: unknown, b: unknown): boolean {
  return (
    isStringish(a) &&
    isStringish(b) &&
    ISO_DATETIME_RE.test(a) &&
    ISO_DATETIME_RE.test(b)
  );
}

// ============================================================================
// Component
// ============================================================================

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
  const isTextChange =
    !isAdded &&
    !isRemoved &&
    isStringish(diff.lhs) &&
    isStringish(diff.rhs) &&
    !areBothTimestamps(diff.lhs, diff.rhs);
  const label = formatDiffPath(diff.path || []);

  return (
    <div className="text-[11px] font-mono text-text-dimmed flex flex-wrap gap-1.5 items-baseline leading-relaxed py-0.5">
      <span className="text-text-secondary font-semibold shrink-0">
        {label}:
      </span>

      {isAdded ? (
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 rounded px-1 uppercase font-bold">
            Added
          </span>
          {formatValue(diff.rhs)}
        </span>
      ) : isRemoved ? (
        <span className="text-status-danger-text flex items-center gap-1">
          <span className="text-[9px] bg-status-danger-border border border-red-500/30 rounded px-1 uppercase font-bold">
            Removed
          </span>
          {formatValue(diff.lhs)}
        </span>
      ) : isTextChange ? (
        <span className="text-text-muted inline">
          {wordDiff(diff.lhs as string, diff.rhs as string).map((seg, i) =>
            seg.type === "same" ? (
              <span key={i} className="text-text-secondary">
                {seg.text}
              </span>
            ) : seg.type === "removed" ? (
              <span
                key={i}
                className="text-status-danger-text bg-red-500/15 rounded-sm px-0.5 line-through decoration-red-400/60"
              >
                {seg.text}
              </span>
            ) : (
              <span
                key={i}
                className="text-emerald-400 bg-emerald-500/15 rounded-sm px-0.5"
              >
                {seg.text}
              </span>
            )
          )}
        </span>
      ) : (
        <span className="text-text-muted">
          {formatValue(diff.lhs)} <span className="text-text-faint">→</span>{" "}
          {formatValue(diff.rhs)}
        </span>
      )}
    </div>
  );
}
