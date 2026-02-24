"use client";

/**
 * DiffLine — Renders a single field-level diff with word-level highlighting.
 *
 * For text changes, highlights exactly which words changed:
 * - Removed words in red with strikethrough
 * - Added words in green
 * - Unchanged words in gray
 */
import { ReactNode } from "react";

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

function formatValue(val: unknown): ReactNode {
  if (val == null) return "—";

  if (typeof val === "object") {
    try {
      return (
        <pre className="bg-surface-dim p-2 rounded border border-border-default text-[10px] mt-1 mb-1 whitespace-pre-wrap break-all w-full leading-snug">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    } catch {
      return String(val);
    }
  }

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

/** True if either side of the diff is a complex object (not a scalar). */
function hasComplexValue(lhs: unknown, rhs: unknown): boolean {
  return (
    (lhs != null && typeof lhs === "object") ||
    (rhs != null && typeof rhs === "object")
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
  const complex = hasComplexValue(diff.lhs, diff.rhs);

  return (
    <div
      className={
        complex
          ? "text-[11px] font-mono text-text-dimmed flex flex-col items-start gap-1 py-1 w-full border-b border-border-subtle/30 last:border-0"
          : "text-[11px] font-mono text-text-dimmed flex flex-wrap gap-1.5 items-baseline leading-relaxed py-0.5"
      }
    >
      <span className="text-text-secondary font-semibold shrink-0">
        {label}:
      </span>

      {isAdded ? (
        <span
          className={
            complex
              ? "text-emerald-400 flex flex-col items-start gap-1 min-w-0 w-full"
              : "text-emerald-400 flex items-center gap-1"
          }
        >
          <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 rounded px-1 uppercase font-bold shrink-0">
            Added
          </span>
          <span className="break-all">{formatValue(diff.rhs)}</span>
        </span>
      ) : isRemoved ? (
        <span
          className={
            complex
              ? "text-status-danger-text flex flex-col items-start gap-1 min-w-0 w-full"
              : "text-status-danger-text flex items-center gap-1"
          }
        >
          <span className="text-[9px] bg-status-danger-border border border-red-500/30 rounded px-1 uppercase font-bold shrink-0">
            Removed
          </span>
          <span className="break-all">{formatValue(diff.lhs)}</span>
        </span>
      ) : isTextChange ? (
        <span className="text-text-muted wrap-break-word leading-relaxed flex-1 w-full">
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
      ) : complex ? (
        <span className="text-text-muted min-w-0 flex flex-col items-start gap-1 w-full">
          <span className="break-all w-full">{formatValue(diff.lhs)}</span>
          <span className="text-text-faint shrink-0">→</span>
          <span className="break-all w-full">{formatValue(diff.rhs)}</span>
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
