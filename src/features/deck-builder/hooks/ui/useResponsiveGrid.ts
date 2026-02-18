import { useState, useCallback, useRef } from "react";

/**
 * Measures the actual container width via ResizeObserver and calculates
 * columns based on a minimum card width. This is more accurate than
 * window.innerWidth because the browser panel is constrained by the
 * site shell, sidebar, and inspector panel.
 */
const MIN_CARD_WIDTH = 140; // px — minimum width before reducing columns
const MAX_COLUMNS = 8;
const MIN_COLUMNS = 2;

export function useResponsiveGrid(defaultColumns = 4) {
  const [columns, setColumns] = useState(defaultColumns);
  const [isReady, setIsReady] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const containerRef = useCallback((node: HTMLElement | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const computeColumns = (width: number) => {
      // Account for padding (px-4 = 16px each side = 32px total)
      const availableWidth = width - 32;
      const cols = Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, Math.floor(availableWidth / MIN_CARD_WIDTH)));
      setColumns(cols);
      setIsReady(true);
    };

    // Observe the actual container element
    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        computeColumns(entry.contentRect.width);
      }
    });

    observerRef.current.observe(node);

    // Compute immediately
    computeColumns(node.getBoundingClientRect().width);
  }, []);

  return { columns, isReady, containerRef };
}
