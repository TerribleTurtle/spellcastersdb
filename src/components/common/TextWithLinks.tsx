import React, { useMemo } from "react";

import Link from "next/link";

import { useDictionary } from "@/components/providers/DictionaryProvider";
import { cn } from "@/lib/utils";

interface TextWithLinksProps {
  /** The raw text to process and interlink */
  text: string;
  /** Max number of links to render in a single block (prevents hyperlink farm aesthetic) */
  maxLinks?: number;
  /** Keys to explicitly ignore (e.g. the name of the entity currently being viewed) */
  excludeKeys?: string[];
  /** Wrapper paragraph styling */
  className?: string;
  /** Styling for the generated <a> tags */
  linkClassName?: string;
}

interface MatchInterval {
  start: number;
  end: number;
  keyword: string;
  href: string;
}

/**
 * Escapes a string so it can be safely used inside a RegExp constructor.
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TextWithLinks({
  text,
  maxLinks = 5,
  excludeKeys = [],
  className,
  linkClassName,
}: TextWithLinksProps) {
  const dictionary = useDictionary();
  const elements = useMemo(() => {
    if (!text || !dictionary || Object.keys(dictionary).length === 0) {
      return [text];
    }

    // 1. Prepare valid keys: filter exclusions, sort by length descending
    // to prevent substring hijacking (e.g. "Fire Infusion" matching "Fire" first)
    const validKeys = Object.keys(dictionary)
      .filter((key) => !excludeKeys.includes(key))
      .sort((a, b) => b.length - a.length);

    const matches: MatchInterval[] = [];
    const matchedKeys = new Set<string>();

    // 2. Find first occurrences of keywords
    for (const key of validKeys) {
      if (matches.length >= maxLinks) break;

      // Ensure we only link the first occurrence of a specific keyword per text block
      const lowerKey = key.toLowerCase();
      if (matchedKeys.has(lowerKey)) continue;

      // Use RegExp with word boundaries (\b).
      // Note: \b doesn't work well if key has trailing/leading punctuation,
      // but our game terms are strictly alphanumeric.
      const regex = new RegExp(`\\b${escapeRegExp(key)}\\b`, "id");

      const match = regex.exec(text);
      if (match && match.indices) {
        // Need to check if this match overlaps with an already found *longer* match.
        // E.g. If "Fire Infusion" was found from 0-13, and now "Fire" is found from 0-4, we skip "Fire"
        const start = match.index;
        const end = start + key.length;

        const isOverlapping = matches.some(
          (m) =>
            (start >= m.start && start < m.end) ||
            (end > m.start && end <= m.end)
        );

        if (!isOverlapping) {
          matches.push({
            start,
            end,
            keyword: text.substring(start, end), // Preserve original casing of the text
            href: dictionary[key],
          });
          matchedKeys.add(lowerKey);
        }
      }
    }

    if (matches.length === 0) {
      return [text];
    }

    // 3. Sort matches by position to slice the string sequentially
    matches.sort((a, b) => a.start - b.start);

    // 4. Interleave text strings and React node Links
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Text before the link
      if (match.start > lastIndex) {
        result.push(text.substring(lastIndex, match.start));
      }

      // The Link itself
      result.push(
        <Link
          key={`${match.keyword}-${match.start}-${i}`}
          href={match.href}
          className={cn(
            "text-brand-primary underline decoration-dotted underline-offset-2 decoration-brand-primary/50 hover:decoration-brand-primary transition-colors",
            linkClassName
          )}
        >
          {match.keyword}
        </Link>
      );

      lastIndex = match.end;
    });

    // Remaining text after the last link
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result;
  }, [text, dictionary, maxLinks, excludeKeys, linkClassName]);

  return <p className={className}>{elements}</p>;
}
