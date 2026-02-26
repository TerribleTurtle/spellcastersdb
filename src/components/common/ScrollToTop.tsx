"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Floating action button that appears when the user scrolls past
 * a sentinel element. Uses IntersectionObserver for performance.
 */
export function ScrollToTop() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show button when sentinel is NOT intersecting (scrolled past)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Sentinel — placed at the top of the component's mount point */}
      <div ref={sentinelRef} aria-hidden="true" className="h-0 w-0" />

      {/* FAB */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        data-testid="scroll-to-top"
        className={cn(
          "scroll-to-top-fab fixed bottom-6 right-6 z-40 p-3 rounded-full",
          "bg-brand-primary text-white shadow-lg shadow-brand-primary/25",
          "hover:bg-brand-primary/90 hover:scale-110",
          "transition-all duration-300 print:hidden",
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}
