import { useEffect } from "react";

/**
 * Mobile Scroll Lock:
 * When dragging on mobile, we must prevent the default touchmove behavior (scrolling)
 * on the document, otherwise the unit list will scroll instead of the card moving.
 */
export function useScrollLock(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    // Prevent momentum scrolling
    document.body.style.overflow = "hidden";

    const preventDefault = (e: TouchEvent) => {
      // Only prevent if the event is cancelable (standard practice)
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // { passive: false } is required to allow preventDefault inside a touch handler
    document.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.body.style.overflow = ""; // Restore
      document.removeEventListener("touchmove", preventDefault);
    };
  }, [isActive]);
}
