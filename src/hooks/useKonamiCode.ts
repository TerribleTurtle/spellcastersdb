"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "next-themes";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Listens for the Konami Code key sequence and activates the Rainbow theme.
 * ↑↑↓↓←→←→BA
 *
 * Uses a ref for keystroke position so re-renders don't reset progress,
 * and reads the current theme from the ref to avoid stale closures.
 */
export function useKonamiCode() {
  const { setTheme, theme } = useTheme();
  const positionRef = useRef(0);
  const themeRef = useRef(theme);

  // Keep themeRef in sync so the keydown handler always has the latest value
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI_CODE[positionRef.current];

      if (e.key === expected) {
        positionRef.current++;

        if (positionRef.current === KONAMI_CODE.length) {
          positionRef.current = 0;
          const currentTheme = themeRef.current;

          // Toggle: if already rainbow, restore previous theme
          if (currentTheme === "theme-rainbow") {
            const prev = localStorage.getItem("sp-prev-theme") || "dark";
            setTheme(prev);
          } else {
            localStorage.setItem("sp-prev-theme", currentTheme ?? "dark");
            setTheme("theme-rainbow");
          }
        }
      } else {
        // Allow the first key of the sequence to restart without needing
        // a "miss" keystroke first (e.g. ArrowUp resets AND counts)
        positionRef.current = e.key === KONAMI_CODE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTheme]); // setTheme is stable from next-themes, so this runs once
}
