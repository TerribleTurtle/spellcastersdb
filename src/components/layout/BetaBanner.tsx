"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

const BANNER_DISMISSED_KEY = "sc_beta_banner_dismissed";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Legacy cleanup: Remove the permanent dismissal key so users get the new session behavior
    if (typeof window !== "undefined") {
      localStorage.removeItem(BANNER_DISMISSED_KEY);
    }
    
    const isDismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (!isDismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    }
    setIsHydrated(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  // Prevent flash or mismatch during hydration
  if (!isHydrated || !isVisible) return null;

  return (
    <>
    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 bg-linear-to-r from-yellow-900/40 to-orange-900/40 backdrop-blur-md rounded-full border border-yellow-500/20 px-3 py-1.5 shadow-sm hover:bg-yellow-900/60 transition-colors">
        <AlertTriangle className="text-yellow-400 shrink-0" size={14} />
        <span className="text-[10px] font-bold text-yellow-100 whitespace-nowrap hidden sm:inline">Beta Data: Not Final</span>
        <span className="text-[10px] font-bold text-yellow-100 whitespace-nowrap sm:hidden">Beta</span>
        <button
          onClick={handleDismiss}
          className="text-yellow-400/80 hover:text-yellow-100 transition-colors ml-1 p-0.5 rounded-full hover:bg-white/5"
          aria-label="Dismiss banner"
        >
          <X size={12} />
        </button>
      </div>
    </div>
    </>
  );
}
