"use client";

import { useEffect, useState } from "react";

/**
 * Renders a date string in the viewer's locale format (client-side only).
 *
 * Handles date-only strings (e.g. "2026-02-18") by parsing them as local dates
 * (year, month, day) to prevent `new Date(iso)` from interpreting them as UTC
 * midnight effectively shifting the date back one day in Western timezones.
 */
export function LocalDate({
  iso,
  showTime = false,
}: {
  iso: string;
  showTime?: boolean;
}) {
  const [display, setDisplay] = useState(iso);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: hydration-safe locale formatting */
    try {
      if (showTime) {
        // If it's a full ISO string (has T and time info), use full locale string
        if (iso.includes("T") && iso.length > 10) {
          const d = new Date(iso);
          setDisplay(
            d.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          );
        } else {
          // It's just a date
          const datePart = iso.split("T")[0];
          const [year, month, day] = datePart.split("-").map(Number);
          const d = new Date(year, month - 1, day);
          setDisplay(d.toLocaleDateString(undefined, { dateStyle: "medium" }));
        }
      } else {
        // Dates are date-only strings (e.g. "2026-02-18") or full ISO strings.
        // We extract just the YYYY-MM-DD part to prevent "UTC midnight" shifting
        // and parse it locally.
        const datePart = iso.split("T")[0]; // "2026-02-18"
        const [year, month, day] = datePart.split("-").map(Number);
        const d = new Date(year, month - 1, day);

        setDisplay(d.toLocaleDateString(undefined, { dateStyle: "medium" }));
      }
    } catch {
      setDisplay(iso);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [iso, showTime]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {display}
    </time>
  );
}
