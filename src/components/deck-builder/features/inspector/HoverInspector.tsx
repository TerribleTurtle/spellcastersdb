import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDeckStore } from "@/store/index";
import { InspectorContent } from "./InspectorContent";
import { cn } from "@/lib/utils";

export function HoverInspector() {
  // We now use the main inspector flow, but render it in a portal for Desktop "Context Menu" style
  // Mobile uses CardInspectorModal. Desktop uses this.
  
  const inspectorOpen = useDeckStore((state) => state.inspectorOpen);
  const inspectedCard = useDeckStore((state) => state.inspectedCard);
  const inspectorPosition = useDeckStore((state) => state.inspectorPosition);
  const closeInspector = useDeckStore((state) => state.closeInspector);

  const [mounted, setMounted] = useState(false);
  const inspectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  // Click Outside Listener
  useEffect(() => {
    if (!inspectorOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (inspectorRef.current && !inspectorRef.current.contains(event.target as Node)) {
        closeInspector();
      }
    };

    // Use mousedown to catch clicks before they might trigger other things
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inspectorOpen, closeInspector]);

  // Only render if we have an active card AND a position (implies desktop click)
  if (!mounted || !inspectorOpen || !inspectedCard) return null;

  // Calculate position with clamping
  const INSPECTOR_WIDTH = 360;
  const INSPECTOR_HEIGHT = 600; // Estimated height
  const PADDING = 20;

  let left = inspectorPosition ? inspectorPosition.x + 20 : window.innerWidth / 2;
  let top = inspectorPosition ? inspectorPosition.y - 100 : window.innerHeight / 2; // Default: start slightly above cursor

  // Clamp Horizontal
  if (left + INSPECTOR_WIDTH > window.innerWidth - PADDING) {
      // Flip to left side if no space on right
      left = inspectorPosition ? inspectorPosition.x - INSPECTOR_WIDTH - 20 : window.innerWidth - INSPECTOR_WIDTH - PADDING;
  }
  if (left < PADDING) left = PADDING;

  // Vertical Logic: Flip Upwards if not enough space below
  // We check if the default top position + height would overflow
  if (top + INSPECTOR_HEIGHT > window.innerHeight - PADDING) {
      // Not enough space below, try positioning ABOVE the cursor
      // We aim for the bottom of the inspector to be near the click Y
      const flipTop = inspectorPosition ? inspectorPosition.y - INSPECTOR_HEIGHT + 50 : top;
      
      // But don't go off the top of the screen
      top = Math.max(PADDING, flipTop);
  } else {
       // Normal case: ensure we don't start off-screen top
       top = Math.max(PADDING, top);
  }

  const style: React.CSSProperties = inspectorPosition ? {
      left,
      top,
      // Dynamic max-height: fills from 'top' to bottom of screen (minus padding)
      maxHeight: `calc(100vh - ${top + PADDING}px)` 
  } : {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      maxHeight: "90vh"
  };

  return createPortal(
    <div 
        ref={inspectorRef}
        className={cn(
            "fixed z-[200] hidden xl:block", 
            "w-[360px]", 
            "animate-in fade-in duration-75 pointer-events-auto"
        )}
        style={style}
    >
        <div className="w-full h-full bg-[#0f172a] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col overflow-y-auto">
            <InspectorContent 
                item={inspectedCard} 
                onClose={closeInspector}
            />
        </div>
    </div>,
    document.body
  );
}
