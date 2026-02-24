import { useEffect, useState } from "react";

import { MEDIA_QUERIES } from "@/services/config/breakpoints";

type ViewMode = "grid" | "list";

export function useViewMode(defaultMode: ViewMode = "grid") {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(MEDIA_QUERIES.mdDown).matches
        ? "list"
        : defaultMode;
    }
    return defaultMode;
  });

  useEffect(() => {
    // Ensure we are client-side
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(MEDIA_QUERIES.mdDown);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setViewMode("list");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return { viewMode, setViewMode };
}
