"use client";

import { useEffect, useState } from "react";

/** 
 * Renders a date string in the viewer's locale format (client-side only). 
 * 
 * Handles date-only strings (e.g. "2026-02-18") by parsing them as local dates
 * (year, month, day) to prevent `new Date(iso)` from interpreting them as UTC 
 * midnight effectively shifting the date back one day in Western timezones.
 */
export function LocalDate({ iso, showTime = false }: { iso: string; showTime?: boolean }) {
  const [display, setDisplay] = useState(iso);

  useEffect(() => {
    try {
      if (showTime) {
        // For full timestamps (ISO 8601 with time), standard parsing works fine
        // and converts to local time correctly.
        setDisplay(
            new Date(iso).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "long",
            })
        );
      } else {
        // Dates are date-only strings (e.g. "2026-02-18"), so we parse them
        // as local dates and format with the viewer's locale — no time component.
        // This prevents the "UTC midnight" shift problem.
        const [year, month, day] = iso.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplay(d.toLocaleDateString(undefined, { dateStyle: "medium" }));
      }
    } catch {
      setDisplay(iso);
    }
  }, [iso, showTime]);

  return <time dateTime={iso} suppressHydrationWarning>{display}</time>;
}
