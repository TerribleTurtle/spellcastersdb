import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

export function useViewMode(defaultMode: ViewMode = "grid") {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 768px)").matches
        ? "list"
        : defaultMode;
    }
    return defaultMode;
  });

  useEffect(() => {
    // Ensure we are client-side
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");

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
