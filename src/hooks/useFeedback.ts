"use client";

import { useCallback } from "react";

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: Record<string, unknown>) => void;
    };
  }
}

export function useFeedback() {
  const openFeedback = useCallback(() => {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";

    if (typeof window !== "undefined" && window.Tally) {
      window.Tally.openPopup("Bz7MdK", {
        layout: "modal",
        width: 700,
        emoji: {
          text: "👋",
          animation: "wave",
        },
        hiddenFields: {
          deck_url: currentUrl,
        },
      });
    } else {
      // Fallback if script hasn't loaded yet or fails
      window.open(
        `https://tally.so/r/Bz7MdK?deck_url=${encodeURIComponent(currentUrl)}`,
        "_blank"
      );
    }
  }, []);

  return { openFeedback };
}
