import { useState, useEffect } from "react";

export function useResponsiveGrid(defaultColumns = 3) {
  const [columns, setColumns] = useState(defaultColumns);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(6); // xl - Fewer columns = Bigger cards
      else if (width >= 1024) setColumns(5); // lg
      else if (width >= 768) setColumns(4); // md
      else setColumns(4); // mobile (increased density as requested)
    };

    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}
