import { useState, useLayoutEffect, useEffect } from "react";

// SSR-safe useLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useResponsiveGrid(defaultColumns = 4) {
  const [columns, setColumns] = useState(defaultColumns);
  const [isReady, setIsReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      let newCols = defaultColumns;
      if (width >= 1280) newCols = 6; // xl - Fewer columns = Bigger cards
      else if (width >= 1024) newCols = 5; // lg
      else if (width >= 768) newCols = 4; // md
      else newCols = 4; // mobile (increased density as requested)

      setColumns(newCols);
      setIsReady(true);
    };

    handleResize(); // Init immediately
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { columns, isReady };
}
