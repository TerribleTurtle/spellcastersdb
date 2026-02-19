"use client";

import { useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

/**
 * Listens for the Konami Code key sequence and activates the Rainbow theme.
 * ↑↑↓↓←→←→BA
 */
export function useKonamiCode() {
  const { setTheme, theme } = useTheme();

  const handleKeyDown = useCallback(
    (() => {
      let position = 0;

      return (e: KeyboardEvent) => {
        const expected = KONAMI_CODE[position];
        if (e.key === expected) {
          position++;
          if (position === KONAMI_CODE.length) {
            position = 0;
            // Toggle: if already rainbow, go back to dark
            if (theme === "theme-rainbow") {
              setTheme("dark");
            } else {
              setTheme("theme-rainbow");
            }
          }
        } else {
          position = 0;
        }
      };
    })(),
    [setTheme, theme]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
