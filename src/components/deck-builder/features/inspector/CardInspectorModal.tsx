import { createPortal } from "react-dom";
import { useDeckStore } from "@/store/index";
import { CardInspector } from "./CardInspector";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function CardInspectorModal() {
  const { inspectorOpen, inspectedCard, closeInspector } = useDeckStore();
  const [mounted, setMounted] = useState(false);
  
  // Initialize focus trap
  const containerRef = useFocusTrap(inspectorOpen, closeInspector);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Close on Escape key - Handled by useFocusTrap now, but keeping as backup/for unmounted state if needed
    // Actually useFocusTrap handles escape if we pass onClose.
  }, []);

  if (!mounted || !inspectorOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end isolate pointer-events-none md:hidden">
        {/* Backdrop - lighter and clickable */}
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none animate-in fade-in duration-200 pointer-events-auto"
            onClick={closeInspector}
        />

        {/* Side Panel - Slides in from right */}
        <div 
            ref={containerRef}
            aria-modal="true"
            role="dialog"
            className={cn(
                "relative h-[85vh] w-full bg-gray-950 border-t border-white/10 shadow-2xl overflow-hidden flex flex-col focus:outline-none pointer-events-auto rounded-t-xl",
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
                "animate-in slide-in-from-bottom duration-300 ease-out"
            )}
            onClick={(e) => e.stopPropagation()}
        >
             <CardInspector 
                item={inspectedCard} 
                onClose={closeInspector}
            />
        </div>
    </div>,
    document.body
  );
}
