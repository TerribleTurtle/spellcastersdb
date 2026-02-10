"use client";

import { useId } from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

/**
 * A reusable component to inject JSON-LD structured data into the <head>.
 * This helps search engines understand the content of the page.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  const generatedId = useId();
  return (
    <script
      id={id || `json-ld-${generatedId}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
