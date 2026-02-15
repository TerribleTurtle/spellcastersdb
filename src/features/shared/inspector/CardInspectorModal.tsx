import { createPortal } from "react-dom";
import { useDeckStore } from "@/store/index";
import { CardInspector } from "./CardInspector";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function CardInspectorModal() {
  const { inspectorOpen, inspectedCard, closeInspector } = useDeckStore();
  // Check for desktop environment to disable modal (InspectorPanel is used instead)
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    const checkDesktop = () => {
        // Use 1280px as hard cutoff for 'xl'
        const isWide = window.innerWidth >= 1280;
        setIsDesktop(isWide);
    };

    // Check immediately
    checkDesktop();
    
    // Check with matchMedia for listener
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    
    return () => {
        mediaQuery.removeEventListener("change", handler);
    };
  }, []);
  
  // Disable modal functionality completely on desktop
  const shouldRender = inspectorOpen && !isDesktop;

  // Initialize focus trap - only if should render
  const containerRef = useFocusTrap(shouldRender, closeInspector);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div 
        className={cn(
            "fixed inset-0 z-50 flex flex-col justify-end isolate pointer-events-none xl:hidden card-inspector-modal-container",
            isDesktop && "hidden!" // Force hidden with high specificity
        )}
        style={{ display: isDesktop ? 'none' : undefined }}
    >
        {/* Backdrop - lighter and clickable */}
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none animate-in fade-in duration-200 pointer-events-auto"
            onClick={closeInspector}
        />
        <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1280px) {
                .card-inspector-modal-container {
                    display: none !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
            }
        `}} />

        {/* Side Panel - Slides in from right */}
        <div 
            ref={containerRef}
            aria-modal="true"
            role="dialog"
            className={cn(
                "relative h-[85vh] w-full bg-gray-950 border-t border-white/10 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col focus:outline-none pointer-events-auto rounded-t-xl",
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
